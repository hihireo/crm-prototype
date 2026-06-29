import React, { useState, useRef, useEffect } from "react";
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
  const yS = c + size * 0.10;
  const yD = c + size * 0.21;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="#f0f0f0" strokeWidth={strokeWidth} />
      <circle cx={c} cy={c} r={r} fill="none" stroke="#111" strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x={c} y={yL} textAnchor="middle" fontSize={size * 0.085} fill="#999" letterSpacing="0.3">성공 가능성</text>
      <text x={c} y={yS} textAnchor="middle" fontSize={size * 0.26}  fontWeight="800" fill="#111" letterSpacing="-1">{score}</text>
      <text x={c} y={yD} textAnchor="middle" fontSize={size * 0.09}  fill="#bbb">/100</text>
    </svg>
  );
};

const SampleDashboardPage = () => {
  const navigate = useNavigate();
  const [activeScript, setActiveScript] = useState(0);
  const [selectedOption, setSelectedOption] = useState("rehabilitation");

  const [chatMessages, setChatMessages] = useState([INITIAL_AI_MSG]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatMessages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiTyping]);

  const sendMessage = (text) => {
    if (!text.trim() || isAiTyping) return;
    const userMsg = { role: "user", text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);
    setTimeout(() => {
      const answer = AI_ANSWERS[text] ||
        "분석 결과를 바탕으로 답변드리겠습니다. 해당 질문은 구체적인 법률 검토가 필요한 사안입니다. 담당 법무사 또는 변호사와의 상담을 권장합니다.";
      setChatMessages((prev) => [...prev, { role: "ai", text: answer }]);
      setIsAiTyping(false);
    }, 1000);
  };

  const totalRepayment = AI.repaymentAmount * AI.repaymentMonths;
  const exemptDebt = CLIENT.totalDebt - totalRepayment;

  return (
    <div className="sdp-page">

      <div className="sdp-body">
        {/* 상단 인라인 네비 */}
        <div className="sdp-topnav">
          <div className="sdp-topnav-client">
            <div className="sdp-chip-dot" />
            <span>{CLIENT.name} · {CLIENT.age}세 · {CLIENT.job}</span>
          </div>
          <div className="sdp-topnav-right">
            <span className="sdp-topnav-date">2026.06.28 16:00</span>
            {/* 아이콘 액션 버튼들 */}
            <button
              className="sdp-icon-btn"
              title="정보 수정"
              onClick={() => navigate("/checklist/form", { state: { fromResult: true } })}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="#444" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M10 4L12 6" stroke="#444" strokeWidth="1.4"/>
              </svg>
              <span>정보 수정</span>
            </button>
            <button
              className="sdp-icon-btn"
              title="목록"
              onClick={() => navigate("/checklist")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3.5" width="12" height="1.4" rx="0.7" fill="#444"/>
                <rect x="2" y="7.3" width="12" height="1.4" rx="0.7" fill="#444"/>
                <rect x="2" y="11.1" width="12" height="1.4" rx="0.7" fill="#444"/>
              </svg>
              <span>목록</span>
            </button>
            <button className="sdp-icon-btn sdp-icon-btn--primary" title="저장하기">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>저장하기</span>
            </button>
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

        {/* ⑥ AI 추가 질문 */}
        <section className="sdp-section sdp-chat-section">
          <div className="sdp-chat-section-header">
            {/* AI 스파클 아이콘 */}
            <svg className="sdp-sparkle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
              {/* 큰 4각별 */}
              <path d="M10 3 L11.6 8.4 L17 10 L11.6 11.6 L10 17 L8.4 11.6 L3 10 L8.4 8.4 Z" fill="#111"/>
              {/* 작은 4각별 */}
              <path d="M19.5 2 L20.4 4.6 L23 5.5 L20.4 6.4 L19.5 9 L18.6 6.4 L16 5.5 L18.6 4.6 Z" fill="#111"/>
              {/* 점 */}
              <circle cx="5" cy="19" r="1.3" fill="#111"/>
            </svg>
            <p className="sdp-section-label" style={{ margin: 0 }}>AI 추가 질문</p>
          </div>

          {/* 빠른 질문 칩 */}
          <div className="sdp-chat-quick">
            {AI_QUICK.map((q) => (
              <button key={q} className="sdp-chat-quick-btn"
                onClick={() => sendMessage(q)}
                disabled={isAiTyping}>
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
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#111"/>
                      <path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <circle cx="10" cy="10" r="10" fill="#111"/>
                    <path d="M6 10.5l2.5 2.5L14 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="sdp-chat-bubble sdp-chat-typing">
                  <span /><span /><span />
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
            <button className="sdp-chat-send"
              onClick={() => sendMessage(chatInput)}
              disabled={!chatInput.trim() || isAiTyping}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

        {/* ⑦ 절차 안내 */}
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


      </div>
    </div>
  );
};

export default SampleDashboardPage;
