`java.lang.reflect.Type`是一个接口，而`java.lang.Class`是它的一个实现类。即`Class`是一种`Type`，而`Type`则不仅仅包含`Class`，还有诸如`ParameterizedType`、`GenericArrayType`、`WildcardType`、`TypeVariable`等。

`Class`实例可通过`ClassName#class`或者`instance#getClass`获得；而`Type`实例一般在反射场景下获得，如`Field#getGenericType`、`Method#getGenericReturnType`。

### 1. 非泛型
#### 1.1. 原始类型

`Field#getType`返回`Class<?>`对象，`Field#getGenericType`返回`Type`对象。对于非泛型类型，这两个方法返回的值其实是一样的，下同。

另外，`Class#isPrimitive`可以用来判断是否是原始类型。
```java
Field f2 = Foo.class.getField("f2"); // public int f2;
Assert.assertEquals(int.class, f2.getType());
Assert.assertEquals(f2.getType(), f2.getGenericType());
Assert.assertTrue(f2.getType().isPrimitive());
```

#### 1.2. 对象类型

与原始类型相同，`Field#getType`所返回与`Field#getGenericType`相同。
这里包括一般对象类型、包含`String`及原始类型对应的封装类型。
```java
Field f1 = Foo.class.getField("f1"); // public String f1;
Assert.assertEquals(String.class, f1.getType());
```

#### 1.3. 数组类型

`Class#isArray`可以用来判断是否是数组，`Class#getComponentType`可以用来获取数组元素的类型
```java
Field f5 = Foo.class.getField("f5"); // public int[] f5;
Assert.assertEquals(int[].class, f5.getType());
Assert.assertTrue(f5.getType().isArray());
Assert.assertEquals(int.class, f5.getType().getComponentType());
```

对于二维及以上数组，可以理解成一个嵌套结构，
```java
Field f8 = Foo.class.getField("f8"); // public int[][] f8;
Assert.assertEquals(int[][].class, f8.getType());
Assert.assertEquals(int[].class, f8.getType().getComponentType());
```

### 2. 泛型
#### 2.1. 泛型类型

`Field#getType`只能返回裸类型，`Field#getGenericType`返回的是`ParameterizedType`，从中可以提取到类型参数
```java
Field f4 = Foo.class.getField("f4"); // public List<Integer> f4;
Assert.assertEquals(List.class, f4.getType());
Assert.assertTrue(f4.getGenericType() instanceof ParameterizedType);
ParameterizedType pt = (ParameterizedType) f4.getGenericType();
Assert.assertEquals(Integer.class, pt.getActualTypeArguments()[0]);
```

#### 2.2. 泛型数组类型

`Field#getGenericType`返回的是`GenericArrayType`，`GenericArrayType#getGenericComponentType`可以用来提取数组元素类型
```java
Field f7 = Foo.class.getField("f7"); // public List<Integer>[] f7;
Assert.assertEquals(List[].class, f7.getType());
Assert.assertTrue(f7.getGenericType() instanceof GenericArrayType);
GenericArrayType gat = (GenericArrayType)f7.getGenericType();
Type t = gat.getGenericComponentType();
Assert.assertTrue(t instanceof ParameterizedType);
ParameterizedType pt2 = (ParameterizedType)t;
Assert.assertEquals(Integer.class, pt2.getActualTypeArguments()[0]);
```

#### 2.3. 通配符（?, *）

`Field#getGenericType`返回的仍然是`ParameterizedType`，但`ParameterizedType#getActualTypeArguments`返回的是`WildcardType`
```java
Field f9 = Foo.class.getField("f9"); // public List<? extends Number> f9;
Assert.assertEquals(List.class, f9.getType());
Assert.assertTrue(f9.getGenericType() instanceof ParameterizedType);
ParameterizedType pt3 = (ParameterizedType) f9.getGenericType();
Type targ = pt3.getActualTypeArguments()[0];
Assert.assertTrue(targ instanceof WildcardType);
WildcardType wt = (WildcardType) targ;
Assert.assertEquals(Number.class, wt.getUpperBounds()[0]);
```
#### 2.4. 类型占位符

类型占位符表示为`TypeVariable`，另外注意`Field#getType`返回的裸类型为`Object`
```java
Field f10 = Foo.class.getField("f10"); // class Foo<T> 中的字段 public T f10;
Assert.assertEquals(Object.class, f10.getType());
Assert.assertTrue(f10.getGenericType() instanceof TypeVariable);
```

如果类型占位符有上界，则`Field#getTyp`e返回的裸类型为上界
```java
Field f10 = Foo.class.getField("f10"); // class Foo<T extends Number> 中的字段 public T f10;
Assert.assertEquals(Number.class, f10.getType());
Assert.assertTrue(f10.getGenericType() instanceof TypeVariable);
```

### 3. 总结

`Type`下除了`Class`外，其他的都是为了因应泛型的出现而新增的。另外，“编译时泛型”的说法也并不完全正确，“编译时泛型”是说泛型类型在运行时，类型参数是被擦除的，与裸类型是没有区别的。但实际上，从上面的代码可以看到，在一些情况下，我们可以在运行时获得泛型的类型参数，这种设计，导致Java类型架构变得有些别扭和复杂。