const { getXRotated, getYRotated } = require('map')

function getCellPath (idFrom, idTo, width, height) {
  let xFrom = getXRotated(idFrom, width, height)
  let yFrom = getYRotated(idFrom, width, height)
  let xTo = getXRotated(idTo, width, height)
  let yTo = getYRotated(idTo, width, height)
}

module.exports = { getCellPath }
