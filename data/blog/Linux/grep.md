---
title: '[Linux] grep 명령어'
date: '2022-08-08'
tags: ['Linux', 'log']
draft: false
summary: grep 명령어를 이용하여 검색 조건 필터링 하기
---

# [Linux] grep 명령어

오늘은 `grep` 명령어를 이용하여 조건에 해당하는 부분만 필터링하여 로그를 보는 방법에 대해 알아보겠습니다.

아주 간단하게 `grep` 명령어는 사용했었지만 이번에 사수분께서 사용하는 것을 보고 한 번 공부하여 정리할 필요성을 느꼈습니다.

## grep 명령어란?

`grep` 명령어는 입력으로 전달 된 파일에서 `정규표현식 패턴`을 이용하여 원하는 문자열을 찾는 `리눅스 명령어` 입니다.

## grep 사용법

```zsh
grep [OPTION] [PATTERN] [FILE]
```

`grep` 명령어는 다른 `리눅스 명령어 (cat, tail, ps 등)`과 함께 사용할 수 있습니다.

- 에시

```zsh
tail -f <파일 명> | grep <필터링할 문자> -A <라인 수> -B <라인 수>
```

## grep 명령어 옵션

```zsh
grep --help
```

```zsh
grep [-abcdDEFGHhIiJLlMmnOopqRSsUVvwXxZz] [-A num] [-B num] [-C[num]]
	[-e pattern] [-f file] [--binary-files=value] [--color=when]
	[--context[=num]] [--directories=action] [--label] [--line-buffered]
	[--null] [pattern] [file ...]
```

`grep --help`를 해보면 위 처럼 여러가지 옵션을 볼 수 있습니다.

이 중 몇 가지만 알아보겠습니다.

### 일치하는 문자열 전 후 -N 라인 보기

```zsh
grep -A 10 -B 10 "ERROR" a.txt
```

`ERROR`이라는 문자열이 포함된 라인을 기준으로 전 후 10개의 라인을 출력하는 방법입니다.

- `-A <라인 수>`: 필터링 된 로그의 이후 몇 줄을 보여줍니다. `(After)`
- `-B <라인 수>`: 필터링 된 로그의 이전 몇 줄을 보여줍니다. `(Before)`

### AND

```zsh
tail a.txt | grep "ERROR" | grep "Service"
```

명령어 사이에 `| (or)` 연산자를 넣어 `AND` 처리를 할 수 있습니다,

### OR

```zsh
tail a.txt | grep "ERROR\|Service"
```

`정규표현식 패턴`을 사용하기 떄문에 검색할 문자열에 `| (or)` 연산자를 넣어 `OR` 처리를 할 수 있습니다.

### 대소문자 구분 하지 않기

```zsh
grep -i "error" a.txt
```

기본적으로 대소문자를 구분하기 때문에 대소문자 구분을 하고싶지 않을 경우 `-i` 옵션을 넣어 사용하면 됩니다.

### 일치하지 않는 문자열 검색

```zsh
grep -v "INFO" a.txt
```

해당 문자열이 포함되지 않은 라인을 검색하고 싶을 경우 `-v` 옵션을 넣어 사용할 수 있습니다.

### 하위 디렉토리의 모든 파일에서 찾기

```zsh
grep -r "ERROR" *
```

`-r` 옵션을 사용하여 하위 디렉토리 전체에서 검색할 수도 있습니다.

`-r`옵션 없이 `*`으로 파일 명을 사용할 경우 현재 디렉토리의 모든 파일에서 검색합니다.

## 마치며

현재 회사에서 로그파일을 보며 분석할 일이 자주 있어 `-A`, `-B`, `AND`, `OR`을 이용한 검색은 정말 유용했습니다.

특히 `tail -f <파일 명>` 명령어와 함께 사용하면 실시간으로 들어오는 로그에 대해서 필터링 된 로그만 볼 수 있어 매우 좋았습니다.

## 참고 사이트

- [리눅스 grep 명령어 사용법. (Linux grep command) - 리눅스 문자열 검색](https://recipes4dev.tistory.com/157)
