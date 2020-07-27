#!/usr/bin/python3

import os
from datetime import datetime
import ipaddress
import requests
from requests.exceptions import RequestException, HTTPError

import gfwlist


SOURCES = {
    'ipdeny.com': 'http://www.ipdeny.com/ipblocks/data/aggregated/cn-aggregated.zone',
    '17mon': 'https://raw.githubusercontent.com/17mon/china_ip_list/master/china_ip_list.txt',
}
OUT_DIR = "dist"

# Stub content to disable GFWList check
GFWLIST_STUB = "var DOMAINS = {};\nvar BLACKPAT = [];\nvar WHITEPAT = [];\n"


def fetch_and_convert(src):
    response = requests.get(src)
    response.raise_for_status()
    template = "var CHINA = [\n{}\n];\n"
    lines = []
    for iprange in response.text.strip().split("\n"):
        ipnet = ipaddress.IPv4Network(iprange)
        netaddr = int(ipnet.network_address)
        netmask = int(ipnet.netmask)
        s = f"  [0x{netaddr:08X}, 0x{netmask:08X}], // {iprange}"
        lines.append(s)
    lines.append("  [0xFFFFFFFF, 0xFFFFFFFF]  // 255.255.255.255/32")  # use broadcast as a placeholder
    return template.format("\n".join(lines))


def main():
    now = datetime.utcnow()
    date = now.strftime("%Y%m%d")
    with open("code.js", "r") as f:
        code = f.read()
    code = code.replace("@@TIME@@", now.isoformat()[:-7])

    gfwlist_part = gfwlist.generate_pac_partial()
    gfwlist_stub = GFWLIST_STUB

    os.makedirs(OUT_DIR, mode=0o755, exist_ok=True)
    for key in SOURCES:
        print(f"Generating PAC script from source {key}")
        try:
            data = fetch_and_convert(SOURCES[key])
        except RequestException:
            continue
        except HTTPError:
            continue

        filename = f"pac-{key}.txt"
        filename_gfwlist = f"pac-gfwlist-{key}.txt"
        with open(os.path.join(OUT_DIR, filename), "w") as f:
            f.write(code)
            f.write(data)
            f.write("\n")
            f.write(gfwlist_stub)
        with open(os.path.join(OUT_DIR, filename_gfwlist), "w") as f:
            f.write(code)
            f.write(data)
            f.write("\n")
            f.write(gfwlist_part)


if __name__ == '__main__':
    main()
