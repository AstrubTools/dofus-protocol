'use strict'

const { sendCount, calcCount, tryDoc } = require('protodef').utils

module.exports = {
  restBuffer: [readRestBuffer, writeRestBuffer, sizeOfRestBuffer],
  restString: [readRestString, writeRestString, sizeOfRestString],
  su8: [readSU8, writeSU8, sizeOfSU8],
  su16: [readSU16, writeSU16, sizeOfSU16],
  su32: [readSU32, writeSU32, sizeOfSU32],
  su64: [readSU64, writeSU64, sizeOfSU64],
  scontainer: [readSContainer, writeSContainer, sizeOfSContainer],
  cryptedIp: [readCryptedIp, writeCryptedIp, sizeOfCryptedIp],
  cryptedPort: [readCryptedPort, writeCryptedPort, sizeOfCryptedPort],
  restToSeparator: [readRestToSeparator, writeRestToSeparator, sizeOfRestToSeparator],
  sarray: [readSArray, writeSArray, sizeOfSArray]
}

var PartialReadError = require('protodef').utils.PartialReadError

function readRestBuffer (buffer, offset) {
  return {
    value: buffer.slice(offset),
    size: buffer.length - offset
  }
}

function writeRestBuffer (value, buffer, offset) {
  value.copy(buffer, offset)
  return offset + value.length
}

function sizeOfRestBuffer (value) {
  return value.length
}

function readRestString (buffer, offset) {
  return {
    value: (buffer ? buffer.slice(offset) : '').toString('ascii'),
    size: buffer ? buffer.length - offset : 0
  }
}

function writeRestString (value, buffer, offset) {
  buffer.write(value, offset)
  return offset + value.length
}

function sizeOfRestString (value) {
  return value.length
}

function readSU8 (buffer, offset) {
  if (offset + 1 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer.slice(offset, offset + 1)),
    size: 1
  }
}

function writeSU8 (value, o, offset) {
  o.s += value.toString()
  return offset + 1
}

function sizeOfSU8 (value) {
  return 1
}

function readSU16 (buffer, offset) {
  if (offset + 2 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer.slice(offset, offset + 2)),
    size: 2
  }
}

function writeSU16 (value, o, offset) {
  o.s += value.toString()
  return offset + 2
}

function sizeOfSU16 (value) {
  return 2
}

function readSU32 (buffer, offset) {
  if (offset + 4 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer.slice(offset, offset + 4)),
    size: 4
  }
}

function writeSU32 (value, o, offset) {
  o.s += value.toString()
  return offset + 4
}

function sizeOfSU32 (value) {
  return 4
}

function readSU64 (buffer, offset) {
  if (offset + 8 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer.slice(offset, offset + 8)),
    size: 8
  }
}

function writeSU64 (value, o, offset) {
  o.s += value.toString()
  return offset + 8
}

function sizeOfSU64 (value) {
  return 8
}

function readSContainer (buffer, offset, typeArgs, context) {
  const results = {
    value: { '..': context },
    size: 0
  }
  const newBuffer = buffer.slice(offset).toString('ascii').split(typeArgs.separator)
  let i = 0
  typeArgs.params.forEach(({ type, name, anon }) => {
    tryDoc(() => {
      const readResults = this.read(newBuffer[i], 0, type, results.value)
      results.size += readResults.size
      offset += readResults.size + 1
      if (anon) {
        if (readResults.value !== undefined) {
          Object.keys(readResults.value).forEach(key => {
            results.value[key] = readResults.value[key]
          })
        }
      } else { results.value[name] = readResults.value }
    }, name || 'unknown')
    i++
  })
  delete results.value['..']
  // E.g between every field, the separator is of size 1 byte so we substract by nb args length
  // and sometimes there is a separator at the end (1|2|3|4|), sometimes not (1|2|3|4)
  // So we check if the last byte is egal to the last - 2 (if there is a separator at the end)
  // TODO: maybe its better to hardcode the last separator instead ? conflict with write ?
  results.size += typeArgs.params.length - (typeArgs.params.length === 0 /* || buffer.slice(-2, -1).equals(buffer.slice(-3, -2)) */ ? 0 : 1)
  return results
}

function writeSContainer (value, buffer, offset, typeArgs, context) {
  // TODO: use reduce instead
  for (let i = 0; i < typeArgs.params.length; i++) {
    offset = this.write(value[typeArgs.params[i].name], buffer, offset, typeArgs.params[i].type)
    if (i === typeArgs.params.length - 1) break
    this.write(typeArgs.separator, buffer, offset, 'su8')
    offset++
  }
  return offset
}

function sizeOfSContainer (value, typeArgs, context) {
  value['..'] = context
  const size = typeArgs.params.reduce((size, { type, name, anon }) =>
    size + 1 + tryDoc(() => this.sizeOf(anon ? value : value[name], type, value), name || 'unknown'), 0)
  delete value['..']
  return size
}

const ZKARRAY = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
  's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1',
  '2', '3', '4', '5', '6', '7', '8', '9', '-', '_']

function readCryptedIp (buffer, offset) {
  if (offset + 8 > buffer.length) { throw new PartialReadError() }
  let ip = []
  let data = buffer.slice(offset).toString()
  for (let i = 0; i < 8; i += 2) {
    let ascii1 = data.charCodeAt(i) - 48
    let ascii2 = data.charCodeAt(i + 1) - 48
    ip.push(((ascii1 & 15) << 4) | (ascii2 & 15))
  }

  return {
    value: ip.join('.'),
    size: 8
  }
}

function writeCryptedIp (value, o, offset) {
  let splitted = value.split('.')
  let s = ''
  for (let i = 0; i < splitted.length; i++) {
    let v = parseInt(splitted[i])
    s += ((v >> 4) + 48) + ((v & 15) + 48)
  }
  o.s = s
  return offset + 8
}

function sizeOfCryptedIp (value) {
  return 8
}

function readCryptedPort (buffer, offset) {
  let port = 0
  let s = buffer.slice(offset).toString()
  for (let i = 0; i < 2; i++) {
    port += Number(Math.pow(64, 2 - i) * ZKARRAY.findIndex(e => e === s[i]))
  }
  port += ZKARRAY.findIndex(e => e === s[2])
  return {
    value: port,
    size: 3
  }
}

function writeCryptedPort (value, o, offset) {
  let s = ''
  for (let i = 2; i > 0; i--) {
    s += ZKARRAY[value >> (6 * i)]
    value &= (Math.pow(64, i) - 1)
  }
  s += ZKARRAY[value]
  o.s = s
  return 3
}

function sizeOfCryptedPort (value) {
  return 3
}

function readRestToSeparator (buffer, offset, typeArgs) {
  if (!typeArgs.separator) { throw new Error('A separator should be set') }
  let size = 0
  buffer = buffer.toString()
  while (offset + size < buffer.length && buffer[offset + size] !== typeArgs.separator) { size++ }
  return { // If we don't find a separator, it takes until the end of the buffer (useful in case of sarray)
    value: buffer.slice(offset, buffer.length < offset + size ? buffer.length : offset + size),
    size: size
  }
}

// TODO: if parent is not sarray or scontainer, will break and need to write manually separator
function writeRestToSeparator (value, o, offset) {
  o.s += value
  return offset + value.length
}

function sizeOfRestToSeparator (value) {
  return value.length
}

function readSArray (buffer, offset, typeArgs, rootNode) {
  const results = {
    value: [],
    size: 0
  }
  let value
  let newBuffer = buffer.toString('ascii').slice(offset).split(typeArgs.separator)
  let count = newBuffer.length
  let size
  for (let i = 0; i < count; i++) {
    ({ size, value } = tryDoc(() => this.read(newBuffer[i], 0, typeArgs.type, rootNode), i))
    results.value.push(value)
  }
  results.size = buffer.toString('ascii').slice(offset).length - offset
  return results
}

function writeSArray (value, buffer, offset, typeArgs, rootNode) {
  // TODO: use reduce instead
  for (let i = 0; i < value.length; i++) {
    offset = this.write(value[i], buffer, offset, typeArgs.type)
    if (i === typeArgs.params.length - 1) break
    this.write(typeArgs.separator, buffer, offset, 'su8')
    offset++
  }
  return offset
}

function sizeOfSArray (value, typeArgs, rootNode) {
  let size = calcCount.call(this, value.length, typeArgs, rootNode)
  size = value.reduce((size, v, index) => tryDoc(() => size + 1 + this.sizeOf(v, typeArgs.type, rootNode), index), size)
  return size
}
