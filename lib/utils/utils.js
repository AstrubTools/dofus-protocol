const ZKARRAY = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
  's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1',
  '2', '3', '4', '5', '6', '7', '8', '9', '-', '_']

function ascii_to_hexa (ascii) {
  return parseInt(ascii.toString(16).split('').map(e => Number(e.charCodeAt(0))).join(''), 16)
}

function ascii_to_int (ascii) {
  return parseInt(ascii.toString().split('').map(e => Number(e.charCodeAt(0))).join(''), 10)
}

function decryptIp (ipCrypt) {
  let ip = []
  let d1, d2
  for (let i = 0; i < 8; i++) {
    d1 = ipCrypt.charCodeAt(i) - 48
    i++
    d2 = ipCrypt.charCodeAt(i) - 48

    ip.push((d1 & 15) << 4 | d2 & 15)
  }

  return ip.join('.')
}

function decryptPort (chars) {
  if (chars.length !== 3) { throw new Error('Port must be encrypted in 3 chars') }
  let port = 0
  for (let i = 0; i < 2; i++) {
    port += Number(Math.pow(64, 2 - i) * ZKARRAY.findIndex(e => e === chars[i]))
  }
  port += ZKARRAY.findIndex(e => e === chars[2])
  return port
}

function logger (data, isToServer, proto) {
  const s = isToServer ? 'toServer : ' : 'toClient : '
  let parsed
  console.log(`~`.repeat(10))
  try {
    parsed = proto.parsePacketBuffer('packet', data).data
    console.log(s, JSON.stringify(parsed))
    if (parsed.name === 'ACCOUNT_SERVER_ENCRYPTED_HOST') {
      console.log(`Ready to connect to ${decryptIp(parsed.params.ip)}:${decryptPort(parsed.params.port)}`)
    }
  } catch (error) {
    console.log(error.message)
  }
  console.log(`raw ${s} ${data.toString('ascii')}`)
  console.log(`~`.repeat(10), '\n')
  return parsed
}

module.exports = { ascii_to_hexa, ascii_to_int, decryptIp, decryptPort, logger }
