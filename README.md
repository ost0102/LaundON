# LaundON

무인 코인세탁소의 세탁기/건조기 상태를 실시간에 가깝게 확인할 수 있는 서비스. 실제 IoT 장치 대신 Mock API로 전체 서비스를 완성한다.

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속. 광진구 자양동 일대의 Mock 세탁소 5곳(`store-001`~`store-005`)이 들어있다.

### 회원가입 이메일 인증 (선택)

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
src/
├── app/                 # 라우트 (홈, 세탁소 상세, Mock API route handlers)
├── components/          # UI 컴포넌트 (machines/stores/ui/providers)
├── hooks/               # React Query 훅, useNow(시계 틱)
├── lib/                 # 순수 로직 (시간 계산, 기기 상태/정렬/필터)
├── services/            # fetch 기반 API 클라이언트
├── stores/              # Zustand - UI 전역 상태(필터/정렬/즐겨찾기/알림)만 보관
├── types/                # Machine/Store 타입 정의
└── mocks/                # IoT 서버를 흉내내는 인메모리 Mock 데이터
```

## 설계 메모

- **남은 시간 계산**: 서버가 주는 `estimatedEndAt`을 기준으로 `useNow()`가 1초마다 트리거하는 재계산(`computeLiveState`)으로 카운트다운을 표시한다. 단순 `setInterval` 감소가 아니라 항상 "현재 시각 - 종료 예정 시각"을 다시 계산하므로 드리프트가 없다.
- **RUNNING → FINISHED 전환**: Mock 서버는 원격 IoT 센서가 아직 확인하지 못한 상황을 흉내내기 위해 카운트다운이 0이 되어도 `RUNNING`을 계속 보고한다. 프론트엔드(`computeLiveState`)가 남은 시간 0을 기준으로 화면에서만 `FINISHED`로 먼저 보여준다.
- **서버 상태 vs UI 상태**: 기기/세탁소 데이터는 TanStack Query가 소유하고 5초마다 polling한다. Zustand에는 필터/정렬 선택, 즐겨찾기, 알림 구독처럼 서버에 없는 UI 전용 상태만 둔다.
- **실제 IoT 전환**: 프론트엔드는 `/api/stores/[storeId]/machines` 같은 경로만 알면 된다. `services/*.service.ts`의 fetch 대상을 실제 IoT 백엔드 URL로 바꾸면(`NEXT_PUBLIC_API_BASE_URL`), route handler(mock)를 걷어내는 것만으로 교체가 끝난다.
- **회원가입 이메일 인증**: `/api/auth/signup`은 서버 쪽 인증 기록(`mocks/emailVerification.ts`)을 직접 확인하고, 인증되지 않은 이메일은 거부한다 - 클라이언트가 "인증했다"고 우기는 값은 신뢰하지 않는다. 실제 발송은 `lib/email.ts`(nodemailer + SMTP)가 담당하며 SMTP 환경변수가 없으면 자동으로 화면 표시 Mock으로 폴백한다.
- **Next.js의 route별 모듈 격리**: Next.js는 API route 핸들러를 각각 별도로 번들링하기 때문에, 모듈 최상위에 `const users = []` 같은 배열을 두면 route마다 다른 인스턴스가 생겨 상태가 공유되지 않는다 (예: 회원가입 때 넣은 유저를 로그인에서 못 찾음). `mocks/users.ts`, `mocks/machines.ts`, `mocks/emailVerification.ts`는 전부 `globalThis`에 상태를 박아두는 방식으로 이 문제를 피했다.
