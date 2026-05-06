# 前置条件
本机安装了 ClashX，并正常工作。

# 查看端口
ClashX -- 帮助 -- 端口，一般是 7890

# 配置 .zshrc
在 .zshrc 文件中添加如下内容，相当于创建了两个“命令”，`proxy`与`unproxy`
```bash
alias proxy="
    export http_proxy=socks5://127.0.0.1:7890;
    export https_proxy=socks5://127.0.0.1:7890;
    export all_proxy=socks5://127.0.0.1:7890;
    export no_proxy=socks5://127.0.0.1:7890;
    export HTTP_PROXY=socks5://127.0.0.1:7890;
    export HTTPS_PROXY=socks5://127.0.0.1:7890;
    export ALL_PROXY=socks5://127.0.0.1:7890;
    export NO_PROXY=socks5://127.0.0.1:7890;"
alias unproxy="
    unset http_proxy;
    unset https_proxy;
    unset all_proxy;
    unset no_proxy;
    unset HTTP_PROXY;
    unset HTTPS_PROXY;
    unset ALL_PROXY;
    unset NO_PROXY"
```
应用一下 .zshrc
```bash
source .zshrc
```

# 使用示例
```bash

> proxy #启用
> curl ipinfo.io/json #此命令用于获取当前地址信息，用于验证效果
> unproxy #禁用
> curl ipinfo.io/json
```


# 一次性设置
```bash
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890

> echo $http_proxy
http://127.0.0.1:7890
> echo $https_proxy
http://127.0.0.1:7890
> echo $all_proxy
socks5://127.0.0.1:7890

> unset http_proxy https_proxy all_proxy
> echo $http_proxy

> echo $https_proxy

> echo $all_proxy
```