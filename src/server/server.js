const net = require('net')

const EventEmitter = require('events').EventEmitter
const Client = require('../client/client')
class Server extends EventEmitter {
  listen (host, port, version) {
    return new Promise((resolve, reject) => {
      this.host = host
      this.port = port
      this.socketServer = net.createServer()

      this.socketServer.on('connection', socket => {
        const client = new Client(version, true)

        client.setSocket(socket)

        this.emit('connection', client)
      })

      this.socketServer.on('listening', () => {
        console.log('server listening')
        resolve()
      })

      this.socketServer.listen(this.port, this.host)
    })
  }
}

module.exports = Server
