const Client = require('./client')

const hashPassword = require('../utils/hash')
const { getRandomNetworkKey, setIntervalAndExecute } = require('../utils/utils')
const { onMovement, OnExchangeShop, onAccountStats } = require('../utils/packetParser')

// Connect to battlenet
async function createClient ({ host, port, account, password, version, delay }) {
  const client = new Client(version)
  client.delay = delay
  client.account = account
  client.password = password
  // TODO: maybe use once instead for these login stuff

  // TODO: implement reject for every functions (failed to connect, etc ...)
  client.loginToAccount = async () => {
    return new Promise(async (resolve, reject) => {
      client.on('HELLO_CONNECTION', ({ key }) => {
        client.socket.write(Buffer.from('312e34302e310a00', 'hex'))
        client.socket.write(client.account + '\n' + hashPassword(client.password, key) + '\n')
        client.write('ACCOUNT_AUTHENTICATION', {})
      })
      client.on('ACCOUNT_PSEUDO', () => {
        client.write('ACCOUNT_SERVER_LIST', {})
      })
      client.on('ACCOUNT_HOST', (data) => {
        client.servers = data.servers
        resolve()
      })
      await client.connect(host, port) // 'Lobby'
      client.emit('clientReady', client)
    })
  }

  client.loginToServer = async () => { // TODO: Give a param etc
    return new Promise(async (resolve, reject) => {
      client.on('ACCOUNT_SERVER_ENCRYPTED_HOST', async ({ unk, ip, port, ticket }) => {
        client.ticket = ticket
        client.gameHost = ip
        client.gamePort = port
        resolve()
      })
      client.write('ACCOUNT_ACCESS_SERVER', {
        serverId: client.servers[0].serverId.toString() // Joining the first server
      })
    })
  }

  client.pickCharacter = async (charName) => {
    return new Promise(async (resolve, reject) => {
      client.on('HELLO_GAME', () => {
        client.write('ACCOUNT_TICKET', {
          ticket: client.ticket
        })
      })
      client.on('ACCOUNT_TICKET', () => {
        client.retry = setIntervalAndExecute(() => { // TODO: should stop retrying at some point thought :)
          client.write('ACCOUNT_KEY', {
            key: '0'
          })
          client.write('ACCOUNT_REGION_VERSION', {
            ticket: ''
          })
        }, 4000, 5, () => {
          clearInterval(client.retry)
          reject(new Error('Failed to get the region version'))
        })
      })
      client.on('ACCOUNT_REGION_VERSION', () => {
        clearInterval(client.retry)
        client.retry = setIntervalAndExecute(() => {
          client.write('ACCOUNT_GET_GIFTS', {
            language: 'en'
          })
          /*
          // Idk why sending this makes not receiving ACCOUNT_LIST_CHARACTER
          // Even though it's sent on the sniffer ?
          client.write('ACCOUNT_IDENTITY', {
            identity: 'CLEWjNIzm66uspXF' // getRandomNetworkKey() // 'CLEWjNIzm66uspXF'
          })
          */
          client.write('ACCOUNT_GET_CHARACTERS', {
          })
          client.write('ACCOUNT_AUTHENTICATION', {
          })
        }, 4000, 5, () => {
          clearInterval(client.retry)
          reject(new Error('Failed to get the characters list'))
        })
      })
      client.on('ACCOUNT_LIST_CHARACTER', (data) => {
        console.log('Got the list of characters !')
        clearInterval(client.retry)

        client.character = data.data.find(e => e.find(r => r === charName))
        if (!client.character) throw new Error('Unable to find this character !')
        client.retry = setIntervalAndExecute(() => {
          client.write('ACCOUNT_SET_CHARACTER', {
            characterId: client.character[0] // Can we do it better (named params ...) ? [0] is char id
          })
          client.write('ACCOUNT_AUTHENTICATION', {
          })
        }, 4000, 5, () => {
          clearInterval(client.retry)
          reject(new Error('Failed to set character'))
        })
      })
      client.on('ACCOUNT_SELECT_CHARACTER', (data) => {
        clearInterval(client.retry)
        client.retry = setIntervalAndExecute(() => {
          client.write('GAME_CREATE', {
            type: '1'
          })
        }, 4000, 5, () => {
          clearInterval(client.retry)
          reject(new Error('Failed to create game'))
        })
      })
      client.on('GAME_CREATE', (data) => {
        clearInterval(client.retry)
        if (data.unk.find(e => e === '1')) {
          // This is sort of ping, maybe should investigate the params
          client.on('BASIC_CONFIRM', () => {
            clearInterval(client.retryPing)
          })
          // Server send this basic unk 1, client answer unk2, then server confirm
          client.on('BASIC_UNKNOWN1', () => {
            client.retryPing = setIntervalAndExecute(() => {
              client.write('BASIC_UNKNOWN2', {
                data: ['116', '6', '50']
              })
            }, 4000, 5, () => {
              clearInterval(client.retryPing)
              reject(new Error('Failed to get a pong'))
            })
          })
          client.write('BASIC_UNKNOWN1', {})
          client.write('GAME_INFORMATION', {})
          resolve()
        } else {
          reject(Error('Server refused to create game'))
        }
      })

      client.on('GAME_MOVEMENT', (data) => {

      })
      await client.socket.end() // Closing last connection (when switching between servers)
      await client.connect(client.gameHost, client.gamePort, true) // Game
    })
  }

  client.listenToInformation = () => {
    client.data = {}
    client.data.shop = {}
    client.data.shop.itemsId = []
    client.data.shop.items = []
    client.data.isFighting = false
    client.on('SPELL', (data) => {
      client.data.skills = data.data.filter(e => e !== '').map(e => { return { skillId: e[0], skillLevel: e[1], unknown: e[2] } })
    })
    // https://github.com/louis030195/dofus-decompiled/blob/1c2f95587cb762b8e943d43df00f866e3cffd6b6/dofus130/scripts/__Packages/dofus/aks/Account.as#L735
    client.on('ACCOUNT_STATS', (data) => {
      if (data.data.length === 0) throw new Error('Account stats bug')
      client.data.accountData = onAccountStats(data.data)
    })
    client.on('GAME_MOVEMENT', (data) => {
      client.data.movementData = onMovement(data.data, client.data.isFighting) // TODO: Maybe should be reset on map changing instead ?
    })
    client.on('EXCHANGE_TYPE_SHOP', (data) => {
      let shopData = OnExchangeShop(data.data)
      let categoryIndex = client.data.shop.items.findIndex(e => e.category === shopData.category)
      if ('itemsId' in shopData) {
        // If we already have this category, update it, else push into the array
        if (categoryIndex !== -1) {
          client.data.shop.items[categoryIndex] = shopData
        } else {
          client.data.shop.items.push(shopData)
        }
      } else if ('items' in shopData) {
        // Shouldn't happen cuz we have to receive IDS before arriving to this step
        if (categoryIndex !== -1) { // Add items data under the item category
          client.data.shop.items[categoryIndex].data = shopData
        }
      }
    })
  }
  client.sendAction = (actionType, params) => {
    client.write('GAME_ACTION', {
    })
  }
  client.say = (target, message, extra) => {
    client.write('BASIC_MESSAGE', {
      target: target !== undefined ? target : '*', // Default channel (general)
      message: message,
      extra: extra !== undefined ? extra : '' // Idk what is this (seems empty)
    })
  }
  return client
}

module.exports = createClient
