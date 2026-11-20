# 移除 pom.xml 中的一些无用提示
1. vulnerabilities found in dependency
IntelliJ IDEA -> Settings - Editor -> Inspections，在右侧的搜索框中输入 Vulnerability

2. HTTP links are not secure
IntelliJ IDEA -> Settings - Editor -> Inspections，在右侧的搜索框中输入 Link with unencrypted




# maven panel
1. Reload All maven projects
位于 maven 面板的左上角，两个循环的箭头处。该按钮作用：强制 IDEA 重新读取 pom.xml 文件，并根据文件的最新内容更新 IDE 的内部索引和项目结构。
有时候一个多 module 项目中的某一个 module 明明可以编译通过，但是打开某个类文件，会有一大堆红色标识的错误，这个时候，可以尝试此按钮。

