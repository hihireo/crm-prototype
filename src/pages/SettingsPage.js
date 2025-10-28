import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import MembersPage from "./settings/MembersPage";
import TeamsPage from "./settings/TeamsPage";
import ChannelSettingsPage from "./settings/ChannelSettingsPage";
import BulkImportHistoryPage from "./settings/BulkImportHistoryPage";
import CustomerApiPage from "./settings/CustomerApiPage";
import "./SettingsPage.css";

const SettingsPage = ({ service, user }) => {
  const location = useLocation();

  const serviceMenus = [
    { id: "general", name: "일반", path: "/settings/general", icon: "⚙️" },
    { id: "profile", name: "프로필", path: "/settings/profile", icon: "👤" },
    {
      id: "channels",
      name: "상담채널",
      path: "/settings/channels",
      icon: "💬",
    },
    {
      id: "customer-api",
      name: "고객등록 API",
      path: "/settings/customer-api",
      icon: "🔗",
    },
    { id: "members", name: "멤버", path: "/settings/members", icon: "👥" },
    { id: "teams", name: "팀 관리", path: "/settings/teams", icon: "🏢" },
    {
      id: "bulk-import",
      name: "일괄 등록 이력",
      path: "/settings/bulk-import",
      icon: "📊",
    },
  ];

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-layout">
          <div className="settings-sidebar">
            <div className="settings-header">
              <h2>서비스 설정</h2>
              <p>{service}</p>
            </div>

            <nav className="settings-nav">
              {serviceMenus.map((menu) => (
                <Link
                  key={menu.id}
                  to={menu.path}
                  className={`settings-nav-link ${
                    location.pathname === menu.path ? "active" : ""
                  }`}
                >
                  <span className="nav-icon">{menu.icon}</span>
                  <span className="nav-text">{menu.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="settings-content">
            <Routes>
              <Route
                path="/general"
                element={<GeneralSettings service={service} user={user} />}
              />
              <Route
                path="/profile"
                element={
                  <ServiceProfileSettings service={service} user={user} />
                }
              />
              <Route
                path="/channels"
                element={<ChannelSettingsPage service={service} />}
              />
              <Route
                path="/customer-api"
                element={<CustomerApiPage service={service} />}
              />
              <Route
                path="/members"
                element={<MembersPage service={service} />}
              />
              <Route path="/teams" element={<TeamsPage service={service} />} />
              <Route
                path="/bulk-import"
                element={<BulkImportHistoryPage service={service} />}
              />
              <Route
                path="/"
                element={<GeneralSettings service={service} user={user} />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

// 일반 설정 컴포넌트
const GeneralSettings = ({ service, user }) => {
  const [useAttendanceMenu, setUseAttendanceMenu] = useState(true);
  const [serviceName, setServiceName] = useState(service || "서비스");
  const [isEditingServiceName, setIsEditingServiceName] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // 서비스 브랜드 아이콘 및 서브도메인 상태
  const [serviceData, setServiceData] = useState({
    icon: null,
    iconPreview: null,
    subdomain: "myservice",
  });
  const [isEditingServiceData, setIsEditingServiceData] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState("");
  const [subdomainError, setSubdomainError] = useState("");

  // 처리상태 관리 상태
  const [statusList, setStatusList] = useState([
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
  ]);
  const [newStatus, setNewStatus] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState("");

  const handleServiceNameSave = () => {
    setIsEditingServiceName(false);
    alert("서비스 이름이 변경되었습니다.");
  };

  const handleServiceNameCancel = () => {
    setServiceName(service || "서비스");
    setIsEditingServiceName(false);
  };

  // 드래그 앤 드롭 상태
  const [isDragging, setIsDragging] = useState(false);

  // 브랜드 아이콘 업로드 처리
  const handleIconUpload = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setServiceData((prev) => ({
        ...prev,
        icon: file,
        iconPreview: e.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // 파일 입력 변경 처리
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleIconUpload(file);
  };

  // 드래그 이벤트 처리
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleIconUpload(files[0]);
    }
  };

  // 아이콘 영역 클릭 처리
  const handleIconAreaClick = () => {
    document.getElementById("service-icon-upload").click();
  };

  // 서브도메인 유효성 검사
  const validateSubdomain = (subdomain) => {
    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomain) return "서브도메인을 입력해주세요.";
    if (subdomain.length < 3) return "서브도메인은 최소 3자 이상이어야 합니다.";
    if (subdomain.length > 30) return "서브도메인은 최대 30자까지 가능합니다.";
    if (!regex.test(subdomain))
      return "영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.";
    if (subdomain.startsWith("-") || subdomain.endsWith("-"))
      return "하이픈(-)으로 시작하거나 끝날 수 없습니다.";
    return "";
  };

  // 서브도메인 중복 확인
  const checkSubdomainAvailability = async (subdomain) => {
    const error = validateSubdomain(subdomain);
    if (error) {
      setSubdomainError(error);
      setSubdomainStatus("");
      return;
    }

    setSubdomainStatus("checking");
    setSubdomainError("");

    // 실제로는 API 호출
    setTimeout(() => {
      const reservedDomains = [
        "admin",
        "api",
        "www",
        "mail",
        "ftp",
        "test",
        "dev",
        "staging",
      ];
      const existingDomains = ["demo", "example", "sample"];

      if (
        reservedDomains.includes(subdomain) ||
        existingDomains.includes(subdomain)
      ) {
        setSubdomainStatus("unavailable");
        setSubdomainError("이미 사용 중이거나 예약된 도메인입니다.");
      } else {
        setSubdomainStatus("available");
        setSubdomainError("");
      }
    }, 1000);
  };

  // 서브도메인 입력 처리
  const handleSubdomainChange = (e) => {
    const value = e.target.value.toLowerCase();
    setServiceData((prev) => ({ ...prev, subdomain: value }));

    setSubdomainStatus("");
    setSubdomainError("");
  };

  // 서비스 데이터 수정 시작
  const handleServiceDataEdit = () => {
    setIsEditingServiceData(true);
  };

  // 서비스 데이터 저장
  const handleServiceDataSave = () => {
    if (serviceData.subdomain && subdomainStatus !== "available") {
      alert("사용 가능한 서브도메인을 입력해주세요.");
      return;
    }

    setIsEditingServiceData(false);
    alert("서비스 정보가 저장되었습니다.");
  };

  // 서비스 데이터 수정 취소
  const handleServiceDataCancel = () => {
    setServiceData({
      icon: null,
      iconPreview: null,
      subdomain: "myservice",
    });
    setSubdomainStatus("");
    setSubdomainError("");
    setIsDragging(false);
    setIsEditingServiceData(false);
  };

  const handleServiceDelete = () => {
    if (deleteConfirmText === serviceName) {
      alert("서비스 삭제 요청이 처리되었습니다.");
      setShowDeleteModal(false);
      setDeleteConfirmText("");
    } else {
      alert("서비스 이름이 일치하지 않습니다.");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText("");
  };

  // 처리상태 관리 함수들
  const handleAddStatus = () => {
    if (newStatus.trim() && !statusList.includes(newStatus.trim())) {
      setStatusList([...statusList, newStatus.trim()]);
      setNewStatus("");
    }
  };

  const handleDeleteStatus = (index) => {
    if (window.confirm(`"${statusList[index]}" 상태를 삭제하시겠습니까?`)) {
      setStatusList(statusList.filter((_, i) => i !== index));
    }
  };

  const handleEditStart = (index) => {
    setEditingIndex(index);
    setEditingValue(statusList[index]);
  };

  const handleEditSave = () => {
    if (editingValue.trim() && !statusList.includes(editingValue.trim())) {
      const newList = [...statusList];
      newList[editingIndex] = editingValue.trim();
      setStatusList(newList);
    }
    setEditingIndex(-1);
    setEditingValue("");
  };

  const handleEditCancel = () => {
    setEditingIndex(-1);
    setEditingValue("");
  };

  return (
    <div className="settings-section">
      <h3>일반 설정</h3>

      {/* 서비스 이름 섹션 */}
      <div className="stgs-service-name-section">
        <div className="stgs-section-header">
          <h4>서비스 이름</h4>
          {!isEditingServiceName && (
            <button
              className="stgs-edit-btn"
              onClick={() => setIsEditingServiceName(true)}
            >
              이름 변경
            </button>
          )}
        </div>

        <div className="stgs-service-name-content">
          {isEditingServiceName ? (
            <div className="stgs-service-name-edit">
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="stgs-input"
                placeholder="서비스 이름을 입력하세요"
              />
              <div className="stgs-service-name-actions">
                <button
                  className="stgs-cancel-btn"
                  onClick={handleServiceNameCancel}
                >
                  취소
                </button>
                <button
                  className="stgs-save-btn"
                  onClick={handleServiceNameSave}
                  disabled={!serviceName.trim()}
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <div className="stgs-service-name-display">
              <span className="stgs-service-name-value">{serviceName}</span>
            </div>
          )}
        </div>
      </div>

      {/* 서비스 브랜드 및 도메인 섹션 */}
      <div className="stgs-service-data-section">
        <div className="stgs-section-header">
          <h4>브랜드 아이콘 및 도메인</h4>
          {!isEditingServiceData && (
            <button className="stgs-edit-btn" onClick={handleServiceDataEdit}>
              수정
            </button>
          )}
        </div>

        <div className="stgs-service-data-content">
          {isEditingServiceData ? (
            <div className="stgs-service-data-edit">
              {/* 브랜드 아이콘 업로드 */}
              <div className="stgs-icon-section">
                <label className="stgs-field-label">브랜드 아이콘</label>
                <div className="stgs-icon-upload-section">
                  <div
                    className={`stgs-icon-preview ${
                      isDragging ? "dragging" : ""
                    } ${serviceData.iconPreview ? "has-image" : ""}`}
                    onClick={handleIconAreaClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {serviceData.iconPreview ? (
                      <>
                        <img
                          src={serviceData.iconPreview}
                          alt="브랜드 아이콘 미리보기"
                        />
                        <div className="stgs-icon-overlay">
                          <span>🔄</span>
                          <p>클릭하여 변경</p>
                        </div>
                      </>
                    ) : (
                      <div className="stgs-icon-placeholder">
                        <span>{isDragging ? "📁" : "🎨"}</span>
                        <p>
                          {isDragging ? "여기에 놓으세요" : "브랜드 아이콘"}
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="service-icon-upload"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: "none" }}
                  />
                  <p className="stgs-upload-hint">
                    PNG, JPG, SVG 파일 (최대 5MB)
                  </p>
                </div>
              </div>

              {/* 서브도메인 설정 */}
              <div className="stgs-subdomain-section">
                <label className="stgs-field-label">서브도메인</label>
                <div className="stgs-subdomain-input-group">
                  <input
                    type="text"
                    className={`stgs-subdomain-input ${
                      subdomainError ? "error" : ""
                    } ${subdomainStatus === "available" ? "success" : ""}`}
                    placeholder="myservice"
                    value={serviceData.subdomain}
                    onChange={handleSubdomainChange}
                    onBlur={() =>
                      serviceData.subdomain &&
                      checkSubdomainAvailability(serviceData.subdomain)
                    }
                  />
                  <span className="stgs-subdomain-suffix">.talkgate.im</span>
                  {subdomainStatus === "checking" && (
                    <div className="stgs-subdomain-status checking">
                      <div className="stgs-loading-spinner"></div>
                    </div>
                  )}
                  {subdomainStatus === "available" && (
                    <div className="stgs-subdomain-status available">✓</div>
                  )}
                  {subdomainStatus === "unavailable" && (
                    <div className="stgs-subdomain-status unavailable">✗</div>
                  )}
                </div>
                {subdomainError && (
                  <p className="stgs-error-message">{subdomainError}</p>
                )}
                {subdomainStatus === "available" && (
                  <p className="stgs-success-message">
                    사용 가능한 도메인입니다!
                  </p>
                )}
                <p className="stgs-input-hint">
                  영문 소문자, 숫자, 하이픈(-) 사용 가능 (3-30자)
                </p>
              </div>

              <div className="stgs-service-data-actions">
                <button
                  className="stgs-cancel-btn"
                  onClick={handleServiceDataCancel}
                >
                  취소
                </button>
                <button
                  className="stgs-save-btn"
                  onClick={handleServiceDataSave}
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <div className="stgs-service-data-display">
              <div className="stgs-current-icon">
                <label className="stgs-field-label">현재 브랜드 아이콘</label>
                <div className="stgs-icon-preview">
                  {serviceData.iconPreview ? (
                    <img
                      src={serviceData.iconPreview}
                      alt="현재 브랜드 아이콘"
                    />
                  ) : (
                    <div className="stgs-icon-placeholder">
                      <span>🎨</span>
                      <p>아이콘 없음</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="stgs-current-subdomain">
                <label className="stgs-field-label">현재 도메인</label>
                <div className="stgs-domain-display">
                  <code>{serviceData.subdomain}.talkgate.im</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 처리상태 관리 섹션 */}
      <div className="stgs-status-section">
        <h4>처리상태 관리</h4>
        <p className="stgs-section-description">
          고객 상담에서 사용될 처리상태를 관리합니다.
        </p>

        {/* 새 상태 추가 */}
        <div className="stgs-status-add">
          <input
            type="text"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            placeholder="새 상태 이름을 입력하세요"
            className="stgs-status-input"
            onKeyPress={(e) => e.key === "Enter" && handleAddStatus()}
          />
          <button
            className="stgs-add-btn"
            onClick={handleAddStatus}
            disabled={!newStatus.trim()}
          >
            추가
          </button>
        </div>

        {/* 상태 목록 */}
        <div className="stgs-status-list">
          {statusList.map((status, index) => (
            <div key={index} className="stgs-status-item">
              {editingIndex === index ? (
                <div className="stgs-status-edit">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="stgs-status-input"
                    onKeyPress={(e) => e.key === "Enter" && handleEditSave()}
                    autoFocus
                  />
                  <div className="stgs-status-actions">
                    <button className="stgs-save-btn" onClick={handleEditSave}>
                      저장
                    </button>
                    <button
                      className="stgs-cancel-btn"
                      onClick={handleEditCancel}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="stgs-status-display">
                  <span className="stgs-status-name">{status}</span>
                  <div className="stgs-status-actions">
                    <button
                      className="stgs-edit-btn"
                      onClick={() => handleEditStart(index)}
                    >
                      수정
                    </button>
                    <button
                      className="stgs-delete-btn"
                      onClick={() => handleDeleteStatus(index)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 서비스 기능 설정 섹션 */}
      <div className="stgs-menu-section">
        <div className="stgs-service-header">
          <h4>서비스 기능</h4>
          <span className="stgs-admin-badge">관리자 전용</span>
        </div>
        <div className="stgs-menu-option">
          <div className="stgs-option-info">
            <label>근태 메뉴 사용</label>
            <p>출퇴근 기능 및 근태메뉴를 활성화 합니다.</p>
          </div>
          <label className="stgs-toggle">
            <input
              type="checkbox"
              checked={useAttendanceMenu}
              onChange={(e) => setUseAttendanceMenu(e.target.checked)}
            />
            <span className="stgs-toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* 서비스 삭제 섹션 */}
      <div className="stgs-service-delete-section stgs-danger-section">
        <h4>서비스 삭제</h4>
        <p className="stgs-danger-text">
          ⚠️ <strong>주의:</strong> 서비스를 삭제하면 모든 데이터가 영구적으로
          삭제되며 복구할 수 없습니다.
        </p>
        <button
          className="stgs-danger-btn"
          onClick={() => setShowDeleteModal(true)}
        >
          서비스 삭제
        </button>
      </div>

      {/* 서비스 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="stgs-modal-overlay" onClick={handleCancelDelete}>
          <div
            className="stgs-modal-content stgs-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="stgs-modal-header stgs-danger-header">
              <h4>서비스 삭제 확인</h4>
              <button className="stgs-modal-close" onClick={handleCancelDelete}>
                ✕
              </button>
            </div>

            <div className="stgs-modal-body">
              <div className="stgs-delete-warning">
                <div className="stgs-warning-icon">⚠️</div>
                <h5>정말로 서비스를 삭제하시겠습니까?</h5>
                <p>
                  이 작업은 <strong>되돌릴 수 없으며</strong>, 다음 데이터가
                  영구적으로 삭제됩니다:
                </p>
                <ul className="stgs-delete-list">
                  <li>모든 상담 기록 및 메시지</li>
                  <li>고객 정보 및 상담 내역</li>
                  <li>멤버 및 팀 설정</li>
                  <li>채널 설정 및 연동 정보</li>
                  <li>통계 데이터 및 보고서</li>
                </ul>

                <div className="stgs-confirm-section">
                  <label>
                    서비스 삭제를 확인하려면 아래에 서비스 이름{" "}
                    <strong>"{serviceName}"</strong>을 정확히 입력하세요:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={serviceName}
                    className="stgs-confirm-input"
                  />
                </div>
              </div>
            </div>

            <div className="stgs-modal-footer">
              <button className="stgs-cancel-btn" onClick={handleCancelDelete}>
                취소
              </button>
              <button
                className="stgs-danger-btn"
                onClick={handleServiceDelete}
                disabled={deleteConfirmText !== serviceName}
              >
                서비스 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 서비스 프로필 설정 컴포넌트
const ServiceProfileSettings = ({ service, user }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    profileImage: null,
    nickname: user?.name || "사용자",
    phone: user?.phone || "010-1234-5678",
    team: user?.team || "영업팀",
  });
  const [editableProfile, setEditableProfile] = useState({ ...profileData });

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
    setEditableProfile({ ...profileData });
  };

  const handleProfileSave = () => {
    setProfileData({ ...editableProfile });
    setIsEditingProfile(false);
    alert("프로필이 저장되었습니다.");
  };

  const handleProfileCancel = () => {
    setEditableProfile({ ...profileData });
    setIsEditingProfile(false);
  };

  return (
    <div className="settings-section">
      <h3>서비스 프로필</h3>
      <p className="stgs-section-description">
        서비스에서 사용되는 프로필 정보를 설정합니다.
      </p>

      {/* 프로필 정보 섹션 */}
      <div className="stgs-profile-section">
        <div className="stgs-section-header">
          <h4>프로필 정보</h4>
          {!isEditingProfile && (
            <button className="stgs-edit-btn" onClick={handleProfileEdit}>
              프로필 수정
            </button>
          )}
        </div>

        <div className="stgs-profile-content">
          <div className="stgs-profile-image-section">
            <div className="stgs-profile-image">
              {(
                isEditingProfile
                  ? editableProfile.profileImage
                  : profileData.profileImage
              ) ? (
                <img
                  src={
                    isEditingProfile
                      ? editableProfile.profileImage
                      : profileData.profileImage
                  }
                  alt="프로필"
                />
              ) : (
                <div className="stgs-profile-placeholder">
                  {(isEditingProfile
                    ? editableProfile.nickname
                    : profileData.nickname
                  ).charAt(0)}
                </div>
              )}
            </div>
            {/* {isEditingProfile && (
              <div className="stgs-image-upload">
                <input
                  type="file"
                  id="serviceProfileImageInput"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="serviceProfileImageInput"
                  className="stgs-upload-btn"
                >
                  사진 변경
                </label>
              </div>
            )} */}
          </div>

          <div className="stgs-profile-info">
            <div className="stgs-info-grid">
              <div className="stgs-info-field">
                <label>닉네임</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editableProfile.nickname}
                    onChange={(e) =>
                      setEditableProfile((prev) => ({
                        ...prev,
                        nickname: e.target.value,
                      }))
                    }
                    className="stgs-input"
                  />
                ) : (
                  <span className="stgs-info-value">
                    {profileData.nickname}
                  </span>
                )}
              </div>

              <div className="stgs-info-field">
                <label>연락처</label>
                {isEditingProfile ? (
                  <input
                    type="tel"
                    value={editableProfile.phone}
                    onChange={(e) =>
                      setEditableProfile((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="stgs-input"
                  />
                ) : (
                  <span className="stgs-info-value">{profileData.phone}</span>
                )}
              </div>

              <div className="stgs-info-field">
                <label>소속팀</label>
                <span className="stgs-info-value">{profileData.team}</span>
              </div>
            </div>

            {isEditingProfile && (
              <div className="stgs-profile-actions">
                <button
                  className="stgs-cancel-btn"
                  onClick={handleProfileCancel}
                >
                  취소
                </button>
                <button className="stgs-save-btn" onClick={handleProfileSave}>
                  저장
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
