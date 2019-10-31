const { supportedVersions, defaultVersion } = require('../..')

if (process.argv.length !== 4) {
  console.log('Usage : node sniffer.js <networkInterface> <version>')
  process.exit(1)
}
// If the version correspond to a supported version else use default
const version = supportedVersions.find(v => v === process.argv[3]) ? process.argv[3] : defaultVersion

const networkInterface = process.argv[2]

const pcap = require('pcap')

const tcpTracker = new pcap.TCPTracker()

const pcapSession = pcap.createSession(networkInterface, 'ip proto \\tcp')
const FullPacketParser = require('protodef').Parser
const ProtoDef = require('protodef').ProtoDef

const {
  protocol
} = require('../..')

const toServer = new ProtoDef(false)
toServer.addProtocol(protocol[version].sid, ['toServer'])

const toClient = new ProtoDef(false)
toClient.addProtocol(protocol[version].sid, ['toClient'])


// const IP = "34.251.172.139" // Official dofus retro
const IP = "190.115.26.126" // Amakna server

const PORT = 443
pcapSession.on('packet', function (rawPacket) {
  const packet = pcap.decode.packet(rawPacket)
  if (packet.payload.payload.saddr.addr.join(".") === IP) { // To client
    let data = packet.payload.payload.payload.data
    try {
      const { name, params } = toClient.parsePacketBuffer('packet', data).data
      console.log(name, JSON.stringify(params))
    } catch (error) {
      if(data !== null) console.log('raw', data.toString('hex'))
      console.log(error.message)
    }
    tcpTracker.track_packet(packet)
  } else if (packet.payload.payload.daddr.addr.join(".") === IP) { // To server
    let data = packet.payload.payload.payload.data
    try {
      const { name, params } = toServer.parsePacketBuffer('packet', data).data
      console.log(name, JSON.stringify(params))
    } catch (error) {
      if(data !== null) console.log('raw', data.toString('hex'))
      console.log(error.message)
    }
    tcpTracker.track_packet(packet)
  }
})
tcpTracker.on('session', function (session) {
  console.log("Start of session between " + session.src_name + " and " + session.dst_name)
  
  session.on('end', function (session) {
    console.log("End of TCP session between " + session.src_name + " and " + session.dst_name)
  });
});