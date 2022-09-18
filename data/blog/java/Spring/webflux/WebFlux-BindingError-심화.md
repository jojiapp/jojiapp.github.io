---
title: Spring Webflux Binding Error 심화
date: '2022-09-18'
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
실직적으로 실패한 요소들의 정보는 `BindingResult`의 `List 타입`의 `ObjectError`에 담기게 됩니다.

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
