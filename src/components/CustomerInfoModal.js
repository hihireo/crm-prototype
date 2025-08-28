import React, { useState, useEffect } from "react";
import "./CustomerInfoModal.css";
import CustomerAssignmentModal from "./CustomerAssignmentModal";

const CustomerInfoModal = ({ isOpen, onClose, customerData }) => {
  // 고객 상태 관리
  const [customerStatus, setCustomerStatus] = useState(
    customerData?.status || "대기"
  );

  // 고객 정보 상태
  const [customerInfo, setCustomerInfo] = useState({
    name: customerData?.name || "홍길동",
    phone1Type: "휴대폰",
    phone1: customerData?.phone || "010-1234-5678",
    phone2Type: "집",
    phone2: "",
    ssnFirst: "",
    ssnSecond: "",
    age: "",
    job: "",
  });

  // 메신저 계정 정보 상태
  const [messengerAccounts, setMessengerAccounts] = useState([
    { id: 1, platform: "카카오톡", accountId: "kakao123" },
    { id: 2, platform: "텔레그램", accountId: "telegram456" },
  ]);
  const [newMessenger, setNewMessenger] = useState({
    platform: "카카오톡",
    accountId: "",
  });

  // 데이터 정보 상태
  const [dataInfo, setDataInfo] = useState({
    applicationTime: "2024-01-15 14:30",
    assignmentTime: "2024-01-15 15:45",
    applicationRoute: "네이버",
    site: "메인사이트",
    mediaCompany: "구글광고",
    assignedTeam: "영업1팀",
    assignedPerson: "박직원",
    specialNotes: "",
  });

  // 영업 정보 상태
  const [businessInfo, setBusinessInfo] = useState({
    investmentInfo: "",
    investmentProfitLoss: "",
    investmentTendency: "안정형",
    remarks: "",
  });

  // 결제 내역 상태
  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: 1,
      date: "2024-01-10",
      amount: "1,000,000",
      method: "카드",
      description: "초기 투자",
    },
    {
      id: 2,
      date: "2024-01-20",
      amount: "500,000",
      method: "계좌이체",
      description: "추가 투자",
    },
  ]);
  const [newPayment, setNewPayment] = useState({
    date: "",
    amount: "",
    method: "카드",
    description: "",
  });

  // 일정 관리 상태
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      date: "2024-01-25",
      hour: "14",
      minute: "00",
      content: "전화 상담 예정",
    },
  ]);
  const [newSchedule, setNewSchedule] = useState({
    date: "",
    ampm: "오전",
    hour: "",
    minute: "",
    content: "",
  });

  // 상담 내용 기록 상태
  const [consultations, setConsultations] = useState(
    customerData?.consultations || [
      {
        id: 1,
        author: "박직원",
        content: "투자 상품에 대한 기본 설명 완료",
        timestamp: "2024-01-15 16:30:00",
      },
    ]
  );
  const [newConsultation, setNewConsultation] = useState("");
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // 유효성 검사 상태
  const [validationErrors, setValidationErrors] = useState({
    messenger: {},
    payment: {},
    schedule: {},
  });

  // 현재 사용자 정보
  const currentUser = {
    name: "김관리자",
    role: "관리자",
    team: "전체",
  };

  // 연령 계산 함수
  const calculateAge = (ssnFirst) => {
    if (ssnFirst.length !== 6) return "";

    const year = parseInt(ssnFirst.substring(0, 2));
    const month = parseInt(ssnFirst.substring(2, 4));
    const day = parseInt(ssnFirst.substring(4, 6));

    // 2000년대 이후 출생자인지 1900년대 출생자인지 판단
    const fullYear = year <= 30 ? 2000 + year : 1900 + year;

    const today = new Date();
    const birthDate = new Date(fullYear, month - 1, day);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age.toString();
  };

  // 주민등록번호 앞자리 변경 시 연령 자동 계산
  useEffect(() => {
    if (customerInfo.ssnFirst.length === 6) {
      const calculatedAge = calculateAge(customerInfo.ssnFirst);
      setCustomerInfo((prev) => ({ ...prev, age: calculatedAge }));
    }
  }, [customerInfo.ssnFirst]);

  // 숫자 포맷팅 함수
  const formatNumber = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 투자 손익 입력 처리
  const handleProfitLossChange = (value) => {
    const numericValue = value.replace(/[^0-9-]/g, "");
    const formattedValue = formatNumber(numericValue);
    setBusinessInfo((prev) => ({
      ...prev,
      investmentProfitLoss: formattedValue,
    }));
  };

  if (!isOpen || !customerData) return null;

  const handleAssignmentClick = () => {
    setIsAssignmentModalOpen(true);
  };

  const getSelectedCustomers = () => {
    return [
      {
        id: customerData.id,
        name: customerInfo.name,
        phone: customerInfo.phone1,
        applicationNumber:
          customerData.applicationNumber || `APP-${customerData.id}`,
      },
    ];
  };

  // 메신저 계정 추가
  const handleAddMessenger = () => {
    const errors = {};

    if (!newMessenger.platform) {
      errors.platform = true;
    }
    if (!newMessenger.accountId.trim()) {
      errors.accountId = true;
    }

    setValidationErrors((prev) => ({ ...prev, messenger: errors }));

    if (Object.keys(errors).length === 0) {
      const messenger = {
        id: Date.now(),
        platform: newMessenger.platform,
        accountId: newMessenger.accountId.trim(),
      };
      setMessengerAccounts((prev) => [messenger, ...prev]);
      setNewMessenger({ platform: "카카오톡", accountId: "" });
    }
  };

  // 메신저 계정 삭제
  const handleRemoveMessenger = (id) => {
    const messenger = messengerAccounts.find((item) => item.id === id);
    const confirmMessage = `${messenger.platform} 계정 "${messenger.accountId}"를 삭제하시겠습니까?`;
    if (window.confirm(confirmMessage)) {
      setMessengerAccounts((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 결제 내역 추가
  const handleAddPayment = () => {
    const errors = {};

    if (!newPayment.date) {
      errors.date = true;
    }
    if (!newPayment.amount) {
      errors.amount = true;
    }
    if (!newPayment.method) {
      errors.method = true;
    }
    if (!newPayment.description.trim()) {
      errors.description = true;
    }

    setValidationErrors((prev) => ({ ...prev, payment: errors }));

    if (Object.keys(errors).length === 0) {
      const payment = {
        id: Date.now(),
        ...newPayment,
        amount: formatNumber(newPayment.amount.replace(/[^0-9]/g, "")),
      };
      setPaymentHistory((prev) => [payment, ...prev]);
      setNewPayment({ date: "", amount: "", method: "카드", description: "" });
    }
  };

  // 일정 추가
  const handleAddSchedule = () => {
    const errors = {};

    if (!newSchedule.date) {
      errors.date = true;
    }
    if (!newSchedule.hour) {
      errors.hour = true;
    }
    if (!newSchedule.minute) {
      errors.minute = true;
    }
    if (!newSchedule.content.trim()) {
      errors.content = true;
    }

    setValidationErrors((prev) => ({ ...prev, schedule: errors }));

    if (Object.keys(errors).length === 0) {
      const schedule = {
        id: Date.now(),
        date: newSchedule.date,
        hour: convertTo24Hour(newSchedule.ampm, newSchedule.hour),
        minute: newSchedule.minute,
        content: newSchedule.content,
      };
      setSchedules((prev) => [schedule, ...prev]);
      setNewSchedule({
        date: "",
        ampm: "오전",
        hour: "",
        minute: "",
        content: "",
      });
    }
  };

  // 일정 삭제
  const handleRemoveSchedule = (id) => {
    const schedule = schedules.find((item) => item.id === id);
    const timeInfo = convertTo12Hour(schedule.hour);
    const confirmMessage = `${schedule.date} ${timeInfo.ampm} ${timeInfo.hour}:${schedule.minute} "${schedule.content}" 일정을 삭제하시겠습니까?`;
    if (window.confirm(confirmMessage)) {
      setSchedules((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 상담 내용 삭제
  const handleRemoveConsultation = (id) => {
    const consultation = consultations.find((item) => item.id === id);
    const confirmMessage = `"${consultation.content}" 상담 기록을 삭제하시겠습니까?`;
    if (window.confirm(confirmMessage)) {
      setConsultations((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 상담 내용 추가
  const handleAddConsultation = () => {
    if (newConsultation.trim()) {
      const consultation = {
        id: Date.now(),
        author: "박직원",
        content: newConsultation.trim(),
        timestamp: new Date()
          .toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
          .replace(/\./g, "-")
          .replace(/, /, " "),
      };
      setConsultations((prev) => [consultation, ...prev]);
      setNewConsultation("");
    }
  };

  // 시간 옵션 생성 (1-12시)
  const generateHourOptions = () => {
    return Array.from({ length: 12 }, (_, i) =>
      (i + 1).toString().padStart(2, "0")
    );
  };

  // 분 옵션 생성 (10분 단위)
  const generateMinuteOptions = () => {
    return Array.from({ length: 6 }, (_, i) =>
      (i * 10).toString().padStart(2, "0")
    );
  };

  // 12시간 형식을 24시간 형식으로 변환
  const convertTo24Hour = (ampm, hour) => {
    if (!hour) return "";
    const hourNum = parseInt(hour);
    if (ampm === "오전") {
      return hourNum === 12 ? "00" : hour;
    } else {
      return hourNum === 12 ? "12" : (hourNum + 12).toString().padStart(2, "0");
    }
  };

  // 24시간 형식을 12시간 형식으로 변환
  const convertTo12Hour = (hour24) => {
    if (!hour24) return { ampm: "오전", hour: "" };
    const hourNum = parseInt(hour24);
    if (hourNum === 0) {
      return { ampm: "오전", hour: "12" };
    } else if (hourNum < 12) {
      return { ampm: "오전", hour: hourNum.toString().padStart(2, "0") };
    } else if (hourNum === 12) {
      return { ampm: "오후", hour: "12" };
    } else {
      return { ampm: "오후", hour: (hourNum - 12).toString().padStart(2, "0") };
    }
  };

  const statusOptions = ["대기", "관리 중", "종료"];

  // 모달 닫을 때 상태 초기화
  const handleCloseModal = () => {
    // 새로 입력하던 데이터 초기화
    setNewMessenger({ platform: "카카오톡", accountId: "" });
    setNewPayment({ date: "", amount: "", method: "카드", description: "" });
    setNewSchedule({
      date: "",
      ampm: "오전",
      hour: "",
      minute: "",
      content: "",
    });
    setNewConsultation("");

    // 유효성 검사 에러 초기화
    setValidationErrors({
      messenger: {},
      payment: {},
      schedule: {},
    });

    // 모달 닫기
    onClose();
  };

  return (
    <div className="cim-modal-overlay" onClick={handleCloseModal}>
      <div className="cim-customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cim-modal-header">
          <div className="cim-header-content">
            <h2 className="cim-title">고객 정보</h2>
            <div className="cim-status-stepper">
              {statusOptions.map((status, index) => (
                <div
                  key={status}
                  className={`cim-status-step ${
                    customerStatus === status ? "active" : ""
                  } ${
                    statusOptions.indexOf(customerStatus) > index
                      ? "completed"
                      : ""
                  }`}
                  onClick={() => {
                    if (customerStatus !== status) {
                      const confirmMessage = `고객 상태를 "${status}"로 변경하시겠습니까?`;
                      if (window.confirm(confirmMessage)) {
                        setCustomerStatus(status);
                      }
                    }
                  }}
                >
                  <div className="cim-step-indicator">
                    <span className="cim-step-number">{index + 1}</span>
                    {statusOptions.indexOf(customerStatus) > index && (
                      <span className="cim-step-check">✓</span>
                    )}
                  </div>
                  <span className="cim-step-label">{status}</span>
                  {index < statusOptions.length - 1 && (
                    <div className="cim-step-connector"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button className="cim-close-btn" onClick={handleCloseModal}>
            ×
          </button>
        </div>

        <div className="cim-modal-content">
          {/* 고객 정보 영역 */}
          <div className="cim-section">
            <h3 className="cim-section-title">고객 정보</h3>
            <div className="cim-field-grid">
              <div className="cim-field">
                <label>이름</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="cim-input"
                />
              </div>

              <div className="cim-field cim-phone-field">
                <label>연락처1</label>
                <div className="cim-phone-group">
                  <select
                    value={customerInfo.phone1Type}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        phone1Type: e.target.value,
                      }))
                    }
                    className="cim-select"
                  >
                    <option value="휴대폰">휴대폰</option>
                    <option value="집">집</option>
                    <option value="직장">직장</option>
                  </select>
                  <input
                    type="text"
                    value={customerInfo.phone1}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        phone1: e.target.value,
                      }))
                    }
                    className="cim-input"
                  />
                </div>
              </div>

              <div className="cim-field cim-phone-field">
                <label>연락처2</label>
                <div className="cim-phone-group">
                  <select
                    value={customerInfo.phone2Type}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        phone2Type: e.target.value,
                      }))
                    }
                    className="cim-select"
                  >
                    <option value="휴대폰">휴대폰</option>
                    <option value="집">집</option>
                    <option value="직장">직장</option>
                  </select>
                  <input
                    type="text"
                    value={customerInfo.phone2}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        phone2: e.target.value,
                      }))
                    }
                    className="cim-input"
                    placeholder="연락처를 입력하세요"
                  />
                </div>
              </div>

              <div className="cim-field cim-ssn-field">
                <label>주민등록번호</label>
                <div className="cim-ssn-group">
                  <input
                    type="text"
                    value={customerInfo.ssnFirst}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .substring(0, 6);
                      setCustomerInfo((prev) => ({ ...prev, ssnFirst: value }));
                    }}
                    className="cim-input"
                    placeholder="앞 6자리"
                    maxLength="6"
                  />
                  <span className="cim-ssn-separator">-</span>
                  <input
                    type="text"
                    value={customerInfo.ssnSecond}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .substring(0, 7);
                      setCustomerInfo((prev) => ({
                        ...prev,
                        ssnSecond: value,
                      }));
                    }}
                    className="cim-input"
                    placeholder="뒤 7자리"
                    maxLength="7"
                  />
                </div>
              </div>

              <div className="cim-field">
                <label>연령(만 나이)</label>
                <input
                  type="text"
                  value={customerInfo.age ? `${customerInfo.age}세` : ""}
                  readOnly
                  className="cim-input cim-readonly"
                  placeholder="주민등록번호 입력시 자동계산"
                />
              </div>

              <div className="cim-field">
                <label>직업</label>
                <input
                  type="text"
                  value={customerInfo.job}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      job: e.target.value,
                    }))
                  }
                  className="cim-input"
                  placeholder="직업을 입력하세요"
                />
              </div>

              {/* 메신저 계정 정보 */}
              <div className="cim-field cim-full-width">
                <label>메신저 계정 정보</label>
                <div className="cim-messenger-input">
                  <select
                    value={newMessenger.platform}
                    onChange={(e) => {
                      setNewMessenger((prev) => ({
                        ...prev,
                        platform: e.target.value,
                      }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        messenger: { ...prev.messenger, platform: false },
                      }));
                    }}
                    className={`cim-select ${
                      validationErrors.messenger.platform ? "cim-error" : ""
                    }`}
                  >
                    <option value="카카오톡">카카오톡</option>
                    <option value="텔레그램">텔레그램</option>
                    <option value="인스타그램">인스타그램</option>
                    <option value="라인">라인</option>
                    <option value="위챗">위챗</option>
                  </select>
                  <input
                    type="text"
                    value={newMessenger.accountId}
                    onChange={(e) => {
                      setNewMessenger((prev) => ({
                        ...prev,
                        accountId: e.target.value,
                      }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        messenger: { ...prev.messenger, accountId: false },
                      }));
                    }}
                    className={`cim-input ${
                      validationErrors.messenger.accountId ? "cim-error" : ""
                    }`}
                    placeholder="계정 ID를 입력하세요"
                  />
                  <button
                    onClick={handleAddMessenger}
                    className="cim-btn cim-btn-primary cim-btn-sm"
                  >
                    추가
                  </button>
                </div>
                <div className="cim-messenger-list">
                  {messengerAccounts.map((messenger) => (
                    <div key={messenger.id} className="cim-messenger-item">
                      <span className="cim-messenger-platform">
                        {messenger.platform}
                      </span>
                      <span className="cim-messenger-id">
                        {messenger.accountId}
                      </span>
                      <button
                        onClick={() => handleRemoveMessenger(messenger.id)}
                        className="cim-btn-delete cim-messenger-delete-btn"
                        title="메신저 계정 삭제"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 데이터 정보 영역 */}
          <div className="cim-section">
            <h3 className="cim-section-title">데이터 정보</h3>
            <div className="cim-field-grid">
              <div className="cim-field">
                <label>신청 경로</label>
                <input
                  type="text"
                  value={dataInfo.applicationRoute}
                  onChange={(e) =>
                    setDataInfo((prev) => ({
                      ...prev,
                      applicationRoute: e.target.value,
                    }))
                  }
                  className="cim-input"
                />
              </div>

              <div className="cim-field">
                <label>사이트</label>
                <input
                  type="text"
                  value={dataInfo.site}
                  onChange={(e) =>
                    setDataInfo((prev) => ({ ...prev, site: e.target.value }))
                  }
                  className="cim-input"
                />
              </div>

              <div className="cim-field">
                <label>매체사</label>
                <input
                  type="text"
                  value={dataInfo.mediaCompany}
                  onChange={(e) =>
                    setDataInfo((prev) => ({
                      ...prev,
                      mediaCompany: e.target.value,
                    }))
                  }
                  className="cim-input"
                />
              </div>

              <div className="cim-field">
                <label>신청시간</label>
                <input
                  type="text"
                  value={dataInfo.applicationTime}
                  readOnly
                  className="cim-input cim-readonly"
                />
              </div>

              <div className="cim-field">
                <label>배정시간</label>
                <input
                  type="text"
                  value={dataInfo.assignmentTime}
                  readOnly
                  className="cim-input cim-readonly"
                />
              </div>

              <div className="cim-field">
                <label>담당팀</label>
                <input
                  type="text"
                  value={dataInfo.assignedTeam}
                  readOnly
                  className="cim-input cim-readonly"
                />
              </div>

              <div className="cim-field">
                <label>담당자</label>
                <input
                  type="text"
                  value={dataInfo.assignedPerson}
                  readOnly
                  className="cim-input cim-readonly"
                />
              </div>

              <div className="cim-field cim-full-width">
                <label>특이사항</label>
                <textarea
                  value={dataInfo.specialNotes}
                  onChange={(e) =>
                    setDataInfo((prev) => ({
                      ...prev,
                      specialNotes: e.target.value,
                    }))
                  }
                  className="cim-textarea"
                  placeholder="특이사항을 입력하세요"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* 영업 정보 영역 */}
          <div className="cim-section">
            <h3 className="cim-section-title">영업 정보</h3>
            <div className="cim-field-grid">
              <div className="cim-field">
                <label>투자 정보</label>
                <input
                  type="text"
                  value={businessInfo.investmentInfo}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({
                      ...prev,
                      investmentInfo: e.target.value,
                    }))
                  }
                  className="cim-input"
                  placeholder="투자 정보를 입력하세요"
                />
              </div>

              <div className="cim-field">
                <label>투자 손익</label>
                <input
                  type="text"
                  value={businessInfo.investmentProfitLoss}
                  onChange={(e) => handleProfitLossChange(e.target.value)}
                  className="cim-input"
                  placeholder="0"
                />
              </div>

              <div className="cim-field">
                <label>투자 성향</label>
                <select
                  value={businessInfo.investmentTendency}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({
                      ...prev,
                      investmentTendency: e.target.value,
                    }))
                  }
                  className="cim-select"
                >
                  <option value="안정형">안정형</option>
                  <option value="안정추구형">안정추구형</option>
                  <option value="위험중립형">위험중립형</option>
                  <option value="적극투자형">적극투자형</option>
                  <option value="공격투자형">공격투자형</option>
                </select>
              </div>

              <div className="cim-field cim-full-width">
                <label>비고</label>
                <textarea
                  value={businessInfo.remarks}
                  onChange={(e) =>
                    setBusinessInfo((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  className="cim-textarea"
                  placeholder="비고를 입력하세요"
                  rows="3"
                />
              </div>
            </div>

            {/* 결제 내역 */}
            <div className="cim-subsection">
              <h4 className="cim-subsection-title">결제 내역</h4>
              <div className="cim-payment-input">
                <input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => {
                    setNewPayment((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      payment: { ...prev.payment, date: false },
                    }));
                  }}
                  className={`cim-input cim-date-input ${
                    validationErrors.payment.date ? "cim-error" : ""
                  }`}
                  placeholder="날짜 선택"
                />
                <input
                  type="text"
                  value={newPayment.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setNewPayment((prev) => ({
                      ...prev,
                      amount: formatNumber(value),
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      payment: { ...prev.payment, amount: false },
                    }));
                  }}
                  className={`cim-input ${
                    validationErrors.payment.amount ? "cim-error" : ""
                  }`}
                  placeholder="금액"
                />
                <select
                  value={newPayment.method}
                  onChange={(e) => {
                    setNewPayment((prev) => ({
                      ...prev,
                      method: e.target.value,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      payment: { ...prev.payment, method: false },
                    }));
                  }}
                  className={`cim-select ${
                    validationErrors.payment.method ? "cim-error" : ""
                  }`}
                >
                  <option value="카드">카드</option>
                  <option value="계좌이체">계좌이체</option>
                  <option value="현금">현금</option>
                  <option value="가상계좌">가상계좌</option>
                  <option value="페이팔">페이팔</option>
                </select>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => {
                    setNewPayment((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      payment: { ...prev.payment, description: false },
                    }));
                  }}
                  className={`cim-input ${
                    validationErrors.payment.description ? "cim-error" : ""
                  }`}
                  placeholder="설명"
                />
                <button
                  onClick={handleAddPayment}
                  className="cim-btn cim-btn-primary"
                >
                  추가
                </button>
              </div>
              <div className="cim-payment-list">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="cim-payment-item">
                    <span className="cim-payment-date">{payment.date}</span>
                    <span className="cim-payment-amount">
                      {payment.amount}원
                    </span>
                    <span className="cim-payment-method">{payment.method}</span>
                    <span className="cim-payment-desc">
                      {payment.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 일정 추가 */}
            <div className="cim-subsection">
              <h4 className="cim-subsection-title">일정 관리</h4>
              <div className="cim-schedule-input">
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => {
                    setNewSchedule((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, date: false },
                    }));
                  }}
                  className={`cim-input cim-date-input ${
                    validationErrors.schedule.date ? "cim-error" : ""
                  }`}
                  placeholder="날짜 선택"
                />
                <div
                  className={`cim-time-picker-v2 ${
                    validationErrors.schedule.hour ||
                    validationErrors.schedule.minute
                      ? "cim-error"
                      : ""
                  }`}
                >
                  <select
                    value={newSchedule.ampm}
                    onChange={(e) => {
                      setNewSchedule((prev) => ({
                        ...prev,
                        ampm: e.target.value,
                      }));
                    }}
                    className="cim-select cim-ampm-select"
                  >
                    <option value="오전">오전</option>
                    <option value="오후">오후</option>
                  </select>
                  <select
                    value={newSchedule.hour}
                    onChange={(e) => {
                      setNewSchedule((prev) => ({
                        ...prev,
                        hour: e.target.value,
                      }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        schedule: { ...prev.schedule, hour: false },
                      }));
                    }}
                    className="cim-select cim-time-select"
                  >
                    <option value="">시</option>
                    {generateHourOptions().map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <span className="cim-time-separator">:</span>
                  <select
                    value={newSchedule.minute}
                    onChange={(e) => {
                      setNewSchedule((prev) => ({
                        ...prev,
                        minute: e.target.value,
                      }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        schedule: { ...prev.schedule, minute: false },
                      }));
                    }}
                    className="cim-select cim-time-select"
                  >
                    <option value="">분</option>
                    {generateMinuteOptions().map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={newSchedule.content}
                  onChange={(e) => {
                    setNewSchedule((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, content: false },
                    }));
                  }}
                  className={`cim-input ${
                    validationErrors.schedule.content ? "cim-error" : ""
                  }`}
                  placeholder="일정 내용"
                />
                <button
                  onClick={handleAddSchedule}
                  className="cim-btn cim-btn-primary"
                >
                  추가
                </button>
              </div>
              <div className="cim-schedule-list">
                {schedules.map((schedule) => {
                  const timeInfo = convertTo12Hour(schedule.hour);
                  return (
                    <div key={schedule.id} className="cim-schedule-item">
                      <span className="cim-schedule-datetime">
                        {schedule.date} {timeInfo.ampm} {timeInfo.hour}:
                        {schedule.minute}
                      </span>
                      <span className="cim-schedule-content">
                        {schedule.content}
                      </span>
                      <button
                        onClick={() => handleRemoveSchedule(schedule.id)}
                        className="cim-btn-delete cim-schedule-delete-btn"
                        title="일정 삭제"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 상담 내용 기록 */}
            <div className="cim-subsection">
              <h4 className="cim-subsection-title">상담 내용 기록</h4>
              <div className="cim-consultation-input">
                <input
                  type="text"
                  value={newConsultation}
                  onChange={(e) => setNewConsultation(e.target.value)}
                  className="cim-input"
                  placeholder="상담 내용을 입력하세요..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleAddConsultation()
                  }
                />
                <button
                  onClick={handleAddConsultation}
                  className="cim-btn cim-btn-primary"
                >
                  추가
                </button>
              </div>
              <div className="cim-consultation-list">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="cim-consultation-item">
                    <div className="cim-consultation-meta">
                      <span className="cim-consultation-author">
                        {consultation.author}
                      </span>
                      <span className="cim-consultation-content-inline">
                        {consultation.content}
                      </span>
                      <span className="cim-consultation-timestamp">
                        {consultation.timestamp}
                      </span>
                      <button
                        onClick={() =>
                          handleRemoveConsultation(consultation.id)
                        }
                        className="cim-btn-delete cim-consultation-delete-btn"
                        title="상담 기록 삭제"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="cim-modal-footer">
          <button
            className="cim-btn cim-btn-secondary"
            onClick={handleCloseModal}
          >
            닫기
          </button>
          <button
            className="cim-btn cim-btn-assign"
            onClick={handleAssignmentClick}
          >
            배정하기
          </button>
          <button className="cim-btn cim-btn-primary">저장</button>
        </div>
      </div>

      {/* Customer Assignment Modal */}
      <CustomerAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        selectedCustomers={getSelectedCustomers()}
        currentUser={currentUser}
      />
    </div>
  );
};

export default CustomerInfoModal;
