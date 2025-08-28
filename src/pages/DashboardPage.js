import React, { useState, useEffect } from "react";
import "./DashboardPage.css";

const DashboardPage = ({ user, service }) => {
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleWorkToggle = () => {
    if (!isWorking) {
      setIsWorking(true);
      setWorkStartTime(new Date());
    } else {
      setIsWorking(false);
      setWorkStartTime(null);
    }
  };

  // 고객 통계 데이터
  const customerStats = {
    newAssigned: 8,
    waiting: 12,
    inProgress: 15,
    completed: 23,
    paymentRate: 68.5,
    totalPayment: 15650000,
  };

  const salesRanking = [
    {
      rank: 1,
      name: "김영업",
      sales: 15600000,
      change: "+1200000",
      avatar: "김",
    },
    {
      rank: 2,
      name: "이마케팅",
      sales: 14300000,
      change: "+800000",
      avatar: "이",
    },
    {
      rank: 3,
      name: "박세일즈",
      sales: 13800000,
      change: "+1500000",
      avatar: "박",
    },
    {
      rank: 4,
      name: "최고객",
      sales: 12500000,
      change: "+300000",
      avatar: "최",
    },
    {
      rank: 26,
      name: user.name,
      sales: 9800000,
      change: "+700000",
      avatar: user.name.charAt(0),
    },
  ];

  // 4행만 표시하기 위해 필터링 (1,2,3등과 내 랭킹)
  const displayRanking = salesRanking
    .filter((item) => item.rank <= 3 || item.name === user.name)
    .slice(0, 4);

  // 최근 공지사항 데이터 (NoticePage와 동일, 최신 3개만)
  const recentNotices = [
    {
      id: 1,
      title: "시스템 점검 안내",
      author: "관리자",
      date: "2024-01-10",
      important: true,
    },
    {
      id: 2,
      title: "신규 기능 업데이트 안내",
      author: "개발팀",
      date: "2024-01-08",
      important: false,
    },
    {
      id: 3,
      title: "1월 팀 미팅 일정",
      author: "인사팀",
      date: "2024-01-05",
      important: false,
    },
  ];

  // 공지사항 클릭 핸들러
  const handleNoticeClick = (noticeId) => {
    // 공지사항 페이지로 이동하면서 해당 공지사항 ID를 전달
    window.location.href = `/notice?id=${noticeId}`;
  };

  const newAssignedCustomers = [
    {
      id: 1,
      name: "홍길동",
      phone: "010-1234-5678",
      source: "네이버",
      assignedAt: "10분 전",
      status: "신규",
      priority: "높음",
      service: "웹사이트 제작",
    },
    {
      id: 2,
      name: "김철수",
      phone: "010-2345-6789",
      source: "구글",
      assignedAt: "23분 전",
      status: "연락시도",
      priority: "보통",
      service: "앱 개발",
    },
    {
      id: 3,
      name: "이영희",
      phone: "010-3456-7890",
      source: "페이스북",
      assignedAt: "45분 전",
      status: "신규",
      priority: "높음",
      service: "온라인 쇼핑몰",
    },
    {
      id: 4,
      name: "박민수",
      phone: "010-4567-8901",
      source: "인스타그램",
      assignedAt: "1시간 전",
      status: "신규",
      priority: "보통",
      service: "브랜딩",
    },
  ];

  // 달력 및 알림 데이터 (8월 텔레마케팅 샘플)
  const [calendarEvents, setCalendarEvents] = useState({
    "2025-08-05": [
      { time: "09:00", title: "월 콜리스트 검토", type: "task" },
      { time: "14:00", title: "김영희 전화상담", type: "call" },
      { time: "16:30", title: "팀 미팅", type: "meeting" },
      { time: "18:00", title: "보고서 작성", type: "task" },
    ],
    "2025-08-12": [
      {
        time: "11:00",
        title: "박지율 전화 한번 다시 주기로 했음",
        type: "appointment",
      },
      { time: "14:30", title: "신규 고객 상담", type: "consultation" },
      { time: "16:00", title: "계약서 검토", type: "task" },
    ],
    "2025-08-23": [
      {
        time: "10:00",
        title:
          "박채영 확인 필요 박채영 확인 필요 박채영 확인 필요 박채영 확인 필요 박채영 확인 필요 박채영 확인 필요 박채영 확인 필요 박채영 확인 필요 박채영 확인 필요",
        type: "callback",
      },
      { time: "15:30", title: "전략 회의", type: "meeting" },
      { time: "17:00", title: "월말 정산", type: "task" },
      { time: "19:00", title: "교육 참석", type: "training" },
      { time: "20:00", title: "네트워킹", type: "meeting" },
    ],
    "2025-08-26": [
      { time: "13:00", title: "이종호 대표 상담", type: "call" },
      { time: "17:00", title: "다음달 계획", type: "planning" },
    ],
  });

  const formatCalendarDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getEventsForDate = (date) => {
    const dateKey = formatCalendarDate(date);
    return calendarEvents[dateKey] || [];
  };

  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleDateClick = (date) => {
    setSelectedCalendarDate(date);
  };

  const getSelectedDateEvents = () => {
    if (!selectedCalendarDate) return [];
    const events = getEventsForDate(selectedCalendarDate);
    // 시간순으로 오름차순 정렬
    return events.sort((a, b) => {
      const timeA = a.time.replace(":", "");
      const timeB = b.time.replace(":", "");
      return timeA.localeCompare(timeB);
    });
  };

  // 달력 날짜 생성
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // 이전 달의 빈 칸들
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // 이번 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const events = getEventsForDate(date);
      days.push({ date, day, events });
    }

    return days;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  const getWorkingTime = () => {
    if (!isWorking || !workStartTime) return "00:00:00";
    const diff = Math.floor((currentTime - workStartTime) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // 일정 추가 함수
  const addScheduleEvent = (eventData) => {
    const dateKey = formatCalendarDate(selectedCalendarDate);
    const newEvent = {
      time: eventData.time,
      title: eventData.title,
      type: "task", // 기본값으로 task 설정
    };

    setCalendarEvents((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEvent],
    }));
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* 헤더 섹션 */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>안녕하세요, {user.name}님! 👋</h1>
            <p className="current-time">
              {currentTime.toLocaleString("ko-KR")}
            </p>
          </div>

          <div className="work-status-section">
            <div className="work-info">
              {isWorking ? (
                <div className="working-display">
                  <div className="status-indicator working"></div>
                  <div className="work-details">
                    <span className="work-label">근무 중</span>
                    <span className="work-time">{getWorkingTime()}</span>
                  </div>
                </div>
              ) : (
                <div className="not-working-display">
                  <div className="status-indicator not-working"></div>
                  <span className="work-label">퇴근 상태</span>
                </div>
              )}
            </div>
            <button
              className={`work-toggle-btn ${
                isWorking ? "checkout" : "checkin"
              }`}
              onClick={handleWorkToggle}
            >
              {isWorking ? "퇴근하기" : "출근하기"}
            </button>
          </div>
        </div>

        {/* 메인 대시보드 그리드 */}
        <div className="dashboard-grid">
          {/* 통계 카드들 */}
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card new-assigned">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{customerStats.newAssigned}</h3>
                  <p>새로 할당된 고객</p>
                </div>
              </div>
              <div className="stat-card waiting">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{customerStats.waiting}</h3>
                  <p>대기중인 고객</p>
                </div>
              </div>
              <div className="stat-card in-progress">
                <div className="stat-icon">🔄</div>
                <div className="stat-content">
                  <h3>{customerStats.inProgress}</h3>
                  <p>진행중인 고객</p>
                </div>
              </div>
              <div className="stat-card completed">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{customerStats.completed}</h3>
                  <p>완료된 고객</p>
                </div>
              </div>
              <div className="stat-card payment-rate">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{customerStats.paymentRate}%</h3>
                  <p>결제율</p>
                </div>
              </div>
              <div className="stat-card total-payment">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>{formatCurrency(customerStats.totalPayment)}원</h3>
                  <p>결제누적액</p>
                </div>
              </div>
            </div>
          </div>

          {/* 랭킹 카드 */}
          <div className="card ranking-card">
            <div className="card-header">
              <h3>🏆 이번 달 판매 랭킹</h3>
              <button className="dashboard-view-all-btn">전체 보기</button>
            </div>
            <div className="ranking-list">
              {displayRanking.map((item) => (
                <div
                  key={item.rank}
                  className={`ranking-item ${
                    item.name === user.name ? "my-rank" : ""
                  }`}
                >
                  <div className="rank-position">
                    <span className="rank-number">#{item.rank}</span>
                    {item.rank <= 3 && (
                      <span className="medal">
                        {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : "🥉"}
                      </span>
                    )}
                  </div>
                  <div className="user-avatar">{item.avatar}</div>
                  <div className="user-info">
                    <div className="name">{item.name}</div>
                    <div className="sales">₩{formatCurrency(item.sales)}</div>
                  </div>
                  <span className="change positive">
                    +{formatCurrency(parseInt(item.change.replace("+", "")))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 새로 할당된 고객 목록 */}
          <div className="card customers-card">
            <div className="card-header">
              <div className="dashboard-header-left">
                <h3>📋 새로 할당된 고객</h3>
                <span className="count-badge">
                  ({newAssignedCustomers.length})
                </span>
              </div>
              <button
                className="dashboard-view-all-btn"
                onClick={() => (window.location.href = "/applications")}
              >
                전체 보기
              </button>
            </div>
            <div className="customers-list">
              {newAssignedCustomers.map((customer) => (
                <div key={customer.id} className="customer-item">
                  <div className="customer-main">
                    <div className="customer-info">
                      <div className="customer-name-row">
                        <h4>{customer.name}</h4>
                        <span className="customer-phone">{customer.phone}</span>
                        <span className="source-badge">{customer.source}</span>
                      </div>
                      {/* <span className="service">{customer.service}</span> */}
                    </div>
                    <div className="customer-meta">
                      <span className="assigned-time">
                        {customer.assignedAt}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 달력 및 미리알림 */}
          <div className="card calendar-card">
            <div className="card-header">
              <h3>📅 달력 & 일정</h3>
              <div className="calendar-controls">
                <button className="month-nav" onClick={() => changeMonth(-1)}>
                  ‹
                </button>
                <span className="current-month">
                  {selectedDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
                <button className="month-nav" onClick={() => changeMonth(1)}>
                  ›
                </button>
              </div>
            </div>

            <div className="calendar-main-layout">
              <div className="calendar-wrapper">
                <div className="calendar-weekdays">
                  <div className="weekday">일</div>
                  <div className="weekday">월</div>
                  <div className="weekday">화</div>
                  <div className="weekday">수</div>
                  <div className="weekday">목</div>
                  <div className="weekday">금</div>
                  <div className="weekday">토</div>
                </div>

                <div className="calendar-grid">
                  {generateCalendarDays().map((dayData, index) => (
                    <div
                      key={index}
                      className={`calendar-day ${
                        dayData
                          ? isToday(dayData.date)
                            ? "today"
                            : dayData.events.length > 0
                            ? "has-events"
                            : ""
                          : "empty"
                      } ${
                        selectedCalendarDate &&
                        dayData &&
                        dayData.date.toDateString() ===
                          selectedCalendarDate.toDateString()
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => dayData && handleDateClick(dayData.date)}
                    >
                      {dayData && (
                        <>
                          <div className="day-number">
                            {dayData.day}
                            {isToday(dayData.date) && (
                              <span className="today-badge">오늘</span>
                            )}
                          </div>
                          <div className="day-events">
                            {dayData.events
                              .slice(0, 2)
                              .map((event, eventIndex) => (
                                <div
                                  key={eventIndex}
                                  className={`calendar-event ${event.type}`}
                                  title={`${event.time} - ${event.title}`}
                                >
                                  {/* <span className="event-dot"></span> */}
                                  <span className="event-text">
                                    {event.title}
                                  </span>
                                </div>
                              ))}
                            {dayData.events.length > 2 && (
                              <div className="more-events">
                                그 외 {dayData.events.length - 2}건
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="selected-date-panel">
                <div className="panel-header">
                  <div className="calendar-schedule-header-left">
                    <h4>
                      {selectedCalendarDate
                        ? selectedCalendarDate.toLocaleDateString("ko-KR", {
                            month: "long",
                            day: "numeric",
                            weekday: "short",
                          })
                        : "날짜를 선택하세요"}
                    </h4>
                    {selectedCalendarDate && (
                      <span className="events-count">
                        {getSelectedDateEvents().length}개 일정
                      </span>
                    )}
                  </div>
                  {selectedCalendarDate && (
                    <button
                      className="calendar-schedule-add-btn"
                      onClick={() => setShowScheduleModal(true)}
                    >
                      + 일정 추가
                    </button>
                  )}
                </div>

                <div className="panel-content">
                  {selectedCalendarDate ? (
                    getSelectedDateEvents().length > 0 ? (
                      <div className="detailed-events-list">
                        {getSelectedDateEvents().map((event, index) => (
                          <div
                            key={index}
                            className={`detailed-event ${event.type}`}
                          >
                            <div className="event-time-badge">{event.time}</div>
                            <div className="event-details">
                              <div className="event-title">{event.title}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-events-message">
                        이 날에는 등록된 일정이 없습니다.
                      </div>
                    )
                  ) : (
                    <div className="select-date-message">
                      달력에서 날짜를 클릭하여 일정을 확인하세요.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 공지사항 섹션 */}
        <div className="dashboard-recent-notices">
          <div className="dashboard-notices-header">
            <h3>최근 공지사항</h3>
            <button
              className="dashboard-notices-more-btn"
              onClick={() => (window.location.href = "/notice")}
            >
              더보기
            </button>
          </div>
          <div className="dashboard-notices-list">
            {recentNotices.map((notice) => (
              <div
                key={notice.id}
                className="dashboard-notice-item"
                onClick={() => handleNoticeClick(notice.id)}
              >
                <div className="dashboard-notice-content">
                  <div className="dashboard-notice-title-row">
                    <h4 className="dashboard-notice-title">{notice.title}</h4>
                    {notice.important && (
                      <span className="dashboard-notice-badge">중요</span>
                    )}
                  </div>
                  <div className="dashboard-notice-meta">
                    <span className="dashboard-notice-author">
                      {notice.author}
                    </span>
                    <span className="dashboard-notice-date">{notice.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {showScheduleModal && (
        <ScheduleModal
          selectedDate={selectedCalendarDate}
          onClose={() => setShowScheduleModal(false)}
          onAddSchedule={addScheduleEvent}
        />
      )}
    </div>
  );
};

// 일정 추가 모달 컴포넌트
const ScheduleModal = ({ selectedDate, onClose, onAddSchedule }) => {
  const [scheduleData, setScheduleData] = useState({
    time: "",
    title: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (scheduleData.time && scheduleData.title) {
      onAddSchedule(scheduleData);
      onClose();
      setScheduleData({ time: "", title: "" });
    }
  };

  return (
    <div className="calendar-schedule-modal-overlay" onClick={onClose}>
      <div
        className="calendar-schedule-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="calendar-schedule-modal-header">
          <h3>일정 추가</h3>
          <button className="calendar-schedule-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="calendar-schedule-modal-body">
          <div className="calendar-schedule-modal-date-info">
            {selectedDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="calendar-schedule-modal-field">
              <label>시간</label>
              <select
                value={scheduleData.time}
                onChange={(e) =>
                  setScheduleData((prev) => ({ ...prev, time: e.target.value }))
                }
                required
                className="calendar-schedule-modal-select"
              >
                <option value="">시간을 선택하세요</option>
                {Array.from({ length: 144 }, (_, i) => {
                  const hours = Math.floor(i / 6);
                  const minutes = (i % 6) * 10;
                  const timeString = `${hours
                    .toString()
                    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                  return (
                    <option key={timeString} value={timeString}>
                      {timeString}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="calendar-schedule-modal-field">
              <label>일정 제목</label>
              <input
                type="text"
                value={scheduleData.title}
                onChange={(e) =>
                  setScheduleData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="일정 제목을 입력하세요"
                required
                className="calendar-schedule-modal-input"
              />
            </div>

            <div className="calendar-schedule-modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="calendar-schedule-modal-cancel"
              >
                취소
              </button>
              <button type="submit" className="calendar-schedule-modal-submit">
                추가
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
