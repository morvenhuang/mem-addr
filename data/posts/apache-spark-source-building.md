# tldr
```shell
# 20250716
export MAVEN_OPTS="-Xss64m -Xmx2g -XX:ReservedCodeCacheSize=1g"
export SPARK_PROTOC_EXEC_PATH=/Users/foobar/dev/protoc-4.29.1/protoc
export CONNECT_PLUGIN_EXEC_PATH=/Users/foobar/dev/protoc-gen-grpc-java-1.59.1/protoc-gen-grpc-java
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.0.14.jdk/Contents/Home

./build/mvn  -DskipTests -Puser-defined-protoc -DskipDefaultProtoc clean install
./build/mvn  -DskipTests -Puser-defined-protoc -DskipDefaultProtoc -Dmaven.scaladoc.skip=true -Dscalastyle.skip=true -Dmaven.test.skip=true -Dcheckstyle.skip=true clean install

# 断点续编
./build/mvn -DskipTests -Puser-defined-protoc -DskipDefaultProtoc clean install -rf :spark-protobuf_2.13

# 单独编译
./build/mvn -DskipTests -Puser-defined-protoc -DskipDefaultProtoc clean install -pl :spark-protobuf_2.13

# 单独测试某个、某些 Suite
./build/mvn -pl sql/core -Dtest=none -Dsuites=org.apache.spark.sql.execution.datasources.DataSourceSuite test
./build/mvn -pl sql/core -Dtest=none -Dsuites=org.apache.spark.sql.execution.datasources.DataSource* test
# 单独测试某个、某些模块
./build/mvn -pl sql/api,sql/catalyst test
```

---  

# 源码编译

参见：https://spark.apache.org/docs/3.5.3/building-spark.html

1. 设置 maven 内存参数
```shell
# 每个线程的堆栈大小为 ​​64MB
# JVM 可用的 ​​最大堆内存为 2GB
# 保留 ​​1GB 内存​​供 JIT 编译器存储编译后的本地代码
export MAVEN_OPTS="-Xss64m -Xmx2g -XX:ReservedCodeCacheSize=1g"
```

2. 编译
```shell
# 注意这里用的是 spark 项目中自带的 maven
./build/mvn -DskipTests clean package

# 【【但更建议使用下述 clean install 而不是 clean package】】
# 原因在于，当在编译中途遇到某个 module-a 编译失败，你修复了问题，想要使用 -rf 选项进行“断点续编”时，
# 如果此前使用的是 clean package，那么，如果断点续编开始后的某个项目依赖 module-a 之前的项目，则会提示找不到依赖项，
# 因为 clean package 并没有把每个项目安装到本地 repo 中
./build/mvn -DskipTests clean install

# 更多与 test 相关的选项
# skipTests only skips execution of tests, while maven.test.skip skips both compilation and execution.
./build/mvn clean install -DskipTests -Dmaven.test.skip=true -Dmaven.site.skip=true -Dmaven.javadoc.skip=true

# 编译指定 module，注意 pl 选项后面需要添加一个空格
# pl 选项有多种写法：
# 1） -pl groupId:artifactId
# 2） -pl :artifactId （前提是 artifactId 没有歧义，这时可忽略 groupId）
# 3) -pl module （module 名可以直接在根 pom.xml 中查看）
# 注意区别这里的 artifactId 和 module，例如 “spark-examples_2.13” 是 artifactId，对应的 module 名称是 “examples”
./build/mvn -pl :spark-connect-common_2.13 clean install
./build/mvn -pl sql/core clean install

# -e 表示当错误发生时，打印 trace 信息
# -am 表示“also make”，该参数表示，如果当前 module 依赖于其他 module，则这些 module 也会被 build。
./build/mvn -DskipTests clean install -pl connector/protobuf -e -am


# 可以通过以下命令查看某个 module 的依赖
./build/mvn dependency:tree -pl sql/connect/common


# 断点续编
# 假设在整体编译时，spark-protobuf_2.13 出错了，修改之后，可以使用 rf 选项指示从该处继续编译
# 和 pl 参数类似，rf 参数同样可以使用 artifactId 和 module
./build/mvn -DskipTests -Puser-defined-protoc -DskipDefaultProtoc clean install -rf :spark-protobuf_2.13
./build/mvn -DskipTests -Puser-defined-protoc -DskipDefaultProtoc clean install -rf connector/protobuf

# 测试指定的 Unit Test
# https://spark.apache.org/developer-tools.html#running-individual-tests
# 1）注意这里需要通过 pl 参数指定模块，否则会把所有 module 都编译一遍
# 2）需要使用 -Dtest=none 将 Java 相关的 UT 禁用
# 3）Scala 的 UT 使用的是 scalatest-maven-plugin 插件，具体可参见根 pom.xml，该插件的参数：https://www.scalatest.org/user_guide/using_the_scalatest_maven_plugin
./build/mvn -pl sql/core -Dtest=none -DwildcardSuites=org.apache.spark.sql.execution.datasources.DataSourceSuite test

# 20250718
# scalatest-maven-plugin 2.2.0 亲测，该插件的 wildcardSuites 参数并不接受通配符，如果想要使用通配符，要使用 suites 参数
# 以下命令在 2.2.0 版本下，都是工作的
./build/mvn -pl sql/core -Dtest=none -Dsuites=org.apache.spark.sql.execution.datasources.DataSourceSuite test
./build/mvn -pl sql/core -Dtest=none -Dsuites=org.apache.spark.sql.execution.datasources.DataSource* test

# 另外一下常见参数
# 1） 禁用Scaladoc生成，就是你在控制台看到的类似：“scala:4.9.5:doc-jar (attach-scaladocs) @module-name”，用于生成Scala API文档
​​-Dmaven.scaladoc.skip=true
# 2） 禁用Scala代码规范检查，就是你在控制台看到的类似：“scalastyle:1.0.0:check (default) @module-name”
-Dscalastyle.skip=true
# 3） 禁用Java代码规范检查，就是你在控制台看到的类似：“checkstyle:3.6.0:check (default) @module-name”
-Dcheckstyle.skip=true
# 4） 跳过测试代码jar包生成，就是你在控制台看到的类似：“jar:3.4.2:test-jar (prepare-test-jar) @module-name”
-Dmaven.test.skip=true
```

--  

# 额外项目
为了保持整个项目的简洁，部分代码默认是不作为 module 的。

例如 hive-thriftserver，在 Intellij IDEA 左侧的项目结构树中可以看到它是一个普通的目录图标，而 module 的图标右下角有一个小的正方形蓝色方块。如果你打开 hive-thriftserver 中的代码，会发现，无法用 CMD+B 跳转的某个方法的定义，鼠标悬停也不显示方法的注释。

这些额外的项目是通过项目根 pom.xml 的 profile 来定义：
```xml
<profile>
  <id>hive-thriftserver</id>
  <modules>
    <module>sql/hive-thriftserver</module>
  </modules>
</profile>
```

如果我们想编译这些额外的项目，
```shell
# -P 选项表示启用某个 profile，可以有多个 -P。以下这行命令，会编译所有默认 module，以及 hive-thriftserver
./build/mvn -P hive-thriftserver -DskipTests clean install

# 如果只想编译 hive-thriftserver，可以使用 -pl 选项来指定
./build/mvn -pl :spark-hive-thriftserver_2.13 -P hive-thriftserver -DskipTests clean install

# 虽然我们可以通过 -P 选项在编译的时候启用某个额外的 module。但在 IDEA 中，
# 这个 module 目录仍然还是显示成一个普通的文件夹，除非我们临时把它添加到跟 pom.xml 的 modules 中。
```
  
---  

# IDE 
Spark 源码中的 example 可以直接在 IDEA 中运行：

1. run configuration, modify options, add dependencies with 'provided' scope to classpath
2. run configuration, modify options, add VM options, -Dspark.master=local

补充：File - Project Structure - Project - SDK 选择与你在命令行编译项目时所使用的相同的 Java 版本
（否则可能在调试、或者运行 ut 时遇到：scalac: '17' is not a valid choice for '-release' 等问题）

补充：部分 UT 可能要读取一些系统设置，例如，
ProtobufCatalystDataConversionSuite  
-- test("Handle unsupported input of message type")  
  -- ProtobufTestBase.protobufDescriptorFile  
    -- SparkFunSuite.getWorkspaceFilePath sys.props.contains("spark.test.home")  
这个时候，需要设置的也是 run configuration, VM options "-Dspark.test.home=/Users/foobar/dev/spark"



---  

# 2024.12.25 更新

1. 关于 JDK
变化之一是对 JDK 的要求。由于本机默认设置的 JAVA_HOME 是 1.8 版本的，在编译 spark 时会提示：

```shell
Detected JDK version 1.8.0-301 (JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_301.jdk/Contents/Home/jre) is not in the allowed range [17,).
```

也就是需要 JDK 17 及更高（这 JDK 的版本真是太乱了），下载解压 JDK 17，并在命令行通过 export 进行设置，最好不要修改 .zshrc，目前其他项目的开发还在使用 1.8

```shell
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

2. protobuf 相关编译错误 **protoc did not exit cleanly**
```log
Failed to execute goal org.xolstice.maven.plugins:protobuf-maven-plugin:0.6.1:compile-custom (default) on project spark-connect-common_2.13: protoc did not exit cleanly. Review output for more information.
```

这个错误信息没有信息量，不过往上翻翻，可以看到：
```log
[ERROR] /Users/foobar/dev/spark/sql/connect/common/src/main/protobuf/spark/connect/common.proto [0:0]: dyld: Symbol not found: __ZTTNSt3__118basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE
  Referenced from: /Users/foobar/dev/protoc-gen-grpc-java-1.67.1/protoc-gen-grpc-java (which was built for Mac OS X 12.0)
```

这个很清晰，就是 protoc-gen-grpc-java-1.67.1 插件与我本机操作系统版本（Mac OS X 11）不匹配。我们打开 spark-connect-common_2.13 这个 module 的 pom.xml，可以看到默认走的是“default-protoc”，其中使用的 protoc 的版本是 4.29.1，使用的 protoc-gen-grpc-java 的版本是 1.67.1。

```xml
<profiles>
    <profile>
        <id>default-protoc</id>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        <build>
            <plugins>
                <!-- Add protobuf-maven-plugin and provide ScalaPB as a code generation plugin -->
                <plugin>
                    <groupId>org.xolstice.maven.plugins</groupId>
                    <artifactId>protobuf-maven-plugin</artifactId>
                    <version>0.6.1</version>
                    <configuration>
                        <protocArtifact>com.google.protobuf:protoc:${protobuf.version}:exe:${os.detected.classifier}</protocArtifact>
                        <pluginId>grpc-java</pluginId>
                        <pluginArtifact>io.grpc:protoc-gen-grpc-java:${io.grpc.version}:exe:${os.detected.classifier}</pluginArtifact>
                        <protoSourceRoot>src/main/protobuf</protoSourceRoot>
                    </configuration>
                    <executions>
                        <execution>
                            <goals>
                                <goal>compile</goal>
                                <goal>compile-custom</goal>
                                <goal>test-compile</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
        </build>
    </profile>
    <profile>
        <id>user-defined-protoc</id>
        <properties>
            <spark.protoc.executable.path>${env.SPARK_PROTOC_EXEC_PATH}</spark.protoc.executable.path>
            <connect.plugin.executable.path>${env.CONNECT_PLUGIN_EXEC_PATH}</connect.plugin.executable.path>
        </properties>
        <build>
            <plugins>
                <plugin>
                    <groupId>org.xolstice.maven.plugins</groupId>
                    <artifactId>protobuf-maven-plugin</artifactId>
                    <version>0.6.1</version>
                    <configuration>
                        <protocExecutable>${spark.protoc.executable.path}</protocExecutable>
                        <pluginId>grpc-java</pluginId>
                        <pluginExecutable>${connect.plugin.executable.path}</pluginExecutable>
                        <protoSourceRoot>src/main/protobuf</protoSourceRoot>
                    </configuration>
                    <executions>
                        <execution>
                            <goals>
                                <goal>compile</goal>
                                <goal>compile-custom</goal>
                                <goal>test-compile</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
        </build>
    </profile>
</profiles>
```

现在，需要走“user-defined-protoc”，则需要设置两个环境参数，其中 protoc 的版本尝试沿用 4.29.1，而 protoc-gen-grpc-java 没有找到官方文档，我尝试降低了一下到 1.59.1，编译成功。

```shell
export SPARK_PROTOC_EXEC_PATH=/Users/foobar/dev/protoc-4.29.1/protoc
export CONNECT_PLUGIN_EXEC_PATH=/Users/foobar/dev/protoc-gen-grpc-java-1.59.1/protoc-gen-grpc-java

./build/mvn  -DskipTests -Puser-defined-protoc -DskipDefaultProtoc clean install
```

注意 spark 官方编译教程只提到改第一个环境参数，时间上两个都要改，如果只改第一个，会继续报错：

```log
[ERROR] /Users/foobar/dev/spark/sql/connect/common/src/main/protobuf/spark/connect/commands.proto [0:0]: protoc-gen-grpc-java: program not found or is not executable
Please specify a program using absolute path or make sure the program is available in your PATH system variable
--grpc-java_out: protoc-gen-grpc-java: Plugin failed with status code 1.
```

后续在 spark-protobuf_2.13 模块遇到：
```log
[ERROR] Failed to execute goal com.github.os72:protoc-jar-maven-plugin:3.11.4:run (default) on project spark-protobuf_2.13: Execution default of goal com.github.os72:protoc-jar-maven-plugin:3.11.4:run failed: Cannot read the array length because "<local6>" is null -> [Help 1]    
```

这是一个 bug，参见：[[SPARK-50143][BUILD] Fix protobuf module Maven compilation](https://github.com/apache/spark/pull/48673)，不过该 commit 只修复了一部分，需要把 pom.xml 中 user-defined-protoc 中`<includeStdTypes>true</includeStdTypes>`改为`<includeMavenTypes>direct</includeMavenTypes>`。


3. Enforcer 相关问题
```log
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-enforcer-plugin:3.4.1:enforce (enforce-versions) on project spark-token-provider-kafka-0-10_2.13:
[ERROR] Rule 3: org.codehaus.mojo.extraenforcer.dependencies.EnforceBytecodeVersion failed with message:
[ERROR] IOException while reading /Users/foobar/.m2/repository/org/apache/kafka/kafka-clients/3.9.0/kafka-clients-3.9.0.jar
```

在编译 Apache Spark 时遇到的这个错误与 Maven 的 Enforcer 插件有关，具体是由于 EnforceBytecodeVersion 规则在检查字节码版本时发生了问题。以下是一些可能的解决方案，可以帮助你解决这个问题：
有时候本地缓存的 jar 文件可能损坏。你可以删除本地 Maven 仓库中的相关文件，然后重新构建项目。

删除 `/Users/foobar/.m2/repository/org/apache/kafka/kafka-clients/3.9.0/` 下的所有内容，重新执行，看起来OK了，  
```shell
./build/mvn  -DskipTests -Puser-defined-protoc -DskipDefaultProtoc clean install -rf :spark-token-provider-kafka-0-10_2.13
```


4. Unexpected javac output: 错误: 无效的标记: -proc:full
```log
[INFO] Compiler bridge installed
[INFO] compiling 2 Scala sources and 9 Java sources to /Users/huangmaoyang1/dev/spark/common/tags/target/scala-2.13/classes ...
[WARNING] Unexpected javac output: 错误: 无效的标记: -proc:full
用法: javac <选项> <源文件>
使用 --help 可列出可能的选项.
[WARNING] javac exited with exit code 2

[ERROR] Failed to execute goal net.alchim31.maven:scala-maven-plugin:4.9.5:compile (scala-compile-first) on project spark-tags_2.13: Execution scala-compile-first of goal net.alchim31.maven:scala-maven-plugin:4.9.5:compile failed: org.apache.commons.exec.ExecuteException: Process exited with an error: 255 (Exit value: 255) 
```

参见：https://github.com/apache/spark/pull/51144 评论区

jdk 17.0.9 --> 17.0.14 问题解决 （应该是 17.0.11 就可以了）

Since JDK 23, Annotation Processing is disabled by default. 需要显式使用 javac 的 -proc:full 选项。
后来，为了兼容性，在其他 jdk 版本上也加了 full选项，-proc:full was added over one year ago (April 2024) to Java 11 and Java 17 too. 
（因此，如果使用 jdk 17，需要使用最新的小版本）
