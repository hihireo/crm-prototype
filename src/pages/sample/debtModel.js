/**
 * 채무·담보 자산 공용 모델.
 *
 * 체크리스트(SampleChecklistPage)와 분석 결과(SampleDashboardPage)가 같은 스키마와
 * 같은 계산을 쓰도록 한 곳에 모았다. 채무는 입력 방식(간편/상세)에 상관없이 항상
 * `debts[]` 행 배열 하나로만 저장하고, 모드는 "어떤 컬럼을 보여줄지"만 결정한다.
 *
 * 담보 대출은 자산 단계에서 입력하더라도 별도 저장소를 두지 않고 `debts[]`에 쓰고,
 * `collateralAssetId`로 어떤 자산에 걸린 담보인지만 표시한다.
 */

/* ── 자산 종류 ─────────────────────────────────────────────── */

export const ASSET_KINDS = [
  {
    id: "home",
    icon: "🏠",
    label: "주택",
    unit: "시가",
    collateral: true,
    defaultDebtType: "은행대출",
  },
  {
    id: "land",
    icon: "🌳",
    label: "토지",
    unit: "시가",
    collateral: true,
    defaultDebtType: "은행대출",
  },
  {
    id: "deposit",
    icon: "🔑",
    label: "전세보증금",
    unit: "보증금",
    collateral: true,
    defaultDebtType: "은행대출",
  },
  {
    id: "vehicle",
    icon: "🚗",
    label: "자동차",
    unit: "시가",
    collateral: true,
    defaultDebtType: "캐피탈",
  },
  {
    id: "financial",
    icon: "💰",
    label: "금융자산",
    unit: "평가액",
    collateral: false,
  },
];

export const COLLATERAL_ASSET_KINDS = ASSET_KINDS.filter((a) => a.collateral);

export const assetKindMeta = (id) => ASSET_KINDS.find((a) => a.id === id);

/* ── 채무 선택지 ───────────────────────────────────────────── */

export const DEBT_TYPE_OPTIONS = [
  "은행대출",
  "카드론",
  "캐피탈",
  "저축은행",
  "사채",
  "개인차용",
];

export const REPAY_METHOD_OPTIONS = ["원리금균등", "원금균등", "만기일시"];

/* ── 숫자 포맷 ─────────────────────────────────────────────── */

export const formatComma = (value) => {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
};

export const parseComma = (value) => String(value ?? "").replace(/[^\d]/g, "");

export const wonToMan = (won) => Math.round((Number(won) || 0) / 10000);
export const manToWon = (man) => String((parseInt(man) || 0) * 10000);
export const formatWon = (n) =>
  `${Math.round(Number(n) || 0).toLocaleString()}원`;
export const formatMan = (n) =>
  `${Math.round(Number(n) || 0).toLocaleString()}만원`;

/* ── 연체 기간 ─────────────────────────────────────────────── */

/** 구간 enum은 이전 데이터·대시보드 표시 호환을 위해 유지 (입력은 개월 수) */
export const OverduePeriod = {
  None: "none",
  Under3Months: "under_3_months",
  From3To6Months: "3_to_6_months",
  From6To12Months: "6_to_12_months",
  Over1Year: "over_1_year",
};

export const OVERDUE_PERIOD_OPTIONS = [
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

export const overduePeriodLabel = (value) =>
  OVERDUE_PERIOD_OPTIONS.find((o) => o.value === value)?.label ?? null;

export const parseOverdueMonths = (value) => {
  if (value == null || value === "" || value === "없음") return 0;
  if (isOverduePeriodEnum(value)) return OVERDUE_PERIOD_TO_MONTHS[value] ?? 0;
  const n = parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
};

export const monthsToOverduePeriod = (months) => {
  const n = Number(months) || 0;
  if (n <= 0) return OverduePeriod.None;
  if (n < 3) return OverduePeriod.Under3Months;
  if (n < 6) return OverduePeriod.From3To6Months;
  if (n < 12) return OverduePeriod.From6To12Months;
  return OverduePeriod.Over1Year;
};

export const getMaxOverdueMonths = (debts) =>
  String(
    (debts || []).reduce(
      (max, d) => Math.max(max, parseOverdueMonths(d.overduePeriod)),
      0,
    ),
  );

/* ── 상환 계산 ─────────────────────────────────────────────── */

const pad2 = (n) => String(n).padStart(2, "0");

export const formatISODate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const todayISO = () => formatISODate(new Date());

export const addMonthsISO = (isoDate, months) => {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + Number(months));
  return formatISODate(d);
};

/** 대출일~만기일 개월 수 (최소 1) */
export const monthsBetween = (startStr, endStr) => {
  if (!startStr || !endStr) return null;
  const start = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
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

/** 오늘~만기일 남은 개월. 만기일이 없거나 지나면 null */
export const remainingMonthsOf = (maturityDate) =>
  monthsBetween(todayISO(), maturityDate);

/**
 * 남은기간(개월) → 만기일.
 * 기존 만기일이 있으면 날짜(일)를 유지한 채 개월만 옮긴다.
 */
export const maturityFromRemainingMonths = (months, currentMaturity) => {
  const n = parseInt(String(months ?? "").replace(/[^\d]/g, ""), 10);
  if (!n || n < 1) return "";
  const today = todayISO();
  if (currentMaturity) {
    const current = monthsBetween(today, currentMaturity);
    if (current != null) return addMonthsISO(currentMaturity, n - current);
  }
  return addMonthsISO(today, n);
};

const manualWon = (value) => {
  if (value == null || value === "") return null;
  const n = parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? null : n;
};

const isManualOverride = (manual, calculated) => {
  const m = manualWon(manual);
  if (m == null) return false;
  if (calculated == null) return true;
  return m !== calculated;
};

/**
 * 상환 계산 (원)
 * - 원리금균등: 매월 납입액 고정
 * - 원금균등: 매월 원금 고정, 월불입은 평균액
 * - 만기일시: 기간 중 이자만, 원금은 만기 상환 (월불입=월이자)
 */
export const calcRepayment = (principalWon, annualRatePct, n, method) => {
  const P = Number(principalWon);
  const rate = Number(annualRatePct);
  if (!P || P <= 0 || !n || n < 1 || Number.isNaN(rate) || rate < 0) return null;
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

/**
 * 채무 행 1건의 상환 계산.
 * 금액 필드는 "현재 잔액" 기준으로 입력하므로,
 * 계산 기간은 오늘~만기일로 사용한다. (대출일은 참고용)
 */
export const calcDebtItem = (debt) => {
  if (!debt.maturityDate) return null;
  const n = remainingMonthsOf(debt.maturityDate);
  if (n == null) return null;
  return calcRepayment(
    debt.principal,
    debt.rate,
    n,
    debt.repayMethod || "원리금균등",
  );
};

/**
 * 계산값 + 직접 수정값.
 * monthlyManual / interestManual / repayManual 이 있으면 그 값을 쓰고,
 * 비어 있으면 공식 계산값을 쓴다.
 */
export const resolveDebtCalc = (debt) => {
  const calc = calcDebtItem(debt);
  const monthly = manualWon(debt.monthlyManual) ?? calc?.monthly ?? null;
  const totalInterest =
    manualWon(debt.interestManual) ?? calc?.totalInterest ?? null;
  const totalRepay = manualWon(debt.repayManual) ?? calc?.totalRepay ?? null;
  return {
    months: calc?.months ?? remainingMonthsOf(debt.maturityDate),
    monthly,
    totalInterest,
    totalRepay,
    calc,
    overridden: {
      monthly: isManualOverride(debt.monthlyManual, calc?.monthly),
      interest: isManualOverride(debt.interestManual, calc?.totalInterest),
      repay: isManualOverride(debt.repayManual, calc?.totalRepay),
    },
  };
};

/** 입력값이 계산값과 같으면 오버라이드를 지운다 */
export const manualPatchIfDifferent = (key, raw, calculated) => {
  const parsed = parseComma(raw);
  if (!parsed) return { [key]: "" };
  if (calculated != null && Number(parsed) === calculated) return { [key]: "" };
  return { [key]: parsed };
};

/* ── 채무 행 ───────────────────────────────────────────────── */

let debtIdSeq = 0;
export const nextDebtId = () => {
  debtIdSeq += 1;
  return `d${Date.now().toString(36)}${debtIdSeq}`;
};

export const emptyDebt = (overrides = {}) => ({
  id: nextDebtId(),
  debtType: "은행대출",
  secured: false,
  collateralAssetId: null,
  lender: "",
  loanDate: "",
  maturityDate: "",
  principal: "",
  rate: "",
  repayMethod: "원리금균등",
  overduePeriod: "0",
  monthlyManual: "",
  interestManual: "",
  repayManual: "",
  ...overrides,
});

export const isSecured = (debt) => !!debt.secured || !!debt.collateralAssetId;

export const sumPrincipalWon = (debts) =>
  (debts || []).reduce((sum, d) => sum + (parseInt(d.principal) || 0), 0);

export const linkedDebtsOf = (debts, assetId) =>
  (debts || []).filter((d) => d.collateralAssetId === assetId);

/** 자산 단계에서 연결한 담보 채무를 목록 맨 위로 (저장 순서는 건드리지 않음) */
export const sortDebtsForDisplay = (debts) => {
  const linked = (debts || []).filter((d) => d.collateralAssetId);
  const rest = (debts || []).filter((d) => !d.collateralAssetId);
  return [...linked, ...rest];
};

/** 행 배열 교체 시 최소 1행 유지 */
export const ensureRows = (rows) =>
  rows && rows.length > 0 ? rows : [emptyDebt()];

/* ── 집계 ──────────────────────────────────────────────────── */

/**
 * 행 배열 → 화면·리포트 공용 요약 (금액 단위: 만원)
 *
 * 대출일·만기일이 없어 이자를 계산할 수 없는 행은 총상환액을 원금으로 본다.
 * (0으로 두면 총 상환액이 원금보다 작아져서 면책액 계산이 뒤집힌다)
 */
export const buildDebtSummaryFromRows = (rows) => {
  const items = (rows || []).map((row, idx) => {
    const principalWon = parseInt(row.principalWon ?? row.principal) || 0;
    const resolved = resolveDebtCalc({ ...row, principal: principalWon });
    const amount = wonToMan(principalWon);
    return {
      id: row.id || `d${idx}`,
      label: row.lender
        ? `${row.lender}${row.debtType ? ` (${row.debtType})` : ""}`
        : row.debtType || "미입력",
      debtType: row.debtType || "",
      secured: isSecured(row),
      collateralAssetId: row.collateralAssetId || null,
      lender: row.lender || "",
      amount,
      principalWon,
      totalRepay:
        resolved.totalRepay != null ? wonToMan(resolved.totalRepay) : amount,
      totalInterest:
        resolved.totalInterest != null ? wonToMan(resolved.totalInterest) : 0,
      monthly: resolved.monthly != null ? wonToMan(resolved.monthly) : null,
      months: resolved.months ?? null,
      rate: row.rate ?? "",
      repayMethod: row.repayMethod || "원리금균등",
      overduePeriod: String(parseOverdueMonths(row.overduePeriod)),
      loanDate: row.loanDate || "",
      maturityDate: row.maturityDate || "",
      monthlyManual: row.monthlyManual || "",
      interestManual: row.interestManual || "",
      repayManual: row.repayManual || "",
    };
  });

  const sumBy = (list, key) => list.reduce((s, i) => s + (i[key] || 0), 0);
  const secured = items.filter((i) => i.secured);
  const unsecured = items.filter((i) => !i.secured);

  const totalDebt = sumBy(items, "amount");
  const totalDebtWithInterest = sumBy(items, "totalRepay");
  const overduePeriod = getMaxOverdueMonths(items);

  return {
    mode: "detail",
    totalDebt,
    securedDebt: sumBy(secured, "amount"),
    unsecuredDebt: sumBy(unsecured, "amount"),
    totalDebtWithInterest,
    totalInterest: Math.max(0, totalDebtWithInterest - totalDebt),
    monthlySum: sumBy(items, "monthly"),
    overduePeriod,
    maxOverdue: overduePeriod,
    items,
  };
};

/** 요약 items → 편집용 행 배열 (대시보드 채무 수정 모달) */
export const summaryItemsToRows = (items) => {
  if (!items?.length) return [emptyDebt()];
  return items.map((item) =>
    emptyDebt({
      id: item.id,
      debtType: item.debtType || "은행대출",
      secured: !!item.secured,
      collateralAssetId: item.collateralAssetId || null,
      lender: item.lender || "",
      loanDate: item.loanDate || "",
      maturityDate: item.maturityDate || "",
      principal: String(
        item.principalWon ??
          (item.amount != null ? Math.round(Number(item.amount) * 10000) : ""),
      ),
      rate: item.rate ?? "",
      repayMethod: item.repayMethod || "원리금균등",
      overduePeriod: String(parseOverdueMonths(item.overduePeriod)),
      monthlyManual: item.monthlyManual || "",
      interestManual: item.interestManual || "",
      repayManual: item.repayManual || "",
    }),
  );
};

/** 담보/무담보 합산 (원 단위) — 그리드 하단 요약용 */
export const debtTotalsOf = (rows) => {
  const calcs = (rows || []).map((debt) => ({
    debt,
    calc: resolveDebtCalc(debt),
  }));
  const pick = (predicate, field) =>
    calcs.reduce((sum, { debt, calc }) => {
      if (!predicate(debt)) return sum;
      if (field === "principal") return sum + (parseInt(debt.principal) || 0);
      return sum + (calc?.[field] || 0);
    }, 0);

  const securedRow = (d) => isSecured(d);
  const unsecuredRow = (d) => !isSecured(d);
  const anyRow = () => true;

  return {
    securedWon: pick(securedRow, "principal"),
    unsecuredWon: pick(unsecuredRow, "principal"),
    totalWon: pick(anyRow, "principal"),
    securedMonthlyWon: pick(securedRow, "monthly"),
    unsecuredMonthlyWon: pick(unsecuredRow, "monthly"),
    totalMonthlyWon: pick(anyRow, "monthly"),
    securedInterestWon: pick(securedRow, "totalInterest"),
    unsecuredInterestWon: pick(unsecuredRow, "totalInterest"),
    totalInterestWon: pick(anyRow, "totalInterest"),
  };
};
