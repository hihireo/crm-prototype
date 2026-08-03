import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SampleDashboardPage.css";
import "./SampleChecklistPage.css";

const Chips = ({ options, value, onChange, multi = false }) => (
  <div className="scl-chips">
    {options.map((opt) => {
      const v = typeof opt === "string" ? opt : opt.value;
      const label = typeof opt === "string" ? opt : opt.label;
      const selected = multi ? (value || []).includes(v) : value === v;
      return (
        <button
          key={v}
          type="button"
          className={`scl-chip ${selected ? "on" : ""}`}
          onClick={() => {
            if (multi) {
              const next = selected
                ? (value || []).filter((x) => x !== v)
                : [...(value || []), v];
              onChange(next);
            } else {
              onChange(v);
            }
          }}
        >
          {label}
        </button>
      );
    })}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="scl-field">
    <label className="scl-label">
      {label}
      {hint && <span className="scl-hint">{hint}</span>}
    </label>
    {children}
  </div>
);

let debtEditIdSeq = 100;
const nextEditDebtId = () => {
  debtEditIdSeq += 1;
  return `edit-d${debtEditIdSeq}`;
};

const emptyEditDebt = () => ({
  id: nextEditDebtId(),
  debtType: "은행대출",
  lender: "",
  loanDate: "",
  maturityDate: "",
  principal: "",
  rate: "",
  repayMethod: "원리금균등",
  overduePeriod: "0",
});

const CLIENT = {
  name: "김민수",
  age: 42,
  gender: "남",
  job: "자영업",
  totalDebt: 31000,
  totalDebtWithInterest: 39737,
  totalInterest: 8737,
  totalAsset: 1500,
  monthlyIncome: 220,
  monthlyExpenses: 175,
  disposableIncome: 45,
  overduePeriod: 6,
  debtBreakdown: [
    { label: "은행대출", amount: 15000, totalRepay: 18710, pct: 48 },
    { label: "카드론", amount: 8000, totalRepay: 10668, pct: 26 },
    { label: "캐피탈", amount: 5000, totalRepay: 6553, pct: 16 },
    { label: "사채", amount: 3000, totalRepay: 3807, pct: 10 },
  ],
};

const DEBT_TYPE_OPTIONS = [
  "은행대출",
  "카드론",
  "캐피탈",
  "저축은행",
  "사채",
  "개인차용",
];
const REPAY_METHOD_OPTIONS = ["원리금균등", "원금균등", "만기일시"];

/** 심플 모드 연체기간 (OverduePeriod) */
const OverduePeriod = {
  None: "none",
  Under3Months: "under_3_months",
  From3To6Months: "3_to_6_months",
  From6To12Months: "6_to_12_months",
  Over1Year: "over_1_year",
};

const OVERDUE_PERIOD_OPTIONS = [
  { value: OverduePeriod.None, label: "없음" },
  { value: OverduePeriod.Under3Months, label: "3개월 미만" },
  { value: OverduePeriod.From3To6Months, label: "3~6개월" },
  { value: OverduePeriod.From6To12Months, label: "6~12개월" },
  { value: OverduePeriod.Over1Year, label: "1년 이상" },
];

const OVERDUE_PERIOD_TO_MONTHS = {
  [OverduePeriod.None]: 0,
  [OverduePeriod.Under3Months]: 2,
  [OverduePeriod.From3To6Months]: 4,
  [OverduePeriod.From6To12Months]: 8,
  [OverduePeriod.Over1Year]: 12,
};

const isOverduePeriodEnum = (value) =>
  OVERDUE_PERIOD_OPTIONS.some((o) => o.value === value);

const monthsToOverduePeriod = (months) => {
  const n = Number(months) || 0;
  if (n <= 0) return OverduePeriod.None;
  if (n < 3) return OverduePeriod.Under3Months;
  if (n < 6) return OverduePeriod.From3To6Months;
  if (n < 12) return OverduePeriod.From6To12Months;
  return OverduePeriod.Over1Year;
};

const normalizeSimpleOverdue = (value) => {
  if (isOverduePeriodEnum(value)) return value;
  if (value === "없음") return OverduePeriod.None;
  if (value === "3개월 미만") return OverduePeriod.Under3Months;
  if (value === "3~6개월") return OverduePeriod.From3To6Months;
  if (value === "6~12개월") return OverduePeriod.From6To12Months;
  if (value === "1년 이상") return OverduePeriod.Over1Year;
  return monthsToOverduePeriod(
    parseInt(String(value ?? "").replace(/[^\d]/g, ""), 10) || 0,
  );
};

const overduePeriodLabel = (value) => {
  const opt = OVERDUE_PERIOD_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? null;
};

const parseOverdueMonths = (value) => {
  if (value == null || value === "" || value === "없음") return 0;
  if (isOverduePeriodEnum(value)) return OVERDUE_PERIOD_TO_MONTHS[value] ?? 0;
  const n = parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
};

const getMaxOverdueMonths = (items) => {
  let max = 0;
  (items || []).forEach((i) => {
    const n = parseOverdueMonths(i.overduePeriod);
    if (n > max) max = n;
  });
  return String(max);
};

const DEFAULT_DEBT_ITEMS = [
  {
    id: "d1",
    debtType: "은행대출",
    lender: "국민은행",
    loanDate: "2022-03-15",
    maturityDate: "2029-03-15",
    principalWon: 150000000,
    rate: "6.5",
    repayMethod: "원리금균등",
    overduePeriod: "4",
  },
  {
    id: "d2",
    debtType: "카드론",
    lender: "신한카드",
    loanDate: "2023-06-01",
    maturityDate: "2027-06-01",
    principalWon: 80000000,
    rate: "14.9",
    repayMethod: "원리금균등",
    overduePeriod: "8",
  },
  {
    id: "d3",
    debtType: "캐피탈",
    lender: "현대캐피탈",
    loanDate: "2023-01-10",
    maturityDate: "2028-01-10",
    principalWon: 50000000,
    rate: "11.2",
    repayMethod: "원리금균등",
    overduePeriod: "2",
  },
  {
    id: "d4",
    debtType: "사채",
    lender: "개인",
    loanDate: "2024-02-01",
    maturityDate: "2026-02-01",
    principalWon: 30000000,
    rate: "24",
    repayMethod: "만기일시",
    overduePeriod: "5",
  },
];

const monthsBetween = (startStr, endStr) => {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  )
    return null;
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return Math.max(1, months);
};

const calcRepayment = (principalWon, annualRatePct, n, method) => {
  const P = Number(principalWon);
  const rate = Number(annualRatePct);
  if (!P || P <= 0 || !n || n < 1 || Number.isNaN(rate) || rate < 0)
    return null;
  const r = rate / 12 / 100;
  const mode = method || "원리금균등";
  if (mode === "만기일시") {
    const monthlyInterest = P * r;
    const totalInterest = monthlyInterest * n;
    return {
      months: n,
      monthly: Math.round(monthlyInterest),
      totalRepay: Math.round(P + totalInterest),
      totalInterest: Math.round(totalInterest),
    };
  }
  if (mode === "원금균등") {
    const principalPart = P / n;
    let totalInterest = 0;
    for (let k = 0; k < n; k++) totalInterest += (P - principalPart * k) * r;
    const totalRepay = P + totalInterest;
    return {
      months: n,
      monthly: Math.round(totalRepay / n),
      totalRepay: Math.round(totalRepay),
      totalInterest: Math.round(totalInterest),
    };
  }
  let monthly;
  if (r === 0) monthly = P / n;
  else {
    const pow = Math.pow(1 + r, n);
    monthly = (P * r * pow) / (pow - 1);
  }
  const totalRepay = monthly * n;
  return {
    months: n,
    monthly: Math.round(monthly),
    totalRepay: Math.round(totalRepay),
    totalInterest: Math.round(totalRepay - P),
  };
};

const wonToMan = (won) => Math.round((Number(won) || 0) / 10000);
const formatWon = (n) => `${Math.round(Number(n) || 0).toLocaleString()}원`;
const formatComma = (value) => {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
};
const parseComma = (value) => String(value ?? "").replace(/[^\d]/g, "");

const calcDebtItem = (debt) => {
  const n = monthsBetween(debt.loanDate, debt.maturityDate);
  if (n == null) return null;
  return calcRepayment(
    debt.principal,
    debt.rate,
    n,
    debt.repayMethod || "원리금균등",
  );
};

const buildDebtSummaryFromDetailRows = (rows) => {
  const items = rows.map((row, idx) => {
    const principalWon =
      parseInt(row.principalWon ?? row.principal) || 0;
    const n = monthsBetween(row.loanDate, row.maturityDate);
    const calc = n
      ? calcRepayment(principalWon, row.rate, n, row.repayMethod)
      : null;
    const amount = wonToMan(principalWon);
    return {
      id: row.id || `d${idx}`,
      label: row.lender
        ? `${row.lender}${row.debtType ? ` (${row.debtType})` : ""}`
        : row.debtType || "미입력",
      debtType: row.debtType || "",
      lender: row.lender || "",
      amount,
      principalWon,
      totalRepay: calc ? wonToMan(calc.totalRepay) : amount,
      totalInterest: calc ? wonToMan(calc.totalInterest) : 0,
      monthly: calc ? wonToMan(calc.monthly) : null,
      months: calc?.months ?? null,
      rate: row.rate,
      repayMethod: row.repayMethod || "원리금균등",
      overduePeriod: String(parseOverdueMonths(row.overduePeriod)),
      loanDate: row.loanDate || "",
      maturityDate: row.maturityDate || "",
    };
  });
  const totalDebt = items.reduce((s, i) => s + (i.amount || 0), 0);
  const totalDebtWithInterest = items.reduce(
    (s, i) => s + (i.totalRepay || i.amount || 0),
    0,
  );
  const overduePeriod = getMaxOverdueMonths(items);
  return {
    mode: "detail",
    totalDebt,
    totalDebtWithInterest,
    totalInterest: totalDebtWithInterest - totalDebt,
    overduePeriod,
    maxOverdue: overduePeriod,
    items,
  };
};

const buildDebtSummaryFromSimpleDraft = (draft) => {
  const rows = [];
  if (draft.debtTypes.includes("은행대출")) {
    rows.push({
      id: "s-bank",
      debtType: "은행대출",
      amount: draft.bankLoan,
    });
  }
  if (draft.debtTypes.includes("카드론")) {
    rows.push({
      id: "s-card",
      debtType: "카드론",
      amount: draft.creditCardDebt,
    });
  }
  if (
    draft.debtTypes.includes("캐피탈") ||
    draft.debtTypes.includes("저축은행")
  ) {
    rows.push({
      id: "s-capital",
      debtType: draft.debtTypes.includes("캐피탈") ? "캐피탈" : "저축은행",
      amount: draft.capitalLoan,
    });
  }
  if (
    draft.debtTypes.includes("사채") ||
    draft.debtTypes.includes("개인차용")
  ) {
    rows.push({
      id: "s-private",
      debtType: draft.debtTypes.includes("사채") ? "사채" : "개인차용",
      amount: draft.privateLoan,
    });
  }
  return buildDebtSummaryFromSimpleRows(rows, draft.overduePeriod);
};

const buildDebtSummaryFromSimpleRows = (rows, overduePeriod = OverduePeriod.None) => {
  const items = rows
    .map((row, idx) => ({
      id: row.id || `s${idx}`,
      label: row.debtType || "기타",
      debtType: row.debtType || "",
      amount: parseInt(row.amount) || 0,
    }))
    .filter((i) => i.amount > 0);
  const totalDebt = items.reduce((s, i) => s + i.amount, 0);
  const overdue = normalizeSimpleOverdue(overduePeriod);
  return {
    mode: "simple",
    totalDebt,
    totalDebtWithInterest: totalDebt,
    totalInterest: 0,
    overduePeriod: overdue,
    maxOverdue: overdue,
    items,
  };
};

const aggregateByDebtType = (items) => {
  const map = {};
  (items || []).forEach((i) => {
    const type = i.debtType || i.label || "기타";
    if (!map[type]) {
      map[type] = { label: type, amount: 0, totalRepay: 0 };
    }
    map[type].amount += i.amount || 0;
    map[type].totalRepay += i.totalRepay || i.amount || 0;
  });
  const list = Object.values(map).filter((x) => x.amount > 0);
  const sum = list.reduce((s, x) => s + x.amount, 0) || 1;
  return list.map((x) => ({
    ...x,
    pct: Math.round((x.amount / sum) * 100),
  }));
};

const amountByDebtType = (items) => {
  const amounts = {
    bankLoan: "0",
    creditCardDebt: "0",
    capitalLoan: "0",
    privateLoan: "0",
  };
  const types = [];
  (items || []).forEach((i) => {
    const type = i.debtType || i.label || "";
    const amt = String(i.amount || 0);
    if (type === "은행대출" || type.includes("은행 대출")) {
      if (!types.includes("은행대출")) types.push("은행대출");
      amounts.bankLoan = String(
        (parseInt(amounts.bankLoan) || 0) + (parseInt(amt) || 0),
      );
    } else if (type === "카드론" || type.includes("카드")) {
      if (!types.includes("카드론")) types.push("카드론");
      amounts.creditCardDebt = String(
        (parseInt(amounts.creditCardDebt) || 0) + (parseInt(amt) || 0),
      );
    } else if (
      type === "캐피탈" ||
      type === "저축은행" ||
      type.includes("캐피탈")
    ) {
      const key = type === "저축은행" ? "저축은행" : "캐피탈";
      if (!types.includes(key)) types.push(key);
      amounts.capitalLoan = String(
        (parseInt(amounts.capitalLoan) || 0) + (parseInt(amt) || 0),
      );
    } else if (
      type === "사채" ||
      type === "개인차용" ||
      type.includes("사채")
    ) {
      const key = type === "개인차용" ? "개인차용" : "사채";
      if (!types.includes(key)) types.push(key);
      amounts.privateLoan = String(
        (parseInt(amounts.privateLoan) || 0) + (parseInt(amt) || 0),
      );
    }
  });
  return {
    debtTypes: types.length
      ? types
      : ["은행대출", "카드론", "캐피탈"],
    ...amounts,
  };
};

const itemsToDetailDebts = (items) => {
  if (!items?.length) return [emptyEditDebt()];
  return items.map((item, idx) => {
    const principalWon =
      item.principalWon ??
      (item.amount != null ? Math.round(Number(item.amount) * 10000) : 0);
    return {
      id: item.id || `edit-${idx}`,
      debtType: item.debtType || "은행대출",
      lender: item.lender || "",
      loanDate: item.loanDate || "",
      maturityDate: item.maturityDate || "",
      principal: String(principalWon || ""),
      rate: item.rate ?? "",
      repayMethod: item.repayMethod || "원리금균등",
      overduePeriod: String(parseOverdueMonths(item.overduePeriod)),
    };
  });
};

const simpleDraftToDetailDebts = (draft) => {
  const rows = [];
  const push = (debtType, manAmount) => {
    const amt = parseInt(manAmount) || 0;
    if (amt <= 0) return;
    rows.push({
      ...emptyEditDebt(),
      debtType,
      principal: String(amt * 10000),
      overduePeriod: String(parseOverdueMonths(draft.overduePeriod)),
    });
  };
  if (draft.debtTypes.includes("은행대출")) push("은행대출", draft.bankLoan);
  if (draft.debtTypes.includes("카드론")) push("카드론", draft.creditCardDebt);
  if (
    draft.debtTypes.includes("캐피탈") ||
    draft.debtTypes.includes("저축은행")
  ) {
    push(
      draft.debtTypes.includes("캐피탈") ? "캐피탈" : "저축은행",
      draft.capitalLoan,
    );
  }
  if (
    draft.debtTypes.includes("사채") ||
    draft.debtTypes.includes("개인차용")
  ) {
    push(
      draft.debtTypes.includes("사채") ? "사채" : "개인차용",
      draft.privateLoan,
    );
  }
  return rows.length ? rows : [emptyEditDebt()];
};

const summaryToDebtDraft = (summary) => {
  const mode = summary?.mode || "detail";
  const items = summary?.items || [];
  const simplePart = amountByDebtType(items);
  const overdue =
    mode === "simple"
      ? normalizeSimpleOverdue(summary?.overduePeriod)
      : monthsToOverduePeriod(
          parseOverdueMonths(
            summary?.overduePeriod ?? getMaxOverdueMonths(items),
          ),
        );
  return {
    debtInputMode: mode,
    ...simplePart,
    overduePeriod: overdue,
    debts: itemsToDetailDebts(items),
  };
};

const DEFAULT_DEBT_SUMMARY = buildDebtSummaryFromDetailRows(
  DEFAULT_DEBT_ITEMS.map((d) => ({
    ...d,
    principal: String(d.principalWon),
    principalWon: String(d.principalWon),
  })),
);

const SALES_REP = {
  name: "박지훈",
  branch: "강남영업점",
  thumb: "/images/thumb_sample1.png",
};

const TRANSMISSION_NOTES_KEY = "sdp_transmission_notes_1";

const BASE_TRANSMISSION_NOTES = [
  {
    id: "share-1",
    type: "share",
    authorName: SALES_REP.name,
    authorRole: "영업",
    authorMeta: SALES_REP.branch,
    datetime: "2026.06.28 15:42",
    message:
      "고객 소득 증빙 자료는 다음 주 월요일까지 수급 예정입니다. 사채 3천만원은 금융기관 대출이 아닌 점 참고 부탁드립니다.",
  },
  {
    id: "share-2",
    type: "share",
    authorName: SALES_REP.name,
    authorRole: "영업",
    authorMeta: SALES_REP.branch,
    datetime: "2026.06.27 09:10",
    message:
      "긴급 공유 건입니다. 고객이 이번 주 내 계약 의사가 있어 빠른 검토 부탁드립니다.",
  },
];

const REJECT_DEMO_NOTE = {
  id: "reject-demo",
  type: "reject",
  authorName: "이서연",
  authorRole: "변호사",
  authorMeta: "TG법무법인",
  datetime: "2026.06.26 14:30",
  message:
    "채무 목록에 미기재 항목이 있어 보입니다. 사채 채권자 정보 확인 후 재공유 부탁드립니다.",
};

const ACCEPT_DEMO_NOTE = {
  id: "accept-demo",
  type: "accept",
  authorName: "이서연",
  authorRole: "변호사",
  authorMeta: "TG법무법인",
  datetime: "2026.06.25 11:00",
  message: "분석 내용 확인했습니다. 계약 진행 시 바로 절차 착수 가능합니다.",
};

const PAYMENT_DEMO_NOTE = {
  id: "payment-demo",
  type: "payment",
  authorName: SALES_REP.name,
  authorRole: "영업",
  authorMeta: SALES_REP.branch,
  datetime: "2026.06.28 16:20",
  message: "총 700만원 · 분할 7회 · 첫 납부일 2026.06.28 · 개인회생 절차 시작",
};

const TRANSMISSION_AUTHOR_DEFAULTS = {
  share: {
    authorName: SALES_REP.name,
    authorRole: "영업",
    authorMeta: SALES_REP.branch,
  },
  accept: {
    authorName: "검토 변호사",
    authorRole: "변호사",
    authorMeta: "",
  },
  reject: {
    authorName: "검토 변호사",
    authorRole: "변호사",
    authorMeta: "",
  },
  payment: {
    authorName: SALES_REP.name,
    authorRole: "영업",
    authorMeta: SALES_REP.branch,
  },
  refund: {
    authorName: SALES_REP.name,
    authorRole: "영업",
    authorMeta: SALES_REP.branch,
  },
};

const buildPaymentNoteMessage = (fee, method, count, date, procId) => {
  const procLabel =
    {
      rehabilitation: "개인회생",
      rapidDebtAdj: "신속채무조정",
      preWorkout: "프리워크아웃",
      personalWorkout: "개인워크아웃",
      newStartFund: "새출발기금",
      bankruptcy: "파산",
    }[procId] || procId;
  const methodLabel = method === "lump" ? "일괄납부" : `분할 ${count}회`;
  const dateLabel = method === "lump" ? "납부일" : "첫 납부일";
  return `총 ${fee.toLocaleString()}만원 · ${methodLabel} · ${dateLabel} ${date} · ${procLabel} 절차 시작`;
};

const formatTransmissionDatetime = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const dedupeTransmissionNotes = (notes) => {
  const byId = new Map();
  notes.forEach((note) => byId.set(note.id, note));
  return [...byId.values()];
};

const loadTransmissionNotes = (isExternal) => {
  let stored = [];
  try {
    stored = JSON.parse(localStorage.getItem(TRANSMISSION_NOTES_KEY) || "[]");
  } catch {
    stored = [];
  }
  const notes = [...BASE_TRANSMISSION_NOTES, ...stored];
  const hasReject = notes.some((n) => n.type === "reject");
  const hasAccept = notes.some((n) => n.type === "accept");
  const hasPayment = notes.some((n) => n.type === "payment");
  if (!isExternal) {
    if (!hasReject) notes.push(REJECT_DEMO_NOTE);
    if (!hasAccept) notes.push(ACCEPT_DEMO_NOTE);
    if (!hasPayment) notes.push(PAYMENT_DEMO_NOTE);
  }
  return dedupeTransmissionNotes(notes).sort((a, b) =>
    b.datetime.localeCompare(a.datetime),
  );
};

const saveTransmissionNote = (type, message, authorOverride = {}) => {
  const author = { ...TRANSMISSION_AUTHOR_DEFAULTS[type], ...authorOverride };
  const note = {
    id: `${type}-${Date.now()}`,
    type,
    authorName: author.authorName,
    authorRole: author.authorRole,
    authorMeta: author.authorMeta,
    datetime: formatTransmissionDatetime(),
    message,
  };
  let stored = [];
  try {
    stored = JSON.parse(localStorage.getItem(TRANSMISSION_NOTES_KEY) || "[]");
  } catch {
    stored = [];
  }
  localStorage.setItem(
    TRANSMISSION_NOTES_KEY,
    JSON.stringify([...stored, note]),
  );
};

const TRANSMISSION_TYPE_LABEL = {
  share: "공유",
  accept: "수락",
  reject: "반려",
  payment: "결제",
  refund: "환불",
};

/* 수임료 결제 정보 (분할 납부) — 기본값 */
const PAYMENT = {
  totalFee: 700, // 총 수임료 (만원)
  method: "installment", // "installment" | "lump"
  installmentCount: 7,
  contractDate: "2026.06.28",
  installments: [
    {
      seq: 1,
      dueDate: "2026.06.28",
      amount: 100,
      status: "paid",
      paidDate: "2026.06.28",
    },
    {
      seq: 2,
      dueDate: "2026.07.28",
      amount: 100,
      status: "paid",
      paidDate: "2026.07.29",
    },
    {
      seq: 3,
      dueDate: "2026.08.28",
      amount: 100,
      status: "paid",
      paidDate: "2026.08.28",
    },
    {
      seq: 4,
      dueDate: "2026.09.28",
      amount: 100,
      status: "unpaid",
      paidDate: null,
    },
    {
      seq: 5,
      dueDate: "2026.10.28",
      amount: 100,
      status: "unpaid",
      paidDate: null,
    },
    {
      seq: 6,
      dueDate: "2026.11.28",
      amount: 100,
      status: "unpaid",
      paidDate: null,
    },
    {
      seq: 7,
      dueDate: "2026.12.28",
      amount: 100,
      status: "unpaid",
      paidDate: null,
    },
  ],
};
const TODAY_LABEL = "2026.06.28";

/* "YYYY.MM.DD" 문자열 ↔ Date 변환 및 회차별 일정 생성 */
const parseDotDate = (label) => {
  const [y, m, d] = label.split(".").map(Number);
  return new Date(y, m - 1, d);
};
const formatDotDate = (date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate(),
  ).padStart(2, "0")}`;
const addMonthsToDot = (label, months) => {
  const d = parseDotDate(label);
  d.setMonth(d.getMonth() + months);
  return formatDotDate(d);
};
const dotToIso = (label) => (label || "").replaceAll(".", "-");
const isoToDot = (iso) => (iso || "").replaceAll("-", ".");

/* 총 수임료·회차·첫 납부일을 기준으로 회차별 결제 일정을 생성 (나머지는 마지막 회차에 반영) */
const buildInstallments = (totalFee, count, contractDate) => {
  const n = Math.max(1, Math.round(count) || 1);
  const base = Math.floor(totalFee / n);
  const remainder = totalFee - base * n;
  return Array.from({ length: n }, (_, i) => ({
    seq: i + 1,
    dueDate: addMonthsToDot(contractDate, i),
    amount: i === n - 1 ? base + remainder : base,
    status: "unpaid",
    paidDate: null,
  }));
};

const OPTIONS = [
  {
    id: "rehabilitation",
    label: "개인회생",
    score: 78,
    grade: "양호",
    recommended: true,
    conditions: [
      { type: "pass", text: "월 가용 소득 45만원 확인 → 변제계획 수립 가능" },
      {
        type: "pass",
        text: "채무총액 3.1억원, 자산 1,500만원 → 채무초과 요건 충족",
      },
      { type: "pass", text: "연체 기간 6개월 → 지급 불능 상태 인정 가능" },
      {
        type: "caution",
        text: "자영업 소득 → 매출장부·세금계산서 등 소득증빙 별도 준비 필요",
      },
      {
        type: "caution",
        text: "사채 3,000만원 포함 → 불법 이자율 여부 확인 후 채권자 목록 정리 필요",
      },
      {
        type: "risk",
        text: "가용 소득 45만원이 최소 변제 기준에 근접 → 법원의 변제여력 판단에 따라 결과 변동 가능",
      },
    ],
  },
  {
    id: "rapidDebtAdj",
    label: "신속채무조정",
    group: "creditRecovery",
    score: 28,
    grade: "낮음",
    recommended: false,
    conditions: [
      {
        type: "pass",
        text: "총 채무 3.1억원 → 신복위 신청 기준(무담보 5억·담보 10억 이하) 충족",
      },
      {
        type: "risk",
        text: "연체 6개월 → 신속채무조정(연체 30일 이하) 대상 기간 초과",
      },
      {
        type: "risk",
        text: "원금 감면 없음(이자율 인하·분할상환 중심) → 감면 폭이 개인회생·개인워크아웃보다 작음",
      },
    ],
  },
  {
    id: "preWorkout",
    label: "프리워크아웃",
    group: "creditRecovery",
    score: 35,
    grade: "낮음",
    recommended: false,
    conditions: [
      {
        type: "pass",
        text: "총 채무 3.1억원 → 신복위 신청 기준(15억 이하) 충족",
      },
      {
        type: "risk",
        text: "연체 6개월 → 프리워크아웃(연체 31~89일) 대상 기간 초과",
      },
      {
        type: "caution",
        text: "원금 감면 없이 연체이자·이자율 조정이 중심 → 장기 연체 고객에게는 개인워크아웃이 더 적합",
      },
    ],
  },
  {
    id: "personalWorkout",
    label: "개인워크아웃",
    group: "creditRecovery",
    score: 62,
    grade: "보통",
    recommended: false,
    conditions: [
      {
        type: "pass",
        text: "총 채무 3.1억원 → 신복위 신청 기준(15억 이하) 충족",
      },
      {
        type: "pass",
        text: "연체 기간 6개월 → 개인워크아웃(연체 90일 이상) 자격 충족",
      },
      {
        type: "pass",
        text: "이자 전액 감면·원금 일부 감면 검토 가능 → 신용회복 제도 중 감면 폭이 가장 큼",
      },
      {
        type: "caution",
        text: "사채·비협약 채무는 대상 제외 가능 → 실질 감면 범위 사전 확인 필요",
      },
      {
        type: "risk",
        text: "채무 대비 가용 소득이 낮아 개인회생보다 감면·변제 조건이 불리할 수 있음",
      },
    ],
  },
  {
    id: "newStartFund",
    label: "새출발기금",
    score: 72,
    grade: "양호",
    recommended: false,
    conditions: [
      {
        type: "pass",
        text: "’20.4~’25.6 중 개인사업자·소상공인 사업 영위 → 새출발기금 대상 기간 충족",
      },
      {
        type: "pass",
        text: "연체 3개월 이상 → 부실차주 요건 충족 (원금 조정 검토 가능)",
      },
      {
        type: "pass",
        text: "금융권 사업·가계대출 포함 → 협약 금융회사 채무조정 대상 가능성 높음",
      },
      {
        type: "caution",
        text: "새출발기금 기신청 이력 없음 확인 필요 → 원칙적으로 1회만 신청 가능",
      },
      {
        type: "caution",
        text: "제외 업종(부동산 임대업 등) 및 법인 폐업 여부 사전 확인 필요",
      },
      {
        type: "risk",
        text: "가용 소득·재산 규모에 따라 원금 감면율이 달라짐 → 개인회생과 감면 폭 비교 필요",
      },
    ],
  },
  {
    id: "bankruptcy",
    label: "파산",
    score: 45,
    grade: "낮음",
    recommended: false,
    conditions: [
      { type: "pass", text: "채무초과 상태로 파산 신청 요건 충족" },
      {
        type: "pass",
        text: "이전 파산·회생 신청 이력 없음 → 기본 면책 결격 사유 없음",
      },
      {
        type: "caution",
        text: "자산 1,500만원 → 면책 심사 시 자산 처분 여부 검토 대상",
      },
      {
        type: "risk",
        text: "월 가용 소득 45만원 존재 → 변제 능력 있는 것으로 판단되어 파산보다 개인회생 권고",
      },
      {
        type: "risk",
        text: "파산 선고 시 일부 직종 취업 제한 및 신용 회복에 장기간 소요",
      },
    ],
  },
];

const CREDIT_RECOVERY_GROUP = "creditRecovery";
const CREDIT_RECOVERY_IDS = new Set(
  OPTIONS.filter((o) => o.group === CREDIT_RECOVERY_GROUP).map((o) => o.id),
);
const CREDIT_RECOVERY_CHILDREN = OPTIONS.filter(
  (o) => o.group === CREDIT_RECOVERY_GROUP,
);
const getCreditRecoverySummary = () => {
  const recommended = CREDIT_RECOVERY_CHILDREN.find((o) => o.recommended);
  const best = CREDIT_RECOVERY_CHILDREN.reduce((a, b) =>
    a.score >= b.score ? a : b,
  );
  return recommended || best;
};

/** 옵션 목록을 단독/그룹 블록으로 변환 */
const buildOptionBlocks = () => {
  const blocks = [];
  let creditInserted = false;
  OPTIONS.forEach((opt) => {
    if (opt.group === CREDIT_RECOVERY_GROUP) {
      if (!creditInserted) {
        blocks.push({
          type: "group",
          id: CREDIT_RECOVERY_GROUP,
          label: "신용회복",
          children: CREDIT_RECOVERY_CHILDREN,
          summary: getCreditRecoverySummary(),
        });
        creditInserted = true;
      }
      return;
    }
    blocks.push({ type: "option", option: opt });
  });
  return blocks;
};
const OPTION_BLOCKS = buildOptionBlocks();

const AI = { repaymentMonths: 84, repaymentAmount: 45 };

const SCRIPTS = [
  {
    phase: "첫 설명",
    text: "고객님, 현재 상황을 분석해 드렸습니다. 총 채무가 3억 1천만원이지만, 월 가용 소득 45만원이 확인되어 개인회생 절차를 통해 채무를 조정하실 수 있는 가능성이 높습니다.",
  },
  {
    phase: "핵심 설명",
    text: "개인회생을 신청하시면 법원을 통해 채무 일부를 탕감받고, 나머지를 최대 7년에 걸쳐 분납하게 됩니다. 고객님의 경우 월 45만원씩 84개월 변제 계획이 가능합니다.",
  },
  {
    phase: "우려 해소",
    text: "신청 즉시 채권자의 추심이 금지됩니다. 직장과 주거지도 보전되며, 3~6개월 내 결과가 나옵니다. 직장에는 원칙적으로 영향이 없으므로 걱정하지 않으셔도 됩니다.",
  },
  {
    phase: "다음 단계",
    text: "채무 증명서류와 소득증빙 서류를 준비해 주시면 됩니다. 오늘 상담 내용을 바탕으로 신청서 초안을 작성해 드리고, 법원 제출까지 함께 진행할 수 있습니다.",
  },
];

const AI_QUICK = [
  "사채가 있으면 개인회생이 어렵나요?",
  "월 가용소득이 줄어들면 어떻게 되나요?",
  "변제 기간을 단축할 수 있나요?",
  "신청 후 직장에 영향이 있나요?",
  "배우자 소득도 변제액에 포함되나요?",
];

const AI_ANSWERS = {
  "사채가 있으면 개인회생이 어렵나요?":
    "사채는 개인회생 채권자 목록에 포함시킬 수 있습니다. 다만 불법 고금리 사채라면 이자 부분이 무효 처리될 수 있어 원금만 인정됩니다. 김민수 고객의 경우 사채 3,000만원에 대해 이자율 확인 후 실 채무를 재산정하면 성공 가능성이 더 높아질 수 있습니다.",
  "월 가용소득이 줄어들면 어떻게 되나요?":
    "현재 월 가용소득 45만원은 최소 변제 기준에 근접한 수준입니다. 만약 30만원 이하로 떨어지면 법원이 변제여력 없음으로 판단해 파산으로 전환해야 할 가능성이 높습니다. 소득 감소가 예상된다면 현시점에서 조속히 신청하는 것이 유리합니다.",
  "변제 기간을 단축할 수 있나요?":
    "법원이 인가한 변제계획 기준(최대 84개월)보다 빨리 갚으면 조기 종결이 가능합니다. 단, 변제계획 변경 신청이 필요하며 법원 허가를 받아야 합니다. 고객의 소득이 향후 개선된다면 조기 변제를 적극 검토할 수 있습니다.",
  "신청 후 직장에 영향이 있나요?":
    "일반 사기업 직원의 경우 개인회생·파산은 원칙적으로 해고 사유가 되지 않습니다. 다만 금융기관·공무원·일부 자격증 보유 직종은 결격 사유가 될 수 있습니다. 자영업자인 김민수 고객은 사업자 폐업 없이도 신청 가능하나, 세금 체납이 있다면 사전 정리가 필요합니다.",
  "배우자 소득도 변제액에 포함되나요?":
    "배우자 소득은 직접 변제 대상은 아니지만, 가계 전체 생활비 산정 시 반영됩니다. 배우자 소득이 있으면 신청인의 생활비 인정액이 줄어들어 가용소득(변제액)이 늘어날 수 있습니다. 현재 고객 정보에서는 배우자 소득이 없는 것으로 입력되어 있습니다.",
};

const INITIAL_AI_MSG = {
  role: "ai",
  text: `김민수 고객의 분석이 완료됐습니다. 총 채무 3.1억원, 월 가용소득 45만원 기준으로 **개인회생** 신청 가능성이 가장 높게 평가됐습니다 (78/100). 추가로 궁금하신 사항을 질문해 주세요.`,
};

const SMS_TEMPLATES = [
  {
    id: "docs",
    label: "필요 서류 안내",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="3"
          y="1.5"
          width="10"
          height="13"
          rx="1.5"
          stroke="#555"
          strokeWidth="1.3"
        />
        <path
          d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3"
          stroke="#555"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
    message: `안녕하세요, 김민수 고객님.\n\n개인회생 신청을 위해 아래 서류를 준비해 주시기 바랍니다.\n\n[필수 서류]\n✅ 주민등록등본 1부\n✅ 소득 증빙 서류 (사업자 매출장부, 세금계산서)\n✅ 채무 증명서류 (각 금융기관 대출 잔액증명서)\n✅ 재산 목록 (부동산·차량 없을 시 무재산 확인서)\n✅ 가족관계증명서 1부\n\n서류 준비에 어려움이 있으시면 언제든지 연락 주세요.\n\n감사합니다.`,
  },
  {
    id: "schedule",
    label: "상담 일정 안내",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="3"
          width="12"
          height="11"
          rx="1.5"
          stroke="#555"
          strokeWidth="1.3"
        />
        <path
          d="M5 2v2M11 2v2M2 6.5h12"
          stroke="#555"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="8" cy="10" r="1.2" fill="#555" />
      </svg>
    ),
    message: `안녕하세요, 김민수 고객님.\n\n다음 상담 일정을 안내드립니다.\n\n📅 일정: 2026년 7월 5일 (토) 오전 10시\n📍 장소: 사무실 내방 (강남역)\n⏱ 소요 시간: 약 60분\n\n상담 시 이전에 안내드린 서류를 지참해 주시면 더욱 원활한 진행이 가능합니다.\n\n일정 변경이 필요하시면 010-XXXX-XXXX로 연락 주세요.\n\n감사합니다.`,
  },
  {
    id: "result",
    label: "분석 결과 공유",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="#555" strokeWidth="1.3" />
        <path
          d="M8 5v3.5l2 1.5"
          stroke="#555"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    message: `안녕하세요, 김민수 고객님.\n\n분석 결과를 공유드립니다.\n\n📊 개인회생 성공 가능성: 78/100 (양호)\n💡 추천 절차: 개인회생\n\n[주요 분석 내용]\n• 월 가용소득 45만원으로 변제 계획 수립 가능\n• 채무초과 요건 충족 (총 채무 3.1억, 자산 1,500만원)\n• 자영업 소득 증빙 서류 별도 준비 필요\n\n자세한 내용은 상담 시 설명드리겠습니다.\n\n감사합니다.`,
  },
  {
    id: "custom",
    label: "직접 작성",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 13l2.5-.5L13 5l-2-2L2.5 11.5 2 13z"
          stroke="#555"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 3.5l2 2"
          stroke="#555"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
    message: `안녕하세요, 김민수 고객님.\n\n`,
  },
];

/* 신용회복(신속·프리·개인워크아웃) 공통 절차 생성 */
const makeCreditRecoveryProc = ({
  id,
  label,
  color,
  eligibilityItems,
  reliefItems,
  applyNote,
}) => ({
  id,
  label,
  color,
  totalMonths: "최대 120개월",
  steps: [
    {
      id: 1,
      title: "신청 자격 확인",
      durationLabel: "—",
      durationWeeks: 0,
      details: {
        desc: `신용회복위원회 ${label} 신청 요건을 사전 확인하는 단계입니다.`,
        items: eligibilityItems,
        caution: null,
      },
    },
    {
      id: 2,
      title: "신청서 접수",
      durationLabel: "1~2주",
      durationWeeks: 1.5,
      details: {
        desc: "신용회복위원회에 신청서 및 관련 서류를 제출하는 단계입니다.",
        items: [
          "신용회복지원(상담) 신청서",
          "신분증",
          "소득 증빙자료",
          "채무·가계수지 현황",
        ],
        note: applyNote,
        caution: null,
      },
    },
    {
      id: 3,
      title: "채권자 동의 절차",
      durationLabel: "1~2개월",
      durationWeeks: 6,
      details: {
        desc: "신용회복위원회가 각 채권 금융기관에 조정안을 통보하고 동의를 받는 단계입니다.",
        items: [
          "채권기관별 조정안 검토",
          "채권기관 동의 여부 통보",
          "동의율 미달 시 조정 불가",
        ],
        caution: "전체 채권기관의 과반수 이상이 동의해야 조정이 확정됩니다.",
      },
    },
    {
      id: 4,
      title: "조정 확정",
      durationLabel: "2~4주",
      durationWeeks: 3,
      details: {
        desc: `채권자 동의를 받아 ${label} 조건이 최종 확정되는 단계입니다.`,
        items: reliefItems,
        caution: null,
      },
    },
    {
      id: 5,
      title: "분할상환 시작",
      durationLabel: "확정 조건에 따라 (최대 120개월)",
      durationWeeks: 480,
      details: {
        desc: "확정된 조건에 따라 매월 분할 납부하는 단계입니다.",
        items: [
          "매월 정해진 금액 납부",
          "납부 중 소득 변동 시 재조정 신청 가능",
          "성실 납부 시 신용 회복 효과",
        ],
        caution: "2회 이상 미납 시 조정 취소될 수 있습니다.",
      },
    },
    {
      id: 6,
      title: "조정 완료",
      durationLabel: "—",
      durationWeeks: 0,
      details: {
        desc: `모든 분할상환이 완료되고 ${label} 절차가 종료되는 단계입니다.`,
        items: ["완납 확인서 수령", "신용정보 회복 확인", "채무 소멸 확인"],
        caution: null,
      },
    },
  ],
});

/* ── 절차 데이터 ── */
const PROCEDURES = {
  rehabilitation: {
    id: "rehabilitation",
    label: "개인회생",
    color: "#2563eb",
    totalMonths: "42~54개월",
    steps: [
      {
        id: 1,
        title: "신청 전 상담",
        durationLabel: "—",
        durationWeeks: 0,
        details: {
          desc: "법원 신청 전 개인회생 요건 해당 여부를 검토하는 단계입니다.",
          items: [
            "채무 총액 확인 (무담보 10억 이하 / 담보 15억 이하)",
            "월 가용 소득 존재 여부 확인",
            "연체 현황 및 압류·소송 확인",
            "기존 파산·회생 이력 확인",
          ],
          caution: null,
        },
      },
      {
        id: 2,
        title: "신청서 작성 및 접수",
        durationLabel: "1~2주",
        durationWeeks: 1.5,
        details: {
          desc: "법원에 개인회생 신청서와 첨부 서류를 제출하고 사건번호를 부여받는 단계입니다.",
          items: [
            "개인회생 신청서",
            "채권자 목록",
            "재산 목록",
            "수입·지출 목록",
            "변제계획안",
            "소득 증빙자료 (급여명세서, 세금계산서 등)",
          ],
          note: "접수 후 법원 사건번호가 부여됩니다.",
          caution: null,
        },
      },
      {
        id: 3,
        title: "금지명령·중지명령",
        durationLabel: "신청 후 1~4주",
        durationWeeks: 2,
        details: {
          desc: "신청 후 법원 판단에 따라 채권자의 강제집행 등을 막는 명령이 내려질 수 있습니다.",
          items: [
            "채권자의 전화·서면 독촉 중지",
            "급여·통장 압류 중지",
            "강제집행 정지",
          ],
          caution:
            "금지명령은 모든 사건에서 자동으로 인정되는 것은 아닙니다. 법원의 재량에 따라 발령 여부가 결정됩니다.",
        },
      },
      {
        id: 4,
        title: "보정권고·보정명령",
        durationLabel: "1~3개월",
        durationWeeks: 8,
        details: {
          desc: "법원이 서류를 검토하면서 추가 자료를 요구하는 단계로, 실무에서 가장 중요한 단계입니다.",
          items: [
            "최근 대출 사용처 소명",
            "카드 사용내역 제출",
            "재산 관계 확인 자료",
            "소득 확인 서류 (추가)",
            "배우자 재산 관련 자료",
          ],
          caution:
            "보정 기한을 놓치면 사건이 기각될 수 있으므로 기한 관리가 매우 중요합니다.",
        },
      },
      {
        id: 5,
        title: "개시결정",
        durationLabel: "1개월 내외",
        durationWeeks: 4,
        details: {
          desc: "법원이 개인회생 절차를 진행하기로 결정하는 단계입니다.",
          items: [
            "정식 회생 절차 시작",
            "채권자 이의기간 진행",
            "개시결정 공고",
          ],
          caution: null,
        },
      },
      {
        id: 6,
        title: "채권자집회",
        durationLabel: "1~2개월",
        durationWeeks: 6,
        details: {
          desc: "채권자가 변제계획에 의견을 내는 절차입니다. 대부분 형식적으로 진행됩니다.",
          items: [
            "채무 발생 경위 설명",
            "현재 소득·재산 현황 확인",
            "재산 은닉 여부 검토",
          ],
          caution:
            "채무 발생 과정이 불명확하거나 재산 은닉 의심이 있는 경우 이의가 제기될 수 있습니다.",
        },
      },
      {
        id: 7,
        title: "인가결정",
        durationLabel: "1개월 내외",
        durationWeeks: 4,
        details: {
          desc: "법원이 변제계획을 최종 승인하는 단계입니다.",
          items: ["변제계획 내용 확정", "인가 후 계획대로 변제 의무 발생"],
          example:
            "예) 채무 1억 5천만원 → 월 변제금 100만원 × 36개월 = 3,600만원 변제 후 나머지 면책 대상",
          caution: null,
        },
      },
      {
        id: 8,
        title: "변제 수행",
        durationLabel: "36개월 (경우에 따라 60개월)",
        durationWeeks: 156,
        details: {
          desc: "인가된 변제계획대로 매월 납부하는 단계입니다.",
          items: [
            "매월 정해진 금액 변제",
            "소득 변동 시 변제계획 변경 신청 가능",
            "정해진 기간 동안 성실히 납부",
          ],
          caution:
            "변제를 중단하거나 미납이 누적되면 인가취소로 이어질 수 있습니다.",
        },
      },
      {
        id: 9,
        title: "면책결정",
        durationLabel: "변제 완료 후 1~2개월",
        durationWeeks: 6,
        details: {
          desc: "변제 완료 후 법원이 면책을 결정하면 남은 채무가 면제됩니다.",
          items: [
            "변제 완료 보고서 제출",
            "법원 면책 심사",
            "면책결정 시 잔여 채무 면제",
          ],
          caution:
            "파산·면책 이력은 신용정보에 기록되며 일정 기간 금융 활동에 제한이 있을 수 있습니다.",
        },
      },
    ],
  },
  rapidDebtAdj: makeCreditRecoveryProc({
    id: "rapidDebtAdj",
    label: "신속채무조정",
    color: "#0d9488",
    eligibilityItems: [
      "연체 전 또는 연체 30일 이하",
      "총 채무액 15억원 이하 (무담보 5억·담보 10억)",
      "채권금융기관이 신용회복지원협약 가입 기관",
      "최저생계비 이상 수입 또는 상환 가능 인정",
    ],
    reliefItems: [
      "연체이자 감면",
      "약정이자율 30~50% 범위 인하",
      "최장 10년 분할상환",
    ],
    applyNote: "온라인(신복위) 또는 방문 신청 가능",
  }),
  preWorkout: makeCreditRecoveryProc({
    id: "preWorkout",
    label: "프리워크아웃",
    color: "#059669",
    eligibilityItems: [
      "연체 31일 이상 89일 미만",
      "총 채무액 15억원 이하 (무담보 5억·담보 10억)",
      "채권금융기관이 신용회복지원협약 가입 기관",
      "최저생계비 이상 수입 또는 상환 가능 인정",
    ],
    reliefItems: [
      "연체이자 감면",
      "약정이자율 30~70% 범위 인하",
      "최장 10년 분할상환 (원금 감면 없음)",
    ],
    applyNote: "온라인(신복위) 또는 방문 신청 가능",
  }),
  personalWorkout: makeCreditRecoveryProc({
    id: "personalWorkout",
    label: "개인워크아웃",
    color: "#047857",
    eligibilityItems: [
      "연체 90일(3개월) 이상",
      "총 채무액 15억원 이하 (무담보 5억·담보 10억)",
      "최근 6개월 신규 채무가 총 채무의 30% 미만",
      "채권금융기관이 신용회복지원협약 가입 기관",
    ],
    reliefItems: [
      "이자 전액 감면",
      "원금 일부 감면 (상각채권 최대 70%, 취약계층 최대 90%)",
      "최장 10년 분할상환",
    ],
    applyNote: "방문 신청이 원칙 (온라인 제한적)",
  }),
  newStartFund: {
    id: "newStartFund",
    label: "새출발기금",
    color: "#d97706",
    totalMonths: "최장 20년 (신용대출 10년)",
    steps: [
      {
        id: 1,
        title: "신청 자격 확인",
        durationLabel: "—",
        durationWeeks: 0,
        details: {
          desc: "소상공인·자영업자 새출발기금 지원 대상 요건을 사전 확인하는 단계입니다.",
          items: [
            "’20.4월~’25.6월 중 개인사업자·법인 소상공인 사업 영위 (휴업·폐업 포함, 폐업 법인 제외)",
            "부실차주(3개월 이상 연체) 또는 부실우려차주 해당",
            "협약 금융회사 대출(사업·가계) 보유, 최대 15억원",
            "제외 업종·기신청 이력·고액재산가 등 결격 사유 확인",
          ],
          caution: "새출발기금 신청은 원칙적으로 1회만 가능합니다.",
        },
      },
      {
        id: 2,
        title: "신청서 접수",
        durationLabel: "1~2주",
        durationWeeks: 1.5,
        details: {
          desc: "온라인(새출발기금.kr) 또는 상담창구(캠코·서민금융통합지원센터)로 신청하는 단계입니다.",
          items: [
            "본인인증 및 정보제공 동의",
            "신청자격 확인",
            "채무내역 조회",
            "추가정보 작성 및 신청접수 완료",
          ],
          note: "법인 소상공인은 소상공인 확인서 발급 후 신청합니다. 프리랜서·특고는 상담창구 신청이 가능합니다.",
          caution: null,
        },
      },
      {
        id: 3,
        title: "채무조정 심사",
        durationLabel: "2~8주",
        durationWeeks: 5,
        details: {
          desc: "부실/부실우려 유형에 따라 캠코 또는 신용회복위원회에서 채무조정안을 심사하는 단계입니다.",
          items: [
            "부실차주 → 새출발기금·캠코 경로로 원금·상환기간 조정 심사",
            "부실우려차주 → 신용회복위원회를 통한 금리·상환기간 조정 심사",
            "보유재산·상환능력 반영",
            "신청 익일부터 추심중단·강제집행 중지",
          ],
          caution: null,
        },
      },
      {
        id: 4,
        title: "채무조정안 확정",
        durationLabel: "2~4주",
        durationWeeks: 3,
        details: {
          desc: "심사 결과를 반영해 채무조정 조건이 확정되는 단계입니다.",
          items: [
            "상환기간 조정: 거치 최대 3년(신용대출 1년), 최장 20년 분할상환(신용대출 10년)",
            "부실차주: 보유재산 반영 원금 조정(0~80%, 취약계층 최대 90%)",
            "부실우려차주: 금리 조정",
          ],
          caution: null,
        },
      },
      {
        id: 5,
        title: "분할상환 시작",
        durationLabel: "확정 조건에 따라 (최장 240개월)",
        durationWeeks: 480,
        details: {
          desc: "확정된 채무조정안에 따라 분할 상환을 이행하는 단계입니다.",
          items: [
            "매월 정해진 금액 납부",
            "부실우려차주가 90일 이상 미이행 시 부실차주 지원으로 재조정 가능",
            "성실 상환 시 신용 회복 효과",
          ],
          caution: "약정 불이행 시 조정 혜택이 취소될 수 있습니다.",
        },
      },
      {
        id: 6,
        title: "조정 완료",
        durationLabel: "—",
        durationWeeks: 0,
        details: {
          desc: "분할상환이 완료되고 새출발기금 채무조정이 종료되는 단계입니다.",
          items: [
            "완납·종결 확인",
            "신용정보 반영 확인",
            "잔여 채무 소멸·정리 확인",
          ],
          caution: null,
        },
      },
    ],
  },
  bankruptcy: {
    id: "bankruptcy",
    label: "파산·면책",
    color: "#dc2626",
    totalMonths: "6~18개월",
    steps: [
      {
        id: 1,
        title: "신청 전 상담",
        durationLabel: "—",
        durationWeeks: 0,
        details: {
          desc: "파산·면책 신청 전 요건 해당 여부를 검토하는 단계입니다.",
          items: [
            "지급불능 상태 확인 (채무 > 자산, 소득으로 변제 불가)",
            "재산 현황 파악",
            "면책 불허가 사유 검토 (사기, 낭비 등)",
            "소득 유무에 따른 개인회생과의 비교 검토",
          ],
          caution: null,
        },
      },
      {
        id: 2,
        title: "신청서 작성·접수",
        durationLabel: "1~2주",
        durationWeeks: 1.5,
        details: {
          desc: "법원에 파산 및 면책 신청서와 첨부 서류를 제출하는 단계입니다.",
          items: [
            "파산·면책 신청서",
            "채권자 목록",
            "재산 목록",
            "수입·지출 목록",
            "진술서 (채무 발생 경위 등)",
          ],
          note: "파산신청과 면책신청을 동시에 제출하는 것이 일반적입니다.",
          caution: null,
        },
      },
      {
        id: 3,
        title: "파산선고",
        durationLabel: "1~3개월",
        durationWeeks: 8,
        details: {
          desc: "법원이 파산을 선고하는 단계로, 이후 재산관리 권한이 파산관재인에게 넘어갑니다.",
          items: ["법원의 파산 요건 심사", "파산선고 결정", "파산관재인 선임"],
          caution: null,
        },
      },
      {
        id: 4,
        title: "파산관재인 조사",
        durationLabel: "1~3개월",
        durationWeeks: 8,
        details: {
          desc: "파산관재인이 재산 현황을 조사하고 채권자에게 배당하는 단계입니다.",
          items: [
            "재산 조사 및 목록 작성",
            "채권자 신고 접수",
            "배당 가능 재산 환가",
            "채권자에게 배당 (자산이 적으면 배당 없이 종결)",
          ],
          caution: "이 기간 동안 재산 처분이 제한됩니다.",
        },
      },
      {
        id: 5,
        title: "면책 심문",
        durationLabel: "1~2개월",
        durationWeeks: 6,
        details: {
          desc: "법원이 면책 허가 여부를 판단하는 단계입니다.",
          items: [
            "면책 불허가 사유 검토",
            "채무자 심문 (필요 시 출석)",
            "채권자 이의 여부 확인",
          ],
          caution:
            "도박, 낭비, 사기 등으로 채무가 발생한 경우 면책이 불허가될 수 있습니다.",
        },
      },
      {
        id: 6,
        title: "면책결정",
        durationLabel: "—",
        durationWeeks: 0,
        details: {
          desc: "법원이 면책을 결정하면 파산절차가 완료되고 채무가 면제됩니다.",
          items: [
            "면책결정 확정",
            "모든 채무 면제 (면책 제외 채무 제외)",
            "신용정보 기록 (일정 기간)",
          ],
          caution:
            "면책 제외 채무: 세금, 양육비, 벌금, 고의·과실 손해배상채무 등은 면책되지 않습니다.",
        },
      },
    ],
  },
};

const calcRemainingWeeks = (steps, currentStepId) => {
  const idx = steps.findIndex((s) => s.id === currentStepId);
  if (idx < 0) return 0;
  return steps.slice(idx).reduce((sum, s) => sum + s.durationWeeks, 0);
};

const weeksToLabel = (weeks) => {
  if (weeks === 0) return "—";
  if (weeks < 4) return `약 ${Math.round(weeks)}주`;
  const months = Math.round(weeks / 4);
  if (months < 12) return `약 ${months}개월`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `약 ${years}년 ${rem}개월` : `약 ${years}년`;
};

const procStorageKey = (clientId, procId) => `proc_step_${clientId}_${procId}`;

const INTERNAL_STAFF = { name: "이수민", role: "내부 상담사" };
const SALES_STAFF = {
  name: SALES_REP.name,
  role: `${SALES_REP.branch} 출장담당자`,
};

/* 단계별 설정자 샘플 데이터 */
const STEP_SETTERS = {
  rehabilitation: {
    1: { ...INTERNAL_STAFF, at: "2026.06.20 10:15" },
    2: { ...INTERNAL_STAFF, at: "2026.06.22 14:30" },
    3: { ...SALES_STAFF, at: "2026.06.24 09:40" },
    4: { ...SALES_STAFF, at: "2026.06.25 11:05" },
  },
  rapidDebtAdj: {
    1: { ...INTERNAL_STAFF, at: "2026.06.21 09:00" },
    2: { ...SALES_STAFF, at: "2026.06.22 11:30" },
  },
  preWorkout: {
    1: { ...INTERNAL_STAFF, at: "2026.06.21 09:30" },
    2: { ...SALES_STAFF, at: "2026.06.23 13:10" },
  },
  personalWorkout: {
    1: { ...INTERNAL_STAFF, at: "2026.06.21 10:00" },
    2: { ...SALES_STAFF, at: "2026.06.23 14:00" },
  },
  newStartFund: {
    1: { ...INTERNAL_STAFF, at: "2026.06.21 11:00" },
    2: { ...SALES_STAFF, at: "2026.06.23 15:20" },
  },
  bankruptcy: {
    1: { ...INTERNAL_STAFF, at: "2026.06.19 10:00" },
    2: { ...SALES_STAFF, at: "2026.06.21 14:20" },
  },
};

/* 링 게이지 컴포넌트 */
const Ring = ({ score, size = 130, strokeWidth = 7 }) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const c = size / 2;
  /*
   * 순서: 성공 가능성(상단) → 78(중앙 크게) → /100(하단)
   * SVG text.y = baseline 기준, cap height ≈ fontSize×0.72
   * 3줄 블록 전체 시각 중심이 c가 되도록 y 계산
   *   yL = c - s×0.14   (레이블 baseline)
   *   yS = c + s×0.09   (점수 baseline)
   *   yD = c + s×0.20   (/100 baseline)
   * 검증(s=150): top≈44.8, bottom≈106 → center≈75.4 ✓
   */
  const yL = c - size * 0.15;
  const yS = c + size * 0.1;
  const yD = c + size * 0.21;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke="#f0f0f0"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke="#111"
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x={c}
        y={yL}
        textAnchor="middle"
        fontSize={size * 0.085}
        fill="#999"
        letterSpacing="0.3"
      >
        성공 가능성
      </text>
      <text
        x={c}
        y={yS}
        textAnchor="middle"
        fontSize={size * 0.26}
        fontWeight="800"
        fill="#111"
        letterSpacing="-1"
      >
        {score}
      </text>
      <text x={c} y={yD} textAnchor="middle" fontSize={size * 0.09} fill="#bbb">
        /100
      </text>
    </svg>
  );
};

const SampleDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  /* /checklist/result-external 경로에서는 내부 전용 섹션 숨김 */
  const isExternal = location.pathname === "/checklist/result-external";
  const [activeScript, setActiveScript] = useState(0);
  const [smsModal, setSmsModal] = useState(null); // null | SMS_TEMPLATES item
  const [smsText, setSmsText] = useState("");
  const [selectedOption, setSelectedOption] = useState("rehabilitation");
  const [creditRecoveryOpen, setCreditRecoveryOpen] = useState(() =>
    CREDIT_RECOVERY_CHILDREN.some((o) => o.recommended),
  );
  const [procSelectCreditOpen, setProcSelectCreditOpen] = useState(false);

  /* 절차 안내 상태 */
  const [procOpenSteps, setProcOpenSteps] = useState(new Set([1]));
  const [procCurrentStep, setProcCurrentStep] = useState(() => {
    const saved = localStorage.getItem(procStorageKey(1, "rehabilitation"));
    return saved ? parseInt(saved) : null;
  });

  const [chatMessages, setChatMessages] = useState([INITIAL_AI_MSG]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  /* 변호사 분석 데이터 검토 상태 (외부 뷰) */
  const [reviewStatus, setReviewStatus] = useState("pending"); // pending | accepted | rejected
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState("");
  const [transmissionNotes, setTransmissionNotes] = useState(() =>
    loadTransmissionNotes(isExternal),
  );

  useEffect(() => {
    setTransmissionNotes(loadTransmissionNotes(isExternal));
  }, [isExternal]);

  /* 수임료 결제 정보 상태 */
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentConfigured, setPaymentConfigured] = useState(false); // 결제 조건 입력 여부 (false = 입력 전 상태)
  const [payTotalFee, setPayTotalFee] = useState(PAYMENT.totalFee);
  const [payMethod, setPayMethod] = useState(PAYMENT.method);
  const [payInstallmentCount, setPayInstallmentCount] = useState(
    PAYMENT.installmentCount,
  );
  const [payContractDate, setPayContractDate] = useState(PAYMENT.contractDate);
  const [installments, setInstallments] = useState(PAYMENT.installments);
  const [paymentCanceled, setPaymentCanceled] = useState(false);
  const [stopType, setStopType] = useState(null); // null | "suspended" | "refunded"
  const [canceledAt, setCanceledAt] = useState(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundMessage, setRefundMessage] = useState("");

  /* 회차 납부 처리 시 납부일 지정 UI 상태 */
  const [dateEditSeq, setDateEditSeq] = useState(null);
  const [dateEditValue, setDateEditValue] = useState("");

  /* 결제 조건 입력(수정) 폼 상태 — 입력 전 상태에서도 이 폼이 그대로 사용됨 */
  const [payEditing, setPayEditing] = useState(false);
  const [draftTotalFee, setDraftTotalFee] = useState(String(PAYMENT.totalFee));
  const [draftMethod, setDraftMethod] = useState(PAYMENT.method);
  const [draftCount, setDraftCount] = useState(
    String(PAYMENT.installmentCount),
  );
  const [draftDate, setDraftDate] = useState(PAYMENT.contractDate);

  /* 결제 적용 시 진행 절차 선택 모달 */
  const [procSelectModalOpen, setProcSelectModalOpen] = useState(false);
  const [draftSelectedProc, setDraftSelectedProc] = useState("rehabilitation");
  const pendingPaymentApplyRef = useRef(null);

  /* 채무 구성 자세히보기 / 수정 */
  const [debtSummary, setDebtSummary] = useState(
    () => location.state?.debtSummary || DEFAULT_DEBT_SUMMARY,
  );
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [debtConfirmOpen, setDebtConfirmOpen] = useState(false);
  const [debtReanalyzing, setDebtReanalyzing] = useState(false);
  const [debtDraft, setDebtDraft] = useState(() =>
    summaryToDebtDraft(location.state?.debtSummary || DEFAULT_DEBT_SUMMARY),
  );

  const openDebtModal = () => {
    setDebtDraft(summaryToDebtDraft(debtSummary));
    setDebtModalOpen(true);
  };

  const closeDebtModal = () => {
    setDebtModalOpen(false);
    setDebtConfirmOpen(false);
  };

  const setDebtDraftField = (field) => (value) => {
    setDebtDraft((p) => ({ ...p, [field]: value }));
  };

  const setDebtDraftInput = (field) => (e) => {
    setDebtDraft((p) => ({ ...p, [field]: e.target.value }));
  };

  const switchDebtDraftMode = (nextMode) => {
    setDebtDraft((p) => {
      if (p.debtInputMode === nextMode) return p;
      if (nextMode === "detail") {
        const hasDetail =
          p.debts?.some((d) => (parseInt(d.principal) || 0) > 0) ?? false;
        return {
          ...p,
          debtInputMode: "detail",
          debts: hasDetail ? p.debts : simpleDraftToDetailDebts(p),
          overduePeriod: hasDetail
            ? getMaxOverdueMonths(p.debts)
            : String(parseOverdueMonths(p.overduePeriod)),
        };
      }
      const simplePart = amountByDebtType(
        (p.debts || []).map((d) => ({
          debtType: d.debtType,
          amount: wonToMan(d.principal),
          overduePeriod: d.overduePeriod,
        })),
      );
      return {
        ...p,
        debtInputMode: "simple",
        ...simplePart,
        overduePeriod: monthsToOverduePeriod(
          getMaxOverdueMonths(p.debts) || parseOverdueMonths(p.overduePeriod),
        ),
      };
    });
  };

  const updateDraftDebt = (id, field, value) => {
    setDebtDraft((p) => {
      const debts = p.debts.map((d) =>
        d.id === id ? { ...d, [field]: value } : d,
      );
      return {
        ...p,
        debts,
        overduePeriod: getMaxOverdueMonths(debts),
      };
    });
  };

  const addDraftDebt = () => {
    setDebtDraft((p) => {
      const debts = [...p.debts, emptyEditDebt()];
      return {
        ...p,
        debts,
        overduePeriod: getMaxOverdueMonths(debts),
      };
    });
  };

  const removeDraftDebt = (id) => {
    setDebtDraft((p) => {
      if (p.debts.length <= 1) return p;
      const debts = p.debts.filter((d) => d.id !== id);
      return {
        ...p,
        debts,
        overduePeriod: getMaxOverdueMonths(debts),
      };
    });
  };

  const draftSimpleTotal =
    (debtDraft.debtTypes.includes("은행대출")
      ? parseInt(debtDraft.bankLoan) || 0
      : 0) +
    (debtDraft.debtTypes.includes("카드론")
      ? parseInt(debtDraft.creditCardDebt) || 0
      : 0) +
    (debtDraft.debtTypes.includes("캐피탈") ||
    debtDraft.debtTypes.includes("저축은행")
      ? parseInt(debtDraft.capitalLoan) || 0
      : 0) +
    (debtDraft.debtTypes.includes("사채") ||
    debtDraft.debtTypes.includes("개인차용")
      ? parseInt(debtDraft.privateLoan) || 0
      : 0);

  const draftDetailCalcs = (debtDraft.debts || []).map((debt) => ({
    debt,
    calc: calcDebtItem(debt),
  }));
  const draftDetailPrincipalWon = draftDetailCalcs.reduce(
    (s, { debt }) => s + (parseInt(debt.principal) || 0),
    0,
  );
  const draftDetailTotalRepayWon = draftDetailCalcs.reduce(
    (s, { debt, calc }) =>
      s + (calc ? calc.totalRepay : parseInt(debt.principal) || 0),
    0,
  );
  const draftDetailTotalInterestWon = draftDetailCalcs.reduce(
    (s, { calc }) => s + (calc ? calc.totalInterest : 0),
    0,
  );
  const draftDetailMonthlySumWon = draftDetailCalcs.reduce(
    (s, { calc }) => s + (calc ? calc.monthly : 0),
    0,
  );

  const buildEditedDebtSummary = () => {
    if (debtDraft.debtInputMode === "simple") {
      return buildDebtSummaryFromSimpleDraft(debtDraft);
    }
    return buildDebtSummaryFromDetailRows(debtDraft.debts);
  };

  const handleDebtApply = () => {
    setDebtConfirmOpen(true);
  };

  const applyDebtSummary = (next, { reanalyze }) => {
    if (reanalyze) {
      setDebtConfirmOpen(false);
      setDebtModalOpen(false);
      setDebtReanalyzing(true);
      setTimeout(() => {
        setDebtSummary(next);
        setDebtReanalyzing(false);
      }, 1800);
      return;
    }
    setDebtSummary(next);
    setDebtConfirmOpen(false);
    setDebtModalOpen(false);
  };

  const handleDebtSaveOnly = () => {
    applyDebtSummary(buildEditedDebtSummary(), { reanalyze: false });
  };

  const handleDebtReanalyze = () => {
    applyDebtSummary(buildEditedDebtSummary(), { reanalyze: true });
  };

  const startMarkPaid = (seq) => {
    setDateEditSeq(seq);
    setDateEditValue(dotToIso(TODAY_LABEL));
  };

  const cancelMarkPaid = () => {
    setDateEditSeq(null);
    setDateEditValue("");
  };

  const confirmMarkPaid = (seq) => {
    if (!dateEditValue) {
      alert("납부일을 선택해 주세요.");
      return;
    }
    setInstallments((prev) =>
      prev.map((it) =>
        it.seq === seq
          ? { ...it, status: "paid", paidDate: isoToDot(dateEditValue) }
          : it,
      ),
    );
    setDateEditSeq(null);
    setDateEditValue("");
  };

  const togglePaid = (seq) => {
    setInstallments((prev) =>
      prev.map((it) => {
        if (it.seq !== seq || it.status !== "paid") return it;
        return { ...it, status: "unpaid", paidDate: null };
      }),
    );
  };

  const handleSuspendPayment = () => {
    if (
      !window.confirm(
        "남은 회차의 결제를 중단 처리하시겠습니까?\n지금까지 납부한 회차는 그대로 유지되고, 남은 회차는 앞으로 청구되지 않습니다.",
      )
    )
      return;
    setInstallments((prev) =>
      prev.map((it) =>
        it.status === "unpaid" ? { ...it, status: "canceled" } : it,
      ),
    );
    setPaymentCanceled(true);
    setStopType("suspended");
    setCanceledAt(TODAY_LABEL);
  };

  const openRefundModal = () => {
    setRefundMessage("");
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = () => {
    if (!refundMessage.trim()) {
      alert("전달 사항을 입력해 주세요.");
      return;
    }
    setInstallments((prev) =>
      prev.map((it) => {
        if (it.status === "paid")
          return { ...it, status: "refunded", refundedDate: TODAY_LABEL };
        if (it.status === "unpaid") return { ...it, status: "canceled" };
        return it;
      }),
    );
    setPaymentCanceled(true);
    setStopType("refunded");
    setCanceledAt(TODAY_LABEL);
    saveTransmissionNote("refund", refundMessage.trim());
    setTransmissionNotes(loadTransmissionNotes(isExternal));
    setRefundModalOpen(false);
    setRefundMessage("");
  };

  const handleResumePayment = () => {
    setInstallments((prev) =>
      prev.map((it) => {
        if (it.status === "canceled") return { ...it, status: "unpaid" };
        if (it.status === "refunded")
          return { ...it, status: "paid", refundedDate: null };
        return it;
      }),
    );
    setPaymentCanceled(false);
    setStopType(null);
    setCanceledAt(null);
  };

  const openPaymentModal = () => {
    if (!paymentConfigured) {
      setDraftTotalFee("");
      setDraftMethod("installment");
      setDraftCount("");
      setDraftDate(TODAY_LABEL);
      setPayEditing(true);
    }
    setPaymentModalOpen(true);
  };

  const startEditPayment = () => {
    setDraftTotalFee(String(payTotalFee));
    setDraftMethod(payMethod);
    setDraftCount(String(payInstallmentCount));
    setDraftDate(payContractDate);
    setPayEditing(true);
  };

  const cancelEditPayment = () => {
    if (paymentConfigured) {
      setPayEditing(false);
    } else {
      setPaymentModalOpen(false);
    }
  };

  const requestApplyPayment = () => {
    const fee = Number(draftTotalFee);
    if (!fee || fee <= 0) {
      alert("총 수임료를 올바르게 입력해 주세요.");
      return;
    }
    if (!draftDate) {
      alert("첫 납부일을 입력해 주세요.");
      return;
    }
    const hasProgress = installments.some((it) => it.status !== "unpaid");
    if (
      hasProgress &&
      !window.confirm(
        "결제 조건을 변경하면 이미 납부(완납/환불) 처리된 회차를 포함해 전체 회차 정보가 새로 계산됩니다.\n계속하시겠습니까?",
      )
    )
      return;

    setDraftSelectedProc(selectedOption);
    setProcSelectCreditOpen(
      CREDIT_RECOVERY_IDS.has(selectedOption) ||
        CREDIT_RECOVERY_CHILDREN.some((o) => o.recommended),
    );
    setProcSelectModalOpen(true);
  };

  const confirmApplyWithProcedure = (e) => {
    e?.stopPropagation?.();
    const fee = Number(draftTotalFee);
    const count =
      draftMethod === "lump" ? 1 : Math.max(1, Number(draftCount) || 1);

    pendingPaymentApplyRef.current = {
      fee,
      count,
      method: draftMethod,
      date: draftDate,
      procId: draftSelectedProc,
    };
    setProcSelectModalOpen(false);
  };

  useEffect(() => {
    if (procSelectModalOpen || !pendingPaymentApplyRef.current) return;

    const { fee, count, method, date, procId } = pendingPaymentApplyRef.current;
    pendingPaymentApplyRef.current = null;

    setPayTotalFee(fee);
    setPayMethod(method);
    setPayInstallmentCount(count);
    setPayContractDate(date);
    setInstallments(buildInstallments(fee, count, date));
    setPaymentCanceled(false);
    setStopType(null);
    setCanceledAt(null);
    setPaymentConfigured(true);
    setSelectedOption(procId);
    setPayEditing(false);
    saveTransmissionNote(
      "payment",
      buildPaymentNoteMessage(fee, method, count, date, procId),
    );
    setTransmissionNotes(loadTransmissionNotes(isExternal));
  }, [procSelectModalOpen, isExternal]);

  /* 와이어프레임 테스트용: 입력 전 상태로 되돌리기 */
  // const resetPaymentConfig = () => {
  //   if (
  //     !window.confirm(
  //       "결제 조건을 초기화하고 입력 전 상태로 되돌립니다. (테스트용)",
  //     )
  //   )
  //     return;
  //   setPaymentConfigured(false);
  //   setInstallments([]);
  //   setPaymentCanceled(false);
  //   setStopType(null);
  //   setCanceledAt(null);
  //   setDraftTotalFee("");
  //   setDraftMethod("installment");
  //   setDraftCount("");
  //   setDraftDate(TODAY_LABEL);
  //   setPayEditing(true);
  // };

  useEffect(() => {
    if (chatMessages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiTyping]);

  useEffect(() => {
    const saved = localStorage.getItem(procStorageKey(1, selectedOption));
    setProcCurrentStep(saved ? parseInt(saved) : null);
    setProcOpenSteps(new Set([1]));
  }, [selectedOption]);

  const sendMessage = (text) => {
    if (!text.trim() || isAiTyping) return;
    const userMsg = { role: "user", text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);
    setTimeout(() => {
      const answer =
        AI_ANSWERS[text] ||
        "분석 결과를 바탕으로 답변드리겠습니다. 해당 질문은 구체적인 법률 검토가 필요한 사안입니다. 담당 법무사 또는 변호사와의 상담을 권장합니다.";
      setChatMessages((prev) => [...prev, { role: "ai", text: answer }]);
      setIsAiTyping(false);
    }, 1000);
  };

  const openAcceptModal = () => {
    setAcceptMessage("");
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = () => {
    if (!acceptMessage.trim()) {
      alert("수락 메시지를 입력해 주세요.");
      return;
    }
    saveTransmissionNote("accept", acceptMessage.trim());
    setReviewStatus("accepted");
    setAcceptModalOpen(false);
    setTransmissionNotes(loadTransmissionNotes(isExternal));
  };

  const openRejectModal = () => {
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert("거절 사유를 입력해 주세요.");
      return;
    }
    setReviewStatus("rejected");
    setRejectModalOpen(false);
    saveTransmissionNote("reject", rejectReason.trim());
    navigate("/checklist");
  };

  const totalDebtPrincipal = debtSummary?.totalDebt ?? CLIENT.totalDebt;
  const totalDebtWithInterest =
    debtSummary?.totalDebtWithInterest ??
    CLIENT.totalDebtWithInterest ??
    totalDebtPrincipal;
  const debtBreakdown =
    debtSummary?.items?.length > 0
      ? aggregateByDebtType(debtSummary.items)
      : CLIENT.debtBreakdown;

  const totalRepayment = AI.repaymentAmount * AI.repaymentMonths;
  const exemptDebt = Math.max(
    0,
    Math.round(totalDebtPrincipal - totalRepayment),
  );
  const exemptDebtWithInterest = Math.max(
    0,
    Math.round(totalDebtWithInterest - totalRepayment),
  );

  const paidCount = installments.filter((it) => it.status === "paid").length;
  const canceledCount = installments.filter(
    (it) => it.status === "canceled",
  ).length;
  const refundedCount = installments.filter(
    (it) => it.status === "refunded",
  ).length;
  const paidAmount = installments
    .filter((it) => it.status === "paid")
    .reduce((sum, it) => sum + it.amount, 0);
  const refundedAmount = installments
    .filter((it) => it.status === "refunded")
    .reduce((sum, it) => sum + it.amount, 0);
  const paymentProgressPct =
    payTotalFee > 0 ? Math.round((paidAmount / payTotalFee) * 100) : 0;
  const paymentOverallStatus = paymentCanceled
    ? stopType === "refunded"
      ? "환불 처리"
      : "중도 해지"
    : paidCount === installments.length
      ? "완납"
      : "진행중";
  const payBaseAmount =
    payMethod === "lump"
      ? payTotalFee
      : Math.floor(payTotalFee / payInstallmentCount);
  const payHasRemainder =
    payMethod !== "lump" &&
    installments.length > 0 &&
    installments[installments.length - 1]?.amount !== payBaseAmount;
  const hasPaidProgress = installments.some(
    (it) => it.status === "paid" || it.status === "refunded",
  );

  return (
    <div className="sdp-page">
      <div className="sdp-body">
        {/* 상단 인라인 네비 */}
        <div className="sdp-topnav">
          <div className="sdp-topnav-client">
            <div className="sdp-chip-dot" />
            <span>
              {CLIENT.name} · {CLIENT.age}세 · {CLIENT.job}
            </span>
          </div>
          <div className="sdp-topnav-right">
            {isExternal ? (
              <>
                <button
                  className="sdp-view-toggle-btn"
                  title="내부 뷰로 전환"
                  onClick={() => navigate("/checklist/result")}
                >
                  내부용
                </button>
                <div className="sdp-sales-chip">
                  <img
                    src={SALES_REP.thumb}
                    alt=""
                    className="sdp-sales-thumb"
                  />
                  <div className="sdp-sales-info">
                    <span className="sdp-sales-branch">{SALES_REP.branch}</span>
                    <span className="sdp-sales-name">{SALES_REP.name}</span>
                  </div>
                </div>
              </>
            ) : (
              /* 테스트용 뷰 전환 버튼 */
              <button
                className="sdp-view-toggle-btn"
                title="외부 뷰로 전환"
                onClick={() => navigate("/checklist/result-external")}
              >
                내부용
              </button>
            )}
            <span className="sdp-topnav-date">2026.06.28 16:00</span>
            {/* 아이콘 액션 버튼들 */}
            {!isExternal && (
              <button
                className="sdp-icon-btn"
                title="정보 수정"
                onClick={() =>
                  navigate("/checklist/form", { state: { fromResult: true } })
                }
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z"
                    stroke="#444"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path d="M10 4L12 6" stroke="#444" strokeWidth="1.4" />
                </svg>
                <span>정보 수정</span>
              </button>
            )}
            <button
              className="sdp-icon-btn sdp-pay-nav-btn"
              title="수임료 결제 정보"
              onClick={openPaymentModal}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="1.5"
                  y="4"
                  width="13"
                  height="9"
                  rx="1.5"
                  stroke="#444"
                  strokeWidth="1.3"
                />
                <path d="M1.5 6.8h13" stroke="#444" strokeWidth="1.3" />
                <rect
                  x="3.5"
                  y="9.3"
                  width="3"
                  height="1.4"
                  rx="0.5"
                  fill="#444"
                />
              </svg>
              <span>결제 정보</span>
              {paymentConfigured && (
                <span
                  className={`sdp-pay-nav-dot ${
                    paymentOverallStatus === "완납"
                      ? "done"
                      : paymentOverallStatus === "중도 해지"
                        ? "canceled"
                        : "active"
                  }`}
                />
              )}
            </button>
            <button
              className="sdp-icon-btn"
              title="목록"
              onClick={() => navigate("/checklist")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="3.5"
                  width="12"
                  height="1.4"
                  rx="0.7"
                  fill="#444"
                />
                <rect
                  x="2"
                  y="7.3"
                  width="12"
                  height="1.4"
                  rx="0.7"
                  fill="#444"
                />
                <rect
                  x="2"
                  y="11.1"
                  width="12"
                  height="1.4"
                  rx="0.7"
                  fill="#444"
                />
              </svg>
              <span>목록</span>
            </button>
            {!isExternal && (
              <button
                className="sdp-icon-btn sdp-icon-btn--primary"
                title="저장하기"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2V10M8 10L5 7M8 10L11 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12H14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>저장하기</span>
              </button>
            )}
          </div>
        </div>

        {/* 변호사 분석 데이터 검토 (외부 뷰) */}
        {isExternal && (
          <>
            {reviewStatus === "pending" && (
              <div className="sdp-review-strip sdp-review-strip--pending">
                <div className="sdp-review-strip-main">
                  <span className="sdp-review-strip-label">검토 대기</span>
                  <span className="sdp-review-strip-desc">
                    AI 분석 결과를 검토하고 수락 또는 거절해 주세요
                  </span>
                </div>
                <div className="sdp-review-strip-actions">
                  <button
                    type="button"
                    className="sdp-review-strip-btn sdp-review-strip-btn--ghost"
                    onClick={openRejectModal}
                  >
                    거절
                  </button>
                  <button
                    type="button"
                    className="sdp-review-strip-btn sdp-review-strip-btn--primary"
                    onClick={openAcceptModal}
                  >
                    수락
                  </button>
                </div>
              </div>
            )}
            {reviewStatus === "accepted" && (
              <div className="sdp-review-strip sdp-review-strip--done">
                <span className="sdp-review-done-dot" aria-hidden="true" />
                <p className="sdp-review-done-text">
                  <strong>수락 완료</strong>
                  계약 진행 후 결제 정보 입력 시 절차 단계로 이동합니다
                </p>
              </div>
            )}
          </>
        )}

        {/* 전달 사항 */}
        {transmissionNotes.length > 0 && (
          <section className="sdp-transmission-section">
            <div className="sdp-transmission-panel">
              <header className="sdp-transmission-panel-head">
                <h3 className="sdp-transmission-panel-title">전달 사항</h3>
                <span className="sdp-transmission-panel-count">
                  {transmissionNotes.length}
                </span>
              </header>
              <ul className="sdp-transmission-thread">
                {transmissionNotes.map((note) => (
                  <li
                    key={note.id}
                    className={`sdp-transmission-entry sdp-transmission-entry--${note.type}`}
                  >
                    <div className="sdp-transmission-entry-marker">
                      <span className="sdp-transmission-dot" />
                    </div>
                    <div className="sdp-transmission-entry-content">
                      <div className="sdp-transmission-entry-top">
                        <span className="sdp-transmission-type">
                          {TRANSMISSION_TYPE_LABEL[note.type]}
                        </span>
                        <span className="sdp-transmission-sep">·</span>
                        <span className="sdp-transmission-author">
                          {note.authorName}
                        </span>
                        {note.authorMeta && (
                          <>
                            <span className="sdp-transmission-sep">·</span>
                            <span className="sdp-transmission-branch">
                              {note.authorMeta}
                            </span>
                          </>
                        )}
                        <time className="sdp-transmission-time">
                          {note.datetime}
                        </time>
                      </div>
                      <p className="sdp-transmission-msg">{note.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ① 히어로: 추천 옵션 + 큰 링 */}
        <section className="sdp-hero">
          <div className="sdp-hero-left">
            <p className="sdp-hero-eyebrow">AI 분석 추천</p>
            <h1 className="sdp-hero-h1">개인회생</h1>
            <p className="sdp-hero-sub">
              소득 대비 채무 비율과 월 가용 소득을 종합적으로 분석한 결과,
              <br />
              개인회생 신청이 가장 유리한 것으로 판단됩니다.
            </p>
            <div className="sdp-hero-tags">
              <span className="sdp-tag">채무초과 상태</span>
              <span className="sdp-tag">가용소득 충분</span>
              <span className="sdp-tag">연체 6개월</span>
            </div>
          </div>
          <div className="sdp-hero-right">
            <Ring score={78} size={150} strokeWidth={8} />
          </div>
        </section>

        {/* ② 옵션 비교 */}
        <section className="sdp-section">
          <p className="sdp-section-label">절차별 성공 가능성</p>

          {/* 바 비교 — 클릭으로 선택 (신용회복은 그룹 펼침) */}
          <div className="sdp-options">
            {OPTION_BLOCKS.map((block) => {
              if (block.type === "option") {
                const opt = block.option;
                return (
                  <div
                    key={opt.id}
                    className={`sdp-option-row ${opt.recommended ? "recommended" : ""} ${selectedOption === opt.id ? "selected" : ""}`}
                    onClick={() => setSelectedOption(opt.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSelectedOption(opt.id)
                    }
                  >
                    <div className="sdp-option-name">
                      <span>{opt.label}</span>
                      {opt.recommended && (
                        <span className="sdp-option-tag">추천</span>
                      )}
                    </div>
                    <div className="sdp-option-bar-wrap">
                      <div className="sdp-option-bar">
                        <div
                          className="sdp-option-fill"
                          style={{ width: `${opt.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="sdp-option-score">
                      <strong>{opt.score}</strong>
                      <span>/100</span>
                    </div>
                    <span className={`sdp-option-grade g-${opt.grade}`}>
                      {opt.grade}
                    </span>
                  </div>
                );
              }

              const summary = block.summary;
              const groupSelected = CREDIT_RECOVERY_IDS.has(selectedOption);
              const groupRecommended = block.children.some(
                (c) => c.recommended,
              );
              return (
                <div
                  key={block.id}
                  className={`sdp-option-group ${creditRecoveryOpen ? "open" : ""} ${groupSelected ? "has-selected" : ""}`}
                >
                  <div
                    className={`sdp-option-row sdp-option-group-header ${groupRecommended ? "recommended" : ""} ${groupSelected && !creditRecoveryOpen ? "selected" : ""}`}
                    onClick={() => setCreditRecoveryOpen((v) => !v)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setCreditRecoveryOpen((v) => !v)
                    }
                  >
                    <div className="sdp-option-name">
                      <span className="sdp-option-chevron" aria-hidden>
                        {creditRecoveryOpen ? "▾" : "▸"}
                      </span>
                      <span>{block.label}</span>
                      {groupRecommended && (
                        <span className="sdp-option-tag">추천</span>
                      )}
                      {!creditRecoveryOpen && groupSelected && (
                        <span className="sdp-option-sublabel">
                          {
                            block.children.find((c) => c.id === selectedOption)
                              ?.label
                          }
                        </span>
                      )}
                    </div>
                    <div className="sdp-option-bar-wrap">
                      <div className="sdp-option-bar">
                        <div
                          className="sdp-option-fill"
                          style={{ width: `${summary.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="sdp-option-score">
                      <strong>{summary.score}</strong>
                      <span>/100</span>
                    </div>
                    <span className={`sdp-option-grade g-${summary.grade}`}>
                      {summary.grade}
                    </span>
                  </div>
                  {creditRecoveryOpen && (
                    <div className="sdp-option-group-children">
                      {block.children.map((opt) => (
                        <div
                          key={opt.id}
                          className={`sdp-option-row sdp-option-child ${opt.recommended ? "recommended" : ""} ${selectedOption === opt.id ? "selected" : ""}`}
                          onClick={() => setSelectedOption(opt.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setSelectedOption(opt.id)
                          }
                        >
                          <div className="sdp-option-name">
                            <span>{opt.label}</span>
                            {opt.recommended && (
                              <span className="sdp-option-tag">추천</span>
                            )}
                          </div>
                          <div className="sdp-option-bar-wrap">
                            <div className="sdp-option-bar">
                              <div
                                className="sdp-option-fill"
                                style={{ width: `${opt.score}%` }}
                              />
                            </div>
                          </div>
                          <div className="sdp-option-score">
                            <strong>{opt.score}</strong>
                            <span>/100</span>
                          </div>
                          <span className={`sdp-option-grade g-${opt.grade}`}>
                            {opt.grade}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 조건 상세 패널 */}
          {(() => {
            const opt = OPTIONS.find((o) => o.id === selectedOption);
            const passItems = opt.conditions.filter((c) => c.type === "pass");
            const cautionItems = opt.conditions.filter(
              (c) => c.type === "caution",
            );
            const riskItems = opt.conditions.filter((c) => c.type === "risk");
            return (
              <div className="sdp-condition-panel">
                <div className="sdp-condition-header">
                  <span className="sdp-condition-title">
                    {opt.label} 조건 분석
                  </span>
                  <div className="sdp-condition-legend">
                    <span className="sdp-cond-badge pass">충족</span>
                    <span className="sdp-cond-badge caution">보충 필요</span>
                    <span className="sdp-cond-badge risk">위험 요소</span>
                  </div>
                </div>

                <div className="sdp-condition-list">
                  {passItems.map((c, i) => (
                    <div key={`pass-${i}`} className="sdp-cond sdp-cond-pass">
                      <div className="sdp-cond-icon">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <circle cx="8" cy="8" r="8" fill="#16a34a" />
                          <path
                            d="M4.5 8l2.5 2.5 4.5-4.5"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="sdp-cond-text">{c.text}</span>
                    </div>
                  ))}
                  {cautionItems.map((c, i) => (
                    <div
                      key={`caution-${i}`}
                      className="sdp-cond sdp-cond-caution"
                    >
                      <div className="sdp-cond-icon">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M8 1.5L14.5 13H1.5L8 1.5Z"
                            fill="#d97706"
                            stroke="#d97706"
                            strokeWidth="0.5"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 6v3.5"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <circle cx="8" cy="11" r="0.9" fill="#fff" />
                        </svg>
                      </div>
                      <span className="sdp-cond-text">{c.text}</span>
                    </div>
                  ))}
                  {riskItems.map((c, i) => (
                    <div key={`risk-${i}`} className="sdp-cond sdp-cond-risk">
                      <div className="sdp-cond-icon">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <circle cx="8" cy="8" r="8" fill="#dc2626" />
                          <path
                            d="M5.5 5.5l5 5M10.5 5.5l-5 5"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span className="sdp-cond-text">{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>

        <div className="sdp-cols2">
          {/* ③ 재무 현황 */}
          <section className="sdp-section">
            <p className="sdp-section-label">재무 현황</p>
            <div className="sdp-stat-list">
              <div className="sdp-stat">
                <span className="sdp-stat-label">총 채무 (원금)</span>
                <span className="sdp-stat-val">
                  {totalDebtPrincipal.toLocaleString()}
                  <em>만원</em>
                </span>
              </div>
              {totalDebtWithInterest > totalDebtPrincipal && (
                <div className="sdp-stat">
                  <span className="sdp-stat-label">
                    총 상환 예정 (이자 포함)
                  </span>
                  <span className="sdp-stat-val">
                    {Math.round(totalDebtWithInterest).toLocaleString()}
                    <em>만원</em>
                  </span>
                </div>
              )}
              <div className="sdp-stat">
                <span className="sdp-stat-label">총 자산</span>
                <span className="sdp-stat-val">
                  {CLIENT.totalAsset.toLocaleString()}
                  <em>만원</em>
                </span>
              </div>
              <div className="sdp-stat">
                <span className="sdp-stat-label">월 가용 소득</span>
                <span className="sdp-stat-val">
                  +{CLIENT.disposableIncome}
                  <em>만원</em>
                </span>
              </div>
              <div className="sdp-stat">
                <span className="sdp-stat-label">연체 기간</span>
                <span className="sdp-stat-val">
                  {overduePeriodLabel(debtSummary?.overduePeriod) ? (
                    overduePeriodLabel(debtSummary.overduePeriod)
                  ) : (
                    <>
                      {parseOverdueMonths(
                        debtSummary?.overduePeriod ?? CLIENT.overduePeriod,
                      )}
                      <em>개월</em>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="sdp-divider" />

            <div className="sdp-debt-section-head">
              <p className="sdp-section-label">채무 구성</p>
              <button
                type="button"
                className="sdp-debt-detail-btn"
                onClick={openDebtModal}
              >
                자세히 보기
              </button>
            </div>
            <div className="sdp-bars">
              {debtBreakdown.map((d) => (
                <div key={d.label} className="sdp-bar-row">
                  <span className="sdp-bar-label">{d.label}</span>
                  <div className="sdp-bar-track">
                    <div
                      className="sdp-bar-fill"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="sdp-bar-pct">{d.pct}%</span>
                  <span className="sdp-bar-amt">
                    {d.amount.toLocaleString()}만원
                    {/* {d.totalRepay != null && d.totalRepay > d.amount && (
                      <em className="sdp-bar-amt-sub">
                        {" "}
                        / 상환 {Math.round(d.totalRepay).toLocaleString()}
                      </em>
                    )} */}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ④ 변제 계획 */}
          <section className="sdp-section">
            <p className="sdp-section-label">예상 변제 계획</p>
            <div className="sdp-plan-kv">
              <div className="sdp-kv">
                <span>월 변제액</span>
                <strong>{AI.repaymentAmount}만원</strong>
              </div>
              <div className="sdp-kv">
                <span>변제 기간</span>
                <strong>{AI.repaymentMonths}개월 (7년)</strong>
              </div>
              <div className="sdp-kv">
                <span>총 변제액</span>
                <strong>{totalRepayment.toLocaleString()}만원</strong>
              </div>
            </div>
            <div className="sdp-exempt-box">
              <p className="sdp-exempt-label">예상 면책 채무</p>
              <div className="sdp-exempt-compare">
                <div className="sdp-exempt-col">
                  <span className="sdp-exempt-col-label">원금 기준</span>
                  <p className="sdp-exempt-val">
                    약 {exemptDebt.toLocaleString()}
                    <em>만원</em>
                  </p>
                </div>
                <div className="sdp-exempt-col">
                  <span className="sdp-exempt-col-label">이자 포함</span>
                  <p className="sdp-exempt-val">
                    약 {exemptDebtWithInterest.toLocaleString()}
                    <em>만원</em>
                  </p>
                </div>
              </div>
              <p className="sdp-exempt-desc">
                변제 완료 후 법원 결정으로 면책되는 잔여 채무입니다. 이자 포함은
                약정 총 상환액 기준 추정값입니다.
              </p>
            </div>

            <div className="sdp-divider" />

            <p className="sdp-section-label">주의사항</p>
            <ul className="sdp-cautions">
              <li>
                이전 면책 후 <strong>7년 이내</strong> 재신청 불가
              </li>
              <li>허위 재산 신고 시 면책 취소 가능</li>
              <li>신청 전 자산 임의 처분 금지</li>
              <li>불법 사채는 별도 법적 검토 필요</li>
            </ul>
          </section>
        </div>

        {/* ⑤ 상담 멘트 (외부 공유 시 숨김) */}
        {!isExternal && (
          <section className="sdp-section">
            <p className="sdp-section-label">추천 상담 멘트</p>
            <div className="sdp-script-tabs">
              {SCRIPTS.map((s, i) => (
                <button
                  key={i}
                  className={`sdp-script-tab ${activeScript === i ? "on" : ""}`}
                  onClick={() => setActiveScript(i)}
                >
                  {s.phase}
                </button>
              ))}
            </div>
            <div className="sdp-script-body">
              <div className="sdp-script-speaker">상담사</div>
              <blockquote className="sdp-script-quote">
                {SCRIPTS[activeScript].text}
              </blockquote>
              <button className="sdp-copy-btn">복사하기</button>
            </div>
          </section>
        )}

        {/* ⑥ AI 추가 질문 (외부 공유 시 숨김) */}
        {!isExternal && (
          <section className="sdp-section sdp-chat-section">
            <div className="sdp-chat-section-header">
              {/* AI 스파클 아이콘 */}
              <svg
                className="sdp-sparkle-icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
              >
                {/* 큰 4각별 */}
                <path
                  d="M10 3 L11.6 8.4 L17 10 L11.6 11.6 L10 17 L8.4 11.6 L3 10 L8.4 8.4 Z"
                  fill="#111"
                />
                {/* 작은 4각별 */}
                <path
                  d="M19.5 2 L20.4 4.6 L23 5.5 L20.4 6.4 L19.5 9 L18.6 6.4 L16 5.5 L18.6 4.6 Z"
                  fill="#111"
                />
                {/* 점 */}
                <circle cx="5" cy="19" r="1.3" fill="#111" />
              </svg>
              <p className="sdp-section-label" style={{ margin: 0 }}>
                AI 추가 질문
              </p>
            </div>

            {/* 빠른 질문 칩 */}
            <div className="sdp-chat-quick">
              {AI_QUICK.map((q) => (
                <button
                  key={q}
                  className="sdp-chat-quick-btn"
                  onClick={() => sendMessage(q)}
                  disabled={isAiTyping}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* 메시지 목록 */}
            <div className="sdp-chat-messages">
              {chatMessages.map((m, i) => (
                <div key={i} className={`sdp-chat-msg ${m.role}`}>
                  {m.role === "ai" && (
                    <div className="sdp-chat-ai-icon">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <circle cx="10" cy="10" r="10" fill="#111" />
                        <path
                          d="M6 10.5l2.5 2.5L14 7"
                          stroke="#fff"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="sdp-chat-bubble">{m.text}</div>
                </div>
              ))}
              {isAiTyping && (
                <div className="sdp-chat-msg ai">
                  <div className="sdp-chat-ai-icon">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#111" />
                      <path
                        d="M6 10.5l2.5 2.5L14 7"
                        stroke="#fff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="sdp-chat-bubble sdp-chat-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 입력 */}
            <div className="sdp-chat-input-row">
              <input
                className="sdp-chat-input"
                placeholder="AI에게 추가 질문을 입력하세요"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)}
                disabled={isAiTyping}
              />
              <button
                className="sdp-chat-send"
                onClick={() => sendMessage(chatInput)}
                disabled={!chatInput.trim() || isAiTyping}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* ⑦ 절차 안내 */}
        {(() => {
          const proc = PROCEDURES[selectedOption];
          const { steps, color, label, totalMonths } = proc;
          const currentIdx = steps.findIndex((s) => s.id === procCurrentStep);
          const completedIds = new Set(
            procCurrentStep
              ? steps.filter((s) => s.id < procCurrentStep).map((s) => s.id)
              : [],
          );
          const remainingWeeks = calcRemainingWeeks(steps, procCurrentStep);
          const progressPct =
            currentIdx >= 0
              ? Math.round((currentIdx / (steps.length - 1)) * 100)
              : 0;

          const handleSetCurrent = (stepId) => {
            setProcCurrentStep(stepId);
            localStorage.setItem(
              procStorageKey(1, selectedOption),
              String(stepId),
            );
          };
          const buildStepSmsText = (step) => {
            const { details } = step;
            const lines = [
              `[${label}] ${step.id}단계. ${step.title}`,
              `예상 기간: ${step.durationLabel}`,
              "",
              details.desc,
            ];
            if (details.items?.length) {
              lines.push("", "■ 주요 내용");
              details.items.forEach((item) => lines.push(`• ${item}`));
            }
            if (details.note) {
              lines.push("", `※ ${details.note}`);
            }
            if (details.example) {
              lines.push("", `📌 예시`, details.example);
            }
            if (details.caution) {
              lines.push("", `⚠ 주의사항`, details.caution);
            }
            return lines.join("\n");
          };
          const toggleStep = (stepId) => {
            setProcOpenSteps((prev) => {
              const next = new Set(prev);
              if (next.has(stepId)) next.delete(stepId);
              else next.add(stepId);
              return next;
            });
          };

          return (
            <section className="sdp-section" key={selectedOption}>
              <div className="sdp-proc-header">
                <p className="sdp-section-label" style={{ margin: 0 }}>
                  절차 안내
                </p>
                <span
                  className="sdp-proc-badge"
                  style={{ background: color + "18", color }}
                >
                  {label} · {steps.length}단계
                </span>
                <span className="sdp-proc-total">{totalMonths}</span>
              </div>

              <div className="sdp-proc-layout">
                {/* 좌측: 아코디언 단계 목록 */}
                <div className="sdp-proc-steps">
                  {steps.map((step) => {
                    const isOpen = procOpenSteps.has(step.id);
                    const isCurrent = step.id === procCurrentStep;
                    const isDone = completedIds.has(step.id);
                    const setter = STEP_SETTERS[selectedOption]?.[step.id];
                    const { details } = step;
                    return (
                      <div
                        key={`${selectedOption}-${step.id}`}
                        className={`sdp-pstep ${isCurrent ? "current" : ""} ${isDone ? "done" : ""}`}
                      >
                        <div
                          className="sdp-pstep-hd"
                          onClick={() => toggleStep(step.id)}
                        >
                          <span
                            className={`sdp-pstep-num ${isCurrent ? "current" : isDone ? "done" : ""}`}
                          >
                            {isDone ? "✓" : step.id}
                          </span>
                          <div className="sdp-pstep-title-wrap">
                            <span className="sdp-pstep-title">
                              {step.id}단계. {step.title}
                            </span>
                            <span className="sdp-pstep-dur">
                              {step.durationLabel}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginLeft: "auto",
                              flexShrink: 0,
                            }}
                          >
                            {isCurrent && (
                              <span className="sdp-pstep-badge">진행중</span>
                            )}
                            <button
                              className="sdp-pstep-sms-btn"
                              title="이 단계 내용 문자 전송"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSmsModal({
                                  id: "step",
                                  label: `${step.id}단계. ${step.title}`,
                                  icon: (
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                    >
                                      <path
                                        d="M2 3.5C2 2.67 2.67 2 3.5 2h13C17.33 2 18 2.67 18 3.5v9c0 .83-.67 1.5-1.5 1.5H6l-4 4V3.5z"
                                        stroke="#555"
                                        strokeWidth="1.4"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M6 7h8M6 10.5h5"
                                        stroke="#555"
                                        strokeWidth="1.3"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                  ),
                                });
                                setSmsText(buildStepSmsText(step));
                              }}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 20 20"
                                fill="none"
                              >
                                <path
                                  d="M2 3.5C2 2.67 2.67 2 3.5 2h13C17.33 2 18 2.67 18 3.5v9c0 .83-.67 1.5-1.5 1.5H6l-4 4V3.5z"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6 7h8M6 10.5h5"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinecap="round"
                                />
                              </svg>
                              문자
                            </button>
                            <span
                              className={`sdp-pstep-chevron ${isOpen ? "open" : ""}`}
                            >
                              ›
                            </span>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="sdp-pstep-body">
                            <p className="sdp-pstep-desc">{details.desc}</p>
                            {details.items?.length > 0 && (
                              <ul className="sdp-pstep-list">
                                {details.items.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            )}
                            {details.note && (
                              <p className="sdp-pstep-note">{details.note}</p>
                            )}
                            {details.example && (
                              <div className="sdp-pstep-example">
                                <span className="sdp-pstep-ex-label">예시</span>
                                <p>{details.example}</p>
                              </div>
                            )}
                            {details.caution && (
                              <div className="sdp-pstep-caution">
                                <span>⚠</span>
                                <p>{details.caution}</p>
                              </div>
                            )}
                            {setter && (
                              <p className="sdp-pstep-setter-info">
                                <strong>{setter.name}</strong>
                                <span className="sdp-pstep-setter-role">
                                  {setter.role}
                                </span>
                                님이 {setter.at}에 설정
                              </p>
                            )}
                            <button
                              className={`sdp-pstep-set-btn ${isCurrent ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetCurrent(step.id);
                              }}
                            >
                              {isCurrent ? "✓ 현재 단계" : "현재 단계로 설정"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 우측: 미니 타임라인 */}
                <div className="sdp-proc-tl">
                  <div className="sdp-proc-tl-current">
                    <span className="sdp-proc-tl-clabel">현재 단계</span>
                    <span className="sdp-proc-tl-cname">
                      {procCurrentStep
                        ? `${procCurrentStep}단계. ${steps.find((s) => s.id === procCurrentStep)?.title}`
                        : "단계 미설정"}
                    </span>
                  </div>
                  <div className="sdp-proc-tl-remain">
                    <span className="sdp-proc-tl-rlabel">예상 남은 기간</span>
                    <span className="sdp-proc-tl-rval">
                      {weeksToLabel(remainingWeeks)}
                    </span>
                    <span className="sdp-proc-tl-rtotal">
                      전체 {totalMonths}
                    </span>
                  </div>

                  <div className="sdp-proc-tl-list">
                    {steps.map((step, idx) => {
                      const isDone2 = currentIdx >= 0 && idx < currentIdx;
                      const isCur2 = step.id === procCurrentStep;
                      return (
                        <div
                          key={`${selectedOption}-${step.id}`}
                          className="sdp-proc-tl-item"
                        >
                          <div className="sdp-proc-tl-track">
                            <div
                              className={`sdp-proc-tl-dot ${isCur2 ? "current" : isDone2 ? "done" : "pending"}`}
                              style={
                                isCur2
                                  ? { background: color, borderColor: color }
                                  : {}
                              }
                            />
                            {idx < steps.length - 1 && (
                              <div
                                className={`sdp-proc-tl-line ${isDone2 ? "done" : ""}`}
                              />
                            )}
                          </div>
                          <div
                            className={`sdp-proc-tl-txt ${isCur2 ? "current" : isDone2 ? "done" : ""}`}
                          >
                            <span className="sdp-proc-tl-ttitle">
                              {step.id}단계. {step.title}
                            </span>
                            <span className="sdp-proc-tl-tdur">
                              {step.durationLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="sdp-proc-tl-prog">
                    <div className="sdp-proc-tl-prog-labels">
                      <span>진행률</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="sdp-proc-tl-prog-bg">
                      <div
                        className="sdp-proc-tl-prog-fill"
                        style={{ width: `${progressPct}%`, background: color }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ⑧ 고객 문자 전송 */}
        <section className="sdp-section sdp-sms-section">
          <div className="sdp-sms-header">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 3.5C2 2.67 2.67 2 3.5 2h13C17.33 2 18 2.67 18 3.5v9c0 .83-.67 1.5-1.5 1.5H6l-4 4V3.5z"
                stroke="#333"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M6 7h8M6 10.5h5"
                stroke="#333"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <p className="sdp-section-label" style={{ margin: 0 }}>
              고객 문자 전송
            </p>
            <span className="sdp-sms-phone">{CLIENT.name} · 010-XXXX-XXXX</span>
          </div>
          <div className="sdp-sms-grid">
            {SMS_TEMPLATES.map((t) => (
              <button
                key={t.id}
                className="sdp-sms-btn"
                onClick={() => {
                  setSmsModal(t);
                  setSmsText(t.message);
                }}
              >
                <span className="sdp-sms-btn-icon">{t.icon}</span>
                <span className="sdp-sms-btn-label">{t.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* 채무 재분석 오버레이 */}
      {debtReanalyzing && (
        <div className="sdp-debt-reanalyzing">
          <div className="sdp-debt-reanalyzing-card">
            <p className="sdp-debt-reanalyzing-title">분석 중</p>
            <p className="sdp-debt-reanalyzing-sub">
              수정된 채무 정보로 다시 분석하고 있습니다
            </p>
            <div className="sdp-debt-reanalyzing-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}

      {/* 채무 자세히보기 / 수정 모달 */}
      {debtModalOpen && (
        <div className="sdp-debt-modal-overlay" onClick={closeDebtModal}>
          <div
            className="sdp-debt-modal sdp-debt-modal--form"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdp-debt-modal-head">
              <div>
                <p className="sdp-debt-modal-title">채무 상세</p>
                <p className="sdp-debt-modal-sub">진단 입력과 동일하게 수정할 수 있습니다</p>
              </div>
              <button
                type="button"
                className="sdp-debt-modal-close"
                onClick={closeDebtModal}
                aria-label="닫기"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="#666"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="sdp-debt-modal-body">
              <div className="scl-debt-panel">
                <div className="scl-debt-panel-head">
                  <div className="scl-debt-panel-title-wrap">
                    <span className="scl-debt-panel-title">채무 내역</span>
                    <span className="scl-debt-panel-hint">
                      {debtDraft.debtInputMode === "simple"
                        ? "종류별 잔액만 빠르게 입력"
                        : "채권처·상환방식·금리까지 상세 입력 (원 단위)"}
                    </span>
                  </div>
                  <div className="scl-mode-toggle" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={debtDraft.debtInputMode === "simple"}
                      className={`scl-mode-btn ${debtDraft.debtInputMode === "simple" ? "on" : ""}`}
                      onClick={() => switchDebtDraftMode("simple")}
                    >
                      심플
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={debtDraft.debtInputMode === "detail"}
                      className={`scl-mode-btn ${debtDraft.debtInputMode === "detail" ? "on" : ""}`}
                      onClick={() => switchDebtDraftMode("detail")}
                    >
                      상세
                    </button>
                  </div>
                </div>

                <div className="scl-debt-panel-body">
                  {debtDraft.debtInputMode === "simple" ? (
                    <>
                      <Field label="채무 종류 (중복 선택 가능)">
                        <Chips
                          options={DEBT_TYPE_OPTIONS}
                          value={debtDraft.debtTypes}
                          onChange={setDebtDraftField("debtTypes")}
                          multi
                        />
                      </Field>
                      <p className="scl-note">
                        ※ 해당 채무의 현재 잔액을 만원 단위로 입력하세요
                      </p>
                      <div className="scl-row-2">
                        {debtDraft.debtTypes.includes("은행대출") && (
                          <Field label="은행 대출">
                            <input
                              className="scl-input"
                              type="number"
                              value={debtDraft.bankLoan}
                              onChange={setDebtDraftInput("bankLoan")}
                            />
                          </Field>
                        )}
                        {debtDraft.debtTypes.includes("카드론") && (
                          <Field label="카드론">
                            <input
                              className="scl-input"
                              type="number"
                              value={debtDraft.creditCardDebt}
                              onChange={setDebtDraftInput("creditCardDebt")}
                            />
                          </Field>
                        )}
                        {(debtDraft.debtTypes.includes("캐피탈") ||
                          debtDraft.debtTypes.includes("저축은행")) && (
                          <Field label="캐피탈 / 저축은행">
                            <input
                              className="scl-input"
                              type="number"
                              value={debtDraft.capitalLoan}
                              onChange={setDebtDraftInput("capitalLoan")}
                            />
                          </Field>
                        )}
                        {(debtDraft.debtTypes.includes("사채") ||
                          debtDraft.debtTypes.includes("개인차용")) && (
                          <Field label="사채 / 개인차용">
                            <input
                              className="scl-input"
                              type="number"
                              value={debtDraft.privateLoan}
                              onChange={setDebtDraftInput("privateLoan")}
                            />
                          </Field>
                        )}
                      </div>
                      <div className="scl-sum-line">
                        <span>총 채무 합계</span>
                        <strong>{draftSimpleTotal.toLocaleString()}만원</strong>
                      </div>
                      <Field
                        label="연체 기간"
                        hint="여러 채무가 있으면 가장 긴 연체 기준으로"
                      >
                        <select
                          className="scl-input"
                          value={normalizeSimpleOverdue(debtDraft.overduePeriod)}
                          onChange={(e) =>
                            setDebtDraftField("overduePeriod")(e.target.value)
                          }
                        >
                          {OVERDUE_PERIOD_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </>
                  ) : (
                    <div className="scl-debt-grid-wrap">
                      <table className="scl-debt-grid">
                        <thead>
                          <tr>
                            <th className="col-type">채무종류</th>
                            <th className="col-lender">채권처</th>
                            <th className="col-method">상환방식</th>
                            <th className="col-overdue">연체(개월)</th>
                            <th className="col-date">대출일</th>
                            <th className="col-date">만기일</th>
                            <th className="col-num">금액(원)</th>
                            <th className="col-rate">금리(%)</th>
                            <th className="col-calc">기간</th>
                            <th className="col-calc">월불입</th>
                            <th className="col-calc">총이자</th>
                            <th className="col-calc">총상환</th>
                            <th className="col-act" />
                          </tr>
                        </thead>
                        <tbody>
                          {debtDraft.debts.map((debt) => {
                            const calc = calcDebtItem(debt);
                            return (
                              <tr key={debt.id}>
                                <td>
                                  <select
                                    className="scl-grid-input scl-grid-select"
                                    value={debt.debtType || "은행대출"}
                                    onChange={(e) =>
                                      updateDraftDebt(
                                        debt.id,
                                        "debtType",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    {DEBT_TYPE_OPTIONS.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <input
                                    className="scl-grid-input"
                                    value={debt.lender}
                                    onChange={(e) =>
                                      updateDraftDebt(
                                        debt.id,
                                        "lender",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="예: 국민은행"
                                  />
                                </td>
                                <td>
                                  <select
                                    className="scl-grid-input scl-grid-select"
                                    value={debt.repayMethod || "원리금균등"}
                                    onChange={(e) =>
                                      updateDraftDebt(
                                        debt.id,
                                        "repayMethod",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    {REPAY_METHOD_OPTIONS.map((m) => (
                                      <option key={m} value={m}>
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <input
                                    className="scl-grid-input scl-grid-num"
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    value={debt.overduePeriod ?? "0"}
                                    onChange={(e) =>
                                      updateDraftDebt(
                                        debt.id,
                                        "overduePeriod",
                                        e.target.value.replace(/[^\d]/g, ""),
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="scl-grid-input"
                                    type="date"
                                    value={debt.loanDate}
                                    onChange={(e) =>
                                      updateDraftDebt(
                                        debt.id,
                                        "loanDate",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="scl-grid-input"
                                    type="date"
                                    value={debt.maturityDate}
                                    onChange={(e) =>
                                      updateDraftDebt(
                                        debt.id,
                                        "maturityDate",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="scl-grid-input scl-grid-num"
                                    type="text"
                                    inputMode="numeric"
                                    value={formatComma(debt.principal)}
                                    onChange={(e) =>
                                      updateDraftDebt(
                                        debt.id,
                                        "principal",
                                        parseComma(e.target.value),
                                      )
                                    }
                                    placeholder="예: 50,000,000"
                                  />
                                </td>
                                <td>
                                  <input
                                    className="scl-grid-input scl-grid-num"
                                    type="number"
                                    step="0.1"
                                    value={debt.rate}
                                    onChange={(e) =>
                                      updateDraftDebt(
                                        debt.id,
                                        "rate",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="예: 15"
                                  />
                                </td>
                                <td className="scl-grid-calc">
                                  {calc ? `${calc.months}개월` : "—"}
                                </td>
                                <td className="scl-grid-calc">
                                  {calc ? formatWon(calc.monthly) : "—"}
                                </td>
                                <td className="scl-grid-calc">
                                  {calc ? formatWon(calc.totalInterest) : "—"}
                                </td>
                                <td className="scl-grid-calc">
                                  {calc ? formatWon(calc.totalRepay) : "—"}
                                </td>
                                <td className="col-act">
                                  {debtDraft.debts.length > 1 && (
                                    <button
                                      type="button"
                                      className="scl-debt-remove"
                                      onClick={() => removeDraftDebt(debt.id)}
                                      title="삭제"
                                    >
                                      ×
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="scl-debt-add-row">
                            <td colSpan={13}>
                              <button
                                type="button"
                                className="scl-debt-add-btn"
                                onClick={addDraftDebt}
                              >
                                + 행 추가
                              </button>
                            </td>
                          </tr>
                        </tbody>
                        {draftDetailTotalRepayWon > 0 && (
                          <tfoot>
                            <tr>
                              <td colSpan={6}>합계</td>
                              <td className="scl-grid-calc">
                                {formatWon(draftDetailPrincipalWon)}
                              </td>
                              <td />
                              <td />
                              <td className="scl-grid-calc">
                                {formatWon(draftDetailMonthlySumWon)}
                              </td>
                              <td className="scl-grid-calc">
                                {formatWon(draftDetailTotalInterestWon)}
                              </td>
                              <td className="scl-grid-calc">
                                {formatWon(draftDetailTotalRepayWon)}
                              </td>
                              <td />
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sdp-debt-modal-footer">
              <button
                type="button"
                className="sdp-debt-btn-ghost"
                onClick={closeDebtModal}
              >
                닫기
              </button>
              <button
                type="button"
                className="sdp-debt-btn-primary"
                onClick={handleDebtApply}
              >
                적용하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 채무 수정 후 저장/재분석 확인 */}
      {debtConfirmOpen && (
        <div
          className="sdp-debt-confirm-overlay"
          onClick={() => setDebtConfirmOpen(false)}
        >
          <div
            className="sdp-debt-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="sdp-debt-confirm-title">
              수정된 채무를 어떻게 할까요?
            </p>
            <p className="sdp-debt-confirm-desc">
              다시 분석하면 추천 절차·변제 계획이 갱신되고,
              <br />
              값만 저장하면 채무 구성만 반영됩니다.
            </p>
            <div className="sdp-debt-confirm-actions">
              <button
                type="button"
                className="sdp-debt-btn-ghost"
                onClick={() => setDebtConfirmOpen(false)}
              >
                돌아가기
              </button>
              <button
                type="button"
                className="sdp-debt-btn-secondary"
                onClick={handleDebtSaveOnly}
              >
                값만 저장
              </button>
              <button
                type="button"
                className="sdp-debt-btn-primary"
                onClick={handleDebtReanalyze}
              >
                다시 분석
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 문자 전송 모달 */}
      {smsModal && (
        <div className="sdp-sms-overlay" onClick={() => setSmsModal(null)}>
          <div className="sdp-sms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sdp-sms-modal-head">
              <div className="sdp-sms-modal-title">
                <span className="sdp-sms-btn-icon">{smsModal.icon}</span>
                <span>{smsModal.label}</span>
              </div>
              <button
                className="sdp-sms-modal-close"
                onClick={() => setSmsModal(null)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="#666"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="sdp-sms-modal-to">
              <span className="sdp-sms-modal-to-label">수신</span>
              <span className="sdp-sms-modal-to-val">
                {CLIENT.name} · 010-XXXX-XXXX
              </span>
            </div>
            <textarea
              className="sdp-sms-textarea"
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              rows={12}
            />
            <div className="sdp-sms-modal-footer">
              <span className="sdp-sms-char">{smsText.length}자</span>
              <div className="sdp-sms-modal-actions">
                <button
                  className="sdp-sms-cancel"
                  onClick={() => setSmsModal(null)}
                >
                  취소
                </button>
                <button
                  className="sdp-sms-send"
                  onClick={() => {
                    alert("문자가 전송되었습니다. (와이어프레임)");
                    setSmsModal(null);
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M2 3.5C2 2.67 2.67 2 3.5 2h13C17.33 2 18 2.67 18 3.5v9c0 .83-.67 1.5-1.5 1.5H6l-4 4V3.5z"
                      fill="currentColor"
                    />
                    <path
                      d="M6 7h8M6 10.5h5"
                      stroke="#111"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  전송하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 수임료 결제 정보 모달 */}
      {paymentModalOpen && (
        <div
          className="sdp-pay-modal-overlay"
          onClick={() => setPaymentModalOpen(false)}
        >
          <div className="sdp-pay-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sdp-pay-modal-head">
              <div className="sdp-pay-modal-title">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="1.5"
                    y="4"
                    width="13"
                    height="9"
                    rx="1.5"
                    stroke="#111"
                    strokeWidth="1.3"
                  />
                  <path d="M1.5 6.8h13" stroke="#111" strokeWidth="1.3" />
                  <rect
                    x="3.5"
                    y="9.3"
                    width="3"
                    height="1.4"
                    rx="0.5"
                    fill="#111"
                  />
                </svg>
                <span>수임료 결제 정보</span>
                {paymentConfigured && !payEditing && (
                  <span
                    className={`sdp-pay-status-badge ${
                      paymentOverallStatus === "완납"
                        ? "done"
                        : paymentOverallStatus === "중도 해지"
                          ? "canceled"
                          : "active"
                    }`}
                  >
                    {paymentOverallStatus}
                  </span>
                )}
              </div>
              {paymentConfigured && !payEditing && (
                <button
                  className="sdp-pay-edit-btn"
                  onClick={startEditPayment}
                  title="결제 조건 수정"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  결제 조건 수정
                </button>
              )}
              <button
                className="sdp-sms-modal-close"
                onClick={() => setPaymentModalOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="#666"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="sdp-pay-modal-body">
              {payEditing ? (
                <>
                  {paymentConfigured && hasPaidProgress && (
                    <p className="sdp-pay-modal-warning">
                      <span>⚠</span>
                      결제 조건을 수정하면 이미 완납·환불 처리된 회차를 포함해
                      전체 회차 일정이 새로 계산됩니다. 기존 납부 내역이
                      초기화될 수 있으니 확인 후 적용해 주세요.
                    </p>
                  )}
                  <div className="sdp-pay-form">
                    <div className="sdp-pay-field">
                      <span className="sdp-pay-field-label">총 수임료</span>
                      <div className="sdp-pay-input-suffix">
                        <input
                          className="sdp-pay-input"
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={draftTotalFee}
                          onChange={(e) => setDraftTotalFee(e.target.value)}
                          placeholder="예: 700"
                          autoFocus={!paymentConfigured}
                        />
                        <span>만원</span>
                      </div>
                    </div>

                    <div className="sdp-pay-field">
                      <span className="sdp-pay-field-label">납부 방식</span>
                      <div className="sdp-pay-chips">
                        <button
                          className={`sdp-pay-chip ${draftMethod === "installment" ? "on" : ""}`}
                          onClick={() => setDraftMethod("installment")}
                        >
                          분할납부
                        </button>
                        <button
                          className={`sdp-pay-chip ${draftMethod === "lump" ? "on" : ""}`}
                          onClick={() => setDraftMethod("lump")}
                        >
                          일괄납부
                        </button>
                      </div>
                    </div>

                    {draftMethod === "installment" && (
                      <div className="sdp-pay-field">
                        <span className="sdp-pay-field-label">분할 횟수</span>
                        <div className="sdp-pay-input-suffix">
                          <input
                            className="sdp-pay-input"
                            type="number"
                            min="1"
                            max="36"
                            inputMode="numeric"
                            value={draftCount}
                            onChange={(e) => setDraftCount(e.target.value)}
                            placeholder="예: 7"
                          />
                          <span>개월</span>
                        </div>
                        {Number(draftTotalFee) > 0 &&
                          Number(draftCount) > 0 && (
                            <p className="sdp-pay-field-hint">
                              회당 약{" "}
                              {Math.floor(
                                Number(draftTotalFee) / Number(draftCount),
                              ).toLocaleString()}
                              만원 × {Number(draftCount)}회
                            </p>
                          )}
                      </div>
                    )}

                    <div className="sdp-pay-field">
                      <span className="sdp-pay-field-label">
                        {draftMethod === "lump" ? "납부일" : "첫 회차 납부일"}
                      </span>
                      <input
                        className="sdp-pay-input"
                        type="date"
                        value={dotToIso(draftDate)}
                        onChange={(e) => setDraftDate(isoToDot(e.target.value))}
                      />
                    </div>

                    <div className="sdp-pay-form-actions">
                      <button
                        className="sdp-pay-cancel-edit-btn"
                        onClick={cancelEditPayment}
                      >
                        {paymentConfigured ? "취소" : "닫기"}
                      </button>
                      <button
                        className="sdp-pay-apply-btn"
                        onClick={requestApplyPayment}
                      >
                        적용
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="sdp-pay-summary">
                    <div className="sdp-pay-summary-item">
                      <span className="sdp-pay-summary-label">총 수임료</span>
                      <span className="sdp-pay-summary-val">
                        {payTotalFee.toLocaleString()}
                        <em>만원</em>
                      </span>
                    </div>
                    <div className="sdp-pay-summary-item">
                      <span className="sdp-pay-summary-label">납부 방식</span>
                      <span className="sdp-pay-summary-val">
                        {payMethod === "lump" ? (
                          "일괄납부"
                        ) : (
                          <>
                            {payHasRemainder ? "약 " : ""}
                            {payBaseAmount.toLocaleString()}만원
                            <em> × {payInstallmentCount}개월</em>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="sdp-pay-summary-item">
                      <span className="sdp-pay-summary-label">
                        {payMethod === "lump" ? "납부일" : "계약일"}
                      </span>
                      <span className="sdp-pay-summary-val sdp-pay-summary-date">
                        {payContractDate}
                      </span>
                    </div>
                  </div>

                  <div className="sdp-pay-progress">
                    <div className="sdp-pay-progress-labels">
                      <span>납부 현황</span>
                      <span>
                        <strong>{paidCount}</strong>/{installments.length}회 ·{" "}
                        {paidAmount.toLocaleString()}만원 /{" "}
                        {payTotalFee.toLocaleString()}만원
                      </span>
                    </div>
                    <div className="sdp-pay-progress-bg">
                      <div
                        className="sdp-pay-progress-fill"
                        style={{ width: `${paymentProgressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="sdp-pay-list">
                    {installments.map((it) => {
                      const isPaid = it.status === "paid";
                      const isCanceled = it.status === "canceled";
                      const isRefunded = it.status === "refunded";
                      const isEditingDate = dateEditSeq === it.seq;
                      return (
                        <div
                          key={it.seq}
                          className={`sdp-pay-row ${it.status}`}
                        >
                          <span className="sdp-pay-row-seq">{it.seq}회차</span>
                          <span className="sdp-pay-row-date">{it.dueDate}</span>
                          <span className="sdp-pay-row-amt">
                            {it.amount.toLocaleString()}만원
                          </span>
                          <span className={`sdp-pay-row-chip ${it.status}`}>
                            {isPaid
                              ? "완납"
                              : isRefunded
                                ? "환불"
                                : isCanceled
                                  ? "취소"
                                  : "미납"}
                          </span>
                          {isEditingDate ? (
                            <div className="sdp-pay-date-edit">
                              <input
                                type="date"
                                className="sdp-pay-date-edit-input"
                                value={dateEditValue}
                                onChange={(e) =>
                                  setDateEditValue(e.target.value)
                                }
                                autoFocus
                              />
                              <button
                                className="sdp-pay-date-confirm-btn"
                                onClick={() => confirmMarkPaid(it.seq)}
                                title="이 날짜로 완납 처리"
                              >
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <path
                                    d="M3.5 8.5l3 3 6-7"
                                    stroke="#fff"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                              <button
                                className="sdp-pay-date-cancel-btn"
                                onClick={cancelMarkPaid}
                                title="취소"
                              >
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <path
                                    d="M3 3l10 10M13 3L3 13"
                                    stroke="#999"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="sdp-pay-row-paiddate">
                                {isPaid
                                  ? `${it.paidDate} 수령`
                                  : isRefunded
                                    ? `${it.refundedDate} 환불`
                                    : isCanceled
                                      ? "미청구"
                                      : "—"}
                              </span>
                              <button
                                className={`sdp-pay-check-btn ${isPaid ? "checked" : ""}`}
                                disabled={isCanceled || isRefunded}
                                onClick={() =>
                                  isPaid
                                    ? togglePaid(it.seq)
                                    : startMarkPaid(it.seq)
                                }
                                title={
                                  isPaid
                                    ? "미납으로 되돌리기"
                                    : "납부일 지정 후 완납 처리"
                                }
                              >
                                {isPaid && (
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                  >
                                    <path
                                      d="M3.5 8.5l3 3 6-7"
                                      stroke="#fff"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="sdp-pay-footer">
                    {paymentCanceled ? (
                      <div className="sdp-pay-canceled-note">
                        <span>⚠</span>
                        <p>
                          {stopType === "refunded" ? (
                            <>
                              {canceledAt} 기준 결제가 환불 처리되었습니다.
                              납부했던 {refundedCount}회차(
                              {refundedAmount.toLocaleString()}만원)가 환불되며,
                              남은 {canceledCount}회차는 청구되지 않습니다.
                            </>
                          ) : (
                            <>
                              {canceledAt} 기준 {paidCount}회차까지 납부 후
                              결제가 중단되었습니다. 남은 {canceledCount}
                              회차는 청구되지 않습니다.
                            </>
                          )}
                        </p>
                        <button
                          className="sdp-pay-resume-btn"
                          onClick={handleResumePayment}
                        >
                          철회
                        </button>
                      </div>
                    ) : (
                      paidCount < installments.length && (
                        <div className="sdp-pay-stop-actions">
                          <button
                            className="sdp-pay-suspend-btn"
                            onClick={handleSuspendPayment}
                          >
                            중단
                          </button>
                          <button
                            className="sdp-pay-refund-btn"
                            onClick={openRefundModal}
                          >
                            환불
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <div className="sdp-pay-modal-testrow">
                    {/* <button
                      className="sdp-view-toggle-btn"
                      title="와이어프레임 테스트용"
                      onClick={resetPaymentConfig}
                    >
                      입력 전 상태로 보기 (테스트)
                    </button> */}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 진행 절차 선택 모달 */}
      {procSelectModalOpen && (
        <div
          className="sdp-proc-select-overlay"
          onClick={() => setProcSelectModalOpen(false)}
        >
          <div
            className="sdp-proc-select-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdp-proc-select-head">
              <h2 className="sdp-proc-select-title">진행 절차 선택</h2>
              <button
                type="button"
                className="sdp-proc-select-close"
                onClick={() => setProcSelectModalOpen(false)}
                aria-label="닫기"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="#666"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="sdp-proc-select-body">
              <p className="sdp-proc-select-desc">
                결제 정보 적용 후 진행할 절차를 선택해 주세요. 선택한 절차로
                진행 단계가 시작됩니다.
              </p>
              <div className="sdp-proc-select-list">
                {OPTION_BLOCKS.map((block) => {
                  if (block.type === "option") {
                    const opt = block.option;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`sdp-proc-select-item ${draftSelectedProc === opt.id ? "selected" : ""}`}
                        onClick={() => setDraftSelectedProc(opt.id)}
                      >
                        <div className="sdp-proc-select-item-main">
                          <span className="sdp-proc-select-item-name">
                            {opt.label}
                          </span>
                          {opt.recommended && (
                            <span className="sdp-proc-select-rec">추천</span>
                          )}
                        </div>
                        <div className="sdp-proc-select-item-meta">
                          <span className="sdp-proc-select-score">
                            {opt.score}
                            <em>/100</em>
                          </span>
                          <span
                            className={`sdp-proc-select-grade g-${opt.grade}`}
                          >
                            {opt.grade}
                          </span>
                        </div>
                      </button>
                    );
                  }

                  const summary = block.summary;
                  const groupSelected =
                    CREDIT_RECOVERY_IDS.has(draftSelectedProc);
                  const groupRecommended = block.children.some(
                    (c) => c.recommended,
                  );
                  return (
                    <div
                      key={block.id}
                      className={`sdp-proc-select-group ${procSelectCreditOpen ? "open" : ""}`}
                    >
                      <button
                        type="button"
                        className={`sdp-proc-select-item sdp-proc-select-group-header ${groupRecommended ? "has-rec" : ""} ${groupSelected && !procSelectCreditOpen ? "selected" : ""}`}
                        onClick={() => setProcSelectCreditOpen((v) => !v)}
                      >
                        <div className="sdp-proc-select-item-main">
                          <span className="sdp-proc-select-chevron" aria-hidden>
                            {procSelectCreditOpen ? "▾" : "▸"}
                          </span>
                          <span className="sdp-proc-select-item-name">
                            {block.label}
                          </span>
                          {groupRecommended && (
                            <span className="sdp-proc-select-rec">추천</span>
                          )}
                          {!procSelectCreditOpen && groupSelected && (
                            <span className="sdp-proc-select-sub">
                              {
                                block.children.find(
                                  (c) => c.id === draftSelectedProc,
                                )?.label
                              }
                            </span>
                          )}
                        </div>
                        <div className="sdp-proc-select-item-meta">
                          <span className="sdp-proc-select-score">
                            {summary.score}
                            <em>/100</em>
                          </span>
                          <span
                            className={`sdp-proc-select-grade g-${summary.grade}`}
                          >
                            {summary.grade}
                          </span>
                        </div>
                      </button>
                      {procSelectCreditOpen &&
                        block.children.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            className={`sdp-proc-select-item sdp-proc-select-child ${draftSelectedProc === opt.id ? "selected" : ""}`}
                            onClick={() => setDraftSelectedProc(opt.id)}
                          >
                            <div className="sdp-proc-select-item-main">
                              <span className="sdp-proc-select-item-name">
                                {opt.label}
                              </span>
                              {opt.recommended && (
                                <span className="sdp-proc-select-rec">
                                  추천
                                </span>
                              )}
                            </div>
                            <div className="sdp-proc-select-item-meta">
                              <span className="sdp-proc-select-score">
                                {opt.score}
                                <em>/100</em>
                              </span>
                              <span
                                className={`sdp-proc-select-grade g-${opt.grade}`}
                              >
                                {opt.grade}
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="sdp-proc-select-footer">
              <button
                type="button"
                className="sdp-proc-select-cancel"
                onClick={() => setProcSelectModalOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="sdp-proc-select-confirm"
                onClick={confirmApplyWithProcedure}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 환불 처리 모달 */}
      {refundModalOpen && (
        <div
          className="sdp-review-modal-overlay sdp-refund-modal-overlay"
          onClick={() => setRefundModalOpen(false)}
        >
          <div
            className="sdp-review-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdp-review-modal-head">
              <h2 className="sdp-review-modal-title">환불 처리</h2>
              <button
                type="button"
                className="sdp-review-modal-close"
                onClick={() => setRefundModalOpen(false)}
                aria-label="닫기"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="#666"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="sdp-review-modal-body">
              <p className="sdp-review-modal-desc">
                지금까지 납부한 금액은 환불 처리되고 이미 납부한 회차는
                &lsquo;환불&rsquo;로 표시되며, 남은 회차는 청구되지 않습니다.
              </p>
              <label className="sdp-review-field">
                <span className="sdp-review-field-label">전달 사항</span>
                <input
                  type="text"
                  className="sdp-review-input"
                  placeholder="예: 고객 요청으로 계약 해지 및 납부액 환불 진행합니다."
                  value={refundMessage}
                  onChange={(e) => setRefundMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmRefund();
                  }}
                  autoFocus
                />
              </label>
            </div>
            <div className="sdp-review-modal-footer">
              <button
                type="button"
                className="sdp-review-cancel-btn"
                onClick={() => setRefundModalOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="sdp-review-confirm-refund-btn"
                onClick={handleConfirmRefund}
              >
                환불 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 분석 데이터 수락 모달 */}
      {acceptModalOpen && (
        <div
          className="sdp-review-modal-overlay"
          onClick={() => setAcceptModalOpen(false)}
        >
          <div
            className="sdp-review-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdp-review-modal-head">
              <h2 className="sdp-review-modal-title">분석 데이터 수락</h2>
              <button
                type="button"
                className="sdp-review-modal-close"
                onClick={() => setAcceptModalOpen(false)}
                aria-label="닫기"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="#666"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="sdp-review-modal-body">
              <p className="sdp-review-modal-desc">
                수락 메시지를 입력해 주세요. 영업담당자에게 전달됩니다.
                <br />
                계약 진행 후 결제 정보를 입력하면 절차 진행 단계로 넘어갑니다.
              </p>
              <label className="sdp-review-field">
                <span className="sdp-review-field-label">수락 메시지</span>
                <input
                  type="text"
                  className="sdp-review-input"
                  placeholder="예: 분석 내용 확인했습니다. 계약 진행 부탁드립니다."
                  value={acceptMessage}
                  onChange={(e) => setAcceptMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmAccept();
                  }}
                  autoFocus
                />
              </label>
            </div>
            <div className="sdp-review-modal-footer">
              <button
                type="button"
                className="sdp-review-cancel-btn"
                onClick={() => setAcceptModalOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="sdp-review-confirm-accept-btn"
                onClick={handleConfirmAccept}
              >
                수락 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 분석 데이터 거절 모달 */}
      {rejectModalOpen && (
        <div
          className="sdp-review-modal-overlay"
          onClick={() => setRejectModalOpen(false)}
        >
          <div
            className="sdp-review-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdp-review-modal-head">
              <h2 className="sdp-review-modal-title">분석 데이터 거절</h2>
              <button
                type="button"
                className="sdp-review-modal-close"
                onClick={() => setRejectModalOpen(false)}
                aria-label="닫기"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="#666"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="sdp-review-modal-body">
              <p className="sdp-review-modal-desc">
                거절 사유를 입력해 주세요. 영업담당자에게 전달됩니다.
              </p>
              <label className="sdp-review-field">
                <span className="sdp-review-field-label">거절 사유</span>
                <input
                  type="text"
                  className="sdp-review-input"
                  placeholder=""
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmReject();
                  }}
                  autoFocus
                />
              </label>
            </div>
            <div className="sdp-review-modal-footer">
              <button
                type="button"
                className="sdp-review-cancel-btn"
                onClick={() => setRejectModalOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="sdp-review-confirm-reject-btn"
                onClick={handleConfirmReject}
              >
                거절 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleDashboardPage;
