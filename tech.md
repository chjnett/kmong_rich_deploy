# 🏗️ ETERNA - 기술 및 기획 정의서

## 🎯 프로젝트 목표
- 하이엔드 럭셔리 무드의 딥 다크(#000000) 큐레이션 웹사이트 구축.
- 잡지 화보 같은 4:5 비율의 시각적 경험과 모바일 최적화된 인터랙션 제공.

## 🛠️ 기술 스택
- **프레임워크**: Next.js 14+ (App Router)
- **스타일링**: Tailwind CSS, Lucide Icons
- **UI 컴포넌트**: shadcn/ui (Dialog, Drawer, Tabs, Button)
- **백엔드/DB**: Supabase (Auth, Database, Storage)
- **배포**: Vercel

## 📋 핵심 기능 명세
1. **메인**: 중앙 로고 배치 및 '카톡 상담하기' 플로팅 버튼.
2. **카테고리**: 2단계 구조 (대분류 탭 > 소분류 필터).
3. **상품 그리드**: 모든 이미지는 엄격한 **4:5 비율** 유지.
4. **상세 뷰 (Drawer/Modal)**:
   - 모바일: 바텀 시트(Drawer), 데스크톱: 중앙 모달.
   - 구성: 4:5 이미지 갤러리, 상세 스펙(모델명, 소재, 사이즈, 색상), 제품 스토리(Heritage).
   - 기능: 구매 링크 이동, 공유하기(URL 복사), 찜하기(Wishlist).
5. **관리자 모드**: 관리자 로그인 시 상세 뷰에 '수정' 버튼 노출 및 전용 관리 페이지.

## 🗄️ 데이터베이스 스키마 (Supabase)
- `categories`: id, name, order
- `sub_categories`: id, category_id, name
- `products`: id, sub_id, name, img_urls(array), external_url, description, specs(jsonb)
