#!/bin/sh

SOURCE="http://www.ipdeny.com/ipblocks/data/aggregated/cn-aggregated.zone"

wget -O ip_ranges.txt "$SOURCE"
python3 ranges_to_js.py > tmp.js
cat code.js tmp.js > out.pac
rm tmp.js
