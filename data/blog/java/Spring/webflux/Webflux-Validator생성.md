---
title: Spring Webflux Validator 생성
date: '2022-10-05'
tags: ['Java', 'Spring', 'Spring Webflux', 'Validation', 'Validator']
draft: false
summary: Spring Webflux Validator 생성
---

# Spring Webflux Validator 생성

`Spring Boot`를 이용하여 `Validation` 라이브러리를 받아 사용하면

생성되어 있는 `Validator`를 자동으로 주입해줍니다.

저는 이번에 `Spring Webflux`를 만들어보면서 `FieldError`를 생성하는
`FieldErrorCreator`라는 클래스를 만들었습니다.

해당 클래스가 `FieldError`를 잘 생성하는지 테스트 코드를 작성하려고 하니
`Validator`가 필요했는데, 단위 테스트라 `Bean`으로 주입 받을수는 없었습니다.

그래서 찾아보던 중 `Validator`를 직접 생성하는 방법을 찾아서 기록해두고자 합니다.

## Validator 직접 생성

```java
private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
```

## FieldErrorCreator

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

## FieldErrorCreatorTest

```java

@AllArgsConstructor
public class ValidationDTO {

    @NotBlank
    private final String name;

    @Min(0)
    private final int age;
}
```

```java

@TestEnv
class FieldErrorCreatorTest {

    private final BindingErrorMessageConverter bindingErrorMessageConverter =
            new BindingErrorMessageConverter(MessageSourceCreator.messageSource());

    private final MessageCodesResolver messageCodesResolver = new DefaultMessageCodesResolver();

    private final FieldErrorCreator fieldErrorCreator = new FieldErrorCreator(
            messageCodesResolver,
            bindingErrorMessageConverter
    );

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();


    @Test
    void 정상적으로_fieldError를_생성한다() throws Exception {
        // Given
        final String EMPTY = "   ";
        final int AGE = -1;

        final ValidationDTO validationDTO = new ValidationDTO(EMPTY, AGE);

        final Set<ConstraintViolation<ValidationDTO>> violations = validator.validate(validationDTO);

        // When
        final List<FieldError> fieldErrors = violations.stream()
                .map(fieldErrorCreator::create)
                .toList();

        // Then
        final FieldError ageError = fieldErrors.get(0);
        assertThat(ageError.getObjectName()).isEqualTo("validationDTO");
        assertThat(ageError.getField()).isEqualTo("age");
        assertThat(ageError.getRejectedValue()).isEqualTo(AGE);
        assertThat(ageError.getDefaultMessage()).isEqualTo("0 이상만 허용 됩니다.");

        final FieldError nameError = fieldErrors.get(1);
        assertThat(nameError.getObjectName()).isEqualTo("validationDTO");
        assertThat(nameError.getField()).isEqualTo("name");
        assertThat(nameError.getRejectedValue()).isEqualTo(EMPTY);
        assertThat(nameError.getDefaultMessage()).isEqualTo("빈값은 안됩니다.");
    }

    @Test
    void objectName을_추출한다() throws Exception {
        final String EMPTY = "   ";

        final ValidationDTO validationDTO = new ValidationDTO(EMPTY, 100);

        final List<ConstraintViolation<ValidationDTO>> constraintViolations = validator.validate(validationDTO)
                .stream()
                .toList();

        // When
        final String objectName = FieldErrorCreator.getObjectName(constraintViolations.get(0));

        // Then
        assertThat(objectName).isEqualTo("validationDTO");
    }

}
```

## 마치며

`ConstraintViolation`객체를 직접 생성해도 되지만 그건 너무 비효율적인 것 같아 `Validator`를 생성하도록 하였습니다.

`validator.validate()`의 반환 타입이 `Set`이라 테스트를 위해 `List`로 변환하였는데 만족스럽지는 않아
조금 더 테스트 방법에 대해 생각이 필요할 것 같습니다.
