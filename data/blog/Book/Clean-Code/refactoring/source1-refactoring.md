---
title: '[Clean Code] 클린코드 스터디 - 소스 1 리팩토링'
date: '2022-08-13'
tags: ['Clean Code', Refactoring]
draft: false
summary: '클린코드 스터디 - 소스 1 리팩토링'
---

# [Clean Code] 클린코드 스터디 - 소스 1 리팩토링

이번에 하고 있는 클린 코드 스터디에서 아래와 같은 소스를 리팩토링 해보기로 하였습니다.

> 아래 코드는 [Github](https://github.com/jojiapp/clean-code-study)에 올려두었습니다.

- 원본 소스

```java
class myFile implements Comparable<myFile> {
	private String name;
	private String ext;
	private int isNotExist;

	myFile(String name, String ext) {
		this.name = name;
		this.ext = ext;
	}

	public void setIsNotExist(int x) {
		this.isNotExist = x;
	}

	public String getName() {
		return this.name;
	}

	public String getExt() {
		return this.ext;
	}

	public int getIsNotExist() {
		return this.isNotExist;
	}

	@Override
	public int compareTo(myFile o) {
		if (this.name.compareTo(o.getName()) != 0)
			return this.name.compareTo(o.getName());
		if (this.isNotExist != o.getIsNotExist())
			return this.isNotExist - o.getIsNotExist();
		return this.ext.compareTo(o.getExt());
	}
}

public class Main {
	public static void main(String[] args) throws IOException {
		BufferedReader bf = new BufferedReader(new InputStreamReader(System.in));
		String[] parse;
		List<myFile> li = new ArrayList<>();
		Map<String, String> eSet = new HashMap<>();
		parse = bf.readLine().split(" ");
		int n = Integer.parseInt(parse[0]);
		int m = Integer.parseInt(parse[1]);
		for (int i = 0; i < n; i++) {
			parse = bf.readLine().split("\\.");
			li.add(new myFile(parse[0], parse[1]));
		}
		for (int i = 0; i < m; i++) {
			String ext = bf.readLine();
			eSet.put(ext, "");
		}
		for (int i = 0; i < n; i++) {
			if (eSet.containsKey(li.get(i).getExt()))
				li.get(i).setIsNotExist(0);
			else
				li.get(i).setIsNotExist(1);
		}
		Collections.sort(li);
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < n; i++) {
			String name = li.get(i).getName();
			String ext = li.get(i).getExt();
			sb.append(name + "." + ext + "\n");
		}
		System.out.println(sb.toString());
	}
}
```

- 리팩토링 소스

```java
public class Main {

	private static final String WHITE_SPACE = " ";

	public static void main(String[] args) throws IOException {
		final BufferedReader bf = getBufferedReader();
		final int[] lineNumbers = getLineNumbers(bf);

		final MyFiles myFiles = MyFiles.builder()
				.filenameList(readLines(bf, getFilenameLineCount(lineNumbers)))
				.extList(readLines(bf, getExtLineCount(lineNumbers)))
				.build();
		System.out.println(myFiles);
	}

	private static int getExtLineCount(int[] lineNumbers) {
		return lineNumbers[1];
	}

	private static int getFilenameLineCount(int[] lineNumbers) {
		return lineNumbers[0];
	}

	private static BufferedReader getBufferedReader() {
		return new BufferedReader(new InputStreamReader(System.in));
	}

	private static int[] getLineNumbers(BufferedReader bf) throws IOException {
		return Arrays.stream(bf.readLine().split(WHITE_SPACE))
				.mapToInt(Integer::valueOf)
				.toArray();
	}

	private static List<String> readLines(BufferedReader bf, int lineNumber) {
		return IntStream.of(lineNumber)
				.mapToObj(__ -> readLine(bf))
				.toList();
	}

	private static String readLine(BufferedReader bf) {
		try {
			return bf.readLine();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
}
```

```java
public class MyFiles {

	private static final String NEXT_LINE = "\n";
	private final List<MyFile> myFileList;

	@Builder
	private MyFiles(final List<String> filenameList, final List<String> extList) {
		this.myFileList = filenameList.stream()
				.map(filename -> MyFile.builder()
						.filename(filename)
						.extList(extList)
						.build()
				)
				.toList();
	}

	@Override
	public String toString() {
		return this.myFileList.stream()
				.sorted()
				.map(MyFile::toString)
				.collect(joining(NEXT_LINE));
	}
}
```

```java
public class MyFile implements Comparable<MyFile> {
	private static final String DOC = "\\.";
	private final String name;
	private final String ext;
	private final Boolean isContainExt;

	@Builder
	private MyFile(final String filename, final List<String> extList) {
		this.name = getName(filename);
		this.ext = getExt(filename);
		this.isContainExt = extList.contains(this.ext);
	}

	private static String getName(final String filename) {
		return split(filename)[0];
	}

	private static String getExt(final String filename) {
		return split(filename)[1];
	}

	private static String[] split(final String filename) {
		return filename.split(DOC);
	}

	@Override
	public int compareTo(final MyFile myFile) {
		if (!this.name.equals(myFile.name))
			return this.name.compareTo(myFile.name);
		if (!this.isContainExt.equals(myFile.isContainExt)) {
			return this.isContainExt.compareTo(myFile.isContainExt);
		}
		return this.ext.compareTo(myFile.ext);
	}

	@Override
	public String toString() {
		return "%s.%s".formatted(this.name, this.ext);
	}

}
```

- `최대한 함수를 작은 단위`로 나눠서 `작성`했습니다.
- `split`의 경우 `split`을 하는 과정이 중복되기 때문에 조금 고민하였으나,  
  그래도 `메소드 이름을 통해 명확히 어떤 행위`를 하는건지 나타내는 것이 더 좋을 것 같아 각각 메소드로 추출하였습니다.
- 추후 파일이 추가될 가능성을 고려하여 `MyFiles`라는 일급컬렉션 객체로 리스트를 `Wrapping` 하였습니다.
- `내려가기 규칙`을 적용하기 위해 아래로 들어갈수록 세부 내용이 나오도록 하였습니다. (`MyFiles` -> `MyFile`)
- `Main` 메소드에서 파일을 읽는 작업을 하는 것보다 `BufferedReader`를 받는 클래스를 만들어 사용하는 것이 더 좋지 않을까 생각도 하였지만,  
  파일 읽기 작업은 일회성이므로 별도의 클래스로 구성하지 않았습니다.

## 마치며

현재 3장까지 읽고 진행한 것인데도 예전 보다 훨씬 가독성 좋은 코드를 만들 수 있게 된거 같습니다.

확실히 함수를 작은 단위로 추출하여 사용하니 중복된 코드들이 줄어든다는 느낌이 들었습니다.

하지만 여전히 `네이밍`은 어렵고 어딘가 더 깔끔하게 만들수 있을것 같은 느낌이 드는것으로 보아 연습을 많이 해야할 것 같습니다.

## 참고 사이트

- [원본 파일 예제 소스 링크](https://github.com/cdog-gh/gh_coding_test/blob/main/2/1/gh_sol.java)
