// TODO: copy paste ank/battlefields/utils/compressor.as
const dofusData = require('node-dofus-data')('official_130')

const { compressCellId,
  uncompressCellId,
  uncompressCells,
  getDirection,
  getDirection2,
  getDirectionFromCoordinates } = require('../src/utils/map')
const assert = require('assert')

assert.deepStrictEqual(uncompressCells(dofusData.maps[52].cells, dofusData.maps[52].width)
  .filter(e => e.teleport).map(e => e.id), [ 17, 131, 241, 419, 455 ])
assert.deepStrictEqual(uncompressCells(dofusData.maps[52].cells, dofusData.maps[52].width)
  .filter(e => e.walkable).length, 262)
let cellId = 333
let compressedCell = compressCellId(cellId)
assert.deepStrictEqual(cellId, uncompressCellId(compressedCell))
console.log(compressCellId(82), compressCellId(54)) // absha2

let cells = uncompressCells(dofusData.maps[52].cells, dofusData.maps[52].width)
let origin = cells[0]
let destination = cells.find(e => e.teleport)
console.log(getDirection(origin.x, origin.y, destination.x, destination.y))

console.log(getDirection2(origin, destination))
console.log(getDirectionFromCoordinates(origin.x, origin.y, destination.x, destination.y))
