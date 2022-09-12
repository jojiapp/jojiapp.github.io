---
title: Spring Webflux GlobalExceptionHandler
date: '2022-09-12'
tags: ['Java', 'Spring', 'Spring Webflux', 'Exception']
draft: false
summary: Spring Webflux GlobalExceptionHandler
---

# Spring Webflux GlobalExceptionHandler

우리에게 익숙한 기존의 `Spring MVC`에서 `@RestControllerAdvice`를 선언하고 `@ExceptionHandler`에 핸들링할 `Exception`을 매핑하여 사용하였습니다.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    private APIResponse<Void> exception(Exception e) {
        log.error("message", e);
        return APIResponse.error(INTERNAL_SERVER_ERROR.getMessage());
    }
}
```

`Spring Webflux`에서 `Functional 방식`으로 사용하면 위 처럼 사용할 수 없습니다.

## DefaultErrorWebExceptionHandler 살펴보기

기본적으로 아무런 설정을 하지 않으면 `DefaultErrorWebExceptionHandler`가 에러를 캐치하여 처리하게 됩니다.

```java
protected Mono<ServerResponse> renderErrorResponse(ServerRequest request) {
    Map<String, Object> error = getErrorAttributes(request, getErrorAttributeOptions(request, MediaType.ALL));
    return ServerResponse.status(getHttpStatus(error)).contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromValue(error));
}
```

`ErrorResponse`를 만드는 메소드를 보면 `getErrorAttributes`를 호출하고 있습니다.

```java
protected Map<String, Object> getErrorAttributes(ServerRequest request, ErrorAttributeOptions options) {
    return this.errorAttributes.getErrorAttributes(request, options);
}
```

`getErrorAttributes`는 `errorAttributes`를 통해서 관련 처리를 합니다.
해당 부분은 `DefaultErrorWebExceptionHandler`에서 `오버라이딩`하고 있습니다.

> 즉, 해당 메소드를 오버라이딩 하여 처리하면 된다는 것을 알 수 있습니다.

```java
public DefaultErrorWebExceptionHandler(ErrorAttributes errorAttributes, Resources resources,
    ErrorProperties errorProperties, ApplicationContext applicationContext) {
    super(errorAttributes, resources, applicationContext);
    this.errorProperties = errorProperties;
}
```

여기서 생성자를 보면 `errorAttributes`를 주입받는 다는 것을 알 수 있습니다.

`ErrorAttributes`는 `DefaultErrorAttributes`를 기본적으로 사용하고 있습니다.

`DefaultErrorWebExceptionHandler`는 `AbstractErrorWebExceptionHandler`를 상속받아 구현한 것이기 때문에
저희 또한 `AbstractErrorWebExceptionHandler`를 상속받아 `GlobalExceptionHandler`를 만들 수 있다는 것을 알 수 있습니다.

또한 응답 값을 커스텀 하기 위해서는 `ErrorAttributes`를 상속받아 구현 하면 됩니다.

## GlobalErrorAttributes 만들기

`ErrorAttributes`를 상속받아 구현해도 되지만 위에서 살펴봤듯 중요한건 `getErrorAttributes` 메소드입니다.

그렇기에 그 외의 부분을 이미 오버라이딩한 `DefaultErrorAttributes`를 상속받도록 하겠습니다.

```java
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public class BaseResponse<T> {

    private final String status;
    private final String message;
    private final T data;

}
```

```java
@Component
@RequiredArgsConstructor
public class GlobalErrorAttributes extends DefaultErrorAttributes {

    private final ObjectMapper objectMapper;

    @Override
    public Map<String, Object> getErrorAttributes(final ServerRequest request, final ErrorAttributeOptions options) {
        final Throwable error = getError(request);

        if(error instanceof IllegalStateException) {
            return getResponse(error.getMessage(), BAD_REQUEST);
        }
        return getResponse(error.getMessage(), INTERNAL_SERVER_ERROR);
    }

    private Map<String, Object> getResponse(
            final String message,
            final HttpStatus httpStatus
    ) {
        final BaseResponse<Object> response = BaseResponse.builder()
                .status(String.valueOf(httpStatus.value()))
                .message(message)
                .build();
        return objectMapper.convertValue(response, new TypeReference<>() {});
    }
}
```

`getError()`를 통해 에러 정보를 가져온 뒤, 해당 에러로 분기 작업을 하면됩니다.

그럼 이렇게 반한한 정보를 받을 `GlobalExceptionHandler`를 만들어야 합니다.

## GlobalExceptionHandler 만들기

```java
@Slf4j
@Component
public class GlobalExceptionHandler extends AbstractErrorWebExceptionHandler {

    public GlobalExceptionHandler(
            final ErrorAttributes errorAttributes,
            final WebProperties.Resources resources,
            final ApplicationContext applicationContext,
            final ServerCodecConfigurer serverCodecConfigurer
    ) {
        super(errorAttributes, resources, applicationContext);
        super.setMessageReaders(serverCodecConfigurer.getReaders());
        super.setMessageWriters(serverCodecConfigurer.getWriters());
    }

    @Override
    protected RouterFunction<ServerResponse> getRoutingFunction(final ErrorAttributes errorAttributes) {
        return RouterFunctions.route(RequestPredicates.all(), this::renderErrorResponse);
    }

    private Mono<ServerResponse> renderErrorResponse(final ServerRequest request) {
        final Map<String, Object> errorProperties = getErrorAttributes(request, ErrorAttributeOptions.defaults());
        return ServerResponse.status(Integer.parseInt(errorProperties.get("status").toString()))
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(errorProperties));
    }
}
```

`AbstractErrorWebExceptionHandler`를 상속받아 구현하면 됩니다.

하지만 여기서 주의해야 할 점은 상속받은 대로 생성자를 생성하면 `WebProperties.Resources` 및 `setMessageReaders`, `setMessageWriters` 은 `null`이 될수 없다며 예외가 발생합니다.

그렇기에 위의 생성자 처럼 작업을 해준 뒤 `WebProperties.Resources`부분은 빈을 따로 생성해주면 됩니다.

```java
@Configuration
public class ResourceWebPropertiesConfig {

    @Bean
    public WebProperties.Resources resources() {
        return new WebProperties.Resources();
    }

}
```

이제 예외가 발생하면 공통으로 처리할 `GlobalExceptionHandler`를 만들었고, 예외를 터트려보면 잘 작동하는 것을 확인할 수 있습니다.

## 마치며

`Spring MVC`에서 어노테이션으로 뚝딱하여 너무 편하게 사용하고 있어서 직접 상속받아 구현을 하는 부분이 조금 낯설기도 하지만
직접 구현을 다 뜯어보는 기분도 들어 재밌는것 같습니다.

현재는 `HttpStatus`를 `GlobalAttributes`에서 반환하는 필드 중 하나로 의존하고 있는데, `HttpStatus`를 응답 값으로 내려주지 않을 경우
해당 부분만 제외 해야한다면 `GLobalExceptionHandler`에서 다시 한번 내려줄 응답값만 필터링 과정을 거쳐야 할 것 같습니다.

## 참고 사이트

- [https://www.baeldung.com/spring-webflux-errors](https://www.baeldung.com/spring-webflux-errors)
