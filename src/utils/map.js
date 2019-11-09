const fetch = require('node-fetch')

const HASH = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
  's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1',
  '2', '3', '4', '5', '6', '7', '8', '9', '-', '_']

function compressCellId (cellId) {
  return '' + HASH.findIndex(e => e === (cellId & 0xFC0) >> 6) + HASH.findIndex(e => e === cellId & 0x3F)
}

function compressCells (cells) {
  return cells.map(compressCell).toString()
}

function compressCell (cell) {
  let data = []
  data[0] = (cell.active ? 1 : 0) << 5
  data[0] = data[0] | (cell.lineOfSight ? 1 : 0)
  data[0] = data[0] | (cell.layerGroundNum & 1536) >> 6
  data[0] = data[0] | (cell.layerObject1Num & 8192) >> 11
  data[0] = data[0] | (cell.layerObject2Num & 8192) >> 12
  data[1] = (cell.layerGroundRot & 3) << 4
  data[1] = data[1] | cell.groundLevel & 15
  data[2] = (cell.movement & 7) << 3
  data[2] = data[2] | cell.layerGroundNum >> 6 & 7
  data[3] = cell.layerGroundNum & 63
  data[4] = (cell.groundSlope & 15) << 2
  data[4] = data[4] | (cell.layerGroundFlip ? 1 : 0) << 1
  data[4] = data[4] | cell.layerObject1Num >> 12 & 1
  data[5] = cell.layerObject1Num >> 6 & 63
  data[6] = cell.layerObject1Num & 63
  data[7] = (cell.layerObject1Rot & 3) << 4
  data[7] = data[7] | (cell.layerObject1Flip ? 1 : 0) << 3
  data[7] = data[7] | (cell.layerObject2Flip ? 1 : 0) << 2
  data[7] = data[7] | (cell.layerObject2Interactive ? 1 : 0) << 1
  data[7] = data[7] | cell.layerObject2Num >> 12 & 1
  data[8] = cell.layerObject2Num >> 6 & 63
  data[9] = cell.layerObject2Num & 63
  return data.map(a => HASH.findIndex(b => a === b))
}

function uncompressCellId (cellId) {
  return (HASH.findIndex(e => e === cellId.charAt(0)) << 6) + HASH.find(e => e === cellId.charAt(1))
}

function uncompressCells (d) {
  let data = d.split(',').map(a => HASH.findIndex(b => a === b))

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

async function downloadMap (mapId, subId) {
  return fetch(`http://staticns.ankama.com/dofus/gamedata/dofus/maps/${mapId}_${subId}X.swf`)
}

// subid = date
function parseDate (date) {
  let year = parseInt(date.substring(0, 2)) + 2000
  let month = parseInt(date.substring(2, 4))
  let day = parseInt(date.substring(4, 6))
  let hours = parseInt(date.substring(6, 8))
  let min = parseInt(date.substring(8))
  let dateTime = new Date(year, month, day, hours, min)
  return dateTime
}

module.exports = { compressCells, compressCellId, uncompressCells, uncompressCellId, downloadMap, parseDate }
