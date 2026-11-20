# 多 module 项目的依赖版本管理
最直观的方法就是在根 pom 中指定 properties，例如：`<protobuf.version>3.25.5</protobuf.version>`，然后在子 module 中，`${protobuf.version}`。
但是，这种方法在工业级软件项目中，有时候会出现子模块无法正常解析的情况，例如在多级依赖中：module a 依赖 protobuf，module b 依赖 module a，某些情况下会出现 module b 无法正常编译，提示：`Failed to read artifact descriptor for com.google.protobuf:protobuf-java:jar:${protobuf.version}`。实际上就是 `protobuf.version` 这个 properties 无法被正常解析。

工业级项目中的标准做法，是使用`dependencyManagement`，即先在根 pom 中这样定义：
```xml
<properties>
    <protobuf.version>3.25.5</protobuf.version>
    <chill.version>0.7.6</chill.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>${protobuf.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- 以下不是此章节讨论内容： -->
<!-- 如果要进行 exclusion，可以在根 pom 中进行，则表示所有 module 在使用该依赖时，都需要进行此 exclusion。 -->
<!-- 如果不同 module 有不同的 exclusion 策略，则在 module 级别进行 exclusion -->
<dependency>
    <groupId>com.twitter</groupId>
    <artifactId>chill-protobuf</artifactId>
    <version>${chill.version}</version>
    <exclusions>
        <exclusion>
            <groupId>com.esotericsoftware.kryo</groupId>
            <artifactId>kryo</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

在子 module 中如下设置，注意这里已经不需要指定版本号：
```xml
<dependency>
    <groupId>com.google.protobuf</groupId>
    <artifactId>protobuf-java</artifactId>
</dependency>
```

解释一下：`dependencyManagement`是“声明约定”。它只定义版本号，不引入 Jar 包。只有当子模块在自己的 <dependencies> 中显式声明了该依赖（但不写版本号）时，才会触发引用。






# maven-shade-plugin
在Java的Maven项目中，"shade"指的是一个特定的操作，它是由`maven-shade-plugin`插件提供的功能。这个插件能够创建一个包含了项目所有依赖的"uber-jar"（或称为"fat-jar"），这个过程通常被称为"shading"。

Shading的过程实际上是将多个jar文件合并成一个jar文件的过程，这在部署和分发Java应用程序时非常有用，因为它简化了依赖管理。你不需要担心在运行环境中设置类路径或者解决依赖冲突，因为所有必需的类文件都已经包含在了单个jar文件中。

除了合并类文件外，`maven-shade-plugin`还提供了以下功能：

1. **重定位类**：插件可以修改包路径，这有助于解决依赖冲突。例如，如果你的项目依赖两个包含相同类名但不同版本的jar文件，你可以使用`maven-shade-plugin`来重命名这些类的包路径，这样它们就不会在运行时冲突。

2. **最小化jar**：插件可以删除不必要的文件，以减小最终jar文件的大小。

3. **资源转换**：插件可以处理资源文件的合并问题，比如多个jar文件中包含相同路径的资源文件需要合并的情况。

4. **服务提供者转换**：插件可以处理服务提供者配置文件（位于`META-INF/services`目录下）的合并。

"Shading"这个术语源于这样一个比喻：就像阳光下的物体会投下阴影一样，原始的类被"遮蔽"或"覆盖"了，因为它们被打包进了一个大的jar文件中，并且在必要时它们的包路径也被修改了。这样做的目的是为了避免类路径上的冲突，并确保你的应用程序可以作为一个独立的单元运行，不受外部库版本变化的影响。









# maven-compiler-plugin
`maven-shade-plugin` 和 `maven-compiler-plugin` 是两个独立的 Maven 插件，它们各自有不同的职责，但在构建过程中它们通常会一起使用，尽管它们不是互相依赖的。

- **`maven-compiler-plugin`** 负责编译项目的源代码。它将 `.java` 文件编译成 `.class` 文件，这是构建 Java 项目的基本步骤。

- **`maven-shade-plugin`** 则通常用在打包阶段，负责创建包含所有依赖的 uber-jar。它通常在 `maven-compiler-plugin` 执行之后运行，因为它需要编译后的 `.class` 文件来创建最终的 jar。

在 Maven 的生命周期中，这两个插件在不同的阶段起作用：

1. **编译阶段（compile phase）**：`maven-compiler-plugin` 在这个阶段运行，编译源代码。

2. **打包阶段（package phase）**：在所有的 `.class` 文件和资源文件都已准备好之后，`maven-shade-plugin` 会在这个阶段运行，将这些文件打包成一个 uber-jar。

在 `pom.xml` 文件中，这两个插件的配置可能看起来像这样：

```xml
<build>
    <plugins>
        <!-- Compiler plugin configuration -->
        <plugin>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version> <!-- Use the appropriate version -->
            <configuration>
                <source>1.8</source> <!-- Or whatever source version you use -->
                <target>1.8</target> <!-- Or whatever target version you use -->
            </configuration>
        </plugin>

        <!-- Shade plugin configuration -->
        <plugin>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.2.4</version> <!-- Use the appropriate version -->
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                    <configuration>
                        <!-- Shade plugin configurations go here -->
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

在实际的项目中，确保 `maven-compiler-plugin` 在 `maven-shade-plugin` 之前执行是重要的，因为你需要先编译代码，然后才能打包所有的类和资源。Maven 的生命周期会自动处理这个顺序，所以你通常不需要担心这些插件的执行顺序。







# maven使用的默认插件
如果一个 Maven 项目的 `pom.xml` 中没有配置任何插件，Maven 仍然会按照默认的构建生命周期来执行任务。Maven 有一套默认的插件绑定，这些插件绑定到了生命周期的不同阶段，这意味着即使你没有明确配置插件，Maven 也会使用它的默认配置来执行构建。

对于一个标准的 Java 项目，以下是 Maven 默认的一些插件和它们对应的生命周期阶段：

- **编译（compile）阶段**：Maven 会使用 `maven-compiler-plugin` 来编译项目的主源代码（默认是 `src/main/java` 目录下的代码）。即使 `pom.xml` 中没有明确配置，Maven 也会使用这个插件的默认版本和配置来编译代码。

- **测试编译（test-compile）阶段**：Maven 会使用 `maven-compiler-plugin` 来编译项目的测试源代码（默认是 `src/test/java` 目录下的代码）。

- **测试（test）阶段**：Maven 会使用 `maven-surefire-plugin` 来运行单元测试。

- **打包（package）阶段**：对于 jar 项目，Maven 会使用 `maven-jar-plugin` 来打包编译后的代码和资源到一个 jar 文件中。对于 war 项目，它会使用 `maven-war-plugin` 来打包。

如果你没有在 `pom.xml` 中指定插件的版本，Maven 会使用每个插件的默认版本。这可能不是最佳实践，因为随着时间的推移，插件的新版本可能会修复旧版本的错误或提供新的功能。因此，即使 Maven 可以使用默认的插件和配置，最好还是在 `pom.xml` 文件中明确指定你依赖的插件和它们的版本，以便你有更好的控制和对构建过程的理解。

总结一下，即便没有配置任何插件，Maven 会使用一套默认的插件和绑定来执行标准的构建任务，包括编译、测试和打包你的应用程序。

（如果项目为指定相关插件，通过在项目目录下执行`mvn help:effective-pom`，可以看到各个生命周期默认使用的插件的名称和版本）







# 多 module 依赖中的排除问题
module A 的pom中有 x, y, z 这三个依赖，打包使用 shade 插件，生成fat jar。同一个项目中，module B 依赖于 module A，但并不需要对y，z的依赖，对B打包的时候，可以排除这两个吗？
使用类似如下的配置是不行的，因为使用 shade 打包的时候，是直接将依赖打入到 module A 的 jar 文件中，而不是通过依赖链条。
```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>module-A</artifactId>
    <version>1.0.0</version>
    <exclusions>
        <exclusion>
            <groupId>y-group</groupId>
            <artifactId>y</artifactId>
        </exclusion>
        <exclusion>
            <groupId>z-group</groupId>
            <artifactId>z</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

需要区分号定位，fat jar 通常是用于独立可执行的情况。同一项目，模块间的依赖，**通常不应该依赖 fat jar**。

但是，如果 module A 既需要独立可执行，而又被其他模块所依赖，那么应该这么做？

这个时候，需要配置 fat jar 的名称，而不是使用默认名称：
```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.2.4</version>
            <configuration>
                <createDependencyReducedPom>false</createDependencyReducedPom>
                <transformers>
                    <transformer
                            implementation="org.apache.maven.plugins.shade.resource.ApacheLicenseResourceTransformer">
                    </transformer>
                </transformers>
                <!-- to avoid error "Invalid signature file digest for Manifest main attributes" -->
                <filters>
                    <filter>
                        <artifact>*:*</artifact>
                        <excludes>
                            <exclude>META-INF/*.SF</exclude>
                            <exclude>META-INF/*.DSA</exclude>
                            <exclude>META-INF/*.RSA</exclude>
                        </excludes>
                    </filter>
                </filters>
            </configuration>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                    <configuration>
                        <shadedArtifactAttached>true</shadedArtifactAttached>
                        <shadedClassifierName>fat</shadedClassifierName>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```
在 shade plugin 的 executions 下，配置 shadedArtifactAttached 和 shadedClassifierName。这样，就可以生成两个 jar 文件:
module-A-1.0.0.jar（普通 JAR）
module-A-1.0.0-fat.jar（包含所有依赖的 fat JAR） 

shadedArtifactAttached作用：决定 shading 后的 JAR（即 fat JAR）是否作为一个附加 artifact 附加到当前模块的主 artifact 上，而不是替换主 artifact。
shadedClassifierName作用：为生成的 shaded JAR（fat JAR）指定分类器（classifier）。取值：任意字符串，例如 fat、shaded、all 等。效果：当 shadedArtifactAttached=true 时，shaded JAR 的文件名会变为 artifactId-version-<classifier>.jar，例如 module-A-1.0.0-fat.jar。