'use strict'

const tryDoc = require('protodef').utils.tryDoc

module.exports = {
  restBuffer: [readRestBuffer, writeRestBuffer, sizeOfRestBuffer],
  restString: [readRestString, writeRestString, sizeOfRestString],
  su8: [readSU8, writeSU8, sizeOfSU8],
  su16: [readSU16, writeSU16, sizeOfSU16],
  su32: [readSU32, writeSU32, sizeOfSU32],
  su64: [readSU64, writeSU64, sizeOfSU64],
  stringSplit: [readStringSplit, writeStringSplit, sizeOfStringSplit]
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
  // Dofus client end packets with 0x0A00 ~.~
  const isClient = buffer.slice(-2, -1).equals(Buffer.from([0x0A]))
  const newBuffer = buffer.slice(offset, (isClient ? -2 : buffer.length))
  if (!newBuffer) { throw new Error(`Check your custom types`) }
  return {
    value: newBuffer.toString('ascii'),
    size: buffer.length - offset - (isClient ? 2 : 0)
  }
}

function writeRestString (value, buffer, offset) {
  const isClient = buffer.slice(-2, -1).equals(Buffer.from([0x0A]))
  value.copy(buffer.toString('ascii'), offset, (isClient ? -2 : buffer.length))
  return offset + value.length - (isClient ? 2 : 0)
}

function sizeOfRestString (value) {
  return value.length
}

function readSU8 (buffer, offset) {
  if (offset + 1 > buffer.length) { throw new PartialReadError() }
  return {
    value: parseInt(buffer),
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
    value: parseInt(buffer),
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
    value: parseInt(buffer),
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
    value: parseInt(buffer),
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

function readStringSplit (buffer, offset, typeArgs, context) {
  const results = {
    value: { '..': context },
    size: 0
  }
  const newBuffer = buffer.slice(offset).toString('ascii').split(';')
  let i = 0
  typeArgs.forEach(({ type, name, anon }) => {
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
  results.size += typeArgs.length - (typeArgs.length === 0 /* || buffer.slice(-2, -1).equals(buffer.slice(-3, -2)) */ ? 0 : 1)
  return results
}

function writeStringSplit (value, buffer, offset, typeArgs, context) {
  // TODO: use reduce instead
  for (let i = 0; i < typeArgs.length; i++) {
    offset = this.write(value[typeArgs[i].name], buffer, offset, typeArgs[i].type)
    if (i === typeArgs.length - 1) break
    this.write(';', buffer, offset, 'su8')
    offset++
  }
  return offset
}

function sizeOfStringSplit (value, typeArgs, context) {
  value['..'] = context
  const size = typeArgs.reduce((size, { type, name, anon }) =>
    size + 1 + tryDoc(() => this.sizeOf(anon ? value : value[name], type, value), name || 'unknown'), 0)
  delete value['..']
  return size
}
