const Server = require('./server')

// Connect to battlenet
async function createServer (host, port, externalHost, version) {
  const server = new Server(version)
  server.listen(host, port)
  server.on('connection', client => {
    console.log('new client', client.socket.address())
  })
  return server
}

module.exports = createServer
