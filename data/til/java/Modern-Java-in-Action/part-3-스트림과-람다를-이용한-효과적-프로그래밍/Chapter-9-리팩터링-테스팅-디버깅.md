---
title: Chapter 9. 리팩터링, 테스팅, 디버깅
date: '2022-06-20'
tags: ['TIL', 'Java', 'Modern Java In Action']
draft: false
summary: Chapter 9. 리팩터링, 테스팅, 디버깅
---

# Chapter 9. 리팩터링, 테스팅, 디버깅

## 9.1 가독성과 유연성을 개선하는 리팩터링

### 9.1.1 코드 가독성 개선

코드 가독성이란 `어떤 코드를 다른 사람도 쉽게 이해할 수 있음`을 의미합니다.

코드 가독성을 높일려면 `코드의 문서화`를 잘하고, `표준 코딩 규칙을 준수`하는 등의 노력이 필요합니다.

- 익명 클래스를 `람다 표현식`으로 리팩터링
- 람다 표현식을 `메소드 참조`로 리팩터링
- 명령형 데이터 처리를 `스트림`으로 리팩터링

### 9.1.2 익명 클래스를 람다 표현식으로 리팩터링하기

```java
public class FooTest {
	@Test
	@DisplayName("익명클래스를 람다로 변경")
	void test1() throws Exception {
		Runnable hello1 = new Runnable() {
			@Override
			public void run() {
				System.out.println("hello");
			}
		};
		Runnable hello2 = () -> System.out.println("hello");
	}
}
```

### 9.1.3 람다 표현식을 메소드 참조로 리팩터링하기

`메소드 참조`는 `메소드명`으로 `코드의 의도를 명확`하게 알릴 수 있기 때문에 람다 표현식 보다 가독성을 높일 수 있습니다.

```java
public enum Color {
	RED,
	BLUE;

	public boolean isRed() {
		return this == RED;
	}
}
```

```java
public class FooTest {
	@Test
	@DisplayName("람다표현식 대신 메소드참조를 사용")
	void test2() throws Exception {
		List<Color> redColor1 = Stream.of(
						Color.RED,
						Color.RED,
						Color.BLUE,
						Color.BLUE,
						Color.BLUE
				)
				.filter(color -> color.equals(Color.RED))
				.toList();

		List<Color> redColor2 = Stream.of(
						Color.RED,
						Color.RED,
						Color.BLUE,
						Color.BLUE,
						Color.BLUE
				)
				.filter(Color::isRed)
				.toList();
	}
}
```

### 9.1.4 명령형 데이터 처리를 스트림으로 리팩터링하기

`스트림`을 이용하면 명령형으로 데이터를 처리할 때보다 `의도를 명확`하게 나타낼수 있습니다.

```java
public class FooTest {
	@Test
	@DisplayName("명령형 데이터 처리를 스트림으로 리팩터링하기")
	void test3() throws Exception {
		int[] numbers = IntStream.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
				.filter(num -> num % 2 == 0)
				.map(num -> num * 2)
				.toArray();
	}
}
```

`람다 표현식`도 `메소드 참조`로 `변경`하면 더 가독성을 높일 수 있습니다.

### 9.1.5 코드 유연성 개선

#### 💡 조건부 연기 실행

```java
class Foo {
	public static void main(String[] args) {
		if (logger.isLoggable(Log.FINER)) {
			logger.finer("Problem: " + generateDiagnostic());
		}
	}
}

```

- `logger`의 상태가 `isLoggable`이라는 메소드에 의해 `클라이언트 코드로 노출`됨
- 메시지를 로깅할 떄마다 `상태를 매번 확인하는 것은 코드를 어지럽힐 뿐`

```java
class Foo {
	public static void main(String[] args) {
		logger.log(Level.FINER, "Problem: " + generateDiagnostic());
	}
}
```

- 불필요한 `if 문`은 제거 했지만, `logger`가 활성화 되어 있지 않더라도 항상 로깅 메시지를 평가하는 문제가 있음

```java
class Foo {
	public void log(Level level, Supplier<String> msgSupplier) {
		if (logger.isLoggable(level)) {
			log(level, msgSupplier.get());
		}
	}

	public static void main(String[] args) {
		logger.log(Level.FINER, () -> "Problem: " + generateDiagnostic());
	}
}
```

- `람다`를 이용하여 `특정 조건`에서만 메시지가 생성될 수 있도록 `메시지 생성 과정을 연기`함

> 클라이언트 코드에서 객체 상태를 자주 확인 하거나, 객체의 일부 메소드를 호출하는 상황이라면
> 내부적으로 객체의 상태를 확인한 다음 메소드를 호출 하도록 새로운 메소드를 구현하면 `가독성` 뿐만 아니라 `캡슐화`도 좋아집니다.

#### 💡 실행 어라운드

매번 `같은 준비, 종료 과정`을 반복적으로 수행한다면 `코드 조각을 파라미터`로 넘겨 받아 사용함으로써 중복을 줄일 수 있습니다.

## 9.2 람다로 객체지향 디자인 패턴 리팩터링하기

- 전략(Strategy)
- 템플릿 메소드(Template Method)
- 옵저버(Observer)
- 의무 체인(Chain of Responsibility)
- 팩토리(Factory)

### 9.2.1 전략

`전략 패턴`은 한 유형의 알고리즘을 보유한 상태에서 런타임에 적절한 알고리즘을 선택하는 기법입니다.

간단하게 말해 사용하는 측에서는 `인터페이스에 의존`하고, `구현체를 외부에서 주입`받아 사용하는 것을 말합니다.

`DI(의존성 주입)`이 전략 패턴의 대표적인 예 입니다.

`인터페이스`는 `익명클래스로 생성`할 수 있고, `익명클래스`는 `람다로 대체`할 수 있으니 람다로 전략 패턴을 사용할 수 있는것 입니다.

```java

@FunctionalInterface
public interface Calculator {
	int calc(int num1, int num2);
}
```

```java

@RequiredArgsConstructor
public class Service {
	private final Calculator calculator;

	public void print() {
		calculator.calc(5, 2);
	}
}
```

```java
public class FooTest {
	@Test
	@DisplayName("전략패턴 람다로 구현")
	void test4() throws Exception {
		Service service1 = new Service((num1, num2) -> num1 + num2);
		Service service2 = new Service((num1, num2) -> num1 - num2);
		Service service3 = new Service((num1, num2) -> num1 * num2);
		Service service4 = new Service((num1, num2) -> num1 / num2);
	}
}
```

### 9.2.2 템플릿 메소드

`템플릿 패턴`은 알고리즘의 개요를 제시한 다음에 알고리즘으 일부를 고칠 수 있는 유연함을 제공해야 할 때 사용합니다.

간단하게 말해 기본적으로 실행되는 로직이 존재하고, 상황에 따라 달라지는 로직은 추상메소드로 정의하여 구현체에게 맡기는 것입니다.

```java
public abstract class Animal {

	public void print() {
		System.out.printf("울음소리: %s%n", crying());
	}

	abstract String crying();
}
```

```java
public class Dog extends Animal {
	@Override
	String crying() {
		return "멍멍";
	}
}
```

```java
public class FooTest {
	@Test
	@DisplayName("템플릿 메소드")
	void test5() throws Exception {
		Animal dog = new Dog();
		dog.print();
	}
}
```

- 위의 코드를 조금 수정하여 람다로 처리할 수 있습니다.

```java
public class Animal {

	public void print(Supplier<String> crying) {
		System.out.printf("울음소리: %s%n", crying.get());
	}
}
```

```java
public class FooTest {
	@Test
	@DisplayName("템플릿 메소드")
	void test5() throws Exception {
		Animal animal = new Animal();
		animal.print(() -> "멍멍");
	}
}
```

### 9.2.3 옵저버

`옵저버 패턴`은 어떤 이벤트가 발생했을 때, `주체`가 다른 `옵저버`에 자동으로 알림을 보내야 하는 상황에 사용합니다.

- 옵저버

```java
public interface Observer {
	void notify(String tweet);
}
```

- 주체

```java
public interface Subject {
	void registerObserver(Observer observer);

	void notifyObservers(String tweet);
}

public class Feed implements Subject {
	private final List<Observer> observers = new ArrayList<>();

	@Override
	public void registerObserver(Observer observer) {
		observers.add(observer);
	}

	@Override
	public void notifyObservers(String tweet) {
		observers.forEach(o -> o.notify(tweet));
	}
}
```

- 람다로 구현

```java
public class FooTest {
	@Test
	@DisplayName("옵저버 패턴 람다로 구현")
	void test6() throws Exception {
		Feed feed = new Feed();
		feed.registerObserver(tweet -> {
			if (tweet.contains("money")) System.out.println("money");
		});
		feed.registerObserver(tweet -> {
			if (tweet.contains("queen")) System.out.println("queen");
		});
	}
}
```

### 9.2.4 의무 체인

`의무 체인 패턴`은 작업 처리 객체의 체인을 만들 때 사용합니다.

```java
public abstract class ProcessingObject<T> {
	protected ProcessingObject<T> successor;

	public void setSuccessor(ProcessingObject<T> successor) {
		this.successor = successor;
	}

	public T handle(T input) {
		T t = handleWork(input);
		if (successor != null) {
			return successor.handle(t);
		}
		return t;
	}

	abstract protected T handleWork(T input);
}
```

```java
public class FooTest {
	@Test
	@DisplayName("의무 체인 람다 구현")
	void test7() throws Exception {
		UnaryOperator<String> headerProcessing =
				s -> "From Raoul, Mario and Alan: " + s;

		UnaryOperator<String> spellCheckerProcessing =
				s -> s.replaceAll("labda", "lambda");

		Function<String, String> pipeline = headerProcessing.andThen(spellCheckerProcessing);
		String result = pipeline.apply("Aren't labdas really sexy?");
	}
}
```

### 9.2.5 팩토리

`팩토리 패턴`은 인스턴스화 로직을 클라이언트에 노툴하지 않고 객체를 만들 때 사용합니다.

```java
public class ProductFactory {
	private static final Map<String, Supplier<Product>> map = new HashMap<>();

	static {
		map.put("loan", Loan::new);
		map.put("stock", Stock::new);
		map.put("bond", Bond::new);
	}

	public Product createProduct(final String name) {
		Supplier<Product> p = map.get(name);
		if (p == null) throw new IllegalArgumentException("존재하지 않음");
		return p.get();
	}
}

class Product {}

class Loan extends Product {}

class Stock extends Product {}

class Bond extends Product {}
```

```java
public class FooTest {
	@Test
	@DisplayName("팩토리 패턴 람다로 구현")
	void test8() throws Exception {
		ProductFactory productFactory = new ProductFactory();
		Product stock = productFactory.createProduct("stock");
	}
}
```
