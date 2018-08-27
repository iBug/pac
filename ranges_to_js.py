#!/usr/bin/python3

def ip_to_num(s):
    return sum([int(n) * (256 ** int(e)) for e, n in enumerate(s.split(".")[::-1])])

def n_to_mask(n):
    return (2**32 - 1) >> (32 - n) << (32 - n)

def to_upper_hex(n):
    return "{:#010X}".format(n).replace("X", "x")

with open("ip_ranges.txt", "r") as f:
    text = f.read()

lines = [line for line in text.split("\n") if line]
pairs = [p.split("/") for p in lines]
data = [(ip_to_num(s), n_to_mask(int(n))) for s, n in pairs]
data = sorted(data, key=lambda x: x[0])

out = ",\n".join(["  [{}, {}]".format(to_upper_hex(a), to_upper_hex(b)) for a, b in data])
out = "var WHITELIST = [\n" + out + "\n];"

print(out)
