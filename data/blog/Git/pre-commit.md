---
title: '[Git] pre-commit'
date: '2022-10-22'
tags: ['Git']
draft: false
summary: '[Git] pre-commit'
---

# [Git] pre-commit

git을 사용하다가 문득 commit을 하기 전에 잘못된 문법이나 빌드를 돌려 정상적으로 되는지 확인을 하고 된다면 commit이 성공하도록 하고 싶다는 생각이 들었습니다.

듣기론 그렇게 설정한다더라 같은 얘기도 있었고, 제가 지금 사용중인 블로그 템플릿도 commit을 하면 ESLint 검사를 하는 절차가 있었습니다.

그래서 어떻게 하는건지 궁금하여 찾아봤는데 git에는 hook이 여러가지가 존재합니다.

그중 `pre-commit`은 쉘 스크립트를 작성하면 커밋하기 이전에 해당 쉘 스크립트가 실행이 되는 hook입니다.

hook은 별도로 다운받을 필요는 없고 `git init`을 하면 생기는 `.git`폴더 하위에 `hooks`라는 폴더에 이미 존재합니다.

```bash
applypatch-msg.sample
fsmonitor-watchman.sample
pre-applypatch.sample
pre-commit.sample
pre-push.sample
pre-receive.sample
push-to-checkout.sample
commit-msg.sample
post-update.sample
pre-commit.sample
pre-merge-commit.sample
pre-rebase.sample
prepare-commit-msg.sample
update.sample
```

여기서 `.sample`만 제거하면 바로 동작하는 구조 입니다.

우선 `pre-commit`을 사용할 수 있도록 이름을 변경합니다.

```bash
cd ./git/hooks
mv pre-commit.sample pre-commit
```

그리고 실행 될 쉘 스크립트를 변경해줍니다.

```sheel
#!/bin/sh
./gradlew clean build
```

저는 `pre-commit`에 자바 개발자이기 때문에 commit이전 빌드를 시켜보기 위해 `./gradlew clean build`를 넣었습니다.

이제 `git commit`을 하면 먼저 빌드가 진행되고 실패하면 commit이 되지 않고, 빌드 성공 시에만 commit에 성공하는 것을 확인할 수 있습니다.

## 참고 사이트

- [https://techblog.woowahan.com/2530/](https://techblog.woowahan.com/2530/)
