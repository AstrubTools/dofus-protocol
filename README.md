
# dofus-protocol

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/AstrubTools/dofus-protocol)
[![NPM version](https://img.shields.io/npm/v/dofus-protocol.svg)](http://npmjs.com/package/dofus-protocol)
[![Build Status](https://img.shields.io/circleci/project/AstrubTools/dofus-protocol/master.svg)](https://circleci.com/gh/AstrubTools/dofus-protocol)

Network protocol for dofus : create client and servers for dofus 1.30

**Not recommended to use on official servers right now, prefer debugging on [amakna private server](https://amakna.net) or other 1.29 / 1.30 private server**

## Installation

```bash
npm i
```

### Sniffer

**Linux / MacOS only**

```bash
cd examples/sniffer && npm i
```

## Usage

### Sniffer

Yes node-pcap need root

```bash
sudo node examples/sniffer/sniffer.js [network interface(ifconfig)]
```

### Bot

```bash
node examples/simpleBot.js -u [my_username] -p [my_password] [-d [delay_between_packets] default: 0]
```

### Proxy

Add IP table rule

```bash
sysctl -w net.ipv4.conf.[YOUR_NETWORK_INTERFACE].route_localnet=1
sudo iptables -t nat -A OUTPUT -p tcp --dport 887 -d 190.115.26.127 -j DNAT --to-destination 127.0.0.1:34555
```

Remove all non default IP table rule

```bash
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
sudo iptables -t nat -F
sudo iptables -t mangle -F
sudo iptables -F
sudo iptables -X
```

# Protodef custom types

Many custom types have been implemented due to the fact dofus protocol is textual ...

- restBuffer: (based on [node-minecraft-protocol implementation](https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/src/datatypes/minecraft.js))
- restString: everything until the end of the packet
- su8: string -> u8
- su16: string -> u16
- su32: string -> u32
- su64: string -> u64
- scontainer: container with separator (for example "|" or ",")
- cryptedIp: dofus encryption implementation
- cryptedPort: same for port
- restToSeparator: everything until separator specified
- sArray: like in every language split function ("haha;hoho;hihi".split(";") = ["haha", "hoho", "hihi"])

see usage in data.json it's better to understand
