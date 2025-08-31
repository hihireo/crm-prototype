import React, { useState } from "react";
import "./CustomerRegistrationModal.css";

const CustomerRegistrationModal = ({ isOpen, onClose, onRegister }) => {
  // 고객 기본 정보 상태
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone1Type: "휴대폰",
    phone1: "",
    phone2Type: "집",
    phone2: "",
    ssnFirst: "",
    ssnSecond: "",
    age: "",
    job: "",
  });

  // 데이터 정보 상태
  const [dataInfo, setDataInfo] = useState({
    applicationRoute: "",
    site: "직원명", // 고정값으로 표시
    mediaCompany: "TalkGate", // 고정값
    specialNotes: "", // 특이사항
  });

  // 메신저 계정 정보 상태
  const [messengerAccounts, setMessengerAccounts] = useState([]);
  const [newMessenger, setNewMessenger] = useState({
    platform: "카카오톡",
    accountId: "",
  });

  // 폼 유효성 검사 상태
  const [errors, setErrors] = useState({});

  // 메신저 계정 추가
  const addMessenger = () => {
    if (newMessenger.accountId.trim()) {
      setMessengerAccounts([
        ...messengerAccounts,
        {
          id: Date.now(),
          platform: newMessenger.platform,
          accountId: newMessenger.accountId,
        },
      ]);
      setNewMessenger({ platform: "카카오톡", accountId: "" });
    }
  };

  // 메신저 계정 삭제
  const removeMessenger = (id) => {
    setMessengerAccounts(messengerAccounts.filter((msg) => msg.id !== id));
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }

    if (!customerInfo.phone1.trim()) {
      newErrors.phone1 = "연락처를 입력해주세요";
    } else if (!/^[0-9-]+$/.test(customerInfo.phone1)) {
      newErrors.phone1 = "올바른 연락처 형식을 입력해주세요";
    }

    if (customerInfo.ssnFirst && customerInfo.ssnSecond) {
      if (!/^[0-9]{6}$/.test(customerInfo.ssnFirst)) {
        newErrors.ssnFirst = "주민번호 앞자리를 올바르게 입력해주세요";
      }
      if (!/^[0-9]{7}$/.test(customerInfo.ssnSecond)) {
        newErrors.ssnSecond = "주민번호 뒷자리를 올바르게 입력해주세요";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 고객 등록 처리
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const newCustomer = {
        id: Date.now(),
        ...customerInfo,
        ...dataInfo,
        messengerAccounts,
        status: "대기",
        applicationTime: new Date().toISOString(),
        assignmentTime: null,
        assignedTeam: null,
        assignedPerson: null,
        consultations: [],
        paymentHistory: [],
        schedules: [],
        createdAt: new Date().toISOString(),
      };

      onRegister(newCustomer);
      onClose();

      // 폼 초기화
      setCustomerInfo({
        name: "",
        phone1Type: "휴대폰",
        phone1: "",
        phone2Type: "집",
        phone2: "",
        ssnFirst: "",
        ssnSecond: "",
        age: "",
        job: "",
      });
      setDataInfo({
        applicationRoute: "",
        site: "직원명",
        mediaCompany: "TalkGate",
        specialNotes: "",
      });
      setMessengerAccounts([]);
      setErrors({});
    }
  };

  // 모달 닫기
  const handleClose = () => {
    onClose();
    // 폼 초기화
    setCustomerInfo({
      name: "",
      phone1Type: "휴대폰",
      phone1: "",
      phone2Type: "집",
      phone2: "",
      ssnFirst: "",
      ssnSecond: "",
      age: "",
      job: "",
    });
    setDataInfo({
      applicationRoute: "",
      site: "직원명",
      mediaCompany: "TalkGate",
      specialNotes: "",
    });
    setMessengerAccounts([]);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="crm-modal-overlay" onClick={handleClose}>
      <div className="crm-customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h2 className="crm-title">고객 등록</h2>
          <button className="crm-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="crm-modal-content">
            {/* 기본 정보 영역 */}
            <div className="crm-section">
              <h3 className="crm-section-title">기본 정보</h3>
              <div className="crm-field-grid">
                <div className="crm-field">
                  <label className="crm-required">이름</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className={`crm-input ${
                      errors.name ? "crm-input-error" : ""
                    }`}
                    placeholder="고객 이름을 입력하세요"
                  />
                  {errors.name && (
                    <span className="crm-error-message">{errors.name}</span>
                  )}
                </div>

                <div className="crm-field crm-phone-field">
                  <label className="crm-required">연락처1</label>
                  <div className="crm-phone-group">
                    <select
                      value={customerInfo.phone1Type}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          phone1Type: e.target.value,
                        }))
                      }
                      className="crm-select"
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
                      className={`crm-input ${
                        errors.phone1 ? "crm-input-error" : ""
                      }`}
                      placeholder="010-1234-5678"
                    />
                  </div>
                  {errors.phone1 && (
                    <span className="crm-error-message">{errors.phone1}</span>
                  )}
                </div>

                <div className="crm-field crm-phone-field">
                  <label>연락처2</label>
                  <div className="crm-phone-group">
                    <select
                      value={customerInfo.phone2Type}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          phone2Type: e.target.value,
                        }))
                      }
                      className="crm-select"
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
                      className="crm-input"
                      placeholder="선택사항"
                    />
                  </div>
                </div>

                <div className="crm-field crm-ssn-field">
                  <label>주민등록번호</label>
                  <div className="crm-ssn-group">
                    <input
                      type="text"
                      value={customerInfo.ssnFirst}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          ssnFirst: e.target.value,
                        }))
                      }
                      className={`crm-input ${
                        errors.ssnFirst ? "crm-input-error" : ""
                      }`}
                      placeholder="123456"
                      maxLength="6"
                    />
                    <span className="crm-ssn-separator">-</span>
                    <input
                      type="password"
                      value={customerInfo.ssnSecond}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          ssnSecond: e.target.value,
                        }))
                      }
                      className={`crm-input ${
                        errors.ssnSecond ? "crm-input-error" : ""
                      }`}
                      placeholder="1234567"
                      maxLength="7"
                    />
                  </div>
                  {errors.ssnFirst && (
                    <span className="crm-error-message">{errors.ssnFirst}</span>
                  )}
                  {errors.ssnSecond && (
                    <span className="crm-error-message">
                      {errors.ssnSecond}
                    </span>
                  )}
                </div>

                <div className="crm-field">
                  <label>연령</label>
                  <input
                    type="number"
                    value={customerInfo.age}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        age: e.target.value,
                      }))
                    }
                    className="crm-input"
                    placeholder="연령"
                    min="1"
                    max="120"
                  />
                </div>

                <div className="crm-field">
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
                    className="crm-input"
                    placeholder="직업을 입력하세요"
                  />
                </div>
              </div>

              {/* 메신저 계정 관리 */}
              <div className="crm-messenger-section">
                <h4 className="crm-messenger-title">메신저 계정</h4>
                <div className="crm-messenger-input">
                  <div className="crm-messenger-group">
                    <select
                      value={newMessenger.platform}
                      onChange={(e) =>
                        setNewMessenger((prev) => ({
                          ...prev,
                          platform: e.target.value,
                        }))
                      }
                      className="crm-select"
                    >
                      <option value="카카오톡">카카오톡</option>
                      <option value="텔레그램">텔레그램</option>
                      <option value="라인">라인</option>
                      <option value="위챗">위챗</option>
                      <option value="기타">기타</option>
                    </select>
                    <input
                      type="text"
                      value={newMessenger.accountId}
                      onChange={(e) =>
                        setNewMessenger((prev) => ({
                          ...prev,
                          accountId: e.target.value,
                        }))
                      }
                      className="crm-input"
                      placeholder="계정 ID를 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={addMessenger}
                      className="crm-add-btn"
                    >
                      추가
                    </button>
                  </div>
                </div>

                {messengerAccounts.length > 0 && (
                  <div className="crm-messenger-list">
                    {messengerAccounts.map((msg) => (
                      <div key={msg.id} className="crm-messenger-item">
                        <span className="crm-messenger-platform">
                          {msg.platform}
                        </span>
                        <span className="crm-messenger-account">
                          {msg.accountId}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMessenger(msg.id)}
                          className="crm-remove-btn"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 데이터 정보 영역 */}
            <div className="crm-section">
              <h3 className="crm-section-title">데이터 정보</h3>
              <div className="crm-field-grid">
                <div className="crm-field">
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
                    className="crm-input"
                    placeholder="신청 경로를 입력하세요"
                  />
                </div>

                <div className="crm-field">
                  <label>사이트</label>
                  <input
                    type="text"
                    value={dataInfo.site}
                    className="crm-input crm-input-readonly"
                    readOnly
                    placeholder="직원명"
                  />
                </div>

                <div className="crm-field">
                  <label>매체사</label>
                  <input
                    type="text"
                    value={dataInfo.mediaCompany}
                    className="crm-input crm-input-readonly"
                    readOnly
                  />
                </div>

                <div className="crm-field crm-special-notes-field">
                  <label>특이사항</label>
                  <textarea
                    value={dataInfo.specialNotes}
                    onChange={(e) =>
                      setDataInfo((prev) => ({
                        ...prev,
                        specialNotes: e.target.value,
                      }))
                    }
                    className="crm-textarea"
                    placeholder="특이사항을 입력하세요"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="crm-modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="crm-cancel-btn"
            >
              취소
            </button>
            <button type="submit" className="crm-submit-btn">
              고객 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerRegistrationModal;
