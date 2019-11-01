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

const { username, password } = parser.parseArgs()

async function start () {
  // PORT 887 private serv // 443 dofus retro
  // IP '34.251.172.139' retro '190.115.26.126' priv
  const dev = true
  const port = dev ? 887 : 443
  const ip = dev ? '190.115.26.126' : '34.251.172.139'
  await createClient(ip, port, username, password, defaultVersion)
}

start()
