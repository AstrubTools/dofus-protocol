const fetch = require('node-fetch')
const dofusData = require('node-dofus-data')('official_130')

const HASH = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
  's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1',
  '2', '3', '4', '5', '6', '7', '8', '9', '-', '_']

const teleportTexturesSpritesId = [ 1030, 1029, 1764, 2298, 745 ]

const HEX_CHAR = '0123456789ABCDEF'

function checksum (s) {
  let v = 0
  for (let c in s) v += c & 15
  return HEX_CHAR[v & 15]
}

function compressCellId (cellId) {
  return '' + HASH[(cellId & 0xFC0) >> 6] + HASH[cellId & 0x3F]
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
  return (HASH.findIndex(e => e === cellId.charAt(0)) << 6) + HASH.findIndex(e => e === cellId.charAt(1))
}

function uncompressCells (d, mapWidth) {
  let data = d.split('').map(a => HASH.findIndex(b => a === b))

  let cells = []
  for (let i = 0; i < data.length / 10; i++) { cells[i] = uncompressCell(i, data, mapWidth) }
  return cells
}

function uncompressCell (i, data, mapWidth) {
  let index = i * 10
  let active = (data[index] & 32) >> 5 === 1
  let x = Math.floor((i % (mapWidth - 0.5)) * 2)
  let y = Math.floor(i / (mapWidth - 0.5))
  let lineOfSight = (data[index] & 1) === 1
  let layerGroundRot = (data[index + 1] & 48) >> 4
  let groundLevel = data[index + 1] & 15
  let cellType = (data[index + 2] & 56) >> 3
  let layerGroundNum = ((data[index] & 24) << 6) + ((data[index + 2] & 7) << 6) + data[index + 3]
  let groundSlope = (data[index + 4] & 60) >> 2
  let layerGroundFlip = (data[index + 4] & 2) >> 1 === 1
  let layerObject1Num = ((data[index] & 4) << 11) + ((data[index + 4] & 1) << 12) + (data[index + 5] << 6) + data[index + 6]
  let layerObject1Rot = (data[index + 7] & 48) >> 4
  let layerObject1Flip = (data[index + 7] & 8) >> 3 === 1
  let layerObject2Flip = (data[index + 7] & 4) >> 2 === 1
  let layerObject2Interactive = (data[index + 7] & 2) >> 1 === 1
  let layerObject2Num = ((data[index] & 2) << 12) + ((data[index + 7] & 1) << 12) + (data[index + 8] << 6) + data[index + 9]
  let teleport = teleportTexturesSpritesId.find(e => e === layerObject1Num) !== undefined ||
    teleportTexturesSpritesId.find(e => e === layerObject2Num) !== undefined
  let interactive = cellType === dofusData.cellTypes.interactiveObject || layerObject2Interactive
  let interactiveWalkable = cellType === dofusData.cellTypes.interactiveObject || layerObject2Interactive
  let walkable = active && cellType !== dofusData.cellTypes.notWalkable && !interactiveWalkable
  return { id: i,
    x,
    y,
    teleport,
    interactive,
    interactiveWalkable,
    walkable,
    active,
    lineOfSight,
    layerGroundRot,
    groundLevel,
    cellType,
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

function prepareKey (key) {
  let s = []
  for (let i = 0; i < key.length; i += 2) {
    s.push(parseInt(key.substring(i, i + 2), 16))
  }
  return decode(s.join(''))
}

function decipherData (data, preparedKey, checksum) {
  let s = []
  for (let i = 0; i < data.length; i += 2) {
    let a = parseInt(data.substring(i, i + 2), 16)
    let b = preparedKey.charAt((i / 2 + checksum) % preparedKey.length)
    s.push(a ^ b)
  }
  return decode(s.join())
}

function decode (s) {
  if (s.indexOf('%') === -1 && s.indexOf('+') === -1) { return s }

  let len = s.length
  let sb
  let c

  for (let i = 0; i < len; i++) {
    c = s.charAt(i)
    if (c === '%' && i + 2 < len && s.charAt(i + 1) !== '%') {
      if (s.charAt(i + 1) === 'u' && i + 5 < len) {
        // unicode hex sequence
        try {
          sb.push(parseInt(s.substring(i + 2, i + 4), 16))
          i += 2
        } catch (e) {
          sb.push('%')
        }
      } else {
        try {
          s.push(parseInt(s.substring(i + 1, i + 3), 16))
          i += 2
        } catch (e) {
          sb.push('%')
        }
      }
      continue
    }

    if (c === '+') {
      sb.push(' ')
    } else {
      sb.push(c)
    }
  }
  return sb.join('')
}

const PId4 = Math.PI / 4
const COS_PId4 = Math.cos(PId4)
const SIN_PId4 = Math.sin(PId4)
const COS_mPId4 = COS_PId4
const SIN_mPId4 = -SIN_PId4

function getY(id, width) {
  return Math.floor(id / (width - 0.5))
}

function getX(id, width) {
  return Math.floor((id % (width - 0.5)) * 2)
}

function getId(x, y, width) {
  return  Math.floor(y * (width - 0.5) + x / 2.0)
}

function getXRotated(id, width, height) {
  let x = getX(id, width) - width
  let y = getY(id, width) - height
  return Math.floor(Math.ceil((x * COS_PId4 - y * SIN_PId4 - 0.25) * 0.7) + width)
}

function getYRotated(id, width, height) {
  let x = getX(id, width) - width
  let y = getY(id, width) - height
  return Math.floor(Math.ceil((x * SIN_PId4 + y * COS_PId4 - 1.75) * 0.7) + height)
}

function getIdRotated(xRot, yRot, width, height) {
  let xR = Math.ceil(xRot - width) / 0.7 + 0.25
  let xY = Math.ceil(yRot - height) / 0.7 + 1.75
  let x = Math.floor(Math.round(xR * COS_mPId4 - xY * SIN_mPId4 - 0.1) + width)
  let y = Math.floor(Math.round(xR * SIN_mPId4 + xY * COS_mPId4) + height)
  return getId(x, y, width)
}

function getDirection (xFrom, yFrom, xTo, yTo) {
  let deltaX = xTo - xFrom
  let deltaY = yTo - yFrom

  if (Math.abs(deltaX) === 1 && deltaY === 0) {
    return deltaX > 0 ? dofusData.orientations.upRight : dofusData.orientations.downLeft
  } else if (Math.abs(deltaY) === 1 && deltaX === 0) {
    return deltaY > 0 ? dofusData.orientations.downRight : dofusData.orientations.upLeft
  } else if (Math.abs(deltaX) === 1 && deltaY === -1) {
    return deltaX > 0 ? dofusData.orientations.up : dofusData.orientations.left
  } else if (Math.abs(deltaX) === 1 && deltaY === 1) {
    return deltaX > 0 ? dofusData.orientations.right : dofusData.orientations.down
  } else { return null }
}

function getDirection2 (cellA, cellB) {
  if (cellA.x === cellB.x) {
    return cellB.y < cellA.y ? HASH[3] : HASH[7]
  } else if (cellA.y === cellB.y) {
    return cellB.x < cellA.x ? HASH[1] : HASH[5]
  } else if (cellA.x > cellB.x) {
    return cellA.y > cellB.y ? HASH[2] : HASH[0]
  } else if (cellA.x < cellB.x) {
    return cellA.y < cellB.y ? HASH[6] : HASH[4]
  }

  throw new Error('Direction not found')
}

function getDirectionFromCoordinates(x1, y1, x2, y2)
{
  var angle = Math.atan2(y2 - y1, x2 - x1)
  if(angle >= (- Math.PI) / 8 && angle < Math.PI / 8)
  {
      return dofusData.orientations.right
  }
  if(angle >= Math.PI / 8 && angle < Math.PI / 3)
  {
      return dofusData.orientations.downRight
  }
  if(angle >= Math.PI / 3 && angle < 2 * Math.PI / 3)
  {
      return dofusData.orientations.down
  }
  if(angle >= 2 * Math.PI / 3 && angle < 7 * Math.PI / 8)
  {
      return dofusData.orientations.downLeft
  }
  if(angle >= 7 * Math.PI / 8 || angle < -7 * Math.PI / 8)
  {
      return dofusData.orientations.left
  }
  if(angle >= -7 * Math.PI / 8 && angle < -2 * Math.PI / 3)
  {
      return dofusData.orientations.upLeft
  }
  if(angle >= -2 * Math.PI / 3 && angle < (- Math.PI) / 3)
  {
      return dofusData.orientations.up
  }
  if(angle >= (- Math.PI) / 3 && angle < (- Math.PI) / 8)
  {
      return dofusData.orientations.upRight
  }
}

function distance (from, to, width, height) {
  let xto = getXRotated(to, width, height)
  let xfrom = getXRotated(from, width, height)
  let yto = getYRotated(to, width, height)
  let yfrom = getYRotated(from, width, height)
  return (xto - xfrom) * (xto - xfrom) + (yto - yfrom) * (yto - yfrom)
}

function distanceManathan (from, to, width, height) {
  let xto = getXRotated(to, width, height)
  let xfrom = getXRotated(from, width, height)
  let yto = getYRotated(to, width, height)
  let yfrom = getYRotated(from, width, height)
  return Math.abs(xto - xfrom) + Math.abs(yto - yfrom)
}

function distanceManathan (xfrom, yfrom, xto, yto, width, height) {
  return Math.abs(xto - xfrom) + Math.abs(yto - yfrom)
}

module.exports = { getDirectionFromCoordinates,
  getDirection2,
  getDirection,
  HASH,
  compressCells,
  compressCellId,
  uncompressCells,
  uncompressCellId,
  uncompressCell,
  downloadMap,
  parseDate,
  decipherData,
  prepareKey,
  checksum }
