> TLDR. 父方法-->子方法，throws的异常，范围可细化，不可泛化。即父方法中throws的异常，子方法中可以抛出同样的异常、或者该异常的子类、或者不抛出。

# 背景知识

- 方法声明中`throws`的（通常）都是Checked异常，而不是Unchecked异常。

- Checked异常、Unchecked异常

  - Checked异常：如果一个方法签名中`throws`了Checked异常，当用户调用该方法时，compiler会强制要求用户处理该异常，例如`FileReader file = new FileReader("somefile.txt")`，compiler要求你使用try-catch捕获`FileNotFoundException`，或者在当前方法声明中`throws FileNotFoundException`。

    - IOException
    - FileNotFoundException
    - NoSuchMethodException

  - Unchecked异常：这一类异常继承自`RuntimeException`，编译器不管这类异常。

    - NullPointerException
    - ArrayIndexOutOfBoundsException
    - ArithmeticException

# 方法重写时的throws规则

```java
// 由于throws（通常）不用于Unchecked异常，因此，下面仅讨论Checked异常。

// 1） √ 子方法与父方法throws相同异常
class Animal {
    protected void foo() throws IOException {
        System.out.println("Method in parent class");
        int i = 1/0;
    }
}
class Cat extends Animal {
    @Override
    public void foo() throws IOException {
        System.out.println("Method in child class");
    }
}

// 2) × 父方法没有throws某异常，而子方法throws该异常
class Animal {
    protected void foo() {
        System.out.println("Method in parent class");
        int i = 1/0;
    }
}
class Cat extends Animal {
    @Override
    public void foo() throws IOException { // 编译器标红警告：overridden method does not throw 'java.io.IOException'
        System.out.println("Method in child class");
    }
}

// 3） √ 父方法throws了某异常，而子方法不throws该异常
class Animal {
    protected void foo() throws IOException {
        System.out.println("Method in parent class");
        int i = 1/0;
    }
}
class Cat extends Animal {
    @Override
    public void foo() {
        System.out.println("Method in child class");
    }
}

// 4） √ 父方法throws了父异常，而子方法throws了子异常
class Animal {
    protected void foo() throws IOException {
        System.out.println("Method in parent class");
        int i = 1/0;
    }
}
class Cat extends Animal {
    @Override
    public void foo() throws FileNotFoundException { // FileNotFoundException继承自IOException
        System.out.println("Method in child class");
    }
}

// 5） × 父方法throws了子异常，而子方法throws了父异常
class Animal {
    protected void foo() throws FileNotFoundException {
        System.out.println("Method in parent class");
        int i = 1/0;
    }
}
class Cat extends Animal {
    @Override
    public void foo() throws IOException { // 编译器标红警告：overridden method does not throw 'java.io.IOException'
        System.out.println("Method in child class");
    }
}
```