---
title: Spring Rest Docs Test 코드 작성
date: '2022-02-28'
tags: ['Spring', 'Spring Rest Docs', 'Docs']
draft: false
summary: snippets을 만들기 위해 Test 코드를 작성하는 방법에 대해 알아보겠습니다.
---

# [Spring] Spring Rest Docs Test 코드 작성

> 이전 시간에는 `Gradle`설정 방법에 대해 알아봤습니다.  
> 이번 시간에는 어떻게 `Test 코드`를 작성하면 `snippets`을 생성할 수 있는지 알아보겠습니다.
>
> > 작성된 모든 코드는 [Github](https://github.com/jojiapp/spring-rest-docs-java) 에서 확인 하실 수 있습니다.

## 문서화에 사용되는 메소드

> `타입`과 `필수값`은 `Custom`을 통해 만들수 있습니다. (`type`은 기본적용인 곳도 있음)  
> `Custom`하는 방법에 대해서는 `Asciidoc` 사용방법에서 자세하게 다루겠습니다.

`typeAttr` `defaultAttr` 두 메소드는 제가 만든 메소드 입니다. 아래 예시 코드에 있습니다.

### Document

- `MockMvcRestDocumentation.document`: 문서 작성은 해당 메소드 안에서 이루어줘야 합니다.
  - 첫 번째 인자로는 `snippets`이 생성될 폴더 경로를 지정해 줍니다.
  - 두 번째 인자부터 각 `요청` 및 `응답`에 대해 정의합니다. (`아래 메소드 참조`)

```java
result.andDo(document("accounts/find-all",...)
```

### Request Headers

- `HeaderDocumentation.requestHeader`: `Request Headers`를 정의합니다.
  - `HeaderDocumentation.headerWithName`: 각 `Header`에 대한 정의를 합니다.

```java
requestHeaders(
		headerWithName(HttpHeaders.CONTENT_TYPE).description("요청 Body 타입"),
		headerWithName(HttpHeaders.ACCEPT).description("기대 응답 Body 타입")
		)
```

![request-headers 예시](/data/blog/java/Spring/RestDocs/request-headers.png)

### Path Parameters

- `RequestDocumentation pathParameters`': `Path Parameters`를 정의합니다.
  - `RequestDocumentation.parameterWithName`: 각 `Path Parameter`에 대해 정의합니다.

![path-parameters 예시](/data/blog/java/Spring/RestDocs/path-parameters.png)

### Request Parameters

- `RequestDocumentation.requestParameters`: `Request Parameters`를 정의합니다.
  - `RequestDocumentation.parameterWithName`: 각 `Parameter`에 대해 정의합니다.

```java
requestParameters(
		parameterWithName("page").description("페이지 번호 (0부터 시작)").attributes(typeAttr(JsonFieldType.NUMBER)).optional(),
		parameterWithName("size").description("개수").attributes(typeAttr(JsonFieldType.NUMBER)).attributes(defaultAttr(20)).optional(),
		parameterWithName("sort").description("정렬 {fieldName,asc|desc}").attributes(typeAttr(JsonFieldType.STRING)).optional()
		),
```

![request-parameters 예시](/data/blog/java/Spring/RestDocs/request-parameters.png)

### Request Fields

- `PayloadDocumentation.requestFields`: `Request Fields`를 정의합니다.
  - `PayloadDocumentation.fieldWithPath`: 각 `Field`에 대해 정의합니다.

```java
requestFields(
		fieldWithPath("name").description("이름").type(JsonFieldType.STRING),
		fieldWithPath("age").description("나이").type(JsonFieldType.NUMBER)
		)
```

![request-fields 예시](/data/blog/java/Spring/RestDocs/request-fields.png)

### Response Headers

- `HeaderDocumentation.responseHeaders`: `Response Headers`를 정의합니다.
  - `HeaderDocumentation.headerWithName`: 각 `Response Header`를 정의합니다.

```java
responseHeaders(
		headerWithName(HttpHeaders.CONTENT_TYPE).description("응답 Body 타입")
		),
```

![response-headers 예시](/data/blog/java/Spring/RestDocs/response-headers.png)

### Response Fields

- `PayloadDocumentation.responseFields`: `Response Fields`를 정의합니다.
  - `PayloadDocumentation.fieldWithPath`: 각 `Field`를 정의합니다.

![response-fields 예시](/data/blog/java/Spring/RestDocs/response-fields.png)

### Links

`HATEOAS`를 적용 중이라면, `Links`에 대해서도 작성할 수 있습니다.

- `HypermediaDocumentation.links`: `Links`를 정의합니다.
  - `HypermediaDocumentation.linkWithRel`: 각 `Link`에 대해 정의합니다.

```java
links(
		linkWithRel("self").description("요청 API 링크"),
		linkWithRel("profile").description("요청 API 문서 링크")
		),
```

![response-fields 예시](/data/blog/java/Spring/RestDocs/links.png)

> `Links`의 경우 이렇게 정의 하더라도, `Response Fields` 부분에서 한 번 더 정의해야 합니다. (불편)

## Test 작성 예시

`Test`코드를 작성해야 해당 `Test 코드`를 기반으로 `snippet`을 생성해줍니다.

`Rest API`는 작성되어 있다고 가정하고 하겠습니다.

### Rest Docs Config

기본적으로 `Json 응답 값`이 한줄로 보이기 때문에, `Json` 객체로 보기 이쁘게 하는 설정을 해줍니다.

```java

@TestConfiguration
public class SpringRestDocsConfig {

	@Bean
	public RestDocsMockMvcConfigurationCustomizer restDocsMockMvcConfigurationCustomizer() {
		return (it) -> {
			it.operationPreprocessors()
					.withRequestDefaults(Preprocessors.prettyPrint())
					.withResponseDefaults(Preprocessors.prettyPrint());
		};
	}
}

```

```java

@WebMvcTest(AccountApi.class)
@AutoConfigureRestDocs
@Import(SpringRestDocsConfig.class)
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
class AccountApiTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockBean
	private AccountService accountService;

	private Attributes.Attribute defaultAttr(int value) {
		return new Attributes.Attribute("defaults", value);
	}

	private Attributes.Attribute typeAttr(JsonFieldType type) {
		return new Attributes.Attribute("types", type);
	}

	@Test
	void 계정을_정상적으로_전체조회하면_200상태를_받는다() throws Exception {
		// given
		var api = "/api/accounts";

		int page = 1;
		int size = 5;

		var params = new LinkedMultiValueMap<String, String>();
		params.add("page", Integer.toString(page));
		params.add("size", Integer.toString(size));
		params.add("sort", "id,asc");

		var accountResponses = List.of(new AccountResponse(1L, "jojiapp", 26));
		var apiResponse = ApiResponse.of(accountResponses);

		var pageable = PageRequest.of(page, size, Sort.by("id").ascending());
		given(accountService.findAll(pageable)).willReturn(accountResponses);

		// when
		var result = mockMvc.perform(get(api)
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.params(params)
		);

		// then
		result.andDo(print())
				.andExpect(status().isOk())
				.andExpect(content().json(objectMapper.writeValueAsString(apiResponse)))
				.andDo(document("accounts/find-all",
						requestHeaders(
								headerWithName(HttpHeaders.CONTENT_TYPE).description("요청 Body 타입"),
								headerWithName(HttpHeaders.ACCEPT).description("응답 Body 타입")
						),
						requestParameters(
								parameterWithName("page").description("페이지 번호 (0부터 시작)").attributes(typeAttr(JsonFieldType.NUMBER)).optional(),
								parameterWithName("size").description("개수").attributes(typeAttr(JsonFieldType.NUMBER)).attributes(defaultAttr(20)).optional(),
								parameterWithName("sort").description("정렬 {fieldName,asc|desc}").attributes(typeAttr(JsonFieldType.STRING)).optional()
						),
						responseHeaders(
								headerWithName(HttpHeaders.CONTENT_TYPE).description("응답 Body 타입")
						),
						responseFields(
								fieldWithPath("body[0].id").description("계정 고유 아이디").type(JsonFieldType.NUMBER),
								fieldWithPath("body[0].name").description("이름").type(JsonFieldType.STRING),
								fieldWithPath("body[0].age").description("나이").type(JsonFieldType.NUMBER)
						)
				));
	}
}
```

- `@WebMvcTest(AccountApi.class)`: 해당 `Controller`만 간단하게 테스트 하기 위해서 `@WebMvcTest`를 사용했습니다.
- `@AutoConfigureRestDocs`: `Rest Docs`와 관련된 설정을 자동으로 해주는 어노테이션입니다. 추가하지 않을 시, 문서작성이 되지 않으므로 꼭 추가합니다.
- `@Import(SpringRestDocsConfig.class)`: 위에서 만든 설정파일을 추가합니다.
- `@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)`: 테스트 메소드명의 구분자 `_`를 공백으로 치환시켜 주는 어노테이션입니다.
- `MockMvc`: 가짜 요청을 보내기 위한 객체 입니다.
  - `mockMvc.perform()` 메소드를 통해 `API`요청을 보낼 수 있습니다.
  - `HTTP Method`는 `MockMvcRequestBuilders`클래스와 `RestDocumentationRequestBuilders`로 나뉘는데, 테스트 결과 둘 다 사용 가능합니다. (
    저는 `RestDocumentationRequestBuilders`를 사용했습니다.)

> 테스트를 실행 시켜보면 `build/generated-snippets/accounts/find-all` 위치에 `snippets`이 생기는것을 확인할 수 있습니다.
>
> 다음 시간에는 `snipptes`을 이용하여 `Asciidoc`를 작성하는 방법과 문서를 `Custom`하는 방법에 대해 알아보겠습니다.

---

## 참고 사이트

- [[Spring] Spring rest docs 적용기(gradle 7.0.2)](https://velog.io/@max9106/Spring-Spring-rest-docs%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-%EB%AC%B8%EC%84%9C%ED%99%94)
