import React, { useState } from "react";
import "./DashboardPage.css";

const DashboardPage = ({ user, service }) => {
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState(null);

  const handleWorkToggle = () => {
    if (!isWorking) {
      setIsWorking(true);
      setWorkStartTime(new Date());
    } else {
      setIsWorking(false);
      setWorkStartTime(null);
    }
  };

  const formatTime = (date) => {
    return date
      ? date.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  };

  const salesRanking = [
    { rank: 1, name: "김영업", sales: 156, change: "+12" },
    { rank: 2, name: "이마케팅", sales: 143, change: "+8" },
    { rank: 3, name: "박세일즈", sales: 138, change: "+15" },
    { rank: 4, name: "최고객", sales: 125, change: "+3" },
    { rank: 5, name: user.name, sales: 98, change: "+7" },
  ];

  const myTasks = [
    {
      id: 1,
      title: "신규 고객 상담",
      customer: "홍길동",
      deadline: "오늘 15:00",
      status: "urgent",
    },
    {
      id: 2,
      title: "계약서 검토",
      customer: "김철수",
      deadline: "내일 10:00",
      status: "normal",
    },
    {
      id: 3,
      title: "후속 상담",
      customer: "이영희",
      deadline: "내일 14:00",
      status: "normal",
    },
    {
      id: 4,
      title: "견적서 발송",
      customer: "박민수",
      deadline: "모레",
      status: "low",
    },
  ];

  const recentAssignments = [
    {
      id: 1,
      customer: "홍길동",
      source: "네이버 광고",
      assignedAt: "10분 전",
      status: "대기",
    },
    {
      id: 2,
      customer: "김철수",
      source: "구글 광고",
      assignedAt: "23분 전",
      status: "진행중",
    },
    {
      id: 3,
      customer: "이영희",
      source: "페이스북 광고",
      assignedAt: "1시간 전",
      status: "완료",
    },
  ];

  const todaySchedule = [
    { time: "09:00", title: "팀 미팅", type: "meeting" },
    { time: "11:00", title: "고객 상담", type: "consultation" },
    { time: "14:00", title: "계약 미팅", type: "contract" },
    { time: "16:00", title: "보고서 작성", type: "task" },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>안녕하세요, {user.name}님!</h1>
            <p>오늘도 좋은 하루 되세요. 현재 {service}에서 활동 중입니다.</p>
          </div>

          <div className="work-status">
            <div className="work-time">
              {isWorking && workStartTime && (
                <div className="work-info">
                  <span>출근시간: {formatTime(workStartTime)}</span>
                </div>
              )}
            </div>
            <button
              className={`btn ${
                isWorking ? "btn-danger" : "btn-primary"
              } work-btn`}
              onClick={handleWorkToggle}
            >
              {isWorking ? "퇴근하기" : "출근하기"}
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* 프로필 카드 */}
          <div className="card profile-card">
            <h3>내 프로필</h3>
            <div className="profile-info">
              <div className="profile-avatar">{user.name.charAt(0)}</div>
              <div className="profile-details">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
                <span className="role-badge">
                  {user.role === "staff" ? "직원" : "관리자"}
                </span>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-label">이번 달 상담</span>
                <span className="stat-value">24건</span>
              </div>
              <div className="stat">
                <span className="stat-label">성약률</span>
                <span className="stat-value">68%</span>
              </div>
            </div>
          </div>

          {/* 판매량 랭킹 */}
          <div className="card ranking-card">
            <h3>이번 달 판매 랭킹</h3>
            <div className="ranking-list">
              {salesRanking.map((item) => (
                <div
                  key={item.rank}
                  className={`ranking-item ${
                    item.name === user.name ? "my-rank" : ""
                  }`}
                >
                  <span className="rank">#{item.rank}</span>
                  <span className="name">{item.name}</span>
                  <span className="sales">{item.sales}건</span>
                  <span className="change positive">{item.change}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 나의 할당 업무 */}
          <div className="card tasks-card">
            <h3>나의 할당 업무</h3>
            <div className="tasks-list">
              {myTasks.map((task) => (
                <div key={task.id} className={`task-item ${task.status}`}>
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>고객: {task.customer}</p>
                    <span className="deadline">{task.deadline}</span>
                  </div>
                  <div className={`task-status ${task.status}`}>
                    {task.status === "urgent"
                      ? "긴급"
                      : task.status === "normal"
                      ? "보통"
                      : "낮음"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 배정 정보 */}
          <div className="card assignments-card">
            <h3>최근 배정 정보</h3>
            <div className="assignments-list">
              {recentAssignments.map((assignment) => (
                <div key={assignment.id} className="assignment-item">
                  <div className="assignment-info">
                    <h4>{assignment.customer}</h4>
                    <p>{assignment.source}</p>
                    <span className="time">{assignment.assignedAt}</span>
                  </div>
                  <span
                    className={`status ${
                      assignment.status === "완료"
                        ? "completed"
                        : assignment.status === "진행중"
                        ? "progress"
                        : "waiting"
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 오늘 일정 */}
          <div className="card schedule-card">
            <h3>오늘 일정</h3>
            <div className="schedule-list">
              {todaySchedule.map((schedule, index) => (
                <div key={index} className="schedule-item">
                  <span className="schedule-time">{schedule.time}</span>
                  <div className="schedule-info">
                    <h4>{schedule.title}</h4>
                    <span className={`schedule-type ${schedule.type}`}>
                      {schedule.type === "meeting"
                        ? "회의"
                        : schedule.type === "consultation"
                        ? "상담"
                        : schedule.type === "contract"
                        ? "계약"
                        : "업무"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
