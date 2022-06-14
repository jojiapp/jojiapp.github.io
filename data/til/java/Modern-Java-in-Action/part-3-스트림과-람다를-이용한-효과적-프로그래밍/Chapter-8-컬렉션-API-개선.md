---
title: Chapter 8. 컬렉션 API 개선
date: '2022-06-14'
tags: ['TIL', 'Java', 'Modern Java In Action']
draft: false
summary: Chapter 8. 컬렉션 API 개선
---

# Chapter 8. 컬렉션 API 개선

## 8.1 컬렉션 팩토리

`List`를 만드는 방법은 여러 개가 존재합니다.

- 기존 방식

```java
public class CollectionTest {
    void 기존_리스트_생성() throws Exception {
        List<Integer> numbers = new ArrayList<>();
        numbers.add(1);
        numbers.add(2);
        numbers.add(3);
    }
}
```

- Java 8의 Arrays.asList를 이용한 방식

```java
public class CollectionTest {
    void arrays_asList() {
        List<Integer> numbers = Arrays.asList(1, 2, 3);
    }
}
```

내부적으로는 고정된 크기의 변환할 수 있는 `배열로 구현`되어 있기 떄문에 `추가, 삭제는 못하지만 특정 인덱스의 값을 수정`할 수 있습니다.

`추가 및 삭제`를 시도하면 `UnsupportedOperationException`이 발생합니다.

### 8.1.1 리스트 팩토리

`Java 9`부터 추가된 `List.of` 팩토리 메소드를 이용하여 `immutable`한 `List`를 만들 수 있습니다.

```java
public class CollectionTest {
    void list_of() {
        List<Integer> numbers = List.of(1, 2, 3);
    }
}
```

`Arrays.asList`와는 다르게 값을 수정할 수도 없을 뿐더러, `null`값이 할당되는 것도 허용하지 않습니다.

> #### 💡 오버로딩 vs 가변 인수
>
> `List` 인터페이스를 보면 `List.of`를 특정 개수의 인자를 받는 것과 가변인자를 받는 등 다양하게 `오버로드` 한 것을 볼 수 있습니다.
>
> `가변인자`를 받는 팩토리 메소드 하나만 있어도 다 될텐데 왜 굳이 특정 개수의 인자를 받는 것도 있을까? 하는 의문이 들수 있습니다.
>
> 그렇게 구성한 이유는 `가변인자`의 경우 `추가 배열을 할당`해서 `List`로 감싸기 때문에 나중에 `가비지 컬렉션을 하는 비용을 지불`해야하기 떄문에
> 이런 비용을 줄이고자 10개까지의 인자는 `가변인자를 사용하지 않는 방식을 채택`한 것 입니다.

### 8.1.2 집합 팩토리

`List.of`와 마찬가지로 `Set.of`를 이용하여 생성할 수 있습니다.

```java
public class CollectionTest {
    void set_of() throws Exception {
        Set<Integer> numbers = Set.of(1, 2, 3);
    }
}
```

`Set.of`의 경우 중복된 값이 있으면 거르고 생성되는 것이 아니라, `IllegalArgumentException`이 발생합니다.

### 8.1.3 맵 팩토리

`List.of`처럼 `Map.of`를 이용하여 생성할 수 있지만, 조금 다른점이 있다면 `Map`은 `key`와 `value` 한 쌍이기 때문에 인자 2개가 한 쌍이 된다는 점입니다.

`Map`은 다른 `Collection`과는 조금 다른 형식이기 때문에 `가변인자`로 생성하기 위해서는 `Map.ofEntries`를 사용해야 합니다.

```java
public class CollectionTest {
    void map_of() throws Exception {
        Map<String, String> ex = Map.ofEntries(Map.entry("key", "value"));
    }
}
```

## 8.2 리스트와 집합 처리

### 8.2.1 removeIf 메소드

```java
public class CollectionTest {

    @Test
    void for_each_방식() throws Exception {
        ArrayList<Integer> numbers = new ArrayList<>();
        numbers.add(1);
        numbers.add(2);
        numbers.add(3);
        numbers.add(4);
        numbers.add(5);

        for (int i = 0; i < numbers.size(); i++) {
            if (numbers.get(0) % 2 == 0) {
                numbers.remove(i);
            }
        }
    }
}
```

이렇게 하면 될 것 같지만 앞에 요소가 삭제 됨에 따라 `index`범위가 달라져 예외가 발생할 수 있습니다.

그렇기 떄문에 뒤에서부터 처리를 해야하고 같은 생각을 해야하는데 `removeIf`를 사용하면 이런 고민을 할 필요가 없어지게 됩니다.

```java
public class CollectionTest {
    @Test
    void removeIf() throws Exception {
        ArrayList<Integer> numbers = new ArrayList<>();
        numbers.add(1);
        numbers.add(2);
        numbers.add(3);
        numbers.add(4);
        numbers.add(5);
        numbers.removeIf(n -> n % 2 == 0);
    }
}
```

> 참고로 `List.of`로 생성 시, `추가 및 삭제를 시도하면 예외가 발생`하므로 주의해야 합니다.

### 8.2.2 replaceAll 메소드

`Stream`의 `map`을 이용하여 기존의 요소를 변경하지 않고 변경된 새로운 `List`를 반환받을 수도 있지만,
기존의 요소를 변경하고 싶다면 `replaceAll`메소드를 사용하여 할 수 있습니다.

```java
public class CollectionTest {
    void replaceAll() throws Exception {
        ArrayList<Integer> numbers = new ArrayList<>();
        numbers.add(1);
        numbers.add(2);
        numbers.add(3);
        numbers.add(4);
        numbers.add(5);
        numbers.replaceAll(n -> n + 1);
    }
}
```

사용방법은 `Stream`의 `map`과 동일하지만 `새로운 List`를 반환하느냐, 기존의 요소를 변경하느냐 정도의 차이입니다.

## 8.3 맵 처리

### 8.3.1 forEach 메소드

`Java 8`에서는 `forEach`가 추가되어 간단하게 `Map`을 순환할수 있습니다.

```java
public class CollectionTest {
    void for_each() throws Exception {
        Map<String, String> map = Map.of("key1", "value1",
                "key2", "value2");

        map.forEach((key, value) -> {
            System.out.println(key + value);
        });
    }
}
```

### 8.3.2 정렬 메소드

`key` 또는 `value`를 기준으로 정렬할 수 있는 기능이 생겼습니다.

- Entry.comparingByKey
- Entry.comparingByValue

```java
public class CollectionTest {
    void sorted() throws Exception {
        Map<String, String> map = Map.of("b", "value1",
                "a", "value2");

        map.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(System.out::println);
    }
}
```

> #### 💡 HashMap 성능
>
> `Java 8`에서는 `HashMap`내부 구조를 바꿔 성능을 개선했습니다.
>
> 기존의 `Map`은 `O(n)` 시간이 걸리는 `LinkedList`로 버킷을 반환했으나,
> 최근에는 `O(log(n))` 시간이 소요되는 정렬된 트리를 이용해 동적으로 치환해 충돌이 일어나는 요소 반환 성능을 개선 했습니다.
>
> 하지만 `String`, `Number` 클래스 같은 `Comparable`의 형태여야만 `정렬된 트리가 지원`됩니다.

### 8.3.3 getOrDefault 메소드

`Optional`의 `orElse`처럼 `key`에 해당하는 값이 존재하지 않을 때, 사용할 값을 지정할 수 있습니다.

```java
public class CollectionTest {
	void getOrDefault() throws Exception {
		Map<String, String> map = Map.of("key", "value");
		String notKey = map.getOrDefault("not key", "not value");
		System.out.println(notKey);
	}
}
```

### 8.3.4 계산 패턴

`Map`에 `key`가 존재하는지 여부에 따라, 어떤 동작을 실행하고 결과를 저장하여 사용하고 싶을 때는 아래 3가지 메소드를 사용하여 구현할 수 있습니다.

- `computeIfAbsent`: 제공된 키에 해당하는 값이 없으면(값이 없거나 null), 키를 이용해 새 값을 계산하고 `Map`에 추가

```java
public class CollectionTest {
	void computeIfAbsent() throws Exception {
		Map<String, String> map = new HashMap<>();
		String c = map.computeIfAbsent("c", s -> "c");
		System.out.println(c); // c
		System.out.println(map); // key: c, value: c
	}
}
```

- `computeIfPresent`: 제공된 키가 존재하면 새 값을 계산하고 `Map`에 추가

```java
public class CollectionTest {
	void computeIfPresent() throws Exception {
		HashMap<String, String> map = new HashMap<>();
		map.put("a", "a");
		map.computeIfPresent("a", (s, s2) -> "b");
		System.out.println(map); // key: a, value: b
	}
}
```

- `compute`: 제공된 키로 새 값을 계산하고 `Map`에 추가. 즉, `있으면 수정` `없으면 추가`합니다.

### 8.3.5 삭제 패턴

`Map`에서 항목을 제거하는 `remove` 메소드가 존재합니다.

`Java 8`에서는 `key`와 `value`가 모두 일치해야 삭제하는 `remove` 메소드를 제공합니다.

```java
public class CollectionTest {
	void remove() throws Exception {
		HashMap<String, String> map = new HashMap<>();
		map.put("a", "a");
		map.put("aa", "aa");
		map.put("b", "b");
		map.remove("aa", "aa");
		System.out.println(map); // aa만 삭제 됨
	}
}
```

### 8.3.6 교체 패턴

- `replaceAll`: `List`의 `replaceAll`과 비슷하게 동작합니다.
- `replace`: `key`가 존재하면 `Map`의 값을 바꿉니다.

### 8.3.7 합침

- `putAll`: 두 `Map`을 합칩니다.
- `merge`: 충돌이 있는 요소에 대하여 어떻게 처리할지 정의할 수 있습니다.

```java
public class CollectionTest {
	void merge() throws Exception {
		HashMap<String, String> map1 = new HashMap<>();
		map1.put("a", "a");
		HashMap<String, String> map2 = new HashMap<>();
		map2.put("a", "a");
		map2.put("b", "b");

		map1.forEach((k, v) ->
				map2.merge(k, v, (map1Value, map2Value) -> map1Value + map2Value));
		System.out.println(map2); // {a=aa, b=b}
	}
}
```

## 8.4 개선된 ConcurrentHashMap

`ConcurrentHashMap`은 `동시성 친화적`이며 최신 기술을 반영한 HashMap 버전입니다.

특정 부분만 잠궈 `동시 추가`, `갱신 작업`을 `허용`하기 때문에 동기화된 `Hashtable 버전`에 비해 `연산 성능이 월등`합니다.

### 8.4.1 리듀스와 검색

`ConcurrentHashMap`은 `Stream` 봤던 것과 비슷한 종류의 세 가지 새로운 연산을 지원합니다.

- `forEach`: 각 쌍에 주어진 액션을 실행
- `reduce`: 모든 쌍에 제공된 리듀스 함수를 이용해 결과를 합침
- `search`: `null`이 아닌 값을 반환할 때까지 각 쌍에 함수를 적용

이 연산은 `ConcurrentHashMap`의 상태로 잠그지 않고 연산을 수행하기 때문에
연산에 제공한 함수는 `계산이 진행되는 동안 바뀔수 있는 객체, 값, 순서 등에 의존하면 안됩니다.`

### 8.4.2 계수

`ConcurrentHashMap` 클래스는 `Map`의 매핑 개수를 반환하는 `mappingCount` 메소드를 제공합니다.

기존의 `size` 메소드 대신 `mappingCount` 메소드를 사용하는 것이 좋습니다.

그래야 `int`의 범위를 넘어서는 이후의 상황을 대처할 수 있기 때문입니다.

> 그런데 `mappingCount`는 어디에 있는거죠?

### 8.4.3 집합뷰

`ConcurrentHashMap`을 집합 뷰로 반환하는 `keySet`이라는 메소드를 지원합니다.

`newKeySet`이라는 메소드를 이용해 `ConcurrentHashMap`으로 유지되는 집합을 만들 수도 있습니다.

## 8.5 마치며

- `Java 9`는 적의 원소를 포함하며 `immutable`한 `List`, `Set`, `Map`을 만들수 있도록 지원
- `List` 인터페이스는 `removeIf`, `replaceAll`, `sort` 세 가지 디폴트 메소드 지원
- `Set` 인터페이스는 `removeIf` 디폴트 메소드 지원
- `Map` 인터페이스는 자주 사용하는 패턴과 버그를 방지할 수 있도록 다양한 디폴트 메소드 지원
- `ConcurrentHashMap`은 `Map`에서 상속받은 `새 디폴트 메소드를 지원`함과 동시에 `스레드 안전성` 제공
