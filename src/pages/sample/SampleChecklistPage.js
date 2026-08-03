import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SampleChecklistPage.css";

const SECTIONS = [
  { id: "basic", label: "기본 정보", desc: "고객의 인적사항을 확인합니다" },
  {
    id: "assets",
    label: "자산 현황",
    desc: "보유 자산의 종류와 규모를 파악합니다",
  },
  {
    id: "debts",
    label: "채무 현황",
    desc: "채무처별 규모와 연체 현황을 확인합니다",
  },
  {
    id: "income",
    label: "소득 / 지출",
    desc: "월 소득과 고정 지출을 계산합니다",
  },
  {
    id: "misc",
    label: "기타 사항",
    desc: "신청 이력, 소송 여부 등을 확인합니다",
  },
];

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

let debtIdSeq = 4;
const nextDebtId = () => {
  debtIdSeq += 1;
  return `d${debtIdSeq}`;
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
  return monthsToOverduePeriod(parseInt(String(value ?? "").replace(/[^\d]/g, ""), 10) || 0);
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

const getMaxOverdue = (debts) => {
  let max = 0;
  (debts || []).forEach((d) => {
    const n = parseOverdueMonths(d.overduePeriod);
    if (n > max) max = n;
  });
  return String(max);
};

const SAMPLE_DETAIL_DEBTS = [
  {
    id: "d1",
    debtType: "은행대출",
    lender: "국민은행",
    loanDate: "2022-03-15",
    maturityDate: "2029-03-15",
    principal: "150000000",
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
    principal: "80000000",
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
    principal: "50000000",
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
    principal: "30000000",
    rate: "24",
    repayMethod: "만기일시",
    overduePeriod: "5",
  },
];

const emptyDebt = () => ({
  id: nextDebtId(),
  debtType: "은행대출",
  lender: "",
  loanDate: "",
  maturityDate: "",
  principal: "",
  rate: "",
  repayMethod: "원리금균등",
  overduePeriod: "0",
});

/** 대출일~만기일 개월 수 (최소 1) */
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

/**
 * 상환 계산 (원)
 * - 원리금균등: 매월 납입액 고정
 * - 원금균등: 매월 원금 고정, 월불입은 평균액
 * - 만기일시: 기간 중 이자만, 원금은 만기 상환 (월불입=월이자)
 */
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
    for (let k = 0; k < n; k++) {
      totalInterest += (P - principalPart * k) * r;
    }
    const totalRepay = P + totalInterest;
    return {
      months: n,
      monthly: Math.round(totalRepay / n),
      totalRepay: Math.round(totalRepay),
      totalInterest: Math.round(totalInterest),
    };
  }

  // 원리금균등 (기본)
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

const initialForm = {
  name: "김민수",
  ageGroup: "40대",
  gender: "남",
  region: "서울",
  employmentType: "자영업",
  dependents: "2명",
  hasSpouseIncome: false,
  realEstateType: "없음",
  realEstateDetail: "",
  financialAssetRange: "500만~2천만",
  vehicleRange: "500만~2천만",
  debtInputMode: "simple",
  debtTypes: ["은행대출", "카드론", "캐피탈"],
  bankLoan: "15000",
  creditCardDebt: "8000",
  capitalLoan: "5000",
  privateLoan: "0",
  debts: SAMPLE_DETAIL_DEBTS,
  overduePeriod: OverduePeriod.From6To12Months,
  debtCause: ["사업실패"],
  incomeRange: "200~300만",
  housingType: "월세",
  monthlyRent: "70",
  monthlyFood: "40",
  monthlyEducation: "30",
  monthlyTransport: "15",
  monthlyEtc: "20",
  previousFiling: false,
  previousFilingYear: "",
  hasSurety: false,
  suretyClear: "",
  hasLawsuit: false,
  lawsuitDetails: "",
  // 새출발기금 자격 판단
  businessPeriodEligible: true,
  businessStatus: "영업중",
  distressTypes: ["3개월 이상 연체"],
  excludedIndustry: false,
  previousNewStartFund: false,
  memo: "",
};

const INCOME_RANGES = {
  "100만 이하": 80,
  "100~200만": 150,
  "200~300만": 250,
  "300~400만": 350,
  "400만 이상": 450,
};

const SampleChecklistPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromResult = location.state?.fromResult === true;

  const [activeSection, setActiveSection] = useState("basic");
  const [form, setForm] = useState(initialForm);
  const [completedSections, setCompletedSections] = useState(
    new Set(["basic", "assets", "debts", "income"]),
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const set = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));
  const setInput = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const simpleTotalDebt =
    (parseInt(form.bankLoan) || 0) +
    (parseInt(form.creditCardDebt) || 0) +
    (parseInt(form.capitalLoan) || 0) +
    (parseInt(form.privateLoan) || 0);

  const detailCalcs = (form.debts || []).map((d) => ({
    debt: d,
    calc: calcDebtItem(d),
  }));
  const detailPrincipalWon = (form.debts || []).reduce(
    (sum, d) => sum + (parseInt(d.principal) || 0),
    0,
  );
  const detailTotalRepayWon = detailCalcs.reduce(
    (sum, { calc }) => sum + (calc?.totalRepay || 0),
    0,
  );
  const detailTotalInterestWon = detailCalcs.reduce(
    (sum, { calc }) => sum + (calc?.totalInterest || 0),
    0,
  );
  const detailMonthlySumWon = detailCalcs.reduce(
    (sum, { calc }) => sum + (calc?.monthly || 0),
    0,
  );

  // 사이드바·심플 합계는 만원 단위 유지 / 상세는 원 → 만원 환산
  const totalDebt =
    form.debtInputMode === "detail"
      ? wonToMan(detailPrincipalWon)
      : simpleTotalDebt;

  const buildDebtSummary = () => {
    if (form.debtInputMode === "detail") {
      const items = detailCalcs.map(({ debt, calc }) => ({
        id: debt.id,
        label: debt.lender
          ? `${debt.lender}${debt.debtType ? ` (${debt.debtType})` : ""}`
          : debt.debtType || "미입력",
        debtType: debt.debtType || "",
        lender: debt.lender || "",
        amount: wonToMan(debt.principal),
        principalWon: parseInt(debt.principal) || 0,
        totalRepay: calc ? wonToMan(calc.totalRepay) : null,
        totalInterest: calc ? wonToMan(calc.totalInterest) : null,
        monthly: calc ? wonToMan(calc.monthly) : null,
        months: calc?.months ?? null,
        rate: debt.rate,
        overduePeriod: String(parseOverdueMonths(debt.overduePeriod)),
        repayMethod: debt.repayMethod || "원리금균등",
        loanDate: debt.loanDate || "",
        maturityDate: debt.maturityDate || "",
      }));
      const maxOverdue = getMaxOverdue(form.debts);
      return {
        mode: "detail",
        totalDebt: wonToMan(detailPrincipalWon),
        totalDebtWithInterest: wonToMan(detailTotalRepayWon),
        totalInterest: wonToMan(detailTotalInterestWon),
        monthlySum: wonToMan(detailMonthlySumWon),
        maxOverdue,
        overduePeriod: maxOverdue,
        items,
      };
    }
    const items = [
      {
        label: "은행 대출",
        debtType: "은행대출",
        amount: parseInt(form.bankLoan) || 0,
      },
      {
        label: "카드론",
        debtType: "카드론",
        amount: parseInt(form.creditCardDebt) || 0,
      },
      {
        label: "캐피탈",
        debtType: "캐피탈",
        amount: parseInt(form.capitalLoan) || 0,
      },
      {
        label: "사채",
        debtType: "사채",
        amount: parseInt(form.privateLoan) || 0,
      },
    ].filter((i) => i.amount > 0);
    const principal = items.reduce((s, i) => s + i.amount, 0);
    const overdue = normalizeSimpleOverdue(form.overduePeriod);
    return {
      mode: "simple",
      totalDebt: principal,
      totalDebtWithInterest: principal,
      totalInterest: 0,
      monthlySum: null,
      maxOverdue: overdue,
      overduePeriod: overdue,
      items,
    };
  };

  const updateDebt = (id, field, value) => {
    setForm((p) => {
      const debts = p.debts.map((d) =>
        d.id === id ? { ...d, [field]: value } : d,
      );
      return {
        ...p,
        debts,
        ...(p.debtInputMode === "detail"
          ? { overduePeriod: getMaxOverdue(debts) }
          : {}),
      };
    });
  };

  const addDebt = () => {
    setForm((p) => {
      const debts = [...p.debts, emptyDebt()];
      return {
        ...p,
        debts,
        ...(p.debtInputMode === "detail"
          ? { overduePeriod: getMaxOverdue(debts) }
          : {}),
      };
    });
  };

  const removeDebt = (id) => {
    setForm((p) => {
      if (p.debts.length <= 1) return p;
      const debts = p.debts.filter((d) => d.id !== id);
      return {
        ...p,
        debts,
        ...(p.debtInputMode === "detail"
          ? { overduePeriod: getMaxOverdue(debts) }
          : {}),
      };
    });
  };

  const approxIncome = INCOME_RANGES[form.incomeRange] || 0;
  const approxExpenses =
    (parseInt(form.monthlyRent) || 0) +
    (parseInt(form.monthlyFood) || 0) +
    (parseInt(form.monthlyEducation) || 0) +
    (parseInt(form.monthlyTransport) || 0) +
    (parseInt(form.monthlyEtc) || 0);
  const disposable = approxIncome - approxExpenses;

  const completionRate = Math.round(
    (completedSections.size / SECTIONS.length) * 100,
  );

  const goToResult = () => {
    const debtSummary = buildDebtSummary();
    setAnalyzing(true);
    setTimeout(
      () => navigate("/checklist/result", { state: { debtSummary } }),
      2000,
    );
  };

  const handleNext = () => {
    setCompletedSections((prev) => new Set([...prev, activeSection]));
    const idx = SECTIONS.findIndex((s) => s.id === activeSection);
    if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1].id);
  };

  const handlePrev = () => {
    const idx = SECTIONS.findIndex((s) => s.id === activeSection);
    if (idx > 0) setActiveSection(SECTIONS[idx - 1].id);
  };

  const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);
  const currentSection = SECTIONS[currentIdx];
  const isLast = currentIdx === SECTIONS.length - 1;

  if (analyzing) {
    return (
      <div className="scl-analyzing">
        <div className="scl-analyzing-card">
          {/* <div className="scl-analyzing-spinner">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="23" stroke="#f0f0f0" strokeWidth="5" />
              <circle
                cx="28"
                cy="28"
                r="23"
                stroke="#111"
                strokeWidth="5"
                strokeDasharray="144"
                strokeDashoffset="100"
                strokeLinecap="round"
                className="scl-spinner-arc"
              />
            </svg>
          </div> */}
          <p className="scl-analyzing-title">분석 중</p>
          <p className="scl-analyzing-sub">
            수집된 정보를 바탕으로
            <br />
            개인회생·파산·새출발기금 가능성을 분석하고 있습니다.
          </p>
          <div className="scl-analyzing-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scl-page">
      {/* 진행률 바 — 페이지 상단 */}
      <div className="scl-progress-track">
        <div
          className="scl-progress-fill"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      <div className="scl-layout">
        {/* 사이드바 */}
        <aside className={`scl-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
          {/* 모바일 전용 헤더 바 */}
          <div className="scl-mobile-topbar">
            {/* 단계 정보 (좌) */}
            <div className="scl-mobile-step-info">
              <span className="scl-mobile-step-fraction">
                {currentIdx + 1}/{SECTIONS.length}
              </span>
              <span className="scl-mobile-step-name">
                {currentSection.label}
              </span>
            </div>
            {/* 분석하기 버튼 (우) */}
            <button className="scl-mobile-analyze-btn" onClick={goToResult}>
              <svg
                width="11"
                height="11"
                viewBox="0 0 14 14"
                fill="none"
                style={{ marginRight: 5, flexShrink: 0 }}
              >
                <path
                  d="M7 0C7.2 2.8 8.2 4.8 10.5 6C8.2 7.2 7.2 9.2 7 12C6.8 9.2 5.8 7.2 3.5 6C5.8 4.8 6.8 2.8 7 0Z"
                  fill="currentColor"
                />
                <path
                  d="M12 4C12.1 5.2 12.6 6 13.5 6.5C12.6 7 12.1 7.8 12 9C11.9 7.8 11.4 7 10.5 6.5C11.4 6 11.9 5.2 12 4Z"
                  fill="currentColor"
                  opacity="0.5"
                />
                <path
                  d="M2 8C2.1 8.8 2.5 9.3 3 9.5C2.5 9.7 2.1 10.2 2 11C1.9 10.2 1.5 9.7 1 9.5C1.5 9.3 1.9 8.8 2 8Z"
                  fill="currentColor"
                  opacity="0.5"
                />
              </svg>
              분석하기
            </button>
            {/* 열고 닫기 — 전체 바 클릭 영역 */}
            <button
              className={`scl-mobile-toggle ${sidebarOpen ? "open" : ""}`}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "단계 메뉴 닫기" : "단계 메뉴 열기"}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* 스크롤 영역 */}
          <div className="scl-sidebar-body">
            <div className="scl-client-row">
              <div className="scl-avatar">
                {form.name ? form.name.charAt(0) : "?"}
              </div>
              <div>
                <div className="scl-client-name">
                  {form.name || "고객명 미입력"}
                </div>
                <div className="scl-client-sub">
                  {form.ageGroup} · {form.gender} · {form.employmentType}
                </div>
              </div>
            </div>

            <div className="scl-kpi-grid">
              <div className="scl-kpi">
                <span className="scl-kpi-label">총 채무</span>
                <span className="scl-kpi-val">
                  {totalDebt.toLocaleString()}
                  <em>만원</em>
                </span>
              </div>
              <div className="scl-kpi">
                <span className="scl-kpi-label">월 소득(추정)</span>
                <span className="scl-kpi-val">
                  {approxIncome}
                  <em>만원</em>
                </span>
              </div>
              <div className="scl-kpi">
                <span className="scl-kpi-label">월 가용소득</span>
                <span className={`scl-kpi-val ${disposable < 0 ? "neg" : ""}`}>
                  {disposable >= 0 ? "+" : ""}
                  {disposable}
                  <em>만원</em>
                </span>
              </div>
            </div>

            <nav className="scl-steps">
              {SECTIONS.map((sec, i) => {
                const done = completedSections.has(sec.id);
                const active = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    className={`scl-step-item ${active ? "active" : ""} ${done ? "done" : ""}`}
                    onClick={() => setActiveSection(sec.id)}
                  >
                    <span className="scl-step-dot">
                      {done ? (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </span>
                    <span className="scl-step-label">{sec.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* 분석하기 버튼 — 데스크탑: 단계 메뉴 바로 아래 */}
            <div className="scl-analyze-wrap scl-analyze-desktop">
              <button className="scl-analyze-btn" onClick={goToResult}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ marginRight: 7, flexShrink: 0 }}
                >
                  <path
                    d="M7 0C7.2 2.8 8.2 4.8 10.5 6C8.2 7.2 7.2 9.2 7 12C6.8 9.2 5.8 7.2 3.5 6C5.8 4.8 6.8 2.8 7 0Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 4C12.1 5.2 12.6 6 13.5 6.5C12.6 7 12.1 7.8 12 9C11.9 7.8 11.4 7 10.5 6.5C11.4 6 11.9 5.2 12 4Z"
                    fill="currentColor"
                    opacity="0.7"
                  />
                  <path
                    d="M2.5 1C2.55 1.9 2.9 2.5 3.5 2.8C2.9 3.1 2.55 3.7 2.5 4.5C2.45 3.7 2.1 3.1 1.5 2.8C2.1 2.5 2.45 1.9 2.5 1Z"
                    fill="currentColor"
                    opacity="0.5"
                  />
                </svg>
                분석하기
              </button>
            </div>
          </div>

          {/* 분석하기 버튼 — 모바일: 단계 인디케이터 바로 아래 항상 노출 */}
          <div className="scl-analyze-wrap scl-analyze-mobile">
            <button className="scl-analyze-btn" onClick={goToResult}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{ marginRight: 7, flexShrink: 0 }}
              >
                <path
                  d="M7 0C7.2 2.8 8.2 4.8 10.5 6C8.2 7.2 7.2 9.2 7 12C6.8 9.2 5.8 7.2 3.5 6C5.8 4.8 6.8 2.8 7 0Z"
                  fill="currentColor"
                />
                <path
                  d="M12 4C12.1 5.2 12.6 6 13.5 6.5C12.6 7 12.1 7.8 12 9C11.9 7.8 11.4 7 10.5 6.5C11.4 6 11.9 5.2 12 4Z"
                  fill="currentColor"
                  opacity="0.7"
                />
                <path
                  d="M2.5 1C2.55 1.9 2.9 2.5 3.5 2.8C2.9 3.1 2.55 3.7 2.5 4.5C2.45 3.7 2.1 3.1 1.5 2.8C2.1 2.5 2.45 1.9 2.5 1Z"
                  fill="currentColor"
                  opacity="0.5"
                />
              </svg>
              분석하기
            </button>
          </div>
        </aside>

        {/* 메인 폼 */}
        <main className="scl-main">
          {/* 정보 수정 모드: X 닫기 버튼 */}
          {fromResult && (
            <button
              className="scl-close-btn"
              title="분석 결과로 돌아가기"
              onClick={() => navigate(-1)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 3L13 13M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
          <div className="scl-form-wrap">
            <div className="scl-section-head">
              <h2 className="scl-section-title">{currentSection.label}</h2>
              <p className="scl-section-desc">{currentSection.desc}</p>
            </div>

            <div className="scl-form">
              {activeSection === "basic" && (
                <>
                  <div className="scl-row-2">
                    <Field label="고객명">
                      <input
                        className="scl-input"
                        value={form.name}
                        onChange={setInput("name")}
                        placeholder="홍길동"
                      />
                    </Field>
                    <Field label="성별">
                      <Chips
                        options={["남", "여"]}
                        value={form.gender}
                        onChange={set("gender")}
                      />
                    </Field>
                  </div>
                  <Field label="연령대">
                    <Chips
                      options={["20대", "30대", "40대", "50대", "60대 이상"]}
                      value={form.ageGroup}
                      onChange={set("ageGroup")}
                    />
                  </Field>
                  <Field label="거주 지역">
                    <Chips
                      options={[
                        "서울",
                        "경기·인천",
                        "부산·경남",
                        "대구·경북",
                        "충청·강원",
                        "호남·제주",
                      ]}
                      value={form.region}
                      onChange={set("region")}
                    />
                  </Field>
                  <Field label="고용 형태">
                    <Chips
                      options={[
                        "정규직",
                        "계약직",
                        "자영업",
                        "프리랜서",
                        "무직",
                        "기타",
                      ]}
                      value={form.employmentType}
                      onChange={(v) =>
                        setForm((p) => ({
                          ...p,
                          employmentType: v,
                          // 자영업 선택 시 새출발기금 게이트 기본값을 '해당'으로
                          ...(v === "자영업" && !p.businessPeriodEligible
                            ? {
                                businessPeriodEligible: true,
                                businessStatus:
                                  p.businessStatus === "해당없음"
                                    ? "영업중"
                                    : p.businessStatus || "영업중",
                              }
                            : {}),
                        }))
                      }
                    />
                  </Field>
                  <Field label="부양가족">
                    <Chips
                      options={["없음", "1명", "2명", "3명", "4명 이상"]}
                      value={form.dependents}
                      onChange={set("dependents")}
                    />
                  </Field>
                  <label className="scl-switch-row">
                    <span>배우자 소득 있음</span>
                    <div
                      className={`scl-switch ${form.hasSpouseIncome ? "on" : ""}`}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          hasSpouseIncome: !p.hasSpouseIncome,
                        }))
                      }
                    >
                      <div className="scl-switch-thumb" />
                    </div>
                  </label>
                </>
              )}

              {activeSection === "assets" && (
                <>
                  <Field label="부동산 보유 여부">
                    <Chips
                      options={[
                        "없음",
                        "자가 소유",
                        "전세 보증금",
                        "임대 수익",
                      ]}
                      value={form.realEstateType}
                      onChange={set("realEstateType")}
                    />
                  </Field>
                  {form.realEstateType !== "없음" && (
                    <Field label="부동산 시가 (만원)">
                      <input
                        className="scl-input"
                        type="number"
                        value={form.realEstateDetail}
                        onChange={setInput("realEstateDetail")}
                        placeholder="시가 직접 입력"
                      />
                    </Field>
                  )}
                  <Field label="금융 자산 (예·적금 + 주식 등)">
                    <Chips
                      options={[
                        "없음",
                        "500만 미만",
                        "500만~2천만",
                        "2천만~5천만",
                        "5천만 이상",
                      ]}
                      value={form.financialAssetRange}
                      onChange={set("financialAssetRange")}
                    />
                  </Field>
                  <Field label="차량 보유">
                    <Chips
                      options={[
                        "없음",
                        "500만 미만",
                        "500만~2천만",
                        "2천만 이상",
                      ]}
                      value={form.vehicleRange}
                      onChange={set("vehicleRange")}
                    />
                  </Field>
                </>
              )}

              {activeSection === "debts" && (
                <>
                  <div className="scl-debt-panel">
                    <div className="scl-debt-panel-head">
                      <div className="scl-debt-panel-title-wrap">
                        <span className="scl-debt-panel-title">채무 내역</span>
                        <span className="scl-debt-panel-hint">
                          {form.debtInputMode === "simple"
                            ? "종류별 잔액만 빠르게 입력"
                            : "채권처·상환방식·금리까지 상세 입력 (원 단위)"}
                        </span>
                      </div>
                      <div className="scl-mode-toggle" role="tablist">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={form.debtInputMode === "simple"}
                          className={`scl-mode-btn ${form.debtInputMode === "simple" ? "on" : ""}`}
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              debtInputMode: "simple",
                              overduePeriod: monthsToOverduePeriod(
                                getMaxOverdue(p.debts),
                              ),
                            }))
                          }
                        >
                          심플
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={form.debtInputMode === "detail"}
                          className={`scl-mode-btn ${form.debtInputMode === "detail" ? "on" : ""}`}
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              debtInputMode: "detail",
                              overduePeriod: getMaxOverdue(p.debts),
                            }))
                          }
                        >
                          상세
                        </button>
                      </div>
                    </div>

                    <div className="scl-debt-panel-body">
                      {form.debtInputMode === "simple" ? (
                        <>
                          <Field label="채무 종류 (중복 선택 가능)">
                            <Chips
                              options={DEBT_TYPE_OPTIONS}
                              value={form.debtTypes}
                              onChange={set("debtTypes")}
                              multi
                            />
                          </Field>
                          <p className="scl-note">
                            ※ 해당 채무의 현재 잔액을 만원 단위로 입력하세요
                          </p>
                          <div className="scl-row-2">
                            {form.debtTypes.includes("은행대출") && (
                              <Field label="은행 대출">
                                <input
                                  className="scl-input"
                                  type="number"
                                  value={form.bankLoan}
                                  onChange={setInput("bankLoan")}
                                />
                              </Field>
                            )}
                            {form.debtTypes.includes("카드론") && (
                              <Field label="카드론">
                                <input
                                  className="scl-input"
                                  type="number"
                                  value={form.creditCardDebt}
                                  onChange={setInput("creditCardDebt")}
                                />
                              </Field>
                            )}
                            {(form.debtTypes.includes("캐피탈") ||
                              form.debtTypes.includes("저축은행")) && (
                              <Field label="캐피탈 / 저축은행">
                                <input
                                  className="scl-input"
                                  type="number"
                                  value={form.capitalLoan}
                                  onChange={setInput("capitalLoan")}
                                />
                              </Field>
                            )}
                            {(form.debtTypes.includes("사채") ||
                              form.debtTypes.includes("개인차용")) && (
                              <Field label="사채 / 개인차용">
                                <input
                                  className="scl-input"
                                  type="number"
                                  value={form.privateLoan}
                                  onChange={setInput("privateLoan")}
                                />
                              </Field>
                            )}
                          </div>
                          <div className="scl-sum-line">
                            <span>총 채무 합계</span>
                            <strong>{totalDebt.toLocaleString()}만원</strong>
                          </div>
                          <Field
                            label="연체 기간"
                            hint="여러 채무가 있으면 가장 긴 연체 기준으로"
                          >
                            <select
                              className="scl-input"
                              value={normalizeSimpleOverdue(form.overduePeriod)}
                              onChange={(e) =>
                                set("overduePeriod")(e.target.value)
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
                        <>
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
                                {form.debts.map((debt) => {
                                  const calc = calcDebtItem(debt);
                                  return (
                                    <tr key={debt.id}>
                                      <td>
                                        <select
                                          className="scl-grid-input scl-grid-select"
                                          value={debt.debtType || "은행대출"}
                                          onChange={(e) =>
                                            updateDebt(
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
                                            updateDebt(
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
                                          value={
                                            debt.repayMethod || "원리금균등"
                                          }
                                          onChange={(e) =>
                                            updateDebt(
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
                                            updateDebt(
                                              debt.id,
                                              "overduePeriod",
                                              e.target.value.replace(
                                                /[^\d]/g,
                                                "",
                                              ),
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
                                            updateDebt(
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
                                            updateDebt(
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
                                            updateDebt(
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
                                            updateDebt(
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
                                        {calc
                                          ? formatWon(calc.totalInterest)
                                          : "—"}
                                      </td>
                                      <td className="scl-grid-calc">
                                        {calc
                                          ? formatWon(calc.totalRepay)
                                          : "—"}
                                      </td>
                                      <td className="col-act">
                                        {form.debts.length > 1 && (
                                          <button
                                            type="button"
                                            className="scl-debt-remove"
                                            onClick={() => removeDebt(debt.id)}
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
                                      onClick={addDebt}
                                    >
                                      + 행 추가
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                              {detailTotalRepayWon > 0 && (
                                <tfoot>
                                  <tr>
                                    <td colSpan={6}>합계</td>
                                    <td className="scl-grid-calc">
                                      {formatWon(detailPrincipalWon)}
                                    </td>
                                    <td />
                                    <td />
                                    <td className="scl-grid-calc">
                                      {formatWon(detailMonthlySumWon)}
                                    </td>
                                    <td className="scl-grid-calc">
                                      {formatWon(detailTotalInterestWon)}
                                    </td>
                                    <td className="scl-grid-calc">
                                      {formatWon(detailTotalRepayWon)}
                                    </td>
                                    <td />
                                  </tr>
                                </tfoot>
                              )}
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Field label="채무 발생 원인 (중복 선택 가능)">
                    <Chips
                      options={[
                        "사업실패",
                        "생활비 부족",
                        "의료비",
                        "투자 손실",
                        "보증 피해",
                        "기타",
                      ]}
                      value={form.debtCause}
                      onChange={set("debtCause")}
                      multi
                    />
                  </Field>
                </>
              )}

              {activeSection === "income" && (
                <>
                  <Field label="월 소득 (세후 실수령 기준)">
                    <Chips
                      options={[
                        "100만 이하",
                        "100~200만",
                        "200~300만",
                        "300~400만",
                        "400만 이상",
                      ]}
                      value={form.incomeRange}
                      onChange={set("incomeRange")}
                    />
                  </Field>
                  <Field label="주거 형태">
                    <Chips
                      options={["자가", "전세", "월세", "가족과 거주"]}
                      value={form.housingType}
                      onChange={set("housingType")}
                    />
                  </Field>
                  <p className="scl-sub-heading">월 고정 지출 (만원)</p>
                  <p className="scl-note">※ 해당 없으면 0으로 입력</p>
                  <div className="scl-row-3">
                    <Field label="주거비">
                      <input
                        className="scl-input"
                        type="number"
                        value={form.monthlyRent}
                        onChange={setInput("monthlyRent")}
                      />
                    </Field>
                    <Field label="식비">
                      <input
                        className="scl-input"
                        type="number"
                        value={form.monthlyFood}
                        onChange={setInput("monthlyFood")}
                      />
                    </Field>
                    <Field label="교육비">
                      <input
                        className="scl-input"
                        type="number"
                        value={form.monthlyEducation}
                        onChange={setInput("monthlyEducation")}
                      />
                    </Field>
                  </div>
                  <div className="scl-row-2">
                    <Field label="교통비">
                      <input
                        className="scl-input"
                        type="number"
                        value={form.monthlyTransport}
                        onChange={setInput("monthlyTransport")}
                      />
                    </Field>
                    <Field label="기타 고정지출">
                      <input
                        className="scl-input"
                        type="number"
                        value={form.monthlyEtc}
                        onChange={setInput("monthlyEtc")}
                      />
                    </Field>
                  </div>
                  <div className="scl-income-summary">
                    <div className="scl-income-row">
                      <span>월 소득 (추정)</span>
                      <span>+{approxIncome}만원</span>
                    </div>
                    <div className="scl-income-row">
                      <span>총 지출</span>
                      <span>−{approxExpenses}만원</span>
                    </div>
                    <div className="scl-income-row total">
                      <span>월 가용 소득</span>
                      <strong className={disposable < 30 ? "warn" : ""}>
                        {disposable >= 0 ? "+" : ""}
                        {disposable}만원
                      </strong>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "misc" && (
                <>
                  <p className="scl-sub-heading">새출발기금 자격 확인</p>
                  <p className="scl-note">
                    ※ 해당 기간 사업 영위 시에만 상세 문항이 표시됩니다
                    (휴업·폐업 포함)
                  </p>
                  <Field
                    label="’20.4월 ~ ’25.6월 중 개인사업자·소상공인으로 사업 영위한 적 있음"
                    hint="현재 고용 형태와 무관"
                  >
                    <Chips
                      options={[
                        { value: "yes", label: "예" },
                        { value: "no", label: "아니오" },
                      ]}
                      value={form.businessPeriodEligible ? "yes" : "no"}
                      onChange={(v) =>
                        setForm((p) => {
                          const eligible = v === "yes";
                          if (!eligible) {
                            return {
                              ...p,
                              businessPeriodEligible: false,
                              businessStatus: "해당없음",
                              distressTypes: ["해당없음"],
                              excludedIndustry: false,
                              previousNewStartFund: false,
                            };
                          }
                          return {
                            ...p,
                            businessPeriodEligible: true,
                            businessStatus:
                              p.businessStatus === "해당없음"
                                ? "영업중"
                                : p.businessStatus || "영업중",
                            distressTypes:
                              !p.distressTypes.length ||
                              p.distressTypes.includes("해당없음")
                                ? ["3개월 이상 연체"]
                                : p.distressTypes,
                          };
                        })
                      }
                    />
                  </Field>

                  {form.businessPeriodEligible && (
                    <>
                      <Field label="현재 사업 상태">
                        <Chips
                          options={[
                            "영업중",
                            "휴업",
                            "폐업(개인)",
                            "법인 폐업",
                          ]}
                          value={form.businessStatus}
                          onChange={set("businessStatus")}
                        />
                      </Field>
                      <Field
                        label="부실·부실우려 해당 여부"
                        hint="중복 선택 가능"
                      >
                        <Chips
                          options={[
                            "3개월 이상 연체",
                            "만기연장·상환유예",
                            "국세·지방세 체납",
                            "신용평점 하위",
                            "해당없음",
                          ]}
                          value={form.distressTypes}
                          onChange={(next) => {
                            if (
                              next.includes("해당없음") &&
                              !form.distressTypes.includes("해당없음")
                            ) {
                              set("distressTypes")(["해당없음"]);
                            } else {
                              set("distressTypes")(
                                next.filter((x) => x !== "해당없음"),
                              );
                            }
                          }}
                          multi
                        />
                      </Field>
                      <div className="scl-check-list">
                        {[
                          {
                            field: "excludedIndustry",
                            label:
                              "새출발기금 제외 업종 해당 (부동산 임대업, 법무·회계·세무 등)",
                          },
                          {
                            field: "previousNewStartFund",
                            label:
                              "새출발기금 이전 신청 이력 있음 (원칙적으로 1회만 신청 가능)",
                          },
                        ].map(({ field, label }) => (
                          <div
                            key={field}
                            className={`scl-check-card ${form[field] ? "expanded" : ""}`}
                          >
                            <label className="scl-check-row">
                              <span>{label}</span>
                              <div
                                className={`scl-switch ${form[field] ? "on" : ""}`}
                                onClick={() =>
                                  setForm((p) => ({
                                    ...p,
                                    [field]: !p[field],
                                  }))
                                }
                              >
                                <div className="scl-switch-thumb" />
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="scl-check-list">
                    {[
                      {
                        field: "previousFiling",
                        label: "이전 개인회생 / 파산 신청 이력 있음",
                        subField: "previousFilingYear",
                        subPlaceholder: "신청 연도 및 결과",
                      },
                      {
                        field: "hasSurety",
                        label: "보증인 / 연대보증 관계 있음",
                        subField: "suretyClear",
                        subPlaceholder: "관계 내용 입력",
                      },
                      {
                        field: "hasLawsuit",
                        label: "현재 진행 중인 소송 / 압류 있음",
                        subField: "lawsuitDetails",
                        subPlaceholder: "소송·압류 상세 내용",
                      },
                    ].map(({ field, label, subField, subPlaceholder }) => (
                      <div
                        key={field}
                        className={`scl-check-card ${form[field] ? "expanded" : ""}`}
                      >
                        <label className="scl-check-row">
                          <span>{label}</span>
                          <div
                            className={`scl-switch ${form[field] ? "on" : ""}`}
                            onClick={() =>
                              setForm((p) => ({ ...p, [field]: !p[field] }))
                            }
                          >
                            <div className="scl-switch-thumb" />
                          </div>
                        </label>
                        {form[field] && subField && (
                          <input
                            className="scl-input scl-sub-input"
                            value={form[subField]}
                            onChange={setInput(subField)}
                            placeholder={subPlaceholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <Field label="상담사 메모">
                    <textarea
                      className="scl-input scl-textarea"
                      value={form.memo}
                      onChange={setInput("memo")}
                      rows={4}
                      placeholder="상담 중 특이사항, 고객 태도, 추가 메모 등"
                    />
                  </Field>
                </>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="scl-nav-btns">
              {currentIdx > 0 && (
                <button className="scl-btn-prev" onClick={handlePrev}>
                  이전
                </button>
              )}
              {!isLast && (
                <button className="scl-btn-next" onClick={handleNext}>
                  다음
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SampleChecklistPage;
