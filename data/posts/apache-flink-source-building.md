
`/opt/apache-maven-3.8.6/bin/mvn clean install -DskipTests -Dfast -Pskip-webui-build -T 1C`

```log
[WARNING] Error injecting: org.apache.maven.plugins.checkstyle.CheckstyleViolationCheckMojo
java.lang.UnsupportedClassVersionError: com/puppycrawl/tools/checkstyle/api/AuditListener has been compiled by a more recent version of the Java Runtime (class file version 55.0), this version of the Java Runtime only recognizes class file versions up to 52.0
...
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-checkstyle-plugin:3.3.1:check (validate) on project flink-parent: Execution validate of goal org.apache.maven.plugins:maven-checkstyle-plugin:3.3.1:check failed: An API incompatibility was encountered while executing org.apache.maven.plugins:maven-checkstyle-plugin:3.3.1:check: java.lang.UnsupportedClassVersionError: com/puppycrawl/tools/checkstyle/api/AuditListener has been compiled by a more recent version of the Java Runtime (class file version 55.0), this version of the Java Runtime only recognizes class file versions up to 52.0
```

`export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.0.15.jdk/Contents/Home` rerun:  

```log
[ERROR] Failed to execute goal on project flink-statebackend-forst: Could not resolve dependencies for project org.apache.flink:flink-statebackend-forst:jar:2.0-SNAPSHOT: Could not transfer artifact com.ververica:forstjni:jar:0.1.4-beta from/to central (https://artifactory.jd.com/libs-releases): transfer failed for https://artifactory.jd.com/libs-releases/com/ververica/forstjni/0.1.4-beta/forstjni-0.1.4-beta.jar, status: 504 Gateway Time-out ->
```


`/opt/apache-maven-3.8.6/bin/mvn clean install -DskipTests -Dfast -Pskip-webui-build -T 1C -U` 

-U 参数是 Maven 提供的一个命令行选项，它的全名是 --update-snapshots。当你运行 Maven 构建时，使用 -U 参数会强制 Maven 更新所有快照（SNAPSHOT）依赖项和插件。通常情况下，Maven 只有在本地仓库中没有找到相应的 SNAPSHOT 版本，或者自上次下载以来已经过了 24 小时，才会检查更新 SNAPSHOT 依赖项。而使用 -U 参数可以立即强制 Maven 检查并下载最新的 SNAPSHOT 版本，即使距离上次更新不到 24 小时。


2025.06.13 更新：  
需要使用 jdk 17，  
`export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home`  

否则会有如下错误：  
```log
[INFO] --- maven-enforcer-plugin:3.1.0:enforce (enforce-maven) @ flink-parent ---
[ERROR] Rule 1: org.apache.maven.plugins.enforcer.RequireJavaVersion failed with message:
Detected JDK Version: 11.0.15 is not in the allowed range 17.
```


2025.06.13 更新：  
`/opt/apache-maven-3.8.6/bin/mvn clean install -DskipTests` 耗时1小时左右。


# IDEA

Preferences -- Build -- Build Tools -- Maven 设置路径指向 3.8.6

项目右键 - Open Module Settings - 左侧选 project - 可以设置项目的 sdk，这里选择 jdk 11

