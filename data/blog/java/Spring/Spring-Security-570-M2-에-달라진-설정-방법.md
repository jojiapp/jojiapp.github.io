---
title: Spring Security 5.7.0-M2 부터 변경된 설정 방법
date: '2022-06-30'
tags: ['Spring', 'Spring Security', 'Config']
draft: false
summary: Spring Security 5.7.0-M2 부터 변경된 설정 방법
---

# Spring Security 5.7.0-M2 부터 변경된 설정 방법

## 최종 SecurityConfig

```java

@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private static final String DOCS = "/docs/**";
	private final CorsConfigurationSource corsConfigurationSource;
	private final AuthenticationManagerBuilder authenticationManagerBuilder;
	private final AuthenticationConfiguration authenticationConfiguration;
	private final ObjectMapper objectMapper;
	private final LoginAuthenticationProvider loginAuthenticationProvider;
	private final JWTAuthorizationProvider jwtAuthorizationProvider;

	@Bean
	public AuthenticationManager authenticationManager() throws Exception {
		authenticationManagerBuilder.authenticationProvider(loginAuthenticationProvider);
		authenticationManagerBuilder.authenticationProvider(jwtAuthorizationProvider);
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public JWTAuthorizationFilter jwtAuthorizationFilter() throws Exception {
		return new JWTAuthorizationFilter(authenticationManager(), objectMapper);
	}

	@Bean
	public WebSecurityCustomizer webSecurityCustomizer() {
		return web -> web.ignoring()
				.antMatchers("/favicon.ico", DOCS);
	}

	@Bean
	public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
		return http
				.formLogin()
				.disable()
				.csrf()
				.disable()
				.cors()
				.configurationSource(corsConfigurationSource)
				.and()
				.sessionManagement()
				.sessionCreationPolicy(STATELESS)
				.and()
				.headers()
				.frameOptions()
				.disable()
				.and()
				.authorizeRequests(authz -> {
					authz.anyRequest()
							.authenticated();
				})
				.addFilterBefore(jwtAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class)
				.build();
	}
}
```

## WebSecurityConfigurerAdapter

기존의 `Spring Security`는 `WebSecurityConfigurerAdapter` 클래스를 상속받아 메소드를 `Override`하여 구현하였습니다.

하지만 `WebSecurityConfigurerAdapter`가 `Deprecated`처리 되면서 `Bean`으로 등록하여 설정하도록 변경되었습니다.

## SecurityFilterChain

`HttpSecurity` 객체에 인가 및 필터들을 등록하는 `Bean`입니다.

- 기존 방식

```java

@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter {
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
				.formLogin()
				.disable()
				.csrf()
				.disable()
				.cors()
				.configurationSource(corsConfigurationSource)
				.and()
				.sessionManagement()
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
				.and()
				.headers()
				.frameOptions()
				.disable()
				.and()
				.authorizeRequests(authz -> {
					authz.antMatchers(API_PUBLIC)
							.permitAll()
							.anyRequest().authenticated();
				})
				.addFilterBefore(jwtAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class)
				.build();
	}
}
```

- 변경된 방식

```java

@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	@Bean
	public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
		return http
				.formLogin()
				.disable()
				.csrf()
				.disable()
				.cors()
				.configurationSource(corsConfigurationSource)
				.and()
				.sessionManagement()
				.sessionCreationPolicy(STATELESS)
				.and()
				.headers()
				.frameOptions()
				.disable()
				.and()
				.authorizeRequests(authz -> {
					authz.anyRequest()
							.authenticated();
				})
				.addFilterBefore(jwtAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class)
				.build();
	}
}
```

## WebSecurityCustomizer

`WebSecurity` 객체에 설정하기 위한 `Bean`입니다.

- 기존 방식

```java

@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter {
	@Override
	public void configure(WebSecurity web) throws Exception {
		web.ignoring()
				.antMatchers("/favicon.ico", DOCS);
	}
}
```

- 변경된 방식

```java

@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	@Bean
	public WebSecurityCustomizer webSecurityCustomizer() {
		return web -> web.ignoring()
				.antMatchers("/favicon.ico", DOCS);
	}
}
```

## AuthenticationManager

`AuthenticationManager`을 사용하기 위한 방법은 2가지가 있습니다.

- `UsernamePasswordAuthenticationFilter`를 상속받아 `super.getAuthenticationManager()`를 통해 사용
- `AuthenticationManager`를 `Bean`으로 등록하여 의존 주입 받아 사용

`UsernamePasswordAuthenticationFilter`를 상속받아 사용하는 방법은 당연하게도 해당 필터를 상속받지 않으면 사용할수 없다는 단점이 존재합니다.  
로그인의 경우 `filter`에서 구현하기 보다 `Controller`에서 구현하는 것이 더 다루기가 쉽습니다.

그렇다면 `Bean`으로 생성해야 하는데, 기존에는 `WebSecurityConfigurerAdapter`를 상속받았기 때문에,
`super.authenticationManager()`를 `Bean`으로 등록하여 사용할 수 있었습니다.

이제는 `WebSecurityConfigurerAdapter`를 상속받지 않기 때문에 다른 방식으로 `Bean`을 등록해야 합니다.

### AuthenticationConfiguration를 통해 생성

`AuthenticationManager`를 어떻게 생성할지 찾던 도중 공식문서 댓글에서 `AuthenticationConfiguration`를 통해 생성할 수 있다는 것을 발견했습니다.

```java

@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	private final AuthenticationConfiguration authenticationConfiguration;

	@Bean
	public AuthenticationManager authenticationManager() throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}
}
```

> 공식문서가 아니라 댓글에 나와있던 방식으로 좋은 방법은 아닐 수 있습니다.

## AuthenticationManager에 AuthenticationProvider 주입

`AuthenticationProvider`가 하나일 경우 `Bean`으로 등록만 하면 자동으로 `AuthenticationManager`에 주입이 됩니다.

하지만, 저는 2개의 `AuthenticationProvider`가 필요했기 때문에 별도로 주입이 필요했습니다.

### SecurityFilterChain에 authenticationProvider를 통해 주입?

`SecurityFilterChain`에서 `authenticationProvider` 메소드를 제공합니다.

해당 메소드에 `AuthenticationProvider`를 주입하면 `AuthenticationManagerBuilder` 객체의 `authenticationProviders`필드에 추가 되는것을 확인할 수
있습니다.

이렇게 간단하게 될줄 알았지만 여전히 `AuthenticationManager`에 등록이 되지 않았습니다.

그래서 디버깅을 해보기로 했습니다.

```java

@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final AuthenticationConfiguration authenticationConfiguration;
	private final LoginAuthenticationProvider loginAuthenticationProvider;
	private final JWTAuthorizationProvider jwtAuthorizationProvider;

	@Bean
	public AuthenticationManager authenticationManager() throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
		return http
			.formLogin()
			.disable()
			.csrf()
			.disable()
			.cors()
			.configurationSource(corsConfigurationSource)
			.and()
			.sessionManagement()
			.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			.and()
			.headers()
			.frameOptions()
			.disable()
			.and()
			.authorizeRequests(authz -> {
				authz.antMatchers(API_PUBLIC)
					.permitAll()
					.anyRequest().authenticated();
			})
			.authenticationProvider(loginAuthenticationProvider) // 추가
			.authenticationProvider(jwtAuthorizationProvider) // 추가
			.addFilterBefore(jwtAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class)
			.build();
	}
}
```

![HttpSecurity authenticationProvider 디버깅 포인트](/data/blog/java/Spring/Security/1.png)
![AuthenticationManagerBuilder authenticationProvider 디버깅 포인트](/data/blog/java/Spring/Security/2.png)

디버깅을 돌려보면 `AuthenticationConfiguration`객체안에 `AuthenticationManagerBuilder`가 있음을 알 수 있고, `AuthenticationManagerBuilder`
안의 `AuthenticationProviders`필드에 `DaoAuthenticationProvider`가 추가되는 것을 확인할 수 있습니다.

![AuthenticationConfiguration의 AuthenticationManagerBuilder에 DaoAuthenticationProvider주입](/data/blog/java/Spring/Security/3.png)

이후, 추가된 `AuthenticationProviders`와 `AuthenticationManager`를 가지고 `ProviderManager`를 생성합니다.

![ProviderManager 생성](/data/blog/java/Spring/Security/4.png)

`ProviderManager`는 추후 `AuthenticationManager`를 통해 `authenticate`를 실행 하면 넘어온 `Authentication` 객체 타입을
지원하는 `AuthenticationProvider`를 실행합니다.

![ProviderManager authenticate](/data/blog/java/Spring/Security/5.png)

이어서 진행을 해보면 `HttpSecurity`객체를 통해 `LoginAuthenticationProvider`와 `JwtAuthenticationProvider`가 주입되는 것을 알 수 있습니다.  
즉, 이 부분이 `SecurityFilterChain`를 통해 주입시켰을 때 `Provider`가 주입되는 과정입니다.

![HttpSecurity객체를 통해 AuthenticationManagerBuilder에 LoginAuthenticationProvider주입](/data/blog/java/Spring/Security/6.png)
![WebSecurityConfigurerAdapter의 AuthenticationManagerBuilder에 LoginAuthenticationProvider주입](/data/blog/java/Spring/Security/7.png)

여기서 중요하게 봐야할 점은 `WebSecurityConfigurerAdapter`객체의 `AuthenticationManagerBuilder`의 `authenticationProviders`필드에 주입을 한다는
점입니다.

**즉, 2개는 별도의 객체라는 것 입니다.**

`SecurityFilterChain`를 통해 주입한 `AuthenticationProvider`객체들은 `WebSecurityConfigurerAdapter`객체에 주입이 되고
`Bean`으로 생성한 `AuthenticationManager`은 `AuthenticationConfiguration`의 `AuthenticationManager`이기
떄문에 `DaoAuthenticationProvider`만 존재하는 것입니다.

> `LoginAuthenticationProvider`만 캡쳐하였지만 `JwtAuthenticationProvider`또한 동일하게 생성됩니다.

### 생각해볼만한 대안들

#### 1. SecurityFilterChain에 주입하고 WebSecurityConfigurerAdapter객체를 통해 AuthenticationManager를 Bean으로 등록하기

이렇게 생성할수도 있겠지만 `WebSecurityConfigurerAdapter`가 `Deprecated`당했기 때문에 좋은 방법은 아닌거 같습니다.

#### 2. AuthenticationConfiguration객체를 통해 AuthenticationManager를 Bean으로 등록하기

`AuthenticationConfiguration`를 통해 `AuthenticationManager`를 `Bean`으로 등록하여 사용할려면 `AuthenticationProvider`를 주입시킬 방법이 필요합니다.

![AuthenticationConfiguration에서 AuthenticationManagerBuilder Bean 등록](/data/blog/java/Spring/Security/8.png)

`AuthenticationConfiguration`객체를 보면 `AuthenticationManagerBuilder`를 `Bean`으로 등록한다는 것을 알 수 있습니다.

그렇다면, `AuthenticationManagerBuilder`를 주입받아 `AuthenticationProvider`를 추가시켜 주면 됩니다.

```java

@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final AuthenticationManagerBuilder authenticationManagerBuilder;
	private final AuthenticationConfiguration authenticationConfiguration;
	private final LoginAuthenticationProvider loginAuthenticationProvider;
	private final JWTAuthorizationProvider jwtAuthorizationProvider;

	@Bean
	public AuthenticationManager authenticationManager() throws Exception {
		authenticationManagerBuilder.authenticationProvider(loginAuthenticationProvider);
		authenticationManagerBuilder.authenticationProvider(jwtAuthorizationProvider);
		return authenticationConfiguration.getAuthenticationManager();
	}
}
```

![AuthenticationConfiguration에 AuthenticationProvider 정상 등록](/data/blog/java/Spring/Security/9.png)

`AuthenticationConfiguration`객체의 `AuthenticationManagerBuilder`에 정상적으로 `LoginAuthenticationProvider`가 추가되는 것을 확인할 수
있습니다.

## 참고 사이트

- [Spring Security Without WebSecurityConfigurerAdapter](https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter)
