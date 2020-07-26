# pac

PAC scripts for proxies

## 使用

获取方式：[本仓库的 Releases](https://github.com/iBug/pac/releases/latest)

每周六 12:00 (UTC) 会自动使用 GitHub Actions 运行[生成脚本](build.py)从数据源获取 IP 地址列表并生成 PAC 文件。

本代码是为 Shadowsocks Windows 4.1.9 及以上版本设计的，若要在旧版本中使用请手动修改一处字符串，详情见 [shadowsocks-windows#2761](https://github.com/shadowsocks/shadowsocks-windows/issues/2761)。

## 贡献

本项目包含两部分

1. 从数据源获取 IP 地址列表并转换为 PAC 文件适用的格式，该部分代码位于 [`build.py`](build.py) 文件
2. PAC 文件的其他部分（例如解析域名和匹配 IP 地址等），该部分代码位于 [`code.js`](code.js) 文件
