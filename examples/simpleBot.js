const { createClient } = require('..')
const { defaultVersion } = require('..')

var ArgumentParser = require('argparse').ArgumentParser
var parser = new ArgumentParser({
  version: '1.4.1',
  addHelp: true,
  description: 'Simple bot'
})
parser.addArgument([ '-u', '--username' ], { required: true })
parser.addArgument([ '-p', '--password' ], { required: true })
parser.addArgument([ '-d', '--delay' ], { defaultValue: 0 }) // Only servers with anti hack system (i.e. officials) should use delay between packets

const { username, password, delay } = parser.parseArgs()

async function start () {
  // PORT 887 private serv // 443 dofus retro
  // IP '34.251.172.139' retro '190.115.26.126' priv
  const dev = true
  const port = dev ? 887 : 443
  const ip = dev ? '190.115.26.126' : '34.251.172.139'
  let client = await createClient(ip, port, username, password, defaultVersion, delay)
  // TODO improve the promise chaining ...
  await client.loginToAccount().catch(console.log)
  await client.loginToServer().catch(console.log)
  await client.pickCharacter('Uwoba').catch(console.log)
}

start()
