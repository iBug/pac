// Author: iBug <ibug.io>
// Source: https://github.com/iBug/pac
// Time: @@TIME@@

var proxy = __PROXY__;
var direct = "DIRECT";

function belongsToSubnet(host, list) {
  var ip = convert_addr(host) >>> 0;

  if (list.length === 0 || ip < list[0][0])
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
  return (masked ^ list[x][0]) === 0;
}

function hasMatchedPattern(text, patterns) {
  for (var i = 0; i < patterns.length; i++) {
    if (shExpMatch(text, patterns[i]))
      return true;
  }
  return false;
}

function checkDomainType(host) {
  // Check if a domain is blacklisted or whitelisted
  var segments = host.split(".").reverse();
  var ptr = DOMAINS;
  var type = DOMAINS["@"];
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    ptr = ptr[segment];
    if (ptr === undefined)
      break;
    if (typeof ptr === "number")
      return ptr;
    if (ptr["@"] !== undefined)
      type = ptr["@"];
  }
  return type;
}

function hasWhitelistedPattern(url) {
  return hasMatchedPattern(url, WHITEPAT);
}

function hasBlacklistedPattern(url) {
  return hasMatchedPattern(url, BLACKPAT);
}

function isChina(host) {
  return belongsToSubnet(host, CHINA);
}

function isLan(host) {
  return belongsToSubnet(host, LAN);
}

function FindProxyForURL(url, host) {
  if (hasWhitelistedPattern(url)) {
    return direct;
  }
  if (hasBlacklistedPattern(url)) {
    return proxy;
  }
  var domainType = checkDomainType(host);
  if (domainType === 0) {
    return proxy;
  } else if (domainType === 1) {
    return direct;
  }

  // Fallback to IP whitelist
  var remote = dnsResolve(host);
  if (!remote || remote.indexOf(":") !== -1) {
    // resolution failed or is IPv6 addr
    return proxy;
  }
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

