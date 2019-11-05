
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

```bash
sysctl -w net.ipv4.conf.[YOUR_NETWORK_INTERFACE].route_localnet=1
iptables -t nat -I PREROUTING -p tcp -d 190.115.26.126 --dport 887 -j DNAT --to-destination 127.0.0.1:34555
```

Windows

as admin terminal

notepad C:\WINDOWS\SYSTEM32\DRIVERS\ETC\hosts

add

190.115.26.126 127.0.0.1
