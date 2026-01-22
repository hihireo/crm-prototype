import React, { useState } from "react";
import "./CustomerApiPage.css";

const CustomerApiPage = ({ service }) => {
  // API 엔드포인트 정보
  const endpoint = "https://api.talkgate.im/v1/projects/proj_1fdx73abc123/customers";

  // API 키 목록 상태
  const [apiKeys, setApiKeys] = useState([
    {
      id: "1",
      name: "기본 API 키",
      apiKey: "tg_live_sk_1234567890abcdef1234567890abcdef12345678",
      createdAt: new Date("2024-01-15"),
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState(null);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // API 키 생성
  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      alert("API 키 이름을 입력해주세요.");
      return;
    }

    setIsCreating(true);

    // 실제로는 API 호출
    setTimeout(() => {
      const newApiKey = `tg_live_sk_${Math.random()
        .toString(36)
        .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const newKey = {
        id: Date.now().toString(),
        name: newApiKeyName.trim(),
        apiKey: newApiKey,
        createdAt: new Date(),
      };

      setApiKeys((prev) => [...prev, newKey]);
      setIsCreating(false);
      setShowCreateModal(false);
      setNewApiKeyName("");
      alert("새로운 API 키가 생성되었습니다.");
    }, 2000);
  };

  // API 키 재발급
  const handleRegenerateApiKey = async () => {
    if (!selectedApiKey) return;

    setIsRegenerating(true);

    // 실제로는 API 호출
    setTimeout(() => {
      const newApiKey = `tg_live_sk_${Math.random()
        .toString(36)
        .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      setApiKeys((prev) =>
        prev.map((key) =>
          key.id === selectedApiKey.id
            ? { ...key, apiKey: newApiKey }
            : key
        )
      );
      setIsRegenerating(false);
      setShowRegenerateModal(false);
      setSelectedApiKey(null);
      alert("새로운 API 키가 생성되었습니다. 기존 키는 즉시 비활성화됩니다.");
    }, 2000);
  };

  // API 키 삭제
  const handleDeleteApiKey = async () => {
    if (!selectedApiKey) return;

    setIsDeleting(true);

    // 실제로는 API 호출
    setTimeout(() => {
      setApiKeys((prev) => prev.filter((key) => key.id !== selectedApiKey.id));
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedApiKey(null);
      alert("API 키가 삭제되었습니다.");
    }, 2000);
  };

  // 날짜 포맷팅
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
              <code className="api-value">{endpoint}</code>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(endpoint, "API 엔드포인트")}
              >
                복사
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API 키 관리 섹션 */}
      <div className="api-info-section">
        <div className="api-keys-header">
          <h4>API 키 관리</h4>
          <button
            className="create-api-key-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + 새 API 키 생성
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <div className="empty-api-keys">
            <p>생성된 API 키가 없습니다. 새 API 키를 생성해주세요.</p>
          </div>
        ) : (
          <div className="api-keys-list">
            {apiKeys.map((key) => (
              <div key={key.id} className="api-key-item">
                <div className="api-key-header">
                  <div className="api-key-name-section">
                    <h5 className="api-key-name">{key.name}</h5>
                    <span className="api-key-date">
                      생성일: {formatDate(key.createdAt)}
                    </span>
                  </div>
                  <div className="api-key-item-actions">
                    <button
                      className="delete-btn"
                      onClick={() => {
                        setSelectedApiKey(key);
                        setShowDeleteModal(true);
                      }}
                      title="삭제"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="api-value-container">
                  <code className="api-value api-key">{key.apiKey}</code>
                  <div className="api-key-actions">
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(key.apiKey, "API 키")}
                    >
                      복사
                    </button>
                    <button
                      className="regenerate-btn"
                      onClick={() => {
                        setSelectedApiKey(key);
                        setShowRegenerateModal(true);
                      }}
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
            ))}
          </div>
        )}
      </div>

      {/* API 키 생성 모달 */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => !isCreating && setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>새 API 키 생성</h4>
              {!isCreating && (
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewApiKeyName("");
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="api-key-name">API 키 이름</label>
                <input
                  id="api-key-name"
                  type="text"
                  className="form-input"
                  placeholder="예: 프로덕션 서버, 개발 환경 등"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  disabled={isCreating}
                />
                <p className="form-help">
                  API 키를 구분하기 위한 이름을 입력해주세요.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              {!isCreating ? (
                <>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewApiKeyName("");
                    }}
                  >
                    취소
                  </button>
                  <button className="primary-btn" onClick={handleCreateApiKey}>
                    API 키 생성
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

      {/* API 키 재발급 모달 */}
      {showRegenerateModal && selectedApiKey && (
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
                  onClick={() => {
                    setShowRegenerateModal(false);
                    setSelectedApiKey(null);
                  }}
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
                  <strong>"{selectedApiKey.name}"</strong> API 키를 재발급하면{" "}
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
                    onClick={() => {
                      setShowRegenerateModal(false);
                      setSelectedApiKey(null);
                    }}
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

      {/* API 키 삭제 모달 */}
      {showDeleteModal && selectedApiKey && (
        <div
          className="modal-overlay"
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>API 키 삭제</h4>
              {!isDeleting && (
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedApiKey(null);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="modal-body">
              <div className="regenerate-warning">
                <div className="warning-icon">⚠️</div>
                <h5>API 키를 삭제하시겠습니까?</h5>
                <p>
                  <strong>"{selectedApiKey.name}"</strong> API 키를 삭제하면{" "}
                  <strong>즉시 사용할 수 없게 됩니다</strong>. 이 키를 사용하는
                  모든 시스템에서 오류가 발생할 수 있습니다.
                </p>
                <ul className="warning-list">
                  <li>삭제된 API 키는 복구할 수 없습니다</li>
                  <li>이 키를 사용하는 모든 시스템이 영향을 받습니다</li>
                  <li>이 작업은 되돌릴 수 없습니다</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              {!isDeleting ? (
                <>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedApiKey(null);
                    }}
                  >
                    취소
                  </button>
                  <button className="danger-btn" onClick={handleDeleteApiKey}>
                    API 키 삭제
                  </button>
                </>
              ) : (
                <div className="regenerating-state">
                  <div className="loading-spinner"></div>
                  <span>API 키를 삭제하고 있습니다...</span>
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
