---
title: '[Lombok] jps.track.ap.dependencies 에러 해결'
date: '2022-08-12'
tags: ['Java', 'Lombok', 'Error']
draft: false
summary: 'jps.track.ap.dependencies 에러 해결'
---

# [Lombok] jps.track.ap.dependencies 에러 해결

이번에 회사 프로젝트를 `git clone` 받아 실행시켰는데, 아래처럼 에러가 발생했습니다.

```zsh
java: JPS incremental annotation processing is disabled. Compilation results on partial recompilation may be inaccurate. Use build process "jps.track.ap.dependencies" VM flag to enable/disable incremental annotation processing environment.
java: java.lang.ExceptionInInitializerError
com.sun.tools.javac.code.TypeTags
java: java.lang.ExceptionInInitializerError
```

그래서 찾아본 결과 `Lombok` 문제였습니다.

## Enable annotation processing 활성화

첫 번째로 IntelliJ가 Annotation을 인식할 수 있도록 옵션을 켜줍니다.

`Preferences -> Build, Execution, Deployment -> Compiler -> Annotation Processing -> Enable annotation processing 체크`

하지만 여전히 실행하면 에러가 났습니다.

## 컴파일러에 옵션 추가

아래 옵션을 추가하면 된다고 하여 옵션을 추가해 보았습니다.

`Preferences -> Build, Execution, Deployment -> Compiler -> Shared build process VM option`에 아래 옵션을 넣어줍니다.

```zsh
-Djps.track.ap.dependencies=false
```

하지만 여전히 실행하면 에러가 났습니다.

## 버전 호환성

알고보니 `Lombok 버전`과 `JDK 버전`이 호환이 안 될 경우 발생한다고 합니다.

저희 회사는 `JDK 1.8`을 사용 중인데 제가 `JDK 11`로 컴파일 해서 생긴 이슈였습니다.

`Project Structure -> Project -> SDK 버전 변경`

`JDK 1.8`으로 변경하고 나니 정상적으로 실행이 되었습니다.

## 참고 사이트

- [컴파일 후 실행하면 나는 "jps.track.ap.dependencies" 에러 해결](https://abbo.tistory.com/288)
