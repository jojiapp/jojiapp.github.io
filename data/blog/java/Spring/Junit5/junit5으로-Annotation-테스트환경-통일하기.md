---
title: 'Junit5 Annotation으로 테스트 환경 통일하기'
date: '2022-10-04'
tags: ['Java', 'Spring', 'Junit5']
draft: false
summary: Junit5 Annotation으로 테스트 환경 통일하기
---

# Junit5 Annotation으로 테스트 환경 통일하기

`Junit5`으로 테스트를 하다 보면 동일한 `Annotation`을 여러번 선언해야 할 때가 많습니다.

이런 것도 귀찮아 각 환경 별로 `Annotation`을 만들어 두고 가져다 사용하기로 하였습니다.

저는 `통합 테스트`, `유닛 테스트`, `개발환경` 세 가지를 만들어 보겠습니다.

## 개발환경

```java

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
@ActiveProfiles("test")
public @interface TestEnv {
}
```

`개발환경`은 `application-test.yml`을 읽어오도록 만들 것입니다.

또한, `_`를 `공백`으로 치환하도록 할 것입니다.

- `@TestEnv`

## 유닛 테스트

```java

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@ExtendWith(MockitoExtension.class)
@TestEnv
public @interface UnitTest {
}
```

`유닛 테스트`는 `Mock`처리가 가능하도록 할 것입니다.

추가로 위에서 만든 개발환경을 적용할 것이기 때문에 `@TestEnv`도 추가하겠습니다.

## 통합 테스트

```java

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest
@AutoConfigureMockMvc
@TestEnv
public @interface IntegrationTest {
}
```

`통합 테스트`는 `@SpringBootTest`로 통합 테스트를 실행하도록 하고

`@AutoConfigureMockMvc`으로 `MockMvc`를 사용할 수 있도록 설정하였습니다.

> `MockMvc`는 API 요청을 테스트할 때 사용되는 `Mock`입니다.

## 사용방법

```java

@IntergrateTest
public class StreamTest {

    @Test
    void 테스트() throws Exception {
        // Given
        ...

        // When

        // Then
    }
}
```

실제 사용하는 곳에 직접 만든 어노테이션을 사용하면 됩니다.

## 마치며

위의 환경 외에도 필요에 따라 확장하여 사용하면 편리하게 관리할 수 있습니다.
