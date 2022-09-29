---
title: Spring Webflux에서 MessageSource 테스트
date: '2022-09-29'
tags: ['Java', 'Spring', 'Spring Webflux', 'BindingError', 'Test', 'MessageSource']
draft: false
summary: Spring Webflux에서 MessageSource 테스트
---

# Spring Webflux에서 MessageSource 테스트

이번에는 앞서 만든 `BindErrorMessageConverter`를 테스트를 해볼 생각입니다.

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

    private String createMessageOrNull(final String code, final Object[] args) {

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

그런데 여기 보면 `MessageSource`를 주입받아 사용하고 있는데, 이는 `Spring Boot`에서 자동으로 생성해준 빈이 주입되게 됩니다.

`BindingErrorConverter` 단위 테스트를 하는데 통합테스트를 실행 시키는 것은 비효율적이라 생각이 들었습니다.

그래서 `MessageSource`직접 만들어 주기로 하였습니다.

```properties
NotBlank=빈값은 안됩니다.
Min={0} 이상만 허용 됩니다.
Min.numberDTO.number=NumberDTO의 number는 {0} 이상만 허용합니다.
```

## MessageSource 단위 테스트

우선 그 전에 통합테스트를 통해 `MessageSource`에 잘 주입되는지 부터 확인해 보겠습니다.

```java

@SpringBootTest
public class MessageSourceTest {

    @Autowired
    private MessageSource messageSource;

    @Test
    void messageProperties의_값을_정상적으로_읽어온다() {
        final String message = messageSource.getMessage(
                "NotBlank",
                null,
                "빈값은 안돼요",
                Locale.getDefault()
        );

        Assertions.assertThat(message).isEqualTo("빈값은 안됩니다.");
    }

}
```

정상적으로 테스트가 통과합니다.

## MessageSource 직접 만들기

```java
public class MessageSourceCreator {

    public static MessageSource messageSource() {
        final ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasenames("classpath:/messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setFallbackToSystemLocale(false);
        return messageSource;
    }
}
```

위 처럼 경로를 설정하면 `messages.properties`에 있는 값으로 `MessageSource`를 만들어 줍니다.

## BindingErrorMessageConverter 테스트 하기

```java
public class BindingErrorMessageConverterTest {

    private BindingErrorMessageConverter bindingErrorMessageConverter =
            new BindingErrorMessageConverter(MessageSourceCreator.messageSource());

    private MessageCodesResolver messageCodesResolver = new DefaultMessageCodesResolver();


    @Test
    void codes와_args를_넣어_해당하는_message를_가져온다() {
        // Given
        final String[] codes = messageCodesResolver.resolveMessageCodes(
                "NotBlank",
                "stringDTO",
                "str",
                String.class
        );

        // When
        final String message = bindingErrorMessageConverter.getMessage(
                codes,
                null,
                "공백일 수 없음"
        );

        // Then
        Assertions.assertThat(message).isEqualTo("빈값은 안됩니다.");
    }

    @Test
    void 우선순위_높은_code의_메세지를_가져온다() throws Exception {
        // Given
        final String[] codes = messageCodesResolver.resolveMessageCodes(
                "Min",
                "numberDTO",
                "number",
                Integer.class
        );

        // When
        final String message = bindingErrorMessageConverter.getMessage(
                codes,
                new Object[]{1},
                "1보다 커야함"
        );

        // Then
        Assertions.assertThat(message).isEqualTo("NumberDTO의 number는 1 이상만 허용합니다.");
    }

    @Test
    void 일치하는_code가_존재하지_않으면_defaultMessage를_가져온다() throws Exception {
        // Given
        final String[] codes = messageCodesResolver.resolveMessageCodes(
                "AAA",
                "numberDTO",
                "number",
                Integer.class
        );
        final String defaultMessage = "1보다 커야함";

        // When
        final String message = bindingErrorMessageConverter.getMessage(
                codes,
                new Object[]{1},
                defaultMessage
        );

        // Then
        Assertions.assertThat(message).isEqualTo(defaultMessage);
    }

}
```

위 에서 만든 `MessageSource`로 `BindingErrorMessageConverter`를 생성한 뒤 테스틀를 해줍니다.
