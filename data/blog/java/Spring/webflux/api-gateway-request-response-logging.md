---
title: Spring API Gateway Request Response Logging
date: '2022-10-02'
tags: ['Java', 'Spring', 'Spring Webflux', 'API Gateway', 'Logging']
draft: false
summary: Spring API Gateway Request Response Logging
---

# Spring API Gateway Request Response Logging

```java

@Slf4j
@Component
@RequiredArgsConstructor
public class RequestLoggingFilter implements GlobalFilter, Ordered {

    private final ModifyRequestBodyGatewayFilterFactory modifyRequestBodyGatewayFilterFactory;

    private static void logRequest(final ServerHttpRequest request, String body) {
        log.info("============ Request Start Id: {} ============", request.getId());
        log.info("Request Id: {}, URI: {}", request.getId(), request.getURI());
        log.info("Request Id: {}, Headers: {}", request.getId(), request.getHeaders());
        log.info("Request Id: {}, QueryParams: {}", request.getId(), request.getQueryParams());
        log.debug("Request Id: {}, Body: {}", request.getId(), body);
        log.info("============ Request End Id: {} ============", request.getId());
    }

    @Override
    public Mono<Void> filter(final ServerWebExchange exchange, final GatewayFilterChain chain) {
        return modifyRequestBodyGatewayFilterFactory
                .apply(modifyRequestBodyGatewayFilterConfig())
                .filter(exchange, chain);
    }

    private ModifyRequestBodyGatewayFilterFactory.Config modifyRequestBodyGatewayFilterConfig() {
        return new ModifyRequestBodyGatewayFilterFactory.Config()
                .setRewriteFunction(String.class, String.class, (exchange, body) -> {
                            logRequest(exchange.getRequest(), body);
                            return Mono.just(body);
                        }
                );
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}

```

```java

@Slf4j
@Component
@RequiredArgsConstructor
public class ResponseLoggingFilter implements GlobalFilter, Ordered {

    private final ModifyResponseBodyGatewayFilterFactory modifyResponseBodyGatewayFilterFactory;

    private static void logResponse(final ServerHttpRequest request, final ServerHttpResponse response, final String body) {
        log.info("============ Response Start Id: {} ============", request.getId());
        log.info("Response Id: {}, URI: {}", request.getId(), request.getURI());
        log.info("Response Id: {}, StatusCode: {}", request.getId(), response.getStatusCode());
        log.info("Response Id: {}, Headers: {}", request.getId(), response.getHeaders());
        log.info("Response Id: {}, Body: {}", request.getId(), body);
        log.info("============ Response End Id: {} ============", request.getId());
    }

    @Override
    public Mono<Void> filter(final ServerWebExchange exchange, final GatewayFilterChain chain) {
        return modifyResponseBodyGatewayFilterFactory
                .apply(modifyResponseGatewayFilterConfig())
                .filter(exchange, chain);
    }

    private ModifyResponseBodyGatewayFilterFactory.Config modifyResponseGatewayFilterConfig() {
        return new ModifyResponseBodyGatewayFilterFactory.Config()
                .setRewriteFunction(String.class, String.class, (exchange, body) -> {
                            logResponse(exchange.getRequest(), exchange.getResponse(), body);
                            return Mono.just(body);
                        }
                );
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}

```

APIGateway에 모든 요청과 응답에 대해 로깅을 남기는 태스크를 할당받았었습니다.

찾아본 결과 여러 방법이 있었지만 요청과 응답에 로직이 조금씩 달라 통일시키고 싶었고, 위의 방식이 가장 통일성있다고 생각되어 위 방식으로 진행했습니다.

우선 HttpServletRequest, HttpServletResponse가 아니기 때문에 직접적으로 body의 값을 가져올수 없었습니다.

그나마 위의 방식은 직관적으로 body를 가져올수 있었습니다.

각각 `ModifyRequestBodyGatewayFilterFactory` , `ModifyResponseBodyGatewayFilterFactory` 의 `Config` 의 `setRewriteFunction`
메소드를 통해 중간에 값을 가로 챌 수 있었습니다.

그래서 로깅을 하도록 구현하였고 잘 동작했었습니다.

그런데, 특정 경로에 대해서 요청이 제대로 가지 않았습니다.

이 문제는 현재까지도 해결하지 못해 우선적으로 로깅 기능을 뺀 상태입니다.

`Mono` 가 아니라 `Flux` 로 값을 전달해야 헀었나 싶기도 합니다.

- `Mono`: `0 ~ 1개`의 데이터를 전달
- `Flux`: `0 ~ N개`의 데이터를 전달

## 해결

로깅 관련 블로그들을 보며 위 처럼 만들었지만 회사에 적용 했을 때, 특정 API 들만 동작하지 않았었습니다.

모두 동작하지 않는다면 필터 자체가 잘못된 것이지만 특정 API만 동작하지 않는 다는 것은 해당 API 라우터 설정에 차이가 있을 것 같다고 생각하여
라우터와 로깅을 살펴보던 중 `NullPointerException`을 발견하였습니다

그래서 로컬에서 비슷하게 인프라를 구성하고 요청을 보냈는데 `GET`으로 보낼 때만 실패하는 것을 발견하였습니다.

> `Logging`을 위한 필터였고 `Body`값 까지 찍는 것이 목표였기 때문에 `POST`로 요청을 하고 `Body`값을 정상적으로 찍히는지만 확인을 한것이 문제였습니다.

`Mono`는 `Optional`처럼 `null`을 할당하기 위해선 `Mono.justOrEmpty()`을 사용하여야 합니다.

`Mono.just()`를 사용하였기 때문에 `GET`요청 시, `Body`값이 존재하지 않아 `NullPointerException`이 발생한 것이였습니다.

`Mono.justOrEmpty()`으로 변경 후 로컬 환경에서는 모두 잘 동작하였습니다.

## 마치며

회사의 경우 `개발 환경 API Gateway`이 존재하지 않기 때문에 아직 확인은 못해보았지만,
`개발 환경 API Gateway`가 구성이 된다면 머지 후 후기를 남겨보겠습니다.
