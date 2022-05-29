---
title: GitHub(원격저장소) SSH 연결
date: '2022-01-30'
tags: ['Blog', 'Git']
draft: false
summary: GitHub에 SSH를 연결하여 사용하기.
---

# [Git] GitHub(원격저장소) SSH 연결

> GitHub를 원격저장소로 Repository를 사용할 경우 기본적으로 HTTPS로 접속하게 됩니다.  
> 이 경우 SSH를 사용할 때 보다는 보안이 좋지 않습니다.  
> 또한, 매번 아이디 및 패스워드를 입력해야하는 번거로움이 있습니다.
>
> SSH를 사용하면 HTTPS보다 보안도 좋고, 매번 아이디 및 비밀번호를 입력해야하는 수고를 덜 수 있습니다.

## SSH 키

### SSH 키 확인

이미 SSH 키가 존재하는 상태에서 다시 발급 시, 기존의 키가 덮어쓰기 되어버리기 때문에 SSH 키가 존재하는지 확인해야합니다.

당연히 다른 이름으로 SSH를 발급 할 수도 있습니다.

```zsh
~/.ssh
```

```zsh
ls
```

- id_rsa (개인 키)
- id_rsa.pub (공개 키)

기본값으로 생성한 경우 위 두 파일이 있다면 이미 **발급을 한 경우**입니다.

### SSH 키 발급

```zsh
ssh-keygen -t rsa -b 4096 -C "jojiapp@gmail.com"
```

- `-t`: 생성할 키 타입
- `-b`: 생성할 키의 비트(bits) 수
- `-C`: 코멘트

```zsh
Enter file in which to save the key (~/.ssh/id_rsa): ~/.ssh/id_rsa_jojiapp
```

Enter를 치시면 기본적으로 `~/.ssh` 경로에 SSH 파일(`id_rsa`, `id_rsa.pub`)이 생성되게 됩니다.  
저는 다른 이름으로 하고 싶었기 때문에 뒤에 `_jojiapp`을 붙였습니다.

```zsh
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
```

암호를 입력하여 보안을 더 강화할 수 있습니다.  
Enter를 치시면 기본적으로 암호를 생성하지 않습니다.

> 암호를 입력하는것을 권장합니다.

```zsh
Your identification has been saved in ~/.ssh/id_rsa_jojiapp
Your public key has been saved in ~/.ssh/id_rsa_jojiapp.pub
```

위와 같은 문구가 나왔다면 SSH키가 발급 된 것입니다.

## ssh-agent

`ssh-agent`가 없어도 `SSH 키`를 가지고 아이디 및 비밀번호 없이 원격 서버에 접속 할 수 있습니다.  
하지만, 위에 `SSH 키`를 만드는 과정에서 비밀번호를 입력 시, 해당 `SSH 키`를 사용할 때마다 `SSH 키` 비밀번호를 입력해야합니다.

`ssh-agent`를 사용하면 해당 정보를 캐싱해서 메모리에 담아두기 때문에 비밀번호를 다시 치지 않아도 됩니다.

> 비밀번호가 없다면 사실상 ssh-agent는 무의미 합니다.

### ssh-agent 등록

- `ssh-agent`를 실행합니다.

```zsh
eval "$(ssh-agent -s)"
```

```zsh
ssh-add -t 4w ~/.ssh/id_rsa_jojiapp # 위에서 생성한 SSH 개인키
```

- `ssh-agent`에 개인키를 등록합니다.
  - `-t` 옵션을 통해 기간을 설정 할 수 있으며, 기본 단위는 `초(second)`입니다.
  - `분(m)`, `시(h)`, `일(d)`, `주(w)` 단위로 설정할 수 있습니다.
  - 생략 시, 기본값은 무제한입니다.

```zsh
Identity added: /Users/jojiapp/.ssh/id_rsa_jojiapp (jojiapp@gmail.com)
Lifetime set to 2419200 seconds
```

비밀번호를 입력하면 위와 같이 4주 시간에 맞춰 생성되었을을 알 수 있습니다.

### ssh-agent 영구 등록 (MacOS)

`ssh-agent`는 메모리에 값이 올라가기 때문에, 재부팅 시 모든 값들이 날라가게 됩니다. 그렇기 때문에 재부팅 시에 `ssh-agent`에 키를 다시 등록해주어야 합니다.

`MacOS`에서는 `--apple-use-keychain` 옵션으로 `키 체인`에 해당 `SSH 키`를 등록해두면 재부팅 시 다시 키를 등록하지 않아도 사용할 수 있습니다.

> 기존의 `-K` 옵션이 `--apple-use-keychain` 옵션으로 변경되었습니다.

```zsh
ssh-add --apple-use-keychain ~/.ssh/id_rsa_jojiapp
```

- `ssh-agent`가 해당 키 체인을 사용할 수 있도록 `~/.ssh/config` 파일에 추가합니다.

```shell
Host *
        UseKeychain yes
        AddKeysToAgent yes
        IdentityFile ~/.ssh/id_rsa_jojiapp
        # IdentityFile ~/.ssh/id_rsa_other
```

> 해당 `SSH 키`를 최초로 사용하는 시점에 `ssh-agent`에 자동 등록 됩니다.

### ssh-agent 조회

- `-l` 옵션을 주면 됩니다.

```zsh
ssh-add -l
```

### ssh-agent 삭제

- `-d`옵션을 주고 삭제할 개인키 경로를 적어주면 됩니다.

```zsh
ssh-add -d ~/.ssh/id_rsa_jojiapp
```

- 전체 개인키를 삭제하려면 `-D`옵션을 주면 됩니다.

```zsh
ssh-add -D
```

## GitHub 공개키 등록

SSH 인증방식은 `로컬에 있는 개인키`와 `GitHub(원격저장소)에 있는 공개키`를 이용해 인증을 처리하는 방식이기 때문에 Github(원격저장소)에 공개키를 등록해 주어야 합니다.

![GitHub Settings](/data/blog/Git/GitHub_SSH_연결/screenshot1.png)

![GitHub SSH and GPG keys](/data/blog/Git/GitHub_SSH_연결/screenshot2.png)

![GitHub New SSH Keys](/data/blog/Git/GitHub_SSH_연결/screenshot3.png)

- Title: 해당 키 값을 구별할 수 있는 자신이 원하는 제목을 넣으면 됩니다.
- Key: 공개키를 넣어주면 됩니다.

```zsh
pbcopy <~/.ssh/id_rsa_jojiapp.pub # 공개키를 클립보드에 복사합니다.
```

### SSH로 사용하기

![GitHub SSH 사용하기](/data/blog/Git/GitHub_SSH_연결/screenshot4.png)

SSH로 선택 후, 해당 값을 복사하여 사용하면 됩니다.

## GitHub 계정 여러 개 사용하기

SSH 키 마다 계정을 매핑 시켜 사용할 수 있습니다.

> 이 경우, SSH Key의 이름을 id_rsa로 두기보단 특정 이름으로 지어주는것이 좋습니다.

### config 파일 추가

```zsh
vi ~/.ssh/config
```

```shell
Host github.com-jojiapp
        HostName github.com
        IdentityFile ~/.ssh/id_rsa_jojiapp
        User jojiapp
```

- `Host`: github.com-사용할 이름
- `HostName`: 원격저장소 이름
- `IdentityFile`: ssh-key 파일 경로
- `User`: GitHub 계정 이름

> GitHub계정에 따라 여러 개를 작성해주면 됩니다.

### 사용 방법

```zsh
git clone git@{Host}:{username}/{repository}.git
```

```zsh
git clone git@github.com-jojiapp:jojiapp/jojiapp.github.io.git
```

Git에서 복사 후 `github.com` 뒤에 `Host`에서 작성 한대로 `-jojiapp(사용할 이름)`을 추가해주면 됩니다.

## GitHub Commit 기록이 남지 않을 때

SSH를 이용하여 연결 후, 작업을 하고 푸쉬를 했는데 `GitHub Commit` 기록이 남지 않는 경우가 있습니다.

대부분의 경우 GitHub의 이메일과 로컬에서 사용중인 이메일이 달라서 생기는 이슈입니다.

### 이메일 확인

```zsh
Author: 조지헌 <jojiapp@jojiheon-ui-MacBookPro.local>
```

`git log`를 찍어보면 이메일 정보가 이상하게 되어있습니다.

위와 같다면 GitHub의 이메일과 다르기 때문에 Commit 기록이 남지 않는것 입니다.

> global로 설정 된 이메일이 있다면 해당 값을 사용하지만 설정하지 않았다면 위 처럼 나옵니다.

### 해결 방법

```zsh
git config user.email jojiapp@gmail.com
```

여러 개의 계정을 사용중일 경우 위 처럼 각 프로젝트마다 어떤 이메일을 사용하는지 설정해 주면 됩니다.

> global로 설정한 이메일보다 우선순위가 높습니다.

---

## 참고 사이트

- [SSH를 사용하여 Git 리포지토리 연결](https://docs.microsoft.com/ko-kr/azure/devops/repos/git/use-ssh-keys-to-authenticate?view=azure-devops)
- [github 접속을 https에서 ssh 접속으로 변경하기](https://velog.io/@igotoo/github-%EC%A0%91%EC%86%8D%EC%9D%84-https%EC%97%90%EC%84%9C-ssh-%EC%A0%91%EC%86%8D%EC%9C%BC%EB%A1%9C-%EB%B3%80%EA%B2%BD%ED%95%98%EA%B8%B0)
- [GitHub ssh key 생성하고 등록하고 사용하기](https://syung05.tistory.com/20)
- [맥북에서 GitHub 계정 여러개 사용하는 방법](https://somjang.tistory.com/entry/%EB%A7%A5%EB%B6%81%EC%97%90%EC%84%9C-GitHub-%EA%B3%84%EC%A0%95-%EC%97%AC%EB%9F%AC%EA%B0%9C-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)
- [SSH Keygen을 이용한 키 생성 방법과 ssh-agent에 대한 간단 설명](https://devlog.jwgo.kr/2019/04/17/ssh-keygen-and-ssh-agent/)
- [ssh-agent 가 private key 를 캐싱할 수 있도록 등록해 주는 ssh-add 명령어 사용법](https://www.lesstif.com/lpt/ssh-agent-private-key-ssh-add-123338804.html)
- [Mac 에서 ssh-agent 사용하기](https://lazyker.tistory.com/15)
- [How can I permanently add my SSH private key to Keychain so it is automatically available to ssh?](https://apple.stackexchange.com/questions/48502/how-can-i-permanently-add-my-ssh-private-key-to-keychain-so-it-is-automatically)
