const net = require('net')

const ProtoDef = require('protodef').ProtoDef

const EventEmitter = require('events').EventEmitter
const dofus = require('../utils/datatypes/dofus')
const split = require('../transforms/framing')
const FullPacketParser = require('protodef').Parser
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
    this.toClientParser = new FullPacketParser(this.protoToClient, 'packet')
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
    this.splitter = split
    this.splitter.on('data', data => {
      this.toClientParser.write(data)
      console.info('toClient raw : ', JSON.stringify(data))
    })
    this.toClientParser.on('data', ({ data, buffer }) => {
      let { name, params } = data

      console.info('toClient : ', JSON.stringify(data))

      this.emit(name, params)
      this.emit('packet', { name, params })
    })
    this.toClientParser.on('error', err => console.log('toClient error : ', err.message))

    this.socket.on('data', (data) => {
      if (data[0] === 0x3c && data[1] === 0x3f) {
        console.log('Ignore trash')
        return
      }
      this.splitter.write(data)
    })
    this.socket.on('end', () => {
      console.log('disconnected from server')
    })
  }

  write (packetName, params) {
    const proto = this.isServer ? this.protoToClient : this.protoToServer
    const buffer = proto.createPacketBuffer('packet', {
      name: packetName,
      params,
      end: 0x0A00 // TODO:CHECKIT
    })

    console.info('toServer : ', packetName, JSON.stringify(params))
    this.socket.write(buffer)
  }
}

module.exports = Client
