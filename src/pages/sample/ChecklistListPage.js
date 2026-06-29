import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChecklistListPage.css";

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
    status: "검토완료",
    date: "2026-06-28",
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
    status: "상담중",
    date: "2026-06-27",
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
    status: "검토완료",
    date: "2026-06-26",
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
    status: "검토완료",
    date: "2026-06-25",
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
    status: "진행중",
    date: "2026-06-24",
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
    status: "진행중",
    date: "2026-06-23",
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
    status: "검토완료",
    date: "2026-06-22",
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
    status: "상담중",
    date: "2026-06-21",
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
    status: "검토완료",
    date: "2026-06-20",
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
    status: "검토완료",
    date: "2026-06-19",
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
    status: "상담중",
    date: "2026-06-18",
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
    status: "검토완료",
    date: "2026-06-17",
  },
];

const PROC_FILTERS = ["전체", "개인회생", "채무조정", "파산"];
const STATUS_COLOR = {
  검토완료: "done",
  상담중: "ongoing",
  진행중: "progress",
};
const PROC_COLOR = {
  개인회생: "rehab",
  채무조정: "adjust",
  파산: "bankrupt",
};

const ScoreBar = ({ score }) => (
  <div className="cll-score-wrap">
    <div className="cll-score-bar">
      <div className="cll-score-fill" style={{ width: `${score}%` }} />
    </div>
    <span className="cll-score-num">{score}</span>
  </div>
);

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
            <h1 className="cll-page-title">분석 목록</h1>
            <p className="cll-page-sub">
              총 {totalCount}건 · 이번 달 {thisMonth}건 상담
            </p>
          </div>
          <button
            className="cll-btn-primary"
            onClick={() => navigate("/checklist/form")}
          >
            + 새 분석 시작
          </button>
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
            <span className="cll-stat-label">상태 현황</span>
            {["검토완료", "상담중", "진행중"].map((s) => {
              const cnt = CLIENTS.filter((c) => c.status === s).length;
              return (
                <div key={s} className="cll-status-row">
                  <span className={`cll-status-dot ${STATUS_COLOR[s]}`} />
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
            <span>상태</span>
            <button className="cll-th-btn" onClick={() => handleSort("date")}>
              상담일 <SortIcon col="date" />
            </button>
            <span />
          </div>

          {/* 행 */}
          {sorted.length === 0 ? (
            <div className="cll-empty">검색 결과가 없습니다.</div>
          ) : (
            sorted.map((c) => (
              <div
                key={c.id}
                className="cll-row"
                onClick={() => navigate("/checklist/result")}
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
                  <span className={`cll-proc-tag ${PROC_COLOR[c.recommended]}`}>
                    {c.recommended}
                  </span>
                </span>
                <div className="cll-cell cll-cell-score">
                  <ScoreBar score={c.score} />
                </div>
                <span className="cll-cell cll-cell-status">
                  <span
                    className={`cll-status-badge ${STATUS_COLOR[c.status]}`}
                  >
                    {c.status}
                  </span>
                </span>
                <span className="cll-cell cll-date">
                  {c.date.slice(5).replace("-", "/")}
                </span>
                <span className="cll-cell cll-action">
                  <button
                    className="cll-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/checklist/result");
                    }}
                  >
                    결과 보기
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistListPage;
