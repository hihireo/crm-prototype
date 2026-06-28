import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SampleDashboardPage.css";

const CLIENT = {
  name: "김민수", age: 42, gender: "남", job: "자영업",
  totalDebt: 31000, totalAsset: 1500,
  monthlyIncome: 220, monthlyExpenses: 175, disposableIncome: 45,
  overduePeriod: 6,
  debtBreakdown: [
    { label: "은행 대출",  amount: 15000, pct: 48 },
    { label: "카드론",    amount: 8000,  pct: 26 },
    { label: "캐피탈",   amount: 5000,  pct: 16 },
    { label: "사채",     amount: 3000,  pct: 10 },
  ],
};

const OPTIONS = [
  {
    id: "rehabilitation", label: "개인회생", score: 78, grade: "양호", recommended: true,
    conditions: [
      { type: "pass",    text: "월 가용 소득 45만원 확인 → 변제계획 수립 가능" },
      { type: "pass",    text: "채무총액 3.1억원, 자산 1,500만원 → 채무초과 요건 충족" },
      { type: "pass",    text: "연체 기간 6개월 → 지급 불능 상태 인정 가능" },
      { type: "caution", text: "자영업 소득 → 매출장부·세금계산서 등 소득증빙 별도 준비 필요" },
      { type: "caution", text: "사채 3,000만원 포함 → 불법 이자율 여부 확인 후 채권자 목록 정리 필요" },
      { type: "risk",    text: "가용 소득 45만원이 최소 변제 기준에 근접 → 법원의 변제여력 판단에 따라 결과 변동 가능" },
    ],
  },
  {
    id: "debtAdjustment", label: "채무조정(워크아웃)", score: 62, grade: "보통", recommended: false,
    conditions: [
      { type: "pass",    text: "총 채무 3.1억원 → 신용회복위원회 신청 기준(15억 이하) 충족" },
      { type: "pass",    text: "연체 기간 6개월 → 신청 자격 요건 충족" },
      { type: "caution", text: "사채·캐피탈 채무는 워크아웃 대상 제외 가능 → 실질 감면 범위 사전 확인 필요" },
      { type: "caution", text: "금리 조정 후에도 월 상환액이 가용 소득 초과 가능성 있음 → 상환 시뮬레이션 필요" },
      { type: "risk",    text: "채무 대비 가용 소득 낮아 개인회생보다 채무 감면 폭 작을 가능성 높음" },
      { type: "risk",    text: "자영업 소득 변동성이 높아 장기 상환계획 유지 어려울 수 있음" },
    ],
  },
  {
    id: "bankruptcy", label: "파산", score: 45, grade: "낮음", recommended: false,
    conditions: [
      { type: "pass",    text: "채무초과 상태로 파산 신청 요건 충족" },
      { type: "pass",    text: "이전 파산·회생 신청 이력 없음 → 기본 면책 결격 사유 없음" },
      { type: "caution", text: "자산 1,500만원 → 면책 심사 시 자산 처분 여부 검토 대상" },
      { type: "risk",    text: "월 가용 소득 45만원 존재 → 변제 능력 있는 것으로 판단되어 파산보다 개인회생 권고" },
      { type: "risk",    text: "파산 선고 시 일부 직종 취업 제한 및 신용 회복에 장기간 소요" },
    ],
  },
];

const AI = { repaymentMonths: 84, repaymentAmount: 45 };

const SCRIPTS = [
  { phase: "첫 설명",
    text: "고객님, 현재 상황을 분석해 드렸습니다. 총 채무가 3억 1천만원이지만, 월 가용 소득 45만원이 확인되어 개인회생 절차를 통해 채무를 조정하실 수 있는 가능성이 높습니다." },
  { phase: "핵심 설명",
    text: "개인회생을 신청하시면 법원을 통해 채무 일부를 탕감받고, 나머지를 최대 7년에 걸쳐 분납하게 됩니다. 고객님의 경우 월 45만원씩 84개월 변제 계획이 가능합니다." },
  { phase: "우려 해소",
    text: "신청 즉시 채권자의 추심이 금지됩니다. 직장과 주거지도 보전되며, 3~6개월 내 결과가 나옵니다. 직장에는 원칙적으로 영향이 없으므로 걱정하지 않으셔도 됩니다." },
  { phase: "다음 단계",
    text: "채무 증명서류와 소득증빙 서류를 준비해 주시면 됩니다. 오늘 상담 내용을 바탕으로 신청서 초안을 작성해 드리고, 법원 제출까지 함께 진행할 수 있습니다." },
];

const STEPS = [
  { n: 1, label: "서류 준비",      desc: "채권자 목록 · 소득 증빙 · 재산 목록",    period: "1–2주" },
  { n: 2, label: "신청서 작성",    desc: "변제계획안 및 신청서 초안 작성",          period: "3–5일" },
  { n: 3, label: "법원 접수",      desc: "관할 법원에 개인회생 신청 접수",          period: "당일"  },
  { n: 4, label: "포괄적 금지명령", desc: "채권자 추심 즉시 금지",                  period: "1주"   },
  { n: 5, label: "개시결정",       desc: "법원의 개인회생 절차 개시 결정",           period: "1–3개월" },
  { n: 6, label: "변제계획 인가",  desc: "법원 변제계획 최종 인가",                 period: "3–6개월" },
  { n: 7, label: "면책",          desc: "변제 완료 후 잔여 채무 전액 면책",          period: "최대 7년" },
];

/* 링 게이지 컴포넌트 */
const Ring = ({ score, size = 130, strokeWidth = 7 }) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="#f0f0f0" strokeWidth={strokeWidth} />
      <circle cx={c} cy={c} r={r} fill="none" stroke="#111" strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x={c} y={c - 4}  textAnchor="middle" fontSize={size * 0.27} fontWeight="800" fill="#111" letterSpacing="-1">{score}</text>
      <text x={c} y={c + 16} textAnchor="middle" fontSize={size * 0.1}  fill="#bbb">/100</text>
    </svg>
  );
};

const SampleDashboardPage = () => {
  const navigate = useNavigate();
  const [activeScript, setActiveScript] = useState(0);
  const [selectedOption, setSelectedOption] = useState("rehabilitation");

  const totalRepayment = AI.repaymentAmount * AI.repaymentMonths;
  const exemptDebt = CLIENT.totalDebt - totalRepayment;

  return (
    <div className="sdp-page">

      <div className="sdp-body">
        {/* 상단 인라인 네비 */}
        <div className="sdp-topnav">
          <button className="sdp-topnav-back"
            onClick={() => navigate("/checklist/form", { state: { fromResult: true } })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            정보 수정
          </button>
          <div className="sdp-topnav-center">
            <div className="sdp-chip-dot" />
            <span>{CLIENT.name} · {CLIENT.age}세 · {CLIENT.job}</span>
          </div>
          <div className="sdp-topnav-right">
            <span className="sdp-topnav-date">2026.06.28 16:00</span>
            <button className="sdp-btn-ghost sdp-print">출력</button>
          </div>
        </div>

        {/* ① 히어로: 추천 옵션 + 큰 링 */}
        <section className="sdp-hero">
          <div className="sdp-hero-left">
            <p className="sdp-hero-eyebrow">AI 분석 추천</p>
            <h1 className="sdp-hero-h1">개인회생</h1>
            <p className="sdp-hero-sub">소득 대비 채무 비율과 월 가용 소득을 종합적으로 분석한 결과,<br/>개인회생 신청이 가장 유리한 것으로 판단됩니다.</p>
            <div className="sdp-hero-tags">
              <span className="sdp-tag">채무초과 상태</span>
              <span className="sdp-tag">가용소득 충분</span>
              <span className="sdp-tag">연체 6개월</span>
            </div>
          </div>
          <div className="sdp-hero-right">
            <Ring score={78} size={150} strokeWidth={8} />
            <p className="sdp-hero-score-label">성공 가능성</p>
          </div>
        </section>

        {/* ② 옵션 비교 */}
        <section className="sdp-section">
          <p className="sdp-section-label">절차별 성공 가능성</p>

          {/* 바 비교 — 클릭으로 선택 */}
          <div className="sdp-options">
            {OPTIONS.map((opt) => (
              <div key={opt.id}
                className={`sdp-option-row ${opt.recommended ? "recommended" : ""} ${selectedOption === opt.id ? "selected" : ""}`}
                onClick={() => setSelectedOption(opt.id)}
                role="button" tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedOption(opt.id)}>
                <div className="sdp-option-name">
                  <span>{opt.label}</span>
                  {opt.recommended && <span className="sdp-option-tag">추천</span>}
                </div>
                <div className="sdp-option-bar-wrap">
                  <div className="sdp-option-bar">
                    <div className="sdp-option-fill" style={{ width: `${opt.score}%` }} />
                  </div>
                </div>
                <div className="sdp-option-score">
                  <strong>{opt.score}</strong>
                  <span>/100</span>
                </div>
                <span className={`sdp-option-grade g-${opt.grade}`}>{opt.grade}</span>
              </div>
            ))}
          </div>

          {/* 조건 상세 패널 */}
          {(() => {
            const opt = OPTIONS.find((o) => o.id === selectedOption);
            const passItems    = opt.conditions.filter((c) => c.type === "pass");
            const cautionItems = opt.conditions.filter((c) => c.type === "caution");
            const riskItems    = opt.conditions.filter((c) => c.type === "risk");
            return (
              <div className="sdp-condition-panel">
                <div className="sdp-condition-header">
                  <span className="sdp-condition-title">{opt.label} 조건 분석</span>
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
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="8" fill="#16a34a"/>
                          <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="sdp-cond-text">{c.text}</span>
                    </div>
                  ))}
                  {cautionItems.map((c, i) => (
                    <div key={`caution-${i}`} className="sdp-cond sdp-cond-caution">
                      <div className="sdp-cond-icon">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1.5L14.5 13H1.5L8 1.5Z" fill="#d97706" stroke="#d97706" strokeWidth="0.5" strokeLinejoin="round"/>
                          <path d="M8 6v3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                          <circle cx="8" cy="11" r="0.9" fill="#fff"/>
                        </svg>
                      </div>
                      <span className="sdp-cond-text">{c.text}</span>
                    </div>
                  ))}
                  {riskItems.map((c, i) => (
                    <div key={`risk-${i}`} className="sdp-cond sdp-cond-risk">
                      <div className="sdp-cond-icon">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="8" fill="#dc2626"/>
                          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
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
                <span className="sdp-stat-label">총 채무</span>
                <span className="sdp-stat-val">{CLIENT.totalDebt.toLocaleString()}<em>만원</em></span>
              </div>
              <div className="sdp-stat">
                <span className="sdp-stat-label">총 자산</span>
                <span className="sdp-stat-val">{CLIENT.totalAsset.toLocaleString()}<em>만원</em></span>
              </div>
              <div className="sdp-stat">
                <span className="sdp-stat-label">월 가용 소득</span>
                <span className="sdp-stat-val">+{CLIENT.disposableIncome}<em>만원</em></span>
              </div>
              <div className="sdp-stat">
                <span className="sdp-stat-label">연체 기간</span>
                <span className="sdp-stat-val">{CLIENT.overduePeriod}<em>개월</em></span>
              </div>
            </div>

            <div className="sdp-divider" />

            <p className="sdp-section-label">채무 구성</p>
            <div className="sdp-bars">
              {CLIENT.debtBreakdown.map((d) => (
                <div key={d.label} className="sdp-bar-row">
                  <span className="sdp-bar-label">{d.label}</span>
                  <div className="sdp-bar-track">
                    <div className="sdp-bar-fill" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="sdp-bar-pct">{d.pct}%</span>
                  <span className="sdp-bar-amt">{d.amount.toLocaleString()}만원</span>
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
              <p className="sdp-exempt-val">약 {exemptDebt.toLocaleString()}만원</p>
              <p className="sdp-exempt-desc">변제 완료 후 법원 결정으로 면책되는 잔여 채무 금액입니다.</p>
            </div>

            <div className="sdp-divider" />

            <p className="sdp-section-label">주의사항</p>
            <ul className="sdp-cautions">
              <li>이전 면책 후 <strong>7년 이내</strong> 재신청 불가</li>
              <li>허위 재산 신고 시 면책 취소 가능</li>
              <li>신청 전 자산 임의 처분 금지</li>
              <li>불법 사채는 별도 법적 검토 필요</li>
            </ul>
          </section>
        </div>

        {/* ⑤ 상담 멘트 */}
        <section className="sdp-section">
          <p className="sdp-section-label">추천 상담 멘트</p>
          <div className="sdp-script-tabs">
            {SCRIPTS.map((s, i) => (
              <button key={i}
                className={`sdp-script-tab ${activeScript === i ? "on" : ""}`}
                onClick={() => setActiveScript(i)}>
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

        {/* ⑥ 절차 안내 */}
        <section className="sdp-section">
          <p className="sdp-section-label">개인회생 절차</p>
          <div className="sdp-steps">
            {STEPS.map((s, i) => (
              <div key={s.n} className="sdp-step">
                <div className="sdp-step-left">
                  <div className="sdp-step-circle">{s.n}</div>
                  {i < STEPS.length - 1 && <div className="sdp-step-line" />}
                </div>
                <div className="sdp-step-body">
                  <div className="sdp-step-top">
                    <span className="sdp-step-name">{s.label}</span>
                    <span className="sdp-step-period">{s.period}</span>
                  </div>
                  <p className="sdp-step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ⑦ 하단 CTA */}
        <div className="sdp-cta-row">
          <button className="sdp-btn-ghost"
            onClick={() => navigate("/checklist/form", { state: { fromResult: true } })}>
            정보 수정
          </button>
          <button className="sdp-btn-ghost">보고서 저장</button>
          <button className="sdp-btn-primary">개인회생 신청 진행</button>
        </div>

      </div>
    </div>
  );
};

export default SampleDashboardPage;
