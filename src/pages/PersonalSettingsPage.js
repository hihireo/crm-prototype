import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import "./PersonalSettingsPage.css";

const PersonalSettingsPage = ({ user }) => {
  const location = useLocation();

  const personalMenus = [
    {
      id: "profile",
      name: "프로필",
      path: "/personal-settings/profile",
      icon: "👤",
    },
    {
      id: "notifications",
      name: "알림",
      path: "/personal-settings/notifications",
      icon: "🔔",
    },
    {
      id: "security",
      name: "보안",
      path: "/personal-settings/security",
      icon: "🔒",
    },
  ];

  return (
    <div className="personal-settings-page">
      <div className="container">
        <div className="psettings-layout">
          <div className="psettings-sidebar">
            <div className="psettings-header">
              <h2>개인 설정</h2>
              <p>{user?.name || "사용자"}</p>
            </div>

            <nav className="psettings-nav">
              {personalMenus.map((menu) => (
                <Link
                  key={menu.id}
                  to={menu.path}
                  className={`psettings-nav-link ${
                    location.pathname === menu.path ? "active" : ""
                  }`}
                >
                  <span className="psettings-nav-icon">{menu.icon}</span>
                  <span className="psettings-nav-text">{menu.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="psettings-content">
            <Routes>
              <Route
                path="/profile"
                element={<ProfileSettings user={user} />}
              />
              <Route
                path="/notifications"
                element={<PersonalNotificationSettings user={user} />}
              />
              <Route
                path="/security"
                element={<PersonalSecuritySettings user={user} />}
              />
              <Route path="/" element={<ProfileSettings user={user} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

// 프로필 설정 컴포넌트
const ProfileSettings = ({ user }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    profileImage: null,
    name: user?.name || "사용자",
    email: user?.email || "user@example.com",
    phone: user?.phone || "010-1234-5678",
    bio: user?.bio || "",
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditableProfile((prev) => ({
          ...prev,
          profileImage: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="psettings-section">
      <h3>프로필 설정</h3>

      <div className="pstgs-profile-section">
        <div className="pstgs-section-header">
          <h4>기본 정보</h4>
          {!isEditingProfile && (
            <button className="pstgs-edit-btn" onClick={handleProfileEdit}>
              프로필 수정
            </button>
          )}
        </div>

        <div className="pstgs-profile-content">
          <div className="pstgs-profile-image-section">
            <div className="pstgs-profile-image">
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
                <div className="pstgs-profile-placeholder">
                  {(isEditingProfile
                    ? editableProfile.name
                    : profileData.name
                  ).charAt(0)}
                </div>
              )}
            </div>
            {isEditingProfile && (
              <div className="pstgs-image-upload">
                <input
                  type="file"
                  id="profileImageInput"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="profileImageInput" className="pstgs-upload-btn">
                  사진 변경
                </label>
              </div>
            )}
          </div>

          <div className="pstgs-profile-info">
            <div className="pstgs-info-grid">
              <div className="pstgs-info-field">
                <label>이름</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editableProfile.name}
                    onChange={(e) =>
                      setEditableProfile((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="pstgs-input"
                  />
                ) : (
                  <span className="pstgs-info-value">{profileData.name}</span>
                )}
              </div>

              <div className="pstgs-info-field">
                <label>이메일</label>
                <span className="pstgs-info-value pstgs-readonly">
                  {profileData.email}
                </span>
                <small className="pstgs-field-note">
                  이메일은 변경할 수 없습니다
                </small>
              </div>

              <div className="pstgs-info-field">
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
                    className="pstgs-input"
                  />
                ) : (
                  <span className="pstgs-info-value">{profileData.phone}</span>
                )}
              </div>

              <div className="pstgs-info-field pstgs-field-full"></div>
            </div>

            {isEditingProfile && (
              <div className="pstgs-profile-actions">
                <button
                  className="pstgs-cancel-btn"
                  onClick={handleProfileCancel}
                >
                  취소
                </button>
                <button className="pstgs-save-btn" onClick={handleProfileSave}>
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

// 개인 알림 설정 컴포넌트
const PersonalNotificationSettings = ({ user }) => {
  const [webPushEnabled, setWebPushEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleWebPushToggle = async () => {
    if (!webPushEnabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setWebPushEnabled(true);
        } else {
          alert("알림 권한이 거부되었습니다.");
        }
      }
    } else {
      setWebPushEnabled(false);
    }
  };

  return (
    <div className="psettings-section">
      <h3>알림 설정</h3>

      <div className="pstgs-notification-section">
        <h4>알림 방식</h4>

        <div className="pstgs-notification-option">
          <div className="pstgs-option-info">
            <label>웹 푸시 알림</label>
            <p>브라우저에서 실시간 알림을 받습니다.</p>
          </div>
          <label className="pstgs-toggle">
            <input
              type="checkbox"
              checked={webPushEnabled}
              onChange={handleWebPushToggle}
            />
            <span className="pstgs-toggle-slider"></span>
          </label>
        </div>

        <div className="pstgs-notification-option">
          <div className="pstgs-option-info">
            <label>이메일 알림</label>
            <p>중요한 알림을 이메일로 받습니다.</p>
          </div>
          <label className="pstgs-toggle">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span className="pstgs-toggle-slider"></span>
          </label>
        </div>

        <div className="pstgs-notification-option">
          <div className="pstgs-option-info">
            <label>알림음</label>
            <p>알림 수신 시 소리를 재생합니다.</p>
          </div>
          <label className="pstgs-toggle">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
            <span className="pstgs-toggle-slider"></span>
          </label>
        </div>

        {webPushEnabled && (
          <div className="pstgs-push-status">
            <p>✅ 웹 푸시 알림이 활성화되었습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 개인 보안 설정 컴포넌트
const PersonalSecuritySettings = ({ user }) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const qrCodeUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4SU`;

  const handle2FAToggle = () => {
    if (!is2FAEnabled) {
      setShow2FASetup(true);
    } else {
      if (window.confirm("2단계 인증을 해제하시겠습니까?")) {
        setIs2FAEnabled(false);
        setShow2FASetup(false);
        setVerificationCode("");
      }
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode === "123456" || verificationCode.length === 6) {
      setIs2FAEnabled(true);
      setShow2FASetup(false);
      setVerificationCode("");
      alert("2단계 인증이 성공적으로 설정되었습니다!");
    } else {
      alert("인증 코드가 올바르지 않습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel2FA = () => {
    setShow2FASetup(false);
    setVerificationCode("");
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    alert("비밀번호가 변경되었습니다.");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordModal(false);
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordModal(false);
  };

  return (
    <div className="psettings-section">
      <h3>보안 설정</h3>

      {/* 2단계 인증 */}
      <div className="pstgs-security-section">
        <h4>2단계 인증</h4>

        {!show2FASetup ? (
          <>
            <div className="pstgs-security-option">
              <div className="pstgs-option-info">
                <label>2단계 인증 (2FA)</label>
                <p>로그인 시 추가 보안 인증을 사용합니다.</p>
              </div>
              <label className="pstgs-toggle">
                <input
                  type="checkbox"
                  checked={is2FAEnabled}
                  onChange={handle2FAToggle}
                />
                <span className="pstgs-toggle-slider"></span>
              </label>
            </div>
            {is2FAEnabled && (
              <div className="pstgs-2fa-info">
                <p>✅ 2단계 인증이 활성화되었습니다.</p>
              </div>
            )}
          </>
        ) : (
          <div className="pstgs-2fa-setup">
            <div className="pstgs-setup-step">
              <h5>1단계: 인증 앱 설정</h5>
              <p>
                Google Authenticator, Authy 등의 인증 앱으로 아래 QR 코드를
                스캔하세요.
              </p>

              <div className="pstgs-qr-section">
                <div className="pstgs-qr-code">
                  <img src={qrCodeUrl} alt="2FA QR 코드" />
                </div>
                <div className="pstgs-qr-info">
                  <p>
                    <strong>수동 입력 코드:</strong>
                  </p>
                  <code className="pstgs-manual-code">JBSWY3DPEHPK3PXP</code>
                  <p className="pstgs-qr-note">
                    QR 코드를 스캔할 수 없는 경우 위 코드를 수동으로 입력하세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="pstgs-setup-step">
              <h5>2단계: 인증 코드 입력</h5>
              <p>인증 앱에서 생성된 6자리 코드를 입력하세요.</p>

              <div className="pstgs-verify-section">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  placeholder="123456"
                  className="pstgs-verify-input"
                  maxLength="6"
                />
                <div className="pstgs-verify-actions">
                  <button
                    className="pstgs-cancel-btn"
                    onClick={handleCancel2FA}
                  >
                    취소
                  </button>
                  <button
                    className="pstgs-verify-btn"
                    onClick={handleVerifyCode}
                    disabled={verificationCode.length !== 6}
                  >
                    인증
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 비밀번호 변경 */}
      <div className="pstgs-security-section">
        <h4>비밀번호</h4>
        <button
          className="pstgs-password-change-btn"
          onClick={() => setShowPasswordModal(true)}
        >
          비밀번호 변경
        </button>
      </div>

      {/* 계정 삭제 */}
      <div className="pstgs-account-section pstgs-danger-section">
        <h4>계정 삭제</h4>
        <p className="pstgs-danger-text">
          계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
        </p>
        <button
          className="pstgs-danger-btn"
          onClick={() => setShowDeleteModal(true)}
        >
          계정 삭제
        </button>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div
          className="pstgs-modal-overlay"
          onClick={handleCancelPasswordChange}
        >
          <div
            className="pstgs-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pstgs-modal-header">
              <h4>비밀번호 변경</h4>
              <button
                className="pstgs-modal-close"
                onClick={handleCancelPasswordChange}
              >
                ✕
              </button>
            </div>

            <div className="pstgs-modal-body">
              <div className="pstgs-password-form">
                <div className="pstgs-password-field">
                  <label>현재 비밀번호</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="pstgs-input"
                  />
                </div>
                <div className="pstgs-password-field">
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="pstgs-input"
                    placeholder="8자 이상 입력"
                  />
                </div>
                <div className="pstgs-password-field">
                  <label>새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="pstgs-input"
                  />
                </div>
              </div>
            </div>

            <div className="pstgs-modal-footer">
              <button
                className="pstgs-cancel-btn"
                onClick={handleCancelPasswordChange}
              >
                취소
              </button>
              <button className="pstgs-save-btn" onClick={handlePasswordChange}>
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계정 삭제 확인 모달 */}
      {showDeleteModal && (
        <div
          className="pstgs-modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="pstgs-modal-content pstgs-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pstgs-modal-header pstgs-danger-header">
              <h4>계정 삭제 확인</h4>
              <button
                className="pstgs-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="pstgs-modal-body">
              <div className="pstgs-delete-warning">
                <div className="pstgs-warning-icon">⚠️</div>
                <h5>정말로 계정을 삭제하시겠습니까?</h5>
                <p>
                  이 작업은 되돌릴 수 없으며, 다음 데이터가 영구적으로
                  삭제됩니다:
                </p>
                <ul className="pstgs-delete-list">
                  <li>모든 개인 정보</li>
                  <li>상담 기록 및 메시지</li>
                  <li>설정 및 환경설정</li>
                  <li>업무 관련 모든 데이터</li>
                </ul>

                <div className="pstgs-confirm-section">
                  <label>
                    계정 삭제를 확인하려면 아래에 <strong>"계정삭제"</strong>를
                    입력하세요:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="계정삭제"
                    className="pstgs-confirm-input"
                  />
                </div>
              </div>
            </div>

            <div className="pstgs-modal-footer">
              <button
                className="pstgs-cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button
                className="pstgs-danger-btn"
                onClick={() => {
                  if (deleteConfirmText === "계정삭제") {
                    alert("계정 삭제 요청이 처리되었습니다.");
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  } else {
                    alert("확인 텍스트가 올바르지 않습니다.");
                  }
                }}
                disabled={deleteConfirmText !== "계정삭제"}
              >
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalSettingsPage;
