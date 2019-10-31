const charArray =
[
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
    'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
    'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'
]

function hashPassword (password, key)
{
    let str = "#1"
    for (let i = 0; i < password.length; i++)
    {
        let a = Math.floor(password.charCodeAt(i) / 16)
        let b = password.charCodeAt(i) % 16
        str = str + charArray[(a + key.charCodeAt(i)) % charArray.length] + charArray[(b + key.charCodeAt(i)) % charArray.length]
    }
    return str.toString()
}

function decryptIP(packet)
{
    let ip = ""
    for (let i = 0; i < 8; i += 2)
    {
        let ascii1 = packet[i] - 48
        let ascii2 = packet[i + 1] - 48
        
        if (i != 0) ip.push(".")

        ip.push(((ascii1 & 15) << 4) | (ascii2 & 15))
    }
    return ip.toString()
}

function decryptPort(chars)
{
    /*
    if (chars.Length != 3)
        throw new ArgumentOutOfRangeException("The port must be 3-chars coded.")
    */
    let port = 0
    for (let i = 0; i < 2; i++)
        port += (int)(Math.pow(64, 2 - i) * getHash(chars[i]))

    port += getHash(chars[2])
    return port
}

function getHash(ch)
{
    for (let i = 0; i < caracteres_array.length; i++)
        if (caracteres_array[i] == ch)
            return i

    // throw new IndexOutOfRangeException(ch + " is not in the hash table.");
}

function getCellChar(cellID) {
    return caracteres_array[cellID / 64] + "" + caracteres_array[cellID % 64]
} 

function getCellFromHash(cellHash)
{
    let char1 = cellHash[0], char2 = cellHash[1]
    let code1 = 0, code2 = 0, a = 0

    while (a < caracteres_array.length)
    {
        if (caracteres_array[a] == char1)
            code1 = (short)(a * 64)

        if (caracteres_array[a] == char2)
            code2 = a

        a++
    }
    return (short)(code1 + code2)
}

module.exports = hashPassword