---
title: Chapter 16. CompletableFuture 안정적 비동기 프로그래밍
date: '2022-08-01'
tags: ['Java', 'Modern Java In Action']
drt: false
summary: Chapter 16. CompletableFuture 안정적 비동기 프로그래밍
---

# Chapter 16. CompletableFuture : 안정적 비동기 프로그래밍

## 16.1 Fucutre의 단순 활용

```java
public class Chap16 {

    @Test
    void test() throws Exception {
        ExecutorService executorService = Executors.newCachedThreadPool();
        Future<Double> future = executorService.submit(new Callable<Double>() {
            @Override
            public Double call() throws Exception {
                return doSomeLongComputation();
            }
        });

        doSomethingElse();
        try {
            Double result = future.get(1, TimeUnit.SECONDS);
        } catch (ExecutionException e) {
            // 계산 중 예외 발생
        } catch (InterruptedException e) {
            // 현재 스레드에서 대기 중 인터럽트 발생
        } catch (TimeoutException e) {
            // Future가 완료되기 전에 타임아웃 발생
        }
    }
}
```

`Java 8` 이전에는 위 처럼 비동기를 구현했습니다.

타임아웃 설정없이 비동기를 구현했을 경우, 해당 로직이 영원히 끝나지 않게 된다면 문제가 됩니다.
그렇기 때문에 위 처럼 `최대 타임아웃은 설정`하는 것이 좋습니다.

### 16.1.1 Future 제한

Future 인터페이스 `비동기 계산이 끝났는지 확인할 수 있는 메소드`, `계산이 끝나길 기다리는 메소드`, `결과 회수 메소드` 등을 제공하지만
해당 메소드만으로는 간결한 동시 실행 코드를 구현하기에는 충분하지 않습니다.

다음과 같은 선언형 기능이 있다면 유용할 것입니다.

- 두 개의 `비동기 계산 결과를 하나로 합침`. 두 가지 계산 결과는 서로 독립적일 수 있으며, 두 번째 결과가 첫 번째 결과에 의존하는 상황일 수 있음
- Future 집합이 실행하는 `모든 태스크의 완료를 기다림`
- Future 집합에서 `가장 빨리 완료`되는 `태스크`를 기다렸다가 결과를 얻기
- 프로그램적으로 `Future를 완료 시킴` (수동으로 결과 제공)
- `Future 완료 동작에 반응`

`Java 8`에 추가된 `CompletableFuture`클래스는 위의 기능들을 선언형으로 사용할 수 있도록 제공합니다.

> `Future`와 `CompletableFuture` 관계는 `Collection`과 `Stream`의 관계에 비유할 수 있습니다.

> #### 💡 동기 API와 비동기 API
>
> 호출자가 피호출자의 동작 완료를 기다렸다가 실행되는 것을 `블록 호출`이라고 합니다.
>
> 반면 피호출자의 동작 완료를 기다리지 않고 병렬적으로 실행 하는 것을 `비블록 호출`이라고 합니다.

## 16.2 비동기 API 구현

최저가격 검색 애플리케이션을 만들면서 비동기 API에 대하여 알아보겠습니다.

```java

@AllArgsConstructor
@Getter
public class Shop {

    private final String name;

    /**
     * 인위적으로 딜레이를 발생시키기 위한 메소드
     */
    public static void delay() {
        try {
            Thread.sleep(1_000L);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 제품명에 해당하는 가격 조회
     * <p>
     * DB를 이용해서 가격 정보를 얻는 동시에 다른 외부 서비스에도 접근
     *
     * @param product 제품명
     *
     * @return 가격
     */
    public Double getPrice(final String product) {
        System.out.println("가격 검색 시작");
        return calculatePrice(product);
    }

    /**
     * 온라인 상점 가격을 조회하는 메소드로 가정
     *
     * @param product 제품명
     *
     * @return 가격
     */
    private double calculatePrice(final String product) {
        delay();
        final Random random = new Random();
        return random.nextDouble() * product.charAt(0) + product.charAt(1);
    }

}

```

### 16.2.1 동기 메소드를 비동기 메소드로 변환

여러 온라인 상점에 요청을 보내 가격을 받아와야 하기 때문에 비동기로 조회하는 것이 좋을 것입니다.

가격을 비동기로 조회하도록 `getPrice()`를 수정해보겠습니다.

```java
public class Shop {
    public Future<Double> getPriceAsync(final String product) {
        CompletableFuture<Double> future = new CompletableFuture<>();
        System.out.println("가격 검색 시작");
        new Thread(() -> future.complete(calculatePrice(product))).start();
        return future;
    }
}
```

> `비동기 메소드`이기 때문에 메소드 명을 `Async`를 붙여 구분해 줍니다.

```java
public class Chap16 {
    @Test
    void test() throws Exception {
        Shop shop = new Shop("shop");
        long start = System.nanoTime();
        Future<Double> futurePrice = shop.getPriceAsync("my favorite product");
        System.out.println("Invocation returned after " + (System.nanoTime() - start) / 1_000_000);
        doSomeThingElse();
        Double price = futurePrice.get();
        System.out.println("가격 : " + price);
        System.out.println("Price returned after " + (System.nanoTime() - start) / 1_000_000);
    }

    private void doSomeThingElse() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        System.out.println("다른 상점에서 검색");
    }
}
```

```zsh
가격 검색 시작
Invocation returned after 1
다른 상점에서 검색
가격 : 218.08055045981268
Price returned after 1008
```

사용해보면 비동기로 실행하여 값을 가져오는것을 확인할 수 있습니다.

### 16.2.2 에러 처리 방법

비동기를 실행 하는 사이 에러가 발생하게 되면 별도의 스레드이기 때문에 서로 알수가 없습니다.

`CompletableFuture`는 `completeExceptionally()`를 이용해서 내부에서 발생한 예외를 클라이언트로 전달할 수 있도록 구현되어있습니다.

```java
public class Shop {
    public Future<Double> getPriceAsync(final String product) {
        CompletableFuture<Double> future = new CompletableFuture<>();
        System.out.println("가격 검색 시작");
        new Thread(() -> {
            try {
                future.complete(calculatePrice(product));
            } catch (Exception e) {
                future.completeExceptionally(e);
            }
        }).start();
        return future;
    }
}
```

#### 💡 팩토리 메소드 supplyAsync로 CompletableFuture 만들기

```java
public class Shop {
    public Future<Double> getPriceAsync(final String product) {
        System.out.println("가격 검색 시작");
        return CompletableFuture.supplyAsync(() -> calculatePrice(product));
    }
}
```

두 번째 인자로 `Executor`를 전달하여 성능을 더 개선할 수도 있습니다.

## 16.3. 비블록 코드 만들기

```java
public class Chap16 {
    private List<Shop> getShopList() {
        return List.of(
                new Shop("BestPrice"),
                new Shop("LetsSaveBig"),
                new Shop("MyFavoriteShop"),
                new Shop("BuyItAll")
        );
    }

    private List<String> findPrices(final String produce) {
        return getShopList().stream()
                .map(shop -> String.format("%s price is %.2f ", shop.getName(), shop.getPrice(produce)))
                .toList();
    }

    @Test
    void test2() throws Exception {
        long start = System.nanoTime();
        System.out.println(findPrices("myPhone"));
        System.out.println("Done in " + (System.nanoTime() - start) / 1_000_000 + "msecs");
    }
}
```

```zsh
Done in 4025msecs
```

4개의 상점에서 각 1초 씩의 딜레이가 있었으므로 `4초`가 걸린것을 확인할 수 있습니다.

### 16.3.1 병령 스트림으로 요청 병렬화하기

`Stream`에는 `parallelStream()`을 이용하면 간단하게 병렬화 처리 할 수 있다는 것을 저희는 배웠습니다.

```java
public class Chap16 {
    private List<String> findPrices(final String produce) {
        return getShopList().parallelStream()
                .map(shop -> String.format("%s price is %.2f ", shop.getName(), shop.getPrice(produce)))
                .toList();
    }
}
```

```zsh
Done in 1011msecs
```

예상한대로 `1초`만에 조회해 오는것을 볼 수 있습니다.

여기시 조금 더 개선해 보겠습니다.

### 16.3.2 CompletableFuture로 비동기 호출 구현하기

```java
public class Chap16 {
    private List<String> findPrices(final String produce) {
        List<CompletableFuture<String>> priceFutures = getShopList().stream()
                .map(shop ->
                        CompletableFuture.supplyAsync(
                                () -> String.format("%s price is %.2f ", shop.getName(), shop.getPrice(produce))
                        ))
                .toList();
        return priceFutures.stream()
                .map(CompletableFuture::join)
                .toList();
    }
}
```

동기 호출을 비동기 호출로 수정 후, `join()`을 호출하여 모든 비동기 연산이 끝나기를 기다립니다.

여기서 중요한 점은 하나의 `Stream`으로 처리하면 `join()`메소드로 인해 연산이 블록당해 동기 호출이 되기 때문에 조심해야 합니다.

> `Future 인터페이스`의 `get()`은 예외를 발생시키는 반면, `CompletableFuture`의 `join()`은 아무런 예외도 발생시키지 않는다는 차이가 있습니다.

### 16.3.3 더 확장성이 좋은 해결 방법

`병렬 스트림 버전`의 코드는 네 개의 상점에 하나의 스레드를 할당해서 네 개의 작업을 병렬로 수행하면서 검색 시간을 최소화할 수 있었습니다.

검색해야할 `상점이 스레드의 개수보다 많게 될 경우` 시간이 확 늘어날 수 있습니다. (스레드가 4개인데 상점이 5개면 2초가 걸리게 되는 상황)

여기서 `parallelStream()`와 `CompletableFuture`의 차이가 나타납니다.

`CompletableFuture`같은 경우 `Executor`를 지정할 수 있기 때문에 스레풀의 크기를 조절하는 등 애플리케이션에 최적화된 설정을 만들 수 있습니다.

### 16.3.4 커스텀 Executor 사용하기

> #### 💡 스레드 풀 크기 조절
>
> `Nthreads = Ncpu * Ucpu * (1 + W/C)`
>
> - `Ncpu`: `Runtime.getRuntime().availableProcessors()`가 반환하는 코어 수
> - `Ucpu`: 0과 1 사이의 값을 갖는 CPU 활용 비율
> - `W/C`: 대기시간과 계산시간의 비율

```java
public class Chap16 {
    private List<String> findPrices(final String produce) {
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        List<CompletableFuture<String>> priceFutures = getShopList().stream()
                .map(shop ->
                        CompletableFuture.supplyAsync(
                                () -> String.format("%s price is %.2f ", shop.getName(), shop.getPrice(produce)),
                                executorService
                        ))
                .toList();
        return priceFutures.stream()
                .map(CompletableFuture::join)
                .toList();
    }
}
```

## 16.7 마치며

- 한 개 이상의 원격 외부 서비스를 사용하는 긴 동작을 실행할 때는 비동기 방식으로 애플리케이션의 성능과 반응성을 향상시킬 수 있음
- CompletableFuture의 기능을 이용하면 쉽게 비동기 API를 구현할 수 있음
- CompletableFuture를 이용할 때 비동기 태스크에서 발생한 에러를 관리하고 전달할 수 있음 (`exceptionally`)
- 동기 API를 CompletableFuture로 감싸서 비동기적으로 소비할 수 있음
- 서로 독립적인 비동기 동작이든아니면 하나의 비동기 동작이 다른 비동기동작의 결과에 의존하는 상황이든 여러 비동기 동작을 조립하고 조합할 수 있음(`thenCombine`)
- CompletableFuture에 콜백을 등록해서 Future가 동작을 끝내고 결과를 생산했을 때 어떤 코드를 실행할 수 있음 (`thenAccept`)
- CompletableFuture 리스트의 모든 값이 완료될 때까지 기다릴지 아니면 첫 값만 완료되길 기다릴지 선택할 수 있음 (`allOf`, `anyOf`)
- `Java 9`에서는 `orTimeout`, `CompleteOnTimeout` 메소드로 비동기 타임아웃 기능을 추가 함
