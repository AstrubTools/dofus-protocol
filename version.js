'use strict'

function toNumVersion (version) {
  switch (version) {
    case '1.30':
      return 1
    case '2':
      return 2
  }
}

module.exports = {
  defaultVersion: '1.30',
  supportedVersions: ['1.30'],
  toNumVersion
}
