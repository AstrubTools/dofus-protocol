const { decryptIp, decryptPort } = require('..')
const assert = require('assert')

describe('DecryptIp', () => {
  assert.equal(decryptIp(';>731:7>'), '190.115.26.126')
})

describe('DecryptPort', () => {
  assert.equal(decryptPort('bw0'), 5556)
})
