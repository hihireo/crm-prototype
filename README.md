# 고객관리 시스템 와이어프레임

React로 구현된 고객관리 시스템(CRM)의 와이어프레임입니다.

## 프로젝트 개요

고객들이 온라인 광고를 통해 신청한 데이터를 효율적으로 관리할 수 있는 SaaS 형태의 고객관리 시스템 와이어프레임입니다.

## 주요 기능

### 🔐 인증 시스템

- 이메일 로그인
- 소셜 로그인 (Google, Kakao, Naver)

### 🏢 서비스 관리

- 서비스 선택/생성/삭제
- 다중 서비스 관리

### 📊 대시보드

- 프로필 정보
- 출근/퇴근 관리
- 판매량 랭킹
- 개인 업무 현황
- 최근 배정 정보
- 일정 관리

### 📢 공지사항

- 공지사항 목록/상세 보기
- 중요 공지 표시
- 반응형 게시판

### 📋 신청현황 관리

- 고객 신청 데이터 테이블
- 필터링 기능 (상태, 팀, 매체사)
- 일괄 처리 기능
- 엑셀 다운로드

## 구현된 페이지

1. **로그인 페이지** (`/login`)

   - 이메일/비밀번호 로그인
   - 소셜 로그인 버튼

2. **서비스 선택 페이지** (`/services`)

   - 서비스 카드 목록
   - 새 서비스 생성
   - 서비스 삭제

3. **대시보드** (`/dashboard`)

   - 개인 프로필 및 통계
   - 출퇴근 관리
   - 판매 랭킹
   - 업무 및 일정 관리

4. **공지사항** (`/notice`)

   - 공지사항 목록
   - 상세 내용 보기
   - 중요 공지 표시

5. **신청현황** (`/applications`)
   - 고객 신청 데이터 테이블
   - 고급 필터링
   - 일괄 선택/처리

## 기술 스택

- **React** 18.2.0
- **React Router** 6.3.0
- **CSS3** (반응형 디자인)
- **ES6+** JavaScript

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드
npm run build
```

## 디자인 시스템

### 색상 팔레트

- Primary: #3b82f6 (파란색)
- Secondary: #e2e8f0 (회색)
- Danger: #ef4444 (빨간색)
- Success: #10b981 (초록색)
- Warning: #f59e0b (주황색)

### 반응형 브레이크포인트

- 모바일: 768px 이하
- 태블릿: 769px - 1024px
- 데스크톱: 1024px 이상

## 프로젝트 구조

```
src/
├── components/
│   └── Layout/
│       ├── Header.js
│       └── Header.css
├── pages/
│   ├── LoginPage.js
│   ├── LoginPage.css
│   ├── ServiceSelectPage.js
│   ├── ServiceSelectPage.css
│   ├── DashboardPage.js
│   ├── DashboardPage.css
│   ├── NoticePage.js
│   ├── NoticePage.css
│   ├── ApplicationsPage.js
│   └── ApplicationsPage.css
├── App.js
├── index.js
└── index.css
```

## 라우팅 구조

- `/` → `/login` (리다이렉트)
- `/login` → 로그인 페이지
- `/services` → 서비스 선택 페이지
- `/dashboard` → 메인 대시보드
- `/notice` → 공지사항
- `/applications` → 신청현황

## 주요 특징

### 🎨 사용자 친화적 UI/UX

- 직관적인 네비게이션
- 반응형 디자인
- 일관된 디자인 시스템

### 📱 모바일 최적화

- 모바일 우선 설계
- 터치 친화적 인터페이스
- 반응형 테이블

### 🔄 상태 관리

- React Hooks 활용
- 로컬 상태 관리
- 사용자 세션 관리

### 🎯 실제 업무 시나리오 반영

- 실무에서 필요한 기능들
- 직관적인 워크플로우
- 효율적인 데이터 관리

이 와이어프레임은 실제 고객관리 시스템의 기본 구조와 주요 기능들을 시각적으로 확인할 수 있도록 구현되었습니다.
