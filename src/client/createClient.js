const Client = require('./client')

const { hashPassword, setIntervalAndExecute } = require('../utils/utils')

function createClient ({ host, port, username, password, version, delay }) {
  const client = new Client(version)
  client.delay = delay
  client.username = username
  client.password = password
  // TODO: maybe use once instead for these login stuff

  // TODO: implement reject for every functions (failed to connect, etc ...)
  client.loginToAccount = () => {
    return new Promise((resolve, reject) => {
      client.on('HELLO_CONNECTION', ({ key }) => {
        // client.socket.write(Buffer.from('312e34302e310a00', 'hex'))
        client.socket.write(`${version}.0e\n\0`)
        // '1.30.0e'
        client.socket.write(client.username + '\n' + hashPassword(client.password, key) + '\n')
        client.write('ACCOUNT_AUTHENTICATION', {})
      })
      client.on('ACCOUNT_PSEUDO', () => {
        client.write('ACCOUNT_SERVER_LIST', {})
      })
      client.on('ACCOUNT_HOST', data => {
        client.servers = data.servers
      })
      client.on('ACCOUNT_SERVER_LIST', data => {
        resolve()
      })
      client.connect(host, port)
    })
  }

  client.loginToServer = (server) => {
    return new Promise((resolve, reject) => {
      client.server = server
      client.on('ACCOUNT_SERVER_ENCRYPTED_HOST', ({ unk, ip, port, ticket }) => {
        client.ticket = ticket
        client.gameHost = ip
        client.gamePort = port
        resolve()
      })
      let foundServer = client.servers.find(s => s.serverId === server)
      // If we the server we want to join exist and is online, request access
      if (foundServer && foundServer.state === 1) {
        console.log(foundServer.serverId)
        client.write('ACCOUNT_ACCESS_SERVER', {
          serverId: foundServer.serverId
        })
      } else {
        reject(Error(`Couldn't find server ${server}`))
      }
    })
  }

  client.pickCharacter = (charName) => {
    return new Promise((resolve, reject) => {
      client.on('HELLO_GAME', () => {
        client.write('ACCOUNT_TICKET', {
          ticket: client.ticket
        })
      })
      client.on('ACCOUNT_TICKET', () => {
        client.write('ACCOUNT_KEY', {
          key: '0'
        })
        client.write('ACCOUNT_REGION_VERSION', {
          ticket: ''
        })
      })
      client.on('ACCOUNT_REGION_VERSION', () => {
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
      })
      client.on('ACCOUNT_LIST_CHARACTER', (data) => {
        client.character = data.data.find(e => e.find(r => r === charName))
        if (!client.character) throw new Error('Unable to find this character !')
        client.write('ACCOUNT_SET_CHARACTER', {
          characterId: client.character[0] // Can we do it better (named params ...) ? [0] is char id
        })
        client.write('ACCOUNT_AUTHENTICATION', {
        })
      })
      client.on('ACCOUNT_SELECT_CHARACTER', (data) => {
        client.write('GAME_CREATE', {
          type: '1'
        })
      })
      client.on('GAME_CREATE', (data) => {
        if (data.unk.find(e => e === '1')) {
          // This is sort of ping, maybe should investigate the params
          client.on('BASIC_CONFIRM', () => {
          })
          // Server send this basic unk 1, client answer unk2, then server confirm
          client.on('BASIC_UNKNOWN1', () => {
            client.write('BASIC_UNKNOWN2', {
              data: ['116', '6', '50']
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
      client.socket.end() // Closing last connection (when switching between servers)
      client.connect(client.gameHost, client.gamePort, true) // Game
    })
  }
  return client
}

module.exports = createClient
