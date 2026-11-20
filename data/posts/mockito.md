# mockito
一般的，如果使用的是 java 1.8，则对应使用 mockito 3.12 版本，更高版本的 mockito 可能要求更高的 java 版本。
需要注意，如果需要支持对静态方法的 mock，那么，需要的依赖是 mockito-inline，否则使用 mockito-core 即可。
```xml
<dependency>
  <groupId>org.mockito</groupId>
  <artifactId>mockito-inline</artifactId>
  <version>3.12.4</version>
  <scope>test</scope>
</dependency>
```


# 静态方法 mock
## Mockito.CALLS_REAL_METHODS
```java
public class Static1 {

    static int foo() {
        int i = bar();
        return 2 * i;
    }

    static int bar() {
        return 7;
    }
}
```
假设要对 #foo 方法进行单元测试，并对 #bar 方法进行 mock，
```java
@Test
public void test() {
    try (MockedStatic<Static1> mockedStatic = mockStatic(Static1.class, Mockito.CALLS_REAL_METHODS)) {
        mockedStatic.when(Static1::bar).thenReturn(42);
        // 注意，这里依赖于Mockito.CALLS_REAL_METHODS选项，如果没有显式指定该选项，则foo方法也会被mock，并返回int的默认值，因此result会是0
        // Mockito.CALLS_REAL_METHODS 表示，除了显式被mock的方法外，其他方法都应调用真实的方法实现。
        // 在本例中，如果我们移除该参数，则该单元测试会报：
        // java.lang.AssertionError: 
        // Expected :84
        // Actual   :0
        int result = Static1.foo();
        assertEquals(84, result);
    }
}
```

## 带参数的静态方法
```java
@Test
public void test() {
    try (MockedStatic<Static1> mockedStatic = mockStatic(Static1.class, Mockito.CALLS_REAL_METHODS)) {
        mockedStatic.when(() -> Static1.getAlpha(anyInt(), anyString())).thenReturn(0.15d);
        mockedStatic.when(() -> Static1.getBeta(anyLong())).thenReturn(Optional.empty());
        double result = Static1.foo(); // 假设 #foo 方法中调用了以上 #getAlpha, #getBeta 方法
        assertEquals(0.3d, result, 0d);
    }
}
```

## 对多个类的静态方法进行 mock
```java
@Test
public void test() {
    try (MockedStatic<Static1> mockedStatic = mockStatic(Static1.class, Mockito.CALLS_REAL_METHODS);
         MockedStatic<CommonUtils> mockedCommonUtils = mockStatic(CommonUtils.class, Mockito.CALLS_REAL_METHODS)) {
        mockedStatic.when(() -> Static1.method1(any(), any())).thenReturn(true);
        mockedCommonUtils.when(() -> CommonUtils.method2(any(), anyLong())).thenReturn(Optional.empty());
        double result = Static1.foo(); // 假设 #foo 方法中调用了以上 Static1.method1, 以及 CommonUtils.method2 方法
        ...
    }
}
```

# 一些问题
## 为什么看起来真实方法还是被调用了？
```java
public class Static1 {

    static int foo() {
        int i = bar();
        return 2 * i;
    }

    static int bar() {
        System.out.println("bar() invoked");
        if (1 == 1) {
            throw new RuntimeException("oops");
        }
        return 7;
    }
}

...
@Test
public void test() {
    try (MockedStatic<Static1> mockedStatic = mockStatic(Static1.class, Mockito.CALLS_REAL_METHODS)) {
        mockedStatic.when(Static1::bar).thenReturn(42);
        int result = Static1.foo();
        assertEquals(84, result);
    }
}
```
这里有一个看起来有点矛盾的现象，上述的单元测试中，#assertEquals 是成功的，从这个结果来看，mock 是生效的。
但是，我们同时可以看到控制台输出了“bar() invoked”，这似乎表明真实的 #bar 方法被调用了，可是控制台中又没有输出 RuntimeException 的异常信息。
这可能与 mockito 对静态方法的 mock 机制有关，`mockedStatic.when(Static1::bar).thenReturn(42)` 这行代码可能导致了对真实 #bar 方法的某种程度的调用。


## 关于参数匹配
```java
public class Static3 {

    static int foo() {
        int i = bar(null);
        return 2 * i;
    }

    static int bar(Map<String, DenseRule> map) {
        return 7;
    }
}

...
@Test
public void test() {
    try (MockedStatic<Static3> mockedStatic = mockStatic(Static3.class, Mockito.CALLS_REAL_METHODS)) {
        mockedStatic.when(() -> Static3.bar(any())).thenReturn(100);
        int result = Static3.foo();
        assertEquals(200, result);
    }
}
```
以上代码 assertEquals 成功，但是如果改成`mockedStatic.when(() -> Static3.bar(anyMap())).thenReturn(100)`，则 assertEquals 失败。
原因是 #any() 可以匹配null， #anyMap() 不能匹配 null。由于 #foo 在调用 #bar 时，传入的是null，则需要使用any()，否则无法匹配到 mock 方法，就会执行真实的方法