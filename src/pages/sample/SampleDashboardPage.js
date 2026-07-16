import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SampleDashboardPage.css";

const CLIENT = {
  name: "김민수",
  age: 42,
  gender: "남",
  job: "자영업",
  totalDebt: 31000,
  totalAsset: 1500,
  monthlyIncome: 220,
  monthlyExpenses: 175,
  disposableIncome: 45,
  overduePeriod: 6,
  debtBreakdown: [
    { label: "은행 대출", amount: 15000, pct: 48 },
    { label: "카드론", amount: 8000, pct: 26 },
    { label: "캐피탈", amount: 5000, pct: 16 },
    { label: "사채", amount: 3000, pct: 10 },
  ],
};

const SALES_REP = {
  name: "박지훈",
  branch: "강남영업점",
  thumb: "/images/thumb_sample1.png",
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
    id: "debtAdjustment",
    label: "채무조정(워크아웃)",
    score: 62,
    grade: "보통",
    recommended: false,
    conditions: [
      {
        type: "pass",
        text: "총 채무 3.1억원 → 신용회복위원회 신청 기준(15억 이하) 충족",
      },
      { type: "pass", text: "연체 기간 6개월 → 신청 자격 요건 충족" },
      {
        type: "caution",
        text: "사채·캐피탈 채무는 워크아웃 대상 제외 가능 → 실질 감면 범위 사전 확인 필요",
      },
      {
        type: "caution",
        text: "금리 조정 후에도 월 상환액이 가용 소득 초과 가능성 있음 → 상환 시뮬레이션 필요",
      },
      {
        type: "risk",
        text: "채무 대비 가용 소득 낮아 개인회생보다 채무 감면 폭 작을 가능성 높음",
      },
      {
        type: "risk",
        text: "자영업 소득 변동성이 높아 장기 상환계획 유지 어려울 수 있음",
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
  debtAdjustment: {
    id: "debtAdjustment",
    label: "채무조정(워크아웃)",
    color: "#059669",
    totalMonths: "최대 120개월",
    steps: [
      {
        id: 1,
        title: "신청 자격 확인",
        durationLabel: "—",
        durationWeeks: 0,
        details: {
          desc: "신용회복위원회 채무조정 신청이 가능한 요건을 사전 확인하는 단계입니다.",
          items: [
            "연체 3개월 이상 또는 연체 우려",
            "총 채무액 15억원 이하 (담보 포함)",
            "채권금융기관이 협약기관에 해당",
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
          desc: "모든 분할상환이 완료되고 채무조정 절차가 종료되는 단계입니다.",
          items: ["완납 확인서 수령", "신용정보 회복 신청", "채무 소멸 확인"],
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
  debtAdjustment: {
    1: { ...INTERNAL_STAFF, at: "2026.06.21 09:30" },
    2: { ...SALES_STAFF, at: "2026.06.23 13:10" },
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

  const handleRefundPayment = () => {
    if (
      !window.confirm(
        "지금까지 납부한 금액을 환불 처리하고 결제를 중단하시겠습니까?\n이미 납부한 회차는 '환불'로 표시되며, 남은 회차는 앞으로 청구되지 않습니다.",
      )
    )
      return;
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
    setProcSelectModalOpen(true);
  };

  const confirmApplyWithProcedure = () => {
    const fee = Number(draftTotalFee);
    const count =
      draftMethod === "lump" ? 1 : Math.max(1, Number(draftCount) || 1);

    setPayTotalFee(fee);
    setPayMethod(draftMethod);
    setPayInstallmentCount(count);
    setPayContractDate(draftDate);
    setInstallments(buildInstallments(fee, count, draftDate));
    setPaymentCanceled(false);
    setStopType(null);
    setCanceledAt(null);
    setPaymentConfigured(true);
    setSelectedOption(draftSelectedProc);
    setProcSelectModalOpen(false);
    setPayEditing(false);
  };

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

  const handleAcceptReview = () => {
    if (
      !window.confirm(
        "전달받은 분석 데이터를 수락하시겠습니까?\n\n계약 진행 후 결제 정보를 입력하면 절차 진행 단계로 넘어갑니다.",
      )
    )
      return;
    setReviewStatus("accepted");
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
    navigate("/checklist");
  };

  const totalRepayment = AI.repaymentAmount * AI.repaymentMonths;
  const exemptDebt = CLIENT.totalDebt - totalRepayment;

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
              <div className="sdp-sales-chip">
                <img src={SALES_REP.thumb} alt="" className="sdp-sales-thumb" />
                <div className="sdp-sales-info">
                  <span className="sdp-sales-branch">{SALES_REP.branch}</span>
                  <span className="sdp-sales-name">{SALES_REP.name}</span>
                </div>
              </div>
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
              <div className="sdp-review-bar sdp-review-bar--pending">
                <div className="sdp-review-bar-info">
                  <strong>분석 데이터 검토 요청</strong>
                  <span>
                    영업팀이 전달한 AI 분석 결과를 검토하고 수락 또는 거절해
                    주세요.
                  </span>
                </div>
                <div className="sdp-review-bar-actions">
                  <button
                    type="button"
                    className="sdp-review-btn sdp-review-btn--reject"
                    onClick={openRejectModal}
                  >
                    거절
                  </button>
                  <button
                    type="button"
                    className="sdp-review-btn sdp-review-btn--accept"
                    onClick={handleAcceptReview}
                  >
                    수락
                  </button>
                </div>
              </div>
            )}
            {reviewStatus === "accepted" && (
              <div className="sdp-review-bar sdp-review-bar--accepted">
                <div className="sdp-review-bar-content">
                  <span className="sdp-review-result-icon">✓</span>
                  <div className="sdp-review-bar-info">
                    <strong>분석 데이터를 수락했습니다</strong>
                    <span>
                      영업담당자에게 수락 알림이 전달됩니다. 계약 진행 후
                      결제 정보를 입력하면 절차 진행 단계로 넘어갑니다.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
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

          {/* 바 비교 — 클릭으로 선택 */}
          <div className="sdp-options">
            {OPTIONS.map((opt) => (
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
            ))}
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
                <span className="sdp-stat-label">총 채무</span>
                <span className="sdp-stat-val">
                  {CLIENT.totalDebt.toLocaleString()}
                  <em>만원</em>
                </span>
              </div>
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
                  {CLIENT.overduePeriod}
                  <em>개월</em>
                </span>
              </div>
            </div>

            <div className="sdp-divider" />

            <p className="sdp-section-label">채무 구성</p>
            <div className="sdp-bars">
              {CLIENT.debtBreakdown.map((d) => (
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
              <p className="sdp-exempt-val">
                약 {exemptDebt.toLocaleString()}만원
              </p>
              <p className="sdp-exempt-desc">
                변제 완료 후 법원 결정으로 면책되는 잔여 채무 금액입니다.
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
            <section className="sdp-section">
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
                        key={step.id}
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
                        <div key={step.id} className="sdp-proc-tl-item">
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
                            onClick={handleRefundPayment}
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
                {OPTIONS.map((opt) => (
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
                      <span className={`sdp-proc-select-grade g-${opt.grade}`}>
                        {opt.grade}
                      </span>
                    </div>
                  </button>
                ))}
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
