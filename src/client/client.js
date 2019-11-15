const net = require('net')

const ProtoDef = require('protodef').ProtoDef

const EventEmitter = require('events').EventEmitter
const dofus = require('../utils/datatypes/dofus')
const Splitter = require('../transforms/framing')
const { logger } = require('../utils/utils')
class Client extends EventEmitter {
  constructor (version, isServer = false) {
    super()
    this.version = version
    this.isServer = isServer
    const data = require(`../../data/${version}/data`)
    this.protoToServer = new ProtoDef(false)
    this.protoToServer.addProtocol(data, ['toServer'])
    this.protoToServer.addTypes(dofus)

    this.protoToClient = new ProtoDef(false)
    this.protoToClient.addProtocol(data, ['toClient'])
    this.protoToClient.addTypes(dofus)
    this.splitterToClient = new Splitter(/\r?\0/)
  }

  connect (host, port, switching) {
    this.host = host
    this.port = port
    console.log(`Attempting to connect to ${host}:${port} ...`)
    this.setSocket(net.createConnection({ port: this.port, host: this.host }, () => {
      console.log(`Connected to ${host}:${port} !`)
    }), switching)
  }

  disconnect () {
    this.socket.end()
  }

  setSocket (socket, switching) {
    this.socket = socket
    if (!switching) { // If switching server, no need to re-set the splitter
      this.splitterToClient.on('data', data => {
        try {
          let parsed = logger(data, false, this.protoToClient)
          this.emit(parsed.name, parsed.params)
          this.emit('packet', parsed)
        } catch (error) {
          console.log(error.message, 'toClient : ', data.toString())
        }
      })
    }

    this.socket.on('data', (data) => {
      if (!data) {
        return
      }
      this.splitterToClient.write(data)
    })
    this.socket.on('end', () => {
      console.log('disconnected from server')
    })
  }

  write (packetName, params) {
    const proto = this.isServer ? this.protoToClient : this.protoToServer
    let data = proto.createPacketBuffer('packet', {
      name: packetName,
      params
    })
    try {
      logger(data, true, proto)
    } catch (error) {
      console.log(error.message, 'toServer : ', data.toString())
    }
    setTimeout(() => {
      this.socket.write(data)
    }, this.delay) // Delay between packets, TODO: issue with async ? ...
  }
}

module.exports = Client
