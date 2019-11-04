const Client = require('./client')

const hashPassword = require('../utils/hash')
const { getRandomNetworkKey, setIntervalAndExecute } = require('../utils/utils')

const { once } = require('once-promise')

// Connect to battlenet
async function createClient (host, port, account, password, version, delay) {
  const client = new Client(version)
  client.delay = delay
  // TODO: maybe use once instead for these login stuff
  client.on('HELLO_CONNECTION', ({ key }) => {
    client.socket.write(Buffer.from('312e34302e310a00', 'hex'))
    client.socket.write(account + '\n' + hashPassword(password, key) + '\n')
    client.write('ACCOUNT_AUTHENTICATION', {})
  })
  client.on('connect', () => {
  })

  client.on('ACCOUNT_PSEUDO', () => {
    client.write('ACCOUNT_SERVER_LIST', {})
  })

  client.on('ACCOUNT_HOST', (data) => {
    client.write('ACCOUNT_ACCESS_SERVER', {
      serverId: data.servers[0].serverId.toString() // Joining the first server
    })
  })

  client.on('ACCOUNT_SERVER_ENCRYPTED_HOST', async ({ unk, ip, port, ticket }) => {
    this.ticket = ticket
    await client.socket.end() // Closing last connection (when switching between servers)
    await client.connect(ip, port, true) // Game
    // TODO: connect to new PORT with new client ...
    // this step is to join the server u know
    // HELLO_GAME
    // ...
  })
  client.on('HELLO_GAME', () => {
    client.write('ACCOUNT_TICKET', {
      ticket: this.ticket
    })
  })
  client.on('ACCOUNT_TICKET', () => {
    this.retry = setIntervalAndExecute(() => { // TODO: should stop retrying at some point thought :)
      client.write('ACCOUNT_KEY', {
        key: '0'
      })
      client.write('ACCOUNT_REGION_VERSION', {
        ticket: ''
      })
    }, 4000)
  })
  client.on('ACCOUNT_REGION_VERSION', () => {
    clearInterval(this.retry)
    this.retry = setIntervalAndExecute(() => {
      client.write('ACCOUNT_GET_GIFTS', {
        language: 'en'
      })
      client.write('ACCOUNT_IDENTITY', {
        identity: getRandomNetworkKey() // 'CLEWjNIzm66uspXF'
      })
      client.write('ACCOUNT_GET_CHARACTERS', {
      })
      client.write('ACCOUNT_AUTHENTICATION', {
      })
    }, 4000)
  })
  let c = 'Uwoba'
  client.on('ACCOUNT_LIST_CHARACTER', (data) => {
    console.log('Got the list of characters !')
    clearInterval(this.retry)
    console.log(data.find(e => e.find(r => r === c)))
    this.retry = setIntervalAndExecute(() => {
      client.write('ACCOUNT_SET_CHARACTER', {
        characterId: '84212'
      })
      client.write('ACCOUNT_AUTHENTICATION', {
      })
    }, 4000)
  })

  client.on('ACCOUNT_SELECT_CHARACTER', (data) => {
    console.log('IN GAME READY TO BOT')
    clearInterval(this.retry)
  })

  await client.connect(host, port) // 'Lobby'
}

module.exports = createClient
