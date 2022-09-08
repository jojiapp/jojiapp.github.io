---
title: Spring Webflux 기본
date: '2022-09-08'
tags: ['Java', 'Spring', 'Spring Webflux']
draft: false
summary: Spring Webflux 기본
---

# Spring Webflux 기본

이번에 블로그를 만들면서 이정도 간단한 사이즈를 만들 때, 평소 궁금했던 기술들을 적용하는 것이 좋겠다고 생각해서

`Spring Webflux + Elasticsearch` 조합으로 만들어 보려합니다. (추후 사이드 프로젝트는 `R2DBC`를 사용해 볼 예정)

그럼 기존의 `Spring MVC`와 `Spring Webflux`는 뭐가 다른지 하나씩 알아보겠습니다.

## Spring MVC VS Spring Webflux

이 둘의 가장 큰 차이는 `동기`와 `비동기` 방식입니다.

### Spring MVC 특징

`Spring MVC`는 `동기/블록 방식`이기 때문에 매 요청마다 별도의 스레드를 생성하여 요청을 처리합니다.
매번 쓰레드를 생성하기에는 비용이 많이 들기 때문에 `쓰레드 풀`에 미리 쓰레드를 생성해두고 가져다 쓰게 됩니다.

하지만 대량의 사용자가 접속하게 되면 이 또한 한계가 있습니다.

이런 문제가 있어서 `Spring Webflux`라는 기술이 나왔습니다.

### Spring Webflux 특징

`Spring Webflux`는 `비동기/논블럭 방식`입니다.

`nodejs`처럼 `이벤트 루프`를 이용히여 처리 되기 때문에 `리액티브 프로그래밍`이 가능해집니다.

하나의 요청이 끝날때까지 기다리는 것이 아니라 `각 요청에 대해 반응형으로 대응`하기 때문에 요청이 많을 경우
동기 방식보다 빠르게 처리할 수 있습니다.

> `동기 방식`의 경우 네트워크 같은 요청을 할 때, 요청을 보내고 하는 일은 없지만 `CPU를 계속 점유중`입니다.  
> 하지만 반응형의 경우 응답이 오기 전까지 `CPU를 점유하지 않고 다른 일`을 합니다. 그러다 `응답이 오면 해당 작업`을 하게 됩니다. (`반응형`)

## 그럼 무조건 Webflux가 더 좋은가?

`Spring MVC`는 명령형으로 코드를 짜기 때문에 디버깅이 쉽습니다.

그 외에 성능적인 측면에서는 `Webflux`가 좋습니다.

다만, `Webflux`가 꼭 필요한 상황이 아니라면 굳이 기존에 잘 돌아가던 `Spring MVC`를 `Spring Webflux`로 마이그레이션 할 필요는 없습니다.

## Component 방식 VS Functional 방식

Webflux는 2가지 방식으로 라우팅 처리를 할 수 있습니다.

### Components 방식

기존에 `Spring MVC`에서 사용하던 방식과 동일합니다.

차이점은 `Mono` or `Flux`로 `Wrapper`한다는 점입니다.

```java

@RestController
@RequiredArgsConstructor
public class PostController {

    @GetMapping("/hello")
    public Mono<String> hello() {
        return Mono.just("hello");
    }
}
```

해당 방식은 `jetty`서버를 이용하게 됩니다.

그렇기 때문에 기존의 `Spring MVC`를 `Spring Webflux`로 `마이그레이션`을 하는 경우에 용이하며,
새롭게 시작한다면 `Components 방식` 보다는 `Functional 방식`이 더 좋습니다.

### Functional 방식

`Functional 방식`은 `Netty 서버`를 사용하게 됩니다. 리액티브에 적합하게 만들어진 서버입니다. (추후 공부해 볼 예정)

```java

@Configuration
public class PostRouterConfig {

    @Bean
    protected RouterFunction<ServerResponse> routerExample(PostHandler postHandler) {
        return RouterFunctions.route()
                .POST("/posts", request -> postHandler.getPosts(request.bodyToMono(PostCreate.class)))
                .build();
    }
}
```

```java

@Component
@RequiredArgsConstructor
public class PostHandler {

    public Mono<ServerResponse> getPosts(final Mono<PostCreate> postCreateMono) {
        Mono<Map<String, String>> markdown = postCreateMono.map(postCreate -> Map.of("markdown", postCreate.getMarkdown()));
        return ServerResponse.ok().body(markdown, Map.class);
    }
}
```

`RouterFunctions.route()`를 통해 `엔드포인트`와 `실행될 핸들러`를 지정합니다.

여기서 `Mono 객체`의 `map`이라는 함수를 사용하여 실제 값에 접근하여 작업을 할 수 있습니다.

`map 함수`는 바로 실행 되지 않고 `구독자`가 받을 수 있을 때 실행됩니다.

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class PostHandler {

    public Mono<ServerResponse> createPost(final ServerRequest request) {
        Mono<String> markdown1 = request.bodyToMono(PostCreate.class)
                .map(postCreate -> {
                    log.info("aa");
                    return postCreate.getMarkdown();
                });
        Mono<String> markdown2 = request.bodyToMono(PostCreate.class)
                .map(postCreate -> {
                    log.info("bb");
                    return postCreate.getMarkdown();
                });
        ServerResponse.ok().body(markdown1, String.class); // 실행 안됨
        ServerResponse.ok().body(markdown2, String.class); // 실행 안됨

        return ServerResponse.ok().body(markdown1, String.class); // markdown1 map함수 실행 됨
    }
}
```

`Mono`와 `Flux`의 자세한 내용은 차차 정리해보도록 하겠습니다.

## 마치며

사용하기 전에 간단하게 찾아본 결과 충격적인 사실을 알았습니다.

`Functional 방식`으로 작성하면 `Spring MVC + Validation`로 편하게 사용하던 `@Valid`와 같은 기능을 사용할 수 없습니다.
(대신 `Validator`를 커스텀하여 사용할 수는 있음)

동기 방식에서 작동하던 `JPA`와 같은 기술도 사용할 수 없습니다.

대신 `비동기/논블럭` 전용으로 `R2DBC`라는 기술이 존재합니다.  
`Elasticsearch`같은 경우 `ReactiveElasticsearchRepository`를 상속 받아 구현할 수 있습니다.

`GlobalException`처리 방식도 다릅니다.

이런 차이들을 어떻게 해결하는지 차차 블로그를 만들면서 정리해보도록 하겠습니다.

## 참고 사이트

- [https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html)
- [https://pearlluck.tistory.com/726](https://pearlluck.tistory.com/726)
- [https://www.manty.co.kr/bbs/detail/develop?id=198&scroll=comment](https://www.manty.co.kr/bbs/detail/develop?id=198&scroll=comment)
