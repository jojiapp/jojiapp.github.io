---
title: Chapter 10. 람다를 이용한 도메인 전용 언어
date: '2022-06-27'
tags: ['Java', 'Modern Java In Action']
draft: false
summary: Chapter 10. 람다를 이용한 도메인 전용 언어
---

# Chapter 10. 람다를 이용한 도메인 전용 언어

`언어`의 `주요 목표`는 `메시지를 명확`하고, `안정적인 방식으로 전달`하는 것 입니다.

개발팀과 도메인 전문가가 공유하고 이해할 수 있는 코드는 생산성과 직결되기 때문에 특히 중요합니다.

`도메인 전용 언어(DSL)`로 애플리케이션 비즈니스 로직을 표현함으로 이런 문제를 해결할 수 있습니다.

`DSL`은 `특정 도메인을 대상`으로 만들어진 `특수 프로그래밍 언어`입니다.

예로 `Maven`, `Ant` 등은 `빌드 과정`을 `표현`하는 `DSL`로 간주할 수 있습니다.

`Java`는 역사적으로 `완고함`, `장황함` 등의 특성 떄문에 기술 배경이 없는 사람들이 사용하기에 부적절한 언어로 간주되었찌만,
요즘은 `람다 표현식을 지원`하면서 달라지고 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		read(bock, buffer);
		for (every record in buffer){
			if (record.calorie < 400) {
				System.out.println(record.name);
			}
		}
		block = bufer.next();
	}
}
```

위 코드는 메뉴에서 400 칼로리 이하의 모든 요리를 찾는 `저수준 코드` 입니다.

위의 코드를 이해하기 위해선 `로깅`, `I/O`, `디스크 할당` 등과 같은 지식이 필요하며,
애플리케이션 수준이 아닌 `시스템 수준의 개념`을 다뤄야 한다는 `단점`이 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		menu.stream()
			.filter(d -> d.getCalories() < 400)
			.map(Dish::getName)
			.forEach(System.out::println);
	}
}
```

`스트림`을 이용하여 위 처럼 간단하게 표한할 수 있습니다.

> 스트림의 특성인 `메소드 체인`을 보통 자바의 뤂의 복잡한 제어와 비교해 유창함을 의미하는 `플루언트 스타일`이라고 부릅니다.

- `내부적 DSL`은 유창하게 코드를 구현할 수 있도록 적절하게 클래스와 메소드를 노출하는 과정이 필요
- `외부적 DSL`은 DSL문법 뿐만 아니라 DSL을 평가하는 파서도 구현

## 10.1 도메인 전용 언어

`DSL`은 `특정 비즈니스 도메인의 문제를 해결`하고자 만든 언어입니다.

`DSL`에서 `동작`과 `용어`는 `특정 도메인에 국한`되므로 다른 문제는 걱정할 필요가 없고 오직 앞에 놓인 문제를 어떻게 해결할지에만 집중할 수 있습니다.

`DSL`은 단순 평문 영어가 아닙니다.
즉, 도메인 전문가가 저수준 비즈니스 로직을 구현하도록 만드는 것이 아닙니다.

아래 2가지 필요성을 생각하면서 `DSL을 개발`해야 합니다.

- `의사 소통의 왕`: 프로그래머가 아닌 사람도 이해할 수 있어야 함
- `한 번 코드를 구현하지만 여러 번 읽는다`: 가독성은 유지보수의 핵심

### 10.1.1 DSL의 장점과 단점

#### 💡 장점

- `간결함`: API는 비즈니스 로직을 캡슐화하므로 반복을 피할 수 있고 코드를 간결하게 만들 수 있다.
- `가독성`: 도메인 영역의 용어를 사용하므로 비 도메인 전문가도 코드를 쉽게 이해할 수 있다.
- `유지보수`: 잘 설계된 DSL로 구현한 코드는 쉽게 유지보수하고 바꿀 수 있다.
- `높은 수준의 추상화`: DSL은 도메인과 같은 추상화 수준에서 동작하므로 도메인의 문제와 직접적으로 관련되지 않은 세부사항을 숨김
- `집중`: 프로그래머가 특정 코드에 집중할 수 있음. 결과적으로 생산성 향상
- `관심사분리`: 인프라구조와 관련된 문제와 독립적으로 비즈니스 관련된 코드에서 집중하기가 용이. 결과적으로 유지보수성 향상

#### 💡 단점

- `DSL 설계의 어려움`: 간결하게 제한적인 언어에 도메인 지식을 담는 것이 쉬운 작업은 아님
- `개발 비용`: 코드에 DSL을 추가하는 작업은 초기 프로젝트에 많은 비용과 시간이 소모되는 작업. 또한, DSL 유지보수와 변경은 프로젝트에 부담을 주는 요소
- `추가 우회 계층`: DSL은 추가적인 계층으로 도메인 모델을 감싸며, 이 때 계층을 최대한 작게 만들어 성능 문제를 회피
- `새로 배워야 하는 언어`: DSL을 프로젝트에 추가하면서 팀이 배워야 하는 언어가 한 개 더 늘어난다는 부담
- `호스팅 언어 한계`: 일부 자바 같은 범용 프로그래밍 언어는 장활하고 엄격한 문법을 가짐. 이런 언어로는 사용자 친화적인 DSL을 만들기가 어려움

### 10.1.2 JVM에서 이용할 수 있는 다른 DSL 해결책

#### 💡 내부 DSL

현재 이 책은 자바 언어 책이므로 내부 DSL이란 자바로 구현한 DSL을 의미합니다.

`자바`는 다소 귀찮고, 유연성이 떨어지는 문법 때문에 표현력 있는 DSL을 만드는데 한계가 있었습니다.

`Java 8`에 `람다`가 등장하면서 이 문제가 어느정도 해결 되었습니다.

`자바 문법`이 큰 문제가 아니라면 `순수 자바로 DSL을 구현`함으로써 다믐과 같은 장점을 얻을 수 있습니다.

- 기존 자바 언어를 이용하면 외부 DSL에 비해 새로운 패턴과 기술을 배워 `DSL을 구현하는 노력이 현저하게 줄어듦`
- `순수 자바로 DSL을 구현`하면 `나머지 코드와 함께 DSl을 컴파일` 할 수 있음.
- 새로운 언어를 배우거나 또는 익숙하지 않고 `복잡한 외부 도구를 배우지 않아도 됨`
- DSL 사용자는 기존의 자바 `IDE`를 이용해 `자동 완성`, `자동 리팩터링` 같은 기능을 그대로 사용 가능
- 한 개의 언어로 한 개의 도메인 또는 여러 도메인을 대응하지 못해 추가로 DSL을 개발해야 하는 상황에서 자바를 이용한다면 `추가 DSL을 쉽게 합칠 수 있음`

#### 💡 다중 DSL

`DSL`은 `기반 프로그래밍 언어`의 영향을 받으므로 `간결한 DSL`을 만드는 데 `새로운 언어의 특성이 아주 중요`합니다.

아래와 같은 불편함을 초래합니다.

- 새로운 프로그래밍 언어를 배우거나 또는 팀의 누군가가 이미 해당 기술을 가지고 있어야 함. `기존 언어`의 `고급 기능`을 사용할 수 있는 `충분한 지식`이 필요
- 두 개 이상의 언어가 혼재하므로 여러 컴파일러로 소스를 빌드하도록 `빌드 과정 개선`
- `JVM`에서 실행되는 거의 모든 언어가 `Java`와 `100% 호환`을 주장하지만, 호환성이 완벽하지 않을 때가 많음. 이런 호환성 때문에 `성능이 손실`될 떄도 있음.

#### 💡 외부 DSL

`외부 DSL`을 만들기 위해서는 자신만의 문법과 구문으로 `새 언어를 설계`해야 합니다.

`외부 DSL`을 개발하는 가장 큰 장점은 `무한한 유연성`입니다.
제대로 언어를 설계하면 우리의 비즈니스 문제를 묘사하고 해결하는 가독성 좋은 언어를 얻을 수 있습니다.

## 10.2 최신 자바 API의 작은 DSL

자바의 새로운 기능의 장점을 적용한 첫 API는 `네이티브 자바 API 자신`입니다.

`Java 8`에 추가된 `Comparator` 인터페이스 예제를 통해 람다가 어떻게 네이티브 자바 API의 재사용성과 메소드 결합도를 높였는지 확인합니다.

```java
class Foo {
	public static void main(String[] args) {
		Collections.sort(persons, new Compatator<Person>() {
			public int compare(Person p1, Person p2) {
				return p1.getAge() - p2.getAge();
			}
		});
	}
}
```

위 코드를 아래처럼 사용할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		Collections.sort(persons, comparing(Person::getAge));
	}
}
```

이 작은 API는 `Collection 정렬 도메인의 최소 DSL`입니다.

### 10.2.1 스트림 API는 컬렉션을 조작하는 DSL

`Stream` 인터페이스는 네이티브 `자바 API`에 `작은 내부 DSL을 적용한 좋은 예`입니다.

`Stream API`의 `플루언트 형식`은 잘 설계된 DSL의 또 다른 특징입니다.

`모든 중간 연산`은 `게으르며` 다른 연산으로 파이프라인될 수 있는 `스트림으로 반환`합니다.

`최종 연산`은 `적극적`이며 `전체 파이프라인이 계산`을 일으킵니다.

### 10.2.2 데이터를 수집하는 DSL인 Collectors

`Collector` 인터페이스는 `데이터 수집을 수행하는 DSL로 간주`할 수 있습니다.

## 10.3 자바로 DSL을 만드는 패턴과 기법

`DSL`은 `특정 도메인` 모델에 적용할 `친화적`이고 `가독성 높은 API를 제공`합니다.

```java

@Getter
@Setter
public class Stock {
	private String symbol;
	private String market;
}
```

```java
public enum Type {
	BUY, SELL
}
```

```java

@Getter
@Setter
public class Trade {
	private Type type;
	private Stock stock;
	private int quantity;
	private double price;
}
```

```java

@Getter
@Setter
public class Order {
	private String customer;
	private List<Trade> trades = new ArrayList<>();

	public void addTrade(Trade trade) {
		trades.add(trade);
	}
}
```

`고객이 요청한 두 거래를 포함하는 주문`을 만들려면 각 객체를 생성한 뒤, `Setter`를 이요앟여 값을 할당하게 됩니다.
이런 코드는 `상당히 장황한 편`이므로 비개발자인 도메인 전문가가 빠르게 이해하고 집중하기르 기대하기 어렵습니다.

### 10.3.1 메소드 체인

`DSL`에서 가장 흔한 방식 중 하나인 메소드 체인으로 거래 주문을 정의할 수 있습니다.

```java
class Foo {
	public static void main(String[] args) {
		Order order = forCustomer("BigBank")
			.buy(80)
			.on("NYSE")
			.at(125.00)
			.sell(50)
			.stock("GOOGLE")
			.on("NASDAQ")
			.at(375.00)
			.end();
	}
}
```

위 처럼 코드를 작성하면 비도메인 전문가도 쉽게 코드를 이해할 수 있을것입니다.

이처럼 만들기 위해서는 `최상위 수준 빌더`를 만들고 `주문을 감싼 다음 한 개 이상의 거래를 주문에 추가`할 수 있어야 합니다.

```java
public class MethodChainingOrderBuilder {

	public final Order order = new Order();

	private MethodChainingOrderBuilder(String customer) {
		order.setCustomer(customer);
	}

	public static MethodChainingOrderBuilder forCustomer(String customer) {
		return new MethodChainingOrderBuilder(customer);
	}

	public TradeBuilder buy(int quantity) {
		return new TradeBuilder(this, Type.BUY, quantity);
	}

	public TradeBuilder sell(int quantity) {
		return new TradeBulder(this, Type.SELL, quantity);
	}

	public MethodChainingOrderBuilder addTrade(Trade trade) {
		order.addTrade(trade);
		return this;
	}

	public Order end() {
		return order;
	}
}
```

```java
public class TradeBuilder {

	private final MethodChainingOrderBuilder builder;
	public final Trade trade = new Trade();

	public TradeBuilder(MethodChainingOrderBuilder builder, Type type, int quantity) {
		this.builder = builder;
		trade.setType(type);
		trade.setQuantity(quantity);
	}

	public StockBuilder stock(String symbol) {
		return new StockBuilder(builder, trade, symbol);
	}
}
```

```java
public class StockBuilder {

	private final MethodChainingOrderBuilder builder;
	private final Trade trade;
	private final Stock stock = new Stock();

	public StockBuilder(MethodChainingOrderBuilder builder, Trade trade, String symbol) {
		this.builder = builder;
		this.trade = trade;
		stock.setSymbol(symbol);
	}

	public TradeBuilderWithStock on(String market) {
		stock.setMarket(market);
		trade.setStock(stock);
		return new TradeBuilderWithStock(builder, trade);
	}
}
```

```java
public class TradeBuilderWithStock {

	private final MethodChainingOrderBuilder builder;
	private final Trade trade;

	public TradeBuilderWithStock(MethodChainingOrderBuilder builder, Trade trade) {
		this.builder = builder;
		this.trade = trade;
	}

	public MethodChainingOrderBuilder at(double price) {
		trade.setPrice(price);
		return builder.addTrade(trade);
	}
}
```

정적 메소드 사용을 최소화하고 메소드 이름을 인수의 이름을 대신하도록 만듦으로 이런 형식이, DSL의 `가독성을 개선`하는 효과를 더합니다.
이런 기법을 적용한 `플루언트 DSL`에는 `분법적 잡음이 최소화`됩니다.

`Builder`를 구현해야 한다는 것이 메소드 체인의 단점입니다.
상위 수준의 `Builder`를 하위 수준의 `Builder`와 연결할 접착 많은 코드가 필요합니다.

### 10.3.2 중첩된 함수 이용

`중첩된 함수 DSL 패턴`은 다른 함수 안에 함수를 이용해 도메인 모델을 만듭니다.

```java
public class Foo {
	public static void main(String[] args) {
		order("BigBank",
			buy(80,
				stock("IBM", on("NYSE")), at(125.00)),
			sell(50,
				stock("GOOGLE", on("NASDAQ")), at(375.00))
		);
	}
}
```

```java
public class NestedFunctionOrderBuilder {
	public static Order order(String customer, Trade... trades) {
		Order order = new Order();
		order.setCustomer(customer);
		Stream.of(trades).forEach(order::addTrade);
		return order;
	}

	public static Trade buy(int quantity, Stock stock, double price) {
		return buildTrade(quantity, stock, price, Type.BUY);
	}

	public static Trade sell(int quantity, Stock stock, double price) {
		return buildTrade(quantity, stock, price, Type.SELL);
	}

	private static Trade buildTrade(int quantity, Stock stock, double price, Type type) {
		Trade trade = new Trade();
		trade.setQuantity(quantity);
		trade.setType(type);
		trade.setStock(stock);
		trade.setPrice(price);
		return trade;
	}

	public static double at(double price) {
		return price;
	}

	public static Stock stock(String symbol, String market) {
		Stock stock = new Stock();
		stock.setSymbol(symbol);
		stock.setMarket(market);
		return stock;
	}

	public static String on(String market) {
		return market;
	}
}
```

`메소드 체인`에 비해 함수의 중첩 방식이 `도메인 객체 계층 구조`에 대로 `반영` 된다는 `장점`이 있습니다.

`결과 DSL`에 `더 많은 괄호를 사용`해야 한다는 `단점`이 있습니다.

### 10.3.3 람다 표현식을 이용한 함수 시퀀싱

```java
public class Foo {
	public static void main(String[] args) {
		order(o -> {
			o.forCustomer("BigBank");
			o.buy(t -> {
				t.quantity(80);
				t.price(125.00);
				t.stock(s -> {
					s.symbol("IBM");
					s.market("NYSE");
				});
			});
			o.sell(t -> {
				t.quantity(50);
				t.stock(s -> {
					s.symbol("GOOGLE");
					s.market("NASDAQ");
				});
			});
		});
	}
}
```

```java
public class LambdaOrderBuilder {

	private final Order order = new Order();

	public static Order order(Consumer<LambdaOrderBuilder> consumer) {
		LambdaOrderBuilder builder = new LambdaOrderBuilder();
		consumer.accept(builder);
		return builder.order;
	}

	public void forCustomer(String customer) {
		order.setCustomer(customer);
	}

	public void buy(Consumer<TradeBuilder> consumer) {
		trade(consumer, Type.BUY);
	}

	public void sell(Consumer<TradeBuilder> consumer) {
		trade(consumer, Type.SELL);
	}

	private void trade(Consumer<TradeBuilder> consumer, Type type) {
		TradeBuilder builder = new TradeBuilder();
		builder.trade.setType(type);
		consumer.accept(builder);
		order.addTrade(builder.trade);
	}
}
```

```java
public class TradeBuilder {

	public Trade trade = new Trade();

	public void quantity(int quantity) {
		trade.setQuantity(quantity);
	}

	public void price(double price) {
		trade.setPrice(price);
	}

	public void stock(Consumer<StockBuilder> consumer) {
		StockBuilder builder = new StockBuilder();
		consumer.accept(builder);
		trade.setStock(builder.stock);
	}
}
```

```java
public class StockBuilder {
	public Stock stock = new Stock();

	public void symbol(String symbol) {
		stock.setSymbol(symbol);
	}

	public void market(String market) {
		stock.setMarket(market);
	}
}
```

`메소드 체인 패턴`처럼 `플루언트 방식`으로 거래 주문을 정의하며, `중첩 함수 형식` 처럼 다양한 `람다 표현식`의 중첩 수준과 비슷하게 `도메인 객체의 계층 구조를 유지`합니다.

`많은 설정 코드가 필요`하며 DSL 자체가 `Java 8` `람다 표현식 문법에 의한 잡음의 영향`을 받는다는 것이 이 패턴의 `단점`입니다.

### 10.3.4 조합하기

```java
public class Foo {
	public static void main(String[] args) {
		forCustomer("BigBank",
			buy(t -> t.quantity(80)
				.stock("IBM")
				.on("NYSE")
				.at(125.00)
			),
			sell(t -> t.quantity(50)
				.stock("GOOGLE")
				.on("NASDAQ")
				.at(125.00)
			)
		);
	}
}
```

```java
public class MixedBuilder {

	public static Order forCustomer(String customer, TradeBuilder... builders) {
		Order order = new Order();
		order.setCustomer(customer);
		Stream.of(builders).forEach(b -> order.addTrade(b.trade));
		return order;
	}

	public static TradeBuilder buy(Consumer<TradeBuilder> consumer) {
		return builderTrade(consumer, Type.BUY);
	}

	public static TradeBuilder sell(Consumer<TradeBuilder> consumer) {
		return builderTrade(consumer, Type.SELL);
	}

	private static TradeBuilder builderTrade(Consumer<TradeBuilder> consumer, Type type) {
		TradeBuilder builder = new TradeBuilder();
		builder.trade.setType(type);
		consumer.accept(builder);
		return builder;
	}
}
```

```java
public class TradeBuilder {

	private Trade trade = new Trade();

	public TradeBuilder quantity(int quantity) {
		trade.setQuantity(quantity);
		return this;
	}

	public TradeBuilder at(double price) {
		trade.setPrice(price);
		return this;
	}

	public StockBuilder stock(String symbol) {
		return new StockBuilder(this, trade, symbol);
	}
}
```

```java
public class StockBuilder {
	private final TradeBuilder builder;
	private final Trade trade;
	private final Stock stock = new Stock();

	public StockBuilder(TradeBuilder builder, Trade trade, String symbol) {
		this.builder = builder;
		this.trade = trade;
		stock.setSymbol(symbol);
	}

	public TradeBuilder on(String market) {
		stock.setMarket(market);
		trade.setStock(stock);
		return builder;
	}
}
```

### 10.3.5 DSL에 메소드 참조 사용하기

```java

public class Tax {
	public static double regional(double value) {
		return value * 1.1;
	}

	public static double general(double value) {
		return value * 1.3;
	}

	public static double surcharge(double value) {
		return value * 1.05;
	}

	public static double calculate(Order order, boolean useRegional, boolean useGeneral, boolean useSurcharge) {
		double value = order.getValue();
		if (useRegional) value = Tax.regional(value);
		if (useGeneral) value = Tax.general(value);
		if (useSurcharge) value = Tax.surcharge(value);
		return value;
	}
}
```

```java
class Foo {
	public static void main(String[] args) {
		double value = calculate(order, true, false, true);
	}
}
```

위 구현의 가독성 문제는 쉽게 알수 있습니다.

우선, `boolean`의 순서도 기억하기 어려우며 어떤 세금이 적용되었는지도 파악하기 어렵습니다.

```java
public class TaxCalculator {
	private boolean useRegional;
	private boolean useGeneral;
	private boolean useSurcharge;

	public TaxCalculator withTaxRegional() {
		useRegional = true;
		return this;
	}

	public TaxCalculator withTaxGeneral() {
		useGeneral = true;
		return this;
	}

	public TaxCalculator withTaxSurcharge() {
		useSurcharge = true;
		return this;
	}

	public double calculate(Order order) {
		return calculate(order, useRegional, useGeneral, useSurcharge);
	}
}
```

```java
class Foo {
	public static void main(String[] args) {
		double value = new TaxCalculator()
			.withTaxRegional()
			.withTaxSurcharge()
			.calculate(order);
	}
}
```

위의 코드는 지역 세금과 추가 요금은 주문에 추가하고 싶다는 점을 명확하게 보여줍니다.

하지만, 위의 구현은 코드가 장황하다는 점이 이 기법의 문제입니다. 또한, 도메인의 각 세금에 해당하는 `boolean` 필드가 필요하므로 확장성도 제한적입니다.

```java
public class TaxCalculator {
	private DoubleUnaryOperator taxFunction = d -> d;

	public TaxCalculator with(DoubleUnaryOperator f) {
		taxFunction = taxFunction.andThen(f);
		return this;
	}

	public double calculate(Order order) {
		return taxFunction.applyAsDouble(order.getValue());
	}
}
```

```java
class Foo {
	public static void main(String[] args) {
		double value = new TaxCalculator()
			.with(Tax::regional)
			.with(Tax::surcharge)
			.calculate(order);
	}
}
```

위 코드처럼 `메소드 참조`를 이용하여 `읽기 쉽고 코드를 간결`하게 만들 수 있습니다.

## 10.4 실생활의 자바 8 DSL

| 패턴 이름                   | 장점                                                           | 단점                                                 |
| --------------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| `메소드 체인`               | 메소드 이름이 키워드 인수 역할을 한다.                         | 구현이 장황하다.                                     |
|                             | 선택형 파라미터와 잘 동작한다.                                 | 빌드를연결하는 접착 코드가 필요하다.                 |
|                             | DSL 사용자가 정해진 순서로 메소드를 호출하도록 강제할 수 있다. | 들여쓰기 규칙으로만 도메인 객체 계층을 정의한다.     |
|                             | 정적 메소드를 최소화하거나 업앨 수 있다.                       |                                                      |
|                             | 문법적 잡음을 최소화한다.                                      |                                                      |
| `중첩함수`                  | 구현의 장황함을 줄일 수 있다.                                  | 정적 메소드의 사용이 빈번하다.                       |
|                             | 함수중첩으로 도메인 객체 계층을 반영한다.                      | 이름이 아닌 위치로 인수를 정의한다.                  |
|                             |                                                                | 선택형 파라미터를 처리할 메소드 오버로딩이 필요하다. |
| `람다를 이용한 함수 시퀀싱` | 선택형 파라미터와 잘 동작한다.                                 | 구현이 장황하다.                                     |
|                             | 정적 메소드를 최소화하거나 없앨 수 있다.                       | 람다 표현식으로 인한 문법적 잡음이 DSL에 존재한다.   |
|                             | 람다 중첩으로 도메인 객체 계층을 반영한다.                     |                                                      |
|                             | 빌더의 접착 코드가 없다.                                       |                                                      |

## 10.5 마치며

- `DSL`의 `주요 기능`은 개발자와 도메인 전문가 사이의 간격을 좁히는 것
- `DSL`은 크게 내부적 DSL과 외부적 DSL로 나뉨
  - `내부적 DSL`: DSL이 사용될 애플리케이션을 개발한 언어를 그대로 활용
  - `외부적 DSL`: 직접 언어를 설계
- `JVM`에서 이용할 수 있는 스칼라, 그루비 등의 다른 언어로 `다중 DSL을 개발`할 수 있음  
  하지만 자바와 통합하려면 `빌드 과정이 복잡`해지며 자바와의 `상호 호환성 문제`도 생길 수 있음
- `자바`의 장황함과 문법적 엄격함 떄문에 `내부적 DSL을 개발하는 언어로는 적합하지 않음`  
  하지만 `람다 표현식`과 `메소드 참조` 덕분에 많이 `개선` 됨
- 최신 자바는 자체 API에 작은 DSL 제공
- 자바로 DSL을 구현할 때 보통 `메소드 체인`, `중첩 함수`, `함수 시퀀싱` 세 가지 패턴이 사용 됨  
  각각의 장단점이 있지만 `모두 합쳐 하나의 DSL로 장점만을 누릴 수 있음`
- 많은 자바 프레임워크와 라이브러리를 DSL을 통해 이용할 수 있음
