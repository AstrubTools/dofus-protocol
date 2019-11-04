const { dofus, protocol, defaultVersion } = require('..')
const assert = require('assert')

const ProtoDef = require('protodef').ProtoDef
const p = new ProtoDef(false)
p.addTypes(dofus)
// (don"t look at failed params in the dump)
// toClient :  {"name":"ACCOUNT_HOST","params":{"number":"1","servers":[{"serverId":";","sep":"1","state":null,"population":0,"requireSubscription":"1"}]}}
// raw toClient <Buffer 41 48 31 3b 31 3b 31 30 3b 31>

let buf = Buffer.from('AH1;1;10;1')
console.log(`ASCII packet ${buf}`)

// Buffer.from([0x41, 0x48, 0x31, 0x3b, 0x31, 0x3b, 0x31, 0x30, 0x3b, 0x31])
// Parsing the whole packet with split 2
let res = p.read('AH1;1;10;1',
  2,
  ['scontainer',
    { 'separator': '|',
      'params': [
        {
          'name': 'servers',
          'type': ['scontainer', { 'separator': ';',
            'params': [
              {
                'name': 'serverId',
                'type': ['restToSeparator', 
                  { 'separator': ';' }
                ]
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
            ] }
          ]
        }
      ]
    }
  ], {})
console.log(`Parsing the whole packet with scontainer ${JSON.stringify(res)}`)
assert.strictEqual(JSON.stringify(res), '{"value":{"servers":{"serverId":1,"state":1,"population":10,"requireSubscription":1}},"size":8}')

// Writing the whole packet with split 2
let o = { s: '' }
console.log(`Writing the whole packet with split 2`)
p.write({
  'serverId': '10000',
  'state': '1',
  'population': '10',
  'requireSubscription': '1'
}, o,
0,
['scontainer',
  { 'separator': ';',
    'params': [
      {
        'name': 'serverId',
        'type': ['restToSeparator',
          { 'separator': ';' }
        ]
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
    ]
  }
]
, {})
console.log(o)
assert.deepStrictEqual(o, { s: '10000;1;10;1' })

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
['scontainer',
  { 'separator': ';',
    'params': [
      {
        'name': 'serverId',
        'type': ['restToSeparator', 
          { 'separator': ';' }
        ]
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
    ]
  }
], {})
console.log(o)
assert.deepStrictEqual(o, { s: '71;0;52;0' })

p.addProtocol(protocol[defaultVersion].data, ['toClient'])
// console.log(p.parsePacketBuffer('packet', Buffer.from([0x41, 0x48, 0x31, 0x3b, 0x31, 0x3b, 0x31, 0x30, 0x3b, 0x31])))

res = p.read(Buffer.from([0x41, 0x58, 0x4b, 0x3b, 0x3e, 0x37, 0x33, 0x31, 0x3a, 0x37, 0x3e, 0x62, 0x77, 0x30, 0x33, 0x36, 0x38, 0x39, 0x34, 0x31]),
  2,
  ['container', [
    {
      'name': 'unk',
      'type': 'su8'
    },
    {
      'name': 'ip',
      'type': 'cryptedIp'
    },
    {
      'name': 'port',
      'type': 'cryptedPort'
    },
    {
      'name': 'key',
      'type': 'restString'
    }
  ]])
console.log(res)
assert.deepStrictEqual(res.value.ip, '190.115.26.126')
assert.deepStrictEqual(res.value.port, 5556)

res = p.read('AH601;1;75;1|605;1;75;1|609;1;75;1|604;1;75;1|608;1;75;1|603;1;75;1|607;1;75;1|611;1;75;1|602;1;75;1|606;1;75;1|610;1;75;1',
  2,
  ['container', [
    {
      'name': 'servers',
      'type': ['sarray', { 'separator': '|',
        'type': ['scontainer', { 'separator': ';',
          'params': [
            {
              'name': 'serverId',
              'type': ['restToSeparator', 
                { 'separator': ';' }
              ]
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
          ] }
        ] }
      ]
    }
  ]], {})
console.log(`Parsing the whole packet with split \n${JSON.stringify(res)}`)
assert.strictEqual(res.size, 118)
assert.strictEqual(res.value.servers.length, 11)
assert.strictEqual(res.value.servers[0].serverId, 601)
