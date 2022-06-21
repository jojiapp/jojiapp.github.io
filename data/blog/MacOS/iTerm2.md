---
title: MacOS iTerm2
date: '2022-01-29'
tags: ['Mac OS', 'Homebrew']
draft: false
summary: iTerm2와 oh my zsh를 사용하여 터미널을 커스텀.
---

# [MacOS] iTerm2

> 맥북에 기본적으로 설치 된 터미널은 v10.15(카탈리나)이후 부터 zsh 쉘을 기본적으로 사용할 수 있습니다.  
> 하지만, iTerm2를 설치하면 더 다양한 기능과 커스텀을 할 수 있으므로 iTerm2를 설치하여 터미널을 이쁘게 꾸며보겠습니다.

## iTerm2 설치

- `iterm`을 `homebrew`를 통해 검색합니다.

```zsh
brew search iterm
```

```zsh
==> Formulae
term                xterm               dterm               aterm

==> Casks
iterm2
```

- 이 중 `Casks`의 `iterm2`를 설치하면 됩니다.

```zsh
brew install --cask iterm2
```

## 기본적인 터미널 커스텀

### 테마 설정

- `Preferences` -> `Appearance` -> `theme`를 `Minimal`로 변경 (자신이 원하는 걸로 하면 됩니다.)

![Preferences Appearance](/data/blog/MacOS/iTerm2/appearance_general_screenshot.png)

### 상태 바 설정

- `Preferences` -> `Profiles` -> `Session` -> `Status bar enabled 체크` -> `Configure Status Bar`

![Profiles Session Status bar enabled](/data/blog/MacOS/iTerm2/profiles_session_screenshot1.png)

- 원하는 기능들을 `밑으로 드래그` -> 하단의 `Auto-Rainbow에서 원하는 색상 입히기`

![Profiles Session Status bar Configuration](/data/blog/MacOS/iTerm2/profiles_session_screenshot2.png)

- 터미널 상단에 보면 이쁘게 기능들이 추가되어 있습니다.

![Terminal Status bar](/data/blog/MacOS/iTerm2/profiles_session_screenshot3.png)

### 컬러 설정

- [iterm2colorschemes](https://iterm2colorschemes.com/) 에 접속 하여 `원하는 컬러를 선택`

![Github Dark Color Schemes](/data/blog/MacOS/iTerm2/color_schemes_screenshot1.png)

- `저장`

![Save Github Dark Color Schemes](/data/blog/MacOS/iTerm2/color_schemes_screenshot2.png)

- `.txt 제거` -> `.itermcolors 사용` -> `실행`

![Run Github Dark Color Schemes](/data/blog/MacOS/iTerm2/color_schemes_screenshot3.png)

- `Profiles` -> `Colors` -> `오른쪽 하단에서 테마 선택`

![Select Github Dark Color Schemes](/data/blog/MacOS/iTerm2/color_schemes_screenshot4.png)

## oh my zsh

`oh my zsh`을 설치하면 더 다양하게 터미널을 커스텀 할 수 있습니다.

### oh my zsh 설치

`oh my zsh`는 `homebrew`를 통해 설치 할 수 없으므로 [공식사이트](https://ohmyz.sh/) 에 가서 커맨드를 복사해서 붙여 넣어줍니다.

![oh my zsh 공식사이트](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot1.png)

```zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

- 아래와 같이 나오면 정상적으로 설치가 완료된 것 입니다.

![oh my zsh 설치 완료 화면](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot2.png)

### 테마 바꾸기

- [powerlevel10k 사이트](https://github.com/romkatv/powerlevel10k) 접속 -> `installation 클릭` -> `oh-my-zsh 클릭`

![oh my zsh 설치 완료 화면](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot3.png)

1. 위에 적힌대로 `git clone`을 받습니다.

```zsh
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

2. `.zshrc`파일을 열어줍니다.

```zsh
open ~/.zshrc
```

3. `ZSH_THEME` 부분을 찾아 `powerlevel10k/powerlevel10k`로 수정 후 저장합니다.

```zshrc
# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="powerlevel10k/powerlevel10k"

# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in $ZSH/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment one of the following lines to change the auto-update behavior
# zstyle ':omz:update' mode disabled  # disable automatic updates
# zstyle ':omz:update' mode auto      # update automatically without asking
# zstyle ':omz:update' mode reminder  # just remind me to update when it's time

# Uncomment the following line to change how often to auto-update (in days).
# zstyle ':omz:update' frequency 13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# You can also set it to another string to have that shown instead of the default red dots.
# e.g. COMPLETION_WAITING_DOTS="%F{yellow}waiting...%f"
# Caution: this setting can cause issues with multiline prompts in zsh < 5.7.1 (see #5765)
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"
```

4. 다시 터미널을 실행하면 아래와 같이 나옵니다.

> 가운데 보이는 부분이 깨져 보이지 않는다면 `y` 깨져 보인다면 `n`을 적어줍니다.

![powerlevel10k 설정 다이아몬드](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot4.png)
![powerlevel10k 설정 자물쇠](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot5.png)
![powerlevel10k 설정 골뱅이](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot6.png)
![powerlevel10k 설정 컬러](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot7.png)

> 이후, 보기에서 원하는 테마를 선택합니다. (제가 선택한 번호를 적어 두었습니다.)

- `1`

![powerlevel10k 설정 질문 1](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot8.png)

- `1`

![powerlevel10k 설정 질문 1](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot9.png)

- `1`

![powerlevel10k 설정 질문 2](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot10.png)

- `2`

![powerlevel10k 설정 질문 3](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot11.png)

- `2`

![powerlevel10k 설정 질문 4](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot12.png)

- `1`

![powerlevel10k 설정 질문 5](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot13.png)

- `2`

![powerlevel10k 설정 질문 6](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot14.png)

- `4`

![powerlevel10k 설정 질문 7](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot15.png)

- `2`

![powerlevel10k 설정 질문 8](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot16.png)

- `2`

![powerlevel10k 설정 질문 9](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot17.png)

- `1`

![powerlevel10k 설정 질문 10](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot18.png)

- `n`

![powerlevel10k 설정 질문 11](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot19.png)

- `1`

![powerlevel10k 설정 질문 12](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot20.png)

- `y`

![powerlevel10k 설정 질문 13](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot21.png)

- 모든 설정이 끝났습니다. 아래와 같이 이쁘게 커스텀 된걸 볼 수 있습니다.

![powerlevel10k 설정 끝](/data/blog/MacOS/iTerm2/oh_my_zsh_screenshot22.png)

> 다시 설정 하고 싶다면 `p10k configure` 커맨드를 입력하면 됩니다.

---

## 참고 사이트

- [노마드 코더 개발환경 셋팅 유튜브](https://www.youtube.com/watch?v=B26yiuC5zPM&t=463s)
- [터미널 세팅 (Oh my zsh)](https://5d5ng.tistory.com/138)
