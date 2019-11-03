const { dofus, protocol, defaultVersion } = require('..')
const ProtoDef = require('protodef').ProtoDef
const p = new ProtoDef(false)
p.addTypes(dofus)
// (don"t look at failed params in the dump)
// toClient :  {"name":"ACCOUNT_HOST","params":{"number":"1","servers":[{"serverId":";","sep":"1","state":null,"population":0,"requireSubscription":"1"}]}}
// raw toClient <Buffer 41 48 31 3b 31 3b 31 30 3b 31>

let buf = Buffer.from('AH1;1;10;1')
console.log(`ASCII packet ${buf}`)

// Parsing serverId
console.log(`parsing serverId ${JSON.stringify(p.types.su8[0](Buffer.from([0x31]), 0))}`)

// Parsing population
console.log(`parsing population ${JSON.stringify(p.types.su16[0](Buffer.from([0x31, 0x30]), 0))}`)

console.log('')
// Buffer.from([0x41, 0x48, 0x31, 0x3b, 0x31, 0x3b, 0x31, 0x30, 0x3b, 0x31])
// Parsing the whole packet with split 2
console.log(`Parsing the whole packet with split 2
${JSON.stringify(p.read('AH1;1;10;1',
    2,
    ['stringSplit', [
      {
        'name': 'serverId',
        'type': 'su8'
      },
      {
        'name': 'state',
        'type': 'su8'
      },
      {
        'name': 'population',
        'type': 'su16'
      },
      {
        'name': 'requireSubscription',
        'type': 'su8'
      }
    ]], {}))}`)

// Writing the whole packet with split 2
let o = { s: '' }
console.log(`Writing the whole packet with split 2`)
p.write({
  'serverId': '1',
  'state': '1',
  'population': '10',
  'requireSubscription': '1'
}, o,
0,
['stringSplit', [
  {
    'name': 'serverId',
    'type': 'su8'
  },
  {
    'name': 'state',
    'type': 'su8'
  },
  {
    'name': 'population',
    'type': 'su16'
  },
  {
    'name': 'requireSubscription',
    'type': 'su8'
  }
]], {})
console.log(o)

// Writing the whole packet with split 2
o = { s: '' }
console.log(`Writing the whole packet with split 2`)
p.write({
  'serverId': '71',
  'state': '0',
  'population': '52',
  'requireSubscription': '0'
}, o,
0,
['stringSplit', [
  {
    'name': 'serverId',
    'type': 'su8'
  },
  {
    'name': 'state',
    'type': 'su8'
  },
  {
    'name': 'population',
    'type': 'su16'
  },
  {
    'name': 'requireSubscription',
    'type': 'su8'
  }
]], {})
console.log(o)

p.addProtocol(protocol[defaultVersion].data, ['toClient'])
console.log(p.parsePacketBuffer('packet', Buffer.from([0x41, 0x48, 0x31, 0x3b, 0x31, 0x3b, 0x31, 0x30, 0x3b, 0x31])))
