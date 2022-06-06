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

## 7.2 포크/조인 프레임워크

`포크/조인 프레임워크`는 병렬화할 수 있는 작업을 재귀적으로 분할하여 서브태스크 각각의 결과를 합쳐서 전체 결과를 만들도록 설계 되었습니다.

### 7.2.1 RecursiveTask 활용

`스레드 풀`을 이용하려면 `RecursiveTask<V>`의 서브클래스를 만들어야 합니다.

`V`은 병렬화된 태스크가 생성하는 `결과 형식`, 결과가 없을 떄는 `RecursiveAction` 형식 입니다.

`RecursiveTask`를 정의하려면 추상 메소드 `compute`를 구현해야 합니다.

`compute` 메소드는 태스크를 `서브태스크로 분할`하는 로직과 더이상 분할 할 수 없을 떄 `개별 서브태스크의 결과를 생산`할 알고리즘을 정의합니다.

```java
public class ForkJoinSumCalculator extends RecursiveTask<Long> {
  public static final long THRESHOLD = 10_000L;
  private final long[] numbers;
  private final int start;
  private final int end;

  public ForkJoinSumCalculator(long[] numbers) {
    this(numbers, 0, numbers.length);
  }

  public ForkJoinSumCalculator(long[] numbers, int start, int end) {
    this.numbers = numbers;
    this.start = start;
    this.end = end;
  }

  @Override
  protected Long compute() {
    int length = end - start;
    if (length <= THRESHOLD) {
      return computeSequentially();
    }
    ForkJoinSumCalculator leftTask = new ForkJoinSumCalculator(numbers, start, start + length / 2);
    leftTask.fork();
    ForkJoinSumCalculator rightTask = new ForkJoinSumCalculator(numbers, start + length / 2, end);
    Long rightResult = rightTask.compute();
    Long leftResult = leftTask.join();

    return rightResult + leftResult;
  }

  private long computeSequentially() {
    long sum = 0;
    for (int i = start; i < end; i++) {
      sum += numbers[i];
    }
    return sum;
  }
}
```

```java
public class ForkJoinSumCalculatorTest {
  @Test
  @DisplayName("자연수 덧셈 병렬")
  void forkJoinSum() throws Exception {
    // Given
    Long n = 10_000_000L;
    long[] numbers = LongStream.rangeClosed(1, n).toArray();

    // When
    ForkJoinTask<Long> forkJoinSumCalculator = new ForkJoinSumCalculator(numbers);

    // Then
    Long actual = new ForkJoinPool().invoke(forkJoinSumCalculator);
    Assertions.assertThat(actual).isEqualTo(50000005000000L);
  }
}
```

위 코드는 `n`까지의 자연수를 입력받아 덧셈 작업을 병렬로 처리하는 로직입니다.

> 일반적으로 애플리케이션에서 `ForkJoinPool`을 싱클턴으로 만들어 사용합니다.

#### 💡 ForkJoinSumCalculator 실행

`ForkJoinSumCalculator`를 `ForkJoinPool`로 전달하면 풀의 스레드가 `ForkJoinSumCalculator`의 `compute`를 실행하면서 작업을 수행합니다.

`compute` 메소드는 병렬로 실행할 수 있을 만큼 태스크의 크기가 작아졌는지 확인하며, 만족되는 크기가 될 떄 까지 재귀적으로 분할합니다.  
이후, 각 `서브태스크`는 `순차적을 처리`되며 `포킹 프로세스`로 만들어진 `이진트리`의 태스크를 루트에서 `역순으로 방문`합니다.

각 서브태스크의 부분 결과를 합쳐서 태스크의 최종 결과를 계산합니다.

### 7,2.2 포크/조인 프레임워크를 제대로 사용하는 방법

- `join` 메소드를 태스크에 호출하면 태스크가 생산하는 결과가 준비될 때까지 호출자를 블록 시킵니다.  
  따라서 **두 서브태스크가 모두 시작된 다음에 `join`을 호출해야 합니다.**
- `RecursiveTask` 내에서는 `ForkJoinPool`의 `invoke` 메소드를 사용하면 안됩니다. 대신 `compute`나 `fork` 메소드를 직접 호ㅜㄹ 할 수 있습니다.  
  순차코드에서 병렬 계산을 시작할 때만 `invoke`를 사용합니다.
- 서브태스크에 `fork` 메소드를 호출해서 `ForkJoinPool`의 일정을 조절할 수 있습니다.
  - 위의 코드에서 두 작업 모두 `fork`를 호출하는 것이 자연스러울 것 같지만, 한 쪽 작업은 `compute`를 호출하는것이 효율적입니다.
  - 두 서브태스크의 한 태스크에는 `같은 스레드를 재사용`할 수 있기 때문에 풀에서 `불필요한 태스크를 할당하는 오버헤드`를 피할 수 있습니다.
- `포크/조인 프레임워크`를 이용하는 병렬 계산은 `디버깅`하기 어렵습니다.
- `멀티코어`에 `포크/조인 프레임워크`를 사용하는 것이 `순차 처리`보다 `무조건 빠를 거라는 생각`은 버려야합니다.

### 7.2.3 작업 훔치기

`코어 개수`와 관계없이 `적절한 크기로 분할`된 많은 태스크를 포킹하는 것이 바람직합니다.

이렇게 하기 위해 포크/조인 프레임워크는 `작업 훔치기`라는 기법으로 이 문제를 해결합니다.

한 스레드는 다른 스레드보다 자신에게 할당딘 태스크를 더 빨리 처리할 수 있습니다.  
이렇게 할 일을 끝낸 스레드를 방치하는것이 아니라 `다른 스레드의 큐의 꼬리`에서 작업을 훔쳐옵니다.

## 7.3 Spliterator 인터페이스

`Java 8`은 `Spliterator`라는 새로운 인터페이스를 제공합니다.

`Spliterator`는 분할할 수 있는 반복자 라는 의미로 `Iterator`처럼 요소 탐색기능을 제공하나 `병렬 처리에 특화`된 인터페이스 입니다.

```java
public interface Spliterator<T> {
  boolean tryAdvance(Consumer<? super T> action);

  Spliterator<T> trySplit();

  long estimateSize();

  int characteristics();
}
```

`T`는 `Spliterator`에서 탐색하는 요소의 형식을 가리킵니다.

### 7.3.1 분할 과정

1. 첫 번째 `Spliterator`에서 `trySplit`을 호출하면 두 번째 `Spliterator`이 생성 됨
2. 생성 된 `Spliterator`에서 `trySplit`를 `null`이 될 때 까지 호출하여 분할
3. 모든 `trySplit`이 `null`을 반환하면 재귀 분할 과정 종료

#### 💡 Spliterator 특성

`Spliterator`은 `characteristics`라는 추상 메소드도 정의합니다.

`characteristics` ㅊ상 메소드는 `Spliterator`자체의 특성 집합을 포함하는 `int`를 반환합니다.
`Spliterator`를 이용하는 프로그램은 이들 특성을 참고해서 더 잘 제어하고 최적화 할 수 있습니다.

| 특성       | 의미                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| ORDERED    | 리스트처럼 요소에 정해진 순서가 있으므로 Spliterator 요소를 탐색하고 분할할 때 이 순서에 유의 |
| DISTINCT   | x, y 두 요소를 방문했을 때 `x.equals(y)`는 항상 `false`                                       |
| SORTED     | 탐색된 요소는 미리 정의된 정렬 순서를 따름                                                    |
| SIZED      | 크기가 알려진 소스값을 반환                                                                   |
| NON-NULL   | 탐색하는 모든 요소는 `NULL이 아님`                                                            |
| IMMUTABLE  | Spliterator `소스는 불변`                                                                     |
| CONCURRENT | 동기화 없이 Spliterator의 소스를 `여러 스레드에서 동시에 고칠 수 있음`                        |
| SUBSIZED   | 모든 Spliterator은 `SIZED 특성`을 가짐                                                        |
