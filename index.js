const { defaultVersion, supportedVersions } = require('./version')
const createClient = require('./lib/client/createClient')
const dofus = require('./lib/utils/datatypes/dofus')
const Splitter = require('./lib/transforms/framing')

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
  Splitter
}
