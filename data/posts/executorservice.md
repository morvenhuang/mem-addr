> ExecutorService是一个接口，有不同的实现，为开发者提供了一套多线程开发的工具。在常规的多线程编程中，通常ExecutorService就能满足开发者的需求。

### 1. 初始化ExecutorService
##### 1.1. 可以使用工厂类Executors
```java
ExecutorService es = Executors.newFixedThreadPool(3);
ExecutorService es = Executors.newCachedThreadPool();
ExecutorService es = Executors.newScheduledThreadPool(3);
```
##### 1.2. 可以使用构造器
```java
ExecutorService es = new ThreadPoolExecutor(POOL_CORE_SIZE, POOL_MAX_SIZE, 60L, TimeUnit.SECONDS, new LinkedBlockingQueue<Runnable>());
```
两种方式没有本质区别，前者相当于是快捷方式，一般使用前者就够了。
  
### 2. 向ExecutorService提交任务
可以通过execute, submit等方法向线程池提交任务。两者的区别有三，  

![Image](/uploads/executorservice-execute-submit.png)

 1. execute方法没有返回值，submit方法返回一个泛型Future。所以如果不需要分析返回值，一般使用execute。
 2. execute方法只接受Runnable，submit方法接受Runnable和Callable。
 3. execute方法会打印任务内部的异常信息，submit方法不打印任务内部的异常信息。（注：当使用execute方法时，异常默认由任务线程的UncaughtExceptionHandler来处理，UncaughtExceptionHandler的默认行为是将异常信息打印到控制台。当使用submit方法时，异常信息则被存储到Future对象中，因此在控制台看不到。）

以下代码既不打印日志，也不显示异常信息，
```java
es.submit(() ->
	{
		int i = 1/0;
		logger.info("submit task");
	});
```

以下代码不打印日志，但会显示异常信息，
```java
es.execute(() ->
	{
		int i = 1 / 0;
		logger.info("execute task");
	});
```

不管是submit还是execute，直接在方法外是无法catch到异常，因为异常是发生在不同的线程里。不过，由于submit方法返回Future，通过对Future调用get时，由于get是同步调用(阻塞式)，可以catch到异常，
```java
Future<?> f = es.submit(() ->
		{
				int i = 1 / 0;
				logger.info("submit task");
		});

try {
		f.get();
} catch (Exception e) {
		logger.error(e.getMessage());
}
```

### 3. 使用Future
##### 3.1. 通过get获取返回值
```java
ExecutorService es = Executors.newFixedThreadPool(3);
Future<Integer> f = es.submit(() ->
		{
				Thread.sleep(1000L);
				return 100 + 200;
		});

try {
		int ret = f.get();
} catch (InterruptedException | ExecutionException e) {
		e.printStackTrace();
}
```

##### 3.2. 通过get设置超时
```java
try {
		int ret = f.get(500L, TimeUnit.MILLISECONDS);
} catch (InterruptedException | ExecutionException | TimeoutException e) {
		e.printStackTrace();
}
```

##### 3.3. 通过cancel取消任务

### 4. 关闭ExecutorService
即使任务已经完成，ExecutorService依然持续运行，如果希望关闭它，需要调用shutdown或shutdownNow方法。shutdown先停止接受新任务，等待现有任务完成后，关闭ExecutorService。shutdownNow则立即关闭ExecutorService。一般比较推荐的写法是，
```java
es.shutdown();
try {
    if (!es.awaitTermination(1000, TimeUnit.MILLISECONDS)) {
        es.shutdownNow();
    } 
} catch (InterruptedException e) {
    es.shutdownNow();
}
```