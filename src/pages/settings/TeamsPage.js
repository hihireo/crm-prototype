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

  const [showCreateModal, setShowCreateModal] = useState(false);
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

      <div className="teams-stats">
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
      </div>

      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            <div className="team-header">
              <div className="team-info">
                <h4>{team.name}</h4>
                <p>{team.description}</p>
              </div>
              <button
                className="delete-team-btn"
                onClick={() => handleDeleteTeam(team.id)}
                title="팀 삭제"
              >
                🗑️
              </button>
            </div>

            <div className="team-leader">
              <div className="leader-info">
                <span className="leader-label">팀장</span>
                <span className="leader-name">{team.leaderName}</span>
              </div>
            </div>

            <div className="team-members">
              <div className="members-header">
                <span className="members-title">
                  팀원 ({team.members.length}명)
                </span>
              </div>
              <div className="members-list">
                {team.members.map((member) => (
                  <div key={member.id} className="member-item">
                    <div className="member-avatar">{member.name.charAt(0)}</div>
                    <div className="member-info">
                      <span className="member-name">{member.name}</span>
                      <span className="member-position">{member.position}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="team-footer">
              <span className="created-date">생성일: {team.createdAt}</span>
              <button className="btn btn-secondary btn-sm">멤버 관리</button>
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
    </div>
  );
};

export default TeamsPage;
