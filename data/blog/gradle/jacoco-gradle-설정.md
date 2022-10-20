---
title: '[Gradle] JaCoCo 설정'
date: '2022-10-21'
tags: ['Gradle', 'JaCoCo', 'Test', 'Test Coverage']
draft: false
summary: '[Gradle] JaCoCo 설정'
---

# Gradle JaCoCo 적용

내가 얼만큼 테스트를 작성했는지, 어느 부분은 놓쳤는지 같은 지표를 보여주는 것을 테스트 커버리지 라고 합니다.

자바 진영에는 `JaCoCo`라는 라이브러리를 이용하면 쉽게 테스트 커버리지를 확인 할 수 있습니다.

## 냅다 적용 해보기

```groovy
plugins {
    id 'org.springframework.boot' version '2.7.5'
    id 'io.spring.dependency-management' version '1.0.14.RELEASE'
    id 'java'
    id 'jacoco'  // 추가
}

...

jacoco {
    toolVersion = '0.8.7'
}

tasks.named('test') {
    useJUnitPlatform()

    finalizedBy 'jacocoTestReport' // 테스트가 끝나고 실행 되어야 함
}

// 어떤 형식으로 리포트를 만들지 지정할 수 있음
jacocoTestReport {

    reports {
        html.enabled true
        xml.enabled false
        csv.enabled false
    }

    finalizedBy 'jacocoTestCoverageVerification'
}

jacocoTestCoverageVerification {

    violationRules {
        rule {
            enabled = true // 활성화
            element = 'CLASS' // 클래스 단위로 커버리지 체크
            // includes = []

            // 라인 커버리지 제한을 80%로 설정
            limit {
                counter = 'LINE'
                value = 'COVEREDRATIO'
                minimum = 0.8
            }

            // 브랜치 커버리지 제한을 80%로 설정
            limit {
                counter = 'BRANCH'
                value = 'COVEREDRATIO'
                minimum = 0.8
            }

            // 빈 줄을 제외한 코드의 라인수를 최대 200라인으로 제한
            limit {
                counter = 'LINE'
                value = 'TOTALCOUNT'
                maximum = 200
            }

            // excludes = []
        }

    }
}
```

위 처럼 설정하면 테스트 커버리지가 설정한 값을 충족했을 때만 빌드가 성공하게 됩니다.

## 하나씩 파헤치기

```groovy
plugins {
    id 'jacoco'  // 추가
}
```

- 빌드 과정에 `jacoco`, `jacocoTestReport`, `jacocoTestCoverageVerification`태스크를 인식할 수 있도록 해줍니다.

```groovy
jacoco {
    toolVersion = '0.8.7'
}
```

- `jacoco` 버전을 명시합니다.

```groovy
tasks.named('test') {
    useJUnitPlatform()
    finalizedBy 'jacocoTestReport'
}
```

- 테스트 태스크가 끝나면 `jacocoTestReport`태스크를 실행하도록 합니다.

```groovy
jacocoTestReport {

    reports {
        html.enabled true
        xml.enabled false
        csv.enabled false
    }

    finalizedBy 'jacocoTestCoverageVerification'
}
```

- 리포트를 어떤 형식으로 생성할지 지정합니다. 위는 HTML만 생성되도록 하였습니다.
- 리포트 생성 방식을 정한 뒤, `jacocoTestCoverageVerification` 태스크를 실행하도록 설정합니다.

```groovy
jacocoTestCoverageVerification {

    violationRules {
        rule {
            enabled = true // 활성화
            element = 'CLASS' // 클래스 단위로 커버리지 체크
            // includes = []

            // 라인 커버리지 제한을 80%로 설정
            limit {
                counter = 'LINE'
                value = 'COVEREDRATIO'
                minimum = 0.8
            }

            // 브랜치 커버리지 제한을 80%로 설정
            limit {
                counter = 'BRANCH'
                value = 'COVEREDRATIO'
                minimum = 0.8
            }

            // 빈 줄을 제외한 코드의 라인수를 최대 200라인으로 제한
            limit {
                counter = 'LINE'
                value = 'TOTALCOUNT'
                maximum = 200
            }

            // excludes = []
        }

    }
}
```

- `enable`
  - 해당 rule의 활성화 여부
  - Default: true
- `element`: 커버리지를 체크할 기준을 정할 수 있음
  - BUNDLE: 패키지 번들
  - CLASS: 클래스
  - GROUP: 논리적 번들 그룹
  - METHOD: 메소드
  - PACKAGE: 패키지
  - SOURCEFILE: 소스 파일
  - Default: BUNDLE
- `includes`
  - rule의 적용 대상을 package 수준으로 정의할 수 있음
  - Default: 전체 Package
- `limit`: 커버리지 측정 단위 지정
  - `counter`: 커버리지 측정의 최소 단위
    - LINE: 빈 줄을 제외한 실제 코드의 라인 수, 라인이 한 번이라도 실행되면 실행된 것으로 간주
    - BRANCH: 조건문 등의 분기 수
    - CLASS: 클래수 수, 내부 메소드가 한 번이라도 실행된다면 실행된 것으로 간주
    - COMPLEXITY: 복잡도
    - INSTRUCTION: Java 바이트 코드 명령 수
    - METHOD: 메소드 수, 메소드가 한 번이라도 실행 된다면 실행된 것으로 간주
    - Default: INSTRUCTION
  - `value`: 측정한 커버리지를 어떤 형식으로 보여줄 것인지를 의미
    - COVEREDRATIO: 커버된 비율. 0: 0%, 1: 100%
    - COVEREDCOUNT: 커버된 개수
    - MISSEDCOUNT: 커버되지 않은 개수
    - MISSEDRATIO: 커버되지 않은 비율. 0: 0%, 1: 100%
    - TOTALCOUNT: 전체 개수
    - Default: COVEREDRATIO
  - `minimum`: counter 값을 value에 맞게 표현했을 때 최솟값을 의미
    - 이 값으로 jacocoTestCoverageVerification의 성공 여부가 결정
- `excludes`: 제외할 클래스 지정
  - `패키지 + 클래스명` 으로 작성되며 `*`, `?`를 사용할 수 있음

## Lombok 테스트 커버리지에서 제외

테스트 커버리지를 보면 `Lombok` 이 생성해주는 메소드들도 모두 포함되어 있는데 이런 부분들까지 모두 테스트하기는 번거로우니 제외 시키도록 하겠습니다.

- lombok.config

```config
lombok.addLombokGeneratedAnnotation = true
```

`lombok.config`라는 파일을 만들어 위의 설정을 추가해주면 제외가 됩니다.

## QueryDSL 사용시 Q-Type 테스트 커버리지에서 제외

### QueryDSL 짧막한 지식

Java를 사용해서 개발을 하면 ORM으로 보통 JPA를 많이 사용합니다.

여기서 JPA를 `Type-Safe`하게 작성하며 `동적 쿼리`도 간단하게 만들 수 있는 QueryDSL을 얹어 사용하게 되는데 QueryDSL은 `@Entity`가 붙은 클래스를 찾아 `Q-Type`을 생성합니다.

이 `Q-Type`을 통해 쿼리를 작성하게 됩니다.

### Q-Type 테스트 커버리지에서 제외 설정

이렇게 자동 생성된 `Q-Type`은 테스트를 할 이유가 없습니다.

그래서 테스트 커버리지에서 제외시켜 줘야 합니다.

```groovy
jacocoTestCoverageVerification {

    // 패키지.클래스명
    def qTypes = []
    for (qPattern in '*.entity.QA'..'*.entity.QZ') {
        qTypes.add(qPattern + '*')
    }

    violationRules {
        rule {
            enabled = true // 활성화
            element = 'CLASS' // 클래스 단위로 커버리지 체크
            // includes = []

            // 라인 커버리지 제한을 80%로 설정
            limit {
                counter = 'LINE'
                value = 'COVEREDRATIO'
                minimum = 1
            }

            // 브랜치 커버리지 제한을 80%로 설정
            limit {
                counter = 'BRANCH'
                value = 'COVEREDRATIO'
                minimum = 1
            }

            // 빈 줄을 제외한 코드의 라인수를 최대 200라인으로 제한합니다.
            limit {
                counter = 'LINE'
                value = 'TOTALCOUNT'
                maximum = 200
            }

            excludes = ["*.*Application"] + qTypes
        }

    }
}
```

모든 `Q-Type`은 `Q+Entity 클래스명`이기 때문에 `QA ~ QZ`로 시작하는 모든 클래스를 대상에서 제외 시켰습니다.

저는 `entity`패키지 안에 넣어서 작성할 예정이라 `entity패키지`도 적었지만 `*.QA`처럼만 작성해도 됩니다.

이렇게 만든 제외 클래스를 `excludes`에 추가하여 줍니다.

이때 저는 `main` 메소드를 실행시키는 `Application`클래스도 테스트 대상에서 제외 시켰습니다.

> `QNA`같은 `Entity`명으로 작성 시 당연히 테스트 커버리지에서 제외 됩니다. 이 경우는 특별히 `Qna` 처럼 조금 다른 방식이나 네이밍으로 생성해 주시기 바랍니다.

### 리포트에서 제외 설정

위 처럼 테스트 커버리지만 설정하고 실행을 해보면 해당 클래스들은 테스트 커버리지 비율에 포함되지 않는 것을 확인할 수 있습니다.

하지만 여전히 리포트 화면에는 그대로 남아있습니다.

그래서 리포트에서도 별도로 제외 시켜 주어야 합니다.

```groovy
jacocoTestReport {

    reports {
        html.enabled true
        xml.enabled false
        csv.enabled false
    }

    // 디렉터리/파일명
    def qTypes = []
    for(qPattern in "**/entity/QA" .. "**/entity/QZ"){
        qTypes.add(qPattern + "*")
    }

    afterEvaluate {
        classDirectories.setFrom(files(classDirectories.files.collect {
            fileTree(dir: it,
                    exclude: qTypes)
        }))
    }

    finalizedBy 'jacocoTestCoverageVerification'
}
```

테스트 커버리지에서 제외 시키는 것과는 다르게 여기서는 `디렉터리 경로`로 지정을 해줘야 합니다.

이제 다시 실행하고 리포트를 보면 리포트에 Q-Type은 더이상 나오지 않는 것을 확인 할 수 있습니다.

> 여기서 `Application`도 제외 시키고 싶어 `exclude: ["**/*Application"] + Qdomains)` 처럼 작성하였지만 `Application`은 이상하게 리포트에서 계속 보이고 있습니다.
>
> 하지만 리포트 결과를 보면 테스트 커버리지에서는 확실하게 제외되어 `n/a`처럼 값이 떠 있음을 알 수 있습니다.

## 전체 로직

- `lombok.config`

```config
lombok.addLombokGeneratedAnnotation = true
```

- `build.gradle`

```groovy
plugins {
    id 'org.springframework.boot' version '2.7.4'
    id 'io.spring.dependency-management' version '1.0.14.RELEASE'
    id 'java'
    id 'jacoco'
}

group = 'com.jojiapp'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}


dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'

    implementation 'com.querydsl:querydsl-jpa'
    annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jpa"
    annotationProcessor 'jakarta.persistence:jakarta.persistence-api'

    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

jacoco {
    toolVersion = '0.8.7'
}

tasks.named('test') {
    useJUnitPlatform()
    finalizedBy 'jacocoTestReport'
}

jacocoTestReport {

    reports {
        html.enabled true
        xml.enabled false
        csv.enabled false
    }

    // 디렉터리/파일명
    def qTypes = []
    for(qPattern in "**/entity/QA" .. "**/entity/QZ"){
        qTypes.add(qPattern + "*")
    }

    afterEvaluate {
        classDirectories.setFrom(files(classDirectories.files.collect {
            fileTree(dir: it,
                    exclude: ["**/*Application"] + qTypes)
        }))    }
    finalizedBy 'jacocoTestCoverageVerification'
}

jacocoTestCoverageVerification {

    // 패키지.클래스명
    def qTypes = []
    for (qPattern in '*.entity.QA'..'*.entity.QZ') {
        qTypes.add(qPattern + '*')
    }

    violationRules {
        rule {
            enabled = true // 활성화
            element = 'CLASS' // 클래스 단위로 커버리지 체크
            // includes = []

            // 라인 커버리지 제한을 80%로 설정
            limit {
                counter = 'LINE'
                value = 'COVEREDRATIO'
                minimum = 1
            }

            // 브랜치 커버리지 제한을 80%로 설정
            limit {
                counter = 'BRANCH'
                value = 'COVEREDRATIO'
                minimum = 1
            }

            // 빈 줄을 제외한 코드의 라인수를 최대 200라인으로 제한합니다.
            limit {
                counter = 'LINE'
                value = 'TOTALCOUNT'
                maximum = 200
            }

            excludes = ["*.*Application"] + qTypes
        }
    }
}
```

## 참고 사이트

- [JaCoCo 적용하기 - Gradle](https://backtony.github.io/spring/2022-02-01-spring-test-5)
