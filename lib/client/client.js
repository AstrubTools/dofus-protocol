const net = require('net')

const ProtoDef = require('protodef').ProtoDef

const EventEmitter = require('events').EventEmitter
const bitfieldLE = require('../utils/bitfieldLE')
class Client extends EventEmitter {
  constructor (version, isServer = false) {
    super()
    this.isServer = isServer
    this.packetCounts = 0
    const data = require(`../../data/${version}/data`)
    this.protoToServer = new ProtoDef(false)
    this.protoToServer.addProtocol(data, ['toServer'])
    // this.protoToServer.addTypes(bitfieldLE)

    this.protoToClient = new ProtoDef(false)
    this.protoToClient.addProtocol(data, ['toClient'])
    // this.protoToClient.addTypes(bitfieldLE)
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
      this.packetCounts++
      try {
        console.log('received that hex', data.toString('hex'))
        
        /*
        if (this.packetCounts < 2) {
          console.log('Connection initialization n°', this.packetCounts)
          // this.emit('init_connection')
          return
        }
        */
        // TODO: compare client & sniffer
        const proto = this.isServer ? this.protoToServer : this.protoToClient
        const parsed = proto.parsePacketBuffer('packet', data).data

        const { name, params } = parsed
        console.info('toClient : ', name, JSON.stringify(parsed))

        this.emit(name, params)
        this.emit('packet', { name, params })
      } catch (err) {
        console.log(err.message)
      }
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
