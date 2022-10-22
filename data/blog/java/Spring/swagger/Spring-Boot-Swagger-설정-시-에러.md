---
title: 'Spring Boot Swagger 3.0 설정 시 에러'
date: '2022-10-22'
tags: ['Spring', 'Spring Boot', 'Swagger', 'Docs']
draft: false
summary: 'Spring Boot Swagger 3.0 설정 시 에러'
---

# Spring Boot Swagger 3.0 설정 시 에러

예전에 Spring Boot로 `Swagger 3.0`을 적용했을 때는 아무 문제 없이 잘 돌아갔습니다.

근데 이번에 `Spring Boot 2.7.5`로 만들어서 설정을 했더니 아래와 같은 에러가 발생하였습니다.

```bash
Failed to start bean 'documentationPluginsBootstrapper'; nested exception is java.lang.NullPointerException
```

이유를 찾아보니 `Spring boot 2.6`버전 이후에 `spring.mvc.pathmatch.matching-strategy` 값이
`ant_path_matcher`에서 `path_pattern_parser`로 변경되었다고 합니다.

그래서 `application.yml`에 `ant_path_matcher`로 다시 변경을 해줘야 합니다.

```yml
spring:
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher
```

이후 다시 실행해보니 에러 없이 정상적으로 서버 구동이 되었습니다.

## 참고 사이트

- [[SpringBoot] Swagger(3.0.0) 적용 및 에러 발생시 대처](https://velog.io/@dlalscjf94/swagger)
