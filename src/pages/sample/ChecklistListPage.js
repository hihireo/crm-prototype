import React, { useState } from "react";
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
    stageIndex: 4,
    date: "2026-06-28",
    salesRep: SALES_REPS[0],
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
    stageIndex: 0,
    date: "2026-06-27",
    salesRep: SALES_REPS[1],
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
    stageIndex: 4,
    date: "2026-06-26",
    salesRep: SALES_REPS[2],
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
    stageIndex: 4,
    date: "2026-06-25",
    salesRep: SALES_REPS[0],
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
    stageIndex: 5,
    date: "2026-06-24",
    salesRep: SALES_REPS[1],
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
    stageIndex: 3,
    date: "2026-06-23",
    salesRep: SALES_REPS[2],
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
    stageIndex: 6,
    date: "2026-06-22",
    salesRep: SALES_REPS[0],
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
    stageIndex: 1,
    date: "2026-06-21",
    salesRep: SALES_REPS[1],
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
    stageIndex: 3,
    date: "2026-06-20",
    salesRep: SALES_REPS[2],
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
    stageIndex: 7,
    date: "2026-06-19",
    salesRep: SALES_REPS[0],
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
    stageIndex: 1,
    date: "2026-06-18",
    salesRep: SALES_REPS[1],
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
    stageIndex: 5,
    date: "2026-06-17",
    salesRep: SALES_REPS[2],
  },
];

const PROC_FILTERS = ["전체", "개인회생", "채무조정", "파산"];
const PROC_COLOR = {
  개인회생: "rehab",
  채무조정: "adjust",
  파산: "bankrupt",
};

const ChecklistListPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const totalCount = CLIENTS.length;
  const avgScore = Math.round(
    CLIENTS.reduce((a, c) => a + c.score, 0) / totalCount,
  );
  const procDist = CLIENTS.reduce((acc, c) => {
    acc[c.recommended] = (acc[c.recommended] || 0) + 1;
    return acc;
  }, {});
  const thisMonth = CLIENTS.filter((c) => c.date.startsWith("2026-06")).length;

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
      if (sortBy === "score") return (a.score - b.score) * dir;
      if (sortBy === "totalDebt") return (a.totalDebt - b.totalDebt) * dir;
      if (sortBy === "date") return a.date.localeCompare(b.date) * dir;
      return 0;
    });

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
          <div style={{ display: "flex", gap: "8px" }}>
            {/* <button
              className="cll-btn-secondary"
              onClick={() => navigate("/checklist/procedure")}
            >
              절차 안내
            </button> */}
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
            <span className="cll-stat-label">평균 성공 가능성</span>
            <strong className="cll-stat-val">
              {avgScore}
              <em>/100</em>
            </strong>
            <div className="cll-stat-bar">
              <div
                className="cll-stat-bar-fill"
                style={{ width: `${avgScore}%` }}
              />
            </div>
          </div>
          <div className="cll-stat-card">
            <span className="cll-stat-label">추천 절차 분포</span>
            <div className="cll-dist">
              {Object.entries(procDist).map(([proc, cnt]) => (
                <div key={proc} className="cll-dist-row">
                  <span className={`cll-proc-tag ${PROC_COLOR[proc]}`}>
                    {proc}
                  </span>
                  <span className="cll-dist-bar-wrap">
                    <div className="cll-dist-bar">
                      <div
                        className="cll-dist-fill"
                        style={{ width: `${(cnt / totalCount) * 100}%` }}
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
            {["초기 단계", "중간 단계", "후기 단계"].map((s, i) => {
              const cnt = CLIENTS.filter((c) => {
                const pct =
                  (c.stageIndex + 1) / STAGE_NAMES[c.recommended].length;
                if (i === 0) return pct <= 1 / 3;
                if (i === 1) return pct > 1 / 3 && pct <= 2 / 3;
                return pct > 2 / 3;
              }).length;
              const dotClass = ["ongoing", "progress", "done"][i];
              return (
                <div key={s} className="cll-status-row">
                  <span className={`cll-status-dot ${dotClass}`} />
                  <span className="cll-status-label">{s}</span>
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
            <span>추천 절차</span>
            <button className="cll-th-btn" onClick={() => handleSort("score")}>
              성공 가능성 <SortIcon col="score" />
            </button>
            <span>진행단계</span>
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
              const stages = STAGE_NAMES[c.recommended];
              const stagePct = Math.round(
                ((c.stageIndex + 1) / stages.length) * 100,
              );
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
                  <span className="cll-cell cll-cell-proc">
                    <span
                      className={`cll-proc-tag ${PROC_COLOR[c.recommended]}`}
                    >
                      {c.recommended}
                    </span>
                  </span>
                  <span className="cll-cell cll-cell-score">
                    <strong className="cll-score-num">{c.score}</strong>
                    <span className="cll-score-total">/100</span>
                  </span>
                  <div className="cll-cell cll-cell-stage">
                    <span className="cll-stage-label">
                      {c.stageIndex + 1}/{stages.length} ·{" "}
                      {stages[c.stageIndex]}
                    </span>
                    <div className="cll-stage-bar">
                      <div
                        className="cll-stage-fill"
                        style={{ width: `${stagePct}%` }}
                      />
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
    </div>
  );
};

export default ChecklistListPage;
