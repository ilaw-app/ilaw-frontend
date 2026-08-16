# 프론트엔드 → 백엔드 요청 사항

> 상태: 2026-08-16 기준 **요청했던 항목 모두 BE 반영 완료.** 아래는 이력 + 프론트에서 후속 정리할 것.

## ✅ 완료된 요청 (BE 반영됨)
- **Q&A 목록에 `imageUrls` 포함** — `GET /qna` 목록 응답에 추가됨 (커밋 `cc221d8`).
  - → 프론트 `QnaList.tsx`의 썸네일 N+1 보강 로직 **제거 가능**.
- **`GET /community/my-posts`** — 내가 쓴 글만 반환 (커밋 `c8efdeb`).
  - → 프론트 `MyCommunityPosts.tsx`의 상세 조회 스캔(최대 60요청) **1요청으로 대체 가능**.
- **커뮤니티 신고·블라인드** — report 엔드포인트 + 댓글 `status` 마스킹(욕설/신고누적/삭제).
- **OAuth, /qna, AI 상황진단 계약**(agency/hotline, crisis, history 5) — 이미 일치.

## 🟡 로컬 개발용 CORS 허용
- BE가 CORS를 "설정된 origin만 허용"으로 바꾸면서(`b7cf500`), **`http://localhost:5173`(및 프리뷰 `4173`)이 차단**되어 로컬에서 실제 API로 개발/테스트가 안 됩니다.
- **요청**: `CORS_ORIGINS` 환경변수에 `http://localhost:5173`, `http://localhost:4173` 추가.
- 참고: 배포 프론트 `https://i-law-web.vercel.app`는 이미 허용됨(정상).

## 📌 열린 항목 (선택)
- 가려진 댓글: BE가 `content`를 안내문으로 바꿔 내려주지만 **별도 플래그(`masked`/`status`)는 안 줌**. 프론트가 안내문 문자열로 감지 중(취약). `masked: boolean` 한 필드만 응답에 넣어주면 프론트가 견고해짐.

## ℹ️ 요청 불필요
- **변호사 답변 데이터**: 우리가 의도적으로 넣은 프론트 정적 데이터.
