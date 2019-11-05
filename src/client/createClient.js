const Client = require('./client')

const hashPassword = require('../utils/hash')
const { getRandomNetworkKey, setIntervalAndExecute } = require('../utils/utils')

const { once } = require('once-promise')

// Connect to battlenet
async function createClient (host, port, account, password, version, delay) {
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
        // console.log(data)

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
        console.log('~'.repeat(10))
        console.log('IN GAME READY TO BOT')
        console.log('~'.repeat(10))
        clearInterval(client.retry)
        resolve()
      })
      await client.socket.end() // Closing last connection (when switching between servers)
      await client.connect(client.gameHost, client.gamePort, true) // Game
    })
  }
  return client
}

module.exports = createClient
