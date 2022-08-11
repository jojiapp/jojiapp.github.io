---
title: Chapter 17. 리액티브 프로그래밍
date: '2022-08-11'
tags: ['Java', 'Modern Java In Action']
draft: false
summary: Chapter 17. 리액티브 프로그래밍
---

# Chapter 17. 리액티브 프로그래밍

예전에는 대규모 애플리케이션은 다음과 같은 특징이 있었습니다.

- 수십 대의 서버
- 기가바이트의 데이터
- 수초의 응답 시간
- 당연히 여겨졌던 몇 시간의 유지보수 시간 등

오늘날에는 다음과 같은 적어도 세 가지 이유로 상황이 변하고 있습니다.

- `빅데이터`: 보통 빅테이터는 페타바이트 단위로 구성되며 매일 증가
- `다양한 환경`: 모바일 디바이스에서 수천 개의 멀티 코어 프로세서로 실행되는 클라우드 기반 클러스터 등
- `사용패턴`: 사용자는 1년 내내 항상 서비스를 이용할 수 있으며 밀리초 단위의 응답 시간을 기대

> `리액티브 프로그래밍`에서는 다양한 시스템과 소스에서 들어오는 데이터 항목 `스트림`으로 `비동기 적으로 처리`하고 합쳐서 이런 문제를 해결합니다.

## 17.1 리액티브 매니패스토

- `반응성`: 일정하고 예상할 수 있는 반응 시간을 제공
- `회복성`: 장애가 발생해도 시스템은 반응해야 함. 컴토넌트 실행 복제, 여러 컴포넌트의 시간과 공간 분리, 비동기적을 다른 컴포넌트에 위임 등의 기법을 제시
- `탄력성`: 무서운 작업 부하가 발생하면 자동으로 관련 컴포넌트에 할당된 자원 수를 늘림
- `메시지 주도`: 회복성과 탄력성을 지원하려면 약한 결합, 고립, 위치 투명성 등을 지우너할 수 있도록 시스템을 구성하는 컴포넌트의 경계를 명확하게 정의해야 함

> [리액티브 매니패스토](https://www.reactivemanifesto.org)는 2013년과 2014년에 걸쳐 `조나스 보너`, `데이브 팔리`, `롤랜드 쿤`, `마틴 톰슨`에 의해 개발되었으며,
> `리액티브 애플리케이션과 시스템 개발`의 `핵심 원칙`을 `공식적으로 정의`합니다.

### 17.1.1 애플리케이션 수준의 리액티브

애플리케이션 수준 컴포넌트의 리액티브 프로그래밍의 주요 기능은 `비동기로 작업을 수행`할 수 있다는 점입니다.

CPU의 사용률을 극대화 (내부적으로 경쟁하는 CPU의 스레드 사용률)할 수 있도록
리액티브 프레임워크와 라이브러리는 `스레드`를 `퓨처`, `액터`, `콜백`을 발생시키는 `이벤트 루프 등과 공유`하고 처리할 이벤트를 반환하고 관리합니다.

### 17.1.2 시스템 수준의 리액티브

`리액티브 시스템`은 여러 애플리케이션이 `한 개의 일관적인, 회복할 수 있는 플랫폼을 구성`할 수 있게 해줄 뿐 아니라
`애플리케이션 중 하나가 실패해도 전체 시스템은 계속 운영`될 수 있도록 도와주는 `소프트웨어 아키텍쳐`입니다.

- `리액티브 애플리케이션`은 데이터 스트림에 기반한 연산을 수행하며 보통 `이벤트 주도`로 분류
- `리액티브 시스템`은 애플리케이션을 `조립`하고 `상호소통`을 조절. 주요 속성으로 `메시지 주도`가 있음

`메시지`는 정의된 `목적지 하나`를 향하는 반면, `이벤트`는 `관련 이벤트를 관찰 하도록 등록한 컴포넌트가 수신`한다는 차이점이 있습니다.

## 17.2 리액티브 스트림과 플로 API

`리액티브 프로그래밍`은 `리액티브 스트림`을 사용하는 `프로그래밍`입니다.

`리액티브 스트림`은 잠재적으로 무한의 비동기 데이터를 순서대로 그리고 블록하지 않은 역압력을 전제해 처리하는 표준 기술입니다.

`역압력`은 `발행-구독 프로토콜`에서 이벤트 스트림의 구독자가 `발행자가 이벤트를 제공하는 속도보다 느린 속도로 이벤트를 소비`하면서 문제가 발생하지 않도록 보장하는 장치입니다.

스트림 처리의 `비동기적인 특성상 역압력 기능의 내장은 필수`입니다.

비동기 작업이 실행되는 동안 시스템에는 암묵적으로 블록 API로 인해 역압력이 제공되는 것입니다,
비동기 작업을 실행하는 동안에는 그 작업이 완료될 때까지 다른 유용한 작업을 실행할 수 없으므로 기다리면서 많은 자원을 낭비하게 됩니다.

반면, 비동기 API를 이용하면 하드웨어 사용률은 극대화할 수 있지만 다른 느린 다운스트림 컴포넌트에 너무 큰 부하를 줄 가능성도 생깁니다.

이런 상황을 방지하도록 `역압력`이나 `제어흐름 기법`이 필요한 것 입니다.

### 17.2.1 Flow 클래스 소개

`Java 9`에서는 리액티브 프로그래밍을 제공하는 클래스 `Flow`를 추가했습니다.

`Flow` 클래스는 정적 컴포넌트 하나를 포함하고 있으며 인스턴스화 할 수 없습니다.

실제로 생성자를 `private`으로 막아두었습니다.

```java
public final class Flow {
	private Flow() {
	} // uninstantiable
}
```

`Flow`클래스는 발행-구독 모델을 지원할 수 있도록 중첩된 인터페이스 네 개를 포함합니다.

- `Publisher`: 항목 발행
- `Subscriber`: 한 개씩 또는 한 번에 여러 항목을 소비
- `Subscription`: 이 과정을 관리
- `Processor`: 리액티브 스트림에서 처리하는 이벤트의 변환 단계

#### 💡 Flow.Publisher 인터페이스

```java

@FunctionalInterface
public static interface Publisher<T> {
	public void subscribe(Subscriber<? super T> subscriber);
}
```

#### 💡 Flow.Subscriber 인터페이스

```java
 public static interface Subscriber<T> {
	public void onSubscribe(Subscription subscription);

	public void onNext(T item);

	public void onError(Throwable throwable);

	public void onComplete();
}
```

`onSubscribe onNext* (orError | onComplete)?`

- `onSubscribe`: 항상 처음 호출
- `onNext*`: `onNext`가 여러번 호출 될 수 있음
- `onError`: `Pushlisher`에 장애가 발생할 경우 호출
- `onComplete`: 이벤트 스트림은 영원히 지속되거나 `onComplete` 콜백을 통해 더 이상의 데이터가 없고 종료됨을 알릴 수 있음

#### 💡 Flow.Subscription 인터페이스

```java
public static interface Subscription {
	public void request(long n);

	public void cancel();
}
```

- `Publisher`는 반드시 `Subscription`의 `request` 메소드에 정의된 개수 이하의 요소만 `Subscriber`에 `전달`해야 함  
  하지만 `Publisher`는 지정된 개수보다 적은 수의 요소를 `onNext`로 전달할 수 있음
- `Subscriber`는 요소를 받아 처리할 수 있음을 `Publisher`에게 알려야 함  
  이런 방식으로 역압력을 행사할 수 있고 `Subscriber`가 관리할 수 없이 너무 많은 요소를 받는 일을 피할 수 있음.  
  `onComplete`, `onError` 신호를 처리하는 상황에서 `Publisher`이나 `Subscription`의 어떤 메소드도 호출할 수 없으며, `Subscription`이 `취소되었다고 가정`해야
  함  
  `Subscriber`은 `request()`호출 없이도 언제든 종료 시그널을 받을 준비가 되어있어야 하며, `cancel()`이 호출된 이후에라도 한 개 이상의 `onNext`를 받을 준비가 되어 있어야 함
- `Publisher`와 `Subscriber`는 정확하게 `Subscription`을 공유해야 하며 각각이 고유한 역할을 수해해야 함  
  그러려면 `onSubscribe`와 `onNext` 메소드에서 `Subscriber`는 `request()`를 `동기적으로 호출`할 수 있어야 함  
  표준에서는 `cancel()`은 여러번 호출해도 한 번 호출한 것과 같은 결과를 가져야 함

#### 💡 Flow.Processor 인터페이스

```java
public static interface Processor<T, R> extends Subscriber<T>, Publisher<R> {
}
```

`Processor 인터페이스`는 리액티브 스트림에서 처리하는 `이벤트의 변환 단계`를 나타냅니다

`Processor`가 `에러를 수신`하면 이로부터 `회복`하거나, 즉시 `onError` 신호로 모든 `Subscriber`에 `에러를 전파`할 수 있습니다.

### 17.2.2 첫 번째 리액티브 애플리케이션 만들기

- 현재 보고된 온도를 전달하는 자바 빈

```java

@AllArgsConstructor
@Getter
@ToString
public class TempInfo {

	public static final Random random = new Random();

	private final String town;
	private final int temp;

	public static TempInfo fetch(String town) {
		if (random.nextInt(10) == 0) throw new RuntimeException("Error");
		return new TempInfo(town, random.nextInt(100));
	}
}
```

- Subscriber에게 TempInfo 스트림을 전송하는 `Subscription`

```java

@AllArgsConstructor
public class TempSubscription implements Flow.Subscription {

	private final Flow.Subscriber<? super TempInfo> subscriber;
	private final String town;

	@Override
	public void request(long n) {
		for (int i = 0; i < n; i++) {
			try {
				subscriber.onNext(TempInfo.fetch(town));
			} catch (Exception e) {
				subscriber.onError(e);
				break;
			}
		}
	}

	@Override
	public void cancel() {
		subscriber.onComplete();
	}
}
```

- 받은 온도를 출력하는 `Subscriber`

```java
public class TempSubscriber implements Flow.Subscriber<TempInfo> {

	private Flow.Subscription subscription;

	@Override
	public void onSubscribe(Flow.Subscription subscription) {
		this.subscription = subscription;
		subscription.request(1);
	}

	@Override
	public void onNext(TempInfo item) {
		System.out.println(item);
		subscription.request(1);
	}

	@Override
	public void onError(Throwable throwable) {
		System.out.println(throwable.getMessage());
	}

	@Override
	public void onComplete() {
		System.out.println("Done!");
	}
}
```

- Publisher를 만들고 TempSubscriber를 구독시킴

```java
public class Chap17 {

	@Test
	@DisplayName("Flow 예제")
	void test() throws Exception {
		getTemperatures("New Tork").subscribe(new TempSubscriber());
	}

	private Flow.Publisher<TempInfo> getTemperatures(String town) {
		return subscriber -> subscriber.onSubscribe(
				new TempSubscription(subscriber, town)
		);
	}
}
```

```zsh
TempInfo(town=New Tork, temp=42)
TempInfo(town=New Tork, temp=16)
TempInfo(town=New Tork, temp=78)
Error
```

위의 방식은 `TempSubscriber`가 새로운 요소를 `onNext` 메소드로 받을 떄마다 `TempSubscription`으로 새 요청을 보내면 `request` 메소드가 `TempSubscriber`
자신에게 또 다른 요소를 보내며 재귀 호출을 한다는 문제가 있습니다.

`Executor`를 `TempSubscription`으로 추가한 다음 `다른 스레드`에서 `TempSubscriber`로 세 요소를 전달하는 방법이 있습니다.

```java

@AllArgsConstructor
public class TempSubscription implements Flow.Subscription {

	public static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();
	private final Flow.Subscriber<? super TempInfo> subscriber;
	private final String town;


	@Override
	public void request(long n) {
		EXECUTOR.submit(() -> {
			for (int i = 0; i < n; i++) {
				try {
					subscriber.onNext(TempInfo.fetch(town));
				} catch (Exception e) {
					subscriber.onError(e);
					break;
				}
			}
		});
	}

	@Override
	public void cancel() {
		subscriber.onComplete();
	}
}
```

### 17.2.3 Processor로 데이터 변환하기

`Processor`의 목적은 `Publisher`를 `구독`한 다음 `수신한 데이터를 가공해 다시 제공`하는 것입니다.

아래는 화씨를 섭씨로 변환하는 예제입니다.

```java
public class TempProcessor implements Flow.Processor<TempInfo, TempInfo> {

	private Flow.Subscriber<? super TempInfo> subscriber;

	@Override
	public void subscribe(Flow.Subscriber<? super TempInfo> subscriber) {
		this.subscriber = subscriber;
	}

	@Override
	public void onSubscribe(Flow.Subscription subscription) {
		subscriber.onSubscribe(subscription);
	}

	@Override
	public void onNext(TempInfo item) {
		subscriber.onNext(
				new TempInfo(item.getTown(),
						(item.getTemp() - 32) * 5 / 9
				)
		);
	}

	@Override
	public void onError(Throwable throwable) {
		subscriber.onError(throwable);
	}

	@Override
	public void onComplete() {
		subscriber.onComplete();
	}
}
```

`onNext`는 화씨를 섭씨로 변환한 다음 온도를 재전송합니다.

그 외 나머지 메소드는 수신한 모든 신호를 `업스트림 Subscriber로 전달`합니다.

```java
public class Chap17 {

	@Test
	@DisplayName("Flow 예제")
	void test() throws Exception {
		getTemperatures("New Tork").subscribe(new TempSubscriber());
	}

	private Flow.Publisher<TempInfo> getTemperatures(String town) {
		return subscriber -> {
			TempProcessor tempProcessor = new TempProcessor();
			tempProcessor.subscribe(subscriber);
			tempProcessor.onSubscribe(new TempSubscription(tempProcessor, town));
		};
	}
}
```

### 17.2.4 자바는 왜 플로 API 구현을 제공하지 않는가?

자바 라이브러리는 보통 인터페이스와 구현체를 제공하는 반면, `Flow`는 구현체를 제공하지 않습니다.

그 이유는 `Flow API`를 만들 당시 이미 `Akka`, `RxJava`등 다양한 라이브러리 가 이미 존재했기 때문입니다.

각 라이브러리는 독립적으로 개발되었기 때문에 서로 다른 이름규칙과 API를 사용했습니다.
`Flow` 인터페이스를 기반으로 리액티브 개념을 구현하도록 진화했고, 이 표준화 작업 덕분에 다양한 라이브러리가 쉽게 협력할 수 있게 되었습니다.

## 17.3 리액티브 라이브러리 RxJava 사용하기

`RxJava`는 `리액티브 애플리케이션`을 구현하는데 사용하는 라이브러리 입니다.

넷플릭스의 `Reactive Extensions(Rx)` 프로젝트의 일부에서 시작되었습니다.

현재는 `Flow`를 지원하도록 `RxJava 2.0`이 개발되었습니다.

`RxJava`는 `Flow.Publisher`를 구현하는 두 클래스를 제공합니다.

- `Flowable`: 역압력(request 메소드)을 지원
- `Observable`: 역압력 미지원

> `RxJava`는 천 개 이하의 요소를 가진 스트림이나 마우스 움직임, 터치 이벤트 등
> 역압력을 적용하기 힘든 GUI 이벤트 그리고 자주 발생하지 않는 종류의 이벤트에 역압력을 적용하지 말 것을 권장합니다.

### 17.3.1 Observable 만들고 사용하기

```java
public class Chap17 {
	@Test
	public void test1() throws Exception {
		Observable<String> just = Observable.just("first", "second");
	}
}
```

구독자는 `onNext("first")`, `onNext("second")`, `onComplete()`의 순서로 메세지를 받습니다.

사용자와 실시간으로 상호작용하면서 지정된 속도로 이벤트를 방출하는 상황에 사용되는 `interval()` 팩토리 메소드도 있습니다.

```java
public class Chap17 {
	@Test
	public void test1() throws Exception {
		Observable<Long> observable = Observable.interval(1, TimeUnit.SECONDS);
	}
}
```

#### 💡 1초마다 한 개의 온도를 방출하는 Observable 만들기

```java
public class TempObserver implements Observer<TempInfo> {
	@Override
	public void onSubscribe(@NonNull Disposable d) {
	}

	@Override
	public void onNext(@NonNull TempInfo tempInfo) {
		System.out.println(tempInfo);
	}

	@Override
	public void onError(@NonNull Throwable e) {
		System.out.println("Got problem: " + e.getMessage());
	}

	@Override
	public void onComplete() {
		System.out.println("Done!");
	}
}
```

`Observer`의 구현체를 만들어 줍니다.

```java
public class Chap17 {

	@Test
	@DisplayName("Flow 예제")
	void test() throws Exception {
		Observable<TempInfo> new_tork = getTemperatures("New Tork");
		new_tork.blockingSubscribe(new TempObserver());
	}

	private static Observable<TempInfo> getTemperatures(String town) {
		return Observable.create(emitter ->
				Observable.interval(1, TimeUnit.SECONDS)
						.subscribe(i -> {
									if (!emitter.isDisposed()) {
										if (i >= 5) {
											emitter.onComplete();
										} else {
											try {
												emitter.onNext(TempInfo.fetch(town));
											} catch (Exception e) {
												emitter.onError(e);
											}
										}
									}
								}
						)
		);
	}
}
```

필요한 이벤트를 전송하는 `ObservableEmitter`를 소비하는 함수로 `Observable`을 만들어 반환합니다.

`ObservableEmitter`은 `Emitter`을 상속합니다.

즉, 구독 된 `Observer`는 `emitter`을 통해 주기적으로 이벤트를 받아 실행합니다.

`emitter.isDisposed()` 메소드를 통해 해당 `Observer`가 이미 ㅖ기 되었는지 확인하여
폐기되지 않았을 경우 아래 로직을 실행하도록 구현합니다.

```java
public class Chap17 {
	@Test
	@DisplayName("Flow 예제")
	void test() throws Exception {
		Observable<TempInfo> merge = Observable.merge(
				Stream.of("New York", "Korea")
						.map(Chap17::getTemperatures)
						.toList()
		);
		merge.blockingSubscribe(new TempObserver());
	}
}
```

`Observable.merge()`를 이용하여 여러 도시의 온도를 방출하는 `Observer`로 만들 수도 있습니다.

```java
public class Chap17 {
	@Test
	@DisplayName("Flow 예제")
	void test() throws Exception {
		Observable<TempInfo> merge = Observable.merge(
				Stream.of("New York", "Korea")
						.map(Chap17::getTemperatures)
						.toList()
		);
		merge.subscribe(new TempObserver());
		merge.blockingSubscribe(new TempObserver());
	}
}

```

위 처럼 사용하여 비동기적으로 두 `Observer`를 사용할 수 있습니다.

## 17.4 마치며

- 리액티브 프로그래밍의 기초 사상은 이미 20~30년 전에 수립되었지만 최근에서야 인기를 얻고 있음
- 이랙티브 소프트웨어가 지녀야 할 넥 가지 관련 특징 (`반응성`, `회복성`, `탄력성`, `메시지 주도`)을 서술하는 리액티브 매니페스토가 리액티브 프로그래밍 사상을 공식화 함
- 여러 애플리케이션을 통합하는 리액티브 시스템과 한 개의 애플리케이션을 구현할 때에 각각 다른 접근 방식으로 리액티브 프로그래밍 원칙을 적용할 수 있음
- 리액티브 애플리케이션은 리액티브 스트림이 전달하는 한 개 이상의 이벤트를 비동기로 처리함을 기본으로 전재 함
- 리액티브 스트림은 비동기적으로 처리되므로 역압력 기법이 기본적으로 탑재 되어 있음
- `역압력`은 발행자가 구독자보다 빠른 속도로 아이템을 발행하므로 발생하는 문제를 방지
- `Java 9`의 `Flow API`는 `Publisher`, `Subscriber`, `Subscription`, `Processor` 네 개의 핵심 인터페이스를 정의 함
- 가장 흔한 리액티브 프로그래밍 도구로 `RxJava`를 꼽을 수 있으며, 이 라이브러리는 `Flow`의 기본 기능에 더해 다양한 강력한 연산자를 제공
