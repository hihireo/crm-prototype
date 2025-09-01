import React, { useState, useEffect } from "react";
import "./EmployeeInfoModal.css";

const EmployeeInfoModal = ({
  isOpen,
  onClose,
  employee,
  user,
  employeeComments = {},
  onAddComment,
  onDeleteComment,
}) => {
  const [newComment, setNewComment] = useState("");
  const [editableInfo, setEditableInfo] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // 직원 상세 정보 데이터
  const employeeDetails = {
    1: {
      profileImage: "https://via.placeholder.com/80/4f46e5/ffffff?text=김",
      nickname: "영업왕",
      email: "kim.sales@company.com",
      phone: "010-1234-5678",
      realName: "김영업",
      birthDate: "1985-03-15",
      address: "마포",
      teamHistory: [
        {
          date: "2023-01-01",
          team: "A팀",
          position: "팀장",
        },
        {
          date: "2021-03-01",
          team: "B팀",
          position: "팀원",
        },
      ],
    },
    2: {
      profileImage: "https://via.placeholder.com/80/059669/ffffff?text=이",
      nickname: "마케터",
      email: "lee.marketing@company.com",
      phone: "010-2345-6789",
      realName: "이마케팅",
      birthDate: "1990-07-22",
      address: "마곡",
      teamHistory: [
        {
          date: "2022-06-01",
          team: "A팀",
          position: "팀원",
        },
      ],
    },
    3: {
      profileImage: "https://via.placeholder.com/80/dc2626/ffffff?text=박",
      nickname: "세일즈마스터",
      email: "park.sales@company.com",
      phone: "010-3456-7890",
      realName: "박세일즈",
      birthDate: "1983-11-08",
      address: "서울",
      teamHistory: [
        {
          date: "2020-01-01",
          team: "B팀",
          position: "팀장",
        },
        {
          date: "2018-03-01",
          team: "C팀",
          position: "팀원",
        },
      ],
    },
    4: {
      profileImage: "https://via.placeholder.com/80/7c3aed/ffffff?text=최",
      nickname: "고객지킴이",
      email: "choi.customer@company.com",
      phone: "010-4567-8901",
      realName: "최고객",
      birthDate: "1992-01-30",
      address: "김포",
      teamHistory: [
        {
          date: "2023-03-01",
          team: "B팀",
          position: "팀원",
        },
      ],
    },
    5: {
      profileImage: "https://via.placeholder.com/80/ea580c/ffffff?text=정",
      nickname: "상담전문가",
      email: "jung.consult@company.com",
      phone: "010-5678-9012",
      realName: "정상담",
      birthDate: "1987-09-12",
      address: "남양주",
      teamHistory: [
        {
          date: "2021-01-01",
          team: "C팀",
          position: "팀장",
        },
        {
          date: "2019-06-01",
          team: "A팀",
          position: "팀원",
        },
      ],
    },
    6: {
      profileImage: "https://via.placeholder.com/80/0891b2/ffffff?text=홍",
      nickname: "관리마스터",
      email: "hong.admin@company.com",
      phone: "010-6789-0123",
      realName: "홍관리",
      birthDate: "1994-05-18",
      address: "일산",
      teamHistory: [
        {
          date: "2022-09-01",
          team: "C팀",
          position: "팀원",
        },
      ],
    },
  };

  const details = employee ? employeeDetails[employee.id] : null;

  // 수정 가능한 정보 초기화
  useEffect(() => {
    if (details) {
      setEditableInfo({
        realName: details.realName,
        birthDate: details.birthDate,
        address: details.address,
      });
      setHasChanges(false);
    }
  }, [details]);

  // 권한 체크 함수
  const canViewPrivateInfo = () => {
    // return user.role === "admin" || user.position === "팀장";
    return true;
  };

  if (!isOpen || !employee) return null;

  // 입력 변경 핸들러
  const handleInputChange = (field, value) => {
    setEditableInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 변경사항 체크
    const hasChanged =
      value !== details[field] ||
      editableInfo.realName !== details.realName ||
      editableInfo.birthDate !== details.birthDate ||
      editableInfo.address !== details.address;

    setHasChanges(hasChanged);
  };

  // 저장 함수
  const handleSave = () => {
    console.log("직원 정보 저장:", employee.id, editableInfo);
    // 실제로는 서버에 저장 요청
    setHasChanges(false);
    alert("정보가 저장되었습니다.");
  };

  // 댓글 추가 함수
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      author: user.name,
      createdAt: new Date().toLocaleString("ko-KR"),
    };

    onAddComment(employee.id, comment);
    setNewComment("");
  };

  // 댓글 삭제 함수
  const handleDeleteComment = (commentId) => {
    onDeleteComment(employee.id, commentId);
  };

  const currentComments = employeeComments[employee.id] || [];

  return (
    <div className="empinfo-modal-overlay" onClick={onClose}>
      <div
        className="empinfo-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="empinfo-modal-header">
          <h2>👤 직원 정보</h2>
          <button className="empinfo-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="empinfo-modal-body">
          {/* 퍼블릭 영역 */}
          <div className="empinfo-public-section">
            <h3>👥 기본 정보</h3>
            <div className="empinfo-public-content">
              <div className="empinfo-profile-section">
                <div className="empinfo-avatar">{employee.name.charAt(0)}</div>
                <div className="empinfo-profile-info">
                  <div className="empinfo-field">
                    <label>닉네임</label>
                    <span>{details?.nickname}</span>
                  </div>
                  <div className="empinfo-field">
                    <label>팀</label>
                    <span>{employee.team}</span>
                  </div>
                </div>
              </div>

              <div className="empinfo-contact-section">
                <div className="empinfo-field">
                  <label>이메일</label>
                  <span>{details?.email}</span>
                </div>
                <div className="empinfo-field">
                  <label>연락처</label>
                  <span>{details?.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 관리자/팀장 전용 영역 */}
          {canViewPrivateInfo() && (
            <div className="empinfo-private-section">
              <h3>🔒 관리자 정보</h3>
              <div className="empinfo-private-content">
                <div className="empinfo-personal-info">
                  <div className="empinfo-editable-section">
                    <div className="empinfo-editable-field">
                      <label>실명</label>
                      <input
                        type="text"
                        value={editableInfo.realName || ""}
                        onChange={(e) =>
                          handleInputChange("realName", e.target.value)
                        }
                        className="empinfo-editable-input"
                      />
                    </div>
                    <div className="empinfo-editable-field">
                      <label>생년월일</label>
                      <input
                        type="date"
                        value={editableInfo.birthDate || ""}
                        onChange={(e) =>
                          handleInputChange("birthDate", e.target.value)
                        }
                        className="empinfo-editable-input"
                      />
                    </div>
                    <div className="empinfo-editable-field">
                      <label>주소</label>
                      <input
                        type="text"
                        value={editableInfo.address || ""}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="empinfo-editable-input"
                      />
                    </div>
                    <div className="empinfo-save-section">
                      <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="empinfo-save-btn"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                </div>

                {/* 팀 변경 이력 */}
                <div className="empinfo-team-history">
                  <h4>📋 팀 변경 이력</h4>
                  <div className="empinfo-history-list">
                    {details?.teamHistory.map((history, index) => (
                      <div key={index} className="empinfo-history-item">
                        <div className="empinfo-history-date">
                          {history.date}
                        </div>
                        <div className="empinfo-history-team">
                          {history.team}
                        </div>
                        <div className="empinfo-history-position">
                          {history.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 특이사항 댓글 */}
                <div className="empinfo-comments-section">
                  <h4>💬 특이사항</h4>
                  <div className="empinfo-comments-list">
                    {currentComments.map((comment) => (
                      <div key={comment.id} className="empinfo-comment-item">
                        <div className="empinfo-comment-header">
                          <span className="empinfo-comment-author">
                            {comment.author}
                          </span>
                          <span className="empinfo-comment-date">
                            {comment.createdAt}
                          </span>
                          <button
                            className="empinfo-comment-delete"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            삭제
                          </button>
                        </div>
                        <div className="empinfo-comment-text">
                          {comment.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="empinfo-comment-form">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="특이사항을 입력하세요..."
                      className="empinfo-comment-textarea"
                      rows="3"
                    />
                    <button
                      onClick={handleAddComment}
                      className="empinfo-comment-submit"
                      disabled={!newComment.trim()}
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfoModal;
