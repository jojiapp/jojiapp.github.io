---
title: Binding Error Properties Message 적용
date: '2022-05-16'
tags: ['Java', 'Spring', 'Error']
draft: false
summary: Binding Error Properties Message 적용
---

# Binding Error Properties Message 적용

`Spring Boot`에서 `Binding Error`가 발생하면 `BindingResult`의 `FieldErrors`에 바인딩에 실패한 필드에 대한 정보가 담겨져있습니다.

이때, 설정 파일(`.properties,` `.yml`)에서 `spring.messages`로 지정된 설정 파일 중에 `error code`가 동일 하면 해당 값을 `error message`로 담아 줍니다.

그런데, `JSON`으로 파라미터로 받게 되면 `BindingException`에 `BindingResult`가 설정 파일에 넣은 값으로 되지 않았습니다.

그래서 직접 설정 파일과 일치하는 값을 넣을 수 있도록 만들어 보았습니다.

## message 우선 순위

### `@NotBlank`

- `NotBlank.beanName.fieldName` -> 빈이름.필드명
- `NotBlank.fieldName` -> 필드 명
- `NotBlank.java.lang.String` -> 타입
- `NotBlank`

## build.gradle

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

## 설정 파일

### application.yml

```yaml
spring:
  messages:
    basename: validation-errors
```

### validation-errors.properties

```properties
NotBlank=반드시 값이 존재해야 합니다.
```

이처럼 설정하면 `Spring Boot`가 `validation-errors.properties`파일을 읽어 자동으로 `MessageSource`를 생성합니다.

## Binding Error 메세지 직접 주입

### ExceptionHandler

`Binding Error`가 발생하면 처리할 `ExceptionHandler`를 만들어 줍니다.

```java

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

	private final BindingErrorConverter bindingErrorConverter;

	@ExceptionHandler(BindException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	private ApiResponse<Object> methodArgumentNotValidException(BindException exception) {
		log.error("error: {}", exception.getMessage(), exception);
		return ApiResponse.bindingErrors(
				exception.getFieldErrors().stream()
						.map(bindingErrorConverter::getBindingError)
						.toList()
		);
	}
}
```

### BindingErrorConverter

```java

@Component
@RequiredArgsConstructor
public class BindingErrorConverter {

	private final MessageSource messageSource;

	public BindingErrorResponse getBindingError(FieldError fieldError) {
		return Arrays.stream(Objects.requireNonNull(fieldError.getCodes()))
				.map(code -> createBindErrorOrNull(fieldError, code))
				.filter(Objects::nonNull) // null은 삭제합니다.
				.findFirst() // 찾은 첫 번째 요소 반환
				.orElse(BindingErrorResponse.of(fieldError, null));
	}

	// 해당 FieldError과 일치하는 메세지를 가져와 BindingErrorResponse를 생성하여 return 합니다.
	private BindingErrorResponse createBindErrorOrNull(FieldError fieldError, String code) {
		try {
			val errorMessage = messageSource.getMessage(
					code,
					fieldError.getArguments(),
					LocaleContextHolder.getLocale()
			);
			return BindingErrorResponse.of(fieldError, errorMessage);
		} catch (NoSuchMessageException e) {
			return null;
		}
	}

}
```

### BindingErrorResponse

```java
public record BindingErrorResponse(
		String field,
		String message
) {

	public static BindingErrorResponse of(FieldError fieldError, String message) {
		return new BindingErrorResponse(
				fieldError.getField(),
				message == null ? fieldError.getDefaultMessage() : message
		);
	}
}
```

### ApiResponse

```java
public record ApiResponse<T>(
		T body,
		String message,
		List<BindingErrorResponse> bindingErrors
) {
	public static <T> ApiResponse<T> bindingErrors(List<BindingErrorResponse> bindingErrors) {
		return new ApiResponse<>(null, "값이 올바르지 않습니다.", bindingErrors);
	}
}
```

이제 정상적으로 `validation-errors.properties`에 설정된 메세지가 적용되는 것을 확인할 수 있습니다.
