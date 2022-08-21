---
title: Chapter 19. 함수형 프로그래밍 기법
date: '2022-08-22'
tags: ['Java', 'Modern Java In Action']
draft: false
summary: Chapter 19. 함수형 프로그래밍 기법
---

# Chapter 19. 함수형 프로그래밍 기법

## 19.1 함수는 모든 곳에 존재한다

함수형 프로그래밍이란 함수나 메소드가 부작용 없이 동작함을 의미합니다.

조금 더 넓게는 함수를 일반 값처럼 사용하여 인수로 전달하거나, 결과로 반환, 자료구조에 저장할 수 있음을 의미합니다.

> 일반값 처럼 취급할 수 있는 함수를 일급 함수라고 합니다.

### 19.1.1 고차원 함수

- 하나 이상의 함수를 인수로 받음
- 함수를 결과로 반환

> #### 💡 부작용과 고차원 함수
>
> 고치원 함수나 메소드를 구형할 떄 어떤 인수가 전달 될지 알 수 없으므로 인수가 부작용을 포함할 가능성을 염두에 두어야 합니다.
>
> 인수로 전달된 함수가 어떤 부작용을 포함하게 될지 정확하게 문서화하는 것이 좋습니다.

### 19.1.2 커링

`커링`은 `x`와 `y`라는 두 인수를 받는 함수 `f`를 한 개의 인수를 받는 `g`라는 함수로 대체하는 기법입니다.

섭씨를 화씨로 변환하는 공식은 아래와 같습니다.

```zsh
CtoF(x) = x * 9 / 5 + 32
```

위 공식은 아래와 같은 메소드로 정의할 수 있습니다.

```java
static double converter(double x, double, f, double b) {
	return x * f + b
}
```

- x: 반환 값
- f: 반환 요소
- b: 기준치 조정 요소

온도 뿐아니라 킬로미터와 마일 등의 단위로 변환해야 한다면 converter라는 메소드를 만들어 문제를 해결하려 할것입니다.

인수에 기준치를 넣는 일은 귀찮고 오타도 발생하기 쉽습니다.

그럼 각각 메소드를 만들어 사용하는 방법도 있는데 중복이 발생하여 벌써 별로입니다.

이럴 때 아래 처럼 커링 기법으로 해결할 수 있습니다.

```java
static DoubleUnaryOperator curriedConverter(double f, double b) {
	return (double x) -> x * f + b;
}
```

위의 메소도를 이용하여 변환 로직을 재활용할 수 이씅며 다양한 변환 요소로 다양한 함수를 만들 수 있습니다.

## 19.2 영속 자료구조

함수형 프로그램에서는 함수형 자료구조, 불변 자료구조 등의 용어도 사용하지만 보통은 영속 자료구조라고 부릅니다.

여기서 `영속` 은 데이터베이스에서 프로그램 종료 후에도 남아있음을 의미하는 영속과는 다른 의미입니다.

함수형 메소드는 전역 자료구조나 인수로 전달된 구조를 갱신할 수 없습니다.

만약 자료구조를 바꾼다면 같은 메소드를 여러 번 호출했을 때, 결과가 달라지게 되고 이는 참조 투명성을 위배하며 인수를 단순하게 매핑할 수 있는 능력이 상실되기 때문입니다.

### 19.2.1 파괴적인 갱신과 함수형

참조 변수를 변경함으로써 오는 부작용은 너무 당연한 일이니 생략하겠습니다.

함수형에서는 기존의 자료구조를 갱신하지 않도록 새로운 자료구조를 만들어 반환합니다.

> `영속`: 저장된 값이 다른 누군가에 의해 영향을 받지 않는 상태

## 19.3 스트림과 게으른 평가

### 19.3.1 자기 정의 스트림

```java
public static Stream<Integer> primes(int n) {
	return Stream.iterate(2, i -> i + 1)
		.filter(MyMathUtils::isPrime)
		.limit(n)
}

public static boolean isPrime(int candidate) {
	int candidateRoot = (int) Math.sqrt((double) candidate);
	return IntStream.rangeClosed(2, candidateRoot)
		none.Match(i -> candidate % i == 0);
}
```

후보 수로 정확히 나누어 떨어지는지 매번 모든 수를 반복 확인합니다. (실제 합성수는 나누어 떨어지는지 확인할 필요조차 없음)

이론적을 소수로 나눌 수 있는 모든 수는 제외할 수 있습니다.

1. 소수를 선택할 숫자 스트림이 필요
2. 스트림에서 첫 번째 수를 가져온다. 이 숫자는 소수다. (처음에 이 숫자는 2)
3. 이제 스트림이 꼬리에서 가져온 수로 나누어 떨어지는 모든 수를 걸러 제외
4. 이렇게 남은 숫자만 포함하는 새로운 스트림에서 소수 찾기
5. 1번 부터 반복

즉, 이 함수는 재귀입니다.

#### 💡 1단계 : 스트림 숫자얻기

```java
static IntStream numbers() {
	return IntStream.iterator(2, n -> n + 1);
}
```

#### 💡 2단계 : 머리획득

```java
static int head(IntStream numbers) {
	return numbers.findFirst().getAsInt();
}
```

#### 💡 3단계 : 꼬리 필터링

```java
static IntStream tail(IntStream numbers) {
	return numbers.skip(1);
}
```

#### 💡 4단계 : 재귀적으로 소수 스트림 생성

```java
static IntStream primes(IntStream numbers) {
	int head = head(numbers);
	return IntStream.concat(
		IntStream.of(head)
		primes(tail(numbers).filter(n -> n % head != 0))
	);
}
```

#### 💡 나쁜 소식

위 코드는 사실 예외가 발생합니다. (열심히 작성했는데...)

최종연산은 한 번만 호출할 수 있기 때문입니다.

#### 💡 게으른 평가

`IntStream.concat`은 두 개의 스트림 인스턴스를 인수로 받는데,
두 번째 인수가 primes를 직접 재귀적을 호출하면 무하 재귀에 빠집니다.

concat의 두번 째 인수에서 primes를 게으르게 평가하는 방식으로 문제를 해결할 수 있습니다.

이를 기술적인 프로그래밍 언어의 용어로 `비엄격한 평가`, `이름에 의한 호출` 이라고 합니다.

### 19.3.2 게으른 리스트 만들기

#### 💡 기본적인 연결 리스트

```java
interface MyList<T> {
	T head();
	MyList<T> tail;
	default boolean isEmpty() {
		return true;
	}
}


class MyLinkedList<T> implements MyList<T> {
	private final T head;
	private final MyList<T> tail;
	public MyLinkedList(T head, MyList<T> tail) {
		this.head = head;
		this.tail = tail;
	}

	public T head() {
		return head;
	}

	public MyList<T> tail() {
		return tail;
	}

	public boolean isEmpty() {
		return false;
	}
}

class Empty<T> Implements MyList<T> {
	public T head() {
		throw new UnsuppotedOperationException();
	}
	public MyList<T> tail() {
		throw new UnsuppotedOperationException();
	}

}
```

```java
MyList<Integer myList = new MyLinkedList<>(5, new MyLinkedList<>(10, new Empty()));
```

#### 💡 기본적인 게으른 리스트

```java
class LazyList<T> implements MyList<T> {
	private final head;
	private final Supplier<MyList<T>> tail;

	public LazyList(T head, Supplier<MyList<T>> tail) {
		this.head = head;
		this.tail = tail;
	}

	public T head() {
		return head;
	}

	public MyList<T> tail() {
		return tail.get();
	}

	public boolean isEmpty() {
		return false;
	}
}
```

```java
public static LazyList<Integer> from(int n) {
	return new LazyList<Integer>(n, () -> from(n + 1));
}
```

```java
LazyList<Integer> numbers = from(2);
int two = numbers.head(); // 2
int three = numbers.tail().head());  // 3
```

#### 💡 게으른 필터 구현

```java
public MyList<T> filter(Predicate<T> p) {
	return isEmpty() ?
		this :
		p.test(head()) ?
			new LazyList<>(head,() -> tail().filter(p)) :
			tail().filter(p);
}
```

```java
static <T> void printAll(MyList<T> list) {
	while(!list.isEmpty()) {
		list = list.tail()
	}
}
```

아래 처럼 재귀적으로 문제를 깔끔히 해결 할 수 있습니다.

```java
static <T> void printAl(MyList<T> list) {
	if(list.isEmpty()) return;
	printAll(list.tail());
}
```

하지만, 자바는 꼬리 호출 제거를 지원하지 않음로 스택 오버플로가 발생합니다.

게으른 자료구조가 무조건 좋다는건 아닙니다.

> 게으른 자료구조가 도움을 준다면 사용을 하고, 오히려 효율성이 떨어진다면 전통적인 방식을 사용하는 것이 좋습니다.

## 19.4 패턴 매칭

함수혀 프로그래밍을 구분하는 또 하나의 중요한 특징으로 (구조적인) 패턴 매칭이 있습니다.
(정규표현식과 관련된 패턴 매칭과는 다릅니다.)

> 자바는 패턴 매칭을 지원하지 않습니다.

## 19.5 기타 정보

### 19.5.1 캐싱 또는 기억화

`기억화`는 메소드에 래퍼로 캐시(HashMap 같은)를 추가하는 기법입니다.

캐시에 값이 비어있다면 값을 계산하여 캐시에 저장하고 캐시 값을 반환합니다.

이는 순수 함수형 해결방식은 아니지만 감싼 버전의 코드는 참조투명성을 유지할 수 있습니다.

하지만 `HashMap`은 스레드 안정성이 없으므로 `ConcurrentHahsMap`을 사용하는 것이 더 좋지만 여러 프로세스가 같은 값을 맵에 추가하기 위해 여러 번 계산하는 일은 발생할 수 있습니다.

가장 좋은 방법은 함수형 프로그래밍을 사용해서 동시성과 가변 상태가 만나는 상황을 완전히 없애는 것입니다.

함수형으로 구현했다면 우리가 호출하려는 메소드가 공유된 가변 상태를 포함하지 않음을 미리 알 수 있으므로 동기화 등을 신경 쓸 필요가 없어집니다.

하지만, 캐싱 같은 저수준 성능 문제는 해결되지 않습니다.

### 19.5.2 '같은 객체를 반환함'은 무엇을 의미하는가?

`참조 투명성`은 인수가 같다면 결과도 같아야 합니다.

반환 받은 객체가 서로 다른 참조값을 가지고 있더라도 내부의 값이 완전히 동일하다면 자료구조를 변경하지 않는 한 참조값이 다른것은 의미가 없으므로 같다 라고 할 수 있습니다.

### 19.5.3 콤비네이터

두함수를 인수로 바아 다른 함수를 반환하는 등 함수를 조합하는 고차원 함수를 많이 사용하게 됩니다.

이처럼 함수를 조합하는 기능을 콤비네이터라고 부릅니다.

## 19.6 마치며

- 일급 함수란 인수로 전달하거나, 결과로 반환하거나, 자료구조에 저장할 수 있는 함수다
- 고차원 함수란 한 개 이상의 함수를 인수로 받아서 다른 함수를 반환하는 함수다
- 커링은 함수를 모듈화하고 코드를 재사용할 수 있도록 지원하는 기법
- 영속 자료구조는 갱신될 떄 기존 버전의 자신을 보존. 결과적으로 자신을 복사하는 과정이 따로 필요하지 않음
- 자바의 스트림은 스스로 정의할 수 없음
- 게으른 리스트는 자바 스트림보다 비싼 버전으로 간주할 수 있음
- 패턴 매칭은 자료형을 언랩하는 함수형 기능
- 참조 투염성을 유지하는 상황에서는 계산 결과를 캐시할 수 있음
- 콤비네이터는 둘 이상의 함수나 자료구조를 조합하는 함수형 개념
