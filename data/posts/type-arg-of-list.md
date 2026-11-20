确定一个类型是否为List或其子类很简单，但是，获取其类型参数，则要比想象中的复杂，尤其是像下方某些有着复杂继承链路的类型。

```java
public static class Bar {
	public Object f1;
	public List<Integer> f2;
	public ArrayList<Integer> f3;
	public A f4;
	public B1<Integer> f5;
	public B2<Integer> f6;
	public B3 f7;
	public B4<Integer, String, Integer> f8;
}
	
public interface A extends List<Integer> {...}
public interface B1<T> extends List<T> {...}
public interface B2<E> extends B1<E> {...}
public interface B3 extends B2<Integer> {...}
public interface Dummy<K, V> {...}
public interface B4<T1, T2, T3> extends B2<T1>, Dummy<T2, T3> {...}
```

首先需要注意的是，在泛型的继承关系中，类型占位符并不是固定的，例如`B2<E> extends B1<E>`，`B1<T> extends List<T>`，所以并不能简单地以为所有的占位符都为T。

但是，仍然可以找到映射关系。从ParameterizedType对象中，可以获得真实类型参数与占位符的对应关系。再逐级向上追溯，就可以获得整个链路。
```java
Field f6 = Bar.class.getField("f6");
Type b2 = f6.getGenericType();
ParameterizedType ptz1 = (ParameterizedType) b2;
Class<?> raw1 = (Class<?>) ptz1.getRawType();
Assert.assertEquals(Integer.class, ptz1.getActualTypeArguments()[0]); // when class is used, B2<Integer>
Assert.assertEquals("E", raw1.getTypeParameters()[0].getName()); // when class is declared, public interface B2<E> extends B1<E>
//
Type b1 = raw1.getGenericInterfaces()[0];
ParameterizedType ptz2 = (ParameterizedType) b1;
Class<?> raw2 = (Class<?>) ptz2.getRawType();
Assert.assertEquals("E", ptz2.getActualTypeArguments()[0].getTypeName()); // B1<E>
Assert.assertEquals("T", raw2.getTypeParameters()[0].getName()); // public interface B1<T> extends List<T>
//
Type list = raw2.getGenericInterfaces()[0];
ParameterizedType ptz3 = (ParameterizedType) list;
Class<?> raw3 = (Class<?>) ptz3.getRawType();
Assert.assertEquals("T", ptz3.getActualTypeArguments()[0].getTypeName()); // List<T>
Assert.assertEquals("E", raw3.getTypeParameters()[0].getName()); // public interface List<E> extends Collection<E>
```

利用这个链路关系，可以以递归方式间接获取真实的类型参数。
```java
private Type getTypeArg(Type type, Map<TypeVariable<?>, Type> placeholder2Actual,
						Class<?> targetClazz, int targetTypeArgIndex) {
	if (targetClazz == null) {
		throw new RuntimeException("Missing target class");
	}
	if (targetTypeArgIndex < 0) {
		throw new RuntimeException("Invalid target type argument index");
	}
	if (type == null || type.equals(Object.class)) {
		return null;
	}
	Class<?> raw;
	Map<TypeVariable<?>, Type> map = null;
	if (type instanceof ParameterizedType) {
		ParameterizedType ptz = (ParameterizedType) type;
		raw = (Class<?>) ptz.getRawType();
		if (!targetClazz.isAssignableFrom(raw)) {
			return null;
		}
		map = new HashMap<>();
		for (int i = 0; i < ptz.getActualTypeArguments().length; i++) {
			TypeVariable<?> placeholder = raw.getTypeParameters()[i];
			Type actual = ptz.getActualTypeArguments()[i];
			Type query = actual;
			// if the actual type arg is a place holder, query the map to get the real type if exists
			if (actual instanceof TypeVariable) {
				TypeVariable<?> tv = (TypeVariable<?>) actual;
				if (placeholder2Actual != null && placeholder2Actual.containsKey(tv)) {
					query = placeholder2Actual.get(tv);
				}
			}
			// check if current raw class is exactly the one we are looking for
			if (raw.equals(targetClazz) && i == targetTypeArgIndex) {
				return query;
			}
			map.put(placeholder, query);
		}
	} else if (type instanceof Class) {
		raw = (Class<?>) type;
		if (!targetClazz.isAssignableFrom(raw)) {
			return null;
		}
	} else {
		return null; // ?
	}
	//
	for (Type parent : getGenericParents(raw)) {
		Type ret = getTypeArg(parent, map, targetClazz, targetTypeArgIndex);
		if (ret != null) {
			return ret;
		}
	}
	return null;
}

private List<Type> getGenericParents(Class<?> clazz) {
	List<Type> parents = new ArrayList<>();
	if (clazz.getGenericInterfaces().length > 0) {
		parents = new ArrayList<>(Arrays.asList(clazz.getGenericInterfaces()));
	}
	if (clazz.getGenericSuperclass() != null) {
		parents.add(clazz.getGenericSuperclass());
	}
	return parents;
}
```
