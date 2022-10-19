---
title: '[Gradle] QueryDSL 설정'
date: '2022-10-19'
tags: ['Gradle', 'QueryDSL']
draft: false
summary: '[Gradle] QueryDSL 설정'
---

# [Gradle] QueryDSL 설정

QueryDSL 설정은 항상 똑같지 않고 변합니다.

인프런에 영한님 강의를 들을 때와 지금 설정 방법이 또 변경 되었습니다.

변경 된 버전의 QueryDSL 설정 방법을 적어보겠습니다.

```groovy
dependencies {
	implementation 'com.querydsl:querydsl-jpa'
	annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jpa"
}
```

예전에 한 번 변경이 있어서 했을 때는 위 두 의존성만 추가하면 되었던 기억인데 이번에 테스트 하려고 생성하니 아래와 같은 에러가 발생하였습니다.

```bash
Unable to load class 'javax.persistence.Entity'.
```

그래서 아래의 의존성을 추가로 넣어주니 해결되었습니다.

```groovy
annotationProcessor 'jakarta.persistence:jakarta.persistence-api'
```

## 참고 사이트

- [[Jpa] Q class import 안될 때 Gradle 설정으로 해결한 방법](https://kmhan.tistory.com/587)
