function ascii_to_hexa (ascii) {
  return parseInt(ascii.toString(16).split('').map(e => Number(e.charCodeAt(0))).join(''), 16)
}

function ascii_to_int (ascii) {
  return parseInt(ascii.toString().split('').map(e => Number(e.charCodeAt(0))).join(''), 10)
}

module.exports = { ascii_to_hexa, ascii_to_int }
