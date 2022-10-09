---
title: '[Clean Code] 클린코드 스터디 - 소스 2 리팩토링'
date: '2022-10-09'
tags: ['Clean Code', Refactoring]
draft: false
summary: '클린코드 스터디 - 소스 2 리팩토링'
---

# [Clean Code] 클린코드 스터디 - 소스 2 리팩토링

> 아래 코드는 [Github](https://github.com/jojiapp/clean-code-study/tree/main/src/main/java/com/jojiapp/cleancode/source2)에
> 올려두었습니다.

- 원본 소스

```java
class Card {
    private final String op;
    private final int id;
    private final int resourceName;

    Card(String op, int id, int resourceName) {
        this.op = op;
        this.id = id;
        this.resourceName = resourceName;
    }

    public String getOp() {
        return op;
    }

    public int getId() {
        return id;
    }

    public int getResourceName() {
        return resourceName;
    }
}

/*
manager 안에 state 를 넣음.
manager 가 state 를 가지고 판단하기 때문.
*/
class Manager {
    /*
    manager 바깥에서 game state 의 상태를 변경하지 못하도록 처리함.
    card 덱은 바깥에서 한 번 초기화 하면 여기에서만 변경될 수 있도록 처리.
    */
    private final GameState gs;

    Manager(int peopleNum, Deque<Card> deck) {
        gs = new GameState(peopleNum, deck);
    }

    public int doTurn(int peopleNum) {
        Card curCard = gs.getCurCard(peopleNum);
        switch (curCard.getOp()) {
            case "acquire":
                if (!gs.checkOccupyResource(curCard.getResourceName())) {
                    gs.occupyResource(curCard.getResourceName());
                    gs.discardCard(peopleNum);
                }
                break;
            case "release":
                gs.releaseResource(curCard.getResourceName());
            case "next":
                gs.discardCard(peopleNum);
                break;
        }
        return curCard.getId();
    }

    /*
    game state 는 resource 의 occupy 상태,
    누가 어떤 카드를 들고 있는지, deck 이 들어가 있음.
    */
    static class GameState {
        private final HashSet<Integer> resource = new HashSet<>();
        private final Card[] peopleKeepCard;
        private final Deque<Card> deck;

        GameState(int peopleNum, Deque<Card> deck) {
            this.peopleKeepCard = new Card[peopleNum + 1];
            this.deck = deck;
        }

        public Card getCurCard(int peopleNum) {
            if (peopleKeepCard[peopleNum] == null)
                peopleKeepCard[peopleNum] = deck.pollFirst();
            return peopleKeepCard[peopleNum];
        }

        public void discardCard(int peopleNum) {
            peopleKeepCard[peopleNum] = null;
        }

        public void occupyResource(int resourceNum) {
            resource.add(resourceNum);
        }

        public void releaseResource(int resourceNum) {
            resource.remove(resourceNum);
        }

        public boolean checkOccupyResource(int resourceNum) {
            return resource.contains(resourceNum);
        }
    }
}

class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader bf = new BufferedReader(new InputStreamReader(System.in));
        String[] line = bf.readLine().split(" ");
        int n = Integer.parseInt(line[0]);
        int T = Integer.parseInt(line[1]);
        int[] game = new int[T];
        Deque<Card> cList = new ArrayDeque<>();

        line = bf.readLine().split(" ");
        for (int i = 0; i < T; i++)
            game[i] = Integer.parseInt(line[i]);
        for (int i = 0; i < T; i++) {
            line = bf.readLine().split(" ");
            int id = Integer.parseInt(line[0]);
            if (line[1].compareTo("next") == 0)
                cList.add(new Card(line[1], id, -1));
            else
                cList.add(new Card(line[1], id, Integer.parseInt(line[2])));
        }
        Manager mg = new Manager(n, new ArrayDeque<>(cList));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < T; i++) {
            int peopleNum = game[i];
            int ret = mg.doTurn(peopleNum);
            sb.append(ret).append("\n");
        }
        System.out.println(sb.toString());
    }
}
```

- 리팩토링 소스

```java
public class Main {

    private static final String WHITE_SPACE = " ";

    public static void main(String[] args) {

        final BufferedReader bf = getBufferedReader();
        final String[] metadataLine = getNextLine(bf);

        int[] gameList = createGame(bf);

        final GameState gameState = new GameState(
                getNumberOfParticipants(metadataLine),
                getCardList(bf, getTurn(metadataLine))
        );

        final String result = Arrays.stream(gameList)
                .mapToObj(game -> String.valueOf(gameState.doTurn(game)))
                .collect(Collectors.joining("\n"));

        System.out.println(result);
    }

    private static BufferedReader getBufferedReader() {

        return new BufferedReader(new InputStreamReader(System.in));
    }

    private static Deque<Card> getCardList(final BufferedReader bf, final int turn) {

        final Deque<Card> cardList = new ArrayDeque<>();
        IntStream.range(0, turn)
                .mapToObj(value -> {
                    final String[] line = getNextLine(bf);
                    final ArithmeticCard op = ArithmeticCard.valueOf(line[1]);
                    return new Card(
                            op,
                            getId(line),
                            op == ArithmeticCard.NEXT ? -1 : parseInt(line[2])
                    );
                })
                .forEach(cardList::add);

        return cardList;
    }

    private static int getId(final String[] line) {

        return parseInt(line[0]);
    }

    private static String[] getNextLine(BufferedReader bf) {

        try {
            return bf.readLine().split(WHITE_SPACE);
        } catch (IOException e) {
            throw new IllegalStateException("다음 라인을 읽어올 수 없습니다.", e);
        }
    }

    private static int getNumberOfParticipants(final String[] line) {

        return parseInt(line[0]);
    }

    private static int getTurn(final String[] line) {

        return parseInt(line[1]);
    }

    private static int parseInt(final String str) {

        try {
            return Integer.parseInt(str);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("숫자 타입이 아닙니다.", e);
        }

    }

    private static int[] createGame(final BufferedReader bf) {

        return Arrays.stream(getNextLine(bf))
                .mapToInt(Integer::parseInt)
                .toArray();
    }

}
```

```java
public class GameState {

    private final HashSet<Integer> resource = new HashSet<>();
    private final Card[] peopleKeepCard;
    private final Deque<Card> deck;

    public GameState(final int game, final Deque<Card> deck) {

        this.peopleKeepCard = new Card[game + 1];
        this.deck = deck;
    }

    public int doTurn(int numberOfParticipants) {

        final Card curCard = getCurCard(numberOfParticipants);
        switch (curCard.getOp()) {
            case ACQUIRE -> {
                if (checkOccupyResource(curCard.getResourceName())) {
                    break;
                }
                occupyResource(curCard.getResourceName());
                discardCard(numberOfParticipants);
            }
            case RELEASE -> {
                releaseResource(curCard.getResourceName());
                discardCard(numberOfParticipants);
            }
            case NEXT -> discardCard(numberOfParticipants);
        }

        return curCard.getId();
    }

    private Card getCurCard(final int game) {

        if (peopleKeepCard[game] == null) {
            peopleKeepCard[game] = deck.pollFirst();
        }

        return peopleKeepCard[game];
    }

    private void discardCard(final int game) {

        peopleKeepCard[game] = null;
    }

    private void occupyResource(final int resourceNum) {

        resource.add(resourceNum);
    }

    private void releaseResource(final int resourceNum) {

        resource.remove(resourceNum);
    }

    private boolean checkOccupyResource(int resourceNum) {

        return resource.contains(resourceNum);
    }
}
```

```java
public class Card {

    private final ArithmeticCard op;
    private final int id;
    private final int resourceName;

    public Card(final ArithmeticCard op, final int id, final int resourceName) {

        this.op = op;
        this.id = id;
        this.resourceName = resourceName;
    }

    public ArithmeticCard getOp() {

        return op;
    }

    public int getId() {

        return id;
    }

    public int getResourceName() {

        return resourceName;
    }
}
```

```java
public enum ArithmeticCard {

    NEXT,
    ACQUIRE,
    RELEASE;

}
```

이번에는 대부분 메서드 추출이였습니다.

또한 `Manager`에 있던 `doTurn()` 기능이 `GameState`의 메서드를 가져와 사용하는 것이라
`Manager` 클래스를 없애고 `GameState`로 옮겼습니다.

다른 분이 하신걸 보니 `Card`를 연산 별로 상속 구조로 만들어 푸신걸 봤는데, 상당히 괜찮았습니다.

다음에는 조금 더 객체지향스럽게(?) 리팩토링을 해봐야겠습니다.

## 참고 사이트

- [원본 파일 예제 소스 링크](https://github.com/cdog-gh/gh_coding_test/blob/main/1/5/gh_sol.java)
