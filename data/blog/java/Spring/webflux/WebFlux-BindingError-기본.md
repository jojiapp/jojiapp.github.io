---
title: Spring Webflux Binding Error 기본 처리
date: '2022-09-14'
tags: ['Java', 'Spring', 'Spring Webflux', 'Exception', 'BindException', 'Binding Error']
draft: false
summary: Spring Webflux Binding Error 기본 처리
---

# Spring Webflux Binding Error 기본 처리

앞서 요청에 대한 `유효성 체크`와 `GlobalException` 처리를 했습니다.

이번에는 `BindingError`를 어떻게 처리할 수 있는지 알아보겠습니다.

`Spring MVC`에서는 아주 편리했습니다.

바인딩 파라미터 다음에 `BindingResult` 타입으로 받으면 어떤 값이 실패했는지 모두 들어 있었습니다.

또한, 위 처럼 받지 않고 `GlobalExceptionHandler`에 `BindException`으로 처리하면
해당 에러 객체에 `BindingResult`가 존재해서 처리 할 수 있었습니다.

하지만 `Webflux`에서는 저희가 직접 유효성 체크를 했기 때문에 위와 같은 이점을 얻을 수 없습니다.

그래서 그냥 직접 만들기로 했습니다.

## BindingResult 만들기

저번시간에 만들었던 `ValidationHandler`를 `RequestValidator`로 변경하였습니다.

```java
@Component
@RequiredArgsConstructor
public class RequestValidator {

    private final Validator validator;

    public <BODY> Mono<BODY> body(final Mono<BODY> bodyMono) {
        return bodyMono.flatMap(
                body -> {
                    Set<ConstraintViolation<BODY>> validate = validator.validate(body);
                    if (validate.isEmpty()) {
                        return Mono.just(body);
                    }

                    final String objectName = getObjectName(body);
                    final BindingResult bindingResult = new BeanPropertyBindingResult(body, objectName);

                    validate.forEach(c -> bindingResult.addError(
                            new FieldError(objectName, c.getPropertyPath().toString(), c.getMessage())
                    ));

                    return Mono.error(new BindException(bindingResult));
                }
        );
    }

    private <BODY> String getObjectName(BODY body) {
        final String objectFullName = body.getClass().getName();
        return StringUtils.uncapitalize(
                objectFullName.substring(objectFullName.lastIndexOf(".") + 1)
        );
    }

}
```

- `BindingResult`를 상속받은 `BeanPropertyBindingResult`로 기본적인 생성을 해줍니다.
  - `objectName`은 첫글자가 소문자로 시작해야 하기 떄문에 클래스 이름을 가지고 변경 해주었습니다.
- 이후 에러가 난 필드들에 대해 각각 추가해줍니다.
- `BindingException`을 만들어 던져줍니다.

`Spring MVC`에서 `BindingResult`를 직접 다뤄보셨다면 크게 어려운 부분은 아니라고 생각합니다.

## GlobalErrorAttributes 처리

`GlobalExceptionHandler`에서 실질적으로 사용될 값은 `GlobalErrorAttributes`에서 던져주므로 해당 클래스를 수정합니다.

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
        if(error instanceof BindException) {
            final String message = ((BindException) error).getFieldErrors()
                    .stream()
                    .map(GlobalErrorAttributes::getBindingErrorMessage)
                    .collect(Collectors.joining(", "));
            return getResponse(message, BAD_REQUEST);
        }
        return getResponse(error.getMessage(), INTERNAL_SERVER_ERROR);
    }

    private static String getBindingErrorMessage(final FieldError fieldError) {
        return "%s: %s".formatted(
                fieldError.getField(),
                fieldError.getDefaultMessage()
        );
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

- `BindException`인 경우 모두 순회하여 에러 메세지를 만들어줍니다.
- `필드명: 에러메세지` 형식으로 만들었고 `, `를 기준으로 나눴습니다. 이부분은 편한대로 사용하면 될 것 같습니다.

## 마치며

`Spring MVC`에서는 `application.properties`에 메세지를 정의하면 자동으로 `BindingResult`가 만들어질 때 적용됐었습니다.

하지만 저희는 직접 `BindingResult`를 생성했기 때문에 해당 과정 또한 저희가 직접 만들어 주어야 합니다.

다음 포스터에서는 `Spring MVC`와 동일하게 동작하도록 만들어 보겠습니다.
