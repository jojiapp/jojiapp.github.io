---
title: Chapter 11. null 대신 Optional 클래스
date: '2022-07-04'
tags: ['Java', 'Modern Java In Action']
draft: false
summary: Chapter 11. null 대신 Optional 클래스
---

# Chapter 11. null 대신 Optional 클래스

`1965년` `토니 호어`라는 컴퓨터과학자가 알골을 설계하면서 처음 `null 참조`가 `등장`하였습니다.

컴파일러의 자동 확인 기능으로 모든 참조를 안전하게 사용할 수 있을 것을 목표로 정했고,
그 당시에는 null 참조 및 예외로 값이 없는 상황을 가장 단순하게 구현할 수 있다고 판단 했기에 null 및 관련 예외가 탄생합니다.

이후 토니 호어는 십억 달러짜리 실수라고 했습니다.

## 11.1 값이 없는 상황을 어떻게 처리할까?

```java

@Getter
public class Person {
	private Car car;
}

@Getter
class Car {
	private Insurance insurance;
}

@Getter
class Insurance {
	private String name;
}
```

```java
public class Chap11 {

	@Test
	@DisplayName("NullPointerException 발생 경우")
	void test1() throws Exception {
		Person person = new Person();
		assertThatThrownBy(() -> person.getCar().getInsurance().getName())
			.isInstanceOf(NullPointerException.class);
	}
}
```

`Person`이 가지고 있는 `Car` 필드가 만약 `null`이라면 `getInsurance`를 호출할 수 없어 `NullPointerException`이 발생하게 됩니다.

이외에도 `Person`부터 `null`이라면? 그 보다 상위 객체가 있어 그 객체가 또 `null` 이라면? `NullPointerException`의 지옥에 빠지게 될게 뻔합니다.

### 11.1.1 보수적인 자세로 NullPointerException 줄이기

사용하는 모든 객체를 null인지 아닌지 체크하는 방법으로 `NullPointerException`을 피할 수 있습니다.

하지만 `Person`안의 `Car`안의 `Insurance`객체를 사용하기 위해 Person, Car, Insurance 객체를 `매번 if`로 `null`을 `체크`하는 방식은 좋지 않아 보입니다.

### 11.1.2 null 때문에 발생하는 문제

- `에러의 근원이다`: NullPointerException은 자바에서 가장 흔히 발생하는 예러
- `코드를 어지럽힌다`: 중첩된 null 확인 코드를 추가해야 하므로 null 때문에 코드 가독성이 떨어짐
- `아무 의미가 없다`: null은 아무 의미가 없음. 정적 타입 언어에서 값이 없을을 표현하는 방법으로 적절하지 않음
- `자바 철학에 위배된다`: 자바는 개발자로 부터 모든 포인터를 속였으나, 예외로 null 포인터만 존재
- `형식 시스템에 구멍을 만든다`: 모든 참조 형식에 null을 할당할 수 있기 때문에 애초에 해당 null이 어떤 의미로 사용되었는지 알 수 없음

### 11.1.3 다른 언어는 null 대신 무얼 사용하나?

그루비나 코틀린 같은 언어는 `안전 내비게이션 연산자 (?.)`를 도입해서 null 문제를 해결했습니다.

`안전 내비게이션 연산자`는 `호출 체인`에 `null인 참조`가 있으면 결과로 `null을 반환`하고 아니면 정상적으로 결과를 반환합니다.

```kotlin
class Kotlin {
	fun test1() {
		val person = Person()
		person?.car?.insurance?.name
	}

}
```

또한, 필드를 선언할 때부터 null이 할당 될수 있는 필드인지를 지정할 수도 있습니다.

```kotlin
class Kotlin {
	private val car: Car? // null 허용
	private val insurance: Insurance // null 허용 안함
}
```

`자바`에서는 안전 내비게이션 연산자 대신 `Optional<T>` 클래스를 `제공`하여 해결합니다.

## 11.2 Optional 클래스 소개

`Java 8` 하스켈과 스칼라의 영향을 받아 `java.util.Optional<T>`라는 새로운 클래스를 제공합니다.

값이 있으면 `Optional 클래스는 값을 감싸고`, `없으면 Optional.empty` 메소드로 Optional을 반환하는 `선택형값을 캡슐화하는 클래스` 입니다.

`null`과 `Optional.empty`는 차이가 없어보이지만, 활용하는데에는 차이가 많습니다.

가령 `Optional.empty`의 경우 다른 객체를 반환하거나, 예외를 던지는 등의 작업을 할 수 있습니다.

## 11.3 Optional 적용 패턴

### 11.3.1 Optional 객체 만들기

#### 빈 Optional

`Optional.empty` 메소드를 사용하여 생성할 수 있습니다.

```java
public class Chap11 {
	void test2() throws Exception {
		Optional<Object> empty = Optional.empty();
	}
}
```

#### null이 아닌 값으로 Optional 만들기

`Optional.of`를 이용하여 생성할 수 있습니다. 이때, 값이 `null`이라면 즉시 `NullPointerException`이 `발생`합니다.

```java
public class Chap11 {
	void test2() throws Exception {
		Person person = new Person();
		Optional<Person> optionalPerson = Optional.of(person);
	}
}
```

#### null값으로 Optional 만들기

`Optional.ofNullable()` 메소드를 이용하여 `null`의 가능성이 있는 객체를 생성할 수 있습니다.

값이 널이라면 `empty`를 아니라면 `of`로 생성됩니다.

```java
public class Chap11 {
	void test2() throws Exception {
		Person person = null;
		Optional<Person> optionalPerson = Optional.ofNullable(person);
	}
}
```

### 11.3.2 맵으로 Optional의 값을 추출하고 변환하기

`map` 메소드를 이용하여 값에 접근하여 변환하여 값을 가져올수 있습니다.

`Stream`에서의 `map`의 역할 또한 위와 동일합니다.

```java
public class Chap11 {
	void test2() throws Exception {
		Insurance insurance = new Insurance();
		Optional<Insurance> optionalInsurance = Optional.ofNullable(insurance);
		Optional<String> optionalName = optionalInsurance.map(Insurance::getName);
	}
}
```

### 11.3.3 flatMap으로 Optional 객체 연결

위에서 살펴봤던 `person.getCar().getInsurance().getName()`의 경우
`person`뿐만 아니라 `car`, `insurance`도 `Optional` 감싸져 있을텐데 그렇다면 `map`내에서 또 다른 `map`을 호출해야 할 것이고,
그럴때 마다 `Optional`은 계속 감싸지게 될 것입니다.

```java
public class Chap11 {
	void test2() throws Exception {
		Optional<Person> person = Optional.empty();
		Optional<Optional<Optional<String>>> optional = person.map(Person::getCar)
			.map(car -> car.map(Car::getInsurance))
			.map(car -> car.map(insurance -> insurance.map(Insurance::getName)));
	}
}
```

이런 부분은 `flatMap`을 이용하여 해결할 수 있습니다.

```java
public class Chap11 {
	void test2() throws Exception {
		person.flatMap(Person::getCar)
			.flatMap(Car::getInsurance)
			.map(Insurance::getName);
	}
}
```

> #### 💡 도메인 모델에 Optional을 사용했을 때 데이터를 직렬화할 수 없는 이유
>
> 자바 언어 아키텍트인 `브라이언 고츠`는 `Optional`의 용도가 선택형 반환값을 지원하는 것이라고 못박았습니다.
>
> `Optional 클래스`는 필드 형식을 사용할 것을 가정하지 않았으므로 `Serializable` 인터페이스를 구현하지 않기 때문에 직렬화할 수 없습니다.
>
> 그렇기 때문에 필요에 따라 `Optional 클래스`로 `감싼 객체`를 반환하는 `Getter`를 만드는 것을 `권장`합니다.
