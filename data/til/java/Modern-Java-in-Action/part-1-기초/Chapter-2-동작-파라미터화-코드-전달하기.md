---
title: Chapter 2. 동작 파라미터화 코드 전달하기
date: '2022-04-07'
tags: ['TIL', 'Java', 'Modern Java In Action']
draft: false
summary: Chapter 2. 동작 파라미터화 코드 전달하기
---

# Chapter 2. 동작 파라미터화 코드 전달하기

변화하는 요구사항은 소프트웨어 엔지니어링에서 피할 수 없는 문제입니다. 자주 변하는 요구사항에 대해 비용을 최소화 하되, 새로운 기능은 쉽게 구현할 수 있어야 장기적인 관점에서 유지보수가 쉬워집니다.

`동작 파라미터화`를 이용히면 자주 변하는 요구사항에 대응할 수 있습니다.

`동작 파라미터화`는 어떻게 실행 할 것인지 결정하지 않은 코드를 의미합니다. 예를 들어 나중에 실행될 메소드의 인수로 `코드 블록`을 전달할 수 있습니다.  
즉, `코드 블록`의 실행은 나중으로 미뤄집니다.

`Collection`을 처리할 때 아래와 같은 메소드를 구현한다고 가정합니다.

- `List`의 모든 요소에 대해서 `어떤 동작`을 수행할 수 있음
- `List` 관련 작업을 끝낸 다음에 `어떤 다른 동작`을 수행할 수 있음
- 에러가 발생하면 `정해진 어떤 다른 동작`을 수행할 수 있음

`동작 파라미터화`로 이렇게 다양한 기능을 수행할 수 있습니다.

예를 들어 룸메이트에게 식료품을 사다 달라고 부탁하는 `goAndBuy`라는 메소드가 있다고 했을 때, 어느날은 우체국에서 소포를 가져와 달라고 부탁할 수도 있습니다.

이때, 두 개를 포괄하는 `go`메소드를 만들고 원하는 동작은 `go` 메소드의 인자로 전달하여 처리할 수 있습니다.

`동작 파라미터화`를 추가하려면 쓸데 없는 코드가 늘어나지만 `Java 8`은 `Lambda expression`으로 해당 문제를 해결합니다.

## 2.1 변화하는 요구사항에 대응하기

하나의 예제를 선정한 다음 예제 코드를 점차 개선하면서 유연한 코드를 만드는 방법에 대해 알아보겠습니다.

기존의 농장 재고목록 애플리케이션에 `List`에서 `녹색 사과`만 `filtering`하는 기능을 추가한다고 가정하고 시작하면 간단한 작업이라는 생각이 들 것입니다.

### 2.1.1 첫 번째 시도 : 녹색 사과 필터링

```java
enum Color {RED, GREEN}
```

```java
class FilteringApples {
	public static List<Apple> filterGreenApples(List<Apple> inventory) {
		List<Apple> result = new ArrayList<>();
		for (Apple apple : inventory) {
			if (apple.getColor() == Color.GREEN) { // 필터링 조건
				result.add(apple);
			}
		}
		return result;
	}
}
```

`녹색 사과`만 `filtering`하는 메소드는 위 처럼 만들 수 있습니다. 이때, `빨간 사과`도 `filtering`이 하고 싶어졌다면 어떻게 고쳐야 할까요?

큰 고민 없이 메소드를 `복사`, `붙여넣기`하여 필터링 조건만 변경할 수도 있지만, 추후 더 다양한 색으로 `filtering`이 필요하다면 부적절한 방법입니다.

- 이런 경우엔 `좋은 규칙`이 하나 있습니다.

> 💡 거의 비슷한 코드가 반복 존재한다면 그 코드를 추상화하라

### 2.1.2 두 번째 시도 : 색을 파라미터화

`filtering`할 `Color`를 파라미터로 받아 위의 문제를 해결할 수 있습니다.

```java
class FilteringApples {
	public static List<Apple> filterApplesByColor(List<Apple> inventory, Color color) {
		List<Apple> result = new ArrayList<>();
		for (Apple apple : inventory) {
			if (apple.getColor() == color) {
				result.add(apple);
			}
		}
		return result;
	}
}
```

이제 `Color`를 받아 해당 `Color`로 `filtering`할 수 있게 되었습니다.

이번엔 `무게`로도 `filtering`이 필요하다고 요구사항이 들어왔다고 하면 아래와 같이 구현할 수 있습니다.

```java
class FilteringApples {
	public static List<Apple> filterApplesByWeight(List<Apple> inventory, int weight) { // 받는 파라미터 변경
		List<Apple> result = new ArrayList<>();
		for (Apple apple : inventory) {
			if (apple.getWeight() > weight) { // 필터링 조건 변경
				result.add(apple);
			}
		}
		return result;
	}
}
```

기존의 코드를 `복사`, `붙여넣기`하여 위 처럼 만들수 있지만 이번엔 `조건`외에 모든 코드가 동일합니다.

> 💡`복사`, `붙여넣기`는 `DRY (같은 것을 반복하지 말 것)`원칙을 어기는 일입니다.
>
> 탐색 과정을 고쳐야 하는 경우가 발생하면 메소드 전체 구현을 고쳐야 하므로 비싼 대가를 치러야 합니다.

위의 문제를 해결하기 위해 `파라미터`로 `Color`랑 `Weight`를 받고, 어떤 것으로 `filtering`할 지 `flag 파라미터`도 추가하여 처리할 수 있습니다.

### 2.1.3 세 번째 시도 : 가능한 모든 속성으로 필터링

> ❌ 해당 방식은 절대 사용하면 안됩니다.

```java
class FilteringApples {
	public static List<Apple> filterApples(List<Apple> inventory, Color color, int weight, boolean flag) { // 파라미터 추가
		List<Apple> result = new ArrayList<>();
		for (Apple apple : inventory) {
			if ((flag && apple.getColor() == color) ||
					(!flag && apple.getWeight() > weight)) { // flag에 따른 조건
				result.add(apple);
			}
		}
		return result;
	}
}
```

아주 안좋은 코드 입니다. `flag`의 `true`, `false`가 무엇을 의미하는지도 알수 없고,
`크기`, `모양`등 `filtering`할 요구 사항이 늘어나는 경우엔 `파라미터`와 `조건`이 점점 많아질 것입니다.

요구 조건이 많아지면 지금까지 살펴 봤듯 기존에는 2가지 방법이 있습니다.

- 여러 중복된 필터 메소드 구현
- 하나의 거대한 필터 메소드 구현

> 💡 `Java 8`에서는 `동작 파라미터화`로 `filtering` 조건을 파라미터로 받아 처리할 수 있습니다.

## 2.2 동작 파라미터화

위에서 살펴봤듯, 변화하는 요구사항에 좀 더 유연하게 대응할 방법이 필요합니다.

우선, 한 걸음 물러서서 생각을 해보면 조건은 `Apple`의 `어떤 속성`에 기초하여 `boolean` 값을 알 수 있으면 됩니다.

> 💡 `인자`를 받아 `boolean` 값을 반환하는 함수를 `Predicate` 라고 합니다.

```java
interface ApplePredicate {
	boolean test(Apple a); // 사과 선택 전략을 캡슐화
}
```

```java
class AppleWeightPredicate implements ApplePredicate {
	@Override
	public boolean test(Apple apple) {
		return apple.getWeight() > 150;
	}
}
```

```java
class AppleColorPredicate implements ApplePredicate {
	@Override
	public boolean test(Apple apple) {
		return apple.getColor() == Color.GREEN;
	}
}
```

각 `class`는 `ApplePredicate`를 상속 받아 각각 필요한 조건을 정의하였습니다. 위 조건에 따라 `filter`메소드가 다르게 동작할 것이라고 예상할 수 있습니다.

> 💡 위와 같은 패턴을 `전략 디자인 패턴`이라고 합니다.
>
> `전략 디자인 패턴`은 알고리즘을 `캡슐화`하는 `알고리즘 패밀리`를 정의해둔 다음에 `런타임에 알고리즘을 선택`하는 기법입니다.  
> 위의 예제에선 `ApplePredicate`가 `알고리즘 패밀리`이고, `AppleWeightPredicate`와 `AppleColorPredicate`가 `전략` 입니다.

이제 `filterApples`에서 `ApplePredicate` 객체를 파라미터로 받아 `Apple`의 조건을 검사하도록 메소드를 변경하면 전달 받은 객체에 따라 `filtering`을 다르게 할 수 있게 됩니다.

`filterApples` 메소드 내부에서 `Collection` 반복 로직과 `Collection` 각 요소에 적용할 동작을 분리 할 수 있다는 점에서 소프트웨어 엔지니어링적으로 큰 이득을 얻을 수 있습니다.

> 이렇게 메소드가 `동작(또는 전략)`을 받아서 내부적으로 다양한 동작을 `수행`할 수 있도록 하는 것을 `동작 파라미터화`라고 합니다.

### 2.2.1 네 번째 시도 : 추상적 조건으로 필터링

위에서 만든 `ApplePredicate`를 이용해서 아래와 같이 만들 수 있습니다.

```java
class FilteringApples {
	public static List<Apple> filter(List<Apple> inventory, ApplePredicate p) {
		List<Apple> result = new ArrayList<>();
		for (Apple apple : inventory) {
			if (p.test(apple)) {
				result.add(apple);
			}
		}
		return result;
	}
}
```

이제 요구사항이 달라져도 `ApplePredicate`를 상속받아 구현 후, 해당 객체를 `파라미터`로 넘겨만 주면 됩니다. 첫 번째 코드에 비해 가독성도 좋아지고 사용하기도 쉬워으며, 훨씬 더 유연한 코드가
되었습니다.

> 우리가 전달한 `ApplePredicate` 객체에 의해 `filterApples` 메소드의 동작이 결정됩니다.
>
> 즉, `filterApples` 메소드의 동작을 파라미타화 한 것 입니다.

현재 메소드는 `teet` 메소드를 사용합니다. 그렇기 때문에 `ApplePredicate` 객체를 생성해서 보내야 합니다. 하지만 이건 `test` 메소드를 구현하는 객체를
이용해서 `boolean expresstion` 등을 전달할 수 있으므로 `코드를 전달` 할 수 있는 것과 동일합니다.

`Lambda`를 이용하면 `ApplePredicate`를 상속받아 구현하지 않아도 아래와 같이 간단하게 사용할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		filter(inventory, apple -> apple.getColor() == Color.RED && apple.getWeight() > 150);
	}
}
```

#### 💡 한 개의 파라미터, 다양한 동작

`Collection` 탐색 로직과 각 항목에 적용할 동작을 분리할 수 있다는 것이 `동작 파라미터화`의 강점입니다.

한 메소드가 다른 동작을 수행하도록 재활용 할 수 있습니다. 따라서 유연한 API를 만들 때 `동작 파라미터화`가 중요한 역할을 합니다.

> #### 💡 유연한 prettyPrintApple 메소드 구현하기
>
> `사과 리스트`를 전달 받아 다양한 방법으로 문자열을 생성 할 수 있도록 `파라미터화`된 `prettyPrintApple`를 구현해 보겠습니다.
>
> ```java
> interface AppleFormatter {
>     String accept(Apple apple);
> }
> ```
>
> ```java
> class AppleFancyFormatter implements AppleFormatter {
>     @Override
>     public String accept(Apple apple) {
>         String characteristic = apple.getWeight() > 150 ? "heavy" : "light";
>         return "A %s %s apple".formatted(characteristic, apple.getColor());
>     }
> }
> ```
>
> ```java
> class AppleSimpleFormatter implements AppleFormatter {
>     @Override
>     public String accept(Apple apple) {
>         return "An apple of %s g".formatted(apple.getWeight());
>     }
> }
> ```
>
> ```java
> class Print {
>     public static void prettyPrintApple(List<Apple> inventory, AppleFormatter formatter) {
>         for (Apple apple : inventory) {
>             System.out.println(formatter.accept(apple));
>
>         }
>     }
> }
> ```
>
> 이제 아래와 같이 출력하고 싶은 `forrmater`를 생성하여 `prettyPrintApple`의 `파라미터`로 넘겨 주면 됩니다.
>
> ```java
> class Foo {
>     public static void main(String[] args) {
>         Print.prettyPrintApple(inventory, new AppleSimpleFormatter());
>     }
> }
> ```

## 2.3 복잡한 과정 간소화

위에서 `전략 디자인 패턴`을 활용하여 유연한 코드를 만들었습니다. 하지만 매번 `ApplePredicate`를 상속받아 구현해야 한다는 것은 여전히 번거로운 일입니다.

`Java`는 `클래스 선언`과 `인스턴스화`를 동시에 할 수 있는 `익명 클래스`를 제공합니다.

### 2.3.1 익명 클래스

`익명 클래스`는 `Java`의 지역 클래스와 비슷한 개념입니다.
`익명 클래스`를 이용하면 `클래스 선언`과 `인스턴스화`를 동시에 할 수 있으므로 상속받지 않아도 즉석으로 필요한 구현을 만들어서 사용할 수 있습니다.

### 2.3.2 다섯 번째 시도 : 익명 클래스 사용

`익명 클래스`를 사용하면 아래와 같이 구현할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		Print.prettyPrintApple(inventory, new ApplePredicate() {
			@Override
			public boolean test(Apple apple) {
				return Color.RED == apple.getColor();
			}
		});
	}
}
```

`익명 클래스`를 사용하더라도 여전이 부족한 점이 있습니다.

- 클래스로 구현 정의하지 않았을뿐이지, 여전히 많은 공간을 차지합니다.
- 많은 프로그래머가 `익명 클래스` 사용에 익숙하지가 않습니다.

> #### 💡 익명 클래스 문제
>
> ```java
> public class MeaningOfThis {
>     public final int value = 4;
>
>     public void doIt() {
>         int value = 6;
>         Runnable r = new Runnable() {
>             public final int value = 5;
>
>             @Override
>             public void run() {
>                 System.out.println(this.value);
>             }
>         };
>         r.run();
>     }
>
>     public static void main(String[] args) {
>         MeaningOfThis m = new MeaningOfThis();
>         m.doIt();
>     }
> }
> ```
>
> 위의 코드는 `this`가 `MeaningOfThis`가 아니라 `Runnable`을 참조하므로 `5`가 출력됩니다.
>
> 이처럼 코드가 장황하면 코드를 이해하고 해석하는데 시간이 오래 걸립니다. 가능한 한 눈에 이해할 수 있는 코드여야 좋습니다.
>
> `익명 클래스`로 `interface`를 구현하는 여러 `class`를 선언하는 과정을 조금 줄이긴 했지만, 여전히 `코드 조각`을 전달하는 과정에서 `객체`를 만들고 명시적으로 새로운 동작을 정의하는 메소드를
> 구현해야 한다는 점은 변함이 없습니다.

> `동작 파라미타화`를 사용하면 요구사항 변화에 더 유연하게 대응할 수 있으므로 모든 프로그래머가 `동작 파라미터화`를 사용하도록 권장 합니다.

### 2.3.3 여섯 번째 시도 : 람다 표현식 사용

`Lambda expresstion`을 이용하면 위의 예제를 아래 처럼 간단하게 구현할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		filter(inventory, apple -> apple.getColor() == Color.RED && apple.getWeight() > 150);
	}

	public static List<Apple> filter(List<Apple> inventory, ApplePredicate p) {
		List<Apple> result = new ArrayList<>();
		for (Apple apple : inventory) {
			if (p.test(apple)) {
				result.add(apple);
			}
		}
		return result;
	}
}
```

> 💡 `Lambda`를 사용하면 `동작 파라미터화`로 인한 `유연함`도 얻고, 코드의 `간결함`도 얻을 수 있습니다.

### 2.3.4 일곱 번째 시도 : 리스트 형식으로 추상화

```java
public interface Predicate<T> {
	boolean test(T t);
}
```

```java
class Filtering {
	public static <T> List<T> filter(List<T> list, Predicate<T> p) {
		List<T> result = new ArrayList<>();
		for (T e : list) {
			if (p.test(e)) {
				resule.add(e);
			}
		}
		return result;
	}
}
```

이제 `사과` 이외에도 필터가 필요한 모든 `List`에 적용이 가능합니다.

## 2.4 실전 예제

`동작 파라미터화 패턴`은 동작을 캡슐화한 다음에 메소드로 전달해서 메소드의 동작을 파라미터화 합니다.

- `Comparator (정렬)`
- `Runable (실행)`
- `Callable (결과 반환)`
- `GUI 이벤트 처리`

위의 예제를 살펴보면서 `코드 전달 개념`을 더욱 확실하게 익혀봅시다.

### 2.4.1 Comparator로 정렬하기

`Collection` 정렬은 반복되는 프로그래밍 작업입니다.

`Java 8`의 `List`에는 `sort` 메소드가 포함되어 있습니다. (`Collection.sort` 도 존재)

아래와 같은 `interface`를 갖는 `java.util.Comparator` 객체를 이용하여 `sort` 동작을 파라미터화 할 수 있습니다.

```java
// java.util.Comparator
public interface Comparator<T> {
	int compare(T o1, T o2);
}
```

`Comparator`를 구현하여 `sort` 메소드의 동작을 다양화할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		inventory.sort(new Comparator<Apple>() {
			@Override
			public int compare(Apple a1, Apple a2) {
				return a1.getWeight().compareTo(a2.getWeight());
			}
		});
	}
}
```

앞서 공부 한 `Lambda`를 이용하면 더 간단하게 가능합니다.

```java
class Foo {
	public static void main(String[] args) {
		inventory.sort((a1, a2) -> a1.getWeight().compareTo(a2.getWeight()))
	}
}
```

### 2.4.2 Runnable로 코드 블록 실행하기

`Java Thread`를 이용하면 병렬로 코드 블록을 실행할 수 있습니다.

`Java 8`까지는 `Thread` 생성자에 객체만을 전달할 수 있었으므로
`void run` 메소드를 포함하는 `interface Runnable`를 `익명 클래스`로 히여 사용하는것이 일반적이였습니다.

```java
// java.lang.Runnable
public interface Runnable {
	void run();
}
```

```java
class Foo {
	public static void main(String[] args) {
		Thread t = new Thread(new Runnable() {
			@Override
			public void run() {
				System.out.println("Modern Java in Action");
			}
		});
	}
}
```

`Lambda`를 이용하면 아래와 같이 구현할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		Thread t = new Thread(() -> System.out.println("Modern Java in Action"))
	}
}
```

### 2.4.3 Callable을 결과로 반환하기

`Java 5`부터 지원하는 `interface ExecutorService`는 테스크 제출과 실행 과정의 연관성을 끊어주는 역할을 합니다.

`ExecutorService`를 이용하면 `Task`를 스레드 풀로 보내고 결과를 `Future`로 저장할 수 있습니다.

`interface Callable`을 이용하면 `Runnable`처럼 코드블럭을 실행한 뒤, 값을 반환 받을 수 있습니다.
`Runnable`의 업그레이드 버전이라고 생각할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		ExecutorService executorService = Executors.newCachedThreadPool();
		Future<String> threadName = executorService.submit(new Callable<String>() {

			@Override
			public String call() throws Exception {
				return Thread.currentThread().getName();
			}
		});
	}
}
```

`Lambda`를 이용하면 아래와 같이 구현할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		ExecutorService executorService = Executors.newCachedThreadPool();
		Future<String> threadName = executorService.submit(() -> Thread.currentThread().getName());
	}
}
```

### 2.4.4 GUI 이벤트 처리하기

일반적으로 `GUI 프로그래밍`은 마우스 클릭이나 문자열 위로 이동하는 등의 이벤트에 대응하는 동작을 수행하는 식으로 동작합니다.

즉, 변화에 대응할 수 있도록 유연한 코드가 필요합니다.

`JavaFX`에서는 `setOnAction` 메소드에 `EventHandler`를 전달함으로써 동작을 설정할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		Button button = new Button("Send");
		button.setOnAction(new EventHandler<ActionEvent>() {
			@Override
			public void handle(ActionEvent event) {
				label.setText("Sent!!");
			}
		});
	}
}
```

`Lambda`를 이용하여 아래와 같이 구현할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		button.setOnAction(event -> label.setText("Sent!!"));
	}
}
```

## 2.5 마치며

- `동작 파라미터화`에서는 메소드 내부적으로 다양한 동작을 수행할 수 있도록 코드를 메소드 인수로 전달합니다.
- `동작 파라미터화`를 이용하면 변화하는 요구사항에 유연하게 대처가 가능합니다.
- `코드 전달 기법`을 이용하면 도작을 메소드의 인수로 전달할 수 있지만, `Java 8` 이전에는 `익명 클래스`를 사용하더라도 코드가 지저분 했지만,
  `Java 8` 부터는 `Lambda`를 이용해 간단하게 사용할 수 있게 되었습니다.
- `Java API`의 많은 메소드는 정렬, 스레드, GUI 처리 등을 포함한 다양한 동작으로 `파라미터화`할 수 있습니다.
