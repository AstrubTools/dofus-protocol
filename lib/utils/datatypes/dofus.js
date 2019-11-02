'use strict'

const tryDoc = require('protodef').tryDoc

module.exports = {
  restBuffer: [readRestBuffer, writeRestBuffer, sizeOfRestBuffer],
  crestBuffer: [readCRestBuffer, writeCRestBuffer, sizeOfCRestBuffer],
  cstringTwo: [readCStringTwo, writeCStringTwo, sizeOfCStringTwo],
  su8: [readSU8, writeSU8],
  su16: [readSU16, writeSU16],
  su32: [readSU32, writeSU32],
  su64: [readSU64, writeSU64],
  split: [readSplit, writeSplit, sizeOfSplit]
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

function readCRestBuffer (buffer, offset) {
  return {
    value: buffer.slice(offset, buffer.findIndex(element => element === 0x00)),
    size: buffer.length - offset
  }
}

function writeCRestBuffer (value, buffer, offset) {
  value.copy(buffer, offset)
  return offset + value.length
}

function sizeOfCRestBuffer (value) {
  return value.length
}

function readCStringTwo (buffer, offset) {
  let size = 0
  while (offset + size < buffer.length && buffer[offset + size] !== 0x00) { size++ }
  if (buffer.length < offset + size + 1) { throw new PartialReadError() }

  return {
    value: buffer.toString('utf8', offset, offset + size),
    size: size
  }
}

function writeCStringTwo (value, buffer, offset) {
  const length = Buffer.byteLength(value, 'utf8')
  buffer.write(value, offset, length, 'utf8')
  offset += length
  buffer.writeInt8(0x00, offset)
  return offset
}

function sizeOfCStringTwo (value) {
  const length = Buffer.byteLength(value, 'utf8')
  return length
}

function readSU8 (buffer, offset) {
  if (offset + 1 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer.slice(offset, offset + 1).toString('ascii')),
    size: 1
  }
}

function writeSU8 (value, buffer, offset) {
  const length = Buffer.byteLength(value, 'ascii')
  buffer.write(value, offset, length, 'ascii')
  offset += length
  return offset
}

function readSU16 (buffer, offset) {
  if (offset + 2 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer.slice(offset, offset + 2).toString('ascii').split('').reduce((p, c) => p + c)),
    size: 2
  }
}

function writeSU16 (value, buffer, offset) {
  const length = Buffer.byteLength(value, 'ascii')
  buffer.write(value, offset, length, 'ascii')
  offset += length
  return offset
}

function readSU32 (buffer, offset) {
  if (offset + 4 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer.slice(offset, offset + 4).toString('ascii').split('').reduce((p, c) => p + c)),
    size: 4
  }
}

function writeSU32 (value, buffer, offset) {
  const length = Buffer.byteLength(value, 'ascii')
  buffer.write(value, offset, length, 'ascii')
  offset += length
  return offset
}

function readSU64 (buffer, offset) {
  if (offset + 1 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer.slice(offset, offset + 8).toString('ascii').split('').reduce((p, c) => p + c)),
    size: 8
  }
}

function writeSU64 (value, buffer, offset) {
  const length = Buffer.byteLength(value, 'ascii')
  buffer.write(value, offset, length, 'ascii')
  offset += length
  return offset
}

function readSplit (buffer, offset, typeArgs, context) {
  const results = {
    value: { '..': context },
    size: 0
  }
  typeArgs.forEach(({ type, name, anon }) => {
    tryDoc(() => {
      const readResults = this.read(buffer, offset, type, results.value)
      results.size += readResults.size
      offset += readResults.size + 1 // Separator size
      if (anon) {
        if (readResults.value !== undefined) {
          Object.keys(readResults.value).forEach(key => {
            results.value[key] = readResults.value[key]
          })
        }
      } else { results.value[name] = readResults.value }
    }, name || 'unknown')
  })
  delete results.value['..']
  results.size += typeArgs.length - (typeArgs.length > 0 ? 1 : 0) // E.g between every field, the separator is of size 1 byte
  return results
}

function writeSplit (value, buffer, offset, typeArgs, context) {
  value['..'] = context
  offset = typeArgs.reduce((offset, { type, name, anon }) =>
    tryDoc(() => this.write(anon ? value : value[name], buffer, offset + 1, type, value), name || 'unknown'), offset)
  delete value['..']
  return offset
}

function sizeOfSplit (value, typeArgs, context) {
  value['..'] = context
  const size = typeArgs.reduce((size, { type, name, anon }) =>
    size + 1 + tryDoc(() => this.sizeOf(anon ? value : value[name], type, value), name || 'unknown'), 0)
  delete value['..']
  return size
}