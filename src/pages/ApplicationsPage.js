import React, { useState, useEffect } from "react";
import CustomerInfoModal from "../components/CustomerInfoModal";
import CustomerAssignmentModal from "../components/CustomerAssignmentModal";
import "./ApplicationsPage.css";

const ApplicationsPage = () => {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // 현재 사용자 정보 (실제로는 props나 context에서 받아올 데이터)
  const currentUser = {
    name: "김관리자",
    role: "관리자", // "관리자" 또는 "팀장"
    team: "전체",
  };

  const [applications] = useState([
    {
      id: 1,
      number: "APP-2024-001",
      mediaCompany: "네이버",
      applicationPath: "검색광고",
      siteName: "부동산전문",
      codeName: "RE001",
      applicantName: "홍길동",
      contact: "010-1234-5678",
      memo: "재상담 희망",
      applicationTime: "2024-01-10 14:30",
      assignmentTime: "2024-01-10 14:35",
      landingType: "PC",
      team: "영업1팀",
      manager: "김영업",
      status: "관리 중",
      checked: false,
      consultations: [
        {
          id: 1,
          content: "초기 상담 완료, 투자 관심 있음",
          timestamp: "2024-01-11 10:30",
        },
        { id: 2, content: "추가 자료 요청", timestamp: "2024-01-12 14:20" },
        { id: 3, content: "재상담 예정", timestamp: "2024-01-13 16:45" },
      ],
    },
    {
      id: 2,
      number: "APP-2024-002",
      mediaCompany: "구글",
      applicationPath: "디스플레이광고",
      siteName: "교육컨설팅",
      codeName: "ED001",
      applicantName: "김철수",
      contact: "010-2345-6789",
      memo: "온라인 수업 문의",
      applicationTime: "2024-01-10 15:15",
      assignmentTime: "2024-01-10 15:20",
      landingType: "모바일",
      team: "영업2팀",
      manager: "이상담",
      status: "종료",
      checked: false,
      consultations: [
        {
          id: 1,
          content: "교육 과정 안내 완료",
          timestamp: "2024-01-11 09:15",
        },
        { id: 2, content: "수강 신청 완료", timestamp: "2024-01-12 11:30" },
      ],
    },
    {
      id: 3,
      number: "APP-2024-003",
      mediaCompany: "페이스북",
      applicationPath: "소셜광고",
      siteName: "펜션예약",
      codeName: "TR001",
      applicantName: "박영희",
      contact: "010-3456-7890",
      memo: "휴가철 예약",
      applicationTime: "2024-01-10 16:45",
      assignmentTime: "2024-01-10 16:50",
      landingType: "모바일",
      team: "영업1팀",
      manager: "최고객",
      status: "대기",
      checked: false,
      consultations: [],
    },
    {
      id: 4,
      number: "APP-2024-004",
      mediaCompany: "카카오",
      applicationPath: "DA광고",
      siteName: "헬스케어",
      codeName: "HC001",
      applicantName: "이민수",
      contact: "010-4567-8901",
      memo: "건강검진 문의",
      applicationTime: "2024-01-10 17:20",
      assignmentTime: "2024-01-10 17:20",
      landingType: "PC",
      team: "영업2팀",
      manager: null,
      status: "대기",
      checked: false,
      consultations: [],
    },
    {
      id: 5,
      number: "APP-2024-005",
      mediaCompany: "네이버",
      applicationPath: "블로그광고",
      siteName: "인테리어",
      codeName: "IN001",
      applicantName: "정수진",
      contact: "010-5678-9012",
      memo: "신축 아파트",
      applicationTime: "2024-01-10 18:10",
      assignmentTime: "2024-01-10 18:15",
      landingType: "모바일",
      team: "영업3팀",
      manager: "박인테리어",
      status: "관리 중",
      checked: false,
      consultations: [
        { id: 1, content: "인테리어 상담 진행", timestamp: "2024-01-11 13:20" },
        { id: 2, content: "견적서 발송", timestamp: "2024-01-12 15:10" },
        { id: 3, content: "계약 검토 중", timestamp: "2024-01-13 10:45" },
      ],
    },
  ]);

  const [checkedItems, setCheckedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [tooltipData, setTooltipData] = useState({
    visible: false,
    x: 0,
    y: 0,
    consultations: [],
    applicantName: "",
  });
  const [filters, setFilters] = useState({
    name: "",
    applicationPath: "",
    mediaCompany: "",
    siteName: "",
    team: "all",
    manager: "all",
    status: "all",
    applicationStartDate: "",
    applicationEndDate: "",
    assignmentStartDate: "",
    assignmentEndDate: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    name: "",
    applicationPath: "",
    mediaCompany: "",
    siteName: "",
    team: "all",
    manager: "all",
    status: "all",
    applicationStartDate: "",
    applicationEndDate: "",
    assignmentStartDate: "",
    assignmentEndDate: "",
  });

  const handleCheckItem = (id) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(id)) {
      newCheckedItems.delete(id);
    } else {
      newCheckedItems.add(id);
    }
    setCheckedItems(newCheckedItems);
    setSelectAll(newCheckedItems.size === applications.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setCheckedItems(new Set());
    } else {
      setCheckedItems(new Set(applications.map((app) => app.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
      // 담당팀이 변경되면 담당자를 전체로 초기화
      ...(filterType === "team" && { manager: "all" }),
    }));
  };

  const handleFilterReset = () => {
    const resetFilters = {
      name: "",
      applicationPath: "",
      mediaCompany: "",
      siteName: "",
      team: "all",
      manager: "all",
      status: "all",
      applicationStartDate: "",
      applicationEndDate: "",
      assignmentStartDate: "",
      assignmentEndDate: "",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const handleFilterApply = () => {
    setAppliedFilters({ ...filters });
  };

  // 마우스 호버 이벤트 핸들러
  const handleMouseEnter = (e, app) => {
    setTooltipData({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY + 10,
      consultations: app.consultations || [],
      applicantName: app.applicantName,
    });
  };

  const handleMouseLeave = () => {
    setTooltipData((prev) => ({ ...prev, visible: false }));
  };

  const handleMouseMove = (e) => {
    if (tooltipData.visible) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 320; // 툴팁의 대략적인 너비
      const tooltipHeight = 200; // 툴팁의 대략적인 높이

      let x = e.clientX + 10;
      let y = e.clientY + 10;

      // 오른쪽 경계 체크
      if (x + tooltipWidth > viewportWidth - 20) {
        x = e.clientX - tooltipWidth - 10;
      }

      // 아래쪽 경계 체크
      if (y + tooltipHeight > viewportHeight - 20) {
        y = e.clientY - tooltipHeight - 10;
      }

      // 최소 여백 보장
      x = Math.max(10, x);
      y = Math.max(10, y);

      setTooltipData((prev) => ({
        ...prev,
        x,
        y,
      }));
    }
  };

  // 마우스 이벤트 등록
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [tooltipData.visible]);

  const handleRowClick = (app) => {
    setSelectedCustomer({
      name: app.applicantName,
      phone: app.contact,
      age: "",
      workplace: app.team,
      ssn: "",
      memo: app.memo,
      // 추가 정보들을 앱 데이터에서 매핑
    });
    setIsCustomerModalOpen(true);
  };

  const handleBulkAssignment = () => {
    if (checkedItems.size === 0) {
      alert("배정할 고객을 선택해주세요.");
      return;
    }
    setIsAssignmentModalOpen(true);
  };

  const getSelectedCustomers = () => {
    return applications
      .filter((app) => checkedItems.has(app.id))
      .map((app) => ({
        id: app.id,
        name: app.applicantName,
        phone: app.contact,
        applicationNumber: app.number,
      }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "종료":
        return "status-completed";
      case "관리 중":
        return "status-progress";
      case "대기":
        return "status-waiting";
      default:
        return "";
    }
  };

  const filteredApplications = applications.filter((app) => {
    // 문자열 검색 필터
    if (
      appliedFilters.name &&
      !app.applicantName
        .toLowerCase()
        .includes(appliedFilters.name.toLowerCase())
    )
      return false;
    if (
      appliedFilters.applicationPath &&
      !app.applicationPath
        .toLowerCase()
        .includes(appliedFilters.applicationPath.toLowerCase())
    )
      return false;
    if (
      appliedFilters.mediaCompany &&
      !app.mediaCompany
        .toLowerCase()
        .includes(appliedFilters.mediaCompany.toLowerCase())
    )
      return false;
    if (
      appliedFilters.siteName &&
      !app.siteName
        .toLowerCase()
        .includes(appliedFilters.siteName.toLowerCase())
    )
      return false;

    // 드롭다운 선택 필터
    if (appliedFilters.team !== "all" && app.team !== appliedFilters.team)
      return false;
    if (
      appliedFilters.manager !== "all" &&
      app.manager !== appliedFilters.manager
    )
      return false;
    if (appliedFilters.status !== "all" && app.status !== appliedFilters.status)
      return false;

    // 날짜 범위 필터 (신청시간)
    if (appliedFilters.applicationStartDate) {
      const appDate = new Date(app.applicationTime.split(" ")[0]);
      const startDate = new Date(appliedFilters.applicationStartDate);
      if (appDate < startDate) return false;
    }
    if (appliedFilters.applicationEndDate) {
      const appDate = new Date(app.applicationTime.split(" ")[0]);
      const endDate = new Date(appliedFilters.applicationEndDate);
      if (appDate > endDate) return false;
    }

    // 날짜 범위 필터 (배정시간)
    if (appliedFilters.assignmentStartDate && app.assignmentTime) {
      const assignDate = new Date(app.assignmentTime.split(" ")[0]);
      const startDate = new Date(appliedFilters.assignmentStartDate);
      if (assignDate < startDate) return false;
    }
    if (appliedFilters.assignmentEndDate && app.assignmentTime) {
      const assignDate = new Date(app.assignmentTime.split(" ")[0]);
      const endDate = new Date(appliedFilters.assignmentEndDate);
      if (assignDate > endDate) return false;
    }

    return true;
  });

  return (
    <div className="applications-page">
      <div className="container">
        <div className="page-header">
          <h1>고객목록</h1>
          <p>고객 데이터를 확인하고 관리하세요</p>
        </div>

        {/* 필터 영역 */}
        <div className="ap-filter-container">
          <div className="ap-filter-section">
            {/* 문자열 검색 필터 */}
            <div className="ap-filter-row">
              <div className="ap-filter-group">
                <label>이름:</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  placeholder="이름 검색"
                  className="ap-filter-input"
                />
              </div>
              <div className="ap-filter-group">
                <label>신청경로:</label>
                <input
                  type="text"
                  value={filters.applicationPath}
                  onChange={(e) =>
                    handleFilterChange("applicationPath", e.target.value)
                  }
                  placeholder="신청경로 검색"
                  className="ap-filter-input"
                />
              </div>
              <div className="ap-filter-group">
                <label>매체사:</label>
                <input
                  type="text"
                  value={filters.mediaCompany}
                  onChange={(e) =>
                    handleFilterChange("mediaCompany", e.target.value)
                  }
                  placeholder="매체사 검색"
                  className="ap-filter-input"
                />
              </div>
              <div className="ap-filter-group">
                <label>사이트:</label>
                <input
                  type="text"
                  value={filters.siteName}
                  onChange={(e) =>
                    handleFilterChange("siteName", e.target.value)
                  }
                  placeholder="사이트 검색"
                  className="ap-filter-input"
                />
              </div>
            </div>

            {/* 드롭다운 필터 */}
            <div className="ap-filter-row">
              <div className="ap-filter-group">
                <label>담당팀:</label>
                <select
                  value={filters.team}
                  onChange={(e) => handleFilterChange("team", e.target.value)}
                  className="ap-filter-select"
                >
                  <option value="all">전체</option>
                  <option value="영업1팀">영업1팀</option>
                  <option value="영업2팀">영업2팀</option>
                  <option value="영업3팀">영업3팀</option>
                </select>
              </div>
              <div className="ap-filter-group">
                <label>담당자:</label>
                <select
                  value={filters.manager}
                  onChange={(e) =>
                    handleFilterChange("manager", e.target.value)
                  }
                  className="ap-filter-select"
                  disabled={filters.team === "all"}
                >
                  <option value="all">전체</option>
                  {filters.team === "영업1팀" && (
                    <>
                      <option value="김영업">김영업</option>
                      <option value="최고객">최고객</option>
                    </>
                  )}
                  {filters.team === "영업2팀" && (
                    <>
                      <option value="이상담">이상담</option>
                    </>
                  )}
                  {filters.team === "영업3팀" && (
                    <>
                      <option value="박인테리어">박인테리어</option>
                    </>
                  )}
                </select>
              </div>
              <div className="ap-filter-group">
                <label>처리상태:</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="ap-filter-select"
                >
                  <option value="all">전체</option>
                  <option value="대기">대기</option>
                  <option value="관리 중">관리 중</option>
                  <option value="종료">종료</option>
                </select>
              </div>
            </div>

            {/* 날짜 범위 필터 */}
            <div className="ap-filter-row">
              <div className="ap-filter-group ap-date-group">
                <label>신청시간:</label>
                <input
                  type="date"
                  value={filters.applicationStartDate}
                  onChange={(e) =>
                    handleFilterChange("applicationStartDate", e.target.value)
                  }
                  className="ap-filter-date"
                />
                <span className="ap-date-separator">~</span>
                <input
                  type="date"
                  value={filters.applicationEndDate}
                  onChange={(e) =>
                    handleFilterChange("applicationEndDate", e.target.value)
                  }
                  className="ap-filter-date"
                />
              </div>
              <div className="ap-filter-group ap-date-group">
                <label>배정시간:</label>
                <input
                  type="date"
                  value={filters.assignmentStartDate}
                  onChange={(e) =>
                    handleFilterChange("assignmentStartDate", e.target.value)
                  }
                  className="ap-filter-date"
                />
                <span className="ap-date-separator">~</span>
                <input
                  type="date"
                  value={filters.assignmentEndDate}
                  onChange={(e) =>
                    handleFilterChange("assignmentEndDate", e.target.value)
                  }
                  className="ap-filter-date"
                />
              </div>
            </div>

            {/* 필터 버튼 */}
            <div className="ap-filter-actions">
              <button
                className="ap-filter-btn ap-filter-apply"
                onClick={handleFilterApply}
              >
                필터 적용
              </button>
              <button
                className="ap-filter-btn ap-filter-reset"
                onClick={handleFilterReset}
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* 액션 버튼 영역 */}
        <div className="ap-action-container">
          <div className="ap-action-section">
            <button className="btn btn-primary" onClick={handleBulkAssignment}>
              일괄 배정
            </button>
            <button className="btn btn-secondary">엑셀 업로드</button>
            <button className="btn btn-secondary">엑셀 다운로드</button>
          </div>
        </div>

        <div className="applications-table-container">
          <div className="ap-table-scroll-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>이름</th>
                  <th>신청경로</th>
                  <th>매체사</th>
                  <th>사이트</th>
                  <th>담당팀</th>
                  <th>담당자</th>
                  <th>신청시간</th>
                  <th>배정시간</th>
                  <th>처리상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="clickable-row"
                    onClick={() => handleRowClick(app)}
                    onMouseEnter={(e) => handleMouseEnter(e, app)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checkedItems.has(app.id)}
                        onChange={() => handleCheckItem(app.id)}
                      />
                    </td>
                    <td>{app.applicantName}</td>
                    <td>{app.applicationPath}</td>
                    <td>{app.mediaCompany}</td>
                    <td>{app.siteName}</td>
                    <td className="ap-bold-cell">{app.team}</td>
                    <td className="ap-bold-cell">{app.manager || "-"}</td>
                    <td>{app.applicationTime}</td>
                    <td>{app.assignmentTime || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-footer">
          <div className="table-info">
            <span>
              총 {filteredApplications.length}건 ({checkedItems.size}개 선택됨)
            </span>
          </div>

          <div className="pagination">
            <button className="btn btn-secondary">이전</button>
            <div className="page-numbers">
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
            </div>
            <button className="btn btn-secondary">다음</button>
          </div>
        </div>
      </div>

      {/* 고객 정보 모달 */}
      <CustomerInfoModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerData={selectedCustomer}
      />

      {/* 고객 배정 모달 */}
      <CustomerAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        selectedCustomers={getSelectedCustomers()}
        currentUser={currentUser}
      />

      {/* 전역 상담 내용 툴팁 */}
      {tooltipData.visible && (
        <div
          className="ap-global-tooltip"
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
          }}
        >
          <div className="ap-tooltip-title">
            {tooltipData.applicantName}님의 최근 상담 내용
          </div>
          {tooltipData.consultations && tooltipData.consultations.length > 0 ? (
            <div className="ap-consultation-list">
              {tooltipData.consultations
                .slice(-3)
                .reverse()
                .map((consultation) => (
                  <div key={consultation.id} className="ap-consultation-item">
                    <div className="ap-consultation-content">
                      {consultation.content}
                    </div>
                    <div className="ap-consultation-time">
                      {consultation.timestamp}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="ap-no-consultation">상담 내용이 없습니다</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
