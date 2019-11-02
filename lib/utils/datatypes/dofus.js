'use strict'

const tryDoc = require('protodef').utils.tryDoc

module.exports = {
  restBuffer: [readRestBuffer, writeRestBuffer, sizeOfRestBuffer],
  restString: [readRestString, writeRestString, sizeOfRestString],
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

function readRestString (buffer, offset) {
  return {
    value: buffer.slice(offset).toString('ascii'),
    size: buffer.length - offset
  }
}

function writeRestString (value, buffer, offset) {
  value.copy(buffer.toString('ascii'), offset)
  return offset + value.length
}

function sizeOfRestString (value) {
  return value.length
}

function readSU8 (buffer, offset) {
  if (offset + 1 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer.slice(offset, offset + 1).toString('ascii').split('').reduce((p, c) => p + c)),
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
      offset += readResults.size + 1
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
  // E.g between every field, the separator is of size 1 byte so we substract by nb args length
  // and sometimes there is a separator at the end (1|2|3|4|), sometimes not (1|2|3|4)
  // So we check if the last byte is egal to the last - 2 (if there is a separator at the end)
  results.size += typeArgs.length - (typeArgs.length === 0 || buffer.slice(-2, -1).equals(buffer.slice(-3, -2)) ? 0 : 1)
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
