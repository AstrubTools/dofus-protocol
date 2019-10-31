const hashPassword = require('./hash')
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
let key = "ajflhqwkmcghlxadppuyjuimooysxqhn"
console.log('sonlight' + '\n' + hashPassword('bzkl12', key))
console.log("sonlight\n#1NJX0SXY4RP0Z")