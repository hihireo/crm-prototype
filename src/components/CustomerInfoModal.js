import React, { useState } from "react";
import "./CustomerInfoModal.css";

const CustomerInfoModal = ({ isOpen, onClose, customerData }) => {
  const [memos, setMemos] = useState(
    customerData?.memos || [
      {
        id: 1,
        author: "박직원",
        content: "연락했으나 부재 중",
        timestamp: "2025-08-18 14:40:09",
      },
      {
        id: 2,
        author: "박직원",
        content: "열흘 후에 다시 연락하려고 합니다.",
        timestamp: "2025-08-08 14:42:38",
      },
    ]
  );

  const [consultations, setConsultations] = useState(
    customerData?.consultations || [
      {
        id: 1,
        author: "박직원",
        content: "텔레 방은 입장하겠다고 해서 텔레 닉네임 남겨달라고 함",
        timestamp: "2025-07-28 14:07:07",
      },
      {
        id: 2,
        author: "박직원",
        content:
          "보유 종목은 없고 아직 여유자금이 없어서 투자 준비 중이라고 함",
        timestamp: "2025-07-28 14:06:57",
      },
    ]
  );

  const [newMemo, setNewMemo] = useState("");
  const [newConsultation, setNewConsultation] = useState("");

  if (!isOpen || !customerData) return null;

  const handleAddMemo = () => {
    if (newMemo.trim()) {
      const memo = {
        id: Date.now(),
        author: "박직원", // 현재 사용자로 설정
        content: newMemo.trim(),
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
      setMemos((prev) => [memo, ...prev]);
      setNewMemo("");
    }
  };

  const handleAddConsultation = () => {
    if (newConsultation.trim()) {
      const consultation = {
        id: Date.now(),
        author: "박직원", // 현재 사용자로 설정
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

  const handleKeyPress = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "memo") {
        handleAddMemo();
      } else if (type === "consultation") {
        handleAddConsultation();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>고객 정보</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="customer-info-modal-content">
          <div className="customer-info-grid">
            {/* 기본 정보 */}
            <div className="info-section">
              <h3>기본 정보</h3>
              <div className="info-grid">
                <div className="info-field">
                  <label>신청자</label>
                  <span>{customerData.name || "홍길동"}</span>
                </div>
                <div className="info-field">
                  <label>연락처</label>
                  <div className="phone-group">
                    <select defaultValue="선택하세요">
                      <option>선택하세요</option>
                      <option>휴대폰</option>
                      <option>집전화</option>
                    </select>
                    <input
                      type="text"
                      defaultValue={customerData.phone || "01024724343"}
                    />
                  </div>
                </div>
                <div className="info-field">
                  <label>연령</label>
                  <input type="text" defaultValue={customerData.age || ""} />
                </div>
                <div className="info-field">
                  <label>소유 유무</label>
                  <div className="checkbox-group">
                    <label>
                      <input type="checkbox" /> 차용차
                    </label>
                    <label>
                      <input type="checkbox" /> 전
                    </label>
                    <label>
                      <input type="checkbox" /> 신용카드
                    </label>
                    <label>
                      <input type="checkbox" /> 연체
                    </label>
                    <label>
                      <input type="checkbox" /> 담보
                    </label>
                  </div>
                </div>
                <div className="info-field">
                  <label>직업</label>
                  <select defaultValue="선택하세요">
                    <option>선택하세요</option>
                    <option>직장인</option>
                    <option>사업자</option>
                    <option>기타</option>
                  </select>
                </div>
                <div className="info-field">
                  <label>신청경로</label>
                  <span>Y</span>
                </div>
                <div className="info-field">
                  <label>사이트</label>
                  <span>S2</span>
                </div>
                <div className="info-field">
                  <label>담당팀</label>
                  <select defaultValue="휴쳤츠">
                    <option>영업1지점</option>
                    <option>영업2지점</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="info-section">
              <h3>추가 정보</h3>
              <div className="info-grid">
                <div className="info-field">
                  <label>주민등록번호</label>
                  <input type="text" defaultValue={customerData.ssn || ""} />
                </div>
                <div className="info-field">
                  <label>신분증</label>
                  <select defaultValue="선택하세요">
                    <option>선택하세요</option>
                    <option>주민등록증</option>
                    <option>운전면허증</option>
                    <option>여권</option>
                  </select>
                </div>
                <div className="info-field">
                  <label>근무처</label>
                  <input
                    type="text"
                    defaultValue={customerData.workplace || "근무처별"}
                  />
                </div>
                <div className="info-field">
                  <label>투자 종목</label>
                  <input type="text" defaultValue="" />
                </div>
                <div className="info-field">
                  <label>코드</label>
                  <input type="text" defaultValue="" />
                </div>
                <div className="info-field">
                  <label>매체사</label>
                  <span>광고</span>
                </div>
                <div className="info-field">
                  <label>처리상태</label>
                  <select defaultValue="관리">
                    <option>관리</option>
                    <option>진행중</option>
                    <option>완료</option>
                  </select>
                </div>
                <div className="info-field">
                  <label>담당자</label>
                  <select defaultValue="박직원">
                    <option>박직원</option>
                    <option>김철수</option>
                    <option>이영희</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 메모 섹션 */}
          <div className="memo-section">
            <h3>메모</h3>
            <div className="memo-input">
              <input
                type="text"
                placeholder="메모를 입력하세요..."
                value={newMemo}
                onChange={(e) => setNewMemo(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, "memo")}
              />
              <button onClick={handleAddMemo}>추가</button>
            </div>
            <div className="memo-list">
              {memos.map((memo) => (
                <div key={memo.id} className="memo-item">
                  <div className="memo-header">
                    <span className="memo-author">{memo.author}</span>
                    <span className="memo-date">{memo.timestamp}</span>
                  </div>
                  <div className="memo-content">{memo.content}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 상담 작성 섹션 */}
          <div className="consultation-section">
            <h3>상담 작성</h3>
            <div className="consultation-input">
              <input
                type="text"
                placeholder="상담 내용을 입력하세요..."
                value={newConsultation}
                onChange={(e) => setNewConsultation(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, "consultation")}
              />
              <button onClick={handleAddConsultation}>추가</button>
            </div>
            <div className="consultation-list">
              {consultations.map((consultation) => (
                <div key={consultation.id} className="consultation-item">
                  <div className="consultation-header">
                    <span className="consultation-author">
                      {consultation.author}
                    </span>
                    <span className="consultation-date">
                      {consultation.timestamp}
                    </span>
                  </div>
                  <div className="consultation-content">
                    {consultation.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            닫기
          </button>
          <button className="btn btn-primary">저장</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoModal;
