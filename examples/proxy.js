const { createClient, Server, createServer, defaultVersion } = require('..')

var ArgumentParser = require('argparse').ArgumentParser
var parser = new ArgumentParser({
  version: '1.4.1',
  addHelp: true,
  description: 'Simple proxy'
})
parser.addArgument([ '-u', '--username' ], { required: true })
parser.addArgument([ '-p', '--password' ], { required: true })

const { username, password } = parser.parseArgs()

const host = '127.0.0.1'
const ipOfficial = '34.251.172.139' // Official dofus retro
const ipPrivate = '190.115.26.126' // Amakna server
const externalHost = ipPrivate
const port = 34555 // 887

async function createProxy (host, port, externalHost, version) {
  const server = await createServer(host, port, externalHost, version)
  server.on('connection', async clientServer => {
    console.log('new client', clientServer.socket.address())

    const client = await createClient({
      host: host,
      username,
      password,
      version: version
    })

    client.socket.on('data', data => clientServer.socket.write(data))

    // await client.selectCharacter(character)

    clientServer.socket.on('data', data => client.socket.write(data))
    console.log('Has joined the game')
  })
  return server
}

const proxy = createProxy(host, port, externalHost, defaultVersion)
