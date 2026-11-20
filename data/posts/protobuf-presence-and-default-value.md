> 无论使用何种版本，你都取不到 null 值。

# Field Label
即 optional, required, repeated.

Proto 2：在这个版本中，所有字段都必须使用这3者之一来修饰，否则就会出现语法错误。

Proto 3(<3.12)：optional, required 这两个 label 被移除。
移除 optional 是为了简化语法。
移除 required 是因为 required 在模式演进上存在不可逆的破坏性，被彻底废弃。

Proto 3(>=3.12)：optional 被加回来。注：optional 关键字在 proto3 中的确切版本轨迹是，作为实验性特性引入于 3.12.0，作为稳定默认特性完成于 3.15.0。





# hasXXX() method
该方法用于检查某个字段是否被显式赋值。




# 对比
| 版本 | 字段 | hasXXX() | 默认值 |
| :-----| :---- | :---- | :---- |
| proto 2 | optional + 基本类型 | 有 | 0或者空字符串 | 
| proto 2 | optional + 消息类型 | 有 | 默认实例，非 null |
| proto 2 | required + 基本类型 | 有 | 必须显式赋值，否则运行时错误 | 
| proto 2 | required + 消息类型 | 有 | 必须显式赋值，否则运行时错误 |
| proto 2 | repeated + 基本类型 | 无 | 空列表 | 
| proto 2 | repeated + 消息类型 | 无 | 空列表 |
| proto 3(<3.12) | (无 label) + 基本类型 | 无 | 0或者空字符串 | 
| proto 3(<3.12) | (无 label) + 消息类型 | 有 | 默认实例，非 null |
| proto 3(<3.12) | repeated + 基本类型 | 无 | 空列表 | 
| proto 3(<3.12) | repeated + 消息类型 | 无 | 空列表 |
| proto 3(>=3.12) | (无 label) + 基本类型 | 无 | 0或者空字符串 | 
| proto 3(>=3.12) | (无 label) + 消息类型 | 有 | 默认实例，非 null |
| proto 3(>=3.12) | optional + 基本类型 | 有 | 0或者空字符串 | 
| proto 3(>=3.12) | optional + 消息类型 | 有 | 默认实例，非 null |
| proto 3(>=3.12) | repeated + 基本类型 | 无 | 空列表 | 
| proto 3(>=3.12) | repeated + 消息类型 | 无 | 空列表 |

注：后续版本，还会有变动：In edition 2023 we removed the optional and required keywords and use features to control those behaviors.参见：https://protobuf.dev/news/v31/#background
