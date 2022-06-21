---
title: MacOS Homebrew
date: '2022-01-28'
tags: ['Mac OS', 'Homebrew']
draft: false
summary: Homebrew 설치 및 사용법 알아보기.
---

# [MacOS] Homebrew

> Homebrew는 MacOS용 패키지 관리 앱입니다. Homebrew를 사용하면 보다 쉽게 개발환경을 셋팅할 수 있습니다.  
> 기본적으로는 커맨드라인과 시스템 패키지들을 설치하는데 사용되나, Cask 확장을 통해 GUI 설치에도 사용할 수 있습니다.
>
> MacOS용이지만 Linux 및 Windows의 WSL도 지원하고있습니다.

## Homebrew 설치 (M1)

Homebrew는 [공식사이트](https://brew.sh/index_ko) 에 접속하여 다운로드 받을수 있습니다.

- 아래 스크립트를 터미널에 복사하여 줍니다.

```zsh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- 설치가 완료 되면 안내 메세지가 나옵니다.

```zsh
==> Next steps:
- Add Homebrew to your PATH in /Users/<USER_ID>/.zprofile:
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/<USER_ID>/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
- Run `brew help` to get started
- Further documentation:
    https://docs.brew.sh
```

- 안내에 따라 두 줄을 복사하여 실행합니다.

```zsh
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/<USER_ID>/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

- 설치가 제대로 되었는지 확인합니다.

```zsh
which brew
```

`/opt/homebrew/bin/brew` 경로가 나온다면 정상적으로 설치가 된 것입니다.

## 설치할 패키지 검색 [search]

`Homebrew`를 설치했으면, 이제 패키지를 설치할 수 있습니다. 하지만 모든 패키지를 설치할 수 있는것도 아닐 뿐더러, 해당 이름으로 등록된 패키지가 하나가 아닐 수 있습니다.

또한, 정확한 패키지 이름을 모를수도 있습니다.

이럴 때 `search`라는 키워드를 사용하여 검색해 볼 수 있습니다.

```zsh
brew search [패키지이름]
```

### 패키지 검색 예시

- `git` 패키지 검색

```zsh
brew search git
```

```zsh
==> Formulae
bagit                                    git-svn
bash-git-prompt                          git-svn-abandon
bit-git                                  git-test
cgit                                     git-tf
digitemp                                 git-tig
easy-git                                 git-town
git ✔                                    git-tracker
git-absorb                               git-trim
git-annex                                git-url-sub
git-annex-remote-rclone                  git-utils
git-appraise                             git-vendor
git-archive-all                          git-when-merged
git-branchless                           git-xargs
git-bug                                  gitbackup
git-cal                                  gitbatch
git-cinnabar                             gitbucket
git-cliff                                gitfs
git-cola                                 gitg
git-credential-libsecret                 github-keygen
git-credential-manager                   github-markdown-toc
git-crypt                                github-release
git-delta                                gitlab-ci-local
git-extras                               gitlab-gem
git-filter-repo                          gitlab-runner
git-fixup                                gitleaks
git-flow                                 gitless
git-flow-avh                             gitlint
git-fresh                                gitmoji
git-ftp                                  gitql
git-game                                 gitslave
git-gerrit                               gitter-cli
git-gui                                  gitui
git-hooks-go                             gitup
git-hound                                gitversion
git-if                                   gitwatch
git-imerge                               lazygit
git-integration                          legit
git-interactive-rebase-tool              libgit2
git-lfs                                  libgit2-glib
git-multipush                            literate-git
git-now                                  modgit
git-number                               moz-git-tools
git-octopus                              multi-git-status
git-open                                 pass-git-helper
git-plus                                 pygitup
git-quick-stats                          sagittarius-scheme
git-recent                               stgit
git-remote-codecommit                    topgit
git-remote-gcrypt                        ungit
git-remote-hg                            willgit
git-review                               zsh-git-prompt
git-revise                               gist
git-secret                               grt
git-secrets                              gwt
git-series                               gmt
git-sizer                                lit
git-ssh                                  vit
git-standup                              bit
git-subrepo                              pit

==> Casks
adobe-digital-editions     gitfinder                  gitup
deepgit                    gitfox                     gitx
digital                    github                     lego-digital-designer
git-it                     githubpulse                logitech-presentation
gitahead                   gitify                     plotdigitizer
gitblade                   gitkraken                  rowanj-gitx
gitdock                    gitnote                    smartgit
gitee                      gitpigeon                  snagit
giteye                     gitscout                   subgit
gitfiend                   gitter                     webplotdigitizer
```

`git`을 검색해보면 위 처럼 엄청 많은 패키지가 검색 됩니다.

- `✔`가 되어있는 패키지는 설치가 된 패키지 입니다. (저는 `git`을 애전에 설치했습니다.)
- `Formulae`: `CLI` 용 패키지를 가르키는 용어입니다.
- `Casks`: `GUI`용 패키지를 가르키는 용어입니다.

## 패키지 설치 [install]

패키지 설치는 `install` 키워드를 사용하여 할 수 있습니다.

위에서 검색 된 것 중에 자신에게 필요한 패키지를 설치하면 됩니다.

```zsh
brew install [패키지이름]
```

### 패키지 설치 예시

- `git` 패키지 설치

```zsh
brew install git
```

## GUI 패키지 설치 [install --cask]

기존에는 `Chrome`와 같은 `GUI`앱을 받을려면 공식 사이트에 접속하여 받아야합니다.

`Homebrew`에서는 `install` 뒤에 `--cask`옵션을 붙이면 설치가 됩니다.

```zsh
brew install --cask [패키지이름]
```

### GUI 패키지 설치 예시

- 우선 `chrome` 패키지를 검색합니다

```zsh
brew search chrome
```

```zsh
==> Formulae
chrome-cli
chrome-export
chroma
chrony

==> Casks
chrome-devtools
chromedriver
epichrome
mkchromecast
homebrew/cask-versions/google-chrome-canary
chrome-remote-desktop-host
dmm-player-for-chrome
google-chrome ✔
homebrew/cask-versions/google-chrome-beta
homebrew/cask-versions/google-chrome-dev
```

`Casks`에 `google-chrome` 패키지가 저희가 사용하고자 하는 `GUI`앱입니다.

- `chrome` 설치

```zsh
brew install google-chrome --cask
```

```zsh
Running `brew update --preinstall`...
==> Auto-updated Homebrew!
Updated 2 taps (homebrew/core and homebrew/cask).
==> New Formulae
ghcup                                            odo-dev                                          reshape                                          tidy-viewer                                      vermin
==> Updated Formulae
Updated 181 formulae.
==> New Casks
kindavim                                         music-bar                                        panwriter                                        presentation                                     sonic-lineup
==> Updated Casks
Updated 155 casks.
==> Deleted Casks
airqmon                                          hocus-focus                                      mathinspector                                    mediahuman-audio-converter                       soulseek

==> Downloading https://dl.google.com/chrome/mac/universal/stable/GGRO/googlechrome.dmg
Already downloaded: /Users/jojiapp/Library/Caches/Homebrew/downloads/88881e66883c4776fff9b3019b48a26795020439a33ddbedd3bd4620283aecd2--googlechrome.dmg
Warning: No checksum defined for cask 'google-chrome', skipping verification.
==> Installing Cask google-chrome
==> Moving App 'Google Chrome.app' to '/Applications/Google Chrome.app'
🍺  google-chrome was successfully installed!
```

`🍺 google-chrome was successfully installed!` 해당 문구가 나오면 정상적으로 설치 된것입니다.

## 설치된 패키지 확인 [ls]

설치된 패키지 확인은 `ls` 키워드를 통해 할 수 있습니다.

```zsh
brew ls
```

```zsh
==> Formulae
ca-certificates	gettext
git
gradle
icu4c
libevent
lz4
mysql
openjdk
openssl@1.1	pcre2
protobuf
six
zstd

==> Casks
google-chrome
```

> 저는 맥북을 산지 얼마 되지 않아 설치 된게 별로 없습니다.

## 패키지 삭제 [uninstall]

패키지 삭제는 `uninstall` 키워드를 사용하여 할 수 있습니다.

```zsh
brew uninstall [패키지명]
```

### 패키지 삭제 예시

- `google-chrome` 패키지 삭제 예시

```zsh
brew uninstall google-chrome
```

```zsh
==> Uninstalling Cask google-chrome
==> Backing App 'Google Chrome.app' up to '/opt/homebrew/Caskroom/google-chrome/97.0.4692.99/Google Chrome.app'
==> Removing App '/Applications/Google Chrome.app'
==> Purging files for version 97.0.4692.99 of Cask google-chrome
```

`--cask` 옵션을 사용하여 설치했어도 위와 같이 삭제하면 됩니다.

## 패키지 삭제 이후 잔여 파일 삭제 [cleanup]

패키지를 삭제해도 잔여 파일이 남아있을 수 있습니다.

이 부분은 `cleanup`키워드를 사용하여 할 수 있습니다.

```zsh
brew cleanup
```

위와 같이 작성하면 설치 되어 있는 패키지 외에 잔여 파일을 모두 삭제합니다.

## 업데이트가 필요한 패키지 확인 [update]

어떤 패키지가 업데이트가 가능한지 확인은 `update` 키워드를 사용하여 할 수 있습니다.

```zsh
brew update
```

위와 같이 작성하면 설치된 패키지 전체에 대하여 업데이트가 가능한 패키지는 `✔`되어 있습니다.

## 업데이트 될 버전 확인 [outdated]

`update`키워드를 통해 업데이트가 가능한 패키지를 확인 할 수 있었습니다.

`outdated` 키워드를 사용하면 어떤 버전으로 업데이트 되는지 알 수 있습니다.

```zsh
brew outdated
```

위와 같이 작성하면 업데이트 가능한 패키지들에 대하여 어떤 버전으로 업데이트를 할 수 있는지 확인할 수 있습니다.

## 패키지 업데이트 [upgrade]

`update`키워드는 어떤 패키지가 업데이트가 가능한지 여부 판별입니다.

최신 버전으로 업데이트 하기 위해서는 `upgrade` 키워드를 사용하여 할 수 있습니다.

```zsh
brew upgrade
```

위와 같이 작성하면 전체 패키지에 대하여 최신 버전으로 유지합니다.

---

## 참고 사이트

- [홈브류(Homebrew)란?](https://www.44bits.io/ko/keyword/homebrew)
- [애플 실리콘 M1 용 Homebrew 설치](https://www.lainyzine.com/ko/article/how-to-install-homebrew-for-m1-apple-silicon/)
- [Homebrew를 사용해서 Mac 패키지를 관리하기](https://tutorialpost.apptilus.com/code/posts/tools/homebrew-for-mac/)
- [[Homebrew] brew 명령어 모음집](https://sukvvon.tistory.com/7)
- [apt/yum/brew 등 패키지관리자의 update와 upgrade의 차이](https://blog.jojonari.dev/entry/aptyumbrew-%EB%93%B1-%ED%8C%A8%ED%82%A4%EC%A7%80%EA%B4%80%EB%A6%AC%EC%9E%90%EC%9D%98-update%EC%99%80-upgrade%EC%9D%98-%EC%B0%A8%EC%9D%B4)
