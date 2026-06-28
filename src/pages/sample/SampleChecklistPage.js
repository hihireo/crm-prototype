import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SampleChecklistPage.css";

const SECTIONS = [
  { id: "basic",  label: "기본 정보",   desc: "고객의 인적사항을 확인합니다" },
  { id: "assets", label: "자산 현황",   desc: "보유 자산의 종류와 규모를 파악합니다" },
  { id: "debts",  label: "채무 현황",   desc: "채무처별 규모와 연체 현황을 확인합니다" },
  { id: "income", label: "소득 / 지출", desc: "월 소득과 고정 지출을 계산합니다" },
  { id: "misc",   label: "기타 사항",   desc: "신청 이력, 소송 여부 등을 확인합니다" },
];

const Chips = ({ options, value, onChange, multi = false }) => (
  <div className="scl-chips">
    {options.map((opt) => {
      const v = typeof opt === "string" ? opt : opt.value;
      const label = typeof opt === "string" ? opt : opt.label;
      const selected = multi ? (value || []).includes(v) : value === v;
      return (
        <button key={v} type="button"
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
          }}>
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

const initialForm = {
  name: "김민수", ageGroup: "40대", gender: "남", region: "서울",
  employmentType: "자영업", dependents: "2명", hasSpouseIncome: false,
  realEstateType: "없음", realEstateDetail: "",
  financialAssetRange: "500만~2천만", vehicleRange: "500만~2천만",
  debtTypes: ["은행대출", "카드론", "캐피탈"],
  bankLoan: "15000", creditCardDebt: "8000", capitalLoan: "5000", privateLoan: "0",
  overduePeriod: "3~6개월", debtCause: ["사업실패"],
  incomeRange: "200~300만", housingType: "월세",
  monthlyRent: "70", monthlyFood: "40", monthlyEducation: "30",
  monthlyTransport: "15", monthlyEtc: "20",
  previousFiling: false, previousFilingYear: "",
  hasSurety: false, suretyClear: "",
  hasLawsuit: false, lawsuitDetails: "", memo: "",
};

const INCOME_RANGES = {
  "100만 이하": 80, "100~200만": 150, "200~300만": 250,
  "300~400만": 350, "400만 이상": 450,
};

const SampleChecklistPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromResult = location.state?.fromResult === true;

  const [activeSection, setActiveSection] = useState("basic");
  const [form, setForm] = useState(initialForm);
  const [completedSections, setCompletedSections] = useState(
    new Set(["basic", "assets", "debts", "income"])
  );

  const set = (field) => (val) => setForm((p) => ({ ...p, [field]: val }));
  const setInput = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const totalDebt =
    (parseInt(form.bankLoan) || 0) + (parseInt(form.creditCardDebt) || 0) +
    (parseInt(form.capitalLoan) || 0) + (parseInt(form.privateLoan) || 0);

  const approxIncome = INCOME_RANGES[form.incomeRange] || 0;
  const approxExpenses =
    (parseInt(form.monthlyRent) || 0) + (parseInt(form.monthlyFood) || 0) +
    (parseInt(form.monthlyEducation) || 0) + (parseInt(form.monthlyTransport) || 0) +
    (parseInt(form.monthlyEtc) || 0);
  const disposable = approxIncome - approxExpenses;

  const completionRate = Math.round((completedSections.size / SECTIONS.length) * 100);

  const goToResult = () => navigate("/checklist/result");

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

  return (
    <div className="scl-page">
      {/* 진행률 바 — 페이지 상단 */}
      <div className="scl-progress-track">
        <div className="scl-progress-fill" style={{ width: `${completionRate}%` }} />
      </div>

      <div className="scl-layout">
        {/* 사이드바 */}
        <aside className="scl-sidebar">
          {/* 스크롤 영역 */}
          <div className="scl-sidebar-body">
            <div className="scl-client-row">
              <div className="scl-avatar">{form.name ? form.name.charAt(0) : "?"}</div>
              <div>
                <div className="scl-client-name">{form.name || "고객명 미입력"}</div>
                <div className="scl-client-sub">{form.ageGroup} · {form.gender} · {form.employmentType}</div>
              </div>
            </div>

            <div className="scl-kpi-grid">
              <div className="scl-kpi">
                <span className="scl-kpi-label">총 채무</span>
                <span className="scl-kpi-val">{totalDebt.toLocaleString()}<em>만원</em></span>
              </div>
              <div className="scl-kpi">
                <span className="scl-kpi-label">월 소득(추정)</span>
                <span className="scl-kpi-val">{approxIncome}<em>만원</em></span>
              </div>
              <div className="scl-kpi">
                <span className="scl-kpi-label">월 가용소득</span>
                <span className={`scl-kpi-val ${disposable < 0 ? "neg" : ""}`}>
                  {disposable >= 0 ? "+" : ""}{disposable}<em>만원</em>
                </span>
              </div>
            </div>

            <nav className="scl-steps">
              {SECTIONS.map((sec, i) => {
                const done = completedSections.has(sec.id);
                const active = activeSection === sec.id;
                return (
                  <button key={sec.id}
                    className={`scl-step-item ${active ? "active" : ""} ${done ? "done" : ""}`}
                    onClick={() => setActiveSection(sec.id)}>
                    <span className="scl-step-dot">
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : <span>{i + 1}</span>}
                    </span>
                    <span className="scl-step-label">{sec.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 하단 고정 액션 */}
          <div className="scl-sidebar-actions">
            <button className="scl-analyze-btn" onClick={goToResult}>
              분석하기
            </button>
            {fromResult && (
              <button className="scl-back-result-btn" onClick={() => navigate(-1)}>
                ← 분석 결과로 돌아가기
              </button>
            )}
          </div>
        </aside>

        {/* 메인 폼 */}
        <main className="scl-main">
          <div className="scl-form-wrap">
            <div className="scl-section-head">
              <h2 className="scl-section-title">{currentSection.label}</h2>
              <p className="scl-section-desc">{currentSection.desc}</p>
            </div>

            <div className="scl-form">

              {activeSection === "basic" && (<>
                <div className="scl-row-2">
                  <Field label="고객명">
                    <input className="scl-input" value={form.name} onChange={setInput("name")} placeholder="홍길동" />
                  </Field>
                  <Field label="성별">
                    <Chips options={["남", "여"]} value={form.gender} onChange={set("gender")} />
                  </Field>
                </div>
                <Field label="연령대">
                  <Chips options={["20대", "30대", "40대", "50대", "60대 이상"]} value={form.ageGroup} onChange={set("ageGroup")} />
                </Field>
                <Field label="거주 지역">
                  <Chips options={["서울", "경기·인천", "부산·경남", "대구·경북", "충청·강원", "호남·제주"]} value={form.region} onChange={set("region")} />
                </Field>
                <Field label="고용 형태">
                  <Chips options={["정규직", "계약직", "자영업", "프리랜서", "무직", "기타"]} value={form.employmentType} onChange={set("employmentType")} />
                </Field>
                <Field label="부양가족">
                  <Chips options={["없음", "1명", "2명", "3명", "4명 이상"]} value={form.dependents} onChange={set("dependents")} />
                </Field>
                <label className="scl-switch-row">
                  <span>배우자 소득 있음</span>
                  <div className={`scl-switch ${form.hasSpouseIncome ? "on" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, hasSpouseIncome: !p.hasSpouseIncome }))}>
                    <div className="scl-switch-thumb" />
                  </div>
                </label>
              </>)}

              {activeSection === "assets" && (<>
                <Field label="부동산 보유 여부">
                  <Chips options={["없음", "자가 소유", "전세 보증금", "임대 수익"]} value={form.realEstateType} onChange={set("realEstateType")} />
                </Field>
                {form.realEstateType !== "없음" && (
                  <Field label="부동산 시가 (만원)">
                    <input className="scl-input" type="number" value={form.realEstateDetail} onChange={setInput("realEstateDetail")} placeholder="시가 직접 입력" />
                  </Field>
                )}
                <Field label="금융 자산 (예·적금 + 주식 등)">
                  <Chips options={["없음", "500만 미만", "500만~2천만", "2천만~5천만", "5천만 이상"]} value={form.financialAssetRange} onChange={set("financialAssetRange")} />
                </Field>
                <Field label="차량 보유">
                  <Chips options={["없음", "500만 미만", "500만~2천만", "2천만 이상"]} value={form.vehicleRange} onChange={set("vehicleRange")} />
                </Field>
              </>)}

              {activeSection === "debts" && (<>
                <Field label="채무 종류 (중복 선택 가능)">
                  <Chips options={["은행대출", "카드론", "캐피탈", "저축은행", "사채", "개인차용"]} value={form.debtTypes} onChange={set("debtTypes")} multi />
                </Field>
                <p className="scl-note">※ 해당 채무의 현재 잔액을 만원 단위로 입력하세요</p>
                <div className="scl-row-2">
                  {form.debtTypes.includes("은행대출") && (
                    <Field label="은행 대출"><input className="scl-input" type="number" value={form.bankLoan} onChange={setInput("bankLoan")} /></Field>
                  )}
                  {form.debtTypes.includes("카드론") && (
                    <Field label="카드론"><input className="scl-input" type="number" value={form.creditCardDebt} onChange={setInput("creditCardDebt")} /></Field>
                  )}
                  {(form.debtTypes.includes("캐피탈") || form.debtTypes.includes("저축은행")) && (
                    <Field label="캐피탈 / 저축은행"><input className="scl-input" type="number" value={form.capitalLoan} onChange={setInput("capitalLoan")} /></Field>
                  )}
                  {(form.debtTypes.includes("사채") || form.debtTypes.includes("개인차용")) && (
                    <Field label="사채 / 개인차용"><input className="scl-input" type="number" value={form.privateLoan} onChange={setInput("privateLoan")} /></Field>
                  )}
                </div>
                <div className="scl-sum-line">
                  <span>총 채무 합계</span>
                  <strong>{totalDebt.toLocaleString()}만원</strong>
                </div>
                <Field label="연체 기간">
                  <Chips options={["없음", "3개월 미만", "3~6개월", "6~12개월", "1년 이상"]} value={form.overduePeriod} onChange={set("overduePeriod")} />
                </Field>
                <Field label="채무 발생 원인 (중복 선택 가능)">
                  <Chips options={["사업실패", "생활비 부족", "의료비", "투자 손실", "보증 피해", "기타"]} value={form.debtCause} onChange={set("debtCause")} multi />
                </Field>
              </>)}

              {activeSection === "income" && (<>
                <Field label="월 소득 (세후 실수령 기준)">
                  <Chips options={["100만 이하", "100~200만", "200~300만", "300~400만", "400만 이상"]} value={form.incomeRange} onChange={set("incomeRange")} />
                </Field>
                <Field label="주거 형태">
                  <Chips options={["자가", "전세", "월세", "가족과 거주"]} value={form.housingType} onChange={set("housingType")} />
                </Field>
                <p className="scl-sub-heading">월 고정 지출 (만원)</p>
                <p className="scl-note">※ 해당 없으면 0으로 입력</p>
                <div className="scl-row-3">
                  <Field label="주거비"><input className="scl-input" type="number" value={form.monthlyRent} onChange={setInput("monthlyRent")} /></Field>
                  <Field label="식비"><input className="scl-input" type="number" value={form.monthlyFood} onChange={setInput("monthlyFood")} /></Field>
                  <Field label="교육비"><input className="scl-input" type="number" value={form.monthlyEducation} onChange={setInput("monthlyEducation")} /></Field>
                </div>
                <div className="scl-row-2">
                  <Field label="교통비"><input className="scl-input" type="number" value={form.monthlyTransport} onChange={setInput("monthlyTransport")} /></Field>
                  <Field label="기타 고정지출"><input className="scl-input" type="number" value={form.monthlyEtc} onChange={setInput("monthlyEtc")} /></Field>
                </div>
                <div className="scl-income-summary">
                  <div className="scl-income-row"><span>월 소득 (추정)</span><span>+{approxIncome}만원</span></div>
                  <div className="scl-income-row"><span>총 지출</span><span>−{approxExpenses}만원</span></div>
                  <div className="scl-income-row total">
                    <span>월 가용 소득</span>
                    <strong className={disposable < 30 ? "warn" : ""}>{disposable >= 0 ? "+" : ""}{disposable}만원</strong>
                  </div>
                </div>
              </>)}

              {activeSection === "misc" && (<>
                <div className="scl-check-list">
                  {[
                    { field: "previousFiling", label: "이전 개인회생 / 파산 신청 이력 있음", subField: "previousFilingYear", subPlaceholder: "신청 연도 및 결과" },
                    { field: "hasSurety",      label: "보증인 / 연대보증 관계 있음",         subField: "suretyClear",       subPlaceholder: "관계 내용 입력" },
                    { field: "hasLawsuit",     label: "현재 진행 중인 소송 / 압류 있음",       subField: "lawsuitDetails",    subPlaceholder: "소송·압류 상세 내용" },
                  ].map(({ field, label, subField, subPlaceholder }) => (
                    <div key={field} className={`scl-check-card ${form[field] ? "expanded" : ""}`}>
                      <label className="scl-check-row">
                        <span>{label}</span>
                        <div className={`scl-switch ${form[field] ? "on" : ""}`}
                          onClick={() => setForm((p) => ({ ...p, [field]: !p[field] }))}>
                          <div className="scl-switch-thumb" />
                        </div>
                      </label>
                      {form[field] && (
                        <input className="scl-input scl-sub-input" value={form[subField]}
                          onChange={setInput(subField)} placeholder={subPlaceholder} />
                      )}
                    </div>
                  ))}
                </div>
                <Field label="상담사 메모">
                  <textarea className="scl-input scl-textarea" value={form.memo}
                    onChange={setInput("memo")} rows={4}
                    placeholder="상담 중 특이사항, 고객 태도, 추가 메모 등" />
                </Field>
              </>)}
            </div>

            {/* 하단 버튼 */}
            <div className="scl-nav-btns">
              {currentIdx > 0 && (
                <button className="scl-btn-prev" onClick={handlePrev}>이전</button>
              )}
              {isLast ? (
                <button className="scl-btn-next" onClick={goToResult}>
                  완료
                </button>
              ) : (
                <button className="scl-btn-next" onClick={handleNext}>다음</button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SampleChecklistPage;
