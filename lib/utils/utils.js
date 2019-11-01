function splitPackets (packet, separator) {
  return packet.split('').reverse().join('').split(separator !== undefined ? separator : '00')
    .map(e => e.split('').reverse().join('')).reverse().slice(0, -1)
}

module.exports = splitPackets
