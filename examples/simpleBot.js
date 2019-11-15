const { createClient, defaultVersion, compressCellId, finalPacketParser } = require('..')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

var ArgumentParser = require('argparse').ArgumentParser
var parser = new ArgumentParser({
  version: '1.4.1',
  addHelp: true,
  description: 'Simple bot'
})
parser.addArgument([ '-u', '--username' ], { required: true })
parser.addArgument([ '-p', '--password' ], { required: true })
parser.addArgument([ '-c', '--character' ], { required: true })
parser.addArgument([ '-d', '--delay' ], { defaultValue: 0 }) // Only servers with anti hack system (i.e. officials) should use delay between packets

const { username, password, character, delay } = parser.parseArgs()

async function start () {
  // PORT 887 private serv // 443 dofus retro
  // IP '34.251.172.139' retro '190.115.26.126' priv
  const dev = true
  const port = dev ? 887 : 443
  const host = dev ? '190.115.26.126' : '34.251.172.139'
  let client = await createClient({ host, port, username, password, version: defaultVersion, delay })

  await client.loginToAccount()
  await client.loginToServer(1)
  await client.pickCharacter(character)

  client.on('GAME_DATA', data => {
    let currentMap = finalPacketParser.onGameData(data)
    console.log(currentMap.id)
    /*
    setInterval(() => {
      client.write('GAME_ACTION', {
        data: `001${compressCellId(Math.random() * 200)}`
      })
    }, 5000)
    */
  })
}

start()
