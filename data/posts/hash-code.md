### Object.equals()
直接调用`==`，即判断二者的引用地址相同，实际上是判断“相同”，而非“相等”。
```java
public boolean equals(Object obj) {
    return (this == obj);
}
```

### Object.hashCode()
我一直的印象是`hashCode`返回的是对象的内存地址，上网查了一下，这应该是陈年旧事了，目前是使用`Marsaglia XOR-Shift`算法生成的随机数，与内存地址无关。另外，生成的随机数会与对象一起存储在内存中，从而保证对同一对象的多次调用总是返回相同的值。

### hashCode的作用
通常是配合散列值相关的类使用，如`HashSet`、`HashMap`等，以减少对`equals`的调用。

以`HashMap`为例，其内部存储可以理解为`bucket[]`。当获取到待存储元素的`hashCode`后，通过一定的运算，得到对应的`bucket[]`的下标，这一步是一个`O(1)`运算。而`bucket`中存储的，是链表或红黑树（`bucket`中元素的数量较多的情况下会用到红黑树），这是为了解决哈希冲突的问题，即不同的对象生成的`hashCode`相同。

`HashSet`在内部实现上，其实也是一个`HashMap`，只不过这个`map`没有`value`。

### 重写equals和hashCode
**是否重写`equals`和`hashCode`，只取决于业务规则。使用默认的实现，你的类一样可以正常地用在`HashSet`、`HashMap`。**

重写`equals`的同时，只有当你确信你的类未来不会被用于`HashSet`、`HashMap`等哈希相关场景，可以不重写`hashCode`；否则，你需要同时重写二者。

### JDK中的一些实现
#### String
```java
// 逐字符对比
public boolean equals(Object anObject) {
    if (this == anObject) {
        return true;
    }
    if (anObject instanceof String) {
        String anotherString = (String)anObject;
        int n = value.length;
        if (n == anotherString.value.length) {
            char v1[] = value;
            char v2[] = anotherString.value;
            int i = 0;
            while (n-- != 0) {
                if (v1[i] != v2[i])
                    return false;
                i++;
            }
            return true;
        }
    }
    return false;
}

// 逐字符进行计算，从而保证相等的字符串的`hashCode`也相等。
public int hashCode() {
    int h = hash;
    if (h == 0 && value.length > 0) {
        char val[] = value;

        for (int i = 0; i < value.length; i++) {
            h = 31 * h + val[i];
        }
        hash = h;
    }
    return h;
}
```

#### Integer
```java
// 直接比较二者的值。
public boolean equals(Object obj) {
    if (obj instanceof Integer) {
        return value == ((Integer)obj).intValue();
    }
    return false;
}

// 直接返回数值
public int hashCode() {
    return Integer.hashCode(value);
}
public static int hashCode(int value) {
    return value;
}
```

#### Long
```java
// 直接比较二者的值。
public boolean equals(Object obj) {
    if (obj instanceof Long) {
        return value == ((Long)obj).longValue();
    }
    return false;
}

// 将值进行特定的位运算得到的，由于 hashCode 是`int`，而非`long`，这里的哈希冲突显然是无法避免的
public int hashCode() {
    return Long.hashCode(value);
}
public static int hashCode(long value) {
    return (int)(value ^ (value >>> 32));
}
```

#### List
```java
// 逐个比较列表中的元素，见`AbsctractList`类。
public boolean equals(Object o) {
    if (o == this)
        return true;
    if (!(o instanceof List))
        return false;

    ListIterator<E> e1 = listIterator();
    ListIterator<?> e2 = ((List<?>) o).listIterator();
    while (e1.hasNext() && e2.hasNext()) {
        E o1 = e1.next();
        Object o2 = e2.next();
        if (!(o1==null ? o2==null : o1.equals(o2)))
            return false;
    }
    return !(e1.hasNext() || e2.hasNext());
}

// 逐个获取各元素的`hashCode`，进行一定运算，得到一个最终值，见`AbsctractList`类。
// 可见类似`HashSet<List<Integer>>`或`HashMap<List<Integer>, String>`这类数据结构是可以正常工作的。
public int hashCode() {
    int hashCode = 1;
    for (E e : this)
        hashCode = 31*hashCode + (e==null ? 0 : e.hashCode());
    return hashCode;
}
```

#### Set
```java
// 比较集合中的元素（顺序无关），见`AbsctractSet`类。
public boolean equals(Object o) {
    if (o == this)
        return true;

    if (!(o instanceof Set))
        return false;
    Collection<?> c = (Collection<?>) o;
    if (c.size() != size())
        return false;
    try {
        return containsAll(c);
    } catch (ClassCastException unused)   {
        return false;
    } catch (NullPointerException unused) {
        return false;
    }
}

// 获取各元素的`hashCode`，直接求和，得到一个最终值，见`AbsctractSet`类。、
// 可见类似`HashSet<Set<Integer>>`或`HashMap<Set<Integer>, String>`这类数据结构是可以正常工作的。
public int hashCode() {
    int h = 0;
    Iterator<E> i = iterator();
    while (i.hasNext()) {
        E obj = i.next();
        if (obj != null)
            h += obj.hashCode();
    }
    return h;
}
```
