const Client = require('./client')

const hashPassword = require('../utils/hash')
const { getRandomNetworkKey, setIntervalAndExecute } = require('../utils/utils')
const onMovement = require('../utils/packetParser')

const { once } = require('once-promise')

// Connect to battlenet
async function createClient (host, port, account, password, version, delay) {
  const client = new Client(version)
  client.delay = delay
  client.account = account
  client.password = password
  // TODO: maybe use once instead for these login stuff

  // TODO: implement reject for every functions (failed to connect, etc ...)
  client.loginToAccount = async () => {
    return new Promise(async (resolve, reject) => {
      client.on('HELLO_CONNECTION', ({ key }) => {
        client.socket.write(Buffer.from('312e34302e310a00', 'hex'))
        client.socket.write(client.account + '\n' + hashPassword(client.password, key) + '\n')
        client.write('ACCOUNT_AUTHENTICATION', {})
      })
      client.on('ACCOUNT_PSEUDO', () => {
        client.write('ACCOUNT_SERVER_LIST', {})
      })
      client.on('ACCOUNT_HOST', (data) => {
        client.servers = data.servers
        resolve()
      })
      await client.connect(host, port) // 'Lobby'
      client.emit('clientReady', client)
    })
  }

  client.loginToServer = async () => { // TODO: Give a param etc
    return new Promise(async (resolve, reject) => {
      client.on('ACCOUNT_SERVER_ENCRYPTED_HOST', async ({ unk, ip, port, ticket }) => {
        client.ticket = ticket
        client.gameHost = ip
        client.gamePort = port
        resolve()
      })
      client.write('ACCOUNT_ACCESS_SERVER', {
        serverId: client.servers[0].serverId.toString() // Joining the first server
      })
    })
  }

  client.pickCharacter = async (charName) => {
    return new Promise(async (resolve, reject) => {
      client.on('HELLO_GAME', () => {
        client.write('ACCOUNT_TICKET', {
          ticket: client.ticket
        })
      })
      client.on('ACCOUNT_TICKET', () => {
        client.retry = setIntervalAndExecute(() => { // TODO: should stop retrying at some point thought :)
          client.write('ACCOUNT_KEY', {
            key: '0'
          })
          client.write('ACCOUNT_REGION_VERSION', {
            ticket: ''
          })
        }, 4000, 5, () => {
          clearInterval(client.retry)
          reject(new Error('Failed to get the region version'))
        })
      })
      client.on('ACCOUNT_REGION_VERSION', () => {
        clearInterval(client.retry)
        client.retry = setIntervalAndExecute(() => {
          client.write('ACCOUNT_GET_GIFTS', {
            language: 'en'
          })
          /*
          // Idk why sending this makes not receiving ACCOUNT_LIST_CHARACTER
          // Even though it's sent on the sniffer ?
          client.write('ACCOUNT_IDENTITY', {
            identity: 'CLEWjNIzm66uspXF' // getRandomNetworkKey() // 'CLEWjNIzm66uspXF'
          })
          */
          client.write('ACCOUNT_GET_CHARACTERS', {
          })
          client.write('ACCOUNT_AUTHENTICATION', {
          })
        }, 4000, 5, () => {
          clearInterval(client.retry)
          reject(new Error('Failed to get the characters list'))
        })
      })
      client.on('ACCOUNT_LIST_CHARACTER', (data) => {
        console.log('Got the list of characters !')
        clearInterval(client.retry)

        client.character = data.data.find(e => e.find(r => r === charName))
        if (!client.character) throw new Error('Unable to find this character !')
        client.retry = setIntervalAndExecute(() => {
          client.write('ACCOUNT_SET_CHARACTER', {
            characterId: client.character[0] // Can we do it better (named params ...) ? [0] is char id
          })
          client.write('ACCOUNT_AUTHENTICATION', {
          })
        }, 4000, 5, () => {
          clearInterval(client.retry)
          reject(new Error('Failed to set character'))
        })
      })
      client.on('ACCOUNT_SELECT_CHARACTER', (data) => {
        clearInterval(client.retry)
        client.retry = setIntervalAndExecute(() => {
          client.write('GAME_CREATE', {
            type: '1'
          })
        }, 4000, 5, () => {
          clearInterval(client.retry)
          reject(new Error('Failed to create game'))
        })
      })
      client.on('GAME_CREATE', (data) => {
        clearInterval(client.retry)
        if (data.unk.find(e => e === '1')) {
          console.log('~'.repeat(10))
          console.log('IN GAME READY TO BOT')
          console.log('~'.repeat(10))
          // This is sort of ping, maybe should investigate the params
          client.on('BASIC_CONFIRM', () => {
            clearInterval(client.retryPing)
          })
          // Server send this basic unk 1, client answer unk2, then server confirm
          client.on('BASIC_UNKNOWN1', () => {
            client.retryPing = setIntervalAndExecute(() => {
              client.write('BASIC_UNKNOWN2', {
                data: ['116', '6', '50']
              })
            }, 4000, 5, () => {
              clearInterval(client.retryPing)
              reject(new Error('Failed to get a pong'))
            })
          })
          client.write('BASIC_UNKNOWN1', {})
          client.write('GAME_INFORMATION', {})
          resolve()
        } else {
          reject(Error('Server refused to create game'))
        }
      })

      client.on('GAME_MOVEMENT', (data) => {

      })
      await client.socket.end() // Closing last connection (when switching between servers)
      await client.connect(client.gameHost, client.gamePort, true) // Game
    })
  }

  client.listenToInformation = () => {
    client.data = {}
    client.data.isFighting = false
    client.on('SPELL', (data) => {
      client.data.skills = data.data.filter(e => e !== '').map(e => { return { skillId: e[0], skillLevel: e[1], unknown: e[2] } })
    })
    // https://github.com/louis030195/dofus-decompiled/blob/1c2f95587cb762b8e943d43df00f866e3cffd6b6/dofus130/scripts/__Packages/dofus/aks/Account.as#L735
    client.on('ACCOUNT_STATS', (data) => {
      if (data.data.length === 0) throw new Error('Account stats bug')
      let i = data.data[0].split(',')
      client.data.xp = i[0]
      client.data.xpLow = i[1]
      client.data.xpHigh = i[2]
      client.data.kamas = data.data[1]
      client.data.bonusPoints = data.data[2]
      client.data.bonusPointsSpell = data.data[3]
      i = data.data[4].split(',')
      let _loc6_ = 0
      if (i[0].split('').indexOf('~')) {
        let _loc7_ = i[0].split('~')
        client.data.haveFakeAlignment = _loc7_[0] !== _loc7_[1]
        i[0] = _loc7_[0]
        _loc6_ = Number(_loc7_[1])
      }
      let _loc8_ = Number(i[0])
      let _loc9_ = Number(i[1])
      client.data.alignment = _loc8_// new dofus.datacenter.Alignment(_loc8_, _loc9_)
      client.data.fakeAlignment = _loc9_// new dofus.datacenter.Alignment(_loc6_, _loc9_)
      let _loc10_ = Number(i[2])
      let _loc11_ = Number(i[3])
      let _loc12_ = Number(i[4])
      let _loc13_ = i[5] == '1'
      // let _loc14_ = client.rank.disgrace // Whats this
      client.data.rank = [_loc10_, _loc11_, _loc12_, _loc13_] // new dofus.datacenter.Rank(_loc10_, _loc11_, _loc12_, _loc13_)
      i = data.data[5].split(',')
      client.data.LP = i[0]
      client.data.LPmax = i[1]
      i = data.data[6].split(',')
      client.data.Energy = i[0]
      client.data.EnergyMax = i[1]
      client.data.Initiative = data.data[7]
      client.data.Discernment = data.data[8]
      let _loc15_ = []
      let _loc16_ = 3
      while (_loc16_ > -1) {
        _loc15_[_loc16_] = []
        _loc16_ = _loc16_ - 1
      }
      let _loc17_ = 9
      while (_loc17_ < 51) {
        i = data.data[_loc17_].split(',')
        let _loc18_ = Number(i[0])
        let _loc19_ = Number(i[1])
        let _loc20_ = Number(i[2])
        let _loc21_ = Number(i[3])
        switch (_loc17_) {
          case 9:
            _loc15_[0].push({ id: _loc17_, o: 7, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'Star' })
            if (!client.data.isFighting) {
              client.data.AP = _loc18_ + _loc19_ + _loc20_
            }
            break
          case 10:
            _loc15_[0].push({ id: _loc17_, o: 8, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconMP' })
            if (!client.data.isFighting) {
              client.data.MP = _loc18_ + _loc19_ + _loc20_
            }
            break
          case 11:
            _loc15_[0].push({ id: _loc17_, o: 3, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconEarthBonus' })
            client.data.Force = _loc18_
            client.data.ForceXtra = _loc19_ + _loc20_
            break
          case 12:
            _loc15_[0].push({ id: _loc17_, o: 1, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconVita' })
            client.data.Vitality = _loc18_
            client.data.VitalityXtra = _loc19_ + _loc20_
            break
          case 13:
            _loc15_[0].push({ id: _loc17_, o: 2, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconWisdom' })
            client.data.Wisdom = _loc18_
            client.data.WisdomXtra = _loc19_ + _loc20_
            break
          case 14:
            _loc15_[0].push({ id: _loc17_, o: 5, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconWaterBonus' })
            client.data.Chance = _loc18_
            client.data.ChanceXtra = _loc19_ + _loc20_
            break
          case 15:
            _loc15_[0].push({ id: _loc17_, o: 6, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconAirBonus' })
            client.data.Agility = _loc18_
            client.data.AgilityXtra = _loc19_ + _loc20_
            client.data.AgilityTotal = _loc18_ + _loc19_ + _loc20_ + _loc21_
            break
          case 16:
            _loc15_[0].push({ id: _loc17_, o: 4, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconFireBonus' })
            client.data.Intelligence = _loc18_
            client.data.IntelligenceXtra = _loc19_ + _loc20_
            break
          case 17:
            _loc15_[0].push({ id: _loc17_, o: 9, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            client.data.RangeModerator = _loc18_ + _loc19_ + _loc20_
            break
          case 18:
            _loc15_[0].push({ id: _loc17_, o: 10, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            client.data.MaxSummonedCreatures = _loc18_ + _loc19_ + _loc20_
            break
          case 19:
            _loc15_[1].push({ id: _loc17_, o: 1, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            break
          case 20:
            _loc15_[1].push({ id: _loc17_, o: 2, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            break
          case 21:
            _loc15_[1].push({ id: _loc17_, o: 3, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            break
          case 22:
            _loc15_[1].push({ id: _loc17_, o: 4, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            break
          case 23:
            _loc15_[1].push({ id: _loc17_, o: 7, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            break
          case 24:
            _loc15_[1].push({ id: _loc17_, o: 5, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            break
          case 25:
            _loc15_[1].push({ id: _loc17_, o: 6, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            break
          case 26:
            _loc15_[1].push({ id: _loc17_, o: 8, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            break
          case 27:
            _loc15_[1].push({ id: _loc17_, o: 9, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            client.data.CriticalHitBonus = _loc18_ + _loc19_ + _loc20_ + _loc21_
            break
          case 28:
            _loc15_[1].push({ id: _loc17_, o: 10, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
            break
          case 29:
            _loc15_[1].push({ id: _loc17_, o: 11, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'Star' })
            break
          case 30:
            _loc15_[1].push({ id: _loc17_, o: 12, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconMP' })
            break
          case 31:
            _loc15_[2].push({ id: _loc17_, o: 1, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconNeutral' })
            break
          case 32:
            _loc15_[2].push({ id: _loc17_, o: 2, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconNeutral' })
            break
          case 33:
            _loc15_[3].push({ id: _loc17_, o: 11, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconNeutral' })
            break
          case 34:
            _loc15_[3].push({ id: _loc17_, o: 12, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconNeutral' })
            break
          case 35:
            _loc15_[2].push({ id: _loc17_, o: 3, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconEarth' })
            break
          case 36:
            _loc15_[2].push({ id: _loc17_, o: 4, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconEarth' })
            break
          case 37:
            _loc15_[3].push({ id: _loc17_, o: 13, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconEarth' })
            break
          case 38:
            _loc15_[3].push({ id: _loc17_, o: 14, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconEarth' })
            break
          case 39:
            _loc15_[2].push({ id: _loc17_, o: 7, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconWater' })
            break
          case 40:
            _loc15_[2].push({ id: _loc17_, o: 8, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconWater' })
            break
          case 41:
            _loc15_[3].push({ id: _loc17_, o: 17, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconWater' })
            break
          case 42:
            _loc15_[3].push({ id: _loc17_, o: 18, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconWater' })
            break
          case 43:
            _loc15_[2].push({ id: _loc17_, o: 9, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconAir' })
            break
          case 44:
            _loc15_[2].push({ id: _loc17_, o: 10, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconAir' })
            break
          case 45:
            _loc15_[3].push({ id: _loc17_, o: 19, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconAir' })
            break
          case 46:
            _loc15_[3].push({ id: _loc17_, o: 20, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconAir' })
            break
          case 47:
            _loc15_[2].push({ id: _loc17_, o: 5, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconFire' })
            break
          case 48:
            _loc15_[2].push({ id: _loc17_, o: 6, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconFire' })
            break
          case 49:
            _loc15_[3].push({ id: _loc17_, o: 15, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconFire' })
            break
          case 50:
            _loc15_[3].push({ id: _loc17_, o: 16, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconFire' })
        }
        _loc17_ = _loc17_ + 1
      }
      client.data.FullStats = _loc15_
    })
    client.on('GAME_MOVEMENT', (data) => {
      client.data.movementData = onMovement(data.data, client.data.isFighting) // TODO: Maybe should be reset on map changing instead ?
    })
  }
  client.sendAction = (actionType, params) => {
    client.write('GAME_ACTION', {
    })
  }
  client.say = (target, message, extra) => {
    client.write('BASIC_MESSAGE', {
      target: target !== undefined ? target : '*', // Default channel (general)
      message: message,
      extra: extra !== undefined ? extra : '' // Idk what is this (seems empty)
    })
  }
  return client
}

module.exports = createClient
