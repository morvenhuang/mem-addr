## 2026.5 更新
这是24年的内容，目前 github 上应该已经有大量更好用的工具项目。


## 简介
除了使用网页版的ChatGPT外，我们也可以通过API来访问。因此可以在你的VPS上进行私人部署，这样有一个好处是，国内使用你的私人部署网站时，可以不翻墙，方便一些无法科学上网的朋友家人访问ChatGPT。GitHub上有不少现成的项目，下面十几个我用过的。

## [chatgpt-demo](https://github.com/anse-app/chatgpt-demo)
0. 这个项目的特点就是界面简介，部署简单。缺点就是无法调整使用gpt模型时候的一些参数，例如每次提问带回去的历史消息条数。另外一个问题是没有用户管理，如果你想把你的网站给多人使用，并想对所有使用者进行一定的管理，那这个项目就不适用了。

1. 通过nvm安转Nodejs，这个在「Docsify on VPS」的文章里介绍过了。

2. 通过以下命令安转：
```bash
# 安装pnpm。npm是Nodejs自带的包依赖管理工具，pnpm类似与npm，优化了依赖管理方式
npm i -g pnpm 

# 从GitHub下载代码，并进入代码目录，执行以下命令安装依赖
pnpm install 
```

3. 找到代码目录下的.env.example，并改名为.env，在该文件中配置API KEY，格式为：OPENAI_API_KEY=sk-xxx...

4. 通过以下命令启动项目，启动后可以通过`http://ip:3000`进行访问。
```bash
pnpm run dev --host
```

5. 由于通过上面的命令启动程序，在意外关闭的情况下，需要手工去重启，为了避免这种情况，可以借助pm2，这是一个用于给程序保活的工具。
```bash
# 进入代码目录，执行下面的命令，就可以启动
pm2 start "pnpm run dev --host"

# 其他一些pm2命令
pm2 list # 列出目前在运行的服务，包括对应的id、名称、状态、运行时长等信息
pm2 restart id号 # 重启该id号对应的服务
pm2 stop id号 # 关闭id号对应的服务
pm2 delete id号 # 删除不需要的服务，这样它就不会再出现在list里了
pm2 log # 查看错误日志。手动查看日志可以看：~/.pm2/logs/
pm2 -h # 查看帮助
```

## [ChatGPT-Next-Web](https://github.com/Yidadaa/ChatGPT-Next-Web) + [chat](https://github.com/libli/chat)
ChatGPT-Next-Web与上面的chatgpt-demo类似，但是可以对请求模型时的一批参数进行设置。而chat项目则是辅助完成用户管理的，主要是可以统计各个用户请求的次数。

先来安装chat，下面以root用户身份为例，首先创建chat目录，并在chat目录下创建两个文件：chat.db和config.yaml，前者就是一个空文件，后者的内容是：
```json
GinPort: 8080
OpenAIKey: "sk-****"
# OpenAIKey:
#   - "sk-****"
#   - "sk-****"
DBName: "chat.db"
InitUsers:
  - Username: user1
    Token: abcd33
  - Username: user2
    Token: bbcdggs
  - Username: user3
    Token: ddcdavas
```

通过docker方式运行chat项目：
```bash
docker run --name=chatapi -d \
  --restart=unless-stopped -p 8080:8080 \
  -v /root/chat/config.yaml:/web/config.yaml \
  -v /root/chat/chat.db:/web/chat.db \
  libli/chat:latest
```

接着，我们同样通过docker运行ChatGPT-Next-Web项目，注意下面的BASE_URL中的vps-ip需要使用公网地址，不能使用127.0.0.1或者localhost。还有OPENAI_API_KEY配置成空字符串即可。这么配置的目的是，将对OpenAI的请求，转到前面的chat项目上，借助chat项目进行用户管理。

另外，这里的`3001：3000`是指将机器的3001端口映射到容器的3000端口（机器的3000端口已经被我用在其他地方了，所以这里我用了3001。如果3001没有被占用，可以直接`3000:3000`）。
```bash
docker run --name=chatgpt -d --restart=unless-stopped \
  -p 3001:3000 \
  -e OPENAI_API_KEY="" \
  -e BASE_URL="http://vps-ip:8080" \
  yidadaa/chatgpt-next-web:latest
```

启动之后，可以通过`http://ip:3001`访问，在页面的左下角点击设置，找到「API key」，这个时候不是填入你的真正的OpenAI的key，而是上面config.yaml文件中的Token，如上面的`abcd33`。其他的配置项可以不动，包括「Endpoint」地址。

由于初始我们只是在config.yaml中配置了3个用户，这三个属于初始用户，后续我们添加用户最好不要在这个文件中添加，而是通过sqlite往chat.db中添加：
```bash
# 如果机器上没有sqlite3，先安装
apt-get install sqlite3

# 打开chat.db
sqlite3 /root/chat/chat.db

>.tables # 列出所有表
>.schema 表名 # 给出表的结构
>insert into users(username, token) values('user4', '113321'); # 注意token中不要包含下划线
>select username, count from users; # 查看每个用户调用API的次数
>.quit

# 在select的时候，如果想要格式化，可以先设置下面两项。需要注意，这种情况下，一些字段的内容可能会被截断
>.headers on
>.mode column
```

### [ChatGPT-Next-Web]更新
1. 拉取最新镜像
```bash
docker pull yidadaa/chatgpt-next-web
```

2. 查看并停止现有容器
```bash
docker ps
docker stop xxx
docker rm xxx(删除该容器，可选)
```

3. 创建新容器（如在第二步中未删除原容器，请在下面面临中的--name参数中提供新的容器名称）
```bash
docker run --name=chatgpt -d --restart=unless-stopped \
  -p 3001:3000 \
  -e OPENAI_API_KEY="" \
  -e BASE_URL="http://vps-ip:8080" \
  yidadaa/chatgpt-next-web:latest
```