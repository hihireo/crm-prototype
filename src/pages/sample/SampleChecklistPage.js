import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SampleChecklistPage.css";

const SECTIONS = [
  { id: "basic",  label: "기본 정보",  desc: "고객의 인적사항을 확인합니다" },
  { id: "assets", label: "자산 현황",  desc: "보유 자산의 종류와 시가를 입력합니다" },
  { id: "debts",  label: "채무 현황",  desc: "채무처별 잔액과 연체 현황을 파악합니다" },
  { id: "income", label: "소득 / 지출", desc: "월 소득과 고정 지출을 계산합니다" },
  { id: "misc",   label: "기타 사항",  desc: "신청 이력, 소송 여부 등을 확인합니다" },
];

const initialForm = {
  name: "김민수", age: "42", gender: "남", address: "서울시 강서구",
  job: "자영업", employmentType: "자영업", dependents: "2", hasSpouseIncome: false,
  realEstate: "0", realEstateDesc: "", savings: "500", stocks: "0",
  vehicle: "1000", otherAssets: "0",
  bankLoan: "15000", creditCardDebt: "8000", capitalLoan: "5000", privateLoan: "3000",
  overduePeriod: "6", overdueDetails: "카드론 연체",
  monthlyIncome: "220", spouseIncome: "0", monthlyRent: "70", monthlyFood: "40",
  monthlyEducation: "30", monthlyTransport: "15", monthlyEtc: "20",
  previousFiling: false, previousFilingYear: "", hasSurety: false, suretyClear: "",
  hasLawsuit: false, lawsuitDetails: "", memo: "",
};

const Field = ({ label, children }) => (
  <div className="scl-field">
    <label className="scl-label">{label}</label>
    {children}
  </div>
);

const SampleChecklistPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("basic");
  const [form, setForm] = useState(initialForm);
  const [completedSections, setCompletedSections] = useState(
    new Set(["basic", "assets", "debts", "income"])
  );

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const totalAssets =
    (parseInt(form.realEstate) || 0) + (parseInt(form.savings) || 0) +
    (parseInt(form.stocks) || 0) + (parseInt(form.vehicle) || 0) +
    (parseInt(form.otherAssets) || 0);

  const totalDebts =
    (parseInt(form.bankLoan) || 0) + (parseInt(form.creditCardDebt) || 0) +
    (parseInt(form.capitalLoan) || 0) + (parseInt(form.privateLoan) || 0);

  const monthlyExpenses =
    (parseInt(form.monthlyRent) || 0) + (parseInt(form.monthlyFood) || 0) +
    (parseInt(form.monthlyEducation) || 0) + (parseInt(form.monthlyTransport) || 0) +
    (parseInt(form.monthlyEtc) || 0);

  const disposableIncome =
    (parseInt(form.monthlyIncome) || 0) + (parseInt(form.spouseIncome) || 0) - monthlyExpenses;

  const completionRate = Math.round((completedSections.size / SECTIONS.length) * 100);

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
      {/* 상단 헤더 */}
      <header className="scl-header">
        <button className="scl-back" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="scl-header-center">
          <span className="scl-header-title">개인회생 상담 체크리스트</span>
        </div>
        <button className="scl-header-cta" onClick={() => navigate("/sample/dashboard")}>
          AI 분석 요청
        </button>
      </header>

      {/* 진행률 바 */}
      <div className="scl-progress-track">
        <div className="scl-progress-fill" style={{ width: `${completionRate}%` }} />
      </div>

      <div className="scl-layout">
        {/* 왼쪽 사이드 */}
        <aside className="scl-sidebar">
          <div className="scl-client-row">
            <div className="scl-avatar">{form.name ? form.name.charAt(0) : "?"}</div>
            <div>
              <div className="scl-client-name">{form.name || "고객명 미입력"}</div>
              <div className="scl-client-sub">{form.age}세 · {form.gender} · {form.job}</div>
            </div>
          </div>

          <div className="scl-kpi-grid">
            <div className="scl-kpi">
              <span className="scl-kpi-label">총 채무</span>
              <span className="scl-kpi-val">{totalDebts.toLocaleString()}<em>만원</em></span>
            </div>
            <div className="scl-kpi">
              <span className="scl-kpi-label">총 자산</span>
              <span className="scl-kpi-val">{totalAssets.toLocaleString()}<em>만원</em></span>
            </div>
            <div className="scl-kpi">
              <span className="scl-kpi-label">월 가용소득</span>
              <span className={`scl-kpi-val ${disposableIncome < 0 ? "neg" : ""}`}>
                {disposableIncome >= 0 ? "+" : ""}{disposableIncome.toLocaleString()}<em>만원</em>
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
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
        </aside>

        {/* 메인 폼 영역 */}
        <main className="scl-main">
          <div className="scl-section-head">
            <h2 className="scl-section-title">{currentSection.label}</h2>
            <p className="scl-section-desc">{currentSection.desc}</p>
          </div>

          <div className="scl-form">
            {activeSection === "basic" && (
              <>
                <div className="scl-row-3">
                  <Field label="고객명">
                    <input className="scl-input" value={form.name} onChange={set("name")} placeholder="홍길동" />
                  </Field>
                  <Field label="나이">
                    <input className="scl-input" value={form.age} onChange={set("age")} placeholder="만 나이" />
                  </Field>
                  <Field label="성별">
                    <div className="scl-toggle-group">
                      {["남", "여"].map((v) => (
                        <button key={v} className={`scl-toggle ${form.gender === v ? "on" : ""}`}
                          onClick={() => setForm((p) => ({ ...p, gender: v }))}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="scl-row-2">
                  <Field label="거주지">
                    <input className="scl-input" value={form.address} onChange={set("address")} placeholder="시 / 구 단위" />
                  </Field>
                  <Field label="부양가족 수">
                    <input className="scl-input" value={form.dependents} onChange={set("dependents")} placeholder="명" />
                  </Field>
                </div>

                <div className="scl-row-2">
                  <Field label="직업">
                    <input className="scl-input" value={form.job} onChange={set("job")} placeholder="직업명" />
                  </Field>
                  <Field label="고용 형태">
                    <select className="scl-input" value={form.employmentType} onChange={set("employmentType")}>
                      {["정규직","계약직","자영업","프리랜서","무직","기타"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                </div>

                <label className="scl-switch-row">
                  <span>배우자 소득 있음</span>
                  <div className={`scl-switch ${form.hasSpouseIncome ? "on" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, hasSpouseIncome: !p.hasSpouseIncome }))}>
                    <div className="scl-switch-thumb" />
                  </div>
                </label>
              </>
            )}

            {activeSection === "assets" && (
              <>
                <p className="scl-note">※ 금액 단위: 만원 (시가 기준)</p>
                <div className="scl-row-2">
                  <Field label="부동산 (아파트 / 토지 등)">
                    <input className="scl-input" type="number" value={form.realEstate} onChange={set("realEstate")} placeholder="0" />
                  </Field>
                  <Field label="부동산 상세">
                    <input className="scl-input" value={form.realEstateDesc} onChange={set("realEstateDesc")} placeholder="예: 전세 보증금 1억" />
                  </Field>
                </div>
                <div className="scl-row-4">
                  <Field label="예금 / 적금">
                    <input className="scl-input" type="number" value={form.savings} onChange={set("savings")} />
                  </Field>
                  <Field label="주식 / 펀드">
                    <input className="scl-input" type="number" value={form.stocks} onChange={set("stocks")} />
                  </Field>
                  <Field label="차량 시가">
                    <input className="scl-input" type="number" value={form.vehicle} onChange={set("vehicle")} />
                  </Field>
                  <Field label="기타 자산">
                    <input className="scl-input" type="number" value={form.otherAssets} onChange={set("otherAssets")} />
                  </Field>
                </div>
                <div className="scl-sum-line">
                  <span>총 자산 합계</span>
                  <strong>{totalAssets.toLocaleString()}만원</strong>
                </div>
              </>
            )}

            {activeSection === "debts" && (
              <>
                <p className="scl-note">※ 금액 단위: 만원 / 현재 잔액 기준</p>
                <div className="scl-row-2">
                  <Field label="은행 대출">
                    <input className="scl-input" type="number" value={form.bankLoan} onChange={set("bankLoan")} />
                  </Field>
                  <Field label="카드론 / 카드대출">
                    <input className="scl-input" type="number" value={form.creditCardDebt} onChange={set("creditCardDebt")} />
                  </Field>
                </div>
                <div className="scl-row-2">
                  <Field label="캐피탈 / 저축은행">
                    <input className="scl-input" type="number" value={form.capitalLoan} onChange={set("capitalLoan")} />
                  </Field>
                  <Field label="사채 / 개인 차용">
                    <input className="scl-input" type="number" value={form.privateLoan} onChange={set("privateLoan")} />
                  </Field>
                </div>
                <div className="scl-sum-line debt">
                  <span>총 채무 합계</span>
                  <strong>{totalDebts.toLocaleString()}만원</strong>
                </div>
                <div className="scl-divider" />
                <div className="scl-row-2">
                  <Field label="연체 기간 (개월)">
                    <input className="scl-input" type="number" value={form.overduePeriod} onChange={set("overduePeriod")} placeholder="0이면 연체 없음" />
                  </Field>
                  <Field label="연체 상세 내용">
                    <input className="scl-input" value={form.overdueDetails} onChange={set("overdueDetails")} placeholder="연체 중인 채무 내역" />
                  </Field>
                </div>
              </>
            )}

            {activeSection === "income" && (
              <>
                <p className="scl-note">※ 금액 단위: 만원 / 월 기준</p>
                <p className="scl-sub-heading">소득</p>
                <div className="scl-row-2">
                  <Field label="본인 월 실수령액">
                    <input className="scl-input" type="number" value={form.monthlyIncome} onChange={set("monthlyIncome")} />
                  </Field>
                  <Field label="배우자 소득">
                    <input className="scl-input" type="number" value={form.spouseIncome} onChange={set("spouseIncome")} placeholder="없으면 0" />
                  </Field>
                </div>

                <div className="scl-divider" />
                <p className="scl-sub-heading">월 고정 지출</p>
                <div className="scl-row-3">
                  <Field label="주거비">
                    <input className="scl-input" type="number" value={form.monthlyRent} onChange={set("monthlyRent")} />
                  </Field>
                  <Field label="식비">
                    <input className="scl-input" type="number" value={form.monthlyFood} onChange={set("monthlyFood")} />
                  </Field>
                  <Field label="교육비">
                    <input className="scl-input" type="number" value={form.monthlyEducation} onChange={set("monthlyEducation")} />
                  </Field>
                </div>
                <div className="scl-row-2">
                  <Field label="교통비">
                    <input className="scl-input" type="number" value={form.monthlyTransport} onChange={set("monthlyTransport")} />
                  </Field>
                  <Field label="기타 고정지출">
                    <input className="scl-input" type="number" value={form.monthlyEtc} onChange={set("monthlyEtc")} />
                  </Field>
                </div>

                <div className="scl-income-summary">
                  <div className="scl-income-row">
                    <span>총 소득</span>
                    <span>+{((parseInt(form.monthlyIncome)||0)+(parseInt(form.spouseIncome)||0)).toLocaleString()}만원</span>
                  </div>
                  <div className="scl-income-row">
                    <span>총 지출</span>
                    <span>−{monthlyExpenses.toLocaleString()}만원</span>
                  </div>
                  <div className="scl-income-row total">
                    <span>월 가용 소득</span>
                    <strong className={disposableIncome < 30 ? "warn" : ""}>
                      {disposableIncome >= 0 ? "+" : ""}{disposableIncome.toLocaleString()}만원
                    </strong>
                  </div>
                </div>
              </>
            )}

            {activeSection === "misc" && (
              <>
                <div className="scl-check-list">
                  {[
                    { field: "previousFiling", label: "이전 개인회생 / 파산 신청 이력 있음",
                      subField: "previousFilingYear", subPlaceholder: "신청 연도 및 결과" },
                    { field: "hasSurety", label: "보증인 / 연대보증 관계 있음",
                      subField: "suretyClear", subPlaceholder: "관계 내용 입력" },
                    { field: "hasLawsuit", label: "현재 진행 중인 소송 / 압류 있음",
                      subField: "lawsuitDetails", subPlaceholder: "소송·압류 상세 내용" },
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
                        <input
                          className="scl-input scl-sub-input"
                          value={form[subField]}
                          onChange={set(subField)}
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
                    onChange={set("memo")}
                    rows={4}
                    placeholder="상담 중 특이사항, 고객 태도, 추가 메모 등"
                  />
                </Field>
              </>
            )}
          </div>

          {/* 하단 네비게이션 */}
          <div className="scl-nav-btns">
            {currentIdx > 0 && (
              <button className="scl-btn-prev" onClick={handlePrev}>이전</button>
            )}
            <button className="scl-btn-next" onClick={handleNext}>
              {isLast ? "완료" : "다음"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SampleChecklistPage;
