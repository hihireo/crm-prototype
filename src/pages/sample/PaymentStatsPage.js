import React, { useMemo, useState } from "react";
import "./PaymentStatsPage.css";

/* ───────────────────────────
   기준일 / 날짜 유틸
─────────────────────────── */
const TODAY = new Date(2026, 5, 28); // 2026.06.28
const TODAY_LABEL = "2026.06.28";

const addMonths = (date, delta) => {
  const d = new Date(date.getFullYear(), date.getMonth() + delta, date.getDate());
  return d;
};

const fmtDot = (d) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;

const monthKey = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthTitle = (key) => {
  const [y, m] = key.split(".");
  return `${y}년 ${m}월`;
};

/* ───────────────────────────
   시드 난수 (매 렌더링에도 동일한 결과)
─────────────────────────── */
function mulberry32(seed) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260628);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

/* ───────────────────────────
   담당자 / 고객명
─────────────────────────── */
const REPS = [
  { id: "r1", name: "김지훈", branch: "서울강남지점" },
  { id: "r2", name: "이서연", branch: "서울강남지점" },
  { id: "r3", name: "박도윤", branch: "서울여의도지점" },
  { id: "r4", name: "최유진", branch: "부산센텀지점" },
  { id: "r5", name: "정하람", branch: "대구동성로지점" },
];

const BRANCHES = [...new Set(REPS.map((r) => r.branch))];

const LAST_NAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "권", "황"];
const FIRST_NAMES = [
  "민준", "서연", "도윤", "지우", "하은", "지훈", "유진", "하람", "은우", "수아",
  "현우", "지안", "예은", "시우", "다인", "주원", "서윤", "건우", "나윤", "태민",
];
const clientName = (i) =>
  `${LAST_NAMES[i % LAST_NAMES.length]}${FIRST_NAMES[(i * 7) % FIRST_NAMES.length]}`;

/* ───────────────────────────
   고객별 결제(수임료) 데이터 생성
─────────────────────────── */
const FEE_OPTIONS = [400, 500, 500, 600, 600, 700, 700, 800, 900, 1000];
const COUNT_OPTIONS = [3, 4, 5, 6, 6, 7, 7, 8, 8, 10];

const CLIENT_COUNT = 46;

const buildClients = () => {
  const clients = [];

  for (let i = 0; i < CLIENT_COUNT; i++) {
    const rep = REPS[i % REPS.length];
    const contractMonthIdx = Math.floor(rand() * 6); // 0~5 → 2026.01~06
    const contractDay = 1 + Math.floor(rand() * 26);
    const contractDate = new Date(2026, contractMonthIdx, contractDay);

    const totalFee = pick(FEE_OPTIONS);
    const isLump = rand() < 0.12;
    const count = isLump ? 1 : pick(COUNT_OPTIONS);

    const base = Math.floor(totalFee / count);
    const remainder = totalFee - base * count;

    const scenarioRoll = rand();
    const scenario =
      scenarioRoll < 0.11
        ? "canceled"
        : scenarioRoll < 0.24
        ? "overdue"
        : "normal";

    // 이미 도래한 회차 수 (취소 시점이 미래 회차를 앞질러 "선결제"되지 않도록 제한)
    let dueSeqCount = 0;
    for (let seq = 1; seq <= count; seq++) {
      if (addMonths(contractDate, seq - 1).getTime() <= TODAY.getTime()) {
        dueSeqCount++;
      }
    }

    const cancelAfterSeq =
      scenario === "canceled"
        ? Math.min(count - 1, Math.floor(rand() * (dueSeqCount + 1)))
        : null;

    const installments = [];

    for (let seq = 1; seq <= count; seq++) {
      const dueDate = addMonths(contractDate, seq - 1);
      const amount = seq === count ? base + remainder : base;
      const isDue = dueDate.getTime() <= TODAY.getTime();

      let status = "pending";
      let paidDate = null;

      if (scenario === "canceled") {
        if (seq <= cancelAfterSeq) {
          status = "paid";
          paidDate = dueDate;
        } else {
          status = "canceled";
        }
      } else if (scenario === "overdue") {
        // 마지막으로 도래한 회차만 연체, 그 이전은 정상 납부
        const isLatestDue =
          isDue && addMonths(dueDate, 1).getTime() > TODAY.getTime();
        if (isLatestDue) {
          status = "overdue";
        } else if (isDue) {
          status = "paid";
          paidDate = dueDate;
        } else {
          status = "pending";
        }
      } else {
        if (isDue) {
          status = "paid";
          paidDate = dueDate;
        } else {
          status = "pending";
        }
      }

      installments.push({ seq, dueDate, amount, status, paidDate });
    }

    clients.push({
      id: `c${i + 1}`,
      name: clientName(i),
      rep,
      totalFee,
      method: isLump ? "lump" : "installment",
      count,
      contractDate,
      installments,
    });
  }

  return clients;
};

const CLIENTS = buildClients();

/* 전체 고객의 회차별 납부 레코드 (상태 불문) */
const ALL_RECORDS = CLIENTS.flatMap((c) =>
  c.installments.map((it) => ({
    id: `${c.id}-${it.seq}`,
    client: c,
    seq: it.seq,
    amount: it.amount,
    status: it.status,
    dueDate: it.dueDate,
  }))
);

const sumAmount = (records) => records.reduce((s, r) => s + r.amount, 0);

/* 예정일(회차 due date) 기준 월 범위 — 연속된 달력 범위로 구성해 좌우 이동 시 빈틈이 없도록 함 */
const MONTH_KEYS = (() => {
  const dueDates = ALL_RECORDS.map((r) => r.dueDate.getTime());
  const min = new Date(Math.min(...dueDates));
  const max = new Date(Math.max(...dueDates));
  const keys = [];
  let cursor = new Date(min.getFullYear(), min.getMonth(), 1);
  const end = new Date(max.getFullYear(), max.getMonth(), 1);
  while (cursor.getTime() <= end.getTime()) {
    keys.push(monthKey(cursor));
    cursor = addMonths(cursor, 1);
  }
  return keys;
})();

const DEFAULT_MONTH = MONTH_KEYS.includes(monthKey(TODAY))
  ? monthKey(TODAY)
  : MONTH_KEYS[MONTH_KEYS.length - 1];

const STATUS_LABEL = {
  paid: "완납",
  overdue: "연체",
  pending: "예정",
  canceled: "취소",
};

/* ───────────────────────────
   메인 페이지
─────────────────────────── */
const ALL_BRANCHES = "전체";

const PaymentStatsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(DEFAULT_MONTH);
  const [selectedBranch, setSelectedBranch] = useState(ALL_BRANCHES);

  const filteredRecords = useMemo(
    () =>
      selectedBranch === ALL_BRANCHES
        ? ALL_RECORDS
        : ALL_RECORDS.filter((r) => r.client.rep.branch === selectedBranch),
    [selectedBranch]
  );

  const summary = useMemo(() => {
    const paid = filteredRecords.filter((r) => r.status === "paid");
    const unpaid = filteredRecords.filter(
      (r) => r.status === "pending" || r.status === "overdue"
    );
    const overdue = filteredRecords.filter((r) => r.status === "overdue");
    const canceled = filteredRecords.filter((r) => r.status === "canceled");
    return {
      paidCount: paid.length,
      paidAmount: sumAmount(paid),
      unpaidCount: unpaid.length,
      unpaidAmount: sumAmount(unpaid),
      overdueCount: overdue.length,
      canceledCount: canceled.length,
      canceledAmount: sumAmount(canceled),
    };
  }, [filteredRecords]);

  const monthIndex = MONTH_KEYS.indexOf(selectedMonth);
  const monthRecords = useMemo(
    () =>
      filteredRecords
        .filter((r) => monthKey(r.dueDate) === selectedMonth)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    [filteredRecords, selectedMonth]
  );
  const goToMonth = (delta) => {
    const next = MONTH_KEYS[monthIndex + delta];
    if (next) setSelectedMonth(next);
  };

  return (
    <div className="pst-page">
      <div className="pst-body">
        <header className="pst-head">
          <div className="pst-head-row">
            <div>
              <p className="pst-eyebrow">STATISTICS · 결제 데이터</p>
              <h1 className="pst-title">회생·파산 수임료 납부 내역</h1>
              <p className="pst-sub">
                전체 {CLIENTS.length}건의 계약을 기준으로 집계된 수임료 납부
                데이터입니다. · 기준일 {TODAY_LABEL}
              </p>
            </div>
            <div className="pst-branch-filter">
              <label className="pst-filter-label">영업점</label>
              <select
                className="pst-branch-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value={ALL_BRANCHES}>전체 영업점</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* 상단 summary */}
        <section className="pst-kpis">
          <div className="pst-kpi">
            <span className="pst-kpi-label">납부완료</span>
            <span className="pst-kpi-val">
              {summary.paidAmount.toLocaleString()}
              <em>만원</em>
            </span>
            <span className="pst-kpi-sub">{summary.paidCount}건</span>
          </div>

          <div className="pst-kpi">
            <span className="pst-kpi-label">미납</span>
            <span className="pst-kpi-val warn">
              {summary.unpaidAmount.toLocaleString()}
              <em>만원</em>
            </span>
            <span className="pst-kpi-sub">
              {summary.unpaidCount}건 · 연체 {summary.overdueCount}건 포함
            </span>
          </div>

          <div className="pst-kpi">
            <span className="pst-kpi-label">중도해지(취소)</span>
            <span className="pst-kpi-val muted">
              {summary.canceledAmount.toLocaleString()}
              <em>만원</em>
            </span>
            <span className="pst-kpi-sub">{summary.canceledCount}건</span>
          </div>
        </section>

        {/* 월별 상세 내역 */}
        <section className="pst-section">
          <div className="pst-month-nav-row">
            <div className="pst-month-nav">
              <button
                className="pst-nav-arrow"
                onClick={() => goToMonth(-1)}
                disabled={monthIndex <= 0}
                aria-label="이전 달"
              >
                ‹
              </button>
              <select
                className="pst-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {MONTH_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {monthTitle(key)}
                  </option>
                ))}
              </select>
              <button
                className="pst-nav-arrow"
                onClick={() => goToMonth(1)}
                disabled={monthIndex >= MONTH_KEYS.length - 1}
                aria-label="다음 달"
              >
                ›
              </button>
            </div>
          </div>

          {monthRecords.length === 0 ? (
            <p className="pst-hint">해당 월에 예정된 납부 내역이 없습니다.</p>
          ) : (
            <table className="pst-record-table">
              <thead>
                <tr>
                  <th>일자</th>
                  <th>고객명</th>
                  <th>담당자</th>
                  <th>회차</th>
                  <th>금액</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {monthRecords.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDot(r.dueDate)}</td>
                    <td className="pst-cell-name">{r.client.name}</td>
                    <td>
                      {r.client.rep.name}
                      <span className="pst-rep-branch">{r.client.rep.branch}</span>
                    </td>
                    <td>
                      {r.seq}
                      <span className="pst-seq-total">/{r.client.count}회차</span>
                    </td>
                    <td className="pst-cell-amt">{r.amount.toLocaleString()}만원</td>
                    <td>
                      <span className={`pst-status-badge ${r.status}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default PaymentStatsPage;
