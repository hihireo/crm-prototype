import React, { useState } from "react";
import "./GlobalEmployeeModal.css";

const GlobalEmployeeModal = ({
  isOpen,
  onClose,
  employee,
  user,
  showTeamManagement = false,
  showSubordinates = false,
  subordinates = [],
  onCreateTeam,
  onRemoveTeam,
  TreeNodeComponent = null,
  treeNodeProps = {},
}) => {
  const [activeTab, setActiveTab] = useState("organization");

  if (!isOpen || !employee) return null;

  // 권한 체크 함수
  const canViewPrivateInfo = () => {
    return user?.role === "admin" || user?.position === "팀장" || true; // 임시로 true
  };

  // 팀 생성/제거 가능 여부
  const canManageTeam =
    showTeamManagement && (user?.role === "admin" || user?.position === "팀장");

  return (
    <div className="global-emp-modal-overlay" onClick={onClose}>
      <div
        className="global-emp-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="global-emp-modal-header">
          <h4>직원 정보</h4>
          <button className="global-emp-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="global-emp-modal-body">
          {/* 기본 정보 */}
          <div className="global-emp-info-section">
            <div className="global-emp-avatar-large">
              {employee.photo ? (
                <img
                  src={employee.photo}
                  alt={employee.displayName || employee.name}
                  className="global-emp-profile-photo"
                />
              ) : (
                (employee.displayName || employee.name).charAt(0)
              )}
            </div>
            <div className="global-emp-details">
              <h3>{employee.displayName || employee.name}</h3>
              <p className="global-emp-email">{employee.email}</p>
              <p className="global-emp-phone">{employee.phone}</p>
              {employee.teamName && (
                <p className="global-emp-team-name">팀: {employee.teamName}</p>
              )}
            </div>
          </div>

          {/* 팀 관리 섹션 */}
          {canManageTeam && (
            <div
              className={`global-emp-team-management ${
                employee.type === "member" ? "center-layout" : ""
              }`}
            >
              {employee.type === "team" && employee.teamName && (
                <div className="global-emp-team-info-left">
                  <h4 className="global-emp-team-name-display">
                    {employee.leaderName || "팀장"} ({employee.teamName})
                  </h4>
                </div>
              )}
              <div className="global-emp-team-actions-right">
                {employee.type === "member" ? (
                  <button
                    className="global-emp-btn global-emp-btn-primary"
                    onClick={() => onCreateTeam && onCreateTeam(employee.id)}
                  >
                    팀 생성
                  </button>
                ) : (
                  <button
                    className={`global-emp-btn global-emp-btn-danger ${
                      subordinates.length > 0 ? "disabled" : ""
                    }`}
                    disabled={subordinates.length > 0}
                    onClick={() => onRemoveTeam && onRemoveTeam(employee.id)}
                  >
                    팀 제거
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 탭 네비게이션 */}
          <div className="global-emp-modal-tabs">
            <button
              className={`global-emp-modal-tab ${
                activeTab === "organization" ? "active" : ""
              }`}
              onClick={() => setActiveTab("organization")}
            >
              예하 조직
            </button>
            <button
              className={`global-emp-modal-tab ${
                activeTab === "admin" ? "active" : ""
              }`}
              onClick={() => setActiveTab("admin")}
            >
              관리자 정보
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="global-emp-tab-content">
            {activeTab === "organization" && (
              <div className="global-emp-subordinates-section">
                <h5>예하 조직</h5>
                {showSubordinates && subordinates.length > 0 ? (
                  <div className="global-emp-subordinates-tree-container">
                    {TreeNodeComponent &&
                      subordinates.map((subordinate) => (
                        <TreeNodeComponent
                          key={subordinate.id}
                          node={subordinate}
                          depth={0}
                          {...treeNodeProps}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="global-emp-sample-subordinates">
                    <div className="sample-tree-node">
                      <div className="sample-node-content">
                        <div className="sample-node-info">
                          <div className="sample-member-node-compact">
                            <div className="sample-member-thumbnail">김</div>
                            <div className="sample-member-name">김팀원</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sample-tree-node">
                      <div className="sample-node-content">
                        <div className="sample-node-info">
                          <div className="sample-member-node-compact">
                            <div className="sample-member-thumbnail">이</div>
                            <div className="sample-member-name">이사원</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sample-tree-node">
                      <div className="sample-node-content">
                        <div className="sample-node-info">
                          <div className="sample-member-node-compact">
                            <div className="sample-member-thumbnail">박</div>
                            <div className="sample-member-name">박신입</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 관리자 정보 탭 */}
            {activeTab === "admin" && (
              <div className="global-emp-admin-info-section">
                <h5>관리자 정보</h5>
                <div className="global-emp-admin-info-content">
                  <div className="global-emp-admin-personal-info">
                    <div className="global-emp-admin-field">
                      <label>실명</label>
                      <span>{employee.displayName || employee.name}</span>
                    </div>
                    <div className="global-emp-admin-field">
                      <label>생년월일</label>
                      <span>{employee.birthDate || "1990-01-01"}</span>
                    </div>
                    <div className="global-emp-admin-field">
                      <label>주소</label>
                      <span>{employee.address || "서울시 강남구"}</span>
                    </div>
                    <div className="global-emp-admin-field">
                      <label>직책</label>
                      <span>
                        {employee.position || employee.leaderPosition || "직원"}
                      </span>
                    </div>
                    <div className="global-emp-admin-field">
                      <label>입사일</label>
                      <span>{employee.joinDate || "2023-01-01"}</span>
                    </div>
                  </div>

                  <div className="global-emp-admin-team-history">
                    <h6>팀 변경 이력</h6>
                    <div className="global-emp-history-list">
                      <div className="global-emp-history-item">
                        <span className="global-emp-history-date">
                          2023-01-01
                        </span>
                        <span className="global-emp-history-team">
                          {employee.teamName || employee.team || "현재 팀"}
                        </span>
                        <span className="global-emp-history-position">
                          {employee.position ||
                            employee.leaderPosition ||
                            "현재 직책"}
                        </span>
                      </div>
                      <div className="global-emp-history-item">
                        <span className="global-emp-history-date">
                          2022-06-01
                        </span>
                        <span className="global-emp-history-team">이전 팀</span>
                        <span className="global-emp-history-position">
                          이전 직책
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="global-emp-admin-comments">
                    <h6>특이사항</h6>
                    <div className="global-emp-comments-list">
                      <div className="global-emp-comment-item">
                        <div className="global-emp-comment-header">
                          <span className="global-emp-comment-author">
                            관리자
                          </span>
                          <span className="global-emp-comment-date">
                            2024-01-15
                          </span>
                        </div>
                        <div className="global-emp-comment-text">
                          성실하고 책임감이 강한 직원입니다.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalEmployeeModal;
