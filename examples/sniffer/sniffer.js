const { defaultVersion, protocol, dofus, Splitter } = require('../..')

if (process.argv.length !== 4) {
  console.log('Usage : node sniffer.js <networkInterface> <dev>')
  process.exit(1)
}
// If the version correspond to a supported version else use default
const version = defaultVersion

const networkInterface = process.argv[2]

const dev = process.argv[3]

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

function display (data, isToServer) {
  const s = isToServer ? 'toServer : ' : 'toClient : '
  console.log(`~`.repeat(10))
  try {
    const parsed = isToServer ? toServer.parsePacketBuffer('packet', data).data : toClient.parsePacketBuffer('packet', data).data
    console.info(s, JSON.stringify(parsed))
  } catch (error) {
    console.log(error.message)
  }
  console.log(`raw ${s} ${data.toString('ascii')}`)
  console.log(`~`.repeat(10), '\n')
}

splitterToServer.on('data', data => {
  display(data, true)
})
splitterToClient.on('data', data => {
  display(data, false)
})

const ipOfficial = '34.251.172.139' // Official dofus retro
const ipPrivate = '190.115.26.126' // Amakna server
const ip = dev ? ipPrivate : ipOfficial

pcapSession.on('packet', function (rawPacket) {
  const packet = pcap.decode.packet(rawPacket)
  let data = packet.payload.payload.payload.data
  if (!data) return
  if (packet.payload.payload.saddr.addr.join('.') === ip) { // To client
    if ((data[0] === 0x3c && data[1] === 0x3f) || data[0] === 0xc3 || data[0] === 0xd1) { // 3c && 3f is trash ad begin login, c3 trash media priv server?
      return
    }
    splitterToClient.write(data)
    tcpTracker.track_packet(packet)
  } else if (packet.payload.payload.daddr.addr.join('.') === ip) { // To server
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
