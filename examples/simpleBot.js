const { createClient } = require('..')
const { defaultVersion } = require('..')

async function start () {
  //PORT 887 private serv // 443 dofus retro
  await createClient("190.115.26.126", 887, defaultVersion)
}

start()
