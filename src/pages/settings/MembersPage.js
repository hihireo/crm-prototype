import React, { useState } from "react";
import "./MembersPage.css";

const MembersPage = ({ service }) => {
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "김관리자",
      email: "admin@company.com",
      role: "Owner",
      position: "총관리자",
      team: null,
      status: "Active",
      joinedAt: "2024-01-01",
      avatar: "김",
    },
    {
      id: 2,
      name: "이매니저",
      email: "manager@company.com",
      role: "Manager",
      position: "본부장",
      team: null,
      status: "Active",
      joinedAt: "2024-01-05",
      avatar: "이",
    },
    {
      id: 3,
      name: "박직원",
      email: "staff@company.com",
      role: "Staff",
      position: "팀장",
      team: "영업1지점",
      status: "Active",
      joinedAt: "2024-01-10",
      avatar: "박",
    },
    {
      id: 4,
      name: "최신입",
      email: "newbie@company.com",
      role: "Staff",
      position: "팀원",
      team: "영업1지점",
      status: "Pending",
      joinedAt: "2024-01-12",
      avatar: "최",
    },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePosition, setInvitePosition] = useState("팀원");
  const [inviteTeam, setInviteTeam] = useState("");

  // 사용 가능한 팀 목록
  const availableTeams = [
    { id: 1, name: "영업1지점" },
    { id: 2, name: "영업2지점" },
  ];

  const handleInvite = (e) => {
    e.preventDefault();
    if (inviteEmail) {
      const newMember = {
        id: members.length + 1,
        name: "신규멤버",
        email: inviteEmail,
        role: "Staff",
        position: invitePosition,
        team: inviteTeam || null,
        status: "Pending",
        joinedAt: new Date().toISOString().split("T")[0],
        avatar: "신",
      };
      setMembers([...members, newMember]);
      setInviteEmail("");
      setInvitePosition("팀원");
      setInviteTeam("");
      setShowInviteModal(false);
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm("정말로 이 멤버를 제거하시겠습니까?")) {
      setMembers(members.filter((member) => member.id !== memberId));
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Owner":
        return "role-owner";
      case "Manager":
        return "role-manager";
      case "Staff":
        return "role-staff";
      default:
        return "role-staff";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Pending":
        return "status-pending";
      case "Inactive":
        return "status-inactive";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="members-page">
      <div className="members-header">
        <div>
          <h3>팀 멤버 관리</h3>
          <p>팀 멤버를 초대하고 권한을 관리하세요</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowInviteModal(true)}
        >
          멤버 초대
        </button>
      </div>

      <div className="members-stats">
        <div className="stat-card">
          <span className="stat-number">{members.length}</span>
          <span className="stat-label">총 멤버</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {members.filter((m) => m.status === "Active").length}
          </span>
          <span className="stat-label">활성 멤버</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {members.filter((m) => m.status === "Pending").length}
          </span>
          <span className="stat-label">대기 중</span>
        </div>
      </div>

      <div className="members-list">
        <div className="members-table">
          <div className="table-header">
            <div className="col-member">멤버</div>
            <div className="col-position">직급</div>
            <div className="col-team">소속팀</div>
            <div className="col-status">상태</div>
            <div className="col-joined">가입일</div>
            <div className="col-actions">작업</div>
          </div>

          {members.map((member) => (
            <div key={member.id} className="table-row">
              <div className="col-member">
                <div className="member-info">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-details">
                    <div className="member-name">{member.name}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
              </div>
              <div className="col-position">
                <span className="position-text">{member.position}</span>
              </div>
              <div className="col-team">
                <span className={`team-text ${!member.team ? "no-team" : ""}`}>
                  {member.team || "소속 없음"}
                </span>
              </div>
              <div className="col-status">
                <span
                  className={`status-badge ${getStatusColor(member.status)}`}
                >
                  {member.status === "Active"
                    ? "활성"
                    : member.status === "Pending"
                    ? "대기"
                    : "비활성"}
                </span>
              </div>
              <div className="col-joined">{member.joinedAt}</div>
              <div className="col-actions">
                {member.role !== "Owner" && (
                  <button
                    className="btn-icon remove-btn"
                    onClick={() => handleRemoveMember(member.id)}
                    title="멤버 제거"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 초대 모달 */}
      {showInviteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowInviteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>멤버 초대</h4>
              <button
                className="modal-close"
                onClick={() => setShowInviteModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="invite-form">
              <div className="form-group">
                <label className="label">이메일 주소</label>
                <input
                  type="email"
                  className="input"
                  placeholder="초대할 멤버의 이메일을 입력하세요"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">직급</label>
                <select
                  className="input"
                  value={invitePosition}
                  onChange={(e) => setInvitePosition(e.target.value)}
                >
                  <option value="팀원">팀원</option>
                  <option value="팀장">팀장</option>
                  <option value="본부장">본부장</option>
                  <option value="총관리자">총관리자</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">소속팀</label>
                <select
                  className="input"
                  value={inviteTeam}
                  onChange={(e) => setInviteTeam(e.target.value)}
                >
                  <option value="">소속 없음</option>
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowInviteModal(false)}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  초대 보내기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
