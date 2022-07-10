---
title: Chapter 12. 새로운 날짜와 시간 API
date: '2022-07-11'
tags: ['Java', 'Modern Java In Action']
draft: false
summary: Chapter 12. 새로운 날짜와 시간 API
---

# Chapter 12. 새로운 날짜와 시간 API

`Java 1.0`에서는 `Date`클래스 하나로 날짜와 시간 관련 기능을 제공했습니다.

`Date`클래스는 특정 시점이 아닌 밀리초 단위로 표현합니다.
또한 1900년을 기준으로 하는 오프셋, 0에서 시작하는 달 인덱스 등 모호한 설계로 유용성이 떨어집니다.

하지만, 이전 버전과의 호환성을 꺠뜨리지 않으면서 이를 해결 할 방법이 없었기에 쭉 사용되었습니다.

`Java 1.1`에서는 `Data`클래스의 여러 메소드를 사장시키고 `Calendar`클래스를 대안으로 제공하였습니다.

하지만, `Calendar`클래스 역시 설계적인 문제를 갖고 있습니다.

- 1900년도 부터 시작하는 오프셋은 없앴지만, 여전히 달 인덱스는 0부터 시작
- `Date`와 `Calendar` 두 가지 클래스가 있으므로 개발자가 혼동
- `DateFormat` 같은 일부 기능은 `Date`클래스에만 작동

`DateFormat` 또한 스레드에 안전하지 않기 때문에 예기치 못한 결과가 일어날 수 있습니다.

마지막으로 `Date`, `Calendar` 모두 가변 클래스입니다.

## 12.1 LocalDate, LocalTime, Instant, Duration, Period 클래스

### 12.1.1 LocalDate와 LocalTime 사용

#### 💡 `LocalDate`: 날짜

```java
public class Chap11 {
	void test() throws Exception {
		LocalDate date = LocalDate.of(2017, 9, 21); // 2017-09-21
		int year = date.getYear(); // 2017
		Month month = date.getMonth(); // SEPTEMBER
		int dayOfMonth = date.getDayOfMonth(); // 21
		DayOfWeek dayOfWeek = date.getDayOfWeek(); // THURSDAY
		int len = date.lengthOfMonth(); // 31 (월의 일 수)
		boolean leapYear = date.isLeapYear(); // false (윤년이 아님)
		LocalDate now = LocalDate.now(); // 오늘 날짜
	}
}
```

`get()`에 `TemporalField`를 전달하여 값을 얻는 방법도 있습니다.

`ChronoField`는 `TemporalField` 인터페이스를 정의하므로 아래처럼 값을 가져올수 있습니다.

```java
public class Chap11 {
	void test() throws Exception {
		LocalDate date = LocalDate.of(2017, 9, 21); // 2017-09-21
		date.get(ChronoField.YEAR);
	}
}
```

`LocalDate`에서 제공하는 내장함수를 이용하여 가독성을 더 높일 수 있습니다.

```java
public class Chap11 {
	void test() throws Exception {
		LocalDate date = LocalDate.of(2017, 9, 21); // 2017-09-21
		date.getYear();
	}
}
```

#### 💡 `LocalTime`: 시간

```java
public class Chap11 {
	void test() throws Exception {
		LocalTime time = LocalTime.of(13, 35, 20);
		int hour = time.getHour();
		int minute = time.getMinute();
		int second = time.getSecond();
	}
}
```

> 정적 메소드인 `.parse()`를 이용하여 문자열로 `LocalDate`, `LocalTime`을 만들수 있습니다.

### 12.1.2 날짜와 시간 조합

`LocalDateTime`은 `LocalDate`와 `LocalTime`을 모두 갖는 클래스입니다.

```java
public class Chap11 {
	void test() throws Exception {
		LocalDate date = LocalDate.of(2017, Month.SEPTEMBER, 21);
		LocalTime time = LocalTime.of(13, 34, 20);

		LocalDateTime dt1 = LocalDateTime.of(2017, Month.SEPTEMBER, 21, 13, 45, 20);
		LocalDateTime dt2 = LocalDateTime.of(date, time);
		LocalDateTime dt3 = date.atTime(13, 45, 20);
		LocalDateTime dt4 = date.atTime(time);
		LocalDateTime dt5 = time.atDate(date);
	}
}
```

### 12.1.3 Instant 클래스 : 기계의 날짜와 시간

사람은 보통 주, 날짜, 시간, 분으로 날짜를 계산하지만
기계 관점에서는 특정 지점을 하나의 큰 수로 표현하는 것이 훨씬 자연스러운 시간 표현 방법입니다.

`Instant`클래스는 기계관저메서 시간을 표현합니다. (나노초 10억분의 1의 정밀도를 제공)

`유닉스 에포크 시간 (1970년 1월 1일 0시 0분 0초 UTC)`을 기준으로 특정 지점까지의 시간을 초로 표현합니다.

팩토리 메소드인 `ofEpochSecond()`에 초를 넘겨줘서 `Instant` 클래스 인스턴스를 만들 수 있습니다.

```java
public class Chap11 {
	void test() throws Exception {
		Instant instant1 = Instant.ofEpochSecond(3);
		Instant instant2 = Instant.ofEpochSecond(2, 1_000_000_000); // 2초 이후의 1억 나노초(1초)
	}
}
```

> `Instant` 클래스는 사람이 읽을 수 있는 시간 정보는 제공하지 않습니다.

### 12.1.4 Duration과 Period 정의

지금까지 살펴본 모든클래스는 `Temporal` 인터페이스를 구현합니다.

`Temporal`는 특정 시간을 모델링 하는 객체의 값을 어떻게 읽고 조작할지 정의합니다.

#### 💡 `Duration`: 초와 나노초로 시간 단위 표현

- 두 시간 사이의 시간 차

```java
public class Chap11 {
	void test() throws Exception {
		LocalTime startTime = LocalTime.of(10, 0);
		LocalTime endTime = LocalTime.of(12, 0);
		Duration between = Duration.between(startTime, endTime);
		System.out.println(between.getSeconds()); // 7200
	}
}
```

> `LocalDateTime`과 `Instant`는 혼합하여 사용할 수 없습니다.

#### 💡 Period: 기간 표현

- 두 날짜 사이의 기간 차

```java
public class Chap11 {
	void test() throws Exception {
		LocalDate startDate = LocalDate.of(2020, 2, 2);
		LocalDate endDate = LocalDate.of(2021, 2, 2);
		Period period = Period.between(startDate, endDate);
		System.out.println(period.getYears());
	}
}
```

> 지금까지 살펴본 클래스는 모두 `불변`입니다.

## 12.2 날짜 조정, 파싱, 포매팅

`withXXX` 메소드로 기존의 `LocalDate`를 변경한 버전을 쉽게 만들 수 있습니다.

```java
public class Chap11 {
	void test() throws Exception {
		LocalDate date1 = LocalDate.of(2017, 9, 21);
		LocalDate date2 = date1.withYear(2011); // 2011-09-21
		LocalDate date3 = date2.withDayOfMonth(25); // 2011-09-25
		LocalDate date4 = date3.with(ChronoField.MONTH_OF_YEAR, 2); // 2011-02-25
	}
}
```

지정된 필드를 지원하지 않으면 `UnsupportedTemporalTypeException`이 발생합니다.

`plusXXX`, `minusXXX` 메소드를 사용하여 상대적으로 값을 변경할 수 있습니다.

```java
public class Chap11 {
	void test() throws Exception {
		LocalDate date1 = LocalDate.of(2017, 9, 21);
		LocalDate date2 = date1.plusDays(3); // 2017-09-24
		LocalDate date3 = date1.minusDays(3); // 2017-09-18
	}
}
```
