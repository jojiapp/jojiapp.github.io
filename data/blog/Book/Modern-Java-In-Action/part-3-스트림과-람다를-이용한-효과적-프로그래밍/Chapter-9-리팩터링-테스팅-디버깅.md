---
title: Chapter 9. 리팩터링, 테스팅, 디버깅
date: '2022-06-20'
tags: ['Java', 'Modern Java In Action']
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

## 9.3 람다 테스팅

### 9.3.1 보이는 람다 표현식의 동작 테스팅

일반적인 `public 메소드`의 경우 해당 메소드를 호출하여 기대하는 결과값으로 테스트를 진행할 수 있습니다.

하지만, `람다`의 경우 익명이므로 테스트 코드에서 호출할 수가 없습니다.

> static 메소드로 선언하는 등과 같은 방식으로 사용할 수는 있지만 그렇게 좋아보이지는 않습니다.

### 9.3.2 람다를 사용하는 메소드의 동작에 집중하라

`람다의 목표`는 정해진 동작을 다른 메소드에서 사용할 수 있도록 `하나의 조각으로 캡슐화하는 것`입니다.

`람다 표현식`을 `사용하는 메소드의 동작을 테스트`함으로써 람다를 공개하지 않으면서도 람다 표현식을 검증할 수 있습니다.

### 9.3.3 복잡한 람다를 개별 메소드로 분할하기

람다 표현식이 복잡해지면 `메소드 참조로 변경`하여 사용하면 됩니다. 메소드 참조로 변경하면 일반 메소드를 테스트 하듯 테스드할 수 있습니다.

### 9.3.4 고차원 함수 테스팅

함수형 인터페이스의 `인스턴스로 간주`하고 `함수의 동작을 테스트`할 수 있습니다.

> 함수를 인수로 받거나 다른 함수를 반환하는 메소드를 `고차원 함수`라고 합니다.

## 9.4 디버깅

문제가 발생하면 2가지를 먼저 확인해야 합니다.

- 스택 트레이스
- 로깅

하지만 `람다 표현식`과 `스트림`은 기존의 디버깅 기법을 무력화 시킵니다.

### 9.4.1 스택 트레이스 확인

프로그램이 메소드를 호출할 떄마다 프로그램에서의 호출 위치, 호출할 떄의 인수값, 호출된 메소드의 지역 변수 등을 포함한 호출 정보가 생성되고 이 정보는 `스택 프레임`에 `저장`됩니다.

따라서, 프로그램이 멈췄다면 어떻게 멈추게 되었는지 프레임별로 보여주는 `스택 트레이스`를 얻을 수 있습니다.

#### 💡 람다와 스택 트레이스

`람다 표현식`은 `익명`이기 떄문에 `임의의 값`이 출력됩니다. 어떤 메소드에서 예외가 발생한지 까지는 알수 있지만, 여러 람다 표현식이 있다면 어디서 발생했는지 추적하기는 쉽지 않습니다.

`메소드 참조`를 사용해도 스택 트레이스에는 `메소드명이 남지 않습니다.`  
하지만, 또 `메소드 참조를 사용하는 클래스와 동일한 곳에 선언`되어 있는 `메소드를 참조`할 떄는 `메소드 참조 이름이 스택 트레이스에 나타납니다.`

> 즉, 람다 표현식과 관련한 스택 트레이스는 이해하기 어렵습니다.

### 9.4.2 정보 로깅

스트림에서 로깅을 할려면 출력을 위해 `forEach`를 사용할 것입니다.

```java
class Foo {
    public static void main(String[] args) {
        IntStream.of(1, 2, 3, 4, 5)
                .filter(num -> num % 2 == 0)
                .map(num -> num * 2)
                .forEach(System.out::println);
    }
}
```

위처럼 구성을 하게 될텐데, 이럴경우 `forEach`가 최종연산이 되어 `List`로 반환을 한다거나, 또는 `filter`와 `map`사이를 로깅해본다거나 그럴 수가 없습니다.

이떄 사용하는 것이 `peek`이라는 스트림 연산입니다.

`peek`연산은 스트림을 소비하지 않고 그대로 다음 연산으로 전달합니다.

```java
class Foo {
    public static void main(String[] args) {
        IntStream.of(1, 2, 3, 4, 5)
                .filter(num -> num % 2 == 0)
                .peek(System.out::println)
                .map(num -> num * 2)
                .peek(System.out::println)
                .toArray();
    }
}
```

위처럼 스트림 연산을 소비하지 않기 떄문에 중간연산으로 자유롭게 넣을 수 있습니다.

## 9.5 마치며

- `람다 표현식`으로 `가독성`이 좋고 더 `유연한 코드`를 만들 수 있다.
- `익명 클래스`는 `람다 표현식`으로 바꾸는 것이 좋다. 하지만 `this`, `변수 섀도` 등 미묘하게 의미상 다른 내용이 있음을 `주의`
- `메소드 참조`로 `람다 표현식`보다 더 `가독성이 좋은 코드를 구현`할 수 있다.
- `반복적으로 컬렉션`을 처리하는 루틴은 `스트림 API로 대체`할 수 있을지 고려하는 것이 좋다.
- `람다 표현식`으로 `객체지향 디자인 패턴`에서 발생하는 `불필요한 코드를 제거`할 수 있다.
- 람다 표현식도 테스트를 할 수는 있지만, `테스트는 메소드의 동작을 테스트하는 것이 바람직`하다.
- `복잡한 람다 표현식`은 일반 메소드로 재구현하여 `메소드 참조로 사용`하는것이 좋다.
- 람다 표현식을 사용하면 `스택 트레이스를 이해하기 어렵다.`
- 스트림 파이프라인에서 `peek메소드를 이용하여 중간 값을 확인`할 수 있다.
