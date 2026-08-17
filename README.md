# 아이로 (Airo) — 청소년 법률 도움 웹앱

> 법률 문제를 겪는 청소년이, 변호사 사무실 문턱 없이 자기 상황을 쉬운 말로 물어보고 바로 도움받는 모바일 웹앱.

<!-- 뱃지 자리 (예: build / deploy 상태) -->
<!-- ![build](…) ![deploy](…) -->

---

## 목적

알바비를 떼여도, 학교폭력을 당해도, 청소년은 "어디서 뭘 물어봐야 할지"조차 막막합니다.
**아이로**는 청소년이 자기 상황을 평소 말투로 입력하면, 맞는 법률 정보를 근거로 안내하고 필요한 기관·변호사·핫라인까지 연결해 줍니다.
법을 몰라도, 어른이 없어도 스스로 첫걸음을 뗄 수 있게 하는 것이 목표입니다.

## 데모

- **라이브**: https://i-law-web.vercel.app

<!-- 스크린샷 자리 (넣을 때 아래 주석 해제) -->
<!--
| 홈 | 상황진단 챗봇 | 매뉴얼 |
|---|---|---|
| ![home](docs/screenshots/home.png) | ![chat](docs/screenshots/chat.png) | ![manual](docs/screenshots/manual.png) |
-->

## 주요 기능

- 🤖 **상황진단 AI 챗봇** — 상황을 입력하면 맞는 법률 매뉴얼을 **근거로** 안내하고(RAG), 위기 상황이면 긴급 핫라인을 먼저 띄웁니다.
- 📖 **상황별 법률 매뉴얼** — 9개 카테고리: 노동 · 학교폭력 · 아동학대/가정폭력 · 성폭력 · 온라인폭력 · 금융 · 출생·양육 · 법정대리인 · 학교 밖 청소년.
- ⚖️ **변호사 Q&A** — 궁금한 걸 질문하면 변호사가 직접 답변합니다.
- 💬 **익명 커뮤니티** — 같은 고민을 나누는 글·댓글. 신고·블라인드로 안전하게.
- 📞 **긴급 연락처** — 카테고리별 관할 기관과 핫라인을 한 번에.
- 🔖 **마이페이지** — 스크랩, 내 질문/답변, 내 커뮤니티 글, 알림 설정.
- 🔑 **간편 로그인** — 구글·카카오 계정으로 바로 시작.

## 기술 스택

| 영역 | 사용 기술 | 선택 이유 |
|---|---|---|
| 빌드/런타임 | **Vite 6, React 19, TypeScript** | 빠른 개발 서버·빌드 + 타입 안정성 |
| 라우팅 | **React Router 7** (React.lazy + Suspense) | 화면별 **코드 스플리팅**으로 초기 로딩 최소화 |
| 스타일 | **순수 CSS**(화면별 `.css`, 모바일 퍼스트), **react-icons** | 가볍고 모바일 웹에 최적화 |
| 인증 | **JWT + OAuth**(구글/카카오) | 청소년도 쉬운 간편 로그인 |
| 배포 | **Vercel** | `main` 푸시 시 자동 배포 |
| 백엔드 *(별도 레포 `iLaw-backend`)* | **Express + Prisma + PostgreSQL(pgvector) + OpenAI** | 하이브리드 **RAG**로 매뉴얼 검색·답변 생성. 프론트는 REST API로 통신 |

## 프로젝트 구조

```
airo-web/
├─ public/
│  └─ assets/            # 이미지·아이콘·튜토리얼/매뉴얼 사진
├─ src/
│  ├─ routes/            # 화면 컴포넌트 (Home, Manual*, Qna*, Community*, AiChat, Profile …)
│  ├─ api/               # 백엔드 REST 클라이언트 (ai, auth, manual, qna, community, home,
│  │                     #                          notifications, upload, moderation, client, types …)
│  ├─ components/        # 공용 UI (아이콘, 탭바 등)
│  ├─ context/           # 전역 상태 (AuthContext 등)
│  ├─ utils/             # 헬퍼 (text 등)
│  └─ App.tsx            # 라우팅 + 코드 스플리팅(Suspense)
├─ .env                  # VITE_API_BASE (백엔드 주소)
└─ package.json
```

## 시작하기

**요구사항**: Node.js 18 이상

```bash
# 1) 설치
npm install

# 2) 환경변수 — 프로젝트 루트에 .env
#    VITE_API_BASE=<백엔드(iLaw-backend) 주소>
#    예) VITE_API_BASE=https://ilaw-backend.up.railway.app

# 3) 개발 서버
npm run dev

# 4) 타입 체크 / 프로덕션 빌드 / 빌드 미리보기
npm run typecheck
npm run build
npm run preview
```

> 백엔드 API가 있어야 실제 데이터(매뉴얼·Q&A·챗봇)가 동작합니다. 백엔드는 별도 레포 `iLaw-backend`를 참고하세요.

## 배포

- **Vercel**에 연결되어 있으며, `main` 브랜치에 푸시하면 **자동 배포**됩니다.
- 프로덕션 환경변수(`VITE_API_BASE`)는 Vercel 프로젝트 설정에 등록합니다.

## 로드맵

**완료**
- ✅ 상황진단 AI 챗봇 (RAG 기반, 위기 감지 + 핫라인)
- ✅ 법률 매뉴얼 9개 카테고리 (동적 로딩)
- ✅ 변호사 Q&A / 익명 커뮤니티(신고·블라인드)
- ✅ 긴급 연락처 · 마이페이지(스크랩/내 글) · OAuth 로그인
- ✅ 코드 스플리팅으로 초기 로딩 최적화

**앞으로 (검토 중)**
- ⏳ 챗봇 답변 **스트리밍** 출력
- ⏳ 응답 **지연 개선**
- ⏳ 멀티턴(되묻기) 대화 정식화
- ⏳ 이미지로 상황 인식(계약서·문자 캡처 OCR)?
- ⏳ PWA / 푸시 알림?

## 기여 (Contributing)

1. 새 브랜치에서 작업합니다 (`feat/…`, `fix/…`).
2. 커밋 전 `npm run typecheck`가 통과하는지 확인합니다.
3. 커밋 메시지는 무엇을·왜 바꿨는지 한국어로 명확히 작성합니다.
4. `main` 대상으로 PR을 올리고, 리뷰 후 머지합니다.

## 라이선스

**비공개 (All rights reserved).** 별도 허가 없이 복제·배포·상업적 사용을 금합니다.
