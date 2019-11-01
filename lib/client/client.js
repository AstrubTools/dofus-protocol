const net = require('net')

const ProtoDef = require('protodef').ProtoDef

const EventEmitter = require('events').EventEmitter
const dofus = require('../utils/datatypes/dofus')
const splitPackets = require('../utils/utils')
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
    this.socket.on('data', (data) => {
      if (data[0] === 0x3c && data[1] === 0x3f) {
        console.log('Ignore trash')
        return
      }
      const proto = this.isServer ? this.protoToServer : this.protoToClient
      splitPackets(data.toString('hex')).forEach(packet => {
        try {
          console.log('received that hex', packet)

          const parsed = proto.parsePacketBuffer('packet', Buffer.from(packet, 'hex')).data

          const { name, params } = parsed
          console.info('toClient : ', name, JSON.stringify(parsed))

          this.emit(name, params)
          this.emit('packet', { name, params })
        } catch (err) {
          console.log(err.message, Buffer.from(packet, 'hex'))
        }
      })
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

    // console.log('sending that hex ', buffer)
    this.socket.write(buffer)
  }
}

module.exports = Client
