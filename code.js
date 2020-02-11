// Author: iBug <ibugone.com>
// Time: @@TIME@@

function belongsToSubnet(host, list) {
  var ip = host.split(".").map(Number);
  ip = 0x1000000 * ip[0] + 0x10000 * ip[1] + 0x100 * ip[2] + ip[3];

  if (ip < list[0][0])
    return false;

  // Binary search
  var x = 0, y = list.length, middle;
  while (y - x > 1) {
    middle = Math.floor((x + y) / 2);
    if (list[middle][0] < ip)
      x = middle;
    else
      y = middle;
  }

  // Match
  var masked = ip & list[x][1];
  return (masked ^ list[x][0]) == 0;
}

function isChina(host) {
  return belongsToSubnet(host, CHINA);
}

function isLan(host) {
  return belongsToSubnet(host, LAN);
}

var proxy = "__PROXY__";
var direct = "DIRECT";

function FindProxyForURL(url, host) {
  if (!isResolvable(host)) {
    return proxy;
  }
  var remote = dnsResolve(host);
  if (isLan(remote) || isChina(remote)) {
    return direct;
  }
  return proxy;
}

var LAN = [
  [0x0A000000, 0xFF000000], // 10.0.0.0/8
  [0x64400000, 0xFFC00000], // 100.64.0.0/10
  [0x7F000000, 0xFF000000], // 127.0.0.0/8
  [0xA9FE0000, 0xFFFF0000], // 169.254.0.0/16
  [0xAC100000, 0xFFF00000], // 172.16.0.0/12
  [0xC0A80000, 0xFFFF0000]  // 192.168.0.0/16
];

