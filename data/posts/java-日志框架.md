# 简述

对于日志框架，可以按照「分层」的概念来理解：接口层、实现层。开发者在使用日志框架时，建议基于接口层而非实现层进行开发，这样的好处是，避免项目与某一个具体日志框架耦合，这是一个常见的编程理念，应该比较容易理解。

例如，项目最初使用SLF4J作为接口层，使用Logback作为实现层，而你的项目代码中使用的也是接口层的类org.slf4j.Logger，这种情况下，当将来你想将实现层切换为Log4j时，你最需要改动依赖项，而不需要改动代码。

但是，如果你最初的项目代码中使用的并非是接口层的类，而是实现层（即Logback）的类ch.qos.logback.classic.Logger，这种情况下，想要切换实现层，就需要改动所有涉及使用到这个类的代码。

补充：
- Log4j2 has been the default logger since Flink 1.11
  - 经查看，Flink 1.14 核心依赖中包含 slf4j-api 1.7.15，但不自带 log4j-slf4j-impl 桥接器。
- Since Spark 3.3, Spark migrates its log4j dependency from 1.x to 2.x
  - 经查看 Spark 3.4.4 自带各种版本 slf4j-api (1.7.x, 2.0.x), 还自带了一个 log4j-slf4j2-impl 2.19.0，注意是 log4j-slf4j2-impl，不是 log4j-slf4j-impl，前者是是 Log4j 2 为适配 SLF4J 2.x 推出的官方桥接组件。即 log4j-slf4j-impl: bridge for (slf4j 1.x -- log4j 2); log4j-slf4j2-impl: bridge for (slf4j 2.x -- log4j 2); 如果项目使用的是 slf4j 1.x 版本，是无法使用 log4j-slf4j2-impl 的。


<br><br>

# SLF4J + Logback
（注：对于JDK 8的用户来说，需要注意，最新的Logback 1.4.x要求JDK 11。）

## 依赖设置
由于logback-classic中既有实现层，也包含了对接口层SLF4J的依赖，因此，最简单的设置可以是这样的：
```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.12</version>
    <scope>runtime</scope>
</dependency>
```

不过，就像简述里说的，为了避免开发者不小心误用实现类ch.qos.logback.classic.Logger，我更推荐使用如下的依赖设置：
```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.32</version>
</dependency>
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.12</version>
    <scope>runtime</scope>
    <exclusions>
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

## 配置文件(logback.xml)
（注：实现层使用什么框架，则使用对应的配置文件）

这里给出一个最常见的配置文件，包含控制台输出、滚动文件输出：
```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%t] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="ROLLING_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/app.log</file>

        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/app-%d{yyyy-MM-dd-HH}-%i.log</fileNamePattern>
            <!-- 单个日志文件超过10M，则进行滚动，对文件进行递增编号(即%i) -->
            <maxFileSize>10MB</maxFileSize>
            <!-- 所有日志文件的大小限制，超出则删除旧文件 -->
            <totalSizeCap>5GB</totalSizeCap>
            <!-- 与fileNamePattern相结合，本例中由于时间粒度是小时，因此这里表示保存48个小时 -->
            <maxHistory>48</maxHistory>
        </rollingPolicy>

        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%t] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="ROLLING_FILE" />
    </root>
</configuration>
```

## 代码示例
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
...
private static final Logger logger = LoggerFactory.getLogger(App.class);
...
logger.warn("First name: {}, last name: {}", firstName, lastName);
```

<br><br>





# SLF4J + Log4j

## 依赖设置
由于log4j-slf4j-impl中既有实现层，也包含了对接口层SLF4J的依赖，因此，最简单的设置可以是这样的：
```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.20.0</version>
</dependency>
```

但是，基于与上一节同样的逻辑，更推荐使用下面的设置：
```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.25</version>
</dependency>
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.20.0</version>
    <scope>runtime</scope>
    <exclusions>
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

补充：除了`log4j-slf4j-impl`，其实还有一个`slf4j-log4j12`，不过后者用于log4j 1，例如 Hadoop 2 中就在使用 log4j 1，因此需要依赖`slf4j-log4j12`。

1. slf4j-log4j12 将日志委托给 Log4j 1.x 处理，而 log4j-slf4j-impl 将日志委托给 Log4j 2.x 处理。
2. slf4j-log4j12 需要 Log4j 1.x 的配置文件，而 log4j-slf4j-impl 需要 Log4j 2.x 的配置文件。
3. slf4j-log4j12 这是一个很糟糕的名称，让人以为它同时支持 log4j 和 log4j2，实际上，这个名称里的 log4j12 是指 log4j 1.2。log4j 日志框架的提出比 slf4j 早得多，它们的作者是同一个人，当 slf4j 接口层被提出时（2005年，为了日志框架的解耦），log4j 已经发展到 1.2 版本了。

## 配置文件(log4j2.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO"> <!-- log4j internal log level -->
    <Appenders>
        <Console name="CONSOLE" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>

        <RollingFile name="ROLLING_FILE"
                     fileName="logs/log4j2/roll-by-time-and-size/app.log"
                     filePattern="logs/log4j2/roll-by-time-and-size/app-%d{yyyy-MM-dd-HH}-%i.log"
                     ignoreExceptions="false">
            <PatternLayout>
                <Pattern>%d{yyyy-MM-dd HH:mm:ss} [%t] %-5level %logger{36} - %msg%n</Pattern>
            </PatternLayout>
            <Policies>
                <!-- 启动时，会删除多余的日志文件 -->
                <OnStartupTriggeringPolicy/>
                <!-- 自动感知filePattern中的时间设置，本例中是按小时粒度进行滚动 -->
                <TimeBasedTriggeringPolicy/>
                <!-- 单个日志文件超过10M，则进行滚动，递增编号（即filePattern中的%i） -->
                <SizeBasedTriggeringPolicy size="10M"/>
            </Policies>
            <!-- max配置与上面的filePattern结合，由于本例中是按小时粒度进行滚动，因此这里表示每小时内最多产生五个编号文件，超出这循环覆盖，如不设置max，则默认为7 -->
            <DefaultRolloverStrategy max="5">
                <Delete basePath="logs" maxDepth="1">
                    <!-- 最近30天，最多5GB的日志 -->
                    <IfFileName glob="app-*.log">
                        <IfAny>
                            <IfLastModified age="30d"/>
                            <IfAccumulatedFileSize exceeds="5GB"/>
                        </IfAny>
                    </IfFileName>
                </Delete>
            </DefaultRolloverStrategy>
        </RollingFile>

    </Appenders>
    <Loggers>
        <Root level="warn">
            <AppenderRef ref="CONSOLE"/>
            <AppenderRef ref="ROLLING_FILE"/>
        </Root>
    </Loggers>
</Configuration>
```

## 配置文件 - 精简版(log4j2.xml，已实际验证)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN" monitorInterval="30">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
    </Appenders>

    <Loggers>
        <Logger name="org.apache.http" level="info" additivity="false">
            <AppenderRef ref="Console"/>
        </Logger>

        <Root level="info">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

## 补充：log4j 1配置文件(已验证)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE log4j:configuration SYSTEM "log4j.dtd">

<log4j:configuration xmlns:log4j="http://jakarta.apache.org/log4j/">
    <appender name="consoleAppender" class="org.apache.log4j.ConsoleAppender">
        <param name="Target" value="System.out"/>
        <layout class="org.apache.log4j.PatternLayout">
            <param name="ConversionPattern" value="%d{ABSOLUTE} %5p %c{1}:%L - %m%n"/>
        </layout>
    </appender>

    <root>
        <priority value="info"/>
        <appender-ref ref="consoleAppender"/>
    </root>
</log4j:configuration>
```

## 代码示例
由于与上例相同，都是基于SLF4J接口层，因此使用方式相同：
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
...
private static final Logger logger = LoggerFactory.getLogger(App.class);
...
logger.warn("First name: {}, last name: {}", firstName, lastName);
```

<br><br>


# 单独使用Log4j
一般我们会基于SLF4J接口层进行开发，但是如果你硬要单独使用Log4j，也不是不可以。

## 依赖配置
最简单的，我们可以使用以下配置：
```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.20.0</version>
</dependency>
```

不过，由于Log4j自身也分了接口层和实现层，推荐使用如下配置：
```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>2.20.0</version>
</dependency>
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.20.0</version>
    <scope>runtime</scope>
    <exclusions>
        <exclusion>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

## 配置文件(log4j2.xml)
（同上）

## 代码示例
```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
...
// 注意，此处是「LogManager」，不同于SLF4J中的「LoggerFactory」，当然，我更喜欢后者的取名
private static final Logger logger = LogManager.getLogger(App.class);
...
logger.warn("First name: {}, last name: {}", firstName, lastName);
```

有人可能会说，Log4j自身拆成了接口层和实现层有什么意义，难道使用Log4j接口层的情况下，实现层还能使用别的日志系统吗？实际上是可以的，例如，可以使用「Log4j接口层 + Logback」的搭配：
```xml
<!-- 1） Log4j接口层 -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>2.20.0</version>
</dependency>
<!-- 2） Log4j项目提供的「桥接层」，将Log4j接口层桥接到SLF4J接口层，由于Logback是基于SLF4J，因此经过桥接之后，就可以使用Logback作为实现层 -->
<!-- 注：log4j-to-slf4j含有对log4j-api的依赖，因此上面可以不用单独列出log4j-api依赖，不过，为了逻辑清晰，还是保留 -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-to-slf4j</artifactId>
    <version>2.20.0</version>
</dependency>
<!-- 3） Logback实现层 -->
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.12</version>
    <scope>runtime</scope>
</dependency>
```

<br><br>

# 其他
## JUL
java.util.logging (JUL) was a logging system of the Java Development Kit (JDK) since JDK 1.4. 


## JCL
Apache Commons Logging (JCL), previously called Jakarta Commons Logging, is a common logging API provided by Apache. 
(Last Published: 09 July 2014|Version: 1.2)
