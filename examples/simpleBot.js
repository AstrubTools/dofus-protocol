const { createClient, defaultVersion, compressCellId } = require('..')
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

  client.listenToInformation()

  await client.loginToAccount()
  await client.loginToServer()
  await client.pickCharacter(character)
  /*
  setInterval(() => {
    client.write('GAME_ACTION', {
      data: `001${compressCellId(Math.random() * 200)}`
    })
  }, 5000)
  */
  /*
  app.use(bodyParser.json()); // for parsing application/json
  // app.use(bodyParser.urlencoded({extended: false})); // for parsing application/x-www-form-urlencoded

  // For debugging toServer
  app.post('/', (req, res) => {
    console.log(req.body) // req data
    res.send('POST request!!!')
    // client.write(req.body)
  })

  let postPort = 8001
  app.listen(postPort, () => {
    console.log('Server is up and running on port number ' + postPort)
  })
  */
}

start()
