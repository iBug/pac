# pac

![](https://github.com/__REPO__/actions/workflows/build.yml/badge.svg)

PAC scripts for proxies

## 特点

基于 IP 地址白名单设计，位于白名单中的 IP 地址走直连，白名单以外的 IP 地址走代理（暂不支持 IPv6）。

另有 GFWList 版本从 [gfwlist/gfwlist](https://github.com/gfwlist/gfwlist) 获取域名及 URL 列表，优先匹配列表中的黑白名单，有效防止 DNS 污染。

每周六 12:00 (UTC) 会自动使用 GitHub Actions 运行[生成脚本](build.py)从数据源获取 IP 地址列表并生成 PAC 文件。

## 使用

### 方式一：

获取方式：[本仓库的 Releases](https://github.com/iBug/pac/releases/latest)

- `pac-<name>.txt` 包含从数据源 `<name>` 获取的 IP 地址列表（白名单）
- `pac-gfwlist-<name>.txt` 在 IP 白名单的基础上添加了 GFWList 的匹配

本代码是为 Shadowsocks Windows 4.1.9 及以上版本设计的，若要在旧版本或使用其他代理软件中使用，请手动修改文件第 5 行 `__PROXY__` 为你的代理地址，详情见 [shadowsocks-windows#2761](https://github.com/shadowsocks/shadowsocks-windows/issues/2761)。

### 方式二：

在线使用。引用dist目录中的文件的raw链接。或者使用其镜像加速链接（推荐）。如：

Github Raw: https://raw.githubusercontent.com/__REPO__/master/dist/pac-gfwlist-17mon.txt

FastGit: https://raw.fastgit.org/__REPO__/master/dist/pac-gfwlist-17mon.txt

### 方式三：

在自己的github托管使用。

1. fork

2. 修改权限。给action读写权限

3. 添加action变量`PAC_PROXY`。位于 settings > secrets and variables > actions 。值如：SOCKS5 127.0.0.1:7890

这样就有了一个自己随意搞的在线PAC。 

## 贡献

本项目包含两部分

1. 从数据源获取 IP 地址列表并转换为 PAC 文件适用的格式，该部分代码位于 [`build.py`](build.py) 文件
2. PAC 文件的其他部分（例如解析域名和匹配 IP 地址等），该部分代码位于 [`code.js`](code.js) 文件
