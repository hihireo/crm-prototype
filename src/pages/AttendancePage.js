import React, { useState, useRef, useEffect } from "react";
import "./AttendancePage.css";
import GlobalEmployeeModal from "../components/GlobalEmployeeModal";
import {
  organizationTreeData,
  getSubordinates as getOrgSubordinates,
  getAllEmployees,
  transformEmployeeForModal,
} from "../utils/organizationData";
import TreeNode from "../components/TreeNode";

const AttendancePage = ({ user, service }) => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 1)); // 2025년 9월 1일
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const calendarRef = useRef(null);

  // 예하 트리 찾기 함수 (조직 데이터 시스템 사용)
  const getSubordinates = (nodeId) => {
    return getOrgSubordinates(nodeId, organizationTreeData);
  };

  // 2025년 9월 직원 출퇴근 데이터 생성
  const generateAttendanceData = () => {
    const employees = [
      { id: 1, name: "김영업", team: "A팀", position: "팀장" },
      { id: 2, name: "이마케팅", team: "A팀", position: "팀원" },
      { id: 3, name: "박세일즈", team: "B팀", position: "팀장" },
      { id: 4, name: "최고객", team: "B팀", position: "팀원" },
      { id: 5, name: "정상담", team: "C팀", position: "팀장" },
      { id: 6, name: "홍관리", team: "C팀", position: "팀원" },
    ];

    const data = {};

    // 2025년 9월 1일부터 30일까지
    for (let day = 1; day <= 30; day++) {
      const dateKey = `2025-09-${String(day).padStart(2, "0")}`;
      const dayOfWeek = new Date(2025, 8, day).getDay(); // 0=일요일, 6=토요일

      // 주말은 데이터 없음
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        data[dateKey] = [];
        continue;
      }

      data[dateKey] = employees.map((emp) => {
        // 랜덤하게 출근 시간 생성 (8:30-9:30)
        const checkInHour = 8 + Math.floor(Math.random() * 2);
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkIn = `${String(checkInHour).padStart(2, "0")}:${String(
          checkInMinute
        ).padStart(2, "0")}`;

        // 랜덤하게 퇴근 시간 생성 (17:30-19:30)
        const checkOutHour = 17 + Math.floor(Math.random() * 3);
        const checkOutMinute = Math.floor(Math.random() * 60);
        const checkOut = `${String(checkOutHour).padStart(2, "0")}:${String(
          checkOutMinute
        ).padStart(2, "0")}`;

        // 근무시간 계산
        const checkInTime = new Date(
          `2025-09-${String(day).padStart(2, "0")} ${checkIn}`
        );
        const checkOutTime = new Date(
          `2025-09-${String(day).padStart(2, "0")} ${checkOut}`
        );
        const workMilliseconds = checkOutTime - checkInTime;
        const workHours = Math.floor(workMilliseconds / (1000 * 60 * 60));
        const workMinutes = Math.floor(
          (workMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
        );
        const workHoursText = `${workHours}시간 ${workMinutes}분`;

        // 다양한 근무 상황 생성
        const random = Math.random();
        if (random < 0.05) {
          // 5% 확률로 미출근
          return {
            ...emp,
            checkIn: "-",
            checkOut: "-",
            workHours: "-",
          };
        } else if (random < 0.15) {
          // 10% 확률로 퇴근 안함 (근무중)
          return {
            ...emp,
            checkIn,
            checkOut: "--",
            workHours: "--",
          };
        } else {
          return {
            ...emp,
            checkIn,
            checkOut,
            workHours: workHoursText,
          };
        }
      });
    }

    return data;
  };

  const attendanceData = generateAttendanceData();

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 날짜 포맷팅
  const formatDate = (date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 날짜 변경 함수
  const changeDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(newDate);
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

    // 이전 달의 마지막 날들
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }

    // 다음 달의 첫 날들 (총 42개가 되도록)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  // 달력 월 변경
  const changeCalendarMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  // 오늘 날짜 확인
  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 선택된 날짜 확인
  const isSelectedDate = (date) => {
    return (
      date &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // 해당 날짜의 출근 데이터 가져오기
  const getAttendanceForDate = (date) => {
    const dateKey = formatDateKey(date);
    return attendanceData[dateKey] || [];
  };

  const currentAttendance = getAttendanceForDate(selectedDate);

  // 직원 클릭 핸들러
  const handleEmployeeClick = (employee) => {
    // 조직 데이터에서 해당 직원을 찾거나 임시 데이터 생성
    const allEmployees = getAllEmployees();
    let foundEmployee = allEmployees.find(
      (emp) => emp.name === employee.name || emp.displayName === employee.name
    );

    if (!foundEmployee) {
      // 조직 데이터에 없는 경우 임시 직원 데이터 생성
      foundEmployee = {
        id: employee.id,
        type: "member",
        name: employee.name,
        position: employee.position,
        email: `${employee.name
          .toLowerCase()
          .replace(/\s+/g, ".")}@company.com`,
        phone: "010-0000-0000", // 기본값
        team: employee.team,
      };
    }

    const transformedEmployee = transformEmployeeForModal(foundEmployee);
    setSelectedEmployee(transformedEmployee);
    setIsEmployeeModalOpen(true);
  };

  return (
    <div className="attn-page">
      <div className="container">
        {/* 페이지 헤더 */}
        <div className="attn-header">
          <h1>🕐 근퇴 관리</h1>
          <p>직원들의 출퇴근 현황을 확인하고 관리하세요</p>
        </div>

        {/* 날짜 선택 영역 */}
        <div className="attn-date-section">
          <div className="attn-date-selector">
            <button className="attn-date-arrow" onClick={() => changeDate(-1)}>
              ◀
            </button>

            <div className="attn-date-display" ref={calendarRef}>
              <button
                className="attn-date-btn"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              >
                {formatDate(selectedDate)}
              </button>

              {/* 달력 드롭다운 */}
              {isCalendarOpen && (
                <div className="attn-calendar-dropdown">
                  <div className="attn-calendar-header">
                    <button
                      className="attn-calendar-nav"
                      onClick={() => changeCalendarMonth(-1)}
                    >
                      ◀
                    </button>
                    <span className="attn-calendar-title">
                      {selectedDate.getFullYear()}년{" "}
                      {selectedDate.getMonth() + 1}월
                    </span>
                    <button
                      className="attn-calendar-nav"
                      onClick={() => changeCalendarMonth(1)}
                    >
                      ▶
                    </button>
                  </div>

                  <div className="attn-calendar-grid">
                    <div className="attn-calendar-weekdays">
                      {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                        <div key={day} className="attn-calendar-weekday">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="attn-calendar-days">
                      {generateCalendarDays().map(
                        ({ date, isCurrentMonth }, index) => (
                          <button
                            key={index}
                            className={`attn-calendar-day ${
                              !isCurrentMonth ? "other-month" : ""
                            } ${isToday(date) ? "today" : ""} ${
                              isSelectedDate(date) ? "selected" : ""
                            }`}
                            onClick={() => {
                              setSelectedDate(date);
                              setIsCalendarOpen(false);
                            }}
                          >
                            {date.getDate()}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="attn-date-arrow" onClick={() => changeDate(1)}>
              ▶
            </button>
          </div>
        </div>

        {/* 출퇴근 현황 테이블 */}
        <div className="attn-table-section">
          <div className="attn-table-header">
            <h2>출퇴근 현황</h2>
            <div className="attn-summary">
              <span className="attn-summary-item">
                총 {currentAttendance.length}명
              </span>
              <span className="attn-summary-item">
                출근{" "}
                {currentAttendance.filter((emp) => emp.checkIn !== "-").length}
                명
              </span>
            </div>
          </div>

          <div className="attn-table-container">
            <table className="attn-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>팀</th>
                  <th>직급</th>
                  <th>출근시간</th>
                  <th>퇴근시간</th>
                  <th>근무시간</th>
                </tr>
              </thead>
              <tbody>
                {currentAttendance.length > 0 ? (
                  currentAttendance.map((employee) => (
                    <tr key={employee.id}>
                      <td
                        className="attn-name attn-clickable-name"
                        onClick={() => handleEmployeeClick(employee)}
                      >
                        {employee.name}
                      </td>
                      <td className="attn-team">{employee.team}</td>
                      <td className="attn-position">{employee.position}</td>
                      <td className="attn-time">{employee.checkIn}</td>
                      <td className="attn-time">{employee.checkOut}</td>
                      <td className="attn-hours">{employee.workHours}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="attn-no-data">
                      해당 날짜에 출퇴근 기록이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 직원 정보 모달 */}
        <GlobalEmployeeModal
          isOpen={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
          employee={selectedEmployee}
          user={user || { role: "admin", position: "팀장" }} // 임시 사용자 정보
          showTeamManagement={true}
          showSubordinates={true}
          subordinates={getSubordinates(2)}
          TreeNodeComponent={TreeNode}
        />
      </div>
    </div>
  );
};

export default AttendancePage;
