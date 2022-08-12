---
title: '[Junit5] MockMvcBuilders를 이용하여 MockMvc 커스텀하기'
date: '2022-08-10'
tags: ['Java', 'Spring', 'Junit5', 'MockMvc']
draft: false
summary: MockMvcBuilders를 이용하여 MockMvc 커스텀하기
---

# [Junit5] MockMvcBuilders를 이용하여 MockMvc 커스텀하기

`MockMvc`를 사용하여 테스트를 할 때, 공통적으로 작성하는 로직이 몇 가지가 있습니다.

예를 들어 어떻게 요청과 응답이 왔는지 확인하기 위해 `andDo(print())`를 많이들 사용합니다

이런 부분을 일괄적으로 처리하고 싶어 찾아본 결과 `MockMvcBuilders`를 통해 직접 `MockMvc` 객체를 셋팅하여 만들 수 있다는 것을 알게 되었습니다.

## 기본 설정

```java

@TestConfiguration
public class MockMvcConfig {

    @Autowired
    private WebApplicationContext ctx;

    @Bean
    public MockMvc getMockMvc() {

        return MockMvcBuilders.webAppContextSetup(ctx)
                .addFilters(new CharacterEncodingFilter("UTF-8", true))
                .alwaysDo(print())
                .build();
    }

}
```

## Spring Security 설정

`Spring Security`를 사용중이라면 `Security` 관련 설정을 해줘야합니다.

```java

@TestConfiguration
public class MockMvcConfig {

    @Autowired
    private WebApplicationContext ctx;

    @Bean
    public MockMvc getMockMvc() {

        return MockMvcBuilders.webAppContextSetup(ctx)
                .apply(springSecurity()) // 추가
                .addFilters(new CharacterEncodingFilter("UTF-8", true))
                .alwaysDo(print())
                .build();
    }

}
```

`springSecurity()`는 `Security`를 `Spring MVC` 테스트와 통합할 때 필요한 모든 초기 세팅을 수행합니다.

## Spring Rest Docs 설정

`Spring Rest Docs`를 사용하면 값을 이쁘게 출력하기 위해 아래와 같이 설정합니다.

```java

@TestConfiguration
public class SpringRestDocsConfig {

    @Bean
    public RestDocsMockMvcConfigurationCustomizer restDocsMockMvcConfigurationCustomizer() {
        return (it) -> {
            it.operationPreprocessors()
                    .withRequestDefaults(prettyPrint())
                    .withResponseDefaults(prettyPrint());
        };
    }
}
```

이 부분도 `MockMvc` 객체를 생성할 때 함께 포함시킬 수 있습니다.

```java

@TestConfiguration
public class MockMvcConfig {

    @Autowired
    private WebApplicationContext ctx;

    @Autowired
    private RestDocumentationContextProvider restDocumentationContextProvider;

    @Bean
    public MockMvc getMockMvc() {

        return MockMvcBuilders.webAppContextSetup(ctx)
                .apply(springSecurity())
                .apply(documentationConfiguration(restDocumentationContextProvider) // 추가
                        .operationPreprocessors()
                        .withRequestDefaults(Preprocessors.prettyPrint())
                        .withResponseDefaults(Preprocessors.prettyPrint())
                )
                .addFilters(new CharacterEncodingFilter("UTF-8", true))
                .alwaysDo(print())
                .build();
    }

}
```

## standaloneSetup vs webAppContextSetup

`MockMvcBuilders`를 이용하여 `MockMvc`객체를 만들 때 파라미터를 반드시 설정해 줘야 합니다.

위에서는 `webAppContextSetup`으로 설정하였습니다만, `standaloneSetup`로 설정하는 방법도 있습니다.

### webAppContextSetup

`webAppContextSetup`은 실제 `Spring MVC` 구성을 로드하여 보다 완벽한 통합 테스트를 수행합니다.

즉, 통합테스트에 적합합니다.

### standaloneSetup

`standaloneSetup`은 스프링 구성을 로드하지 않고 해당 컨트롤러만 테스트할 떄 사용합니다.

즉, 단위테스트에 더 가깝습니다.

> 스프링을 구성을 로드해야 하는 경우 `(ex: Security)`에는 적합하지 않을 수 있습니다.

## 마치며

위는 기본적으로 필요한 부분만 설정한 것입니다. 이 외에 추가적으로 설정이 필요하다면 찾아서 덧붙이면 좋을 것 같습니다.

매번 까먹어서 설정할 때마다 찾아서 하다가 이제서야 정리를 합니다. (그래도 여러 번 해봐서 기억이 바로 나네요)

## 참고 사이트

- [Spring Security가 적용된 곳을 효율적으로 테스트하자](https://tecoble.techcourse.co.kr/post/2020-09-30-spring-security-test/)
- [[Spring-test] standaloneSetup vs webAppContextSetup](https://velog.io/@hanblueblue/Spring-mvc-standaloneSetup-vs-webAppContextSetup)
