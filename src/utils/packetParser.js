const { uncompressCells, uncompressCellId } = require('./map')
function onMovement (data, isFighting) {
  let movementData = {}
  return data.filter(e => e.length !== 0 && e.charAt(0) !== '-').map(i => {
    let _loc8_ = false
    let _loc9_ = i.charAt(0)
    if (_loc9_ === '+') { // maybe useless because we filter '-'
      _loc8_ = true
    } else if (_loc9_ === '~') {
      _loc8_ = true
    }
    if (_loc8_) {
      let _loc10_ = i.substr(1).split(';')
      let _loc11_ = _loc10_[0]
      let _loc12_ = _loc10_[1]
      let _loc13_ = Number(_loc10_[2])
      let _loc15_ = _loc10_[4]
      let _loc16_ = _loc10_[5]
      let _loc17_ = _loc10_[6]
      let _loc18_ = false
      if (_loc17_.charAt(_loc17_.length - 1) === '*') {
        _loc17_ = _loc17_.substr(0, _loc17_.length - 1)
        _loc18_ = true
      }
      if (_loc17_.charAt(0) === '*') {
        _loc17_ = _loc17_.substr(1)
      }
      let _loc20_ = _loc17_.split('^')
      let _loc21_ = _loc20_.length !== 2 ? _loc17_ : _loc20_[0]
      let _loc22_ = _loc16_.split(',')
      switch (_loc22_[0]) {
        case '-1':
        case '-2': // Creature / monster
          movementData.noFlip = _loc18_
          movementData.cell = _loc11_
          movementData.dir = _loc12_
          movementData.powerLevel = _loc10_[7]
          movementData.color1 = _loc10_[8]
          movementData.color2 = _loc10_[9]
          movementData.color3 = _loc10_[10]
          movementData.accessories = _loc10_[11]
          break
        case '-3': // Monster group
          movementData.level = _loc10_[7]
          movementData.noFlip = _loc18_
          movementData.cell = Number(_loc11_)
          movementData.dir = _loc12_
          let _loc35_ = _loc10_[8].split(',')
          movementData.color1 = _loc35_[0]
          movementData.color2 = _loc35_[1]
          movementData.color3 = _loc35_[2]
          movementData.accessories = _loc10_[9]
          movementData.bonusValue = _loc13_
          break
        case '-4': // NPC
          movementData.cell = _loc11_
          movementData.dir = _loc12_
          movementData.sex = _loc10_[7]
          movementData.color1 = _loc10_[8]
          movementData.color2 = _loc10_[9]
          movementData.color3 = _loc10_[10]
          movementData.accessories = _loc10_[11]
          // _loc31_ = this.api.kernel.CharactersManager.createNonPlayableCharacter(_loc14_,Number(_loc15_),movementData);
          break
        case '-5': // "Offline character"
          movementData.cell = _loc11_
          movementData.dir = _loc12_
          movementData.color1 = _loc10_[7]
          movementData.color2 = _loc10_[8]
          movementData.color3 = _loc10_[9]
          movementData.accessories = _loc10_[10]
          movementData.guildName = _loc10_[11]
          movementData.emblem = _loc10_[12]
          movementData.offlineType = _loc10_[13]
          // _loc31_ = this.api.kernel.CharactersManager.createOfflineCharacter(_loc14_,_loc15_,movementData);
          break
        case '-6': // Tax collector
          movementData.cell = _loc11_
          movementData.dir = _loc12_
          movementData.level = _loc10_[7]
          if (isFighting) {
            movementData.LP = _loc10_[8]
            movementData.AP = _loc10_[9]
            movementData.MP = _loc10_[10]
            movementData.resistances = [Number(_loc10_[11]), Number(_loc10_[12]), Number(_loc10_[13]), Number(_loc10_[14]), Number(_loc10_[15]), Number(_loc10_[16]), Number(_loc10_[17])]
            movementData.team = _loc10_[18]
          } else {
            movementData.guildName = _loc10_[8]
            movementData.emblem = _loc10_[9]
          }
          // _loc31_ = this.api.kernel.CharactersManager.createTaxCollector(_loc14_,_loc15_,movementData);
          break
        case '-7':
        case '-8': // Monster of smthing?
          movementData.gfxID = _loc21_
          movementData.cell = _loc11_
          movementData.dir = _loc12_
          movementData.sex = _loc10_[7]
          movementData.powerLevel = _loc10_[8]
          movementData.accessories = _loc10_[9]
          if (isFighting) {
            movementData.LP = _loc10_[10]
            movementData.AP = _loc10_[11]
            movementData.MP = _loc10_[12]
            movementData.team = _loc10_[20]
          } else {
            movementData.emote = _loc10_[10]
            movementData.emoteTimer = _loc10_[11]
            movementData.restrictions = Number(_loc10_[12])
          }
          if (_loc22_ === '-8') {
            movementData.showIsPlayer = true
            let _loc48_ = _loc15_.split('~')
            movementData.monsterID = _loc48_[0]
            movementData.playerName = _loc48_[1]
          } else {
            movementData.showIsPlayer = false
            movementData.monsterID = _loc15_
          }
          // _loc31_ = this.api.kernel.CharactersManager.createMutant(_loc14_,movementData);
          break
        case '-9': // Mount stuff ?
          movementData.cell = _loc11_
          movementData.dir = _loc12_
          movementData.ownerName = _loc10_[7]
          movementData.level = _loc10_[8]
          movementData.modelID = _loc10_[9]
          // _loc31_ = this.api.kernel.CharactersManager.createParkMount(_loc14_,_loc15_ === ''?this.api.lang.getText('NO_NAME'):_loc15_,movementData);
          break
        case '-10': // Alignement stuff ?
          movementData.cell = _loc11_
          movementData.dir = _loc12_
          movementData.level = _loc10_[7]
          // movementData.alignment = new dofus.datacenter.Alignment(Number(_loc10_[9]),Number(_loc10_[8]));
          // _loc31_ = this.api.kernel.CharactersManager.createPrism(_loc14_,_loc15_,movementData);
          break
        default:
          movementData.dir = _loc12_
          movementData.sex = _loc10_[7]

          if (isFighting) {
            movementData.level = _loc10_[8]
            let _loc51_ = _loc10_[9]
            movementData.color1 = _loc10_[10]
            movementData.color2 = _loc10_[11]
            movementData.color3 = _loc10_[12]
            movementData.accessories = _loc10_[13]
            movementData.LP = _loc10_[14]
            movementData.AP = _loc10_[15]
            movementData.MP = _loc10_[16]
            movementData.resistances = [Number(_loc10_[17]), Number(_loc10_[18]), Number(_loc10_[19]), Number(_loc10_[20]), Number(_loc10_[21]), Number(_loc10_[22]), Number(_loc10_[23])]
            movementData.team = _loc10_[24]
            if (_loc10_[25].indexOf(',') !== -1) {
              let _loc53_ = _loc10_[25].split(',')
              let _loc54_ = Number(_loc53_[0])
              let _loc55_ = parseInt(_loc53_[1], 16)
              let _loc56_ = parseInt(_loc53_[2], 16)
              let _loc57_ = parseInt(_loc53_[3], 16)
              if (_loc55_ === -1 || isNaN(_loc55_)) {
                // _loc55_ = this.api.datacenter.Player.color1
              }
              if (_loc56_ === -1 || isNaN(_loc56_)) {
                // _loc56_ = this.api.datacenter.Player.color2
              }
              if (_loc57_ === -1 || isNaN(_loc57_)) {
                // _loc57_ = this.api.datacenter.Player.color3
              }
              if (!isNaN(_loc54_)) {
                let _loc58_ = _loc21_ // new dofus.datacenter.Mount(_loc54_, Number(_loc21_))
                _loc58_.customColor1 = _loc55_
                _loc58_.customColor2 = _loc56_
                _loc58_.customColor3 = _loc57_
                movementData.mount = _loc58_
              }
            } else {
              let _loc59_ = Number(_loc10_[25])
              if (!isNaN(_loc59_)) {
                movementData.mount = _loc21_ // new dofus.datacenter.Mount(_loc59_, Number(_loc21_))
              }
            }
          } else {
            // TODO: could improve this, even if its alreeady nice info
            movementData.playerId = _loc10_[3]
            movementData.playerName = _loc10_[4]
            movementData.cell = _loc10_[0]
            movementData.color1 = _loc10_[9]
            movementData.color2 = _loc10_[10]
            movementData.color3 = _loc10_[11]
            movementData.accessories = _loc10_[12]
            movementData.aura = _loc10_[13]
            movementData.emote = _loc10_[14]
            movementData.emoteTimer = _loc10_[15]
            movementData.guildName = _loc10_[16]
            movementData.emblem = _loc10_[17]
            movementData.restrictions = _loc10_[18]
            if (_loc10_[18].indexOf(',') === -1) {
              let _loc66_ = Number(_loc10_[19])
              if (!isNaN(_loc66_)) {
                movementData.mount = Number(_loc21_) // new dofus.datacenter.Mount(_loc66_, Number(_loc21_))
              }
            }
          }
      }
    }
    return movementData
  })
}

function onTurn (data) {
  let obj = {}
  let turnType = data[0]
  let separatorSplitted = data.substr(1).split('|')
  switch (turnType) {
    case 'S': // Start
      obj.playerId = separatorSplitted[0]
      obj.timeLeft = Math.floor(Number(separatorSplitted[1]) / 1000)
      break
    case 'F': // Finish
      obj.entityId = data[2]
      break
    case 'L': // List
      obj.turns = separatorSplitted
      break
    case 'M': // Middle
      // let data = {}
      let _loc5_ = 0
      while (_loc5_ < separatorSplitted.length) {
        let _loc6_ = separatorSplitted[_loc5_].split(';')
        if (_loc6_.length !== 0) {
          let _loc7_ = _loc6_[0]
          let _loc8_ = _loc6_[1] === '1'
          let _loc9_ = Number(_loc6_[2])
          let _loc10_ = Number(_loc6_[3])
          let _loc11_ = Number(_loc6_[4])
          let _loc14_ = Number(_loc6_[7])
          // data[_loc7_] = true
          if (!_loc8_) {
            obj.LP = _loc9_
            obj.LPmax = _loc14_
            obj.AP = _loc10_
            obj.MP = _loc11_
          }
        }
        _loc5_ = _loc5_ + 1
      }
      break
    case 'R': // Ready
      obj.entityId = data[2]
      break
  }
  return obj
}

function onExchangeCreate (data) {
  let _loc5_ = Number(data[0].substr(1))
  let _loc6_ = data[1]
  // this.api.datacenter.Basics.aks_exchange_echangeType = _loc5_
  let obj = {} // this.api.datacenter.Temporary
  switch (_loc5_) {
    case 0:
    case 4:
      // obj.Shop = new dofus.datacenter.Shop()
      // let _loc8_ = this.api.datacenter.Sprites.getItemAt(_loc6_) // TODO investigae this need HDV NAME !!
      // obj.name = _loc8_.name
      // obj.gfx = _loc8_.gfxID
      break
    case 1:
      break
    case 2:
    case 9:
    case 17:
    case 18:
    case 3:
      if (_loc5_ === 3) {
        data = _loc6_.split(';')
        let _loc10_ = Number(data[0])
        let _loc11_ = Number(data[1])
        if (_loc11_) {
          obj.skillId = _loc11_
          obj.maxItem = _loc10_
        }
      }
      break
    case 5:
      break
    case 8:
      /*
      _loc7_.Storage = new dofus.datacenter.TaxCollectorStorage()
      let _loc12_ = this.api.datacenter.Sprites.getItemAt(_loc6_)
      _loc7_.Storage.name = _loc12_.name
      _loc7_.Storage.gfx = _loc12_.gfxID
      this.api.ui.loadUIComponent('TaxCollectorStorage', 'TaxCollectorStorage', { data: _loc7_.Storage })
      */
      break
    case 6:
      break
    case 10:
      data = _loc6_.split(';')
      let _loc13_ = data[0].split(',')
      obj.quantity1 = Number(_loc13_[0])
      obj.quantity2 = Number(_loc13_[1])
      obj.quantity3 = Number(_loc13_[2])
      obj.types = data[1].split(',')
      obj.tax = Number(data[2])
      obj.maxLevel = Number(data[3])
      obj.maxItemCount = Number(data[4])
      obj.npcID = Number(data[5])
      obj.maxSellTime = Number(data[6])
      break
    case 11:
      data = _loc6_.split(';')
      let _loc14_ = data[0].split(',')
      obj.quantity1 = Number(_loc14_[0])
      obj.quantity2 = Number(_loc14_[1])
      obj.quantity3 = Number(_loc14_[2])
      obj.types = data[1].split(',')
      obj.tax = Number(data[2])
      obj.maxLevel = Number(data[3])
      obj.maxItemCount = Number(data[4])
      obj.npcID = Number(data[5])
      obj.maxSellTime = Number(data[6])
      break
    case 12:
    case 13:
      data = _loc6_.split(';')
      let _loc15_ = Number(data[0])
      let _loc16_ = Number(data[1])
      obj.skillId = _loc16_
      obj.maxItem = _loc15_
      break
    case 14:
      let _loc17_ = []
      let _loc18_ = _loc6_.split(';')
      let _loc19_ = 0
      while (_loc19_ < _loc18_.length) {
        let _loc20_ = Number(_loc18_[_loc19_])
        _loc17_.push({ label: _loc20_, id: _loc20_ })
        _loc19_ = _loc19_ + 1
      }
      obj.jobs = _loc17_
      break
    case 15:
      obj.isMount = true
      break
    case 16:
      let _loc21_ = []
      let _loc22_ = []
      data = _loc6_.split('~')
      let _loc23_ = data[0].split(';')
      let _loc24_ = data[1].split(';')
      if (_loc23_ !== undefined) {
        let _loc25_ = 0
        while (_loc25_ < _loc23_.length) {
          if (_loc23_[_loc25_] !== '') {
            _loc21_.push(_loc23_[_loc25_])
          }
          _loc25_ = _loc25_ + 1
        }
      }
      if (_loc24_ !== undefined) {
        let _loc26_ = 0
        while (_loc26_ < _loc24_.length) {
          if (_loc24_[_loc26_] !== '') {
            _loc22_.push(_loc24_[_loc26_])
          }
          _loc26_ = _loc26_ + 1
        }
      }
      obj.mounts = _loc21_
      obj.parkMounts = _loc22_
  }
  return obj
}

function onExchangeShop (data) {
  let obj = {}
  obj.category = data[0].substr(1) // For example looking bones in ressource shop
  switch (data[0][0]) {
    case 'L': // EHL47|2509;382;2463;407;2451;375;2465;366;383;2336
      obj.itemsId = data[1].split(';') // For example tofu beak, gobball hoof ...
      break
    case 'P':
      // IDK (EHP375|400)
      break
    case 'l': // EHl375|16634526;;500;; // When looking price if single result item (tofu beak ...)
      obj.items = data.splice(1).map(e => {
        let item = {}
        let itemData = e.split(';')
        item.itemId = itemData[0]
        item.stats = parseEffects(itemData[1])
        item.unitPrice = itemData[2]
        item.tenPrice = itemData[3]
        item.hundredPrice = itemData[4]
        return item
      })
      break
  }
  return obj
}

function parseEffects (compressedData) {
  return compressedData.split(',').map(e => {
    let _loc5_ = e.split('#')
    _loc5_[0] = parseInt(_loc5_[0], 16)
    _loc5_[1] = _loc5_[1] !== '0' ? parseInt(_loc5_[1], 16) : undefined
    _loc5_[2] = _loc5_[2] !== '0' ? parseInt(_loc5_[2], 16) : undefined
    _loc5_[3] = _loc5_[3] !== '0' ? parseInt(_loc5_[3], 16) : undefined
    return _loc5_
  })
}

function onAccountStats (data) {
  let i = data[0].split(',')
  let obj = {}
  obj.xp = i[0]
  obj.xpLow = i[1]
  obj.xpHigh = i[2]
  obj.kamas = data[1]
  obj.bonusPoints = data[2]
  obj.bonusPointsSpell = data[3]
  i = data[4].split(',')
  let _loc6_ = 0
  if (i[0].split('').indexOf('~')) {
    let _loc7_ = i[0].split('~')
    obj.haveFakeAlignment = _loc7_[0] !== _loc7_[1]
    i[0] = _loc7_[0]
    _loc6_ = Number(_loc7_[1])
  }
  let _loc8_ = Number(i[0])
  let _loc9_ = Number(i[1])
  obj.alignment = _loc8_// new dofus.datacenter.Alignment(_loc8_, _loc9_)
  obj.fakeAlignment = _loc9_// new dofus.datacenter.Alignment(_loc6_, _loc9_)
  let _loc10_ = Number(i[2])
  let _loc11_ = Number(i[3])
  let _loc12_ = Number(i[4])
  let _loc13_ = i[5] == '1'
  // let _loc14_ = client.rank.disgrace // Whats this
  obj.rank = [_loc10_, _loc11_, _loc12_, _loc13_] // new dofus.datacenter.Rank(_loc10_, _loc11_, _loc12_, _loc13_)
  i = data[5].split(',')
  obj.LP = i[0]
  obj.LPmax = i[1]
  i = data[6].split(',')
  obj.Energy = i[0]
  obj.EnergyMax = i[1]
  obj.Initiative = data[7]
  obj.Discernment = data[8]
  let _loc15_ = []
  let _loc16_ = 3
  while (_loc16_ > -1) {
    _loc15_[_loc16_] = []
    _loc16_ = _loc16_ - 1
  }
  let _loc17_ = 9
  while (_loc17_ < 51) {
    i = data[_loc17_].split(',')
    let _loc18_ = Number(i[0])
    let _loc19_ = Number(i[1])
    let _loc20_ = Number(i[2])
    let _loc21_ = Number(i[3])
    switch (_loc17_) {
      case 9:
        _loc15_[0].push({ id: _loc17_, o: 7, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'Star' })
        if (!obj.isFighting) {
          obj.AP = _loc18_ + _loc19_ + _loc20_
        }
        break
      case 10:
        _loc15_[0].push({ id: _loc17_, o: 8, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconMP' })
        if (!obj.isFighting) {
          obj.MP = _loc18_ + _loc19_ + _loc20_
        }
        break
      case 11:
        _loc15_[0].push({ id: _loc17_, o: 3, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconEarthBonus' })
        obj.Force = _loc18_
        obj.ForceXtra = _loc19_ + _loc20_
        break
      case 12:
        _loc15_[0].push({ id: _loc17_, o: 1, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconVita' })
        obj.Vitality = _loc18_
        obj.VitalityXtra = _loc19_ + _loc20_
        break
      case 13:
        _loc15_[0].push({ id: _loc17_, o: 2, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconWisdom' })
        obj.Wisdom = _loc18_
        obj.WisdomXtra = _loc19_ + _loc20_
        break
      case 14:
        _loc15_[0].push({ id: _loc17_, o: 5, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconWaterBonus' })
        obj.Chance = _loc18_
        obj.ChanceXtra = _loc19_ + _loc20_
        break
      case 15:
        _loc15_[0].push({ id: _loc17_, o: 6, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconAirBonus' })
        obj.Agility = _loc18_
        obj.AgilityXtra = _loc19_ + _loc20_
        obj.AgilityTotal = _loc18_ + _loc19_ + _loc20_ + _loc21_
        break
      case 16:
        _loc15_[0].push({ id: _loc17_, o: 4, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_, p: 'IconFireBonus' })
        obj.Intelligence = _loc18_
        obj.IntelligenceXtra = _loc19_ + _loc20_
        break
      case 17:
        _loc15_[0].push({ id: _loc17_, o: 9, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
        obj.RangeModerator = _loc18_ + _loc19_ + _loc20_
        break
      case 18:
        _loc15_[0].push({ id: _loc17_, o: 10, s: _loc18_, i: _loc19_, d: _loc20_, b: _loc21_ })
        obj.MaxSummonedCreatures = _loc18_ + _loc19_ + _loc20_
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
        obj.CriticalHitBonus = _loc18_ + _loc19_ + _loc20_ + _loc21_
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
  obj.FullStats = _loc15_
  return obj
}

function onAction (data, isFighting, playerId) {
  let _loc3_ = data.indexOf(';')
  data = data.substring(_loc3_ + 1)
  _loc3_ = data.indexOf(';')
  let _loc5_ = Number(data.substring(0, _loc3_))
  let obj = {}
  switch (_loc5_) { // For case list see https://github.com/HydreIO/dofus-protocol-1.29/blob/c9ea6434746e8fb7c16d3b7581d3a21a45ef4db7/src/main/java/fr/aresrpg/dofus/protocol/game/actions/GameActions.java#L18
    case 1:
      let split = data.split(';')
      let compressedCells = split[split.length - 1]
      obj.cells = []
      for (let i = 0; i < compressedCells.length; i += 3) {
        obj.cells.push(uncompressCellId(compressedCells.substr(i + 1, i + 3)))
      }
      break
  }
  return obj
}

function onAccountSelectCharacter (data) {
  let obj = {}
  obj.id = data[1]
  obj.name = data[2]
  obj.stats = parseEffects(data[10])
  return obj
}
module.exports = { onMovement, onTurn, onExchangeCreate, onExchangeShop, onAccountStats, onAction, onAccountSelectCharacter }
