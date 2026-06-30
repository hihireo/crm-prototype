import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProcedureGuidePage.css";

/* ── 절차별 데이터 ─────────────────────────────────────── */
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
          desc: "법원 신청 전 본인의 상황이 개인회생 요건에 해당하는지 검토하는 단계입니다.",
          items: [
            "채무 총액 확인 (무담보채무 10억 이하 / 담보채무 15억 이하)",
            "월 가용 소득 존재 여부 확인",
            "연체 현황 및 법적 조치(압류·소송) 확인",
            "신청 이력 여부 확인 (기존 파산·회생 이력)",
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
          desc: "신청 후 법원의 판단에 따라 채권자의 강제집행 등을 막는 명령이 내려질 수 있습니다.",
          items: [
            "채권자의 전화·서면 독촉 중지",
            "급여·통장 압류 중지",
            "강제집행 정지",
          ],
          caution: "금지명령은 모든 사건에서 자동으로 인정되는 것은 아닙니다. 법원의 재량에 따라 발령 여부가 결정됩니다.",
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
          caution: "보정 기한을 놓치면 사건이 기각될 수 있으므로 기한 관리가 매우 중요합니다.",
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
          desc: "채권자가 변제계획에 대해 의견을 내는 절차로, 대부분 형식적으로 진행되나 문제가 될 수 있는 사항이 있습니다.",
          items: [
            "채무 발생 경위 설명",
            "현재 소득·재산 현황 확인",
            "재산 은닉 여부 검토",
          ],
          caution: "채무 발생 과정이 불명확하거나 재산 은닉 의심이 있는 경우 이의가 제기될 수 있습니다.",
        },
      },
      {
        id: 7,
        title: "인가결정",
        durationLabel: "1개월 내외",
        durationWeeks: 4,
        details: {
          desc: "법원이 변제계획을 최종 승인하는 단계입니다.",
          items: [
            "변제계획 내용 확정",
            "인가 후 계획대로 변제 의무 발생",
          ],
          example: "예) 채무 1억 5천만원 → 월 변제금 100만원 × 36개월 = 3,600만원 변제 후 나머지 면책 대상",
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
          caution: "변제를 중단하거나 미납이 누적되면 인가취소로 이어질 수 있습니다.",
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
          caution: "파산·면책 이력은 신용정보에 기록되며 일정 기간 금융 활동에 제한이 있을 수 있습니다.",
        },
      },
    ],
  },

  adjustment: {
    id: "adjustment",
    label: "채무조정",
    color: "#059669",
    totalMonths: "최대 10년 (120개월)",
    steps: [
      {
        id: 1,
        title: "신청 자격 확인",
        durationLabel: "—",
        durationWeeks: 0,
        details: {
          desc: "신용회복위원회 채무조정 신청이 가능한 요건을 사전 확인하는 단계입니다.",
          items: [
            "연체 3개월 이상 또는 연체 우려 채무자",
            "총 채무액 15억원 이하 (담보 포함)",
            "채권금융기관이 신용회복위원회 협약기관에 해당",
            "이전 채무조정 이력 확인",
          ],
          caution: null,
        },
      },
      {
        id: 2,
        title: "신청서 접수",
        durationLabel: "1~2주",
        durationWeeks: 1.5,
        details: {
          desc: "신용회복위원회에 채무조정 신청서 및 관련 서류를 제출하는 단계입니다.",
          items: [
            "채무조정 신청서",
            "소득 증빙자료",
            "채무 내역 확인서",
            "가계수지 현황표",
          ],
          note: "온라인(신복위 홈페이지) 또는 방문 신청 가능",
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
          desc: "채권자 동의를 받아 채무조정 조건이 최종 확정되는 단계입니다.",
          items: [
            "이자율 감면 (최대 0%)",
            "상환기간 연장 (최대 10년)",
            "원금 일부 감면 (신용대출 최대 80%)",
          ],
          caution: null,
        },
      },
      {
        id: 5,
        title: "분할상환 시작",
        durationLabel: "확정 조건에 따라 (최대 120개월)",
        durationWeeks: 120 * 4,
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
          desc: "모든 분할상환이 완료되고 채무조정 절차가 종료되는 단계입니다.",
          items: [
            "완납 확인서 수령",
            "신용정보 회복 신청",
            "채무 소멸 확인",
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
          desc: "파산·면책 신청 전 본인의 상황이 파산 요건에 해당하는지 검토하는 단계입니다.",
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
          items: [
            "법원의 파산 요건 심사",
            "파산선고 결정",
            "파산관재인 선임",
          ],
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
          caution: "도박, 낭비, 사기 등으로 채무가 발생한 경우 면책이 불허가될 수 있습니다.",
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
          caution: "면책 제외 채무: 세금, 양육비, 벌금, 고의·과실 손해배상채무 등은 면책되지 않습니다.",
        },
      },
    ],
  },
};

/* 고객 목록 (ChecklistListPage 데이터와 동일) */
const CLIENTS = [
  { id: 1, name: "김민수", recommended: "개인회생" },
  { id: 2, name: "이지영", recommended: "채무조정" },
  { id: 3, name: "박철수", recommended: "파산" },
  { id: 4, name: "최수진", recommended: "채무조정" },
  { id: 5, name: "정대호", recommended: "개인회생" },
  { id: 6, name: "한소희", recommended: "채무조정" },
  { id: 7, name: "오민준", recommended: "파산" },
  { id: 8, name: "강지우", recommended: "개인회생" },
];

const PROC_KEY_MAP = { 개인회생: "rehabilitation", 채무조정: "adjustment", 파산: "bankruptcy" };

/* localStorage 키 */
const storageKey = (clientId, procId) => `proc_step_${clientId}_${procId}`;

/* 예상 남은 기간 계산 */
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

/* ── 아코디언 단계 카드 ─────────────────────────────────── */
const StepCard = ({ step, isOpen, isCurrent, isCompleted, onToggle, onSetCurrent }) => {
  const { details } = step;
  return (
    <div className={`pgd-step-card ${isCurrent ? "current" : ""} ${isCompleted ? "completed" : ""}`}>
      <button className="pgd-step-header" onClick={onToggle}>
        <div className="pgd-step-left">
          <span className={`pgd-step-num ${isCurrent ? "current" : isCompleted ? "done" : ""}`}>
            {isCompleted ? "✓" : step.id}
          </span>
          <div className="pgd-step-title-wrap">
            <span className="pgd-step-title">
              {step.id}단계. {step.title}
            </span>
            <span className="pgd-step-duration">{step.durationLabel}</span>
          </div>
        </div>
        <div className="pgd-step-right">
          {isCurrent && <span className="pgd-current-badge">진행중</span>}
          <span className={`pgd-chevron ${isOpen ? "open" : ""}`}>›</span>
        </div>
      </button>

      {isOpen && (
        <div className="pgd-step-body">
          <p className="pgd-step-desc">{details.desc}</p>

          {details.items?.length > 0 && (
            <ul className="pgd-step-list">
              {details.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}

          {details.note && (
            <p className="pgd-step-note">{details.note}</p>
          )}

          {details.example && (
            <div className="pgd-step-example">
              <span className="pgd-example-label">예시</span>
              <p>{details.example}</p>
            </div>
          )}

          {details.caution && (
            <div className="pgd-step-caution">
              <span className="pgd-caution-icon">⚠</span>
              <p>{details.caution}</p>
            </div>
          )}

          <button
            className={`pgd-set-current-btn ${isCurrent ? "active" : ""}`}
            onClick={(e) => { e.stopPropagation(); onSetCurrent(); }}
          >
            {isCurrent ? "✓ 현재 단계" : "현재 단계로 설정"}
          </button>
        </div>
      )}
    </div>
  );
};

/* ── 타임라인 패널 ─────────────────────────────────────── */
const TimelinePanel = ({ procedure, currentStepId, clientName }) => {
  const { steps, color, totalMonths } = procedure;
  const currentIdx = steps.findIndex((s) => s.id === currentStepId);
  const remainingWeeks = calcRemainingWeeks(steps, currentStepId);

  return (
    <div className="pgd-timeline-panel">
      <div className="pgd-panel-header">
        <h3 className="pgd-panel-title">진행 현황</h3>
        {clientName && (
          <span className="pgd-panel-client">{clientName}</span>
        )}
      </div>

      <div className="pgd-current-info">
        <div className="pgd-current-step-label">현재 단계</div>
        <div className="pgd-current-step-name">
          {currentStepId
            ? `${currentStepId}단계. ${steps.find((s) => s.id === currentStepId)?.title}`
            : "단계 미설정"}
        </div>
      </div>

      <div className="pgd-remaining-info">
        <div className="pgd-remaining-label">예상 남은 기간</div>
        <div className="pgd-remaining-value">{weeksToLabel(remainingWeeks)}</div>
        <div className="pgd-total-label">전체 예상: {totalMonths}</div>
      </div>

      <div className="pgd-timeline">
        {steps.map((step, idx) => {
          const isCompleted = currentIdx >= 0 && idx < currentIdx;
          const isCurrent = step.id === currentStepId;
          const isPending = currentIdx >= 0 && idx > currentIdx;
          return (
            <div key={step.id} className="pgd-tl-item">
              <div className="pgd-tl-track">
                <div
                  className={`pgd-tl-dot ${isCurrent ? "current" : isCompleted ? "done" : "pending"}`}
                  style={isCurrent ? { background: color, borderColor: color } : {}}
                />
                {idx < steps.length - 1 && (
                  <div className={`pgd-tl-line ${isCompleted ? "done" : ""}`} />
                )}
              </div>
              <div className={`pgd-tl-content ${isCurrent ? "current" : isCompleted ? "done" : isPending ? "pending" : ""}`}>
                <span className="pgd-tl-title">
                  {step.id}단계. {step.title}
                </span>
                <span className="pgd-tl-dur">{step.durationLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pgd-progress-bar-wrap">
        <div className="pgd-progress-label">
          <span>전체 진행률</span>
          <span>{currentIdx >= 0 ? Math.round(((currentIdx) / (steps.length - 1)) * 100) : 0}%</span>
        </div>
        <div className="pgd-progress-bg">
          <div
            className="pgd-progress-fill"
            style={{
              width: `${currentIdx >= 0 ? Math.round((currentIdx / (steps.length - 1)) * 100) : 0}%`,
              background: color,
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ── 메인 페이지 ─────────────────────────────────────── */
const ProcedureGuidePage = () => {
  const navigate = useNavigate();

  const [activeProc, setActiveProc] = useState("rehabilitation");
  const [openSteps, setOpenSteps] = useState(new Set([1]));
  const [selectedClient, setSelectedClient] = useState(null);
  const [currentStepMap, setCurrentStepMap] = useState({});

  const procedure = PROCEDURES[activeProc];

  /* 고객 변경 또는 절차 변경 시 저장된 단계 로드 */
  useEffect(() => {
    if (!selectedClient) return;
    const saved = localStorage.getItem(storageKey(selectedClient.id, activeProc));
    setCurrentStepMap((prev) => ({
      ...prev,
      [`${selectedClient.id}_${activeProc}`]: saved ? parseInt(saved) : null,
    }));
  }, [selectedClient, activeProc]);

  const mapKey = selectedClient ? `${selectedClient.id}_${activeProc}` : null;
  const currentStepId = mapKey ? (currentStepMap[mapKey] ?? null) : null;

  const handleSetCurrent = (stepId) => {
    if (!selectedClient) return;
    const key = `${selectedClient.id}_${activeProc}`;
    setCurrentStepMap((prev) => ({ ...prev, [key]: stepId }));
    localStorage.setItem(storageKey(selectedClient.id, activeProc), String(stepId));
  };

  const toggleStep = (stepId) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const handleProcChange = (procId) => {
    setActiveProc(procId);
    setOpenSteps(new Set([1]));
  };

  const handleClientChange = (e) => {
    const id = parseInt(e.target.value);
    const client = CLIENTS.find((c) => c.id === id) ?? null;
    setSelectedClient(client);
    if (client) {
      const suggestedProc = PROC_KEY_MAP[client.recommended];
      if (suggestedProc) {
        setActiveProc(suggestedProc);
        setOpenSteps(new Set([1]));
      }
    }
  };

  const completedStepIds = new Set(
    currentStepId
      ? procedure.steps
          .filter((s) => s.id < currentStepId)
          .map((s) => s.id)
      : []
  );

  return (
    <div className="pgd-page">
      <div className="pgd-body">
        {/* 페이지 헤더 */}
        <div className="pgd-page-header">
          <div>
            <h1 className="pgd-page-title">절차 안내</h1>
            <p className="pgd-page-sub">
              개인회생·채무조정·파산 각 절차를 단계별로 확인하고 고객의 진행 상황을 관리합니다
            </p>
          </div>
          <button className="pgd-back-btn" onClick={() => navigate("/checklist")}>
            ← 목록으로
          </button>
        </div>

        {/* 고객 선택 */}
        <div className="pgd-client-bar">
          <label className="pgd-client-label">고객 선택</label>
          <select
            className="pgd-client-select"
            value={selectedClient?.id ?? ""}
            onChange={handleClientChange}
          >
            <option value="">고객을 선택하세요</option>
            {CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.recommended})
              </option>
            ))}
          </select>
          {!selectedClient && (
            <span className="pgd-client-hint">고객을 선택하면 진행 단계를 저장할 수 있습니다</span>
          )}
        </div>

        {/* 절차 탭 */}
        <div className="pgd-tabs">
          {Object.values(PROCEDURES).map((proc) => (
            <button
              key={proc.id}
              className={`pgd-tab ${activeProc === proc.id ? "active" : ""}`}
              style={activeProc === proc.id ? { borderColor: proc.color, color: proc.color } : {}}
              onClick={() => handleProcChange(proc.id)}
            >
              {proc.label}
            </button>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="pgd-content">
          {/* 좌측: 아코디언 */}
          <div className="pgd-accordion-col">
            <div className="pgd-col-title">
              <span
                className="pgd-col-badge"
                style={{ background: procedure.color }}
              >
                {procedure.label}
              </span>
              <span className="pgd-col-step-count">총 {procedure.steps.length}단계</span>
            </div>

            <div className="pgd-steps-list">
              {procedure.steps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  isOpen={openSteps.has(step.id)}
                  isCurrent={step.id === currentStepId}
                  isCompleted={completedStepIds.has(step.id)}
                  onToggle={() => toggleStep(step.id)}
                  onSetCurrent={() => handleSetCurrent(step.id)}
                />
              ))}
            </div>
          </div>

          {/* 우측: 타임라인 */}
          <div className="pgd-timeline-col">
            <TimelinePanel
              procedure={procedure}
              currentStepId={currentStepId}
              clientName={selectedClient?.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcedureGuidePage;
