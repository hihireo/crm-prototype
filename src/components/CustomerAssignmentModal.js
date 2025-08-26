import React, { useState, useEffect, useMemo } from "react";
import "./CustomerAssignmentModal.css";

const CustomerAssignmentModal = ({
  isOpen,
  onClose,
  selectedCustomers,
  currentUser: initialUser,
}) => {
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [assignmentType, setAssignmentType] = useState("team"); // 'team' or 'member'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [filteredMembers, setFilteredMembers] = useState([]);

  // 샘플 조직 데이터
  const organizationData = useMemo(
    () => ({
      teams: [
        { id: 1, name: "영업1팀", leader: "박팀장", memberCount: 4 },
        { id: 2, name: "영업2팀", leader: "한팀장", memberCount: 3 },
        { id: 3, name: "마케팅팀", leader: "김마케팅", memberCount: 5 },
        { id: 4, name: "개발팀", leader: "정개발", memberCount: 6 },
        { id: 5, name: "디자인팀", leader: "이디자인", memberCount: 3 },
        { id: 6, name: "기획팀", leader: "최기획", memberCount: 4 },
        { id: 7, name: "운영팀", leader: "신운영", memberCount: 2 },
      ],
      allMembers: [
        // 영업1팀
        { id: 1, name: "김영업", team: "영업1팀", teamId: 1, role: "팀원" },
        { id: 2, name: "이세일즈", team: "영업1팀", teamId: 1, role: "팀원" },
        { id: 3, name: "박고객", team: "영업1팀", teamId: 1, role: "팀장" },
        { id: 4, name: "조영업", team: "영업1팀", teamId: 1, role: "팀원" },
        { id: 5, name: "강세일즈", team: "영업1팀", teamId: 1, role: "팀원" },

        // 영업2팀
        { id: 6, name: "최영업", team: "영업2팀", teamId: 2, role: "팀원" },
        { id: 7, name: "정세일즈", team: "영업2팀", teamId: 2, role: "팀원" },
        { id: 8, name: "한고객", team: "영업2팀", teamId: 2, role: "팀장" },
        { id: 9, name: "윤영업", team: "영업2팀", teamId: 2, role: "팀원" },

        // 마케팅팀
        { id: 10, name: "김마케팅", team: "마케팅팀", teamId: 3, role: "팀장" },
        { id: 11, name: "이광고", team: "마케팅팀", teamId: 3, role: "팀원" },
        { id: 12, name: "박홍보", team: "마케팅팀", teamId: 3, role: "팀원" },
        { id: 13, name: "송브랜드", team: "마케팅팀", teamId: 3, role: "팀원" },
        { id: 14, name: "류컨텐츠", team: "마케팅팀", teamId: 3, role: "팀원" },
        {
          id: 15,
          name: "장퍼포먼스",
          team: "마케팅팀",
          teamId: 3,
          role: "팀원",
        },

        // 개발팀
        { id: 16, name: "정개발", team: "개발팀", teamId: 4, role: "팀장" },
        { id: 17, name: "김프론트", team: "개발팀", teamId: 4, role: "팀원" },
        { id: 18, name: "이백엔드", team: "개발팀", teamId: 4, role: "팀원" },
        { id: 19, name: "박풀스택", team: "개발팀", teamId: 4, role: "팀원" },
        { id: 20, name: "최모바일", team: "개발팀", teamId: 4, role: "팀원" },
        { id: 21, name: "서DevOps", team: "개발팀", teamId: 4, role: "팀원" },
        { id: 22, name: "안QA", team: "개발팀", teamId: 4, role: "팀원" },

        // 디자인팀
        { id: 23, name: "이디자인", team: "디자인팀", teamId: 5, role: "팀장" },
        { id: 24, name: "김UI", team: "디자인팀", teamId: 5, role: "팀원" },
        { id: 25, name: "박UX", team: "디자인팀", teamId: 5, role: "팀원" },
        { id: 26, name: "정그래픽", team: "디자인팀", teamId: 5, role: "팀원" },

        // 기획팀
        { id: 27, name: "최기획", team: "기획팀", teamId: 6, role: "팀장" },
        { id: 28, name: "김서비스", team: "기획팀", teamId: 6, role: "팀원" },
        { id: 29, name: "이비즈", team: "기획팀", teamId: 6, role: "팀원" },
        { id: 30, name: "박전략", team: "기획팀", teamId: 6, role: "팀원" },
        { id: 31, name: "조분석", team: "기획팀", teamId: 6, role: "팀원" },

        // 운영팀
        { id: 32, name: "신운영", team: "운영팀", teamId: 7, role: "팀장" },
        { id: 33, name: "오CS", team: "운영팀", teamId: 7, role: "팀원" },
        { id: 34, name: "구관리", team: "운영팀", teamId: 7, role: "팀원" },
      ],
    }),
    []
  );

  const getCustomerDisplayText = () => {
    if (!selectedCustomers || selectedCustomers.length === 0) return "";

    if (selectedCustomers.length === 1) {
      return selectedCustomers[0].name;
    }
    return `${selectedCustomers.length}명`;
  };

  // 초기화 및 모드 변경 시 실행
  useEffect(() => {
    setSelectedAssignee(null);
    setSelectedTeam(null);
    setFilteredMembers([]);

    if (currentUser.role === "팀장") {
      // 팀장 모드: 자신의 팀 자동 선택
      const userTeam = organizationData.teams.find(
        (team) => team.name === currentUser.team
      );
      if (userTeam) {
        setSelectedTeam(userTeam);
        setSelectedAssignee(userTeam);
        setAssignmentType("team");
        // 자신의 팀원만 필터링 (팀장 제외)
        const teamMembers = organizationData.allMembers.filter(
          (member) => member.teamId === userTeam.id && member.role === "팀원"
        );
        setFilteredMembers(teamMembers);
      }
    } else {
      // 관리자 모드: 모든 팀원 표시
      setFilteredMembers(organizationData.allMembers);
    }
  }, [currentUser, organizationData]);

  // 팀 선택 시 해당 팀원들 필터링
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setSelectedAssignee(team);
    setAssignmentType("team");

    // 선택된 팀의 팀원만 표시 (팀장 제외)
    const teamMembers = organizationData.allMembers.filter(
      (member) => member.teamId === team.id && member.role === "팀원"
    );
    setFilteredMembers(teamMembers);
  };

  // 테스트용 모드 전환
  const toggleUserMode = () => {
    if (currentUser.role === "관리자") {
      setCurrentUser({
        name: "박고객",
        role: "팀장",
        team: "영업1팀",
      });
    } else {
      setCurrentUser({
        name: "김관리자",
        role: "관리자",
        team: "전체",
      });
    }
  };

  const getAssignmentDescription = () => {
    if (!selectedAssignee) return "";

    const customerText = getCustomerDisplayText();
    const isMultiple = selectedCustomers.length > 1;

    if (assignmentType === "team") {
      return isMultiple
        ? `고객 ${customerText}을 ${selectedAssignee.name}에게 배정합니다.`
        : `${customerText} 고객을 ${selectedAssignee.name}에게 배정합니다.`;
    } else {
      return isMultiple
        ? `고객 ${customerText}을 ${selectedAssignee.name} 팀원에게 배정합니다.`
        : `${customerText} 고객을 ${selectedAssignee.name} 팀원에게 배정합니다.`;
    }
  };

  const handleAssign = () => {
    if (!selectedAssignee) {
      alert("배정할 대상을 선택해주세요.");
      return;
    }

    // 팀장 모드에서는 반드시 팀원을 선택해야 함
    if (currentUser.role === "팀장" && assignmentType === "team") {
      alert("팀원을 선택해주세요.");
      return;
    }

    // 실제로는 서버에 배정 요청
    console.log("배정 요청:", {
      customers: selectedCustomers,
      assignee: selectedAssignee,
      type: assignmentType,
    });

    alert("배정이 완료되었습니다.");
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedAssignee(null);
    setSelectedTeam(null);
    setAssignmentType("team");
    setFilteredMembers([]);
    // 관리자 모드로 초기화
    setCurrentUser({
      name: "김관리자",
      role: "관리자",
      team: "전체",
    });
    onClose();
  };

  const handleAssigneeSelect = (assignee, type) => {
    setSelectedAssignee(assignee);
    setAssignmentType(type);
  };

  if (!isOpen) return null;

  return (
    <div className="assignment-modal-overlay" onClick={resetAndClose}>
      <div className="assignment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="assignment-modal-header">
          <h2>고객 배정</h2>
          <div className="header-controls">
            <button className="mode-toggle-btn" onClick={toggleUserMode}>
              {currentUser.role === "관리자" ? "팀장모드" : "관리자모드"}
            </button>
            <span className="current-user-info">
              {currentUser.name} ({currentUser.role})
            </span>
            <button className="assignment-modal-close" onClick={resetAndClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="assignment-modal-content">
          {/* 모드별 설명 또는 배정 설명 */}
          <div
            className={`modal-description ${
              selectedAssignee &&
              !(currentUser.role === "팀장" && assignmentType === "team")
                ? "highlighted"
                : ""
            }`}
          >
            {selectedAssignee &&
            !(currentUser.role === "팀장" && assignmentType === "team") ? (
              <>
                <div className="assignment-description-icon">📋</div>
                <span>{getAssignmentDescription()}</span>
              </>
            ) : currentUser.role === "관리자" ? (
              "그룹 혹은 팀원에게 고객을 배정할 수 있습니다."
            ) : (
              "팀원에게 고객을 배정할 수 있습니다."
            )}
          </div>

          {/* 선택된 고객 정보 */}
          <div className="selected-customers-info">
            <h3>선택된 고객: {getCustomerDisplayText()}</h3>
          </div>

          {/* 팀 선택 */}
          <div className="assignment-section">
            <h4>그룹</h4>
            <div className="team-list">
              {(currentUser.role === "팀장"
                ? organizationData.teams.filter(
                    (team) => team.name === currentUser.team
                  )
                : organizationData.teams
              ).map((team) => (
                <div
                  key={team.id}
                  className={`team-item ${
                    selectedTeam?.id === team.id ? "selected" : ""
                  } ${currentUser.role === "팀장" ? "fixed" : ""}`}
                  onClick={() =>
                    currentUser.role === "관리자"
                      ? handleTeamSelect(team)
                      : null
                  }
                >
                  <div className="assign-modal-team-info">
                    <div className="assign-modal-team-main-info">
                      <span className="assign-modal-team-name">
                        {team.name}
                      </span>
                      <span className="assign-modal-team-leader">
                        팀장: {team.leader}
                      </span>
                    </div>
                    <span className="team-member-count">
                      {team.memberCount}명
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 팀원 선택 */}
          {(selectedTeam || currentUser.role === "팀장") && (
            <div className="assignment-section">
              <h4>팀원</h4>
              <div className="member-list">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`member-item ${
                      selectedAssignee?.id === member.id &&
                      assignmentType === "member"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleAssigneeSelect(member, "member")}
                  >
                    <div className="member-info">
                      <span className="member-name">{member.name}</span>
                      <span className="member-role">{member.role}</span>
                    </div>
                  </div>
                ))}
                {filteredMembers.length === 0 && selectedTeam && (
                  <div className="no-members-message">
                    해당 팀에 배정 가능한 팀원이 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="assignment-modal-footer">
          <button className="btn btn-secondary" onClick={resetAndClose}>
            취소
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAssign}
            disabled={
              !selectedAssignee ||
              (currentUser.role === "팀장" && assignmentType === "team")
            }
          >
            배정하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAssignmentModal;
