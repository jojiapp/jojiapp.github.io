---
title: 'Spring Boot Swagger 3.0 사용'
date: '2022-10-25'
tags: ['Spring', 'Spring Boot', 'Swagger', 'Docs']
draft: false
summary: 'Spring Boot Swagger 3.0 사용'
---

# Spring Boot Swagger 3.0

Spring으로 웹 애플리케이션을 만들 때 문서 자동화 라이브러리로 `Swagger`와 `Spring Rest Docs`가 많이 사용됩니다.

`Swagger`는 직접 API를 날려볼 수 있다는 장점이 있지만, 관리를 잘해주지 않으면 문서에 적힌 것과 실제 요청 및 응답에 대한 값이 다를 수 있다는 단점이 있습니다.

반면 `Spring Rest Docs`는 테스트 코드 작성해서 만들어진 스니펫으로 문서를 만들기 때문에 문서에 적힌 내용과 실제 값이 다르지 않습니다. 하지만 문서만을 보고 개발해야 하기 때문에 직접 날려보면서 하는
것보다는 조금 답답할 수 있습니다.

저는 테스트 코드를 작성하면 문서까지 자동으로 반영해주는 `Spring Rest Docs`를 더 좋아하는 편이지만,
제가 여태 다녀본 회사들은 모두 `Swagger`를 사용하고 있었습니다.

눈치껏 적당히 `Swagger`를 사용하고 있었지만 이번에 `Swagger`에 대해 본격적으로 정리를 한 번 하려고 합니다.

> 아래 소스는 [Github](https://github.com/jojiapp/spring-boot-swagger3)에 올려두었습니다.

## Swagger 3.0 의존성 받기

우선 Swagger를 사용하기 위해 최근 의존성을 받겠습니다.

최근 버전이 3.0입니다.

```groovy
dependencies {
    implementation 'io.springfox:springfox-boot-starter:3.0.0'
}
```

> Swagger는 OpenAPI의 프레임워크 입니다.

## Swagger 기본적인 설정

```java

@Configuration
public class SwaggerConfig {

    private static final String TITLE = "[Spring Swagger] REST API";
    private static final String DESCRIPTION = "[Spring Swagger] BackEnd REST API Details";
    private static final String NAME = "[jojiapp]";
    private static final String URL = "https://github.com/jojiapp";
    private static final String EMAIL = "jojiapp@gmail.com";
    private static final String VERSION = "1.0";

    @Bean
    public Docket api() {

        return new Docket(DocumentationType.OAS_30)
                .consumes(getConsumeContentTypes())
                .produces(getProduceContentTypes())
                .useDefaultResponseMessages(false)
                .apiInfo(getApiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.jojiapp.springswagger"))
                .paths(PathSelectors.ant("/**"))
                .build();
    }

    private Set<String> getConsumeContentTypes() {

        Set<String> consumes = new HashSet<>();
        consumes.add(MediaType.APPLICATION_JSON_VALUE);
        consumes.add(MediaType.APPLICATION_FORM_URLENCODED_VALUE);
        return consumes;
    }

    private Set<String> getProduceContentTypes() {

        Set<String> produces = new HashSet<>();
        produces.add(MediaType.APPLICATION_JSON_VALUE);
        return produces;
    }

    private ApiInfo getApiInfo() {

        return new ApiInfoBuilder()
                .title(TITLE)
                .description(DESCRIPTION)
                .contact(new Contact(NAME, URL, EMAIL))
                .version(VERSION)
                .build();
    }
}
```

- `new Docket(DocumentationType.OAS_30)`
  - Swagger 3.0 버전을 사용
- `.consumes(getConsumeContentTypes())`
  - 요청에 대한 `ContentType` 설정
- `.produces(getProduceContentTypes())`
  - 응답에 대한 `ContentType` 설정
- `.useDefaultResponseMessages(false)`
  - 응답에 대한 문서화를 하지 않아도 기본적으로 401, 403, 500 등에 대해 작성되어 있는데
    `false`로 하면 제가 작성한 것 외에는 응답 메시지가 나오지 않음
- `.apiInfo(getApiInfo())`
  - 문서 페이지에 대한 제목, 설명, 버전, 작성자 정보를 작성
- `.apis(RequestHandlerSelectors.basePackage("com.jojiapp.springswagger"))`
  - 해당 패키지 하위에 작성된 정보를 읽어 문서를 만듦
- `.paths(PathSelectors.ant("/**"))`
  - 패키지 하위에 어떤 경로들만 읽을지 설정. 위는 모두 읽음

## Spring Boot 2.6 이상일 경우 documentationPluginsBootstrapper 빈 NullPointerException 에러 처리

저는 현재 `Spring Boot 2.7.x`를 사용 중인데 위 처럼 설정하고 서버를 기동시키면
`documentationPluginsBootstrapper` 빈이 `NullPointerException`이 발생하여 기동이 되지 않는다면 아래 처럼 설정하면 됩니다.

- `application.yml`

```yml
spring:
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher
```

> 자세한
> 내용은 [Spring Boot Swagger 3.0 설정 시 에러](https://jojiapp.github.io/blog/java/Spring/swagger/Spring-Boot-Swagger-설정-시-에러)에
> 포스팅 해두었습니다.

## @ApiOperation

`@ApiOperation`는 해당 API에 대한 제목이나 설명 등을 작성할 수 있습니다.

```java
@ApiOperation(value = "회원 조회", notes = "회원을 조회 합니다.")
@GetMapping
public MemberResponse get() {
    return new MemberResponse();
}
```

- `value`: 제목
- `notes`: 설명

이 외에도 많은 기능이 있지만 주로 이 두 개를 사용할 것 같습니다.

## @Tag

같은 `@Tag`를 사용중인 API끼리 묶어서 보여줍니다.

`@Tag`를 달지 않으면 기본적으로 컨트롤로 단위로 묶여서 보여지게 됩니다.

`@Tags`를 통해 여러개를 선언할 수 있으며, 각 그룹에 해당 API가 중복으로 들어가게 됩니다.

```java
@Tag(name = "회원")
@PostMapping
public void save(@RequestBody MemberCreate memberCreate) {}

@Tags(value = {
    @Tag(name = "회원"),
    @Tag(name = "회원조회"),
})
@GetMapping("/{id}")
public MemberResponse getById(@PathVariable final Long id) {
    return new MemberResponse();
}

@Tags(value = {
    @Tag(name = "회원"),
    @Tag(name = "회원조회"),
})
@GetMapping
public MemberResponse getByName(final String name) {
    return new MemberResponse();
}
```

특정 시나리오가 있는 경우 `@Tag`를 사용하여 함께 사용되는 `API`끼리 묶으면 좋을것 같습니다.

## @ApiImplicitParam

`@ApiImplicitParam`는 `QueryParams`나 `PathVariable`에 대해 정의 할 때 사용합니다.

```java
@ApiImplicitParam(name = "id", value = "회원 식별키", dataTypeClass = Long.class)
@GetMapping("/{id}")
public MemberResponse getById(@PathVariable final Long id) {
    return new MemberResponse();
}
```

`name`과 일치하는 파라미터의 형식에 따라 `path`, `query`로 자동으로 기입됩니다.

`paramType = "[path | query]"`처럼 직접적으로 적어줄수도 있습니다.

```java
@ApiImplicitParams(value = {
    @ApiImplicitParam(name = "id", value = "회원 식별키", dataTypeClass = Long.class),
    @ApiImplicitParam(name = "name", value = "회원 식별키", dataTypeClass = String.class)
})
```

여러개를 사용하고 싶다면 위 처럼 작성하면 됩니다.

## @ApiParma

`@ApiParam`은 `QueryParam`에 대해서 아래 처럼 작성할 수 있게 지원합니다.

```java
@ApiOperation(value = "회원 조회", notes = "회원을 조회 합니다.")
@GetMapping
public MemberResponse get(@ApiParam(value = "이름") final String name) {
    return new MemberResponse();
}
```

여러 개의 경우 위 경우와 마찬가지로 `@ApiParams`내에 `@ApiParam`으로 여러개 정의하면 됩니다.

## @ApiModel & @ApiModelProperty

```java
@ApiModel(value = "회원 등록")
@NoArgsConstructor
@Getter
@Setter
public class MemberCreate {

  @ApiModelProperty(value = "이름", notes = "회원의 이름")
  private String name;
}
```

- `@ApiModel`은 요청 및 응답 `DTO`에 대해서 `Schemas`를 정의
- `@ApiModelProperty`는 각 필드 별 명세를 정의합니다.

## @ApiResponse

`@ApiResponse`는 응답에 대한 명세를 작성합니다.

```java
@ApiOperation(value = "회원 조회", notes = "회원을 조회 합니다.")
@ApiResponses(value = {
        @ApiResponse(code = 200, message = "성공", response = MemberResponse.class),
        @ApiResponse(code = 400, message = "존재하지 않는 회원")
})
@ApiImplicitParam(name = "id", value = "회원 식별키")
@GetMapping("/{id}")
public MemberResponse getById(final Long id) {
    return new MemberResponse();
}
```

## 전체적인 예시

```java
@Tag(name = "회원", description = "회원 API")
@RestController
public class MemberController {

    @Tag(name = "회원")
    @ApiOperation(value = "회원 등록", notes = "회원을 등록합니다.")
    @ApiResponses(value =  {
            @ApiResponse(code = 201, message = "성공"),
            @ApiResponse(code = 400, message = "잘못된 요청입니다.")
    })
    @PostMapping
    public void save(@RequestBody MemberCreate memberCreate) {}

    @Tags(value = {
            @Tag(name = "회원"),
            @Tag(name = "회원조회"),
    })
    @ApiOperation(value = "회원 식별키로 조회", notes = "회원 단건 조회")
    @ApiImplicitParam(name="id", value = "회원 식별키", dataTypeClass = Long.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "성공", response = MemberResponse.class),
            @ApiResponse(code = 400, message = "존재하지 않는 회원입니다.")
    })
    @GetMapping("/{id}")
    public MemberResponse getById(@PathVariable final Long id) {
        return new MemberResponse();
    }

    @Tags(value = {
            @Tag(name = "회원"),
            @Tag(name = "회원조회"),
    })
    @ApiOperation(value = "회원 이름으로 조회", notes = "회원 단건 조회")
    @ApiImplicitParam(name="name", value = "회원 이름", dataTypeClass = String.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "성공", response = MemberResponse.class),
            @ApiResponse(code = 400, message = "존재하지 않는 회원입니다.")
    })
    @GetMapping
    public MemberResponse getByName(final String name) {
        return new MemberResponse();
    }

}
```

```java
@ApiModel(value = "회원 등록")
@NoArgsConstructor
@Getter
@Setter
public class MemberCreate {

    @ApiModelProperty(value = "이름", notes = "회원의 이름", example = "홍길동")
    private String name;
}
```

```java
@ApiModel(value = "회원 정보 응답")
@NoArgsConstructor
@Getter
public class MemberResponse {

    @ApiModelProperty(name = "이름", example = "조지헌")
    private String name;
}
```

## 참고 사이트

- [Swagger 공식문서](https://swagger.io/docs/specification/about/)
- [[Swagger UI] Annotation 설명](https://velog.io/@gillog/Swagger-UI-Annotation-%EC%84%A4%EB%AA%85)
