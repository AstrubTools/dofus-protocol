const Client = require('./client')

const hashPassword = require('../utils/hash')

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

  client.on('ACCOUNT_SERVER_LIST', () => {
    /*
    client.write('ACCOUNT_ACCESS_SERVER', {
      serverId: 12603
    })
    */
  })
  client.on('ACCOUNT_TICKET', () => {
  })
  client.on('ACCOUNT_SERVER_ENCRYPTED_HOST', ({ ip, port, key }) => {
    console.log(`Host : ${ip[0] + '.' + ip[1] + '.' + ip[2] + '.' + ip[3]}:${port}\nkey: ${key}`)
    // TODO: connect to new PORT with new client ...
    // this step is to join the server u know
    // HELLO_GAME
    // ...
  })

  client.connect(host, port)
}

module.exports = createClient
