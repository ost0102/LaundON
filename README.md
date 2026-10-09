# LaundON

무인 코인세탁소의 세탁기/건조기 상태를 실시간으로 확인하고, LLM 기반 AI 세탁 도우미(Tool Calling + RAG)에게 자연어로 질문할 수 있는 서비스. 실제 IoT 장비 대신 PostgreSQL에 저장된 Mock 데이터로 전체 서비스를 완성. 아키텍처 전체 설명은 [docs/architecture.md](docs/architecture.md) 참고.

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. PostgreSQL 준비

로컬 Postgres가 떠 있어야 한다 (Docker, 네이티브 설치 등 무엇이든 상관없다). `.env`에 연결 정보를 채운다 (`.env.example` 참고):

```bash
DATABASE_URL="postgresql://postgres:devpassword123@localhost:5432/laundry_now?schema=public"
```

DB와 스키마를 만든 뒤, 마이그레이션과 시드(세탁소 5곳 + 코스 + FAQ + AI 지식문서 9개 + 관리자 계정)를 적용한다:

```bash
npx prisma migrate dev
npx prisma db seed
```

### 3. 환경변수 채우기

`.env.local`에 (`.env.example` 참고):

```bash
AUTH_SECRET=아무-긴-랜덤-문자열       # 세션 쿠키 서명용
GEMINI_API_KEY=발급받은-키            # aistudio.google.com/apikey, 무료
```

AI 챗봇(Tool Calling + RAG)을 쓰려면 Gemini API 키가 필요하다. `OPENAI_API_KEY`는 Provider를 OpenAI로 바꿀 때만 쓰인다(기본은 Gemini).

### 4. AI 지식문서 임베딩 생성

시드된 9개 문서(세탁기 사용법, 소재별 세탁법, 환불 정책 등)를 벡터 검색이 되게 하려면 관리자 로그인 후 한 번 호출한다:

```bash
curl -X POST http://localhost:3000/api/embeddings \
  -H "Content-Type: application/json" \
  -b "<로그인 응답의 쿠키>" -d '{}'
```

(관리자 계정: `admin@laundon.app` / `Admin1234!` - 시드 스크립트가 만든다.)

### 5. 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속. 일대의 세탁소 5곳이 DB에 들어있다. `/ai`에서 AI 세탁 도우미와 대화할 수 있다.

### 회원가입 이메일 인증

회원가입 시 이메일로 인증번호를 받아야 가입이 완료된다. SMTP를 설정하지 않으면 실제 메일을 보내는 대신 화면에 인증번호를 바로 띄워주는 Mock 모드로 동작한다 (로컬 개발 시 기본값).

실제 이메일로 받고 싶다면 `.env.local`에 기존에 쓰는 메일 계정 정보를 채운다 (Gmail 예시):

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=you@gmail.com
SMTP_PASS=앱 비밀번호 16자리   # Google 계정 > 보안 > 2단계 인증 > 앱 비밀번호
EMAIL_FROM=you@gmail.com
```

기존 메일함을 그대로 발신 계정으로 쓰기 때문에 도메인 인증 없이 **사용자가 입력한 어떤 이메일로도** 바로 발송된다. Naver를 쓴다면 `smtp.naver.com`으로 바꾸고 네이버메일 설정에서 POP3/SMTP 사용을 켜야 한다 (`.env.example`에 두 예시 모두 적어뒀다).

## 구조

```
prisma/
├── schema.prisma        # User/Laundromat/Machine/LaundryProgram/Document/
│                         #   DocumentChunk/Embedding/FAQ/ChatSession/ChatMessage
└── seed.ts               # 세탁소 5곳 + 코스 + FAQ + AI 지식문서 + 관리자 계정

src/
├── app/
│   ├── ai/                        # AI 챗봇 화면
│   ├── stores/[storeId]/          # 세탁소 상세
│   └── api/
│       ├── stores/, machines/     # 세탁소/기기 조회 + 시작/종료
│       ├── ai/chat/, ai/search/   # AI 챗봇, RAG 직접 검색
│       ├── documents/, embeddings/ # AI 지식문서 등록/임베딩 생성 (관리자)
│       └── admin/                 # 세탁소/기기/코스/FAQ/채팅로그 관리 (관리자)
├── components/
│   ├── ai/                        # 챗봇 UI
│   └── machines/, stores/, ui/, providers/
├── hooks/                         # React Query 훅 (useChat 포함)
├── lib/
│   ├── ai/                        # LlmProvider 추상화, Tool Calling, 챗 오케스트레이션
│   │   └── tools/                 # realtime(DB 조회) / knowledge(RAG) Tool - 코드로 분리
│   ├── rag/                       # EmbeddingProvider/VectorStore 추상화, 청킹, 인덱싱
│   ├── services/iot/              # IotService 인터페이스 - 실제 IoT 연동 시 교체 지점
│   ├── auth/                      # 세션 토큰, 관리자 권한 가드
│   ├── db/                        # Prisma Client 싱글턴
│   └── machine.ts, time.ts 등      # 순수 로직
├── services/                      # fetch 기반 API 클라이언트
├── stores/                        # Zustand - UI 전역 상태만 보관
├── types/                         # 타입 정의
└── mocks/                         # geo 기반 가상 세탁소 생성기(데모용), 이메일 인증 코드
```

## 설계 메모

- **남은 시간 계산**: 서버가 주는 `estimatedEndAt`을 기준으로 `useNow()`가 1초마다 트리거하는 재계산(`computeLiveState`)으로 카운트다운을 표시한다. 단순 `setInterval` 감소가 아니라 항상 "현재 시각 - 종료 예정 시각"을 다시 계산하므로 드리프트가 없다.
- **RUNNING → COMPLETED 전환**: DB는 원격 IoT 센서가 아직 확인하지 못한 상황을 흉내내기 위해 카운트다운이 0이 되어도 `RUNNING`을 계속 보고한다. 프론트엔드(`computeLiveState`)가 남은 시간 0을 기준으로 화면에서만 `COMPLETED`로 먼저 보여준다.
- **서버 상태 vs UI 상태**: 기기/세탁소 데이터는 TanStack Query가 소유하고 polling한다. Zustand에는 필터/정렬 선택, 즐겨찾기, 알림 구독처럼 서버에 없는 UI 전용 상태만 둔다.
- **실제 IoT 전환**: 프론트엔드는 `/api/stores/[storeId]/machines` 같은 경로만 알면 된다. `lib/services/iot/index.ts`의 `iotService` 한 줄만 `PrismaIotService`에서 실제 게이트웨이 구현체로 바꾸면 나머지 코드는 전혀 안 바뀐다.
- **AI 챗봇 - 실시간 데이터와 RAG의 분리**: `lib/ai/tools/realtime.ts`(DB 직접 조회)와 `lib/ai/tools/knowledge.ts`(Vector 검색) Tool이 코드 파일로 분리되어 있다. LLM은 기기 상태/남은 시간을 반드시 Tool 결과로만 답해야 하고, Tool에 없는 정보는 "확인할 수 없다"고 답하도록 시스템 프롬프트에 강제한다 (`lib/ai/systemPrompt.ts`).
- **LLM/임베딩 Provider 추상화**: `lib/ai/llmProvider.ts`/`lib/rag/embeddingProvider.ts` 인터페이스 뒤에 Gemini 구현체(기본)와 OpenAI 구현체가 모두 있다. `lib/ai/index.ts`/`lib/rag/index.ts`에서 한 줄만 바꾸면 Provider를 교체할 수 있다.
- **회원가입 이메일 인증**: `/api/auth/signup`은 서버 쪽 인증 기록(`mocks/emailVerification.ts`)을 직접 확인하고, 인증되지 않은 이메일은 거부한다 - 클라이언트가 "인증했다"고 우기는 값은 신뢰하지 않는다. 실제 발송은 `lib/email.ts`(nodemailer + SMTP)가 담당하며 SMTP 환경변수가 없으면 자동으로 화면 표시 Mock으로 폴백한다.
- **Next.js의 route별 모듈 격리**: Next.js는 API route 핸들러를 각각 별도로 번들링하기 때문에, 모듈 최상위에 상태를 두면 route마다 다른 인스턴스가 생겨 공유되지 않는다. DB로 옮기지 않은 나머지 in-memory 상태(이메일 인증 코드, rate limit 버킷)는 전부 `globalThis`에 박아두는 방식으로 이 문제를 피했다.
