import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChecklistListPage.css";

const STAGE_NAMES = {
  개인회생: [
    "신청 전 상담",
    "신청서 접수",
    "금지명령·중지명령",
    "보정권고·보정명령",
    "개시결정",
    "채권자집회",
    "인가결정",
    "변제 수행",
    "면책결정",
  ],
  채무조정: [
    "신청 자격 확인",
    "신청서 접수",
    "채권자 동의 절차",
    "조정 확정",
    "분할상환 시작",
    "조정 완료",
  ],
  파산: [
    "신청 전 상담",
    "신청서 작성·접수",
    "파산선고",
    "파산관재인 조사",
    "면책 심문",
    "면책결정",
  ],
};

const SALES_REPS = [
  { name: "박지훈", branch: "강남영업점", thumb: "/images/thumb_sample1.png" },
  { name: "김서연", branch: "홍대영업점", thumb: "/images/thumb_sample2.png" },
  { name: "이도윤", branch: "경기영업점", thumb: "/images/thumb_sample3.png" },
];

const CLIENTS = [
  {
    id: 1,
    name: "김민수",
    age: 42,
    gender: "남",
    job: "자영업",
    region: "서울",
    totalDebt: 31000,
    income: 220,
    disposable: 45,
    recommended: "개인회생",
    score: 78,
    stageStatus: "절차진행중",
    stageIndex: 4,
    date: "2026-06-28",
    salesRep: SALES_REPS[0],
    payment: {
      configured: true,
      totalFee: 700,
      method: "installment",
      count: 7,
      paidCount: 3,
      status: "진행중",
      monthPaidAmount: 100,
      monthPaidCount: 1,
      monthScheduledAmount: 100,
    },
  },
  {
    id: 2,
    name: "이지영",
    age: 35,
    gender: "여",
    job: "프리랜서",
    region: "경기·인천",
    totalDebt: 18500,
    income: 280,
    disposable: 120,
    recommended: "채무조정",
    score: 65,
    stageStatus: "상담중",
    date: "2026-06-27",
    salesRep: SALES_REPS[1],
    payment: { configured: false },
  },
  {
    id: 3,
    name: "박철수",
    age: 55,
    gender: "남",
    job: "무직",
    region: "부산·경남",
    totalDebt: 52000,
    income: 80,
    disposable: -20,
    recommended: "파산",
    score: 42,
    stageStatus: "절차진행중",
    stageIndex: 4,
    date: "2026-06-26",
    salesRep: SALES_REPS[2],
    payment: {
      configured: true,
      totalFee: 500,
      method: "lump",
      count: 1,
      paidCount: 1,
      status: "완납",
      monthPaidAmount: 0,
      monthPaidCount: 0,
      monthScheduledAmount: 0,
    },
  },
  {
    id: 4,
    name: "최수진",
    age: 29,
    gender: "여",
    job: "계약직",
    region: "서울",
    totalDebt: 9800,
    income: 210,
    disposable: 80,
    recommended: "채무조정",
    score: 71,
    stageStatus: "검토중",
    date: "2026-06-25",
    salesRep: SALES_REPS[0],
    payment: {
      configured: true,
      totalFee: 600,
      method: "installment",
      count: 6,
      paidCount: 2,
      status: "진행중",
      monthPaidAmount: 100,
      monthPaidCount: 1,
      monthScheduledAmount: 100,
    },
  },
  {
    id: 5,
    name: "정대호",
    age: 48,
    gender: "남",
    job: "자영업",
    region: "대구·경북",
    totalDebt: 45000,
    income: 350,
    disposable: 90,
    recommended: "개인회생",
    score: 82,
    stageStatus: "절차진행중",
    stageIndex: 7,
    date: "2026-06-24",
    salesRep: SALES_REPS[1],
    payment: {
      configured: true,
      totalFee: 800,
      method: "installment",
      count: 8,
      paidCount: 8,
      status: "완납",
      monthPaidAmount: 100,
      monthPaidCount: 1,
      monthScheduledAmount: 100,
    },
  },
  {
    id: 6,
    name: "한미래",
    age: 38,
    gender: "여",
    job: "정규직",
    region: "서울",
    totalDebt: 22000,
    income: 320,
    disposable: 140,
    recommended: "개인회생",
    score: 85,
    stageStatus: "절차진행중",
    stageIndex: 3,
    date: "2026-06-23",
    salesRep: SALES_REPS[2],
    payment: {
      configured: true,
      totalFee: 700,
      method: "installment",
      count: 7,
      paidCount: 4,
      status: "진행중",
      monthPaidAmount: 100,
      monthPaidCount: 1,
      monthScheduledAmount: 100,
    },
  },
  {
    id: 7,
    name: "윤기현",
    age: 51,
    gender: "남",
    job: "자영업",
    region: "충청·강원",
    totalDebt: 38000,
    income: 150,
    disposable: 30,
    recommended: "개인회생",
    score: 61,
    stageStatus: "절차진행중",
    stageIndex: 6,
    date: "2026-06-22",
    salesRep: SALES_REPS[0],
    payment: {
      configured: true,
      totalFee: 900,
      method: "installment",
      count: 10,
      paidCount: 6,
      status: "진행중",
      monthPaidAmount: 100,
      monthPaidCount: 1,
      monthScheduledAmount: 100,
    },
  },
  {
    id: 8,
    name: "강소영",
    age: 32,
    gender: "여",
    job: "프리랜서",
    region: "호남·제주",
    totalDebt: 14500,
    income: 180,
    disposable: 55,
    recommended: "채무조정",
    score: 68,
    stageStatus: "상담중",
    date: "2026-06-21",
    salesRep: SALES_REPS[1],
    payment: { configured: false },
  },
  {
    id: 9,
    name: "임성준",
    age: 45,
    gender: "남",
    job: "무직",
    region: "서울",
    totalDebt: 61000,
    income: 120,
    disposable: -30,
    recommended: "파산",
    score: 38,
    stageStatus: "반려됨",
    date: "2026-06-20",
    salesRep: SALES_REPS[2],
    payment: {
      configured: true,
      totalFee: 400,
      method: "installment",
      count: 4,
      paidCount: 2,
      status: "중도 해지",
      monthPaidAmount: 100,
      monthPaidCount: 1,
      monthScheduledAmount: 100,
    },
  },
  {
    id: 10,
    name: "오현숙",
    age: 60,
    gender: "여",
    job: "무직",
    region: "경기·인천",
    totalDebt: 27000,
    income: 100,
    disposable: 15,
    recommended: "개인회생",
    score: 55,
    stageStatus: "중단됨",
    date: "2026-06-19",
    salesRep: SALES_REPS[0],
    payment: {
      configured: true,
      totalFee: 600,
      method: "installment",
      count: 6,
      paidCount: 3,
      status: "환불 처리",
      monthPaidAmount: 0,
      monthPaidCount: 0,
      monthScheduledAmount: 100,
    },
  },
  {
    id: 11,
    name: "신동우",
    age: 37,
    gender: "남",
    job: "자영업",
    region: "서울",
    totalDebt: 33500,
    income: 260,
    disposable: 70,
    recommended: "개인회생",
    score: 74,
    stageStatus: "계약대기중",
    date: "2026-06-18",
    salesRep: SALES_REPS[1],
    payment: {
      configured: true,
      totalFee: 700,
      method: "installment",
      count: 7,
      paidCount: 1,
      status: "진행중",
      monthPaidAmount: 100,
      monthPaidCount: 1,
      monthScheduledAmount: 100,
    },
  },
  {
    id: 12,
    name: "류혜진",
    age: 44,
    gender: "여",
    job: "계약직",
    region: "경기·인천",
    totalDebt: 20000,
    income: 230,
    disposable: 95,
    recommended: "개인회생",
    score: 79,
    stageStatus: "절차진행중",
    stageIndex: 4,
    date: "2026-06-17",
    salesRep: SALES_REPS[2],
    payment: {
      configured: true,
      totalFee: 500,
      method: "installment",
      count: 5,
      paidCount: 5,
      status: "완납",
      monthPaidAmount: 0,
      monthPaidCount: 0,
      monthScheduledAmount: 0,
    },
  },
];

const STAGE_STATUS_CLASS = {
  상담중: "consult",
  검토중: "review",
  반려됨: "rejected",
  계약대기중: "pending",
  절차진행중: "active",
  중단됨: "halted",
};

const stageBadgeLabel = (status, stageIndex, stageTotal) => {
  if (status === "절차진행중")
    return `절차진행중 ${stageIndex + 1}/${stageTotal}`;
  return status;
};

const STAGE_STATUS_DOT = {
  상담중: "consult",
  검토중: "review",
  반려됨: "rejected",
  계약대기중: "pending",
  절차진행중: "active",
  중단됨: "halted",
};

const STAGE_STATUSES = [
  "상담중",
  "검토중",
  "반려됨",
  "계약대기중",
  "절차진행중",
  "중단됨",
];

const PAY_STATUS_CLASS = {
  진행중: "active",
  완납: "done",
  "중도 해지": "stopped",
  "환불 처리": "refunded",
};

const paySeqLabel = (payment) => {
  if (payment.method === "lump") return "일괄납부";
  return `${payment.paidCount}/${payment.count}`;
};

const payProgressPct = (payment) => {
  if (payment.method === "lump") return payment.paidCount > 0 ? 100 : 0;
  if (!payment.count) return 0;
  return Math.round((payment.paidCount / payment.count) * 100);
};

const PROC_FILTERS = ["전체", "개인회생", "채무조정", "파산"];

const NEWS_ITEMS = [
  {
    id: "n1",
    proc: "개인회생",
    tagClass: "rehab",
    source: "법률신문",
    date: "07.22",
    headline: "개인회생 신청 자격과 조건, 나도 가능할까?",
    summary: "채무 총액·가용소득 기준과 최근 법원 실무 경향을 정리했습니다.",
    query: "개인회생 신청 자격",
  },
  {
    id: "n2",
    proc: "개인회생",
    tagClass: "rehab",
    source: "연합뉴스",
    date: "07.21",
    headline: "개인회생 변제계획, 어떻게 세워지나",
    summary: "월 변제액 산정 방식과 인가 전후 고객 안내 포인트를 모았습니다.",
    query: "개인회생 변제계획",
  },
  {
    id: "n3",
    proc: "채무조정",
    tagClass: "adjust",
    source: "한국경제",
    date: "07.20",
    headline: "신용회복위원회 채무조정, 누가 신청할 수 있나",
    summary: "개인워크아웃·프리워크아웃 신청 자격과 제외 채무를 비교합니다.",
    query: "신용회복위원회 채무조정 신청자격",
  },
  {
    id: "n4",
    proc: "채무조정",
    tagClass: "adjust",
    source: "매일경제",
    date: "07.19",
    headline: "개인워크아웃과 프리워크아웃의 차이",
    summary:
      "연체 여부에 따른 선택 기준과 상담 시 자주 나오는 질문을 정리했습니다.",
    query: "개인워크아웃 프리워크아웃 차이",
  },
  {
    id: "n5",
    proc: "파산",
    tagClass: "bankrupt",
    source: "조선비즈",
    date: "07.18",
    headline: "개인파산·면책 신청 절차 한눈에 보기",
    summary: "파산선고부터 면책결정까지 단계별 기간과 준비 서류를 요약합니다.",
    query: "개인파산 면책 신청절차",
  },
  {
    id: "n6",
    proc: "파산",
    tagClass: "bankrupt",
    source: "서울경제",
    date: "07.17",
    headline: "파산 선고 이후 달라지는 것들",
    summary:
      "취업·신용·재산 처분 등 고객이 가장 많이 묻는 불이익을 정리했습니다.",
    query: "파산선고 이후 불이익",
  },
];

const buildNewsSearchUrl = (query) =>
  `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}`;

const ChecklistListPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [newsOpen, setNewsOpen] = useState(false);

  useEffect(() => {
    if (!newsOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [newsOpen]);

  const totalCount = CLIENTS.length;
  const thisMonth = CLIENTS.filter((c) => c.date.startsWith("2026-06")).length;
  const monthPaymentTotal = CLIENTS.reduce(
    (sum, c) =>
      sum + (c.payment.configured ? c.payment.monthPaidAmount || 0 : 0),
    0,
  );
  const monthScheduledTotal = CLIENTS.reduce(
    (sum, c) =>
      sum + (c.payment.configured ? c.payment.monthScheduledAmount || 0 : 0),
    0,
  );
  const monthPaidCompleteCount = CLIENTS.reduce(
    (sum, c) =>
      sum + (c.payment.configured ? c.payment.monthPaidCount || 0 : 0),
    0,
  );
  const monthScheduledCount = CLIENTS.reduce(
    (sum, c) =>
      sum +
      (c.payment.configured && (c.payment.monthScheduledAmount || 0) > 0
        ? 1
        : 0),
    0,
  );
  const monthPaymentPct =
    monthScheduledTotal > 0
      ? Math.round((monthPaymentTotal / monthScheduledTotal) * 100)
      : 0;
  const statusDist = STAGE_STATUSES.map((status) => ({
    status,
    cnt: CLIENTS.filter((c) => c.stageStatus === status).length,
  })).filter((s) => s.cnt > 0);
  const maxStatusCnt = Math.max(...statusDist.map((s) => s.cnt), 1);
  const procDist = CLIENTS.reduce((acc, c) => {
    acc[c.recommended] = (acc[c.recommended] || 0) + 1;
    return acc;
  }, {});

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const sorted = [...CLIENTS]
    .filter((c) => filter === "전체" || c.recommended === filter)
    .filter(
      (c) =>
        !search ||
        c.name.includes(search) ||
        c.job.includes(search) ||
        c.region.includes(search),
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "totalDebt") return (a.totalDebt - b.totalDebt) * dir;
      if (sortBy === "date") return a.date.localeCompare(b.date) * dir;
      return 0;
    });

  const filteredNews = NEWS_ITEMS;

  const SortIcon = ({ col }) => (
    <span className={`cll-sort-icon ${sortBy === col ? "active" : ""}`}>
      {sortBy === col && sortDir === "asc" ? "↑" : "↓"}
    </span>
  );

  return (
    <div className="cll-page">
      <div className="cll-body">
        {/* 페이지 헤더 */}
        <div className="cll-page-header">
          <div>
            <h1 className="cll-page-title">회생·파산 진단 목록</h1>
            <p className="cll-page-sub">
              총 {totalCount}건 · 이번 달 {thisMonth}건 상담
            </p>
          </div>
          <div className="cll-header-actions">
            {/* <button
              className="cll-btn-secondary"
              onClick={() => navigate("/checklist/procedure")}
            >
              절차 안내
            </button> */}
            <button
              type="button"
              className="cll-btn-news"
              onClick={() => setNewsOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3.5 4.5h10A1.5 1.5 0 0 1 15 6v10.5a1 1 0 0 1-1 1H4.5A1.5 1.5 0 0 1 3 16V6a1.5 1.5 0 0 1 1.5-1.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M16.5 7H15v9.5a.5.5 0 0 0 .5.5h.5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M5.5 7.5h7M5.5 10h7M5.5 12.5h4.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              관련 뉴스
              {/* <span className="cll-btn-news-badge">{NEWS_ITEMS.length}</span> */}
            </button>
            <button
              className="cll-btn-primary"
              onClick={() => navigate("/checklist/form")}
            >
              + 새 진단 시작
            </button>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="cll-stats">
          <div className="cll-stat-card">
            <span className="cll-stat-label">총 분석 건수</span>
            <strong className="cll-stat-val">
              {totalCount}
              <em>건</em>
            </strong>
            <span className="cll-stat-sub">이번 달 {thisMonth}건</span>
          </div>
          <div className="cll-stat-card">
            <span className="cll-stat-label">이번 달 결제</span>
            <div className="cll-pay-gauge-head">
              <strong className="cll-pay-gauge-paid">
                {monthPaymentTotal.toLocaleString()}
                <em>만원</em>
              </strong>
              <span className="cll-pay-gauge-total">
                / {monthScheduledTotal.toLocaleString()}만원
              </span>
            </div>
            <div className="cll-pay-gauge-bar">
              <div
                className="cll-pay-gauge-fill"
                style={{ width: `${monthPaymentPct}%` }}
              />
            </div>
            <div className="cll-pay-gauge-foot">
              <span>납부 완료 {monthPaidCompleteCount}건</span>
              <span>예정 {monthScheduledCount}건</span>
            </div>
          </div>
          <div className="cll-stat-card">
            <span className="cll-stat-label">상태 분포</span>
            <div className="cll-dist">
              {statusDist.map(({ status, cnt }) => (
                <div key={status} className="cll-dist-row">
                  <span className="cll-status-dist-label">
                    <span
                      className={`cll-status-dot ${STAGE_STATUS_DOT[status]}`}
                    />
                    {status}
                  </span>
                  <span className="cll-dist-bar-wrap">
                    <div className="cll-dist-bar">
                      <div
                        className={`cll-dist-fill cll-dist-fill--${STAGE_STATUS_DOT[status]}`}
                        style={{ width: `${(cnt / maxStatusCnt) * 100}%` }}
                      />
                    </div>
                  </span>
                  <span className="cll-dist-cnt">{cnt}건</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cll-stat-card">
            <span className="cll-stat-label">진행단계 현황</span>
            {STAGE_STATUSES.map((status) => {
              const cnt = CLIENTS.filter(
                (c) => c.stageStatus === status,
              ).length;
              const dotClass = STAGE_STATUS_DOT[status];
              return (
                <div key={status} className="cll-status-row">
                  <span className={`cll-status-dot ${dotClass}`} />
                  <span className="cll-status-label">{status}</span>
                  <span className="cll-status-cnt">{cnt}건</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 필터 + 검색 */}
        <div className="cll-toolbar">
          <div className="cll-filter-chips">
            {PROC_FILTERS.map((f) => (
              <button
                key={f}
                className={`cll-filter-chip ${filter === f ? "on" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
                {f !== "전체" && (
                  <span className="cll-filter-cnt">
                    {f === "전체" ? totalCount : procDist[f] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="cll-search-wrap">
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
              className="cll-search-icon"
            >
              <circle cx="9" cy="9" r="6" stroke="#bbb" strokeWidth="2" />
              <path
                d="M13.5 13.5L17 17"
                stroke="#bbb"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="cll-search"
              placeholder="고객명, 직업, 지역 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 목록 테이블 */}
        <div className="cll-table-wrap">
          {/* 헤더 */}
          <div className="cll-table-head">
            <span>고객 정보</span>
            <span>지역</span>
            <button
              className="cll-th-btn"
              onClick={() => handleSort("totalDebt")}
            >
              총 채무 <SortIcon col="totalDebt" />
            </button>
            <span>월 가용소득</span>
            <span>결제정보</span>
            <span>상태</span>
            <button className="cll-th-btn" onClick={() => handleSort("date")}>
              상담일 <SortIcon col="date" />
            </button>
            <span>영업담당자</span>
          </div>

          {/* 행 */}
          {sorted.length === 0 ? (
            <div className="cll-empty">검색 결과가 없습니다.</div>
          ) : (
            sorted.map((c) => {
              const stageTotal = STAGE_NAMES[c.recommended].length;
              return (
                <div
                  key={c.id}
                  className="cll-row"
                  onClick={() => navigate("/checklist/result-external")}
                >
                  <div className="cll-cell-client">
                    <div>
                      <div className="cll-name">{c.name}</div>
                      <div className="cll-meta">
                        {c.age}세 · {c.gender} · {c.job}
                      </div>
                    </div>
                  </div>
                  <span className="cll-cell cll-cell-region">{c.region}</span>
                  <span className="cll-cell cll-debt">
                    {(c.totalDebt / 10000).toFixed(1)}억<em>원</em>
                  </span>
                  <span
                    className={`cll-cell cll-disposable cll-cell-disposable ${c.disposable < 0 ? "neg" : ""}`}
                  >
                    {c.disposable >= 0 ? "+" : ""}
                    {c.disposable}만원
                  </span>
                  <div className="cll-cell cll-cell-payment">
                    {c.payment.configured ? (
                      <div className="cll-pay-block">
                        <span className="cll-pay-fee">
                          {c.payment.totalFee.toLocaleString()}
                          <em>만원</em>
                        </span>
                        <div className="cll-pay-detail">
                          <div className="cll-pay-bar">
                            <div
                              className={`cll-pay-bar-fill ${PAY_STATUS_CLASS[c.payment.status] || ""}`}
                              style={{
                                width: `${payProgressPct(c.payment)}%`,
                              }}
                            />
                          </div>
                          <div className="cll-pay-foot">
                            <span className="cll-pay-seq">
                              {paySeqLabel(c.payment)}
                            </span>
                            <span
                              className={`cll-pay-status ${PAY_STATUS_CLASS[c.payment.status] || ""}`}
                            >
                              {c.payment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="cll-pay-unset">결제 미설정</span>
                    )}
                  </div>
                  <div className="cll-cell cll-cell-stage">
                    <div className="cll-stage-row">
                      <span className="cll-stage-proc">{c.recommended}</span>
                      <span
                        className={`cll-stage-badge ${STAGE_STATUS_CLASS[c.stageStatus] || ""}`}
                      >
                        {stageBadgeLabel(
                          c.stageStatus,
                          c.stageIndex,
                          stageTotal,
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="cll-cell cll-date">
                    {c.date.slice(5).replace("-", "/")}
                  </span>
                  <div className="cll-cell cll-cell-sales">
                    <img
                      src={c.salesRep.thumb}
                      alt=""
                      className="cll-sales-thumb"
                    />
                    <div className="cll-sales-info">
                      <span className="cll-sales-branch">
                        {c.salesRep.branch}
                      </span>
                      <span className="cll-sales-name">{c.salesRep.name}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 관련 뉴스 슬라이드 패널 */}
      {newsOpen && (
        <div
          className="cll-news-overlay"
          onClick={() => setNewsOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`cll-news-drawer ${newsOpen ? "open" : ""}`}
        aria-hidden={!newsOpen}
      >
        <div style={{ marginTop: 50 }}></div>
        <div className="cll-news-drawer-head">
          <div>
            <h2 className="cll-news-drawer-title">회생·파산 관련 뉴스</h2>
          </div>
          <button
            type="button"
            className="cll-news-drawer-close"
            onClick={() => setNewsOpen(false)}
            aria-label="닫기"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="cll-news-drawer-list">
          {filteredNews.map((item) => (
            <a
              key={item.id}
              className="cll-news-item"
              href={buildNewsSearchUrl(item.query)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="cll-news-item-meta">
                {/* <span className={`cll-proc-tag ${item.tagClass}`}>
                  {item.proc}
                </span> */}
                <span className="cll-news-item-source">
                  {item.source} · {item.date}
                </span>
              </div>
              <p className="cll-news-item-title">{item.headline}</p>
              <p className="cll-news-item-summary">{item.summary}</p>
              <span className="cll-news-item-link">자세히 보기 →</span>
            </a>
          ))}
        </div>

        <div className="cll-news-drawer-foot"></div>
      </aside>
    </div>
  );
};

export default ChecklistListPage;
