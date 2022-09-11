---
title: Spring Webflux Functional 기반일 때 Validation 체크
date: '2022-09-11'
tags: ['Java', 'Spring', 'Spring Webflux', 'Validation']
draft: false
summary: Spring Webflux Functional 기반일 때 Validation 체크
---

# Spring Webflux Functional 기반일 때 Validation 체크

`Webflux`에서 `Functional`기반으로 작성을 하면 `Spring MVC`에서 흔히 사용하던 `@Valid`를 이용한
유효성 검사를 할 수 없습니다.

물론 어노테이션 기반으로 작성하면 할 수 있지만, 이전에 알아봤듯 `Netty 서버`를 이용할려면 `Functional`기반으로 작성해야 하기에
비슷하게나마 할 수 있는 방법에 대해 찾아보았습니다.

공식문서를 보면 차례대로 `Validation`하는 방법에 대해 알려주고 있지만,
결론적으로 `Validation` 체크를 할 클래스마다 그에 해당하는 `Validation Class`를 생성해야 하는 방식이기에 마음에 들지 않았습니다.

`Spring MVC`에서 처럼 간단하게 `@Valid`정도만 사용해서 할 수 없을까? 하여 찾아본 결과

커스텀 어노테이션을 만들어 `ArgumentResolverConfigurer`에 주입하는 방법이 있어 해보았지만 어노테이션 방식에서만 가능한 것이였습니다.
(사실 당연하게도 `functional 방식`에선 `handler`를 `직접 호출`하기에 중간에 끼어들 틈이 없습니다.)

여러가지를 시도해보던 중 `@Valid`만큼 간단하진 않지만 그래도 하나로 통일하여 만들수 있는 방법을 찾았습니다.

지금부터 그 방법을 적용하며 개선했던 과정에 대해 작성해보도록 하겠습니다.

> 여기서 `Validation`은 `spring-boot-starter-validation`를 사용하고 있기 때문에 `gradle`를 통해 다운받아 주셔야 합니다.
>
> ```gradle
> implementation 'org.springframework.boot:spring-boot-starter-validation'
> ```

## Validation 처리할 공통 메소드 만들기

```java
@Component
@RequiredArgsConstructor
public class RequestHandler {

    private final Validator validator;

    public <BODY> Mono<ServerResponse> requireValidBody(
            Function<Mono<BODY>, Mono<ServerResponse>> block,
            ServerRequest request, Class<BODY> bodyClass) {

        return request
                .bodyToMono(bodyClass)
                .flatMap(
                        body -> validator.validate(body).isEmpty()
                                ? block.apply(Mono.just(body))
                                : ServerResponse.unprocessableEntity().build()
                );
    }
}
```

- `block`: 유효성 검사가 성공하면 실행될 블럭
- `request`: 요청 정보
- `bodyClass`: `request.bodyToMono`를 이용해 객체화 할 클래스

로직을 보면 `validator.validate`를 통해 유효성을 체크하여 값이 존재하지 않으면(유효성 체크 통과) 넘어온 로직을 실행하고
그렇지 않으면 예외를 반환합니다.

### 사용방법

```java
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public class PostCreate {

    @NotBlank
    private String markdown;
}
```

```java
@Component
@RequiredArgsConstructor
public class PostHandler {

    private final ValidationHandler validationHandler;

    public Mono<ServerResponse> createPost(final ServerRequest request) {
        return validationHandler.requireValidBody(postCreateMono -> {
            Mono<Map<String, String>> markdown = postCreateMono.map(postCreate -> Map.of("markdown", postCreate.getMarkdown()));
            return ServerResponse.ok().body(markdown, Map.class);
        }, request, PostCreate.class);
    }
}
```

라우터를 만들어 사용해보면 유효성 체크 및 로직 실행이 모두 정상적으로 되는것을 확인할 수 있습니다.

### 조금 더 개선

위의 로직을 예시로 생각해보면 `Mono<PostCreate>`만 있으면 되는데, `ServerRequest`와 `PostCreate` 모두 파라미터로 넘겨주는 것이
좋지 않다고 생각했습니다. (인수는 적을수록 좋으니까요.)

그래서 `Mono<PostCreate>`만 넘겨주도록 조금 수정해보았습니다.

```java
public <BODY> Mono<ServerResponse> requireValidBody(
        Function<Mono<BODY>, Mono<ServerResponse>> block,
        Mono<BODY> bodyMono) {

    return bodyMono
            .flatMap(
                    body -> validator.validate(body).isEmpty()
                            ? block.apply(Mono.just(body))
                            : ServerResponse.unprocessableEntity().build()
            );
}
```

```java
public Mono<ServerResponse> createPost(final ServerRequest request) {
    return validationHandler.requireValidBody(postCreateMono -> {
        Mono<Map<String, String>> markdown = postCreateMono.map(postCreate -> Map.of("markdown", postCreate.getMarkdown()));
        return ServerResponse.ok().body(markdown, Map.class);
    }, request.bodyToMono(PostCreate.class));
}
```

잘 작동하는 것을 확인할 수 있었습니다.

## 기본적으로 한 뎁스를 들어간채로 사용하는 방법이 옳을까?

위의 로직을 살펴보면 `validationHandler.requireValidBody`를 기본적으로 깔고 사용하기 때문에
한 뎁스를 들어가게 됩니다.

모든 유효성 검사가 필요한 곳에 이렇게 작성을 해야한다는 것은 너무 비효율적이라고 생각했습니다.

그렇다면 조금 더 분리할 수 없을까? 하여 조금 더 개선을 해보았습니다.

```java
@Component
@RequiredArgsConstructor
public class ValidationHandler {

    private final Validator validator;

    public <BODY> Mono<BODY> requireValidBody(final Mono<BODY> bodyMono) {
        return bodyMono.flatMap(
                body -> {
                    if(!validator.validate(body).isEmpty()) {
                        return Mono.error(new IllegalStateException("바디 유효성 실패"));
                    }
                    return Mono.just(body);
                }
        );
    }
}
```

아까처럼 실행에는 관여하지 않고 전달 받은 객체의 유효성만을 체크하고 그대로 반환하도록 수정하였습니다.

> `error`의 경우 어떤 값들이 잘못 되었는지에 대해 조금 더 손을 봐야 합니다.

```java
@Component
@RequiredArgsConstructor
public class PostHandler {

    private final ValidationHandler validationHandler;

    public Mono<ServerResponse> createPost(final ServerRequest request) {
        Mono<PostCreate> postCreateMono = validationHandler.requireValidBody(request.bodyToMono(PostCreate.class));
        final Mono<Map<String, String>> markdown = postCreateMono.map(postCreate -> Map.of("markdown", postCreate.getMarkdown()));
        return ServerResponse.ok().body(markdown, Map.class);
    }
}
```

이제 한뎁스를 들이지 않고도 사용할 수 있습니다.

## 모든 Handler가 ServerRequest를 받아 처리하는 것이 맞을까?

`어노테이션 방식`으로 사용하던 때를 보면 `@ModelAttribute`와 `@RequestBody`등을 통해 요청 정보를 객체에 바로 주입 받아 사용합니다.

그런데 `Functional 방식`의 예제를 보면 전부 `Handler`에 `ServerRequest`를 주입하여 사용합니다.(특별한 이유가 있는지는 모르겠습니다.)

그래서 저는 `Handler = Controller`라고 생각(엄밀히 따지면 `Router + Handler = Controller` 이지만)하고 `Handler`는 필요한 정보만 받도록 하는 것이 좋을것 같다고 생각하였습니다.

`Spring MVC`의 `Controller`에 전달되기 전에 값을 객체에 맞게 변환하는 작업 등을 해주므로 저도 `유효성 체크`는 `Router`가 하도록 변경하였습니다.

> 이렇게 `Handler`가 `ServerRequest`가 아닌 `여러 파라미터`를 받게 된다면 처음에 나왔었던 방식으로 유효성을 체크할 수 없습니다.

### AbstractRouter

`모든 라우터`에서 사용할 기능이므로 `AbstractRouter`를 만들어 상속받도록 하였습니다.

```java
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class AbstractRouter {

    private final ValidationHandler validationHandler;

    protected <T> Mono<T> validationBody(ServerRequest request, Class<T> bodyType) {
        return validationHandler.requireValidBody(
                request.bodyToMono(bodyType)
        );
    }
}
```

### PostRouter

```java
@Configuration
public class PostRouter extends AbstractRouter {

    protected PostRouter(final ValidationHandler validationHandler) {
        super(validationHandler);
    }

    @Bean
    protected RouterFunction<ServerResponse> routerExample(final PostHandler postHandler) {
        return RouterFunctions.route()
                .POST("/posts", request ->
                        postHandler.createPost(validationBody(request, PostCreate.class))
                )
                .build();
    }

}
```

### PostHandler

```java
@Component
@RequiredArgsConstructor
public class PostHandler {
    public Mono<ServerResponse> createPost(final Mono<PostCreate> postCreateMono) {
        final Mono<Map<String, String>> markdown = postCreateMono.map(postCreate -> Map.of("markdown", postCreate.getMarkdown()));
        return ServerResponse.ok().body(markdown, Map.class);
    }
}
```

## 마치며

처음에 적용했던 로직보다는 훨씬 코드가 깔끔해졌다고 생각합니다.

여기서 `Router`가 유효성 체크까지 담당하는 부분이 조금 마음에 걸리기는 합니다.

`@Valid`처럼 사용하고 싶어 `AOP`도 적용해보고(제네릭타입을 핸들링 하기가 어려웠음) `ArgumentResolverConfigurer`에 등록도 해보고
정말 많은 시도를 하면서 공부가 많이 되었습니다. (다 실패 했지만..)

현재는 `Body`에 대해서만 유효성 체크가 가능한 상태입니다.

`Parameters`는 `MultiValueMap`형식이라 객체로 컨버젼 하는 과정 부터 생각이 많이 필요할 것 같습니다.

컨버젼만 성공한다면 유효성 체크는 간단할 것 같습니다.

다 하고 보니 `ValidationHandler`도 이제 `Handler`의 역할이 아니므로 이름을 변경해야 할 것 같습니다.

다음에는 `GlobalExceptionHandler`를 만드는 방법에 대해 작성해 보도록 하겠습니다.

## 참고 사이트

- [https://www.baeldung.com/spring-functional-endpoints-validation](https://www.baeldung.com/spring-functional-endpoints-validation)
- [https://jeroenbellen.com/validating-springs-functional-endpoints/](https://jeroenbellen.com/validating-springs-functional-endpoints/)
