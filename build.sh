#!/bin/sh

SOURCE="http://www.ipdeny.com/ipblocks/data/aggregated/cn-aggregated.zone"

wget -O ip_ranges.txt "$SOURCE"
cat >> ip_ranges.txt <<EOF
10.0.0.0/8
127.0.0.0/16
129.254.0.0/16
172.16.0.0/12
192.168.0.0/16
EOF
python3 ranges_to_js.py > tmp.js
cat code.js tmp.js > out.pac
rm tmp.js
