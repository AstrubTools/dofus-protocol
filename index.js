const { defaultVersion, supportedVersions } = require('./version')
const createClient = require('./src/client/createClient')
const Server = require('./src/server/server')
const createServer = require('./src/server/createServer')
const dofus = require('./src/utils/datatypes/dofus')
const Splitter = require('./src/transforms/framing')
const { decryptIp, decryptPort, logger, getRandomNetworkKey, setIntervalAndExecute } = require('./src/utils/utils')
const { compressCellId } = require('./src/utils/map')
const finalPacketParser = require('./src/utils/finalPacketParser')

const protocol = supportedVersions.reduce((acc, version) => {
  acc[version] = {
    data: require(`./data/${version}/data`)
  }
  return acc
}, {})

module.exports = {
  protocol,
  supportedVersions,
  defaultVersion,
  createClient,
  Server,
  createServer,
  dofus,
  Splitter,
  decryptIp,
  decryptPort,
  logger,
  getRandomNetworkKey,
  setIntervalAndExecute,
  finalPacketParser,
  compressCellId
}
