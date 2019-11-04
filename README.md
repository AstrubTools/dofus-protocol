
# dofus-protocol

[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/louis030195/dofus-protocol)

Network protocol for dofus : create client and servers for dofus 1.30 (and later 2.x)

## Installation

```bash
npm i
```

### Sniffer

```bash
cd examples/sniffer && npm i
```

## Usage

Yes node-pcap need root

```bash
sudo node examples/sniffer/sniffer.js [network interface(ifconfig)]
```

```bash
node examples/simpleBot.js -u [my_username] -p [my_password] [-d [delay_between_packets] default: 0]
```
