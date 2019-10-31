const hashPassword = require('./hash')
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
//console.log(hashPassword("Trucmach1", "48437472736361727769617866776877617a6f66727261696577786c71626775746a00"))

console.log(hashPassword("Trucmach1", hex2a("48437472736361727769617866776877617a6f66727261696577786c71626775746a00".substring(4))))
console.log("Should be #1545064PMNU4Z96VXKI")