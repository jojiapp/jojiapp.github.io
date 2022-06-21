---
title: Spring Rest Docs Asciidoc 작성 방법
date: '2022-03-16'
tags: ['Spring', 'Spring Rest Docs', 'Docs']
draft: false
summary: 생성된 snippets를 이용하여 문서를 만들어 보도록 하겠습니다.
---

# [Spring] Spring Rest Docs Asciidoc 작성 방법

> 이전 시간까지 해서 테스트를 작성하고 빌드하여 `snippets`을 만드는 방법에 대해 알아봤습니다.  
> 이번 시간에는 생성된 `snippets`를 이용하여 어떻게 문서를 만드는지, 또 어떻게 `default`나 `optional` 같은 값들을 커스텀 하여 적용할 수 있는지 알아보도록 하겠습니다.
>
> > 작성된 모든 코드는 [Github](https://github.com/jojiapp/spring-rest-docs-java) 에서 확인 하실 수 있습니다.

## Asciidoc 작성

이제 `Test`를 통해 `snippets`을 생성했으니, 해당 `snippets`을 가지고 어떻게 문서를 작성하는지 알아보겠습니다.

### 파일 생성

`Gradle`의 경우 문서화를 작업할 파일은 꼭 `src/docs/asciidoc` 하위에 `.adoc` 확장자로 만들어야 합니다. (`main`, `test` 폴더와 동일 레벨)

### Snippets 적용 방법

`snippets`은 `build/generated-snippets` 하위에 생성됩니다. 그렇기 때문에, 해당 `snippets`을 사용하려면 해당 경로를 지정해야 합니다.

`Gradle` 설정에서 아래와 같이 적용했다면 `snippets`와 `operation`을 사용할 수 있습니다.

```groovy
asciidoctor {
    ...
    configurations('asciidoctorExtensions')
    ...
}
```

> `{snippets}`은 `build/generated-snippets` 경로를 잡아줍니다.  
> `operation`은 생성된 `snippets`(위의 snippets와 다름)을 보다 편리하게 사용할 수 있도록 해줍니다.

#### include 사용

`build/generated-snippets` 폴더에서 원하는 파일 명을 작성해 주면 됩니다.

```asciidoc
=== Curl Request

include::{snippets}/index/get/curl-request.adoc[]

=== HTTP Request

include::{snippets}/index/get/http-request.adoc[]

=== Response Body

include::{snippets}/index/get/response-body.adoc[]

=== Response Fields

include::{snippets}/index/get/response-fields.adoc[]
```

- 장점은 각 `snippets`에 대해 제목을 적을수 있습니다.
- 단점은 모든 `snippets`에 대해 다 적어줘야 합니다.

#### operation 사용

```asciidoc
operation::index/get[]
```

위와 같이 작성 시, 해당 폴더 아래에 있는 모든 `snippets`을 모두 문서에 추가합니다.  
문제는 불필요한 `snippets`까지 모두 추가 됩니다.

```asciidoc
operation::index/get[snippets='curl-request,http-request,response-body,response-fields']
```

위와 같이 작성 시, 원하는 `snippets`만 문서에 추가할 수 있습니다.

> `operation`의 단점은 제목을 직접 지정할 수 없다는 것입니다. 하지만, `templates`을 `Custom`하여 기본 설정 값을 변경할 수 있습니다.

## Templates Custom 방법

`optional`이나 `default`와 같은 값들은 기본적으로는 문서에 나타나지 않습니다. 해당 값들이 문서에 나타나게 하기 위해서는 필드값을 `Custom`해야 합니다.

### Custom 파일 생성

`Custom` 하기 위한 파일은 꼭 `src/test/resources/org/springframework/restdocs/templates` 위치에 만들어야 합니다.

파일 명은 `snippets`이름과 동일하나 확장자는 `.snippet`로 만들어야 합니다.

```
links.snippet
path-parameters.snippet
request-fields.snippet
request-headers.snippet
request-parameters.snippet
response-fields.snippet
response.headers.snippet
```

### 필드 값

```asciidoc
==== Request Parameters

|===
|필드명|설명|타입|기본값|필수값

{{#parameters}}
|{{#tableCellContent}}{{name}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}
|{{#tableCellContent}}{{#types}}{{types}}{{/types}}{{/tableCellContent}}
|{{#tableCellContent}}{{#defaults}}{{defaults}}{{/defaults}}{{/tableCellContent}}
|{{#tableCellContent}}{{^optional}}true{{/optional}}{{/tableCellContent}}
{{/parameters}}
|===
```

- `|필드명|설명|타입|기본값|필수값`: 테이블 컬럼 제목
- `{{#parameters}}`: 변수는 `{{}}`안에 작성하며, 앞에 `#`을 붙여 사용합니다
  - `parameters`의 경우 각 파일마다 상이하며, 해당 값은 `Test`에서 작성했던 `requestParameters` 부분에서 뒷 부분의 값을 적으면 됩니다.
  - `request-fields`의 경우 `requestFields`이므로, `fields`를 넣으면 됩니다.
- `{{#tableCellContent}}`: 테이블 셀을 의미합니다.

```java
private Attributes.Attribute defaultAttr(int value){
        return new Attributes.Attribute("defaults",value);
        }

private Attributes.Attribute typeAttr(JsonFieldType type){
        return new Attributes.Attribute("types",type);
        }
```

```java
parameterWithName().description().attributes(typeAttr()).optional()
```

- `{{name}}`: `parameterWithName`처럼 맨 뒤의 값이 변수 명이 됩니다.
  - 변수 임에도 `#`이 없는 이유는 `parameters`로 감싸져있고, 해당 값은 `parameters`에 이미 내장 되어 있는 값이기 때문입니다.
- `{{description}}`: `name`과 동일
- `{{#types}}{{types}}{{/types}}`: `types` 이름은 제가 지은것입니다.
  - 해당 필드는 직접 만든것이기 때문에 바로 값을 적을 순 없고, 별도로 감싸서 처리해야 합니다.
- `{{#defaults}}{{defaults}}{{/defaults}}`: `types`와 동일
- `{{^optional}}true{{/optional}}`: `^`는 반대라는 의미로, `optional`이 없으면 `true`값이 나오게 됩니다.

### 예시

#### links.snippet

```asciidoc
|===
|필드명|링크

{{#links}}
|{{#tableCellContent}}{{rel}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}
{{/links}}

|===
```

#### path-parameters.snippet

```asciidoc
|===
|필드명|설명|타입

{{#parameters}}
|{{#tableCellContent}}{{name}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}
|{{#tableCellContent}}{{#types}}{{types}}{{/types}}{{/tableCellContent}}
{{/parameters}}

|===
```

#### request-fields.snippet

```asciidoc
|===
|필드명|설명|타입|필수값

{{#fields}}
|{{#tableCellContent}}{{path}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}
|{{#tableCellContent}}{{type}}{{/tableCellContent}}
|{{#tableCellContent}}{{^optional}}true{{/optional}}{{/tableCellContent}}
{{/fields}}

|===
```

#### request-headers.snippet

```asciidoc
|===
|헤더명|설명

{{#headers}}
|{{#tableCellContent}}{{name}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}
{{/headers}}

|===
```

#### request-parameters.snippet

```asciidoc
|===
|필드명|설명|타입|기본값|필수값

{{#parameters}}
|{{#tableCellContent}}{{name}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}
|{{#tableCellContent}}{{#types}}{{types}}{{/types}}{{/tableCellContent}}
|{{#tableCellContent}}{{#defaults}}{{defaults}}{{/defaults}}{{/tableCellContent}}
|{{#tableCellContent}}{{^optional}}true{{/optional}}{{/tableCellContent}}
{{/parameters}}

|===
```

#### response-fields.snippet

```asciidoc
|===
|필드명|설명|타입|필수값

{{#fields}}
|{{#tableCellContent}}{{path}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}
|{{#tableCellContent}}{{type}}{{/tableCellContent}}
|{{#tableCellContent}}{{^optional}}true{{/optional}}{{/tableCellContent}}
{{/fields}}

|===
```

#### response-headers.snippet

```asciidoc
|===
|헤더명|설명

{{#headers}}
|{{#tableCellContent}}{{name}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}
{{/headers}}

|===
```

## 문서 예시

### 기본 설정

```asciidoc
= REST API Guide
프리라이프;
:doctype: book
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 4
:sectlinks:
```

### 개요

```asciidoc
[[overview]]
= 개요

[[overview-http-verbs]]
== HTTP 동사

본 REST API에서 사용하는 HTTP 동사(verbs)는 가능한한 표준 HTTP와 REST 규약을 따릅니다.

|===
| 동사 | 용례

| `GET`
| 리소스를 가져올 때 사용

| `POST`
| 새 리소스를 만들 때 사용

| `PUT`
| 기존 리소스를 수정할 때 사용

| `PATCH`
| 기존 리소스의 일부를 수정할 때 사용

| `DELETE`
| 기존 리소스를 삭제할 떄 사용
|===

[[overview-http-status-codes]]
== HTTP 상태 코드

본 REST API에서 사용하는 HTTP 상태 코드는 가능한한 표준 HTTP와 REST 규약을 따릅니다.

|===
| 상태 코드 | 용례

| `200 OK`
| 요청을 성공적으로 처리함

| `201 Created`
| 새 리소스를 성공적으로 생성함.

| `204 No Content`
| 기존 리소스를 성공적으로 수정 및 삭제함.

| `400 Bad Request`
| 잘못된 요청을 보낸 경우. 응답 본문에 더 오류에 대한 정보가 담겨있다.

| `401 Unauthorized`
| 인증되지 않은 사용자.

| `403 Forbidden`
| 권한이 없음.

| `404 Not Found`
| 요청한 리소스가 없음. 응답 본문에 더 오류에 대한 정보가 담겨있다.

| `405 Method Not Allowed`
| 지원하지 않는 메소드.

| `409 Conflict`
| 중복 예외. 응답 본문에 더 오류에 대한 정보가 담겨있다.

| `500 Internal Server Error`
| 서버 에러.
|===

[[overview-hypermedia]]
== 하이퍼미디어

본 REST API는 하이퍼미디어와 사용하며 응답에 담겨있는 리소스는 다른 리소스에 대한 링크를 가지고 있다.
응답은 http://stateless.co/hal_specification.html[Hypertext Application from resource to resource. Language (HAL)] 형식을 따른다.
링크는 `_links`라는 키로 제공한다.
본 API의 사용자(클라이언트)는 URI를 직접 생성하지 않아야 하며, 리소스에서 제공하는 링크를 사용해야 한다.
```

### 리소스

```asciidoc
[[resources]]
= 리소스

[[resources-index]]
== 인덱스

인덱스는 서비스 진입점을 제공한다.

[[resources-index-access]]
=== 인덱스 조회

`GET` 요청을 사용하여 인덱스에 접근할 수 있다.

operation::index[snippets='response-body,http-response,links']

[[resources-events]]
== 이벤트

이벤트 리소스는 이벤트를 만들거나 조회할 때 사용한다.

[[resources-events-list]]
=== 이벤트 목록 조회

`GET` 요청을 사용하여 서비스의 모든 이벤트를 조회할 수 있다.

operation::get-events[snippets='response-fields,curl-request,http-response,links']

[[resources-events-create]]
=== 이벤트 생성

`POST` 요청을 사용해서 새 이벤트를 만들 수 있다.

operation::create-event[snippets='request-fields,curl-request,http-request,request-headers,http-response,response-headers,response-fields,links']

[[resources-events-get]]
=== 이벤트 조회

`Get` 요청을 사용해서 기존 이벤트 하나를 조회할 수 있다.

operation::get-event[snippets='request-fields,curl-request,http-response,links']

[[resources-events-update]]
=== 이벤트 수정

`PUT` 요청을 사용해서 기존 이벤트를 수정할 수 있다.

operation::update-event[snippets='request-fields,curl-request,http-response,links']
```

---

## 참고 사이트

- [Asciidoc 기본 사용법](https://narusas.github.io/2018/03/21/Asciidoc-basic.html)
- [[BE/2주차] Spring Rest Docs 적용기 (3)](https://velog.io/@hydroniumion/BE2%EC%A3%BC%EC%B0%A8-Spring-Rest-Docs-%EC%A0%81%EC%9A%A9%EA%B8%B0-3#%EC%9E%90%EC%A3%BC-%EC%93%B0%EC%9D%B4%EB%8A%94-%ED%8F%AC%EB%A7%B7-%EC%98%88%EC%8B%9C%EC%97%B4%EC%96%B4%EC%84%9C-%EC%9D%BD%EC%96%B4%EB%B3%B4%EC%84%B8%EC%9A%94)
- [[스프링 기반 REST API 개발] 3-6. 스프링 REST Docs: 문서 빌드](https://freedeveloper.tistory.com/197)
- [REST API Guide](https://github.com/freespringlecture/spring-rest-api-study/blob/chap03-06_rest-docs-build/src/main/asciidoc/index.adoc)
- [Spring Rest Docs 적용해보기](https://velog.io/@tmdgh0221/Spring-Rest-Docs-%EC%A0%81%EC%9A%A9%ED%95%B4%EB%B3%B4%EA%B8%B0)
- [Mustache 템플릿 문법](https://taegon.kim/archives/4910)
