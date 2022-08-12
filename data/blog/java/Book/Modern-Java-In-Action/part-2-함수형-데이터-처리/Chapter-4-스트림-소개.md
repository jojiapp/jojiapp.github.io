---
title: Chapter 4. 스트림 소개
date: '2022-04-15'
tags: ['Java', 'Modern Java In Action']
draft: false
summary: Chapter 4. 스트림 소개
---

# Chapter 4. 스트림 소개

거의 모든 `Java Application`은 `Collection`을 만들고 처리하는 과정을 포함합니다.

`Collection`으로 데이터를 그룹화하거나, `Collection`을 반복하면서 특정 값을 더하는 등의 처리를 할 수 있습니다. 하지만, 아직 완벽한 `Collection` 관련 연산을 지원하려면 한참
멀었습니다.

예를 들어, 요리 관련 `Application`이 있다고 할 때, 대부분의 비즈니스 로직은 카테고리로 `그룹화`를 하거나 `가장 비싼 요리`를 찾는 등의 `연산`이 포함됩니다.  
대부분의 `Database`에서는 `SELECT name FROM dishes WHERE calorie < 400`처럼 `선언형`으로 이와 같은 연산을 표현할 수 있습니다. 사용하는 입장에서는 어떻게 필터링할
것인지는 구현할 필요가 없습니다.

또한, 많은 요소를 포함하는 커다란 `Collection`의 경우 성능을 높이려면 `멀티코어 아키텍쳐`를 활용해서 `병렬`로 처리해야 합니다.  
하지만, `병렬 처리` 코드는 `단순 반복 처리` 코드에 비해 복잡하고 어렵습니다.

이와 같은 문제를 해결하기 위해 `Steam`이 등장 했습니다.

## 4.1 스트림이란 무엇인가?

`Stream`은 `Java 8`에 추가된 새로운 기능입니다.

`Stream`을 이용하면 `선언형`으로 `Collection` 데이터를 처리할 수 있습니다. 또한, `멀티스레드 코드`를 구현하지 않아도 데이터를 `투명하게` `병렬`로 처리할 수 있습니다.

예를 들어, 저칼로리 요리명을 반환하고, 칼로리를 기준으로 요리를 정렬하는 로직을 `Java 7`에서는 아래와 같이 작성합니다.

```java
class Foo {
	public static void main(String[] args) {
		// 저칼로리 요리 추출
		List<Dish> lowCaloricDishes = new ArrayList<>();
		for (Dish dish : menu) {
			if (dish.getCalories() < 400) {
				lowCaloricDishes.add(dish);
			}
		}
		// 칼로리 기준 정렬
		Collections.sort(lowCaloricDishes, new Comparator<Apple>() {
			@Override
			public int compare(Dish dish1, Dish dish2) {
				return Integer.compare(dish1.getCalories(), dish2.getCalories());
			}
		});
		// 요리 이름 선택
		List<String> lowCaloricDishNames = new ArrayList<>();
		for (Dish dish : lowCaloricDishNames) {
			lowCaloricDishNames.add(dish.getName());
		}
	}
}
```

위의 예제에서는 `lowCaloricDishes`라는 `컨테이너 역할`만 하는 `가비지 변수`를 사용했습니다.
`Java 8`에서는 이러한 `세부 구현`을 라이브러리 내에서 모두 처리 합니다.

아래는 `Java 8`의 `Stream`을 이용한 방법입니다.

```java
class Foo {
	public static void main(String[] args) {
		List<String> lowCaloricDishNames = menu.stream()
				.filter(d -> d.getCalories() < 400)
				.sorted(comparing(Dish::getCalories))
				.map(Dish::getName)
				.collect(toList());
	}
}
```

위의 로직에서 `stream()`을 `parallelStream()`으로 변경하면 `멀티코어 아키텍처`에서 `병렬`로 실행할 수 있습니다.

`Stream`으로 코드를 구현하면 다음과 같은 장점이 있습니다.

- `선언형`으로 코드를 구현
  - `세부 구현`은 하지 않고 **저칼로리의 요리만 선택하라** 같은 동작의 수행을 지정할 수 있습니다.
  - `동작 파라미터화`를 활용하면 저칼로리 대신 고칼로리로 요구사항이 변경되어도 대응하기가 쉽습니다.
- `가독성`
  - 여러 연산을 `Pipeline`으로 연결해도 여전히 `가독성`과 `명확성`이 유지됩니다.
- `조립할 수 있음`
  - `유연성`이 더 좋아집니다.
- `병렬화`
  - 성능이 좋아집니다.

`filter`, `sorted`, `map`, `collect` 같은 연산은 `고수준 빌딩 블록`으로 이루어져 있어, 특정 `스레딩 모델`에 제한되지 않고 어떤 상황에서든 사용할 수 있습니다. 또한, 멀티코어
아키텍처를 최대한 `투명하게 활용`할 수 있게 구현되어 있습니다.

즉, `데이터 처리 과정`을 `병렬화` 하면서 `스레드`와 `락`을 걱정할 필요가 없어집니다.

> `구글`에서 만든 `구아바`, `아파치 공통 컬렉션 라이브러리`, `마리오 푸스코`가 만든 `람다제이` 같은 `기타 라이브러리`도 있습니다.

## 4.2 스트림 시작하기

`Java 8`에는 `stream` 메소드가 추가 되었습니다. `(java.util.stream.Stream 참고)`

`숫자 범위`나 `I/O`자원에서 `Stream` 요소를 만드는 등 `stream` 메소드 외에도 다양한 방법으로 `Stream`을 만들 수 있습니다.

> 💡 `Stream`이란 **데이터 처리 연산을 지원하도록 소스에서 추출된 연속된 요소** 입니다.

### Stream 특징

#### 💡 연속된 요소

- `Collection`과 마찬가지로 특정 요소 형식으로 이루어진 `연속된 값 집합`의 `interface`를 제공합니다.
- `Collection`은 요소 `저장` 및 `접근 연산`이 주를 이루는 반면, `Stream`은 `표현 계산식`이 주를 이룹니다.
- 즉, `Collection`의 주제는 `데이터`이고, `Stream`의 주제는 `계산`입니다.

#### 💡 소스

- `Collection`, `Array`, `I/O` 자원 등의 데이터 제공 소스로 부터 데이터를 소비하기 때문에, 정렬된 `Collection`으로 부터 `Stream`을 생성하면 정렬이 그대로 유지됩니다.

#### 💡 데이터 처리 연산

- `함수형 프로그래밍`에서 일반적으로 지원하는 연산 및 `Database`와 비슷한 연산을 지원합니다.
- `순차적` 또는 `병렬`로 실행할 수 있습니다.

#### 💡 파이프라이닝

- 대부분의 `Stream` 연산은 `Stream` 연산끼리 연결하여 커다란 `Pipeline`을 구성할 수 있도록 `Stream`자신을 `반환`합니다.
- 그 덕에 `laziness`, `short-circuiting`같은 최적화도 얻을 수 있습니다.

#### 💡 내부 반복

- `Collection` 처럼 반복자를 이용하여 `명시적으로 반복`하는 것과 달리 `내부 반복`을 지원합니다.

## 4.3 스트림과 컬렉션

`Collection`과 `Stream` 모두 **연속된 요소 형식의 값**을 저장하는 인터페이스를 제공합니다. 가장 큰 차이는 데이터를 `언제` 처리하느냐입니다.

`Collection`의 모든 요소는 `Collection`에 추가하기 이전에 모두 계산되어야 하는 반면,
`Stream`은 이론적으로 **요청할 때만 요소를 계산**하는 `고정된 자료구조`입니다. (`Stream`에는 요소를 `추가`하거나 `삭제`할 수 없습니다.)

`Stream`은 게으르게 생성되는 `Collection`과 같습니다. (`Collection`은 적극적으로 생성됩니다.)

예를 들어 영화를 본다고 생각해보면, `Collection`은 전체 영화 데이터를 다 받아야 볼 수 있는 반면, `Stream`은 다운로드 되는 부분부터 미리 볼 수 있습니다. 영화를 보는 사이 뒷 부분을 다운로드
하기 때문에 사용자 입장에서는 영화를 더 빠르게 볼 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		List<Apple> apples = new ArrayList<>();
		for (int i = 0; i < 10000000; i++) {
			apples.add(new Apple(i, Color.GREEN));
		}

		long startList = System.currentTimeMillis();
		List<Apple> listApples = new ArrayList<>();
		for (Apple apple : apples) {
			if (apple.getWeight() > 50) {
				listApples.add(apple);
			}
		}
		System.out.println("list time: " + (System.currentTimeMillis() - startList));

		long startStream = System.currentTimeMillis();
		List<Apple> streamApples = apples.stream().filter(apple -> apple.getWeight() > 50000).collect(Collectors.toList());
		System.out.println("stream time: " + (System.currentTimeMillis() - startStream));

		// list time: 74
		// stream time: 60
	}
}
```

위 처럼 `10000000 건`을 처리하는 로직을 작성했을 떄, `Stream`이 조금 더 빠른걸 확인할 수 있습니다.

### 4.3.1 딱 한 번만 탐색할 수 있다

탐색된 `Stream` 요소는 소비되기 때문에 반복자와 마찬가지로 한 번 더 탐색하기 위해선 초기 데이터 소스에서 새로운 `Stream`을 만들어야 합니다.

그러려면 `Collection` 처럼 반복 사용할 수 있는 데이터 소스여야 합니다. 만약 데이터 소스가 `I/O` 채널이라면 소스를 반복 사용할 수 없으므로 새로운 `Stream`을 만들 수 없습니다.

> 💡 `Stream`은 단 한번만 소비할 수 있습니다.

> #### 💡 스트림과 컬렉션의 철학적 접근
>
> `Stream`은 **시간적으로 흩어진 값의 집합**으로 간주할 수 있습니다. 반면, `Collection`은 특정 시간에 모든 것이 존재하는 **공간에 흩어진 값**에 비유할 수 있습니다.

### 4.3.2 외부 반복과 내부 반복

`Collection`을 사용하려면 사용자가 직접 `for-each`문을 사용해야 합니다. 이를 `외부 반복` 이라고 합니다.

```java
class Foo {
	public static void main(String[] args) {
		List<String> names = new ArrayList<>();
		for (Dish dish : menu) {
			names.add(dish.getName());
		}
	}
}
```

반면, `Stream`은 반복을 알아서 처리해주고 결과 `Stream 값`을 어딘가에 저장해주는 `내부 반복`을 사용합니다.

`Stream`은 함수에 어떤 작업을 수행할지만 지정하면 모든 것이 알아서 처리 됩니다.

```java
class Foo {
	public static void main(String[] args) {
		List<String> names = menu.stream()
				.map(Dish::getName)
				.collect(toList());
	}
}
```

> #### 💡 외부 반복과 내부 반복의 차이
>
> `외부 반복`은 한 번에 한 가지 일만 시킬 수 있습니다. 반면, `내부 반복`은 한 번에 모든 일을 말하고 시킬수 있습니다.
>
> 예를 들어 아이에게 장난감 정리를 시킨다고 가정하면 `외부 반복`의 경우 장난감 하나하나 말하며 장난감 상자에 넣으라고 말해야 합니다. 그러면 아이 또한, 한 번에 한가지 장난감만 넣을수 있게 됩니다.
>
> 반면, `내부 반복`을 사용하면 아이에게 모든 장난감을 상자에 넣어라고 말할수 있고, 그러면 아이는 한 번에 여러 장난감을 집어 상자에 넣을 수 있습니다. 또한, 상자 근처로 이동하여 동선을 최소화할 수도
> 있습니다.

> 이렇듯 `내부 반복`을 사용하면 최적화된 다양한 순서로 처리할 수 있습니다.

또한, `Stream`의 `내부 반복`은 데이터 표현과 하드웨어를 활용한 `병렬성 구현`을 `자동`으로 선택하는 반면, `외부 반복`은 사용자가 스스로 해야합니다.

## 4.4 스트림 연산

`Stream interface`의 연산은 크게 두 가지로 정의할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		menu.stream() // Stream 얻기
				.filter(dish -> dish.getCalories() > 300) // 중간 연산
				.map(Dish::getName) // 중간 연산
				.limit(3) // 중간 연산
				.collect(toList()); // Stream을 List로 반환
	}
}
```

- `중간 연산`
  - `filter`, `map`, `limit`처럼 서로 연결되어 `Pipeline`을 형성합니다.
- `최종 연산`
  - `collect` 처럼 `Pipeline`를 실행한 다음 닫습니다.

### 4.4.1 중간 연산

`중간 연산`의 특징은 `단말 연산`을 `Stream Pipeline`에 실행하기 전까지는 아무 연산도 수행하지 않는다는 것입니다.

`중간 연산`을 합친 다음에 합쳐진 `중간 연산`을 `최종 연산`으로 **한번에 처리**하기 때문에 `게으르다`는 것입니다.

```java
class Foo {
	public static void main(String[] args) {
		List<Apple> apples = new ArrayList<>();
		for (int i = 0; i < 90000000; i++) {
			apples.add(new Apple(i, Color.GREEN));
		}
		apples.stream()
				.filter(apple -> {
					System.out.println("filter");
					return apple.getWeight() > 1;
				})
				.map(apple -> {
					System.out.println("map");
					return apple.getColor();
				})
				.limit(3)
				.collect(Collectors.toList());
		// filter
		// filter
		// filter
		// map
		// filter
		// map
		// filter
		// map
	}
}
```

병렬적으로 처리 될 뿐 아니라, 데이터 요소가 `90000000 건`이나 있음에도 `limit`연산 덕분에 전체를 순회하지 않고 3개를 찾으면 연산을 종료하기 떄문에 빠르게 결과를 도출합니다.

이는 `쇼트서킷`이라는 기법 덕분에 가능한 것입니다.

또한, `filter`와 `map`이 한 과정으로 병합되는 것을 `루프 퓨전 (loop fusion)`이라고 합니다.

### 4.4.2 최종 연산

`최종 연산`은 `Stream Pipeline`에서 결과를 도출합니다.

```java
class Foo {
	public static void main(String[] args) {
		menu.stream().forEach(System.out::println);
	}
}
```

위는 `menu`에서 만든 `Stream`을 모두 출력하는 것입니다. 반환 값은 `void`입니다.

### 4.4.3 스트림 이용하기

`Stream` 이용과정을 요약하면 다음과 같습니다.

- 질의를 수행할 데이터 소스
- `Stream Pipeline`을 구성할 `중간 연산` 연결
- `Stream Pipeline`을 실행하고 결과를 만들 `최종 연산`

> 💡 `Stream Pipeline`은 `호출을 연결 (중간 연산)`해서 설정을 만든 뒤, `build (최종 연산)`를 통해 결과를 반환하는 `Builder Pattern`과 비슷합니다.

## 4.6 마치며

- `Stream`은 소스에서 추출된 `연속 요소`로, `데이터 처리 연산`을 지원합니다.
- `내부 반복`을 지원합니다. `내부 반복`은 `filter`, `map`, `sorted`등의 연산으로 반복을 `추상화`합니다.
- `Stream`에는 `중간 연산`과 `최종 연산`이 있습니다.
- `중간 연산`은 `filter`, `map` 처럼 `Stream`을 반환하면서 다른 연산과 연결되는 연산이며, **어떤 결과도 생성할 수 없다는게 특징**입니다.
- `최종 연산`은 `forEach`나 `collect`처럼 `Stream Pipeline`을 처리해서 결과를 반환합니다.
- `Stream`은 요쇼를 요청할 때 `게으르게` 계산됩니다.
