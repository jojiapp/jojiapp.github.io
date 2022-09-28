---
title: Spring Webflux GlobalExceptionHandler 커스텀 시, 통합테스트 Bean 생성 에러
date: '2022-09-28'
tags: ['Java', 'Spring', 'Spring Webflux', 'Exception', 'Test']
draft: false
summary: Spring Webflux GlobalExceptionHandler 커스텀 시, 통합테스트 Bean 생성 에러
---

# Spring Webflux GlobalExceptionHandler 커스텀 시, 통합테스트 Bean 생성 에러

`Spring Webflux`에서 테스트를 해보기 위해 `@SpringBootTest`로 `Bean`들이 잘 주입되는지 실행시켜 보았는데

실제로는 구동되던 서버가 `GlobalExceptionHandler`를 생성할 수 없다며 실행되지 않았습니다.

```bash
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'globalExceptionHandler' defined in file [/Users/joji/project/tech-blog-server-webflux/build/classes/java/main/com/jojiapp/techblogserverspring/global/exception/handler/GlobalExceptionHandler.class]: Unsatisfied dependency expressed through constructor parameter 3; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'org.springframework.http.codec.ServerCodecConfigurer' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {}
```

로그를 확인해 보니 `GlobalExceptionHandler`의 세번 째 인자인 `ServerCodecConfigurer`가 존재하지 않아 생성 할 수 없다는 것이였습니다.

그래서 아주 간단했지만 시도해본 과정을 작성해보려 합니다.

## 프로덕트 코드에 직접 ServerCodecConfigurer Bean 생성

프로덕트 서버는 잘 실행이 되었지만, 그래도 찝찝하니 그냥 프로덕트 서버에 `ServerCodecConfigurer`를 `Bean`등록을 하기로 했습니다.

```java

@Configuration
public class ServerCodecConfigurerConfig {

    @Bean
    public ServerCodecConfigurer serverCodecConfigurer() {
        return new DefaultServerCodecConfigurer();
    }
}
```

그러고 통합 테스트를 돌려보니 정상적으로 실행되는 것을 확인할 수 있었습니다.

하지만, 반대로 프로덕트 서버가 아래의 로그를 뱉으며 실행되지 않았습니다.

```bash
The bean 'serverCodecConfigurer', defined in class path resource [org/springframework/boot/autoconfigure/web/reactive/WebFluxAutoConfiguration$EnableWebFluxConfiguration.class], could not be registered. A bean with that name has already been defined in class path resource [com/jojiapp/techblogserverspring/global/config/ServerCodecConfigurerConfig.class] and overriding is disabled.
```

> 즉, 이미 존재하니 재정의 하지 말아라! 라는 의미입니다.

## 테스트 환경에서만 ServerCodecConfigurer Bean 생성

그래서 테스트 환경에서만 `ServerCodecConfigurer` `Bean`을 생성하기로 하였습니다.

```java

@TestConfiguration
public class ServerCodecConfigurerConfig {

    @Bean
    public ServerCodecConfigurer serverCodecConfigurer() {
        return new DefaultServerCodecConfigurer();
    }
}
```

`@TestConfiguration`을 붙이면 일반적으로는 `Bean`이 등록되지 않고
`@Import(ServerCodecConfigurerConfig)`를 사용하여야 `Bean`이 추가로 등록됩니다.

```java

@SpringBootTest
@Import(ServerCodecConfigurerConfig.class)
class ApplicationTests {

    @Test
    void contextLoads() {
    }

}
```

실행시켜보면 잘 동작하는 것을 확인할 수 있습니다.

## 마치며

왜 프로덕트 서버에서는 `Bean`이 자동으로 생성이 되면서, 통합 테스트 환경에서는 생성되지 않는지 잘 모르겠습니다.

하지만 위 처럼 특정 `Bean`이 필요하다면 `@TestConfiguration`를 사용하여 별도로 등록하여 사용하면 좋을 것 같습니다.
