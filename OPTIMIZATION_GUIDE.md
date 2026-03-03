# 🚀 Vercel Resource Optimization Guide (ETERNA)

현재 Vercel 대시보드에서 **CPU 사용량(Fluid Active CPU)**과 **이미지 최적화(Image Optimization)** 비용이 임계치를 초과한 상태입니다. ETERNA의 아키텍처(Next.js + Supabase)를 기반으로 한 구체적인 최적화 방안을 정리해 드립니다.

## 1. CPU 사용량 최적화 (Fluid Active CPU)

현재 `app/page.tsx`가 모든 요청마다 서버에서 실행되도록 설정되어 있어 CPU 부하가 매우 높습니다.

### ✅ 해결 방안 1: ISR (Incremental Static Regeneration) 적용
매번 서버에서 새로 렌더링하는 대신, 일정 시간마다 미리 생성된 정적 페이지를 사용하도록 변경합니다.
- **변경 사항**: `export const dynamic = "force-dynamic"` 제거 및 `revalidate` 설정.
- **효과**: 서버 연산 횟수를 획기적으로 줄여 CPU 사용량을 낮춥니다.

### ✅ 해결 방안 2: 데이터베이스 레벨 필터링
현재는 모든 상품 데이터를 가져온 후 자바스크립트 메모리에서 필터링하고 있습니다. 데이터가 많아질수록 서버 부하가 기하급수적으로 늘어납니다.
- **변경 사항**: Supabase 쿼리(`where` 절)에서 카테고리 필터링 직접 수행.
- **효과**: 전송 데이터량 감소 및 서버 연산 속도 향상.

### ✅ 해결 방안 3: 방문자 추적 최적화
현재 서버 컴포넌트가 렌더링될 때마다 `incrementVisitor`를 실행하고 있어 페이지 로딩 시 서버 리소스를 점유합니다.
- **변경 사항**: 클라이언트 측(`useEffect`)에서 해당 API를 호출하거나 Vercel Analytics 활용.
- **효과**: 메인 페이지 렌더링 성능 향상.

---

## 2. 이미지 최적화 (Image Optimization)

Vercel의 무료 플랜은 월 5,000개의 이미지 변환만 무료입니다. 현재 5,600건으로 초과 상태입니다.

### ✅ 해결 방안 1: unoptimized 설정 확인
`next.config.mjs`에 `unoptimized: true`가 설정되어 있으나, 배포가 되지 않았거나 일부 컴포넌트에서 무시될 수 있습니다.
- **조치**: 모든 `next/image` 컴포넌트가 설정값을 따르는지 확인하고 다시 배포합니다.

### ✅ 해결 방안 2: 외부 이미지 CDN 활용 (Supabase Storage)
Vercel 서버에서 이미지를 리사이징하는 대신, Supabase Storage의 자체 최적화 기능을 활용합니다.
- **방법**: 이미지 URL 뒤에 `?width=400&quality=75` 등의 파라미터를 붙여 원본 대신 최적화된 주소를 바로 호출합니다.

---

## 3. 구조적 개선 권장안 (Summary)

| 항목            | 현재 상태               | 최적화 후                  |
| :-------------- | :---------------------- | :------------------------- |
| **렌더링 방식** | Dynamic (Every Request) | ISR (Background Refresh)   |
| **필터링 로직** | In-Memory (JS)          | Database (Supabase Query)  |
| **이미지 처리** | Vercel Optimization     | Client-side Scaling or CDN |
| **방문자 추적** | Server Blocking         | Client Non-blocking        |

## 🛠️ 즉시 적용 가능한 코드 가이드

### `app/page.tsx` 개선 예시
```typescript
// 1. dynamic 강제 대신 ISR 사용 (예: 1시간마다 갱신)
export const revalidate = 3600; 

export default async function HomePage({ searchParams }) {
  // 2. 쿼리 단계에서 필터링 적용
  let query = supabase.from('products').select('*');
  if (categoryParam !== "전체") {
    query = query.eq('category', categoryParam);
  }
  const { data: productsData } = await query;
  // ...
}
```

이 가이드를 바탕으로 코드를 수정하면 Vercel 비용 걱정 없이 원활하게 서비스를 운영하실 수 있습니다. 필요하시면 바로 코드 수정을 진행해 드릴까요?
