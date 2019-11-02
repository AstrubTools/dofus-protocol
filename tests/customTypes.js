const { dofus } = require('..')

// (don't look at failed params in the dump)
// toClient :  {"name":"ACCOUNT_HOST","params":{"number":"1","servers":[{"serverId":";","sep":"1","state":null,"population":0,"requireSubscription":"1"}]}}
// raw toClient <Buffer 41 48 31 3b 31 3b 31 30 3b 31>

console.log(Buffer.from([0x41, 0x48, 0x31, 0x3b, 0x31, 0x3b, 0x31, 0x30, 0x3b, 0x31]).toString('ascii'))

// Parsing serverId
console.log(dofus.su8[0](Buffer.from([0x31]), 0))

// Parsing population
console.log(dofus.su16[0](Buffer.from([0x31, 0x30]), 0))

// Parsing the whole packet
console.log(dofus.split[0](Buffer.from([0x41, 0x48, 0x31, 0x3b, 0x31, 0x3b, 0x31, 0x30, 0x3b, 0x31]), 0))
