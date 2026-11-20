> "编译时泛型"与"类型擦除"说的是一件事。

Java代码需要经过Compiler编译成为字节码，然后由JVM运行。"编译时泛型"是指，Java中的泛型停留在Compiler层面，字节码中并没有泛型信息，因此JVM不会/不需要处理泛型。"类型擦除"是指，Compiler在将代码编译成字节码时，擦除了泛型相关的信息。

简单举例，`List<String>，List<Integer>`在C#泛型中是两个不同的类。在Java泛型中，体现在字节码上的都是裸的List，但Compiler会额外生成了类型转换指令。所以，针对泛型，Java Compiler做了2件事，

1. 在编译前，进行类型检测并抛出类型不匹配错误，比如当你把Integer值add到`List<String>`时，eclipse会给你一个红叉。
2. 在编译中，对泛型相关信息进行擦除，T一律按Object/bounded-type处理，同时在必要的地方插入类型转换指令。

#### 类型擦除的副作用
类型擦除这种实现方式，导致了Java泛型一些反直觉的行为。Java采用这种方式的初衷不可知，有人说是性能考虑，避免为每一个不同的类型参数生成不同的类；也有说是向后兼容的考虑(老的代码可以运行在新的JVM上)，这些说法都没有特别大的说服力。一个典型的反直觉行为，下面两个方法无法完成重载，因为在JVM眼中，两个方法的参数都是裸的List，所以Compiler先一步阻止了这个情况并抛出编译错误。
```java
public void m1(List<String> ss) {
}

public void m1(List<Integer> is) {
}
```
还有所谓的"bridge method"，也是类型擦除的一个副作用，
```java
//擦除前
interface Comparable <A> {
  public int compareTo( A that);
}
final class NumericValue implements Comparable <NumericValue> {
  private byte value; 
  public  NumericValue (byte value) { this.value = value; } 
  public  byte getValue() { return value; } 
  public  int compareTo( NumericValue that) { return this.value - that.value; }
}


//擦除后
interface Comparable {
  public int compareTo( Object that);
}
final class NumericValue implements Comparable {
  private byte value; 
  public  NumericValue (byte value) { this.value = value; } 
  public  byte getValue() { return value; } 
  public  int compareTo( NumericValue t hat)   { return this.value - that.value; }
  //Compiler额外生成了这个方法来override接口中的方法，即bridge method
  public  int compareTo(Object that) { return this.compareTo((NumericValue)that);  }
}
```

#### (Compiler的)类型推断
在1.8及以上版本中，以下代码没有编译错误，
```java
public static void main(String[] args) {
	process(new HashSet<String>(), Collections.emptySet()); 
}

public static <E> void process(Set<E> s1, Set<E> s2) {
	return;
}
```
在1.7及以下版本中，需显式指定类型参数的语法，注意它是在"."之后，方法名之前通过尖括号指定类型。随着Compiler的更新，绝大多数情况下可以成功进行类型推断，而不用手工指定。
```java
process(new HashSet<String>(), Collections.<String>emptySet()); 
```

### 方法重载
```java
class Foobar {
  public <T>                void method( T arg) { ... }
  public <T extends Number> void method( T arg) { ... }    // overloads
  public                    void method( Long arg) { ... } // overloads
} 
```
上述语法没有问题，因为泛型方法的签名中带有bound类型，所以第一个和第二个是可以区分的。

### 为什么不允许new T()
T可能有无参构造器、也可能没有无参构造器，那么就会导致程序有时正常工作，有时不能正常工作。

### 如何获取T.class
由于类型擦除，没有简单的方法来获取T.class，但有一些[trick](https://stackoverflow.com/questions/3437897/how-do-i-get-a-class-instance-of-generic-type-t)
