const Client = require('./client')

const hashPassword = require('../utils/hash')

const { once } = require('once-promise')

// Connect to battlenet
async function createClient (host, port, version) {
  const client = new Client(version)
  client.on('HELLO_CONNECTION', ({ key }) => {
    this.key = key
    
    client.socket.write(Buffer.from('312e34302e310a00', 'hex'))
    client.socket.write('sonlight' + '\n' + hashPassword('bzkl12', this.key) + '\n')
    //client.socket.write(Buffer.from('41660a00', 'hex'))
    client.write('ACCOUNT_AUTHENTICATION', {})
  })
  client.on('connect', () => {
  })

  client.on('ACCOUNT_PSEUDO', () => {
    client.write('ACCOUNT_SERVER_LIST', {})
  })

  client.on('ACCOUNT_SERVER_LIST', () => {
  })
  client.on('ACCOUNT_TICKET', () => {
  })

  client.connect(host, port)

  return
}

module.exports = createClient