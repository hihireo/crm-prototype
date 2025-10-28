import React, { useState } from "react";
import "./CustomerApiPage.css";

const CustomerApiPage = ({ service }) => {
  // API 정보 상태
  const [apiInfo, setApiInfo] = useState({
    endpoint: "https://api.talkgate.im/v1/projects/proj_1fdx73abc123/customers",
    apiKey: "tg_live_sk_1234567890abcdef1234567890abcdef12345678",
    projectId: "proj_1fdx73abc123",
  });

  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 복사 기능
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type}이(가) 클립보드에 복사되었습니다.`);
    } catch (err) {
      console.error("복사 실패:", err);
      alert("복사에 실패했습니다.");
    }
  };

  // API 키 재발급
  const handleRegenerateApiKey = async () => {
    setIsRegenerating(true);

    // 실제로는 API 호출
    setTimeout(() => {
      const newApiKey = `tg_live_sk_${Math.random()
        .toString(36)
        .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setApiInfo((prev) => ({
        ...prev,
        apiKey: newApiKey,
      }));
      setIsRegenerating(false);
      setShowRegenerateModal(false);
      alert("새로운 API 키가 생성되었습니다. 기존 키는 즉시 비활성화됩니다.");
    }, 2000);
  };

  return (
    <div className="customer-api-page">
      <div className="api-header">
        <h3>고객등록 API</h3>
        <p className="api-description">
          외부 시스템에서 고객 정보를 등록할 수 있는 API 엔드포인트와 인증 키를
          관리합니다.
        </p>
      </div>

      {/* API 정보 섹션 */}
      <div className="api-info-section">
        <h4>API 정보</h4>

        <div className="api-info-grid">
          <div className="api-info-item">
            <label>API 엔드포인트</label>
            <div className="api-value-container">
              <code className="api-value">{apiInfo.endpoint}</code>
              <button
                className="copy-btn"
                onClick={() =>
                  copyToClipboard(apiInfo.endpoint, "API 엔드포인트")
                }
              >
                복사
              </button>
            </div>
          </div>

          <div className="api-info-item">
            <label>API 키</label>
            <div className="api-value-container">
              <code className="api-value api-key">{apiInfo.apiKey}</code>
              <div className="api-key-actions">
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(apiInfo.apiKey, "API 키")}
                >
                  복사
                </button>
                <button
                  className="regenerate-btn"
                  onClick={() => setShowRegenerateModal(true)}
                >
                  재발급
                </button>
              </div>
            </div>
            <p className="api-key-warning">
              ⚠️ API 키는 안전한 곳에 보관하세요. 키가 노출되면 즉시
              재발급하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>

      {/* API 스펙 섹션 */}

      {/* API 키 재발급 모달 */}
      {showRegenerateModal && (
        <div
          className="modal-overlay"
          onClick={() => !isRegenerating && setShowRegenerateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>API 키 재발급</h4>
              {!isRegenerating && (
                <button
                  className="modal-close"
                  onClick={() => setShowRegenerateModal(false)}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="modal-body">
              <div className="regenerate-warning">
                <div className="warning-icon">⚠️</div>
                <h5>API 키를 재발급하시겠습니까?</h5>
                <p>
                  새로운 API 키가 생성되면{" "}
                  <strong>기존 키는 즉시 비활성화</strong>됩니다. 현재 키를
                  사용하는 모든 시스템에서 새로운 키로 업데이트해야 합니다.
                </p>
                <ul className="warning-list">
                  <li>기존 API 키는 즉시 사용 불가능해집니다</li>
                  <li>연동된 모든 시스템에서 키를 업데이트해야 합니다</li>
                  <li>이 작업은 되돌릴 수 없습니다</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              {!isRegenerating ? (
                <>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowRegenerateModal(false)}
                  >
                    취소
                  </button>
                  <button
                    className="danger-btn"
                    onClick={handleRegenerateApiKey}
                  >
                    API 키 재발급
                  </button>
                </>
              ) : (
                <div className="regenerating-state">
                  <div className="loading-spinner"></div>
                  <span>새로운 API 키를 생성하고 있습니다...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerApiPage;
