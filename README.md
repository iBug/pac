# pac

PAC scripts for proxies

## 使用

访问网页：<https://ibugone.com/project/pac-generator>，可以直接在线生成并下载。

网页版生成器的源代码[在这](https://github.com/iBug/iBug-source/blob/master/_project/pac-generator.md)，依赖于本仓库中的 [`code.js`](code.js) 文件。

如有任何问题，欢迎在 [Issue 列表](https://github.com/iBug/pac/issues)中提出。

## 贡献

本项目包含两部分

1. 从数据源获取 IP 地址列表并转换为 PAC 文件适用的格式，该部分代码在上面链接的生成器源代码中
2. PAC 文件的其他部分（例如解析域名和匹配 IP 地址等），该部分代码位于 [`code.js`](code.js) 文件
