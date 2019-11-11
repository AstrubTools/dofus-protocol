const { checksum, uncompressCells, downloadMap, parseDate, prepareKey, decipherData } = require('../src/utils/map')

console.log(parseDate('0905131019'))
async function decipherMap () {
  let key = prepareKey(`5c437c40204d23544135463c2d7870313a3e6222514f6133782a7e614673745775
  65413c38694577457e326f3c5a2f2f6023232d6f376452393832565f7a4c677d282738412e4d484d59527646392c4b
  53543e4f4e76482c466a605979693355246f442138203e62476132453450503b38545b59484b72325e6b626d2f3261
  5176605d57425e63616b2a2e6d6f513e785563523b79393b54774e6d316c51597277233b6544375d692f64353d7146
  505a2755465234645228355976375725323540646448792c2e4253237e2029705d6751363f2e6a6a263`)
  downloadMap(7461, '0905131019')
    .then(res => res.text())
    .then(cellData => decipherData(cellData, key, parseInt(checksum(key).toString(), 16) * 2))
    .then(decipheredMap => uncompressCells(decipheredMap))
    .then(e => console.log(e[0]))
}

decipherMap()
