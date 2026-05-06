Docker是在VPS上部署的神器，很多GitHub上的项目都提供Docker方式的部署，使用这种方式部署可以真正实现一键部署。

当我们谈论Docker时，镜像和容器是两个重要的概念。镜像就像是一个软件的打包文件，它包含了运行一个应用程序所需的所有组件，例如代码、运行时环境、库文件和配置等，可以任务镜像就是一个文件。而容器是某个镜像的运行实例，是动态的，可以启动、停止、删除和复制。

另一个概念是「Docker Hub」，这是一个在线的公共镜像仓库，用户可以自由上传、下载镜像，在用户使用docker run命令的时候，如果本地不存在指定的镜像，docker会自动到Docker Hub下载所需的镜像。

可以使用下面的命令在Ubuntu 18上安装Docker：
```bash
sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
sudo apt-get -y update
sudo apt-get install -y  docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker --now
```

2026.3.30 补充：
```bash
$docker compose up -d
Command 'docker' not found, but can be installed with:
sudo snap install docker         # version 28.4.0, or
sudo apt  install docker.io      # version 28.2.2-0ubuntu1~24.04.1
sudo apt  install podman-docker  # version 4.9.3+ds1-1ubuntu0.2

# 注意，通常不要根据推荐的目录进行安装，这样安装的往往不是最新的。


```



常用的一些Docker命令：
```bash
# 通过run命令创建并启动容器，这只是一个示例。大部分的GitHub项目在Docker部署的时候，会给出具体命令
docker run --name=chatapi -d \
  --restart=unless-stopped -p 8080:8080 \
  -v /root/chat/config.yaml:/web/config.yaml \
  -v /root/chat/chat.db:/web/chat.db \
  libli/chat:latest


docker ps # 列出当前运行的容器
docker ps -a # 列出所有容器（包括已被关闭的）
docker stop 容器名称 # 关停容器
docker start 容器名称 # 对于处于关停状态的容器，可以使用此命令重新启动，注意，这个时候不能使用docker run命令，因为这个命令是创建+启动，再次运行的话会导致容器名称的冲突
docker rm 容器名称 # 删除容器
```