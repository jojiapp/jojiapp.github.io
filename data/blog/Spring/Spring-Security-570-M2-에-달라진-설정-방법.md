---
title: Spring Security 5.7.0-M2 부터 변경된 설정 방법
date: '2022-06-22'
tags: ['Spring', 'Spring Security', 'Config']
draft: true
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

## 참고 사이트

- [Spring Security Without WebSecurityConfigurerAdapter](https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter)
