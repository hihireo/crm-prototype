import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateServicePage.css";

const CreateServicePage = ({ onServiceCreate }) => {
  const navigate = useNavigate();

  // 현재 단계 (1: 로고/이름, 2: 서브도메인)
  const [currentStep, setCurrentStep] = useState(1);

  // 서비스 데이터
  const [serviceData, setServiceData] = useState({
    name: "",
    icon: null,
    iconPreview: null,
    subdomain: "",
  });

  // 서브도메인 상태
  const [subdomainStatus, setSubdomainStatus] = useState(""); // "", "checking", "available", "unavailable"
  const [subdomainError, setSubdomainError] = useState("");
  const [isCheckingManually, setIsCheckingManually] = useState(false);

  // 드래그 앤 드롭 상태
  const [isDragging, setIsDragging] = useState(false);

  // 아이콘 업로드 처리
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
    document.getElementById("icon-upload").click();
  };

  // 서브도메인 유효성 검사
  const validateSubdomain = (subdomain) => {
    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomain) return "";
    if (subdomain.length < 3) return "서브도메인은 최소 3자 이상이어야 합니다.";
    if (subdomain.length > 30) return "서브도메인은 최대 30자까지 가능합니다.";
    if (!regex.test(subdomain))
      return "영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.";
    if (subdomain.startsWith("-") || subdomain.endsWith("-"))
      return "하이픈(-)으로 시작하거나 끝날 수 없습니다.";
    return "";
  };

  // 서브도메인 중복 확인 (수동)
  const handleCheckSubdomain = async () => {
    if (!serviceData.subdomain.trim()) {
      alert("서브도메인을 입력해주세요.");
      return;
    }

    const error = validateSubdomain(serviceData.subdomain);
    if (error) {
      setSubdomainError(error);
      setSubdomainStatus("");
      return;
    }

    setIsCheckingManually(true);
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
        reservedDomains.includes(serviceData.subdomain) ||
        existingDomains.includes(serviceData.subdomain)
      ) {
        setSubdomainStatus("unavailable");
        setSubdomainError("이미 사용 중이거나 예약된 도메인입니다.");
      } else {
        setSubdomainStatus("available");
        setSubdomainError("");
      }
      setIsCheckingManually(false);
    }, 1500);
  };

  // 서브도메인 입력 처리
  const handleSubdomainChange = (e) => {
    const value = e.target.value.toLowerCase();
    setServiceData((prev) => ({ ...prev, subdomain: value }));

    // 입력 중에는 상태 초기화
    setSubdomainStatus("");
    setSubdomainError("");
  };

  // 1단계에서 다음으로
  const handleStep1Next = () => {
    if (!serviceData.name.trim()) {
      alert("서비스 이름을 입력해주세요.");
      return;
    }
    setCurrentStep(2);
  };

  // 2단계에서 이전으로
  const handleStep2Prev = () => {
    setCurrentStep(1);
  };

  // 2단계 건너뛰기
  const handleSkipSubdomain = () => {
    // 무작위 서브도메인 생성
    const randomString = Math.random().toString(36).substring(2, 10);
    const finalServiceData = {
      ...serviceData,
      subdomain: `service-${randomString}`,
    };

    handleCreateService(finalServiceData);
  };

  // 서비스 생성 완료
  const handleCreateService = (finalData = null) => {
    const dataToUse = finalData || serviceData;

    if (currentStep === 2 && !finalData) {
      if (!dataToUse.subdomain.trim()) {
        alert("서브도메인을 입력하거나 건너뛰기를 선택해주세요.");
        return;
      }

      if (subdomainStatus !== "available") {
        alert("서브도메인 중복 확인을 완료해주세요.");
        return;
      }
    }

    const newService = {
      id: Date.now(),
      name: dataToUse.name,
      icon: dataToUse.iconPreview,
      subdomain: dataToUse.subdomain,
      members: 1,
      assignedCustomers: 0,
      todaySchedules: 0,
    };

    // 서비스 생성 콜백 호출
    if (onServiceCreate) {
      onServiceCreate(newService);
    }

    alert("서비스가 성공적으로 생성되었습니다!");
    navigate("/services");
  };

  // 취소 및 뒤로가기
  const handleCancel = () => {
    if (
      window.confirm(
        "서비스 생성을 취소하시겠습니까? 입력한 정보가 사라집니다."
      )
    ) {
      navigate("/services");
    }
  };

  return (
    <div className="create-service-page">
      <div className="create-service-container">
        {/* 헤더 */}
        <div className="create-service-header">
          <button className="back-button" onClick={handleCancel}>
            ← 뒤로가기
          </button>
          <h1>새 서비스 생성</h1>
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <span>기본 정보</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <span>도메인 설정</span>
            </div>
          </div>
        </div>

        {/* 1단계: 로고와 이름 */}
        {currentStep === 1 && (
          <div className="step-content">
            <div className="step-title">
              <h2>서비스 기본 정보</h2>
              <p>서비스 브랜드 아이콘과 이름을 설정해주세요.</p>
            </div>

            <div className="form-section">
              {/* 브랜드 아이콘 업로드 */}
              <div className="form-group icon-group">
                <label className="form-label">브랜드 아이콘</label>
                <div className="icon-upload-area">
                  <div
                    className={`icon-preview-large ${
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
                        <div className="icon-overlay">
                          <span>🔄</span>
                          <p>클릭하여 변경</p>
                        </div>
                      </>
                    ) : (
                      <div className="icon-placeholder-large">
                        <span>{isDragging ? "📁" : "🎨"}</span>
                        <p>
                          {isDragging ? "여기에 놓으세요" : "브랜드 아이콘"}
                        </p>
                        <small>
                          {isDragging
                            ? "이미지를 드롭하세요"
                            : "클릭하거나 드래그하여 업로드"}
                        </small>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="icon-upload"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: "none" }}
                  />
                  <p className="upload-hint">
                    PNG, JPG, SVG 파일 (최대 5MB) • 정사각형 이미지 권장
                  </p>
                </div>
              </div>

              {/* 서비스 이름 */}
              <div className="form-group">
                <label className="form-label required">서비스 이름</label>
                <input
                  type="text"
                  className="form-input large"
                  placeholder="예: 거래소 텔레마케팅 관리"
                  value={serviceData.name}
                  onChange={(e) =>
                    setServiceData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  maxLength={50}
                />
                <p className="input-hint">최대 50자까지 입력 가능합니다.</p>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                취소
              </button>
              <button className="btn btn-primary" onClick={handleStep1Next}>
                다음
              </button>
            </div>
          </div>
        )}

        {/* 2단계: 서브도메인 */}
        {currentStep === 2 && (
          <div className="step-content">
            <div className="step-title">
              <h2>도메인 설정</h2>
              <p>서비스에서 사용할 서브도메인을 설정해주세요.</p>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label className="form-label">서브도메인</label>
                <div className="subdomain-input-container">
                  <div className="subdomain-input-group">
                    <input
                      type="text"
                      className={`subdomain-input ${
                        subdomainError ? "error" : ""
                      } ${subdomainStatus === "available" ? "success" : ""}`}
                      placeholder="myservice"
                      value={serviceData.subdomain}
                      onChange={handleSubdomainChange}
                    />
                    <span className="subdomain-suffix">.talkgate.im</span>
                  </div>
                  <button
                    className="btn btn-outline check-btn"
                    onClick={handleCheckSubdomain}
                    disabled={
                      !serviceData.subdomain.trim() || isCheckingManually
                    }
                  >
                    {isCheckingManually ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        확인 중...
                      </>
                    ) : (
                      "중복 확인"
                    )}
                  </button>
                </div>

                {subdomainError && (
                  <p className="error-message">{subdomainError}</p>
                )}
                {subdomainStatus === "available" && (
                  <p className="success-message">✓ 사용 가능한 도메인입니다!</p>
                )}
                {subdomainStatus === "unavailable" && (
                  <p className="error-message">
                    ✗ 이미 사용 중이거나 예약된 도메인입니다.
                  </p>
                )}

                <div className="input-hint-box">
                  <p className="input-hint">
                    • 영문 소문자, 숫자, 하이픈(-) 사용 가능 (3-30자)
                  </p>
                  <p className="input-hint">
                    • 하이픈(-)으로 시작하거나 끝날 수 없습니다
                  </p>
                </div>
              </div>

              <div className="skip-section">
                <div className="skip-info">
                  <h4>도메인 설정을 나중에 하시겠어요?</h4>
                  <p>
                    이 단계를 건너뛰면 무작위 도메인이 자동으로 생성됩니다.
                    <br />
                    언제든지 <strong>설정 &gt; 일반</strong>에서 변경할 수
                    있습니다.
                  </p>
                </div>
                <button className="btn btn-ghost" onClick={handleSkipSubdomain}>
                  건너뛰기
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={handleStep2Prev}>
                이전
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleCreateService()}
                disabled={
                  serviceData.subdomain.trim() &&
                  subdomainStatus !== "available"
                }
              >
                완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateServicePage;
