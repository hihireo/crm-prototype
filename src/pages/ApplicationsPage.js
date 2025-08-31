import React, { useState, useEffect, useCallback } from "react";
import CustomerInfoModal from "../components/CustomerInfoModal";
import CustomerAssignmentModal from "../components/CustomerAssignmentModal";
import CustomerRegistrationModal from "../components/CustomerRegistrationModal";
import "./ApplicationsPage.css";

const ApplicationsPage = () => {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // 현재 사용자 정보 (실제로는 props나 context에서 받아올 데이터)
  const currentUser = {
    name: "김관리자",
    role: "관리자", // "관리자" 또는 "팀장"
    team: "전체",
  };

  // 드롭다운 옵션들
  const applicationPathOptions = [
    "검색광고",
    "디스플레이광고",
    "소셜광고",
    "DA광고",
    "블로그광고",
  ];

  const mediaCompanyOptions = [
    "네이버",
    "구글",
    "페이스북",
    "카카오",
    "인스타그램",
  ];

  const siteNameOptions = [
    "부동산전문",
    "교육컨설팅",
    "펜션예약",
    "헬스케어",
    "인테리어",
  ];

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
          category: "일반",
          content: "초기 상담 완료, 투자 관심 있음",
          timestamp: "2024-01-11 10:30",
        },
        {
          id: 2,
          category: "재상담",
          content: "추가 자료 요청",
          timestamp: "2024-01-12 14:20",
        },
        {
          id: 3,
          category: "관리중",
          content: "재상담 예정",
          timestamp: "2024-01-13 16:45",
        },
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
          category: "일반",
          content: "교육 과정 안내 완료",
          timestamp: "2024-01-11 09:15",
        },
        {
          id: 2,
          category: "결제완료",
          content: "수강 신청 완료",
          timestamp: "2024-01-12 11:30",
        },
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
        {
          id: 1,
          category: "일반",
          content: "인테리어 상담 진행",
          timestamp: "2024-01-11 13:20",
        },
        {
          id: 2,
          category: "관리중",
          content: "견적서 발송",
          timestamp: "2024-01-12 15:10",
        },
        {
          id: 3,
          category: "결제유력",
          content: "계약 검토 중",
          timestamp: "2024-01-13 10:45",
        },
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
    phone: "",
    consultationContent: "",
    applicationPath: "all",
    mediaCompany: "all",
    siteName: "all",
    team: "all",
    manager: "all",
    consultationCategories: [],
    applicationStartDate: "",
    applicationEndDate: "",
    assignmentStartDate: "",
    assignmentEndDate: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    name: "",
    phone: "",
    consultationContent: "",
    applicationPath: "all",
    mediaCompany: "all",
    siteName: "all",
    team: "all",
    manager: "all",
    consultationCategories: [],
    applicationStartDate: "",
    applicationEndDate: "",
    assignmentStartDate: "",
    assignmentEndDate: "",
  });

  // 상담 카테고리 옵션
  const consultationCategories = [
    "일반",
    "부재",
    "재상담",
    "관리중",
    "AS요청",
    "AS확정",
    "실패",
    "결제완료",
    "무료방안내",
    "무료방입장",
    "결제유력",
  ];

  // 드롭다운 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      phone: "",
      consultationContent: "",
      applicationPath: "all",
      mediaCompany: "all",
      siteName: "all",
      team: "all",
      manager: "all",
      consultationCategories: [],
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

  // 상담 카테고리 다중 선택 핸들러
  const handleConsultationCategoryToggle = (category) => {
    setFilters((prev) => {
      const currentCategories = prev.consultationCategories;
      const isSelected = currentCategories.includes(category);

      if (isSelected) {
        return {
          ...prev,
          consultationCategories: currentCategories.filter(
            (c) => c !== category
          ),
        };
      } else {
        return {
          ...prev,
          consultationCategories: [...currentCategories, category],
        };
      }
    });
  };

  // 카테고리 제거 핸들러
  const handleRemoveCategory = (categoryToRemove) => {
    setFilters((prev) => ({
      ...prev,
      consultationCategories: prev.consultationCategories.filter(
        (category) => category !== categoryToRemove
      ),
    }));
  };

  // 드롭다운 외부 클릭 감지
  const handleDropdownClickOutside = useCallback((e) => {
    if (!e.target.closest(".apcl-category-dropdown-container")) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", handleDropdownClickOutside);
      return () => {
        document.removeEventListener("click", handleDropdownClickOutside);
      };
    }
  }, [isDropdownOpen, handleDropdownClickOutside]);

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

  const handleMouseMove = useCallback(
    (e) => {
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
    },
    [tooltipData.visible]
  );

  // 마우스 이벤트 등록
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

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

  const handleCustomerRegistration = (newCustomer) => {
    // 새로운 고객을 applications 배열에 추가
    const customerWithNumber = {
      ...newCustomer,
      number: `APP-2024-${String(applications.length + 1).padStart(3, "0")}`,
      codeName: `CUST${String(applications.length + 1).padStart(3, "0")}`,
      contact: newCustomer.phone1,
      checked: false,
    };

    // 실제로는 API 호출이나 상태 업데이트를 통해 처리
    console.log("새로운 고객이 등록되었습니다:", customerWithNumber);

    // 모달 닫기
    setIsRegistrationModalOpen(false);
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
      appliedFilters.phone &&
      !app.contact.toLowerCase().includes(appliedFilters.phone.toLowerCase())
    )
      return false;

    // 상담 내용 검색 필터
    if (
      appliedFilters.consultationContent &&
      !app.consultations?.some((consultation) =>
        consultation.content
          .toLowerCase()
          .includes(appliedFilters.consultationContent.toLowerCase())
      )
    )
      return false;

    // 드롭다운 선택 필터
    if (
      appliedFilters.applicationPath !== "all" &&
      app.applicationPath !== appliedFilters.applicationPath
    )
      return false;
    if (
      appliedFilters.mediaCompany !== "all" &&
      app.mediaCompany !== appliedFilters.mediaCompany
    )
      return false;
    if (
      appliedFilters.siteName !== "all" &&
      app.siteName !== appliedFilters.siteName
    )
      return false;
    if (appliedFilters.team !== "all" && app.team !== appliedFilters.team)
      return false;
    if (
      appliedFilters.manager !== "all" &&
      app.manager !== appliedFilters.manager
    )
      return false;

    // 상담 카테고리 필터 (다중 선택)
    if (appliedFilters.consultationCategories.length > 0) {
      const hasMatchingCategory = app.consultations?.some((consultation) =>
        appliedFilters.consultationCategories.includes(consultation.category)
      );
      if (!hasMatchingCategory) return false;
    }

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
        <div className="apcl-filter-container">
          <div className="apcl-filter-section">
            {/* 첫 번째 행: 이름, 핸드폰번호 */}
            <div className="apcl-filter-row">
              <div className="apcl-filter-group">
                <label>이름:</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  placeholder="이름 검색"
                  className="apcl-filter-input"
                />
              </div>
              <div className="apcl-filter-group">
                <label>핸드폰번호:</label>
                <input
                  type="text"
                  value={filters.phone}
                  onChange={(e) => handleFilterChange("phone", e.target.value)}
                  placeholder="핸드폰번호 검색"
                  className="apcl-filter-input"
                />
              </div>
            </div>

            {/* 두 번째 행: 상담 내용 검색 (단독) */}
            <div className="apcl-filter-row">
              <div className="apcl-filter-group apcl-consultation-content-group">
                <label>상담 내용:</label>
                <input
                  type="text"
                  value={filters.consultationContent}
                  onChange={(e) =>
                    handleFilterChange("consultationContent", e.target.value)
                  }
                  placeholder="상담 내용 검색"
                  className="apcl-filter-input apcl-consultation-content-input"
                />
              </div>
            </div>

            {/* 네 번째 행: 담당팀, 담당자 */}
            <div className="apcl-filter-row">
              <div className="apcl-filter-group">
                <label>담당팀:</label>
                <select
                  value={filters.team}
                  onChange={(e) => handleFilterChange("team", e.target.value)}
                  className="apcl-filter-select"
                >
                  <option value="all">전체</option>
                  <option value="영업1팀">영업1팀</option>
                  <option value="영업2팀">영업2팀</option>
                  <option value="영업3팀">영업3팀</option>
                </select>
              </div>
              <div className="apcl-filter-group">
                <label>담당자:</label>
                <select
                  value={filters.manager}
                  onChange={(e) =>
                    handleFilterChange("manager", e.target.value)
                  }
                  className="apcl-filter-select"
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
              <div className="apcl-filter-group">
                <label>신청경로:</label>
                <select
                  value={filters.applicationPath}
                  onChange={(e) =>
                    handleFilterChange("applicationPath", e.target.value)
                  }
                  className="apcl-filter-select"
                >
                  <option value="all">전체</option>
                  {applicationPathOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="apcl-filter-group">
                <label>매체사:</label>
                <select
                  value={filters.mediaCompany}
                  onChange={(e) =>
                    handleFilterChange("mediaCompany", e.target.value)
                  }
                  className="apcl-filter-select"
                >
                  <option value="all">전체</option>
                  {mediaCompanyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="apcl-filter-group">
                <label>사이트:</label>
                <select
                  value={filters.siteName}
                  onChange={(e) =>
                    handleFilterChange("siteName", e.target.value)
                  }
                  className="apcl-filter-select"
                >
                  <option value="all">전체</option>
                  {siteNameOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 상담 카테고리 필터 - 별도 행 */}
            <div className="apcl-filter-row">
              <div className="apcl-filter-group apcl-consultation-category-group">
                <label>상담 카테고리:</label>
                <div className="apcl-category-filter-container">
                  <div className="apcl-category-dropdown-container">
                    {/* 드롭다운 버튼 */}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="apcl-dropdown-trigger"
                    >
                      <span className="apcl-dropdown-text">
                        {filters.consultationCategories.length === 0
                          ? "카테고리 선택"
                          : `${filters.consultationCategories.length}개 선택됨`}
                      </span>
                      <svg
                        className={`apcl-dropdown-icon ${
                          isDropdownOpen ? "apcl-dropdown-icon-open" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {isDropdownOpen && (
                      <div className="apcl-dropdown-menu">
                        {/* 카테고리 옵션들 */}
                        <div className="apcl-dropdown-options">
                          {consultationCategories.map((category) => (
                            <label
                              key={category}
                              className="apcl-dropdown-option"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleConsultationCategoryToggle(category);
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={filters.consultationCategories.includes(
                                  category
                                )}
                                onChange={() => {}} // 빈 함수로 설정하여 label onClick으로만 처리
                                className="apcl-checkbox"
                              />
                              <span className="apcl-checkbox-label">
                                {category}
                              </span>
                            </label>
                          ))}
                        </div>

                        {/* 드롭다운 하단 액션 */}
                        <div className="apcl-dropdown-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setFilters((prev) => ({
                                ...prev,
                                consultationCategories: [],
                              }));
                            }}
                            className="apcl-clear-all"
                          >
                            전체 해제
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(false)}
                            className="apcl-dropdown-close"
                          >
                            완료
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 선택된 카테고리 태그들 - 드롭다운 오른쪽 */}
                  {filters.consultationCategories.length > 0 && (
                    <div className="apcl-selected-tags">
                      {filters.consultationCategories.map((category) => (
                        <span key={category} className="apcl-category-tag">
                          {category}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(category)}
                            className="apcl-tag-remove"
                            aria-label={`${category} 제거`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 날짜 범위 필터 */}
            <div className="apcl-filter-row">
              <div className="apcl-filter-group apcl-date-group">
                <label>신청시간:</label>
                <input
                  type="date"
                  value={filters.applicationStartDate}
                  onChange={(e) =>
                    handleFilterChange("applicationStartDate", e.target.value)
                  }
                  className="apcl-filter-date"
                />
                <span className="apcl-date-separator">~</span>
                <input
                  type="date"
                  value={filters.applicationEndDate}
                  onChange={(e) =>
                    handleFilterChange("applicationEndDate", e.target.value)
                  }
                  className="apcl-filter-date"
                />
              </div>
              <div className="apcl-filter-group apcl-date-group">
                <label>배정시간:</label>
                <input
                  type="date"
                  value={filters.assignmentStartDate}
                  onChange={(e) =>
                    handleFilterChange("assignmentStartDate", e.target.value)
                  }
                  className="apcl-filter-date"
                />
                <span className="apcl-date-separator">~</span>
                <input
                  type="date"
                  value={filters.assignmentEndDate}
                  onChange={(e) =>
                    handleFilterChange("assignmentEndDate", e.target.value)
                  }
                  className="apcl-filter-date"
                />
              </div>
            </div>

            {/* 필터 버튼 */}
            <div className="apcl-filter-actions">
              <button
                className="apcl-filter-btn apcl-filter-apply"
                onClick={handleFilterApply}
              >
                필터 적용
              </button>
              <button
                className="apcl-filter-btn apcl-filter-reset"
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
            <button
              className="btn btn-primary"
              onClick={() => setIsRegistrationModalOpen(true)}
              style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
            >
              고객 등록
            </button>
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

      {/* 고객 등록 모달 */}
      <CustomerRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onRegister={handleCustomerRegistration}
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
