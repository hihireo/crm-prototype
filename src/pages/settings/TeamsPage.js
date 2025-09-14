import React, { useState } from "react";
import "./TeamsPage.css";

const TeamsPage = ({ service }) => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "영업1지점",
      description: "마곡지점",
      leaderId: 3,
      leaderName: "박팀장",
      members: [
        { id: 3, name: "박팀장", position: "팀장" },
        { id: 4, name: "최신입", position: "팀원" },
        { id: 5, name: "이영업", position: "팀원" },
      ],
      createdAt: "2024-01-01",
    },
    {
      id: 2,
      name: "영업2지점",
      description: "미래지점",
      leaderId: 6,
      leaderName: "김부장",
      members: [
        { id: 6, name: "김부장", position: "팀장" },
        { id: 7, name: "정고객", position: "팀원" },
      ],
      createdAt: "2024-01-05",
    },
  ]);

  // 전체 멤버 목록 (회사 전체 직원)
  const [allMembers] = useState([
    { id: 1, name: "김대표", position: "대표", teams: [] },
    { id: 2, name: "이매니저", position: "본부장", teams: [] },
    { id: 3, name: "박팀장", position: "팀장", teams: [1] },
    { id: 4, name: "최신입", position: "팀원", teams: [1] },
    { id: 5, name: "이영업", position: "팀원", teams: [1] },
    { id: 6, name: "김부장", position: "팀장", teams: [2] },
    { id: 7, name: "정고객", position: "팀원", teams: [2] },
    { id: 8, name: "신입사원", position: "팀원", teams: [] },
    { id: 9, name: "홍길동", position: "팀원", teams: [] },
    { id: 10, name: "장보고", position: "팀원", teams: [] },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [selectedLeader, setSelectedLeader] = useState("");

  // 사용 가능한 팀장 후보 (팀장, 본부장, 총관리자 직급)
  const availableLeaders = [
    { id: 3, name: "박팀장", position: "팀장" },
    { id: 6, name: "김부장", position: "팀장" },
    { id: 2, name: "이매니저", position: "본부장" },
  ];

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (newTeamName && newTeamDesc && selectedLeader) {
      const leader = availableLeaders.find(
        (l) => l.id.toString() === selectedLeader
      );
      const newTeam = {
        id: teams.length + 1,
        name: newTeamName,
        description: newTeamDesc,
        leaderId: leader.id,
        leaderName: leader.name,
        members: [leader],
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTeams([...teams, newTeam]);
      setNewTeamName("");
      setNewTeamDesc("");
      setSelectedLeader("");
      setShowCreateModal(false);
    }
  };

  const handleDeleteTeam = (teamId) => {
    if (window.confirm("정말로 이 팀을 삭제하시겠습니까?")) {
      setTeams(teams.filter((team) => team.id !== teamId));
    }
  };

  // 멤버 관리 모달 열기
  const handleOpenMemberModal = (team) => {
    setSelectedTeamForMembers(team);
    setShowMemberModal(true);
  };

  // 팀에 멤버 추가
  const handleAddMemberToTeam = (memberId) => {
    const member = allMembers.find((m) => m.id === memberId);
    if (!member) return;

    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === selectedTeamForMembers.id) {
          const isAlreadyMember = team.members.some((m) => m.id === memberId);
          if (!isAlreadyMember) {
            return {
              ...team,
              members: [...team.members, member],
            };
          }
        }
        return team;
      })
    );

    // allMembers의 teams 배열도 업데이트 (실제 구현에서는 상태로 관리해야 함)
    // const updatedAllMembers = allMembers.map(member => {
    //   if (member.id === memberId) {
    //     return {
    //       ...member,
    //       teams: [...member.teams, selectedTeamForMembers.id]
    //     };
    //   }
    //   return member;
    // });
  };

  // 팀에서 멤버 제거
  const handleRemoveMemberFromTeam = (memberId) => {
    if (selectedTeamForMembers.leaderId === memberId) {
      alert("팀장은 팀에서 제거할 수 없습니다. 먼저 다른 팀장을 지정해주세요.");
      return;
    }

    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === selectedTeamForMembers.id) {
          return {
            ...team,
            members: team.members.filter((m) => m.id !== memberId),
          };
        }
        return team;
      })
    );

    // allMembers의 teams 배열도 업데이트 (실제 구현에서는 상태로 관리해야 함)
    // const updatedAllMembers = allMembers.map(member => {
    //   if (member.id === memberId) {
    //     return {
    //       ...member,
    //       teams: member.teams.filter(teamId => teamId !== selectedTeamForMembers.id)
    //     };
    //   }
    //   return member;
    // });
  };

  // 팀장 변경
  const handleChangeTeamLeader = (newLeaderId) => {
    const newLeader = allMembers.find((m) => m.id === newLeaderId);
    if (!newLeader) return;

    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === selectedTeamForMembers.id) {
          // 새 팀장이 팀원이 아니면 추가
          const isNewLeaderInTeam = team.members.some(
            (m) => m.id === newLeaderId
          );
          let updatedMembers = team.members;

          if (!isNewLeaderInTeam) {
            updatedMembers = [...team.members, newLeader];
          }

          return {
            ...team,
            leaderId: newLeaderId,
            leaderName: newLeader.name,
            members: updatedMembers,
          };
        }
        return team;
      })
    );

    // selectedTeamForMembers도 업데이트
    setSelectedTeamForMembers((prev) => ({
      ...prev,
      leaderId: newLeaderId,
      leaderName: newLeader.name,
    }));
  };

  return (
    <div className="teams-page">
      <div className="teams-header">
        <div>
          <h3>팀 관리</h3>
          <p>팀을 생성하고 멤버를 관리하세요</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          팀 생성
        </button>
      </div>

      {/* <div className="teams-stats">
        <div className="stat-card">
          <span className="stat-number">{teams.length}</span>
          <span className="stat-label">총 팀 수</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {teams.reduce((total, team) => total + team.members.length, 0)}
          </span>
          <span className="stat-label">총 팀원</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {Math.round(
              teams.reduce((total, team) => total + team.members.length, 0) /
                teams.length
            )}
          </span>
          <span className="stat-label">평균 팀 크기</span>
        </div>
      </div> */}

      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card-modern">
            <div className="team-card-header">
              <div className="team-badge">
                <div className="team-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="team-stats-badge">
                  <span className="member-count">{team.members.length}</span>
                  <span className="member-label">명</span>
                </div>
              </div>
              <div className="team-actions">
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleOpenMemberModal(team)}
                  title="멤버 관리"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteTeam(team.id)}
                  title="팀 삭제"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="team-content">
              <div className="team-title-section">
                <h3 className="team-name">{team.name}</h3>
                <p className="team-description">{team.description}</p>
              </div>

              <div className="team-leader-modern">
                <div className="leader-avatar">{team.leaderName.charAt(0)}</div>
                <div className="leader-details">
                  <span className="leader-name">{team.leaderName}</span>
                  <span className="leader-role">팀장</span>
                </div>
                <div className="leader-crown">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 1.8L12 8l-3.1 2.4-2.1-1.8L7.7 14z" />
                  </svg>
                </div>
              </div>

              <div className="team-members-preview">
                <div className="members-avatars">
                  {team.members.slice(0, 4).map((member, index) => (
                    <div
                      key={member.id}
                      className={`member-avatar-small ${
                        member.id === team.leaderId ? "is-leader" : ""
                      }`}
                      style={{ zIndex: team.members.length - index }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  ))}
                  {team.members.length > 4 && (
                    <div className="member-avatar-small more-members">
                      +{team.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="members-count-text">
                  총 {team.members.length}명의 팀원
                </span>
              </div>
            </div>

            <div className="team-footer-modern">
              <div className="created-info">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                <span>{team.createdAt}</span>
              </div>
              <button
                className="manage-btn"
                onClick={() => handleOpenMemberModal(team)}
              >
                <span>멤버 관리</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 팀 생성 모달 */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>팀 생성</h4>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="create-team-form">
              <div className="form-group">
                <label className="label">팀 이름</label>
                <input
                  type="text"
                  className="input"
                  placeholder="팀 이름을 입력하세요"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">팀 설명</label>
                <textarea
                  className="input"
                  placeholder="팀의 역할과 목적을 설명하세요"
                  rows="3"
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">팀장 선택</label>
                <select
                  className="input"
                  value={selectedLeader}
                  onChange={(e) => setSelectedLeader(e.target.value)}
                  required
                >
                  <option value="">팀장을 선택하세요</option>
                  {availableLeaders.map((leader) => (
                    <option key={leader.id} value={leader.id}>
                      {leader.name} ({leader.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  팀 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 멤버 관리 모달 */}
      {showMemberModal && selectedTeamForMembers && (
        <div
          className="tmm-modal-overlay-modern"
          onClick={() => setShowMemberModal(false)}
        >
          <div
            className="tmm-modal-content-modern"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tmm-modal-header-modern">
              <div className="tmm-modal-title-section">
                <div className="tmm-modal-team-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="tmm-modal-title-text">
                  <h4>{selectedTeamForMembers.name}</h4>
                  <p>멤버 관리</p>
                </div>
              </div>
              <button
                className="tmm-modal-close-modern"
                onClick={() => setShowMemberModal(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="tmm-modal-body-modern">
              {/* 현재 팀장 표시 */}
              <div className="tmm-current-leader-modern">
                <div className="tmm-section-header">
                  <div className="tmm-section-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 1.8L12 8l-3.1 2.4-2.1-1.8L7.7 14z" />
                    </svg>
                  </div>
                  <h5>현재 팀장</h5>
                </div>
                <div className="tmm-leader-card-modern">
                  <div className="tmm-leader-avatar-large">
                    {selectedTeamForMembers.leaderName.charAt(0)}
                    <div className="tmm-leader-crown-badge">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="tmm-leader-info-modern">
                    <span className="tmm-leader-name-modern">
                      {selectedTeamForMembers.leaderName}
                    </span>
                    <span className="tmm-leader-badge">팀장</span>
                  </div>
                </div>
              </div>

              {/* 팀장 변경 섹션 */}
              <div className="tmm-section-modern">
                <div className="tmm-section-header">
                  <div className="tmm-section-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </div>
                  <h5>팀장 변경</h5>
                </div>
                {selectedTeamForMembers.members.filter(
                  (member) => member.id !== selectedTeamForMembers.leaderId
                ).length > 0 ? (
                  <div className="tmm-leader-candidates-modern">
                    {selectedTeamForMembers.members
                      .filter(
                        (member) =>
                          member.id !== selectedTeamForMembers.leaderId
                      )
                      .map((member) => (
                        <div
                          key={member.id}
                          className="tmm-candidate-item-modern"
                        >
                          <div className="tmm-candidate-info">
                            <div className="tmm-member-avatar-modern">
                              {member.name.charAt(0)}
                            </div>
                            <div className="tmm-member-details-modern">
                              <span className="tmm-member-name-modern">
                                {member.name}
                              </span>
                              <span className="tmm-member-position-modern">
                                {member.position}
                              </span>
                            </div>
                          </div>
                          <button
                            className="tmm-btn-modern tmm-btn-promote"
                            onClick={() => handleChangeTeamLeader(member.id)}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                            </svg>
                            팀장 지정
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="tmm-empty-state">
                    <p>팀장으로 지정할 수 있는 다른 팀원이 없습니다.</p>
                  </div>
                )}
              </div>

              {/* 전체 멤버 목록 */}
              <div className="tmm-section-modern">
                <div className="tmm-section-header">
                  <div className="tmm-section-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M20 8v6M23 11h-6" />
                    </svg>
                  </div>
                  <h5>전체 멤버</h5>
                  <div className="tmm-member-counter">
                    {allMembers.length}명
                  </div>
                </div>
                <div className="tmm-all-members-modern">
                  {allMembers.map((member) => {
                    const isInCurrentTeam = selectedTeamForMembers.members.some(
                      (m) => m.id === member.id
                    );
                    const memberTeams = teams.filter((team) =>
                      team.members.some((m) => m.id === member.id)
                    );

                    return (
                      <div
                        key={member.id}
                        className={`tmm-member-item-modern ${
                          isInCurrentTeam ? "is-team-member" : ""
                        }`}
                      >
                        <div className="tmm-member-main-info">
                          <div
                            className={`tmm-member-avatar-modern ${
                              isInCurrentTeam ? "in-team" : ""
                            }`}
                          >
                            {member.name.charAt(0)}
                            {member.id === selectedTeamForMembers.leaderId && (
                              <div className="tmm-member-crown">
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="tmm-member-info-section">
                            <div className="tmm-member-basic-info">
                              <span className="tmm-member-name-modern">
                                {member.name}
                              </span>
                              <span className="tmm-member-position-modern">
                                {member.position}
                              </span>
                            </div>
                            {memberTeams.length > 0 && (
                              <div className="tmm-member-teams-modern">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                {memberTeams
                                  .map((team) => team.name)
                                  .join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="tmm-member-actions-modern">
                          {isInCurrentTeam ? (
                            <button
                              className={`tmm-btn-modern ${
                                member.id === selectedTeamForMembers.leaderId
                                  ? "tmm-btn-leader"
                                  : "tmm-btn-remove"
                              }`}
                              onClick={() =>
                                handleRemoveMemberFromTeam(member.id)
                              }
                              disabled={
                                member.id === selectedTeamForMembers.leaderId
                              }
                            >
                              {member.id === selectedTeamForMembers.leaderId ? (
                                <>
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                                  </svg>
                                  팀장
                                </>
                              ) : (
                                <>
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                  제외
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              className="tmm-btn-modern tmm-btn-add"
                              onClick={() => handleAddMemberToTeam(member.id)}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              추가
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="tmm-modal-footer-modern">
              <div className="tmm-team-summary">
                <span className="tmm-summary-text">
                  현재 팀원: {selectedTeamForMembers.members.length}명
                </span>
              </div>
              <button
                className="tmm-btn-modern tmm-btn-close"
                onClick={() => setShowMemberModal(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4" />
                </svg>
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
