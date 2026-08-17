import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SampleChecklistPage.css";
import DebtGrid, { DebtModeToggle, DebtTotals } from "./DebtGrid";
import CustomerInfoModal from "../../components/CustomerInfoModal";
import {
  ASSET_KINDS,
  buildDebtSummaryFromRows,
  emptyDebt,
  ensureRows,
  formatComma,
  linkedDebtsOf,
  parseComma,
  sortDebtsForDisplay,
  sumPrincipalWon,
  wonToMan,
} from "./debtModel";

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
    desc: "월 소득과 추정 생계비를 기준으로 상환여력을 계산합니다",
  },
  {
    id: "misc",
    label: "기타 사항",
    desc: "새출발기금 자격, 신청 이력, 소송 여부를 확인합니다",
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

/** 만원 단위 직접입력 + 퀵버튼 */
const AmountQuickInput = ({ value, onChange, presets, placeholder = "0" }) => {
  const current = String(value ?? "").replace(/[^\d]/g, "");
  return (
    <div className="scl-amount-quick">
      <div className="scl-amount-quick-input-wrap">
        <input
          className="scl-input scl-amount-quick-input"
          type="text"
          inputMode="numeric"
          value={formatComma(current)}
          onChange={(e) => onChange(parseComma(e.target.value))}
          placeholder={placeholder}
        />
        <span className="scl-amount-quick-unit">만원</span>
      </div>
      <div className="scl-amount-quick-presets">
        {presets.map((n) => {
          const selected = current !== "" && Number(current) === n;
          return (
            <button
              key={n}
              type="button"
              className={`scl-amount-quick-btn ${selected ? "on" : ""}`}
              onClick={() => onChange(String(n))}
            >
              {n.toLocaleString("ko-KR")}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const INCOME_PRESETS = [100, 150, 200, 250, 300, 400, 500];

/** 부양가족 → 가구원 수 (본인 포함) */
const householdSizeFromDependents = (dependents) => {
  if (dependents === "없음" || !dependents) return 1;
  if (dependents === "1명") return 2;
  if (dependents === "2명") return 3;
  if (dependents === "3명") return 4;
  if (dependents === "4명 이상") return 5;
  return 1;
};

/** 추정 생계비 (만원/월) — 절차 공통 참고용 간이 기준 */
const ESTIMATED_LIVING_COST_BY_HOUSEHOLD = {
  1: 120,
  2: 200,
  3: 260,
  4: 320,
  5: 370,
  6: 420,
};

const estimatedLivingCostFor = (dependents) => {
  const n = householdSizeFromDependents(dependents);
  return ESTIMATED_LIVING_COST_BY_HOUSEHOLD[Math.min(n, 6)] || 120;
};

const SAMPLE_DEBTS = [
  {
    id: "d1",
    debtType: "은행대출",
    secured: true,
    collateralAssetId: "home",
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
    secured: false,
    collateralAssetId: null,
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
    secured: false,
    collateralAssetId: null,
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
    secured: false,
    collateralAssetId: null,
    lender: "개인",
    loanDate: "2024-02-01",
    maturityDate: "2026-02-01",
    principal: "30000000",
    rate: "24",
    repayMethod: "만기일시",
    overduePeriod: "5",
  },
];

/** 자산 종류별 금액 필드 (담보 참조 키는 자산 종류 id와 같다) */
const ASSET_VALUE_FIELD = {
  home: "homeValue",
  land: "landValue",
  deposit: "depositValue",
  vehicle: "vehicleValue",
  financial: "financialValue",
};

const assetValueMan = (form, kindId) =>
  parseInt(form[ASSET_VALUE_FIELD[kindId]]) || 0;

/**
 * 자산 1건 블록: 시가 입력 + 그 자산에 걸린 담보 대출 + 순자산.
 *
 * 담보 대출은 채무 현황과 같은 DebtGrid로 입력받고 form.debts에 바로 쓴다.
 * 여기 보이는 행은 form.debts를 collateralAssetId로 필터링한 결과다.
 */
const AssetBlock = ({
  kind,
  valueMan,
  onValueChange,
  linked,
  debtMode,
  onDebtModeChange,
  onUpdateDebt,
  onAddDebt,
  onRemoveDebt,
  onClearCollateral,
}) => {
  const balanceMan = wonToMan(sumPrincipalWon(linked));
  const equityMan = valueMan - balanceMan;
  const over = valueMan > 0 && balanceMan > valueMan;
  const hasCollateral = linked.length > 0;

  return (
    <div className="scl-asset-block">
      <div className="scl-asset-block-head">
        <span className="scl-asset-block-title">
          {kind.icon} {kind.label}
        </span>
        <div className="scl-asset-block-value">
          <input
            className="scl-input scl-asset-value-input"
            type="text"
            inputMode="numeric"
            value={formatComma(valueMan)}
            onChange={(e) => onValueChange(parseComma(e.target.value))}
            placeholder="0"
            aria-label={`${kind.label} ${kind.unit} (만원)`}
          />
          <span className="scl-asset-value-unit">만원</span>
        </div>
      </div>

      {kind.collateral && (
        <div className="scl-asset-collateral">
          <div className="scl-asset-collateral-head">
            <span className="scl-asset-collateral-title">담보 대출</span>
            <div className="scl-asset-collateral-actions">
              {hasCollateral && (
                <DebtModeToggle mode={debtMode} onChange={onDebtModeChange} />
              )}
              <div
                className={`scl-switch ${hasCollateral ? "on" : ""}`}
                onClick={() =>
                  hasCollateral ? onClearCollateral() : onAddDebt()
                }
                role="switch"
                aria-checked={hasCollateral}
                aria-label="담보 대출"
              >
                <div className="scl-switch-thumb" />
              </div>
            </div>
          </div>
          {hasCollateral && (
            <DebtGrid
              rows={linked}
              mode={debtMode}
              showCollateral={false}
              minRows={0}
              onUpdate={onUpdateDebt}
              onAdd={onAddDebt}
              onRemove={onRemoveDebt}
              addLabel="+ 담보 대출 추가"
            />
          )}
        </div>
      )}

      {hasCollateral && (
        <div className="scl-collateral-equity">
          <span>
            시가 {valueMan.toLocaleString()} − 담보 {balanceMan.toLocaleString()}
          </span>
          <strong className={over ? "neg" : ""}>
            순자산 {Math.max(0, equityMan).toLocaleString()}만원
          </strong>
        </div>
      )}
    </div>
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
  // 보유 자산: 선택된 종류만 블록으로 표시. 담보 참조 키(collateralAssetId)와 id를 공유
  assetKinds: ["home", "vehicle", "financial"],
  homeValue: "35000",
  landValue: "",
  depositValue: "",
  vehicleValue: "500",
  financialValue: "1000",
  // 채무는 간편/상세 모두 debts[] 한 곳에만 저장하고, 모드는 보이는 컬럼만 결정한다
  debtInputMode: "simple",
  debts: SAMPLE_DEBTS,
  debtCause: ["사업실패"],
  monthlyIncome: "250",
  housingType: "월세",
  additionalLivingCost: "50",
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

/** 이 진단에 연결된 기존 고객 레코드 (없으면 null) */
const LINKED_CUSTOMER_DATA = {
  id: 1,
  name: "김민수",
  phone: "010-3842-5917",
  applicationNumber: "APP-001",
  consultations: [
    {
      id: 3,
      author: "박지훈",
      category: "재상담",
      content: "소득 증빙 서류 추가 제출 예정. 사채 3천만원은 금융기관 대출이 아닌 점 참고 요망.",
      timestamp: "2026-06-28 15:42:00",
    },
    {
      id: 2,
      author: "박지훈",
      category: "결제유력",
      content: "고객 이번 주 내 계약 의사 있음. 개인회생 방향으로 진행 검토 중.",
      timestamp: "2026-06-27 09:10:00",
    },
    {
      id: 1,
      author: "박지훈",
      category: "무료방안내",
      content: "무료 상담 안내 완료. 채무 총액 3.1억, 소득 220만원 확인.",
      timestamp: "2026-06-26 14:00:00",
    },
  ],
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
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const set = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));
  const setInput = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  // 보유 자산 (선택된 종류만) + 자산별 담보 채무 연결
  const heldAssets = ASSET_KINDS.filter((k) =>
    (form.assetKinds || []).includes(k.id),
  );
  const assetRows = heldAssets.map((kind) => {
    const linked = kind.collateral ? linkedDebtsOf(form.debts, kind.id) : [];
    const valueMan = assetValueMan(form, kind.id);
    const balanceMan = wonToMan(sumPrincipalWon(linked));
    return { kind, linked, valueMan, balanceMan, equityMan: valueMan - balanceMan };
  });

  const collateralDebtMan = wonToMan(
    sumPrincipalWon((form.debts || []).filter((d) => d.collateralAssetId)),
  );
  const assetMarketValueMan = assetRows.reduce((s, a) => s + a.valueMan, 0);
  // 청산가치 관점: 담보가 시가를 넘어도 초과분이 다른 자산을 깎지 않으므로 자산별로 0 하한
  const netAssetMan = assetRows.reduce(
    (s, a) => s + Math.max(0, a.equityMan),
    0,
  );
  const debtSummary = buildDebtSummaryFromRows(form.debts);
  const totalDebt = debtSummary.totalDebt;
  const displayDebts = sortDebtsForDisplay(form.debts);

  const updateDebt = (id, patch) =>
    setForm((p) => ({
      ...p,
      debts: p.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));

  const addDebt = (overrides) =>
    setForm((p) => ({ ...p, debts: [...p.debts, emptyDebt(overrides)] }));

  const removeDebt = (id) =>
    setForm((p) => ({
      ...p,
      debts: ensureRows(p.debts.filter((d) => d.id !== id)),
    }));

  const clearAssetCollateral = (assetId) => {
    const linked = linkedDebtsOf(form.debts, assetId);
    const hasInput = linked.some(
      (d) => d.lender || (parseInt(d.principal) || 0) > 0,
    );
    if (hasInput && !window.confirm("이 자산의 담보 대출을 삭제할까요?")) return;
    setForm((p) => ({
      ...p,
      debts: ensureRows(
        p.debts.filter((d) => d.collateralAssetId !== assetId),
      ),
    }));
  };

  const setDebtMode = (mode) => setForm((p) => ({ ...p, debtInputMode: mode }));

  /**
   * 보유 자산 선택 변경.
   * 해제한 자산에 걸려 있던 담보 채무는 연결만 끊고 목록에는 남긴다.
   * (입력한 채무가 소리 없이 사라지면 총 채무액이 조용히 줄어든다)
   */
  const setAssetKinds = (kinds) =>
    setForm((p) => {
      const dropped = (p.assetKinds || []).filter((k) => !kinds.includes(k));
      const debts = dropped.length
        ? p.debts.map((d) =>
            dropped.includes(d.collateralAssetId)
              ? { ...d, collateralAssetId: null, secured: true }
              : d,
          )
        : p.debts;
      return { ...p, assetKinds: kinds, debts };
    });

  const setAssetValue = (kindId) => (val) =>
    setForm((p) => ({ ...p, [ASSET_VALUE_FIELD[kindId]]: val }));

  const approxIncome = parseInt(form.monthlyIncome) || 0;
  const householdSize = householdSizeFromDependents(form.dependents);
  const estimatedLivingCost = estimatedLivingCostFor(form.dependents);
  const additionalLivingCost = parseInt(form.additionalLivingCost) || 0;
  const repaymentCapacity =
    approxIncome - estimatedLivingCost - additionalLivingCost;

  const completionRate = Math.round(
    (completedSections.size / SECTIONS.length) * 100,
  );

  const goToResult = () => {
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
    <>
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
              <div className="scl-client-info">
                <div className="scl-client-name-row">
                  <span className="scl-client-name">
                    {form.name || "고객명 미입력"}
                  </span>
                  {LINKED_CUSTOMER_DATA && (
                    <button
                      type="button"
                      className="scl-client-link-btn"
                      onClick={() => setShowCustomerModal(true)}
                      title="고객 등록 정보 보기"
                      aria-label="연결된 고객 정보 보기"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M8.5 11.5a4.5 4.5 0 006.364 0l2-2a4.5 4.5 0 00-6.364-6.364L9 4.636"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11.5 8.5a4.5 4.5 0 00-6.364 0l-2 2a4.5 4.5 0 006.364 6.364L11 15.364"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
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
                <span className="scl-kpi-label">월 소득</span>
                <span className="scl-kpi-val">
                  {approxIncome}
                  <em>만원</em>
                </span>
              </div>
              <div className="scl-kpi">
                <span className="scl-kpi-label">추정 상환여력</span>
                <span
                  className={`scl-kpi-val ${repaymentCapacity < 0 ? "neg" : ""}`}
                >
                  {repaymentCapacity >= 0 ? "+" : ""}
                  {repaymentCapacity}
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
                  <Field label="보유 자산">
                    <Chips
                      options={ASSET_KINDS.map((k) => ({
                        value: k.id,
                        label: `${k.icon} ${k.label}`,
                      }))}
                      value={form.assetKinds}
                      onChange={setAssetKinds}
                      multi
                    />
                  </Field>

                  {assetRows.map(({ kind, linked, valueMan }) => (
                    <AssetBlock
                      key={kind.id}
                      kind={kind}
                      valueMan={valueMan}
                      onValueChange={setAssetValue(kind.id)}
                      linked={linked}
                      debtMode={form.debtInputMode}
                      onDebtModeChange={setDebtMode}
                      onUpdateDebt={updateDebt}
                      onAddDebt={() =>
                        addDebt({
                          debtType: kind.defaultDebtType,
                          secured: true,
                          collateralAssetId: kind.id,
                        })
                      }
                      onRemoveDebt={removeDebt}
                      onClearCollateral={() => clearAssetCollateral(kind.id)}
                    />
                  ))}

                  {assetRows.length > 0 && (
                    <div className="scl-asset-summary">
                      <span>
                        시가 {assetMarketValueMan.toLocaleString()} − 담보{" "}
                        {collateralDebtMan.toLocaleString()}
                      </span>
                      <strong>{netAssetMan.toLocaleString()}만원</strong>
                    </div>
                  )}
                </>
              )}

              {activeSection === "debts" && (
                <>
                  <div className="scl-debt-panel">
                    <div className="scl-debt-panel-head">
                      <span className="scl-debt-panel-title">채무 내역</span>
                      <DebtModeToggle
                        mode={form.debtInputMode}
                        onChange={setDebtMode}
                      />
                    </div>

                    <div className="scl-debt-panel-body">
                      <DebtGrid
                        rows={displayDebts}
                        mode={form.debtInputMode}
                        onUpdate={updateDebt}
                        onAdd={() => addDebt()}
                        onRemove={removeDebt}
                      />
                      <DebtTotals
                        rows={form.debts}
                        mode={form.debtInputMode}
                      />
                    </div>
                  </div>

                  <Field label="채무 발생 원인">
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
                    <AmountQuickInput
                      value={form.monthlyIncome}
                      onChange={set("monthlyIncome")}
                      presets={INCOME_PRESETS}
                    />
                  </Field>
                  <Field label="주거 형태">
                    <Chips
                      options={["자가", "전세", "월세", "가족과 거주"]}
                      value={form.housingType}
                      onChange={set("housingType")}
                    />
                  </Field>

                  <div className="scl-income-summary">
                    <div className="scl-income-row">
                      <span>월 소득</span>
                      <span>+{approxIncome.toLocaleString()}만원</span>
                    </div>
                    <div className="scl-income-row">
                      <div className="scl-income-row-label">
                        <span>법정 생계비</span>
                        <em>가구원 {householdSize}인 기준</em>
                      </div>
                      <span>−{estimatedLivingCost.toLocaleString()}만원</span>
                    </div>
                    <div className="scl-income-row scl-income-row-extra">
                      <div className="scl-income-row-label">
                        <span>추가 필수지출</span>
                        <em>
                          주거비, 의료비 등 추가로 인정될 수 있는 필수
                          지출입니다.
                        </em>
                      </div>
                      <div className="scl-income-extra">
                        <input
                          className="scl-input scl-income-extra-input"
                          type="text"
                          inputMode="numeric"
                          value={formatComma(form.additionalLivingCost)}
                          onChange={(e) =>
                            set("additionalLivingCost")(
                              parseComma(e.target.value),
                            )
                          }
                          placeholder="0"
                        />
                        <span className="scl-income-extra-unit">만원</span>
                      </div>
                    </div>
                    <div className="scl-income-row total">
                      <span>월 가용 소득</span>
                      <strong className={repaymentCapacity < 30 ? "warn" : ""}>
                        {repaymentCapacity >= 0 ? "+" : ""}
                        {repaymentCapacity.toLocaleString()}만원
                      </strong>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "misc" && (
                <>
                  <div className="scl-nsf-panel">
                    <div className="scl-nsf-panel-head">
                      <div className="scl-nsf-panel-title-wrap">
                        <span className="scl-nsf-badge">새출발기금</span>
                      </div>
                      <span
                        className={`scl-nsf-status ${form.businessPeriodEligible ? "eligible" : "ineligible"}`}
                      ></span>
                    </div>

                    <div className="scl-nsf-panel-body">
                      <div className="scl-nsf-gate">
                        <div className="scl-nsf-step">
                          <div className="scl-nsf-step-body">
                            <Field
                              label="’20.4월 ~ ’25.6월 중 개인사업자·소상공인으로 사업 영위한 적 있음"
                              hint="현재 고용 형태와 무관 · 휴업·폐업 포함"
                            >
                              <Chips
                                options={[
                                  { value: "yes", label: "예" },
                                  { value: "no", label: "아니오" },
                                ]}
                                value={
                                  form.businessPeriodEligible ? "yes" : "no"
                                }
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
                          </div>
                        </div>
                      </div>

                      {form.businessPeriodEligible ? (
                        <div className="scl-nsf-followup">
                          <div className="scl-nsf-step">
                            <div className="scl-nsf-step-body">
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
                            </div>
                          </div>
                          <div className="scl-nsf-step">
                            <div className="scl-nsf-step-body">
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
                            </div>
                          </div>
                          <div className="scl-nsf-step">
                            <div className="scl-nsf-step-body">
                              <p className="scl-nsf-inline-label">
                                결격·이력 확인
                              </p>
                              <div className="scl-check-list">
                                {[
                                  {
                                    field: "excludedIndustry",
                                    label:
                                      "제외 업종 해당 (부동산 임대업, 법무·회계·세무 등)",
                                  },
                                  {
                                    field: "previousNewStartFund",
                                    label:
                                      "이전 신청 이력 있음 (원칙적으로 1회만 신청 가능)",
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
                            </div>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>

                  <p className="scl-sub-heading">기타 확인 사항</p>
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
              <div className="scl-nav-center">
                <button
                  type="button"
                  className="scl-btn-prev"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  aria-label="이전"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 3L5 8l5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="scl-btn-next"
                  onClick={handleNext}
                  disabled={isLast}
                  aria-label="다음"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                className="scl-nav-analyze"
                onClick={goToResult}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
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
        </main>
      </div>
    </div>
    {showCustomerModal && (
      <CustomerInfoModal
        isOpen={showCustomerModal}
        customerData={LINKED_CUSTOMER_DATA}
        onClose={() => setShowCustomerModal(false)}
      />
    )}
    </>
  );
};

export default SampleChecklistPage;
