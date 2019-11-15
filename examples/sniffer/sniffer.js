const { defaultVersion, protocol, dofus, Splitter, logger } = require('../..')

if (process.argv.length !== 3) {
  console.log('Usage : node sniffer.js <networkInterface>')
  process.exit(1)
}
// If the version correspond to a supported version else use default
const version = defaultVersion

const networkInterface = process.argv[2]

const pcap = require('pcap')

const tcpTracker = new pcap.TCPTracker()

const pcapSession = pcap.createSession(networkInterface, 'ip proto \\tcp')
const ProtoDef = require('protodef').ProtoDef

const toServer = new ProtoDef(false)
toServer.addTypes(dofus)
toServer.addProtocol(protocol[version].data, ['toServer'])
const splitterToServer = new Splitter(/\r?\n?\0/)

const toClient = new ProtoDef(false)
toClient.addTypes(dofus)
toClient.addProtocol(protocol[version].data, ['toClient'])
const splitterToClient = new Splitter(/\r?\0/)

splitterToServer.on('data', data => {
  try {
    logger(data, true, toServer)
  } catch (error) {
    console.log(error.message, 'toServer : ', data.toString())
  }
})
splitterToClient.on('data', data => {
  try {
    let parsed = logger(data, false, toClient)
    // Now sniffing game server
    if (parsed.name === 'ACCOUNT_SERVER_ENCRYPTED_HOST') {
      gameIp = parsed.params.ip
    }
  } catch (error) {
    console.log(error.message, 'toClient : ', data.toString())
  }
})
let gameIp
const ipOfficial = '34.251.172.139' // Official dofus retro
const ipPrivate = '190.115.26.126' // Amakna server
const yoloip = '52.208.25.222'
let ip = ipPrivate
// 99106584
pcapSession.on('packet', function (rawPacket) {
  const packet = pcap.decode.packet(rawPacket)
  let data = packet.payload.payload.payload.data
  if (!data) return
  if (packet.payload.payload.saddr.addr.join('.') === ip || packet.payload.payload.saddr.addr.join('.') === gameIp) { // To client
    splitterToClient.write(data)
    tcpTracker.track_packet(packet)
  } else if (packet.payload.payload.daddr.addr.join('.') === ip || packet.payload.payload.daddr.addr.join('.') === gameIp) { // To server
    splitterToServer.write(data)
    tcpTracker.track_packet(packet)
  }
})
tcpTracker.on('session', function (session) {
  console.log('Start of session between ' + session.src_name + ' and ' + session.dst_name)

  session.on('end', function (session) {
    console.log('End of TCP session between ' + session.src_name + ' and ' + session.dst_name)
  })
})
