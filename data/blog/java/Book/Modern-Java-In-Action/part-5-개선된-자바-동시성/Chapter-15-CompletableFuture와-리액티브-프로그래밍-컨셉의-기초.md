---
title: Chapter 15. CompletableFuture와 리액티브 프로그래밍 컨셉의 기초
date: '2022-07-31'
tags: ['Java', 'Modern Java In Action']
draft: false
summary: Chapter 15. CompletableFuture와 리액티브 프로그래밍 컨셉의 기초
---

# Chapter 15. CompletableFuture와 리액티브 프로그래밍 컨셉의 기초

최근 소프트웨어 개발 방법을 획기적으로 뒤집은 두 가지 추세가 있습니다.

- 애플리케이션을 실행하는 하드웨어와 관련된 것 `(ex 병렬성)`
- 애플리케이션을 어떻게 구성할것인가와 관련된 것 `(ex 마이크로서비스 아키텍쳐)`

우리는 하나의 애플리케이션을 만들기 위해 여러 서버에서 API를 호출하여 데이터를 받아 만들게 됩니다.

이때, 호출할 `API가 10개`이고 각 `API가 1초씩` 걸린다고 가정하면 `10초`라는 시간이 소요됩니다.

각 요청이 서로 값을 필요로 하는 경우가 아니라면 `동시에 10개`를 다 `호출`해서 받아올 수 있으면 좋을 것입니다.

이때 사용되는 개념이 `병렬성`입니다.

> #### 💡 동시성과 병렬성
>
> - `동시성`: 단일 코어에서 빠르게 스위칭하며 작업을 동시에 하는것 처럼 하는 것
> - `병렬성`: 여러 코어에서 동시에 실행 (하드웨어 수준에서 지원)

## 15.1 동시성을 구현하는 자바 지원의 진화

- `초기`: `Runnable`과 `Thread`를 동기화된 클래스와 메소드를 이용해 잠굼
- `Java 5`
  - 스레드 실행과 태스크 제출을 분리하는 `ExecutorService 인터페이스`
  - 높은 수준의 결과 `Runnable`
  - `Thread`의 변형을 반환하는 `Callable`, `Future<T>`, 제네릭 등
  - `ExecutorServices`는 `Runnable`과 `Callable` 둘 다 실행할 수 있음
- `Java 7`: `fork/join` 구현을 지원하는 `RecursiveTask` 추가
- `Java 8`
  - `Stream`과 `람다` 지원에 기반한 병렬 프로세싱 추가
  - `Future`를 조합하는 기능을 추가하면서 동시성 강화 (`CompletableFuture`)
- `Java 9`
  - 분산 비동기 프로그래밍을 명시적으로 지원
  - 발행-구독 프로토콜 `Flow 인터페이스` 추가

> 다양한 웹 서비스를 이용하고 이들 정보를 실시간으로 조합해 사용자에게 제공하거나 추가 웹 서비스를 통해 제공하는 종류의 애플리케이션을 개발하는데 필수적인 기초 모델과 툴킷을 제공합니다.
>
> 이 과정을 `리액티브 프로그래밍`이라고 합니다.

### 15.1.1 스레드와 높은 수준의 추상화

앞서 우리는 `Stream`의 `parallelStream()`를 이용하면 병렬로 실행할 수 있다는 것을 배웠습니다.

이런 부분이 높은 수준의 추상화입니다.

### 15.1.2 Executor와 스레드 풀

> #### 💡 스레드 문제
>
> 자바 스레드는 직접 운영체제 스레드에 접근합니다.
>
> 스레드 숫자는 제한되어 있기 때문에 스레드 수를 초과하여 사용하면 예상치 못한 방식으로 크래시 될 수 있으므로
> 기존의 스레드가 실행되는 상태에서 계속 새로운 스레드를 만드는 상황이 일어나지 않도록 주의해야 합니다.
>
> 또한, 주어진 프로그램에서 사용할 최적의 자바 스레드 개수는 사용할 수 있는 하드웨어 코어의 개수에 따라 달라집니다.

> #### 💡 스레드 풀 그리고 스레드 풀이 더 좋은 이유
>
> 스레드 풀에서 사용되지 않은 스레드로 제출된태스크를 먼저 온 순서대로 실행합니다.
>
> 장점은 하드웨어에 맞는 수의 태스크를 유지함과 동시에 수 천개의 태스크를 스레드 풀에 아무 오버헤드 없이 제추할 수 있다는 점입니다.

> #### 💡 스레드 풀 그리고 스레드 풀이 나쁜 이유
>
> 거의 모든 관점에서 스레드를 직접 사용하는 것 보다 스레드 풀을 사용하는 것이 바람직하지만 두 가지 사항에 주의해야 합니다.
>
> - `I/O`를 기라디거나 네트워크 연결을 기다리는 태스크가 있다면 해당 스레드는 태스크를 처리중이지만 아무런 일도 하고있지 않은 상태가 됩니다.  
>   이렇게 되면 서버 자원은 사용하지 않으면서 다른 태스크도 실행하지 못하는 상황이 발생하기 떄문에 주의해야 합니다.
> - `main`는 보통 다른 스레드가 모두 종료가 되어야 종료됩니다. 그렇기 때문에 프로그램을 종료하기 전에 모든 스레드 풀을 종료하는 습관을 가져야 합니다.

### 15.1.3 스레드의 다른 추상화: 중첩되지 않은 메소드 호출

`스레드 생성`과 `join()`이 한 쌍처럼 중첩된 메소드 호출 내에 추가 되어 있는 것을 `엄격한 fork/join`이라고 합니다.

내부가 아닌 `외부에서 호출`하여 종료하도록 기다리는 좀 더 `여유로운 방식의 fork/join`을 사용해도 비교적 안전합니다.

> 메소드가 반환된 후에도 만들어진 태스크 실행이 계속 되는 메소드를 `비동기 메소드`라고 합니다.

이들 메소드를 사용할 때 몇 가지 위험성이 따릅니다.

- 데이터 경쟁 문제를 일으키지 않도록 주의해야 함
- 기존 실행 중이던 스레드가 종료되지 않은 상황에서 자바의 `main()` 메소드를 반환 할 시
  - 애플리케이션을 종료하지 못하고 모든 스레드가 실행을 끝낼 때까지 기다림
  - 애플리케이션 종료를 방해하는 스레드를 강제종료 시키고 애플리케이션을 종료

`main()` 메소드가 반환되었을 때, 일어나는 두 가지 경우 모두 안전하지 못합니다.

### 15.1.4 스레드에 무엇을 바라는가?

모든 하드웨어 스레드를 활용하여 병렬성의 장점을 극대화하도록 프로그램 구조를 만드는 것

즉, 프로그램을 작은 태스크 단위로 구조화하는 것이 목표입니다.

## 15.2 동기 API와 비동기 API

루프 기반의 병렬성은 `Stream`에서 제공하는 `parallelStream()` 메소드를 통해 쉽게 할 수 있었습니다.

루프 기반이 아닌 경우에는 비동기를 아래와 같이 사용할 수 있습니다.

### 15.2.1 Future 형식 API

```java
public class Chap15 {

    @Test
    void test() throws Exception {
        Future<Integer> f = f(10);
        Future<Integer> g = g(20);

        System.out.println(f.get());
        System.out.println(g.get());

    }

    public Future<Integer> f(int x) {
        sleep();
        return CompletableFuture.completedFuture(1000 + x);
    }

    public Future<Integer> g(int x) {
        sleep();
        return CompletableFuture.completedFuture(2000 + x);
    }

    public void sleep(){
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
```

위 처럼 구현하면 1초만에 성공할 것 같지만 위 코드는 비동기이지만 동일 스레드에서 실행되므로 2초가 걸리게 되는 점을 주의해야 합니다.

### 15.2.2 리액티브 형식 API

이 부분은 이해하지 못했습니다.

```java
public class Chap15 {

    int sum = 0;

    @Test
    void test() throws Exception {
        f(30, y -> {
            sum += y;
            System.out.println(sum);
        });

        f(50, y -> {
            sum += y;
            System.out.println(sum);
        });
    }

    void f(int x, IntConsumer dealWithResult) {
        sleep();
        dealWithResult.accept(x);
    }

    public void sleep(){
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
```

### 15.2.3 잠자기(그리고 기타 블로킹 동작)는 해로운 것으로 간주

```java
public class Chap15 {

    @Test
    void test() throws Exception {
        work();
        sleep();
        work();
    }

    public void work() {
        System.out.println("실행");
    }

    public void sleep(){
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
```

위 코드는 `work()`를 한번 실행 한 뒤 `sleep()`으로 1초간 잠자기 상태가 됩니다.
이렇게 잠자기를 해버리면 스레드가 해당 자원을 계속 사용중이기 때문에 비효율적입니다.

```java
public class Chap15 {

    @Test
    void test() throws Exception {
        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);
        work();
        scheduledExecutorService.schedule(
                this::work, 10, TimeUnit.SECONDS
        );
    }
}
```

위 처럼 수정하면 10초 뒤에 `work()`가 실행되는 것은 동일하지만 10초 동안 스레드가 자원을 사용하고 있는 상태가 아니기 때문에 스레드는 다른 작업을 할 수 있게 됩니다.
즉, 스레드를 효과적으로 사용하는 것입니다.

### 15.2.4 현실성 혹인

모든 태스크를 비동기로 만들어 병렬로 처리하면 좋겠지만, 현실적으로는 `모든 것은 비동기` 원칙을 어겨야 합니다.

### 15.2.5 비동기 API에서 예외는 어떻게 처리하는가?

`비동기 API`는 별도의 스레드에서 실행되기 때문에 예외가 발생해도 현재 스레드에는 영향을 주지 않습니다.

예외를 처리하기 위해 `Future`를 구현한 `CompletableFuture`은 `get()`메소드에 예외를 처리할 수 있는 기능을 제공하며
예외에서 회복할 수 있도록 `exceptionally()` 메소드를 제공합니다.

`리액티브 형식의 비동기 API`는 예외가 발생 했을 떄, 실행될 추가 콜백을 만들어 인터페이스를 바꿔야합니다.

## 15.3. 박스와 채널 모델

![박스와 채널 다이어그램](/data/blog/java/modern-java-in-action/1.png)

위 같은 구조를 효율적으로 실행하기 위해서는 모든 과정을 비동기로 실행하면 됩니다.

하지만, 시스템이 커져 각각의 박스와 채널 다이어그램이 등장하고 각각의 박스는 내부적으로 자신만의 박스와 채널을 사용한다면 문제가 달라집니다.

많은 태스크가 `get()` 메소드를 호출해 `Future`가 끝나기를 기다리는 상태에 놓일 수 있습니다.

결국 하드웨어의 병렬성을 제대로 활용하지 못하거나 심지어 데드락에 걸릴 수도 있습니다.
또한 얼마나 많은 수의 `get()`을 감당할 수 있는지 이해하기 어렵습니다.

`CompletableFuture`와 `콤비네이터`를 이용해 이런 문제를 해결합니다.

## 15.4 CompletableFuture와 콤비네이터를 이용한 동시성

`Java 8`에서 `Future` 인터페이스 구현인 `CompletableFuture`를 이용해 `Future`를 조합할 수 있는 기능을 추가했습니다.

`CompletableFuture`은 실행할 코드 없이 `Future`를 만들 수 있고, `complete()` 메소드를 이용하여 나중에 어떤 값을 이용해 다른 스레드가 이를 완료할 수 있고,
`get()`으로 값을 가져올 수 있습니다.

```java
public class Chap15 {
    @Test
    void test() throws Exception {
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        CompletableFuture<Integer> completableFuture = new CompletableFuture<>();
        executorService.submit(() -> completableFuture.complete(f(10))); // 비동기 실행
        completableFuture.get(); // 실제 값 호출
    }

    public Integer f(int x) {
        sleep();
        return x;
    }

    public void sleep(){
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
```

`CompletableFuture`의 `thenCombine()`를 이용하여 두 비동기 메소드가 끝났을 때 스레드 풀에서 실행된 연산을 만듭니다. 두 연산이 끝날 때 까지 실행되지 않습니다.

```java
public class Chap15 {
    @Test
    void test() throws Exception {
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        CompletableFuture<Integer> a = new CompletableFuture<>();
        CompletableFuture<Integer> b = new CompletableFuture<>();
        CompletableFuture<Integer> c = a.thenCombine(b, (y, z) -> y + z);

        executorService.submit(() -> a.complete(f(10)));
        executorService.submit(() -> b.complete(f(20)));

        c.get();
    }

    public Integer f(int x) {
        sleep();
        return x;
    }

    public void sleep() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
```

## 15.5 발행-구독 그리고 리액티브 프로그래밍

아직 이해를 못했습니다.
