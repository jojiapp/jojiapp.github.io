---
title: QueryDSL Support Custom 하기
date: '2022-05-15'
tags: ['TIL', 'Java', 'JPA', 'QueryDSL']
draft: false
summary: QueryDSL Support Custom 하기
---

# QueryDSL Support Custom 하기

> 해당 내용은 `[인프런] 김영한님의 실전! QueryDSL`에 있는 내용을 기반으로 추가 작성하였습니다.

## build.gradle

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'com.querydsl:querydsl-jpa'
    annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jpa"
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

## QueryDSL Support 확장하기

```java

@Getter(value = AccessLevel.PROTECTED)
public abstract class QueryDslSupport {

	private final Class<?> domainClass;

	private JPAQueryFactory queryFactory;
	private Querydsl querydsl;

	public QueryDslSupport(Class<?> domainClass) {
		notNull("domainClass", domainClass);
		this.domainClass = domainClass;
	}

	@Autowired
	public void setEntityManager(EntityManager entityManager) {
		val jpaEntityInformationSupport = JpaEntityInformationSupport.getEntityInformation(domainClass, entityManager);
		val resolver = SimpleEntityPathResolver.INSTANCE;
		val path = resolver.createPath(jpaEntityInformationSupport.getJavaType());

		querydsl = new Querydsl(entityManager, new PathBuilder<>(path.getType(), path.getMetadata()));
		queryFactory = new JPAQueryFactory(entityManager);
	}

	protected <T> JPAQuery<T> select(Expression<T> expr) {
		return getQueryFactory().select(expr);
	}

	protected <T> JPAQuery<T> selectFrom(EntityPath<T> from) {
		return getQueryFactory().selectFrom(from);
	}

	protected <T> JPADeleteClause delete(EntityPath<T> path) {
		return getQueryFactory().delete(path);
	}

	protected <T> JPAUpdateClause update(EntityPath<T> path) {
		return getQueryFactory().update(path);
	}

	protected <T> boolean exists(Function<JPAQuery<Integer>, JPAQuery<T>> query) {
		return query.apply(getQueryFactory().selectOne())
				.fetchFirst() != null;

	}

	protected <T> Page<T> applyPagination(
			Pageable pageable,
			Supplier<JPAQuery<T>> contentQuery,
			Supplier<JPAQuery<Long>> countQuery
	) {

		val content = getQuerydsl()
				.applyPagination(pageable, contentQuery.get())
				.fetch();

		return PageableExecutionUtils.getPage(content, pageable, countQuery.get()::fetchOne);
	}

	protected <T> Slice<T> applySlicing(Pageable pageable, Supplier<JPAQuery<T>> query) {
		val contents = querydsl
				.applySorting(
						pageable.getSort(),
						query.get()
								.offset(pageable.getOffset())
								.limit(pageable.getPageSize() + 1)
				)
				.fetch();

		var hasNext = false;
		if (contents.size() > pageable.getPageSize()) {
			hasNext = true;
			int lastIndex = contents.size() - 1;
			contents.remove(lastIndex);
		}
		return new SliceImpl<>(contents, pageable, hasNext);
	}

}
```

- `exists`, `applySlicing` 부분을 추가하였습니다.
- `Function` 대신 `Supplier`를 사용한 이유는 이미 상속 받은 클래스에서 `getQueryFactory` 및 `select`, `selectFrom` 메소드를 바로 사용할 수 있기 때문에 굳이
  파라미터로 넘겨줄 필요가 없다고 생각했습니다.

> `fetchResults`, `fetchCount`가 `Deprecated`되었습니다.
>
> `fetchCount`의 `select` 구문을 단순히 `count`처리하는 용도로 바꾸는 정도이기 떄문에 `단순한 Query`에서는 잘 동작하나, `복잡한 Query`에서는 정상적으로 동작하지 않습니다.
> 그렇기 때문에 별도로 `count Query`를 작성해야 해야합니다.
