---
title: Chapter 7. 병렬 데이터 처리와 성능
date: '2022-04-25'
tags: ['TIL', 'Java', 'Modern Java In Action']
draft: true
summary: Chapter 7. 병렬 데이터 처리와 성능
---

# Chapter 7. 병렬 데이터 처리와 성능

앞서 `데이터 컬렉션`을 `선언형`으로 제어하는 방법을 살펴보았습니다.  
또한, `외부 반복`을 `내부 반복`으로 바꾸면 `네이티브 자바 라이브러리`가 `Stream` 요소의 처리를 제어할 수 있으므로 개발자는 `Collection`의 처리 속도를 높이기 위해 따로 고민할 필요가
없습니다.

> 💡 가장 큰 특징은 `멀티코어`를 활용해서 `Pipeline` 연산을 실행할 수 있다는 점입니다.

`Java 7`이 등장하기 이전에는 데이터를 `병렬`로 처리하기 위해선, 데이터를 `서브파트`로 `분할`하고 각 `Thread`로 할당 한 후, 의도치 않은 `race condition`이 발생하지 않도록
적절한 `동기화`를 추가한 뒤, `부분 결과`를 합쳐야 했습니다.

`Java 7`은 더 쉽게 `병렬화`를 수행하면서 에러를 최소화할 수 있도록 `Fork/Join Framework` 기능을 제공합니다.

`Stream`을 이용하면 `순차 스트림`에서 `병렬 스트림`으로 자연스럽게 변경할 수 있습니다.

## 7.1 병렬 스트림

`Collector`에 `parallelStream`을 호출하면 `병렬 스트림`이 생성됩니다.

`병렬 스트림`이란 각각의 `Thread`에서 처리할 수 있도록 `Stream`요소를 `여러 청크`로 분할한 `Stream`입니다. 따라서, `병렬 스트림`을 이용하면 모든 `멀티코어 프로세서`가 각각의 `청크`를
처리하도록 할당할 수 있습니다.

아래처럼 `무한 스트림`을 만든 다음 인수로 주어진 크기로 `Stream`을 제한하고, 두 숫자를 더하는 `BinaryOperator`로 `reducing`작업을 수행할 수 있다.

```java
class Foo {
	public long sequentialSum(long n) {
		return Stream.iterate(1L, i -> i + 1)
				.limit(n)
				.reduce(0L, Long::sum);
	}
}
```

기존의 자바 코드는 아래처럼 작성할 수 있습니다.

```java
class Foo {
	public long iterativeSum(long n) {
		long result = 0;
		for (long i = 1L; i <= n; i++) {
			result += i;
		}
		return result;
	}
}
```

특히 `n`이 커진다면 `병렬`로 처리하는 것이 더 좋습니다.

위의 코드를 `병렬 처리` 하려면 결과 변수를 어떻게 `동기화`를 하고, 몇 개의 `Thread`를 사용해야 하며, 숫자는 어떻게 생성할지 등등 많은 고민이 필요합니다.

`병렬 스트림`을 이용하면 이런 걱정 없이 모든 문제를 쉽게 해결할 수 있습니다.

### 7.1.1 순차 스트림을 병렬 스트림으로 변환하기

`순차 스트림`에 `parallel` 메소드를 호출하면 기존의 `함수형 reducing 연산`이 `병렬`로 처리됩니다.

```java
public class ParallelStreams {
	public static long parallelSum(long n) {
		return Stream.iterate(1L, i -> i + 1)
				.limit(n)
				.parallel()
				.reduce(Long::sum);
	}
}
```

이전 코드와 다른 점은 `Stream`이 여러 `청크`로 분할되어 `reducing 연산`을 `병렬`로 처리할 수 있다는 점입니다.

`parallel` 메소드를 호출하면 내부적으로 병렬로 수행해야 한다는 것을 의미하는 `boolean flag`가 설정됩니다. 반대로, `sequential` 메소드를 실행하면 `순차 스트림`으로 변경할 수
있습니다.

`parallel`과 `sequential` 메소드 중 최종적을 호출 된 메소드가 전체 `Pipeline`에 영향을 미칩니다.

> #### 💡 병렬 스트림에서 사용하는 스레드 풀 설정
>
> `병렬 스트림`은 내부적으로 `ForkJoinPool`을 사용합니다.
>
> `ForkJoinPool`은 프로세서 수, 즉 `Runtime.getRuntime().availableProcessors()`가 반환하는 값에 상응하는 `Thread`를 갖습니다.
>
> 특별한 이유가 업다면 `ForkJoinPool`의 `기본값`을 그대로 사용할 것을 `권장`합니다.

### 7.1.3 병렬 스트림의 올바른 사용법

`병렬 스트림`을 잘못 사용하면서 발생하는 많은 문제는 공유된 상태를 바꾸는 알고리즘을 사용하기 떄문입니다.

```java

@Getter
public class Accumlator {
	private long total = 0;

	public void add(long value) {total += value;}
}
```

```java
public class SideEffectSumTest {

	@Test
	@DisplayName("Side Effect")
	void sideEffectSum() throws Exception {
		// Given
		final long n = 10_000_000L;
		final Accumlator accumlator = new Accumlator();

		// When
		LongStream.rangeClosed(1, n).forEach(accumlator::add);

		// Then
		System.out.println(accumlator.getTotal()); // 50000005000000
	}
}
```

위 코드는 아무 문제 없이 잘 동작합니다.

하지만, 병렬 처리를 하면 `total`에 접근할 때 `데이터 레이스` 문제가 발생합니다.
이를 막기 위해 `동기화`로 문제를 해결한다면 `병렬화`를 한 이유가 없어져 버리게 됩니다.

```java
public class SideEffectSumTest {
	@Test
	@DisplayName("병렬처리")
	void sideEffectParallelSum() throws Exception {
		// Given
		final long n = 10_000_000L;
		final Accumlator accumlator = new Accumlator();

		// When
		LongStream.rangeClosed(1, n).parallel().forEach(accumlator::add);

		// Then
		System.out.println(accumlator.getTotal()); // 2911581878027
	}
}
```

성능은 둘 째 치고, 애초에 결과 값 부터 잘못 나옵니다.

`valua + total`은 아토믹 연산 같지만 실은 아토믹 연산이 아닙니다.
그래서 여러 스레드에서 공유하는 객체의 상태를 바꾸기 때문에 이러한 현상이 일어난것 입니다.

`병렬 스트림`과 `병렬 계산`에서는 `공유된 가변 상태`를 피해야 한다는 사실을 알 수 있습니다.

### 7.1.4 병렬 스트림 효과적으로 사용하기

`천 개 이상의 요소가 있을 떄만 병렬 스트림을 사용하라` 같이 양을 기준으로 병렬 스트림 사용 여부를 판단하는것을 적절하지 않습니다.  
하드웨어가 좋을수도 있고 같은 외부 요인들도 있기 때문입니다.

그럼에도 병렬화 사용에 대해 참고해볼 몇가지 기준이 있습니다.

- 확신이 서지 않으면 `직접 측정`하라.
  - 순차 스트림을 병렬 스트림으로 쉽게 바꿀 수 있기 때문에 `성능을 측정`해보고 변경하는 것이 좋습니다.
- `박싱을 주의`하라.
- `순차 스트림`보다 `병렬 스트림`에서 성능이 떨어지는 연산이 있다.
  - `limit`, `findFirst`처럼 요소의 순서에 의존하는 연산을 병렬 스트림으로 수행할려면 비싼 비용을 치러야 합니다.
- 스트림에서 수행하는 `전체 파이프라인 연산 비용을 고려`하라.
  - 처리해야할 요소가 `N`, 요소를 처리하는데 드는 비용 `Q`라고 했을 때, `N*Q`로 예상할수 있습니다.
  - `Q`가 높아진다는 것을 `병렬 스트림`으로 성능을 개선할 수 있는 가능성이 있다는 것을 의미합니다.
- `소량의 데이터`에서는 병렬 스트림이 도움 되지 않는다.
  - 소량의 데이터는 병렬하 과정에서 생기는 부가 비용이 더 들수 있습니다.
- 스트림을 구성하는 `자료구조가 적절한지 확인`하라.
  - 예를 들어 `ArrayList`가 `LinkedList`보다 효율적으로 분할할 수 있습니다.
  - `LinkedList`는 분할하기 위해 모든 요소를 탐색해야하는 반면, `ArrayList`는 요소를 탐색하지 않고도 분할이 가능하기 때문입니다.
- `스트림의 특성`과 `파이프라인의 중간 연산`이 스트림의 특성을 어떻게 바꾸는지에 따라 `분해과정의 성능`이 달라질 수 있다.
  - `SIZED` 스트림은 정확히 같은 크기의 두 스트림으로 분할할 수 있으므로 성능이 좋습니다.
  - 반면, `filter`연산이 있으면 스트림이 길이를 예측하기 어려워 효과적으로 병럴 처리할 수 있을지 알 수 없게 됩니다.
- `최종 연산`의 `병합 가정 비용`을 살펴보라.

| 소스            | 분헤성 |
| --------------- | ------ |
| ArrayList       | 훌륭함 |
| LinkedList      | 나쁨   |
| IntStream.range | 훌륭함 |
| Stream.iterate  | 나쁨   |
| HashSet         | 좋음   |
| TreeSet         | 좋음   |
