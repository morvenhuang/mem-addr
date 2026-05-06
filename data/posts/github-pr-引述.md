# 如何在 GitHub PR 描述中引用其他 PR 或 Issue？

参见官方文档：[autolinked-references-and-urls](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/autolinked-references-and-urls)

如果要引用当前 repo 里的 PR 或者 Issue，可以直接输入“#”，系统会自动给出智能提示。

如果需要应用另外一个 repo 里的 PR 或者 Issue，按照文档可以使用`Username/Repository#编号`或者`Organization_name/Repository#编号`，其实也可以直接使用 url，例如我们想在`spark` repo 中引用`protoc-jar-maven-plugin` repo 中的 104 号 Issue：

1. `Username/Repository#编号`模式：os72/protoc-jar-maven-plugin#104
2. `Organization_name/Repository#编号`模式：这个具体不知道怎么写
3. 直接使用 url：https://github.com/os72/protoc-jar-maven-plugin/issues/104

以上方法都可以，不过有个小问题，以上的写法，生成的链接文本都是“os72/protoc-jar-maven-plugin#104”，并不自动显示标题和状态。如果需要显示标题和状态，参见文档中提到：

> If you reference an issue, pull request, or discussion in a list, the reference will unfurl to show the title and state instead. For more information about task lists, see About task lists.

也就是说，你只有在**列表模式**下，引用才会自动显示标题和状态，即以下写法：

```markdown
- https://github.com/os72/protoc-jar-maven-plugin/issues/104
或：
- os72/protoc-jar-maven-plugin#104
```

效果如下：
![Image](/uploads/upload_1778035077152.png)
