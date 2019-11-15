const { onMovement,
  onTurn,
  onExchangeCreate,
  onExchangeShop,
  onAccountStats,
  onAction,
  onAccountSelectCharacter,
  onGameData } = require('./finalPacketParser')

const HASH = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
  's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1',
  '2', '3', '4', '5', '6', '7', '8', '9', '-', '_']

function hashPassword (password, key) {
  let str = '#1'
  for (let i = 0; i < password.length; i++) {
    let a = Math.floor(password.charCodeAt(i) / 16)
    let b = password.charCodeAt(i) % 16
    str = str + HASH[(a + key.charCodeAt(i)) % HASH.length] + HASH[(b + key.charCodeAt(i)) % HASH.length]
  }
  return str.toString()// .slice(0, -2) // ?? seems to be two 0 non-needed
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
  // if (chars.length !== 3) { throw new Error('Port must be encrypted in 3 chars') }
  let port = 0
  for (let i = 0; i < 2; i++) {
    port += Number(Math.pow(64, 2 - i) * HASH.findIndex(e => e === chars[i]))
  }
  port += HASH.findIndex(e => e === chars[2])
  return port
}

function logger (data, isToServer, proto) {
  const s = isToServer ? 'toServer : ' : 'toClient : '
  let parsed
  console.log(`~`.repeat(10))
  parsed = proto.parsePacketBuffer('packet', data).data
  console.log(s, JSON.stringify(parsed))
  switch (parsed.name) { // Btw be care its both toclient & toserver so if calling parsing function can break
    case 'ACCOUNT_SERVER_ENCRYPTED_HOST':
      console.log(`Ready to connect to ${parsed.params.ip}:${parsed.params.port}`)
      break
    case 'SPELL_LIST_CHANGE':
      console.log(`My spells ${parsed.params.data.filter(e => e !== '').map(e => `skill n°${e[0]} - level: ${e[1]} - ?: ${e[2]}\n`)}`)
      break
    case 'GAME_MOVEMENT':
      console.log(`Game movement: ${JSON.stringify(onMovement(parsed.params.data, false))}`)
      break
    case 'GAME_TURN':
      console.log(`Game turn: ${JSON.stringify(onTurn(parsed.params.data))}`)
      break
    case 'EXCHANGE_CREATE':
      console.log(`Exchange create: ${JSON.stringify(onExchangeCreate(parsed.params.data))}`)
      break
    case 'EXCHANGE_SHOP_TYPE':
      if (!isToServer) { // its for toclient
        console.log(`Exchange shop: ${JSON.stringify(onExchangeShop(parsed.params.data))}`)
      }
      break
    case 'ACCOUNT_STATS':
      console.log(`ACCOUNT_STATS: ${JSON.stringify(onAccountStats(parsed.params.data))}`)
      break
    case 'GAME_ACTION':
      if (!isToServer) { // its for toclient
        console.log(`GAME_ACTION: ${JSON.stringify(onAction(parsed.params.data))}`)
      }
      break
    case 'ACCOUNT_SELECT_CHARACTER':
      console.log(`ACCOUNT_SELECT_CHARACTER: ${JSON.stringify(onAccountSelectCharacter(parsed.params.data))}`)
      break
    case 'GAME_DATA':
      console.log(`${onGameData(parsed.params.data)}`)
      break
  }
  console.log(`raw ${s} ${data.toString('ascii')}`)
  console.log(`~`.repeat(10), '\n')
  return parsed
}

/*
function getRandomNetworkKey () {
  let size = Math.floor(Math.round(Math.random() * 20) + 10)
  let s = []
  for (let i = 0; i < size; i++) {
    s.push(HASH[(Math.floor(Math.random() * HASH.length))])
  }
  let check = checksum(s.join('')) + s.join('')
  return check + checksum(check)
}
*/

function setIntervalAndExecute (fn, t, stopAfter, failedCallback) {
  fn()
  let attempt = 1
  return (setInterval(() => {
    ++attempt
    if (attempt > stopAfter) {
      failedCallback()
      console.log(`Failed to execute after ${attempt} attempt, aborting`)
    }
    fn()
  }, t))
}

module.exports = { hashPassword,
  decryptIp,
  decryptPort,
  logger,
  setIntervalAndExecute,
  HASH }
