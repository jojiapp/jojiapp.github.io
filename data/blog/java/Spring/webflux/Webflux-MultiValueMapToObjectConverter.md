---
title: Spring Webflux MultiValueMap 객체로 변환
date: '2022-09-27'
tags: ['Java', 'Spring', 'Spring Webflux', 'MultiValueMap', 'Converter']
draft: false
summary: Spring Webflux MultiValueMap 객체로 변환
---

# Spring Webflux MultiValueMap 객체로 변환

`Spring Webflux`에서 `Body`의 경우 `ServerRequest`객체의 `bodyToMono`로 가져올 수 있습니다.

하지만 `formData`나 `QueryParams`는 `MultiValueMap`으로 되어 있기 때문에 직접 변환을 해주어야 합니다.

`ObjectMapper`를 통해 간단하게 변환 될 줄 알았지만, `MultiValueMap`은 `Value`가 `List 타입`이기 때문에
일반 `Map`으로 변환 후 `ObjectMapper`로 변환해 주어야 원하는 객체로 정상적으로 변환이 됩니다.

```java
@Component
@RequiredArgsConstructor
public class MultiValueMapToObjectConverter {

    private final ObjectMapper objectMapper;

    @Override
    public <T> T convert(final MultiValueMap<String, String> queryParams, final Class<T> classType) {

        return objectMapper.convertValue(toMap(queryParams), classType);
    }

    private static Map<String, Object> toMap(final MultiValueMap<String, String> queryParams) {

        final Map<String, Object> result = new HashMap<>();
        queryParams.forEach((key, value) -> result.put(key, isList(value) ? value : value.get(0)));

        return result;
    }

    private static boolean isList(final List<String> value) {

        return value.size() > 1;
    }

}
```

```java
queryParamsConverterResolver.convert(queryParams, PostCreate.class)
```

정상적으로 원하는 객체로 변환 되는 것을 확인할 수 있습니다.

## 특수한 객체도 호환 되도록 모듈화

`Spring MVC`에서 `Controller 파라미터`에 `Pageable` 객체를 넣어두면
`?page=1&size=1&sort=createdAt,desc`의 페이징 정보를 `Pageable` 객체에 바인딩 해줍니다.

지금은 `Pageable`를 호환 되게, 추후에는 이와 비슷하게 특수한 형태의 객체로 변환하기 위해
`MultiValueMap`을 특정 객체로 변환하도록 모듈화를 해보겠습니다.

### MultiValueMapToObjectConverterResolver

```java
@Component
public class MultiValueMapToObjectConverterResolver {

    private final Map<Class<?>, AbstractMultiValueMapToObjectConverter> converterMap = new ConcurrentReferenceHashMap<>();

    public <T> T convert(final MultiValueMap<String, String> queryParams, final Class<T> classType) {

        return getObjectConverter(classType).convert(queryParams, classType);
    }

    private AbstractMultiValueMapToObjectConverter getObjectConverter(final Class<?> classType) {

        return converterMap.getOrDefault(classType, getDefaultConverterOrThrow());
    }

    private AbstractMultiValueMapToObjectConverter getDefaultConverterOrThrow() {

        final AbstractMultiValueMapToObjectConverter defaultConverter = converterMap.get(Object.class);
        if(defaultConverter == null) {
            throw new IllegalStateException("Default QueryParamsConverter가 존재하지 않습니다.");
        }

        return defaultConverter;
    }

    public void addConverter(final Class<?> classType, final AbstractMultiValueMapToObjectConverter converter) {

        this.converterMap.put(classType, converter);
    }

}
```

사용자는 위의 `resolver`의 `convert`에 `MultiValueMap`와 변환할 `객체 타입`을 해당 타입을 지원하는 `Converter`가 선택되어
변환을 해줄 것 입니다.

### AbstractMultiValueMapToObjectConverter

```java
public abstract class AbstractMultiValueMapToObjectConverter {

    protected AbstractMultiValueMapToObjectConverter(final Class<?> classType,
                                                     final MultiValueMapToObjectConverterResolver multiValueMapToObjectConverterResolver) {

        multiValueMapToObjectConverterResolver.addConverter(classType, this);
    }

    public abstract <T> T convert(final MultiValueMap<String, String> queryParams, final Class<T> classType);

}
```

모든 `MultiValueMapToObjectConverter`는 `AbstractMultiValueMapToObjectConverter`를 상속받아 구현합니다

이때, 변환을 지원할 객체 타입을 지정하면 자동으로 `resolver`에 등록 되도록 하였습니다.

> 저는 `Object` 타입이면 기본 `Converter`로 지정하였습니다.
>
> 즉, 특별히 지원하는 `Converter`가 존재하지 않는다면 `Object`타입을 지원하는 `Converter`를 사용할 것 입니다.

### MultiValueMapToObjectConverter

```java
@Component
public class MultiValueMapToObjectConverter extends AbstractMultiValueMapToObjectConverter {

    private final ObjectMapper objectMapper;

    public MultiValueMapToObjectConverter(final MultiValueMapToObjectConverterResolver multiValueMapToObjectConverterResolver,
                                          final ObjectMapper objectMapper) {

        super(Object.class, multiValueMapToObjectConverterResolver);
        this.objectMapper = objectMapper;
    }

    @Override
    public <T> T convert(final MultiValueMap<String, String> queryParams, final Class<T> classType) {

        return objectMapper.convertValue(toMap(queryParams), classType);
    }

    private static Map<String, Object> toMap(final MultiValueMap<String, String> queryParams) {

        final Map<String, Object> result = new HashMap<>();
        queryParams.forEach((key, value) -> result.put(key, isList(value) ? value : value.get(0)));

        return result;
    }

    private static boolean isList(final List<String> value) {

        return value.size() > 1;
    }

}
```

기본적인 객체는 위의 `Converter`를 사용합니다.

### MultiValueMapToPageableConverter

```java
@Component
public class MultiValueMapToPageableConverter extends AbstractMultiValueMapToObjectConverter {

    private static final String SIZE = "size";
    private static final String PAGE = "page";
    private static final String SORT = "sort";

    public MultiValueMapToPageableConverter(final MultiValueMapToObjectConverterResolver multiValueMapToObjectConverterResolver) {

        super(PageRequest.class, multiValueMapToObjectConverterResolver);
    }

    @Override
    public <T> T convert(final MultiValueMap<String, String> queryParams, final Class<T> classType) {

        return (T) PageRequest.of(
                getSize(queryParams),
                getPage(queryParams),
                Sort.by(getOrders(queryParams))
        );
    }

    private static int getSize(final MultiValueMap<String, String> queryParams) {

        return parseInt(queryParams, SIZE);
    }

    private static int getPage(final MultiValueMap<String, String> queryParams) {

        return parseInt(queryParams, PAGE);
    }

    private static int parseInt(final MultiValueMap<String, String> queryParams, final String key) {

        try {
            return Integer.parseInt(queryParams.get(key).get(0));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("%s: 숫자가 아닙니다.".formatted(key), e);
        }
    }

    private static List<Sort.Order> getOrders(final MultiValueMap<String, String> queryParams) {

        return queryParams.get(SORT)
                .stream()
                .map(MultiValueMapToPageableConverter::createOrder)
                .toList();
    }

    private static Sort.Order createOrder(final String sort) {

        return getOrder(sort).equalsIgnoreCase(Sort.Direction.DESC.name()) ?
                Sort.Order.desc(getProperty(sort)) :
                Sort.Order.asc(getProperty(sort));
    }

    private static String getOrder(final String sort) {

        try {
            return sort.split(",")[1];
        } catch (ArrayIndexOutOfBoundsException e) {
            return Sort.Direction.ASC.name();
        }
    }

    private static String getProperty(final String sort) {

        return sort.split(",")[0];
    }

}
```

`PageRequest`객체는 `Pageable`의 구현체 중 하나 입니다.

`Spring MVC`에서 바인딩 되는 객체도 `PageRequest`이기 때문에 `MultiValueMap`에서 값을 꺼내 해당 객체를 만들어 줍니다.

이 처럼 특수한 객체에 맞는 `Converter`를 구현하면 `resolver`에 등록이 되고 `해당 타입`은 `Converter`에 매핑되어 변환 될 것입니다.

## MultiValueMapToObjectConverterResolver를 사용하여 변환하기

```java
@Component
@RequiredArgsConstructor
public class WebfluxValidator {

    private final Validator validator;
    private final BindingResultCreator bindingResultCreator;
    private final MultiValueMapToObjectConverterResolver multiValueMapToObjectConverterResolver;

    public <T> Mono<T> valid(final Mono<T> bodyMono) {

        return bodyMono.flatMap(body -> Mono.just(valid(body)));
    }

    public <T> T valid(final MultiValueMap<String, String> queryParams, final Class<T> classType) {

        return valid(multiValueMapToObjectConverterResolver.convert(queryParams, classType));
    }

    private  <T> T valid(final T object) {

        final Set<ConstraintViolation<T>> violations = validator.validate(object);
        if (!violations.isEmpty()) {
            throw new BindingException(bindingResultCreator.create(violations));
        }

        return object;
    }
}
```

이제 `MultiValueMapToObjectConverterResolver`를 주입받아 `convert`메소드에 타입을 넘겨 사용하면 됩니다.

## 마치며

`Spring MVC`에서 지원하지 않는 특수한 객체 바인딩을 하고 싶으면
`AbstractMethodArgumentResolver`를 상속 받아 구현하면 됐던 점이 생각나 나름대로 한 번 구현해 보았습니다.

블로그를 만드는데 너무 과하다는 것은 알지만, 저는 단순히 블로그를 만드는 것보다 이런 모듈화 작업을 통해
공부되는 것이 더 많기 때문에 공부 목적으로 하는 것이라 봐주시면 좋겠습니다.
