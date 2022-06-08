---
title: Template Engine(with Thymeleaf)을 사용하여 PDF파일로 변환하기
date: '2022-05-19'
tags: ['TIL', 'Java', 'Spring', 'Template Engine', 'Thymeleaf']
draft: false
summary: Spring Boot에서 Template Engin를 사용하여 PDF파일 
---

# Template Engine(with Thymeleaf)을 사용하여 PDF파일로 변환하기

이번에 회사에서 받은 데이터를 가지고 PDF를 만들 일이 있어서 `Thymeleaf`를 사용하여 적용해 본 방법을 기록하고자 합니다.

## build.gradle

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation 'nz.net.ultraq.thymeleaf:thymeleaf-layout-dialect'
    implementation('org.xhtmlrenderer:flying-saucer-pdf-openpdf:9.1.22')
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

## Template Engine을 사용하여 렌더링 된 HTML을 String으로 반환받기

```java

@Component
@RequiredArgsConstructor
public class TemplateParser {

	public String parseHtmlFileToString(String templateName, Map<String, Object> variables) {
		// Thymeleaf Resolver 설정
		val templateResolver = new ClassLoaderTemplateResolver();
		templateResolver.setPrefix("templates/");
		templateResolver.setSuffix(".html");
		templateResolver.setTemplateMode(TemplateMode.HTML);

		// Spring Template Engine으로 위에서 설정한 Thymeleaf Resolver를 사용하도록 설정
		val templateEngine = new SpringTemplateEngine();
		templateEngine.setTemplateResolver(templateResolver);

		// Template Engine에서 사용할 변수
		val context = new Context();
		context.setVariables(variables);

		// 렌더링 된 값을 String으로 반환
		return templateEngine.process(templateName, context);
	}
}
```

### Spring Boot에서 Template Engine 사용 시

- `interface TemplateParser`를 만들어 `Template Engine`마다 상속받아 구현하는 것이 더 좋은 설계이지만, `Spring Boot`를 이용하면
  설정파일로 `Template Engine` 설정할 수 있습니다.
- `Spring Boot`는 기본적으로 `Thymeleaf`가 설치 되어 있다면 `Thymeleaf` 설정을 해줍니다.
- 즉, 위에서 `SpringTemplateEngine`을 의존주입 받아 사용하면 `Template Engine` 설정하는 부분 생략할 수 있습니다.

```java

@Component
@RequiredArgsConstructor
public class TemplateParser {

	private final SpringTemplateEngine templateEngine;

	public String parseHtmlFileToString(String templateName, Map<String, Object> variables) {
		val context = new Context();
		context.setVariables(variables);
		return templateEngine.process(templateName, context);
	}
}
```

## Thymeleaf 사용하기

`layout`기능을 사용하기 위해선 `org.springframework.boot:spring-boot-starter-thymeleaf`
외에 `nz.net.ultraq.thymeleaf:thymeleaf-layout-dialect`도 필요합니다.

- layout/document.html

```html
<!DOCTYPE html>
<html
  lang="ko"
  xmlns:th="http://www.thymeleaf.org"
  xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <style th:replace="pdf/approval/document/partials/styles :: commonStyle"></style>
    <title th:text="${title}"></title>
  </head>
  <body>
    <div id="main-pdf-container">
      <div th:replace="partials/header :: commonHeader"></div>
      <div th:replace="partials/commonField :: commonField"></div>
      <div layout:fragment="content"></div>
      <div th:replace="partials/attachedFiles :: commonApprovalAttachedFiles"></div>
    </div>
  </body>
</html>
```

저는 공통적으로 사용 될 `layout`용 `html`을 하나 만들어서 사용했습니다.

### th:replace 부분에 들어갈 파일 작성

`partials/header`부분은 `templates`폴더 하위 부터 해당 파일의 `절대경로`를 나타내며 `::` 이후 `commonHeader`는 해당 파일 내에서 `th:fragment`로 선언된 이름입니다.

- partials/header.html

```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://www.thymeleaf.org">
  <div th:fragment="commonHeader">...</div>
</html>
```

### layout:fragment 부분에 들어갈 파일 작성

```html
<!DOCTYPE html>
<html
  lang="ko"
  xmlns:th="http://www.thymeleaf.org"
  xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
  layout:decorate="~{pdf/approval/document/layout/document}"
>
  <div layout:fragment="content">...</div>
</html>
```

- `html` 태그에 `xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout` 추가해야 `layout` 기능을 사용할 수 있습니다.
- `html` 태그에 `layout:decorate="~{layout/document}"`를 추가해줌로써 해당 `layout`을 사용할 수 있게 됩니다.
- 위의 `<div layout:fragment="content">` 해당 태그 안의 내용이 `layout/document.html`의 `<div layout:fragment="content"></div>` 부분에
  들어가게 됩니다.

> - `layout:decorate="~{pdf/approval/document/layout/document}"` 부분을 보면 `~{}`로 감싸져 있는데, `~{}`로 감싸지 않으면 `WARN`이 발생합니다.
> - `th:block`에 `th:replace`나 `layout:fragment` 등을 사용해도 `WARN`이 납니다. 그렇기 때문에 일반적인 태그를 사용하기 바랍니다.

## HTML String으로 PDF파일 생성 후 저장하기

```java

@Component
@RequiredArgsConstructor
public class PdfGenerator {
	public String generate(String filePath, String fileName, String html) {
		String savePath = "%s/%s".formatted(filePath, fileName);

		// 해당 경로에 폴더가 없으면 no such directory or file 에러가 발생하므로
		// 파일을 다운 받기 전에 폴더를 생성합니다.
		mkdirs(filePath);

		try (FileOutputStream fileOutputStream = new FileOutputStream(savePath)) {
			ITextRenderer renderer = new ITextRenderer();
			renderer.setDocumentFromString(html); // HTML기반으로 된 String으로 Document 형식으로 변환합니다.
			renderer.layout(); // PDF 모양을 잡아주는 메소드들이 실행됩니다. (퍼사드 패턴)

			renderer.createPDF(fileOutputStream);
			return savePath;
		} catch (IOException | DocumentException e) {
			throw new IllegalStateException("PDF를 저장하는데 실패하였습니다.", e);
		}
	}

	private void mkdirs(String filePath) {
		new File(filePath).mkdirs();
	}
}
```

### 한글 처리

위 처럼 적용했더니, 한글만 적으면 화면에 보이질 않았습니다. 한글을 보여주기 위해선 `한글을 지원하는 폰트`를 별도로 설정을 해줬어야 했습니다.

저는 [네이버 폰트](https://hangeul.naver.com/font)에서 `나눔스퀘어`를 받아 사용했습니다.

`resources/static/fonts`경로에 다운 받은 `폰트`를 넣고, 해당 `폰트`를 적용합니다.

```java

@Component
@RequiredArgsConstructor
public class PdfGenerator {
	public String generate(String filePath, String fileName, String html) {
		String savePath = "%s/%s".formatted(filePath, fileName);

		// 해당 경로에 폴더가 없으면 no such directory or file 에러가 발생하므로
		// 파일을 다운 받기 전에 폴더를 생성합니다.
		mkdirs(filePath);

		try (FileOutputStream fileOutputStream = new FileOutputStream(savePath)) {
			ITextRenderer renderer = new ITextRenderer();

			addFonts(renderer); // 폰트 추가

			renderer.setDocumentFromString(html); // HTML기반으로 된 String으로 Document 형식으로 변환합니다.
			renderer.layout(); // PDF 모양을 잡아주는 메소드들이 실행됩니다. (퍼사드 패턴)

			renderer.createPDF(fileOutputStream);
			return savePath;
		} catch (IOException | DocumentException e) {
			throw new IllegalStateException("PDF를 저장하는데 실패하였습니다.", e);
		}
	}

	private void mkdirs(String filePath) {
		new File(filePath).mkdirs();
	}

	private void addFonts(ITextRenderer renderer) throws IOException {
		Stream.of(
				"NanumSquare_acB.ttf",
				"NanumSquare_acEB.ttf",
				"NanumSquare_acL.ttf",
				"NanumSquare_acR.ttf",
				"NanumSquareB.ttf",
				"NanumSquareEB.ttf",
				"NanumSquareL.ttf",
				"NanumSquareR.ttf"
		).forEach(font -> {
			try {
				renderer.getFontResolver()
						.addFont(
								getFontPath(font),
								BaseFont.IDENTITY_H,
								BaseFont.EMBEDDED
						);
			} catch (IOException e) {
				throw new IllegalStateException("폰트 가져오기 실패", e);
			}
		});
	}

	private String getFontPath(String fontName) throws IOException {
		return new ClassPathResource("/static/font/%s".formatted(fontName)).getURL().toString();
	}
}
```

이후, `Thymeleaf`에서 해당 폰트를 사용하도록 `font-family`를 설정합니다.

```html
<style>
  * {
    font-family: 'NanumSquare', sans-serif;
  }
</style>
```

> - `.otf` 폰트는 적용이 되지 않아서 `.ttf`만 적용했습니다.
> - `addFonts` 부분이 해당 부분보다 아래로 가면 `폰트`가 적용되지 않으므로, 반드시 위쪽에 위치하도록 합니다.

이제 한글도 정상적으로 나오는 것을 확인할 수 있습니다.

## 참고 사이트

- [[Spring] html 파일(with Thymeleaf)을 pdf파일로 변환하기](https://zorba91.tistory.com/323)
