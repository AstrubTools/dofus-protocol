const { defaultVersion, supportedVersions } = require('./version')
const createClient = require('./lib/client/createClient')
const dofus = require('./lib/utils/datatypes/dofus')
const Splitter = require('./lib/transforms/framing')
const { decryptIp, decryptPort, logger, getRandomNetworkKey, setIntervalAndExecute } = require('./lib/utils/utils')

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
  dofus,
  Splitter,
  decryptIp,
  decryptPort,
  logger,
  getRandomNetworkKey,
  setIntervalAndExecute
}
