const net = require('net')

const ProtoDef = require('protodef').ProtoDef

const EventEmitter = require('events').EventEmitter
const dofus = require('../utils/datatypes/dofus')
const Splitter = require('../transforms/framing')
const { logger } = require('../utils/utils')
class Client extends EventEmitter {
  constructor (version, isServer = false) {
    super()
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

  connect (host, port) {
    this.host = host
    this.port = port
    this.setSocket(net.createConnection({ port: this.port, host: this.host }, () => {
      this.emit('connect')
    }))
  }

  setSocket (socket) {
    this.socket = socket
    this.splitterToClient.on('data', data => {
      let { name, params } = logger(data, false, this.protoToClient)
      this.emit(name, params)
      this.emit('packet', { name, params })
    })

    this.socket.on('data', (data) => {
      if (!data || (data[0] === 0x3c && data[1] === 0x3f)) {
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
    const buffer = proto.createPacketBuffer('packet', {
      name: packetName,
      params
    })
    console.log(buffer)

    // logger(buffer, true, proto)
    buffer.write('\n\0')
    console.log(buffer)
    this.socket.write(buffer)
  }
}

module.exports = Client
