import React, { useState } from "react";
import "./SmsSettingsPage.css";

const SenderNumbersPage = ({ service, user }) => {
  const isAdmin = true;

  // 공통 발신번호 등록 탭
  const SenderNumbersTab = ({ service, user, isAdmin }) => {
    const [projectNumbers, setProjectNumbers] = useState([
      {
        id: 1,
        number: "02-123-4567",
        status: "approved", // pending, approved, rejected
        rejectionReason: null,
      },
      {
        id: 2,
        number: "070-8900-1234",
        status: "pending",
        rejectionReason: null,
      },
      {
        id: 3,
        number: "02-567-8901",
        status: "rejected",
        rejectionReason: "통신서비스 이용계약 증명 서류가 불명확합니다.",
      },
    ]);
    const [personalNumbers, setPersonalNumbers] = useState([
      {
        id: 3,
        number: "010-5555-1234",
        registeredAt: "2024-01-25",
      },
    ]);
    const [showAddProjectModal, setShowAddProjectModal] = useState(false);
    const [showAddPersonalModal, setShowAddPersonalModal] = useState(false);
    const [newNumber, setNewNumber] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // 공통 발신번호 등록용 파일 상태
    const [projectFiles, setProjectFiles] = useState({
      serviceProof: null, // 통신서비스 이용증명원 (필수)
      businessLicense: null, // 사업자등록증 또는 법인등기부등본 (필수)
      idCard: null, // 대표자 신분증 사본 or 담당자 신분증 사본 (필수)
      employmentProof: null, // 재직 증명서 (선택 - 담당자 신분증 첨부 시)
    });

    const [idCardType, setIdCardType] = useState("representative"); // "representative" or "manager"

    const handleAddProjectNumber = () => {
      if (!isAdmin) {
        alert("프로젝트 공통 발신번호는 관리자만 등록할 수 있습니다.");
        return;
      }
      setShowAddProjectModal(true);
    };

    const handleAddPersonalNumber = async () => {
      // 바로 NiceId 인증 팝업 열기
      setIsVerifying(true);

      try {
        // 실제로는 NiceId SDK를 사용하여 인증 팝업을 띄움
        const niceIdAvailable = false; // 실제 연동 여부

        if (niceIdAvailable) {
          // NiceId 팝업 열기 (실제 구현 시)
          // window.NiceIdPopup.open({
          //   onSuccess: (result) => {
          //     // 인증 성공 후 발신번호 입력 모달 열기
          //     setShowAddPersonalModal(true);
          //   },
          //   onError: (error) => {
          //     alert("인증에 실패했습니다.");
          //   }
          // });
          // 인증 성공 후 발신번호 입력 모달 열기
          setShowAddPersonalModal(true);
        } else {
          // NiceId 미연동 시 alert 표시
          alert(
            "NiceId 인증 기능이 아직 설정되지 않았습니다.\n\nTODO: NiceId SDK 연동 필요"
          );
        }
      } catch (error) {
        console.error("인증 오류:", error);
        alert("인증 중 오류가 발생했습니다.");
      } finally {
        setIsVerifying(false);
      }
    };

    const handleFileChange = (fileType, file) => {
      setProjectFiles((prev) => ({
        ...prev,
        [fileType]: file,
      }));
    };

    const handleRemoveFile = (fileType) => {
      setProjectFiles((prev) => ({
        ...prev,
        [fileType]: null,
      }));
    };

    const handleSaveProjectNumber = () => {
      if (!newNumber.trim()) {
        alert("발신번호를 입력해주세요.");
        return;
      }

      const phoneRegex = /^010-\d{4}-\d{4}$/;
      if (!phoneRegex.test(newNumber)) {
        alert("올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)");
        return;
      }

      // 필수 파일 검증
      if (
        !projectFiles.serviceProof ||
        !projectFiles.businessLicense ||
        !projectFiles.idCard
      ) {
        alert(
          "필수 서류를 모두 첨부해주세요.\n1. 통신서비스 이용증명원\n2. 사업자등록증 또는 법인등기부등본\n3. 대표자 신분증 사본 or 담당자 신분증 사본"
        );
        return;
      }

      // 프로젝트 공통 발신번호 등록 (심사 중 상태로)
      const newProjectNumber = {
        id: Date.now(),
        number: newNumber,
        status: "pending", // 심사 중
        rejectionReason: null,
      };
      setProjectNumbers([...projectNumbers, newProjectNumber]);
      alert("발신번호 등록이 완료되었습니다. 심사가 진행 중입니다.");

      // 초기화
      setNewNumber("");
      setProjectFiles({
        serviceProof: null,
        businessLicense: null,
        idCard: null,
        employmentProof: null,
      });
      setIdCardType("representative");
      setShowAddProjectModal(false);
    };

    const handleSavePersonalNumber = () => {
      if (!newNumber.trim()) {
        alert("발신번호를 입력해주세요.");
        return;
      }

      const phoneRegex = /^010-\d{4}-\d{4}$/;
      if (!phoneRegex.test(newNumber)) {
        alert("올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)");
        return;
      }

      // 개인 발신번호 등록 (인증 완료 후)
      const newPersonalNumber = {
        id: Date.now(),
        number: newNumber,
        registeredAt: new Date().toISOString().split("T")[0],
      };
      setPersonalNumbers([...personalNumbers, newPersonalNumber]);
      alert("발신번호가 등록되었습니다.");

      setNewNumber("");
      setShowAddPersonalModal(false);
    };

    const handleDeleteNumber = (id, type) => {
      if (!window.confirm("정말 삭제하시겠습니까?")) return;

      if (type === "project") {
        if (!isAdmin) {
          alert("프로젝트 공통 발신번호는 관리자만 삭제할 수 있습니다.");
          return;
        }
        setProjectNumbers(projectNumbers.filter((n) => n.id !== id));
      } else {
        setPersonalNumbers(personalNumbers.filter((n) => n.id !== id));
      }
      alert("발신번호가 삭제되었습니다.");
    };

    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [selectedRejectionNumber, setSelectedRejectionNumber] =
      useState(null);

    const handleViewRejection = (number) => {
      setSelectedRejectionNumber(number);
      setShowRejectionModal(true);
    };

    const getStatusLabel = (status) => {
      switch (status) {
        case "pending":
          return "심사 중";
        case "approved":
          return "승인";
        case "rejected":
          return "거부";
        default:
          return status;
      }
    };

    const getStatusClass = (status) => {
      switch (status) {
        case "pending":
          return "sms-status-pending";
        case "approved":
          return "sms-status-approved";
        case "rejected":
          return "sms-status-rejected";
        default:
          return "";
      }
    };

    return (
      <div className="sender-numbers-tab">
        <div className="sms-section-header">
          <h4>공통 발신번호</h4>
          <button
            className="sms-add-btn"
            onClick={handleAddProjectNumber}
            disabled={!isAdmin}
            title={!isAdmin ? "관리자만 등록할 수 있습니다" : ""}
          >
            + 발신번호 추가
          </button>
        </div>
        <div className="sms-numbers-list">
          {projectNumbers.length === 0 ? (
            <div className="sms-empty-state">
              등록된 프로젝트 공통 발신번호가 없습니다.
              {isAdmin && " 위 버튼을 클릭하여 추가하세요."}
            </div>
          ) : (
            <table className="sms-numbers-table">
              <thead>
                <tr>
                  <th>발신번호</th>
                  <th>상태</th>
                  {isAdmin && <th>관리</th>}
                </tr>
              </thead>
              <tbody>
                {projectNumbers.map((number) => (
                  <tr key={number.id}>
                    <td className="sms-number-cell">{number.number}</td>
                    <td>
                      <div className="sms-status-cell">
                        <div className="sms-status-wrapper">
                          <span
                            className={`sms-status-badge ${getStatusClass(
                              number.status
                            )}`}
                          >
                            {getStatusLabel(number.status)}
                          </span>
                          {number.status === "rejected" &&
                            number.rejectionReason && (
                              <div className="sms-rejection-tooltip-wrapper">
                                <button
                                  className="sms-rejection-info-btn"
                                  onClick={() => handleViewRejection(number)}
                                  aria-label="거부 사유 보기"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 12H7v-1h2v1zm0-2H7V6h2v4z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          className="sms-delete-btn"
                          onClick={() =>
                            handleDeleteNumber(number.id, "project")
                          }
                        >
                          삭제
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="sms-section-header" style={{ marginTop: "40px" }}>
          <h4>개인 발신번호</h4>
          <button className="sms-add-btn" onClick={handleAddPersonalNumber}>
            + 발신번호 추가
          </button>
        </div>
        <div className="sms-numbers-list">
          {personalNumbers.length === 0 ? (
            <div className="sms-empty-state">
              등록된 개인 발신번호가 없습니다. 위 버튼을 클릭하여 추가하세요.
            </div>
          ) : (
            <table className="sms-numbers-table">
              <thead>
                <tr>
                  <th>발신번호</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {personalNumbers.map((number) => (
                  <tr key={number.id}>
                    <td className="sms-number-cell">{number.number}</td>
                    <td>{number.registeredAt}</td>
                    <td>
                      <button
                        className="sms-delete-btn"
                        onClick={() =>
                          handleDeleteNumber(number.id, "personal")
                        }
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 공통 발신번호 추가 모달 */}
        {showAddProjectModal && (
          <div
            className="sms-modal-overlay"
            onClick={() => setShowAddProjectModal(false)}
          >
            <div
              className="sms-modal-content sms-project-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sms-modal-header">
                <h4>공통 발신번호 추가</h4>
                <button
                  className="sms-modal-close"
                  onClick={() => {
                    setShowAddProjectModal(false);
                    setNewNumber("");
                    setProjectFiles({
                      serviceProof: null,
                      businessLicense: null,
                      idCard: null,
                      employmentProof: null,
                    });
                    setIdCardType("representative");
                  }}
                >
                  ×
                </button>
              </div>
              <div className="sms-modal-body">
                <div className="sms-form-field">
                  <label>발신번호</label>
                  <input
                    type="text"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="010-1234-5678"
                    className="sms-input"
                  />
                  <p className="sms-input-hint">
                    하이픈(-)을 포함하여 입력하세요
                  </p>
                </div>

                <div className="sms-documents-section">
                  <h5 className="sms-documents-title">필요 서류</h5>

                  {/* 1. 통신서비스 이용증명원 */}
                  <div className="sms-document-item">
                    <label className="sms-document-label">
                      1. 통신서비스 이용증명원
                      <span className="sms-document-required">(필수)</span>
                    </label>
                    <p className="sms-document-desc">
                      가입확인서, 이용계약등록증명서 등
                    </p>
                    <div className="sms-file-upload">
                      <input
                        type="file"
                        id="serviceProof"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange("serviceProof", e.target.files[0])
                        }
                        style={{ display: "none" }}
                      />
                      <label htmlFor="serviceProof" className="sms-file-label">
                        {projectFiles.serviceProof
                          ? projectFiles.serviceProof.name
                          : "파일 선택"}
                      </label>
                      {projectFiles.serviceProof && (
                        <button
                          type="button"
                          className="sms-file-remove"
                          onClick={() => handleRemoveFile("serviceProof")}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. 사업자등록증 또는 법인등기부등본 */}
                  <div className="sms-document-item">
                    <label className="sms-document-label">
                      2. 사업자등록증 또는 법인등기부등본
                      <span className="sms-document-required">(필수)</span>
                    </label>
                    <div className="sms-file-upload">
                      <input
                        type="file"
                        id="businessLicense"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange("businessLicense", e.target.files[0])
                        }
                        style={{ display: "none" }}
                      />
                      <label
                        htmlFor="businessLicense"
                        className="sms-file-label"
                      >
                        {projectFiles.businessLicense
                          ? projectFiles.businessLicense.name
                          : "파일 선택"}
                      </label>
                      {projectFiles.businessLicense && (
                        <button
                          type="button"
                          className="sms-file-remove"
                          onClick={() => handleRemoveFile("businessLicense")}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. 대표자 신분증 사본 or 담당자 신분증 사본 */}
                  <div className="sms-document-item">
                    <label className="sms-document-label">
                      3. 대표자 신분증 사본 or 담당자 신분증 사본
                      <span className="sms-document-required">(필수)</span>
                    </label>
                    <div className="sms-idcard-type-selector">
                      <label className="sms-radio-label">
                        <input
                          type="radio"
                          name="idCardType"
                          value="representative"
                          checked={idCardType === "representative"}
                          onChange={(e) => {
                            setIdCardType(e.target.value);
                            if (e.target.value === "representative") {
                              handleRemoveFile("employmentProof");
                            }
                          }}
                        />
                        <span>대표자 신분증 사본</span>
                      </label>
                      <label className="sms-radio-label">
                        <input
                          type="radio"
                          name="idCardType"
                          value="manager"
                          checked={idCardType === "manager"}
                          onChange={(e) => setIdCardType(e.target.value)}
                        />
                        <span>담당자 신분증 사본</span>
                      </label>
                    </div>
                    <div className="sms-file-upload">
                      <input
                        type="file"
                        id="idCard"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange("idCard", e.target.files[0])
                        }
                        style={{ display: "none" }}
                      />
                      <label htmlFor="idCard" className="sms-file-label">
                        {projectFiles.idCard
                          ? projectFiles.idCard.name
                          : "파일 선택"}
                      </label>
                      {projectFiles.idCard && (
                        <button
                          type="button"
                          className="sms-file-remove"
                          onClick={() => handleRemoveFile("idCard")}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4. 재직 증명서 (담당자 신분증 첨부 시) */}
                  {idCardType === "manager" && (
                    <div className="sms-document-item">
                      <label className="sms-document-label">
                        4. 재직 증명서
                        <span className="sms-document-optional">(선택)</span>
                      </label>
                      <p className="sms-document-desc">
                        3번에 담당자 신분증을 첨부했을 경우
                      </p>
                      <div className="sms-file-upload">
                        <input
                          type="file"
                          id="employmentProof"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChange(
                              "employmentProof",
                              e.target.files[0]
                            )
                          }
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="employmentProof"
                          className="sms-file-label"
                        >
                          {projectFiles.employmentProof
                            ? projectFiles.employmentProof.name
                            : "파일 선택"}
                        </label>
                        {projectFiles.employmentProof && (
                          <button
                            type="button"
                            className="sms-file-remove"
                            onClick={() => handleRemoveFile("employmentProof")}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="sms-modal-footer">
                <button
                  className="sms-btn-secondary"
                  onClick={() => {
                    setShowAddProjectModal(false);
                    setNewNumber("");
                    setProjectFiles({
                      serviceProof: null,
                      businessLicense: null,
                      idCard: null,
                      employmentProof: null,
                    });
                    setIdCardType("representative");
                  }}
                >
                  취소
                </button>
                <button
                  className="sms-btn-primary"
                  onClick={handleSaveProjectNumber}
                  disabled={!newNumber.trim()}
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 개인 발신번호 추가 모달 */}
        {showAddPersonalModal && (
          <div
            className="sms-modal-overlay"
            onClick={() => setShowAddPersonalModal(false)}
          >
            <div
              className="sms-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sms-modal-header">
                <h4>개인 발신번호 추가</h4>
                <button
                  className="sms-modal-close"
                  onClick={() => {
                    setShowAddPersonalModal(false);
                    setNewNumber("");
                  }}
                >
                  ×
                </button>
              </div>
              <div className="sms-modal-body">
                <div className="sms-form-field">
                  <label>발신번호</label>
                  <input
                    type="text"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="010-1234-5678"
                    className="sms-input"
                  />
                  <p className="sms-input-hint">
                    하이픈(-)을 포함하여 입력하세요
                  </p>
                </div>
              </div>
              <div className="sms-modal-footer">
                <button
                  className="sms-btn-secondary"
                  onClick={() => {
                    setShowAddPersonalModal(false);
                    setNewNumber("");
                  }}
                >
                  취소
                </button>
                <button
                  className="sms-btn-primary"
                  onClick={handleSavePersonalNumber}
                  disabled={!newNumber.trim()}
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 거부 사유 확인 모달 */}
        {showRejectionModal && selectedRejectionNumber && (
          <div
            className="sms-modal-overlay"
            onClick={() => setShowRejectionModal(false)}
          >
            <div
              className="sms-modal-content sms-rejection-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sms-modal-header">
                <div className="sms-modal-header-content">
                  <div className="sms-modal-icon sms-modal-icon-error">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4>발신번호 등록 거부</h4>
                    <p className="sms-modal-subtitle">
                      {selectedRejectionNumber.number}
                    </p>
                  </div>
                </div>
                <button
                  className="sms-modal-close"
                  onClick={() => setShowRejectionModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="sms-modal-body">
                <div className="sms-rejection-content">
                  <div className="sms-rejection-alert">
                    <div className="sms-rejection-alert-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div className="sms-rejection-alert-content">
                      <h5>등록이 거부되었습니다</h5>
                      <p>아래 사유를 확인하고 다시 등록해주세요.</p>
                    </div>
                  </div>
                  <div className="sms-rejection-reason-box">
                    <div className="sms-rejection-reason-header">
                      <span className="sms-rejection-reason-label">
                        거부 사유
                      </span>
                    </div>
                    <div className="sms-rejection-reason-text">
                      {selectedRejectionNumber.rejectionReason}
                    </div>
                  </div>
                </div>
              </div>
              <div className="sms-modal-footer">
                <button
                  className="sms-btn-secondary"
                  onClick={() => setShowRejectionModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sms-settings-page">
      <div className="sms-settings-header">
        <h3>발신번호 등록</h3>
        <p className="sms-settings-description">
          공통 발신번호와 개인 발신번호를 등록하고 관리할 수 있습니다.
        </p>
      </div>

      <SenderNumbersTab service={service} user={user} isAdmin={isAdmin} />
    </div>
  );
};

export default SenderNumbersPage;
