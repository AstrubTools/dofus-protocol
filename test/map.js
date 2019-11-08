const { uncompressCells, uncompressCellId } = require('../src/utils/map')

let truc = []
let data = 'aeOfez'
for (let i = 0; i < data.length; i += 3) {
  truc.push(uncompressCellId(data.substring(i + 1, i + 3)))
}
console.log(truc)
