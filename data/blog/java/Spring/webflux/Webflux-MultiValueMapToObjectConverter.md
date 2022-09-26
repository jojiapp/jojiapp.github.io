---
title: Spring Webflux MultiValueMap 객체로 변환
date: '2022-09-26'
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
