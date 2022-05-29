---
title: Local 환경에서 Static Resources 읽어오기
date: '2022-05-17'
tags: ['TIL', 'Java', 'Spring', 'Static Resources']
draft: true
summary: Local 환경에서 Static Resources 읽어오기
---

# Local 환경에서 Static Resources 읽어오기

`AWS S3` 같은 서비스를 이용하고 있다면, 업로드 된 파일의 `URL`을 통해 파일을 읽어올 수 있습니다.

하지만, `Local` 환경의 경우 `Web`에서 직접 접근할 수 없으므로, 요청을 받으면 `Local`에 있는 파일을 읽어 `response`로 내려주야 합니다.

`Spring Boot`에서는 이런 부분을 설정을 통해 간단하게 할 수 있게 해줍니다.

```java

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	@Value("${base-file-path}")
	private String baseFilePath;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/images/**")
				.addResourceLocations("file://%s/".formatted(baseFilePath));
	}
}
```

- `/images` 하위로 오는 모든 경로는 `file://BASE_FILE_PATH/` 로 매핑됩니다.
- `localhost:8080/images/a.pdf` -> `file://BASE_FILE_PATH/a.pdf`

이제 `URL`을 통해 바로 `Local`에 있는 파일을 `response`로 내려줄 수 있게 되었습니다.

## 참고 사이트

- [로컬 환경에서 정적 리소스 리로드 하기](https://bottom-to-top.tistory.com/39)
