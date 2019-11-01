'use strict'

module.exports = {
  restBuffer: [readRestBuffer, writeRestBuffer, sizeOfRestBuffer],
  crestBuffer: [readCRestBuffer, writeCRestBuffer, sizeOfCRestBuffer],
  cstringTwo: [readCStringTwo, writeCStringTwo, sizeOfCStringTwo]
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
