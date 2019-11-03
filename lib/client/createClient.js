const Client = require('./client')

const hashPassword = require('../utils/hash')
const { decryptIp, decryptPort } = require('../utils/utils')

const { once } = require('once-promise')

// Connect to battlenet
async function createClient (host, port, account, password, version) {
  const client = new Client(version)
  client.on('HELLO_CONNECTION', ({ key }) => {
    this.key = key
    client.socket.write(Buffer.from('312e34302e310a00', 'hex'))
    client.socket.write(account + '\n' + hashPassword(password, this.key) + '\n')
    client.write('ACCOUNT_AUTHENTICATION', {})
  })
  client.on('connect', () => {
  })

  client.on('ACCOUNT_PSEUDO', () => {
    client.write('ACCOUNT_SERVER_LIST', {})
  })

  client.on('ACCOUNT_SERVER_LIST', (data) => {
    client.write('ACCOUNT_ACCESS_SERVER', {
      serverId: data.servers[0] // hard code login to first serverId :)
    })
  })
  client.on('ACCOUNT_TICKET', () => {
  })
  client.on('ACCOUNT_SERVER_ENCRYPTED_HOST', ({ ip, port, key }) => {
    console.log(`Ready to connect to ${decryptIp(ip)}:${decryptPort(port)}`)
    // TODO: connect to new PORT with new client ...
    // this step is to join the server u know
    // HELLO_GAME
    // ...
  })

  client.connect(host, port)
}

module.exports = createClient
