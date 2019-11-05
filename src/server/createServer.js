const Server = require('./server')

// Connect to battlenet
async function createServer (host, port, externalHost, version) {
  return new Promise((resolve, reject) => {
    const server = new Server(version)
    server.on('connection', client => {
      console.log('new client', client.socket.address())
    })
    server.listen(host, port).then(() => resolve(server))
  })
}

module.exports = createServer
