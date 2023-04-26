// Author: iBug <ibug.io>
// Source: https://github.com/iBug/pac
// Time: @@TIME@@

var proxy = __PROXY__;
var direct = "DIRECT";

// lower: lower_index
// upper: (upper_index + 1) / (array_length if upper_index = last)
function binarySearch(list, num, lower, upper) {
  var x = lower, y = upper, middle;
  while (y - x > 1) {
    middle = Math.floor((x + y) / 2);
    if (list[middle][0] > num)
      y = middle;
    else
      x = middle;
  }
  return x;
}

function fixLength(text) {
  if (text.length == 1) return "000" + text;
  if (text.length == 2) return "00" + text;
  if (text.length == 3) return "0" + text;
  return text;
}

function convertToInt(high, low) {
  if (low.length != 4) 
    return parseInt(high + fixLength(low), 16);
  return parseInt(high + low, 16);
}

function isInNet6(parts, list, list2) {
  var num = convertToInt(parts[0], parts[1]);
  var x = binarySearch(list, num, 0, list.length);
  
  if (list[x][1] == -1) 
    return ((num & list[x][2]) === list[x][0]);
  
  // not in net (/33 - /64)
  if (num !== list[x][0]) 
    return false;
  
  var num2 = convertToInt(parts[2], parts[3]);
  var x2 = binarySearch(list2, num2, list[x][1], list[x][2] + 1);
  
  return ((num2 & list2[x2][1]) === list2[x2][0]);
}

function isLanOrChina6(host) {
  if (host.indexOf("::") === -1) {
    var groups = host.split(":");
    if (groups.length != 8)
      return false; // invalid ipv6 format
    return isInNet6(groups, CHINA6_F, CHINA6_S) || isInNet6(groups, LAN6_F, LAN6_S);
  }
  
  var halfs = host.split("::");
  var left = halfs[0];
  var right = halfs[1];
  if (left.length < 1) left = "0000";
  if (right.length < 1) right = "0000";
  
  var groups1 = left.split(":");
  if (groups1.length > 3)
    return isInNet6(groups1, CHINA6_F, CHINA6_S) || isInNet6(groups1, LAN6_F, LAN6_S);
  
  var groups2 = right.split(":");
  var zeros = 8 - (groups1.length + groups2.length);
  if (zeros < 2)
    return false; // invalid ipv6 format
  
  var parts = ["0", "0", "0", "0"];
  parts[0] = groups1[0];
  var i = 1;
  for (var j = 1; j < groups1.length; j++) {
    parts[i] = groups1[j];
    i = i + 1;
    if (i == 4) break;
  }
  
  if (i < 4) {
    for (var k = 0; k < zeros; k++) {
      parts[i] = "0000";
      i = i + 1;
      if (i == 4) break;
    }
  }
  if (i == 3) parts[3] = groups2[0];
  
  return isInNet6(parts, CHINA6_F, CHINA6_S) || isInNet6(parts, LAN6_F, LAN6_S);
}

function belongsToSubnet(host, list) {
  var ip = convert_addr(host) >>> 0;

  if (list.length === 0 || ip < list[0][0])
    return false;

  // Binary search
  var x = 0, y = list.length, middle;
  while (y - x > 1) {
    middle = Math.floor((x + y) / 2);
    if (list[middle][0] <= ip)
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
  
  // if host is IPv6
  if (host.indexOf(":") !== -1) {
    if (isLanOrChina6(host)) {
      return direct;
    }
    return proxy;
  }
  
  // default resolve IPv4
  // var remote = dnsResolve(host);
  // if (!remote) {
  //   // resolution failed
  //   return proxy;
  // }

  // method for IPv6
  var ips = dnsResolveEx(host);
  if (!ips) 
    return proxy;
  var remote = ips.split(";")[0];
  if (remote.indexOf(":") !== -1) {
    if (isLanOrChina6(remote)) {
      return direct;
    }
    return proxy;
  }
  
  if (isLan(remote) || isChina(remote)) {
    return direct;
  }
  return proxy;
}

var LAN = [
  [0x00000000, 0xFFFFFFFF], // 0.0.0.0/32
  [0x0A000000, 0xFF000000], // 10.0.0.0/8
  [0x64400000, 0xFFC00000], // 100.64.0.0/10
  [0x7F000000, 0xFF000000], // 127.0.0.0/8
  [0xA9FE0000, 0xFFFF0000], // 169.254.0.0/16
  [0xAC100000, 0xFFF00000], // 172.16.0.0/12
  [0xC0A80000, 0xFFFF0000]  // 192.168.0.0/16
];

// not support /65 - /128
var LAN6_F = [
  [0x00000000, 0, 0],           // ::/64
  [0x0064FF9B, 1, 2],           // 64:ff9b:
  [0x01000000, 3, 3],           // 100::/64
  [0x20010000, -1, 0xFFFFFFFF], // 2001::/32 - teredo, may remove
  [0xFC000000, -1, 0xFE000000], // fc00::/7
  [0xFE800000, -1, 0xFFC00000], // fe80::/10
  [0xFF000000, -1, 0xFF000000]  // ff00::/8
];

var LAN6_S = [
  [0x00000000, 0xFFFFFFFF], // 0, ::/64 - catch {::, ::1, ::ffff:0:0/96, ::ffff:0:0:0/96}, may remove
  [0x00000000, 0xFFFFFFFF], // 1, 64:ff9b::/64 - catch {64:ff9b::/96, NAT64}, may remove
  [0x00010000, 0xFFFF0000], // 2, 64:ff9b:1::/48 - NAT64, may remove
  [0x00000000, 0xFFFFFFFF]  // 3, 100::/64
];

