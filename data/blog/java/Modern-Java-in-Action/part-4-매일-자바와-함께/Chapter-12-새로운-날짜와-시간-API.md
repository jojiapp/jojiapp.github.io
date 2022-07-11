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
public class Chap12 {
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
public class Chap12 {
	void test() throws Exception {
		LocalDate date = LocalDate.of(2017, 9, 21); // 2017-09-21
		date.get(ChronoField.YEAR);
	}
}
```

`LocalDate`에서 제공하는 내장함수를 이용하여 가독성을 더 높일 수 있습니다.

```java
public class Chap12 {
	void test() throws Exception {
		LocalDate date = LocalDate.of(2017, 9, 21); // 2017-09-21
		date.getYear();
	}
}
```

#### 💡 `LocalTime`: 시간

```java
public class Chap12 {
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
public class Chap12 {
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
public class Chap12 {
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
public class Chap12 {
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
public class Chap12 {
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
public class Chap12 {
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
public class Chap12 {
	void test() throws Exception {
		LocalDate date1 = LocalDate.of(2017, 9, 21);
		LocalDate date2 = date1.plusDays(3); // 2017-09-24
		LocalDate date3 = date1.minusDays(3); // 2017-09-18
	}
}
```

### 12.2.1 TemporalAdjusters 사용하기

다음 주 일요일 혹은 해달 달의 마지막 날 등 조금 더 복잡한 기능들을 `TemporalAdjusters`의 `정적 메소드`를 사용하면 쉽게 구현할 수 있습니다.

```java
public class Chap12 {
	public void test() throws Exception {
		LocalDate date = LocalDate.of(2014, 3, 18);
		LocalDate sunday = date.with(nextOrSame(DayOfWeek.SUNDAY));
		LocalDate lastDay = date.with(lastDayOfMonth());
	}
}
```

- 모든 반환값은 `TemporalAdjuster` 입니다.

| 메소드                         | 설명                                                                       |
| ------------------------------ | -------------------------------------------------------------------------- |
| `dayOfWeekInMonth`             | 서수 요일에 해당하는 날짜를 반환 (음수를 사용하면 월의 끝에서 거꾸로 계산) |
| `firstDayOfMonth`              | 현재 달의 첫 번쨰 날짜를 반환                                              |
| `firstDayOfNextMonth`          | 다음 달의 첫 번쨰 날짜를 반환                                              |
| `firstDayOfNextYear`           | 내년의 첫 번쨰 날짜를 반환                                                 |
| `firstDayOfYear`               | 올해의 첫 번쨰 날짜를 반환                                                 |
| `firstInMonth`                 | 현재 달의 첫 번쨰 요일에 해당하는 날짜를 반환                              |
| `lastDayOfMonth`               | 현재 달의 마지막 날짜를 반환                                               |
| `lastDayOfNextMonth`           | 다음 달의 마지막 날짜를 반환                                               |
| `lastDayOfNextYear`            | 내년의 마지막 날짜를 반환                                                  |
| `lastDayOfYear`                | 올해의 마지막 날짜를 반환                                                  |
| `lastInMonth`                  | 현재 달의 마지막 요일에 해당하는 날짜를 반환                               |
| `next`, `previous`             | 현재 달에서 현재 날짜 이후로 지정한 요일이 처음으로 나타나는 날짜를 반환   |
| `nextOrSame`, `previousOrSame` | 현재 날짜 이후로 지정한 요일이 처음/이전으로 나타나는 날짜를 반환          |

### 12.2.2 날짜와 시간 객체 출력과 파싱

`java.time.format` 패키지가 추가 될 정도로 날짜와 시간 관련 작업에서 `포매팅`과 `파싱`은 서로 떨어질 수 없는 관계 입니다.

해당 패키지에서 가장 중요한 클래스는 `DateTimeFormatter`입니다.

`DateFormat` 클래스와는 다르게 `DateTimeFormatter` 클래스는 스레드에 안전합니다

정적 메소드를 이용하여 `포맷팅`하거나 `파싱`할 수 있습니다.

```java
public class Chap12 {
	public void test() throws Exception {
		LocalDate date = LocalDate.of(2014, 3, 18);
		String basic = date.format(DateTimeFormatter.BASIC_ISO_DATE); // 20140318
		String isoLocal = date.format(DateTimeFormatter.ISO_LOCAL_DATE); // 2014-03-18

		LocalDate parse = LocalDate.parse(isoLocal, DateTimeFormatter.ISO_LOCAL_DATE);
	}
}
```

또는 `직접 형식을 지정`하여 사용할 수도 있습니다.

```java
public class Chap12 {
	public void test() throws Exception {
		LocalDate date = LocalDate.of(2014, 3, 18);
		String format = date.format(DateTimeFormatter.ofPattern("yyyy/MM/dd")); // 2014/03/18
	}
}
```

## 12.3 다양한 시간대와 캘린더 활용 방법

기존의 `TimeZone`을 대체할 수 있는 `ZoneId` 클래스가 추가되었습니다.

`ZoneId` 클래스도 불변 클래스입니다.

### 12.3.1 시간대 사용하기

표준 시간이 같은 지역을 묶어서 `시간대 규칙 집합`을 `정의`합니다.

```java
public class Chap12 {
	public void test() throws Exception {
		ZoneId.of("Europe/Rome");
	}
}
```

`지역 ID`는 `[지역]/[도시]` 형식으로 이루어지며 [IANA Time ZOne Database](https://www.iana.org/time-zones)에서 제공하는 지역 집합 정보를 사용합니다.

```java
public class Chap12 {
	public void test() throws Exception {
		ZoneId zoneId = TimeZone.getDefault().toZoneId();
	}
}
```

기존의 `TimeZone`도 `toZoneId()`를 사용하여 `ZoneId`로 변환핧 수 있습니다.

`LocalDate`, `LocalDateTime`를 `Instant`를 이용해서 `ZonedDateTime`으로 변환할 수 있습니다.

### 12.3.2 UTC/Greenwich 기준의 고정 오프셋

때로는 `UTC(협정 세계시)`/`GMT(그리니치 표준시)`를 기준으로 시간대를 표현하기도 합니다.

예를 들어 뉴욕은 런던보다 5시간 느리다라고 표현할 수 있습니다.

`ZoneId`의 서브 클래스인 `ZoneOffset` 클래스로 그리니치 0도 자오선과 시간값의 차이를 표현할 수 있습니다.

```java
public class Chap12 {
	public void test() throws Exception {
		ZoneOffset newYorkOffset = ZoneOffset.of("-05:00");
	}
}
```

위 방식은 서머타임을 제대로 처리할 수 없으므로 권장하지 않는 방식입니다.

```java
public class Chap12 {
	public void test() throws Exception {
		ZoneOffset newYorkOffset = ZoneOffset.of("-05:00");
		LocalDateTime now = LocalDateTime.now();
		OffsetDateTime offsetDateTime = OffsetDateTime.of(now, newYorkOffset);
	}
}
```

위 처럼 날짜와 시간을 표현하는 `OffsetDateTime`을 만들 수 있습니다.

새로운 날짜와 시간 API는 ISO 캘린더 시스템에 기반하지 않은은 정보도 처리할 수 있는 기능을 제공합니다.

### 12.3.3 대안 캘린더 시스템 사용하기

`ISO-8601` 캘린더 시스템은 실질적으로 전 세계에서 통용됩니다.

하지만 `Java 8`에서는 4개의 추가 캘린더 시스템 (`ThaiBuddhistDate`, `MinguoDate`, `JapaneseDate`, `HijrahDate`)을 제공합니다.

위 4개의 클래스와 `LocalDate` 클래스는 `ChronoLocalDate` 인터페이스를 상속 받습니다.

`LocalDate`는 이를 이용해서 위의 4개의 클래스 중 하나의 인스턴스를 만들 수 있습니다.

```java
public class Chap12 {
	public void test() throws Exception {
		LocalDateTime now = LocalDateTime.now();
		JapaneseDate japaneseDate = JapaneseDate.from(now);
	}
}
```

## 12.4 마치며

- `Java 8` 이전에 제공하던 `Date`클래스는 여러 불일치점, 가변성, 어설픈 오프셋, 기본값, 잘못된 이름 결정 등 설계 결함이 존재
- 새로운 날짜와 시간 API에서 `날짜`와 `시간` 객체는 모두 `불변`
- 새로운 API는 각각 `사람과 기계`가 편리하게 날짜와 시간 정보를 관리할 수 있도록 `두 가지 표현 방식을 제공`
- 날짜와 시간 객체를 절대적인 방법과 상대적인 방법으로 처리할 수 있음
- `TemporalAdjuster`를 이용하면 단순히 값을 바꾸는 것 이상의 복잡한 동작을 수행할 수 있음
- 날짜와 시간 객체를 특정 포맷으로 출력하고 파싱하는 포매터를 정의할 수 있으며, 포매터는 `스레드 안정성`을 `보장`
- 특정 `지역/장소`에 상대적인 시간대 또는 UTC/GMT 기준의 오프셋을 이용해서 시간대를 정의할 수 있으며 이 시간대를 날짜와 시간 객체에 적용해서 지역화할 수 있다.
- `ISO-8601` 표준 시스템을 준수하지 않는 캘린더 시스템도 사용할 수 있다.
