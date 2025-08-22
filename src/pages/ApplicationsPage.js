import React, { useState } from "react";
import "./ApplicationsPage.css";

const ApplicationsPage = () => {
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
      status: "진행중",
      checked: false,
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
      status: "완료",
      checked: false,
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
      assignmentTime: null,
      landingType: "PC",
      team: "영업2팀",
      manager: null,
      status: "배정대기",
      checked: false,
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
      status: "진행중",
      checked: false,
    },
  ]);

  const [checkedItems, setCheckedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    team: "all",
    mediaCompany: "all",
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
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "완료":
        return "status-completed";
      case "진행중":
        return "status-progress";
      case "대기":
        return "status-waiting";
      case "배정대기":
        return "status-pending";
      default:
        return "";
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filters.status !== "all" && app.status !== filters.status) return false;
    if (filters.team !== "all" && app.team !== filters.team) return false;
    if (
      filters.mediaCompany !== "all" &&
      app.mediaCompany !== filters.mediaCompany
    )
      return false;
    return true;
  });

  return (
    <div className="applications-page">
      <div className="container">
        <div className="page-header">
          <h1>신청현황</h1>
          <p>고객 신청 데이터를 확인하고 관리하세요</p>
        </div>

        <div className="applications-controls">
          <div className="filter-section">
            <div className="filter-group">
              <label>처리상태:</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="all">전체</option>
                <option value="완료">완료</option>
                <option value="진행중">진행중</option>
                <option value="대기">대기</option>
                <option value="배정대기">배정대기</option>
              </select>
            </div>

            <div className="filter-group">
              <label>담당팀:</label>
              <select
                value={filters.team}
                onChange={(e) => handleFilterChange("team", e.target.value)}
              >
                <option value="all">전체</option>
                <option value="영업1팀">영업1팀</option>
                <option value="영업2팀">영업2팀</option>
                <option value="영업3팀">영업3팀</option>
              </select>
            </div>

            <div className="filter-group">
              <label>매체사:</label>
              <select
                value={filters.mediaCompany}
                onChange={(e) =>
                  handleFilterChange("mediaCompany", e.target.value)
                }
              >
                <option value="all">전체</option>
                <option value="네이버">네이버</option>
                <option value="구글">구글</option>
                <option value="페이스북">페이스북</option>
                <option value="카카오">카카오</option>
              </select>
            </div>
          </div>

          <div className="action-section">
            <button className="btn btn-primary">일괄 배정</button>
            <button className="btn btn-secondary">엑셀 다운로드</button>
          </div>
        </div>

        <div className="applications-table-container">
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
                <th>번호</th>
                <th>매체사</th>
                <th>신청경로</th>
                <th>사이트명</th>
                <th>코드명</th>
                <th>신청자</th>
                <th>연락처</th>
                <th>메모</th>
                <th>신청시간</th>
                <th>배정시간</th>
                <th>랜딩구분</th>
                <th>담당팀</th>
                <th>담당자</th>
                <th>처리상태</th>
                <th>수정</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={checkedItems.has(app.id)}
                      onChange={() => handleCheckItem(app.id)}
                    />
                  </td>
                  <td>{app.number}</td>
                  <td>{app.mediaCompany}</td>
                  <td>{app.applicationPath}</td>
                  <td>{app.siteName}</td>
                  <td>{app.codeName}</td>
                  <td>{app.applicantName}</td>
                  <td>{app.contact}</td>
                  <td>
                    <div className="memo-cell" title={app.memo}>
                      {app.memo}
                    </div>
                  </td>
                  <td>{app.applicationTime}</td>
                  <td>{app.assignmentTime || "-"}</td>
                  <td>{app.landingType}</td>
                  <td>{app.team}</td>
                  <td>{app.manager || "-"}</td>
                  <td>
                    <span
                      className={`status-badge ${getStatusColor(app.status)}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon edit-btn">✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
};

export default ApplicationsPage;
