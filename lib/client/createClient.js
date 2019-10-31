const Client = require('./client')

const hashPassword = require('../utils/hash')

const { once } = require('once-promise')

// Connect to battlenet
async function createClient (host, port, version) {
  const client = new Client(version)
  client.on('CONNECTION', ({ key }) => {
    this.key = key
    client.socket.write('1.40')
    client.socket.write('sonlight' + '\n' + hashPassword('bzkl12', this.key))
    client.write('AUTH', {})
  })
  client.on('connect', () => {
    // 'connect' listener
    console.log('connected to server!')
    
    // client.socket.write(Buffer.from('736f6e6c696768740a2331353435303634504d4e55345a393656584b490a00', 'hex')) // Initialises a normal logon conversation
    // 736f6e6c696768740a2331353435303634504d4e55345a393656584b490a00    

  })

  client.on('PSEUDO', () => {
    client.write('SERVERLIST', {})
  })

  client.on('SERVERLIST', () => {

  })

  client.connect(host, port)

  return
}

module.exports = createClient