const { HASH } = require('./utils')

function uncompressCellId (cellId) {
  return (HASH.findIndex(e => e === cellId.charAt(0)) << 6) + HASH.find(e => e === cellId.charAt(1))
}

function uncompressCells (d) {
  let data = d.map(e => HASH.findIndex(e))

  let active = (data[0] & 32) >> 5 === 1
  let cells = []
  for (let i = 0; i < data.length / 10; i++) { cells[i] = uncompressCell(i, data, active) }
  return cells
}

function uncompressCell (i, data, active) {
  let id = i
  let index = i * 10
  let lineOfSight = (data[index] & 1) === 1
  let layerGroundRot = (data[index + 1] & 48) >> 4
  let groundLevel = data[index + 1] & 15
  let movement = (data[index + 2] & 56) >> 3
  let layerGroundNum = ((data[index] & 24) << 6) + ((data[index + 2] & 7) << 6) + data[index + 3]
  let groundSlope = (data[index + 4] & 60) >> 2
  let layerGroundFlip = (data[index + 4] & 2) >> 1 === 1
  let layerObject1Num = ((data[index] & 4) << 11) + ((data[index + 4] & 1) << 12) + (data[index + 5] << 6) + data[index + 6]
  let layerObject1Rot = (data[index + 7] & 48) >> 4
  let layerObject1Flip = (data[index + 7] & 8) >> 3 === 1
  let layerObject2Flip = (data[index + 7] & 4) >> 2 === 1
  let layerObject2Interactive = (data[index + 7] & 2) >> 1 === 1
  let layerObject2Num = ((data[index] & 2) << 12) + ((data[index + 7] & 1) << 12) + (data[index + 8] << 6) + data[index + 9]
  return { id,
    active,
    lineOfSight,
    layerGroundRot,
    groundLevel,
    movement,
    layerGroundNum,
    groundSlope,
    layerGroundFlip,
    layerObject1Num,
    layerObject1Rot,
    layerObject1Flip,
    layerObject2Flip,
    layerObject2Interactive,
    layerObject2Num }
}

module.exports = { uncompressCells, uncompressCellId }
