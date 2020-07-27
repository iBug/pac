#!/usr/bin/python3

import os
import base64
import json
import urllib.parse
import requests


GFWLIST_FILE = "gfwlist.txt"
GFWLIST_URL = 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt'


def get_gfwlist():
    if os.path.isfile(GFWLIST_FILE):
        with open(GFWLIST_FILE, "r") as f:
            text = f.read()
    else:
        r = requests.get(GFWLIST_URL)
        r.raise_for_status()
        text = r.text
    return base64.b64decode(text).decode("utf-8").rstrip("\n")


def update_domains(domains, host, mode=0):
    segments = host.strip(".").split(".")[::-1]

    this = domains
    for segment in segments:
        if segment not in this:
            this[segment] = {}
        this = this[segment]
    this["@"] = mode


def postproc_domains(domains):
    # Turn all {"@": 1} into 1 to save some text
    keys = list(domains.keys())
    for key in keys:
        if key == "@":
            continue
        obj = domains[key]
        if len(obj) == 1 and "@" in obj:
            domains[key] = obj["@"]
        else:
            postproc_domains(obj)


def parse_gfwlist(text):
    domains = {}
    blackpat = []  # blacklisted patterns
    whitepat = []  # whitelisted patterns

    for line in text.splitlines()[1:]:
        if not line.strip() or line.startswith("!"):
            continue  # ignore comments and empty lines

        mode = 0  # default to blacklist
        if line.startswith("@@"):
            mode = 1  # now it's whitelist
            line = line[2:]

        if line.startswith("||"):
            # domain prefix
            update_domains(domains, line[2:], mode)
        elif line.startswith("/"):
            # regex, can't handle yet
            pass
        else:
            # Keyword pattern
            # Single vertical line at either side means string boundary
            if line.startswith("|"):
                line = line[1:]
            else:
                line = "*" + line
            if line.endswith("|"):
                line = line[:-1]
            else:
                line = line + "*"
            if mode == 0:
                blackpat.append(line)
            else:
                whitepat.append(line)
    postproc_domains(domains)
    return domains, blackpat, whitepat


def generate_pac_partial():
    gfwlist = get_gfwlist()
    domains, blackpat, whitepat = parse_gfwlist(gfwlist)
    return "var DOMAINS = {};\n\nvar BLACKPAT = {};\n\nvar WHITEPAT = {};\n".format(
        json.dumps(domains, indent=2),
        json.dumps(blackpat, indent=2),
        json.dumps(whitepat, indent=2),
    )


if __name__ == '__main__':
    print(generate_pac_partial())
