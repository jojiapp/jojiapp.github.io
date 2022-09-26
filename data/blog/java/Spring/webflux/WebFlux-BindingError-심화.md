---
title: Spring Webflux Binding Error 심화
date: '2022-09-24'
tags: ['Java', 'Spring', 'Spring Webflux', 'Exception', 'BindException', 'Binding Error']
draft: false
summary: Spring Webflux Binding Error 심화
---

# Spring Webflux Binding Error 심화

이전 시간에는 간단하게 `BindException`을 만드는 정도를 알아봤습니다.

이번 시간에는 어떻게 `application.yml`파일을 통해 에러 메세지를 관리하고
이러기 위해 어떤 설정들이 필요한지 하나하나 알아보겠습니다.

## FieldError

`BindException`을 만들려면 `BindingResult`가 필요하고
실질적으로 실패한 요소들의 정보는 `BindingResult`의 `List 타입`의 `ObjectError`에 담기게 됩니다.

여기서 저희는 각 필드가 어떤 유효성 체크에 실패했는지 알아야 하기 때문에
`ObjectError`를 상속받은 `FieldError`를 생성하여 `BindingResult`에 주입해 주어야 합니다.

저번 시간에는 아주 간단하게 실패한 요소의 `필드명`, `실패 메세지` 정도의 정보만을 사용하여 만들었습니다.

이번 시간에는 다른 생성자를 이용하여 `FieldError`를 생성하고 각 값들이 어떤 용도로 사용되는지 알아보겠습니다.

```java
public FieldError(String objectName, String field, @Nullable Object rejectedValue, boolean bindingFailure,
			@Nullable String[] codes, @Nullable Object[] arguments, @Nullable String defaultMessage) {

    super(objectName, codes, arguments, defaultMessage);
    Assert.notNull(field, "Field must not be null");
    this.field = field;
    this.rejectedValue = rejectedValue;
    this.bindingFailure = bindingFailure;
}
```

- `objectName`: 바인딩에 실패한 객체 명 (객체 명이므로 첫 글자가 소문자로 시작)
- `field`: 바인딩에 실패한 필드 명
- `rejectedValue`: 실패한 값
- `bindingFailure`: 바인딩 실패 여부
- `codes`: 이 코드를 사용하여 `application.yml`에 설정한 메세지의 값을 할당 (예정)
- `arguments`: 해당 값을 사용하여 `{0} ~ {1} 사이의 값만 사용 가능합니다.` 같은 문구의 변수 값을 할당
- `defaultMessage`: 위 `codes`에 해당 하는 값이 없을 때, 사용할 기본 메세지 값

### objectName 추출

`objectName`의 경우 유효성 체크를 할 객체의 클래스 정보를 통해 가져올 수 있습니다.

보통 클래스명에서 첫 글자만 소문자로 변경하여 사용하니, 그렇게 사용한다는 가정으로만 생각하였습니다.

```java
private <BODY> String getObjectName(BODY body) {

    return StringUtils.uncapitalize(
            body.getClass().getSimpleName()
    );
}
```

혹은 `ConstraintViolation<T>`에서 `getRootBeanClass()`를 통해 가져올수도 있습니다.

```java
private static <T> String getObjectName(final ConstraintViolation<T> violation) {

    return StringUtils.uncapitalize(
            violation.getRootBeanClass().getSimpleName()
    );
}
```

### fieldName 추출

`fieldName`의 경우 `validator.validate(body)`로 유효성을 체크하면
실패한 요소들이 `Set<ConstraintViolation<BODY>>` 타입으로 반환되는데 `ConstraintViolation<BODY>`의 `getPropertyPath()`로 추출 할 수 있습니다.

```java
private static <T> String getFieldName(final ConstraintViolation<T> violation) {

    return violation.getPropertyPath().toString();
}
```

### rejectedValue 추출

바인딩에 실패한 값은 `ConstraintViolation<BODY>`의 `getInvalidValue()`를 통해 추출할 수 있습니다.

```java
private static <T> String getRejectValue(final ConstraintViolation<T> violation) {

    return violation.getInvalidValue();
}
```

### codes 만들기

우선 `codes`를 만들기 전에 이 친구의 역할이 뭔지 부터 이해해야 합니다.

`codes`는 `message`를 설정 할 때 어떤 메세지를 우선순위로 적용할지 선택하는 기준이 됩니다.

예를 들어 `@NotBlank`를 사용한다면 `Spring MVC`에서는 `codes`를 아래와 같이 만들어 줍니다.

- `NotBlank.beanName.fieldName` -> 빈이름.필드명
- `NotBlank.fieldName` -> 필드 명
- `NotBlank.java.lang.String` -> 타입
- `NotBlank`

자세할수록 우선순위가 높으니 당연히 위 부터 적용됩니다.

그렇다면 `Spring MVC`가 자동으로 만들어 주는 것 말고 직접 만들기 위해선 `MessageCodesResolver` 인터페이스를 사용하면 됩니다.

구현체는 `org.springframework.validation 패키지`에 있는 `DefaultMessageCodesResolver`를 사용하면 됩니다.

```java
@Configuration
public class MessageCodesResolverConfig {

    @Bean
    public MessageCodesResolver messageCodesResolver() {

        return new DefaultMessageCodesResolver();
    }
}
```

`messageCodesResolver` 인터페이스의 `resolveMessageCodes` 메소드를 보면 두 가지가 있는데
Spring MVC에서 자동으로 해주는 것과 같이 4가지 유형을 다 얻기 위해 `errorCode`, `objectName`, `field`, `fieldType`를 받는 것으로 사용할 것입니다.

```java
public interface MessageCodesResolver {
    String[] resolveMessageCodes(String errorCode, String objectName);
    String[] resolveMessageCodes(String errorCode, String objectName, String field, @Nullable Class<?> fieldType);
}
```

#### errorCode 추출

`errorCode`는 유효성 체크에 사용한 어노테이션 입니다. (`@NotBlank`, `@Min`, `@Max` 등)

`ConstraintViolation<BODY>`에 보면 `getConstraintDescriptor()`를 출력해보면

```bash
ConstraintDescriptorImpl{annotation=j.v.c.NotBlank, payloads=[], hasComposingConstraints=true, isReportAsSingleInvalidConstraint=false, constraintLocationKind=FIELD, definedOn=DEFINED_LOCALLY, groups=[interface javax.validation.groups.Default], attributes={groups=[Ljava.lang.Class;@41c76f4f, message={javax.validation.constraints.NotBlank.message}, payload=[Ljava.lang.Class;@87fb9f6}, constraintType=GENERIC, valueUnwrapping=DEFAULT}
```

이런 정보를 포함하고 있습니다. (해당 값은 조금씩 다를 수 있음)

여기서 `annotation` 부분을 통해 `errorCode`를 추출할 수 있습니다.

```java
private static <T> String getErrorCode(final ConstraintViolation<T> violation) {

    return violation.getConstraintDescriptor()
            .getAnnotation()
            .annotationType()
            .getSimpleName();
}
```

> 하나의 필드에 어노테이션이 여러 개더라도 해당 개수만큼 유효성 체크를 하기 때문에 `Set<ConstraintViolation<BODY>>`는 어노테이션 개수 만큼 생성됩니다.

#### fieldType 추출

`fieldType`의 경우 위에서 추출한 `field`의 `getClass`를 사용하면 될거 같지만 `field`는 `Path`타입으로 `Warp`되어 있습니다.

그래서 저는 우회하여 바인딩 실패 값 (`c.getInvalidValue()`)의 `getClass`를 통해 추출하였습니다.

```java
private static <T> Class<?> getFieldType(final ConstraintViolation<T> violation) {

    return violation.getInvalidValue().getClass();
}
```

이렇게 모두 추출하여 `messageCodesResolver.resolveMessageCodes()`로 만들면 아래와 같이 `codes`가 만들어집니다

```bash
NotBlank.postCreate.markdown
NotBlank.markdown
NotBlank.java.lang.String
NotBlank
Size.postCreate.number
Size.number
Size.java.util.ArrayList
Size
```

### arguments 추출

`FieldError`에 들어가는 `arguments 인자`는 유효성 검사 메세지에서 사용 변수 값이라고 생각하시면 됩니다.

```application.properties
Min={0}이하는 사용할 수 없습니다.
```

```java
@Min(19)
private Integer age;
```

예를 들어 위와 같은 메세지를 작성했다고 하면 `{0}` 부분에 `19`라는 값을 넣기 위함입니다.

위에서 `getConstraintDescriptor()`로 출력한 값을 보면 attributes에 다른 요소들과 함께 `value` 혹은 `min`, `max` 같은 값이 있음을 알 수 있습니다.

```java
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public class PostCreate {

    @NotBlank
    private String markdown;

    @Size(min = 100, max = 1000)
    private List<Integer> number;
}
```

```bash
ConstraintDescriptorImpl{annotation=j.v.c.NotBlank, payloads=[], hasComposingConstraints=true, isReportAsSingleInvalidConstraint=false, constraintLocationKind=FIELD, definedOn=DEFINED_LOCALLY, groups=[interface javax.validation.groups.Default], attributes={groups=[Ljava.lang.Class;@41c76f4f, message={javax.validation.constraints.NotBlank.message}, payload=[Ljava.lang.Class;@87fb9f6}, constraintType=GENERIC, valueUnwrapping=DEFAULT}
ConstraintDescriptorImpl{annotation=j.v.c.Size, payloads=[], hasComposingConstraints=true, isReportAsSingleInvalidConstraint=false, constraintLocationKind=FIELD, definedOn=DEFINED_LOCALLY, groups=[interface javax.validation.groups.Default], attributes={groups=[Ljava.lang.Class;@15223e0b, min=5, message={javax.validation.constraints.Size.message}, payload=[Ljava.lang.Class;@6cbc6697, max=10}, constraintType=GENERIC, valueUnwrapping=DEFAULT}
```

문제는 `@NotBlank`처럼 값이 존재하지 않을 수도 있고, `@Min(10)`처럼 값이 하나 일수도 있고, `@Size(min=10, max=100)`처럼 두 개 이상일 수도 있다는 점입니다.

그렇기에 저는 `attributes`에서 공통된 요소(`groups`, `message`, `payload`)들을 제거하여 가져오는 식으로 이 문제를 해결하였습니다.

```java
private static final List<String> COMMON_ATTRIBUTES = List.of("groups", "message", "payload");

private static <T> Object[] getValidationArgs(final ConstraintViolation<T> violation) {

    return violation.getConstraintDescriptor()
            .getAttributes()
            .entrySet()
            .stream()
            .filter(entry -> isValidationArgs(entry.getKey()))
            .map(Map.Entry::getValue)
            .toArray();
}

private static boolean isValidationArgs(final String key) {

    return !COMMON_ATTRIBUTES.contains(key);
}
```

### ErrorMessage 생성 (messages.properties 적용)

```java
@Component
@RequiredArgsConstructor
public class BindingErrorMessageConverter {

    private final MessageSource messageSource;

    public String getMessage(final String[] codes,
                             final Object[] args,
                             final String defaultMessage) {

        return Arrays.stream(codes)
                .map(code -> createMessageOrNull(code, args))
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(defaultMessage);
    }

    private String createMessageOrNull(final String code,
                                       final Object[] args) {

        try {
            return messageSource.getMessage(
                    code,
                    args,
                    LocaleContextHolder.getLocale()
            );
        } catch (NoSuchMessageException e) {
            return null;
        }
    }
}
```

`Spring Boot`에서 `MessageSource`는 `spring.messages.basename`에 설정된 파일을 구현체로 등록 합니다.

기본값은 `messages`이므로 `messages.properties`로 파일을 만들어 사용하면 별도의 설정이 필요 없습니다.

위 `BindingErrorMessageConverter`는 `codes`를 반복하며 존재하면 해당 값을 에러 메세지를 반환하고 아니면 기본 값을 에러 메세지로 반환하는 로직입니다.

여기서 `fieldError.getArguments()`를 넘겨 `{0}`처럼 설정된 메세지에 값을 세팅하기도 합니다.

> 만약 인코딩이 되지 않는다면 `인텔리제이 설정`에서 `File Encodings`에서 하단의 `Properties Files` 부분을 `UTF-8`로 변경하시면 됩니다.

### FieldError 생성

위의 로직들을 활용하여 `FieldError`를 생성하는 별도의 클래스를 만들었습니다.

전체 로직은 아래와 같습니다.

- `MessageCodesResolverConfig`

```java
@Configuration
public class MessageCodesResolverConfig {

    @Bean
    public MessageCodesResolver messageCodesResolver() {

        return new DefaultMessageCodesResolver();
    }
}
```

- `FieldErrorCreator`

```java
@Component
@RequiredArgsConstructor
public class FieldErrorCreator {

    private static final List<String> COMMON_ATTRIBUTES = List.of("groups", "message", "payload");
    private final MessageCodesResolver messageCodesResolver;
    private final BindingErrorMessageConverter bindingErrorMessageConverter;

    public <T> FieldError create(final ConstraintViolation<T> violation) {

        final String[] codes = getCodes(violation);
        final Object[] args = getValidationArgs(violation);

        return new FieldError(
                getObjectName(violation),
                getFieldName(violation),
                violation.getInvalidValue(),
                true,
                codes,
                args,
                bindingErrorMessageConverter.getMessage(codes, args, violation.getMessage())
        );
    }

    private static <T> Object[] getValidationArgs(final ConstraintViolation<T> violation) {

        return violation.getConstraintDescriptor()
                .getAttributes()
                .entrySet()
                .stream()
                .filter(entry -> isValidationArgs(entry.getKey()))
                .map(Map.Entry::getValue)
                .toArray();
    }

    private static boolean isValidationArgs(final String key) {

        return !COMMON_ATTRIBUTES.contains(key);
    }

    private <T> String[] getCodes(final ConstraintViolation<T> violation) {

        return messageCodesResolver.resolveMessageCodes(
                getErrorCode(violation),
                getObjectName(violation),
                getFieldName(violation),
                getFieldType(violation)
        );
    }

    private static <T> String getErrorCode(final ConstraintViolation<T> violation) {

        return violation.getConstraintDescriptor()
                .getAnnotation()
                .annotationType()
                .getSimpleName();
    }

    public static <T> String getObjectName(final ConstraintViolation<T> violation) {

        return StringUtils.uncapitalize(
                violation.getRootBeanClass().getSimpleName()
        );
    }

    private static <T> String getFieldName(final ConstraintViolation<T> violation) {

        return violation.getPropertyPath().toString();
    }

    private static <T> Class<?> getFieldType(final ConstraintViolation<T> violation) {

        return violation.getInvalidValue().getClass();
    }

}
```

## BindingResult

`FieldError`를 만들었으니 이제 `BindingResult`를 만들어 보겠습니다.

`BindingResult`는 바인딩에 실패한 객체와 객체 타입, 그리고 유효성 체크에 실패하여 만들어진 `FieldError`들을 가지고 만들 수 있습니다.

- `BindingResultCreator`

```java
@Component
@RequiredArgsConstructor
public class BindingResultCreator {

    private static final String EMPTY_ERROR_MESSAGE = "유효성에 실패한 요소가 없습니다.";
    private final FieldErrorCreator fieldErrorCreator;

    public <T> BindingResult create(final Set<ConstraintViolation<T>> violations) {

        if (violations.isEmpty()) {
            throw new IllegalArgumentException(EMPTY_ERROR_MESSAGE);
        }

        final BindingResult bindingResult = getBindingResult(violations);
        addFieldErrors(bindingResult, violations);

        return bindingResult;
    }

    private <T> void addFieldErrors(final BindingResult bindingResult,
                                    final Set<ConstraintViolation<T>> violations) {

        violations.forEach(violation ->
                bindingResult.addError(fieldErrorCreator.create(violation))
        );
    }

    private static <T> BindingResult getBindingResult(final Set<ConstraintViolation<T>> violations) {

        return violations.stream()
                .map(BindingResultCreator::createDefaultBindingResult)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(EMPTY_ERROR_MESSAGE));
    }

    private static <T> BeanPropertyBindingResult createDefaultBindingResult(final ConstraintViolation<T> violation) {

        return new BeanPropertyBindingResult(
                violation.getRootBean(),
                FieldErrorCreator.getObjectName(violation)
        );
    }
}
```

## Validator

이제 다시 `Validator`로 돌아와 방금 만든 `BindingResult`를 이용하여 `BindException`을 생성하여 줍니다.

- `WebfluxValidator`

```java
@Component
@RequiredArgsConstructor
public class WebfluxValidator {

    private final Validator validator;
    private final BindingResultCreator bindingResultCreator;

    public <BODY> Mono<BODY> body(final Mono<BODY> bodyMono) {

        return bodyMono.flatMap(body -> {

                    final Set<ConstraintViolation<BODY>> violations = validator.validate(body);

                    if (violations.isEmpty()) {
                        return Mono.just(body);
                    }

                    return Mono.error(
                            new BindException(bindingResultCreator.create(violations))
                    );
                }
        );
    }
}
```

> `Request` 외에도 사용을 할수는 있을 것 같아(거의 안하겠지만)  
> 이전의 `RequestValidator`에서 `WebfluxValidator`로 이름을 변경하였습니다.

## GlobalAttributes

- `BaseResponse`

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

- `GlobalErrorAttributes`

```java
@Component
@RequiredArgsConstructor
public class GlobalErrorAttributes extends DefaultErrorAttributes {

    private static final String BINDING_ERROR_MESSAGE_SEP = ", ";
    private final ObjectMapper objectMapper;
    @Override
    public Map<String, Object> getErrorAttributes(final ServerRequest request,
                                                  final ErrorAttributeOptions options) {

        final Throwable error = getError(request);

        if(error instanceof IllegalStateException e) {
            return getResponse(BAD_REQUEST, e.getMessage());
        }

        if(error instanceof BindException e) {
            return getResponse(BAD_REQUEST, getBindingErrorMessage(e.getFieldErrors()));
        }

        return getResponse(INTERNAL_SERVER_ERROR, error.getMessage());
    }

    private String getBindingErrorMessage(final List<FieldError> fieldErrors) {

        return fieldErrors
                .stream()
                .map(this::getBindingErrorMessage)
                .collect(joining(BINDING_ERROR_MESSAGE_SEP));
    }

    private String getBindingErrorMessage(final FieldError fieldError) {

        return "%s: %s".formatted(
                fieldError.getField(),
                fieldError.getDefaultMessage()
        );
    }

    private Map<String, Object> getResponse(final HttpStatus httpStatus,
                                            final String message) {

        final BaseResponse<Object> response = BaseResponse.builder()
                .status(String.valueOf(httpStatus.value()))
                .message(message)
                .build();

        return objectMapper.convertValue(response, new TypeReference<>() {});
    }
}
```

`error`가 `BindException`라면 `BindingErrorMessageConverter`를 이용하여 메세지를 변환시켜
`response`를 만들어 반환합니다.

> 프로젝트의 `공통 Response`에 따라 조금씩 다르게 작성하면 됩니다.

## GlobalExceptionHandler

- `GlobalExceptionHandler`

```java
@Slf4j
@Component
public class GlobalExceptionHandler extends AbstractErrorWebExceptionHandler {

    public GlobalExceptionHandler(final ErrorAttributes errorAttributes,
                                  final WebProperties.Resources resources,
                                  final ApplicationContext applicationContext,
                                  final ServerCodecConfigurer serverCodecConfigurer) {

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

        return ServerResponse.status(getStatus(errorProperties))
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(errorProperties));
    }

    private static int getStatus(final Map<String, Object> errorProperties) {

        return Integer.parseInt(errorProperties.get("status").toString());
    }
}
```

`GlobalExceptionHandler`는 `GlobalErrorAttributes`에서 반환한
`response` 값을 받아 클라이언트 단으로 응답을 내려줍니다.

빈 값으로 테스트를 해보면 아래와 같이 잘 나오는 것을 확인할 수 있습니다.

```json
{
  "status": "400",
  "message": "markdown: 빈값 X",
  "data": null
}
```

## QueryParams 유효성 체크

지금까지 위의 내용은 `Mono<Body>`타입에 대해서 유효성 체크를 하였습니다.

추가로 일반 `QueryParams`를 유효성 체크를 하는 방법에 대해 알아보겠습니다.

위의 내용을 이해하였다면 `bodyMono.flatMap` 제외하면 되는 것을 알 수 있습니다.

맞습니다. 하지만 `BindException`이 `CheckedException`이기 때문에 호출 하는 곳에서
매번 예외를 잡아주어야 하기 때문에 효율적이지 못합니다.

- `BindingException`

```java
@AllArgsConstructor
public class BindingException extends RuntimeException{

    private final BindingResult bindingResult;

    public List<FieldError> getFieldErrors() {

        return bindingResult.getFieldErrors();
    }
}
```

그래서 저는 `UncheckedException`용 `BindingException`을 별도로 하나 만들어 주었습니다.

- `WebfluxValidator`

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

    public <T> T valid(final MultiValueMap<String, String> queryParams, Class<T> classType) {

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

`BindException`을 사용하던 부분을 방금 만든 `BindingException`을 사용하도록 변경하여 줍니다.

추가로 `WebfluxValidator`에서 `QueryParams`를 지원하도록 메소드를 추가하였습니다.

하는 역할이 중복 되기 때문에 별도의 검증 메소드를 별도로 추출하였습니다.

> `QueryParams`는 `MultiValueMap`타입 이기 때문에 `DTO`로 변환하는 작업이 필요합니다.
>
> 저는 `MultiValueMapToObjectConverterResolver`를 만들어 `QueryParams`를 `DTO`로 변환하도록 하였습니다.
>
> `MultiValueMapToObjectConverterResolver`를 이용하여 `QueryParams`를 `DTO`로 변한하는 과정에 대해서는 별도로 포스팅 하겠습니다.

- `GlobalErrorAttributes`

```java
@Component
@RequiredArgsConstructor
public class GlobalErrorAttributes extends DefaultErrorAttributes {

    private static final String BINDING_ERROR_MESSAGE_SEP = ", ";
    private final ObjectMapper objectMapper;

    @Override
    public Map<String, Object> getErrorAttributes(final ServerRequest request,
                                                  final ErrorAttributeOptions options) {

        final Throwable error = getError(request);

        if(error instanceof BindingException e) {
            return getResponse(BAD_REQUEST, getBindingErrorMessage(e.getFieldErrors()));
        }

        return getResponse(INTERNAL_SERVER_ERROR, error.getMessage());
    }

    private String getBindingErrorMessage(final List<FieldError> fieldErrors) {

        return fieldErrors
                .stream()
                .map(this::getBindingErrorMessage)
                .collect(joining(BINDING_ERROR_MESSAGE_SEP));
    }

    private String getBindingErrorMessage(final FieldError fieldError) {

        return "%s: %s".formatted(
                fieldError.getField(),
                fieldError.getDefaultMessage()
        );
    }

    private Map<String, Object> getResponse(final HttpStatus httpStatus,
                                            final String message) {

        final BaseResponse<Object> response = BaseResponse.builder()
                .status(String.valueOf(httpStatus.value()))
                .message(message)
                .build();

        return objectMapper.convertValue(response, new TypeReference<>() {});
    }
}
```

`GlobalErrorAttributes`에서 기존의 `BindException`부분을 `BindingException`을 잡도록 변경하여 줍니다.

## 마치며

`Spring MVC`에서 `@Valid`만 사용하면 유효성 체크를 다 해줬었는데
이번에 직접 만들어 보면서 얼마나 많은 것을 자동으로 해주고 있었는지 알게 된거 같아 좋았습니다.

만약 `@Valid`로 인한 문제가 생겨도 이제는 직접 해결할 수 있을 거 같은 기분이 듭니다.

다음 포스팅에서는 `QueryParams`를 `DTO`로 변환하는 과정을 작성해 보겠습니다.

## 참고 사이트

- [[인프런] 스프링 MVC 2편 - 백엔드 웹 개발 활용 기술 - 김영한](https://www.inflearn.com/course/스프링-mvc-2)
