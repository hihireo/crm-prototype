import React, { useState, useEffect } from "react";
import "./SmsSettingsPage.css";

const SmsHistoryPage = ({ service, user }) => {
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 샘플 데이터 생성
  useEffect(() => {
    const generateSampleData = () => {
      const sampleData = [];
      const purposes = ["광고성", "정보성"];
      const messageTypes = ["SMS", "LMS", "MMS"];
      const statuses = ["완료", "실패", "처리중"];

      for (let i = 1; i <= 47; i++) {
        const totalCustomers = Math.floor(Math.random() * 100) + 10;
        const successCount = Math.floor(Math.random() * totalCustomers);
        const failureCount = totalCustomers - successCount;
        // 상태를 완료, 실패, 처리중 중 하나로 랜덤 선택
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        sampleData.push({
          id: i,
          sendDate: new Date(
            2024,
            0,
            Math.floor(i / 3) + 1,
            Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 60)
          ).toISOString(),
          senderNumber: `010-${Math.floor(Math.random() * 9000) + 1000}-${
            Math.floor(Math.random() * 9000) + 1000
          }`,
          messageType:
            messageTypes[Math.floor(Math.random() * messageTypes.length)],
          purpose: purposes[Math.floor(Math.random() * purposes.length)],
          totalCustomers,
          successCount,
          failureCount,
          status, // 완료, 실패, 처리중
          messageTitle: i % 3 === 0 ? `메시지 제목 ${i}` : null,
          messageBody: `샘플 메시지 내용 ${i}`,
          sentBy: ["김관리자", "이직원", "박팀장"][
            Math.floor(Math.random() * 3)
          ],
        });
      }
      setHistory(
        sampleData.sort((a, b) => new Date(b.sendDate) - new Date(a.sendDate))
      );
    };

    generateSampleData();
  }, []);

  // 페이지네이션
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistory = history.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRowClick = (historyItem) => {
    setSelectedHistory(historyItem);
    setShowDetailModal(true);
  };

  return (
    <div className="sms-settings-page">
      <div className="sms-settings-header">
        <h3>문자 발송 이력</h3>
        <p className="sms-settings-description">
          문자 발송 이력을 확인할 수 있습니다.
        </p>
      </div>

      <div className="sms-history-tab">
        {/* 이력 테이블 */}
        <div className="sms-history-table-container">
          <table className="sms-history-table">
            <thead>
              <tr>
                <th>발송일시</th>
                <th>발신번호</th>
                <th>메시지 유형</th>
                <th>광고/정보</th>
                <th>전체 고객 수</th>
                <th>성공 수</th>
                <th>실패 수</th>
                <th>상태</th>
                <th>발송자</th>
              </tr>
            </thead>
            <tbody>
              {currentHistory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="sms-empty-cell">
                    발송 이력이 없습니다.
                  </td>
                </tr>
              ) : (
                currentHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="sms-history-row"
                    onClick={() => handleRowClick(item)}
                  >
                    <td>{formatDate(item.sendDate)}</td>
                    <td className="sms-number-cell">{item.senderNumber}</td>
                    <td>
                      <span
                        className={`sms-type-badge sms-type-${item.messageType.toLowerCase()}`}
                      >
                        {item.messageType}
                      </span>
                    </td>
                    <td>{item.purpose}</td>
                    <td>{item.totalCustomers}</td>
                    <td className="sms-success-cell">{item.successCount}</td>
                    <td className="sms-failure-cell">{item.failureCount}</td>
                    <td>
                      <span
                        className={`sms-status-badge sms-status-${
                          item.status === "완료"
                            ? "success"
                            : item.status === "실패"
                            ? "failure"
                            : "processing"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{item.sentBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {history.length > 0 && (
          <div className="sms-pagination">
            <button
              className="sms-page-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              이전
            </button>
            <div className="sms-page-numbers">
              {generatePageNumbers().map((page) => (
                <button
                  key={page}
                  className={`sms-page-btn ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="sms-page-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}

        {/* 상세보기 모달 */}
        {showDetailModal && selectedHistory && (
          <div
            className="sms-modal-overlay"
            onClick={() => setShowDetailModal(false)}
          >
            <div
              className="sms-modal-content sms-detail-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sms-modal-header">
                <h4>발송 상세 정보</h4>
                <button
                  className="sms-modal-close"
                  onClick={() => setShowDetailModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="sms-modal-body">
                <div className="sms-detail-grid">
                  <div className="sms-detail-item">
                    <label>발송일시</label>
                    <div>{formatDate(selectedHistory.sendDate)}</div>
                  </div>
                  <div className="sms-detail-item">
                    <label>발신번호</label>
                    <div>{selectedHistory.senderNumber}</div>
                  </div>
                  <div className="sms-detail-item">
                    <label>메시지 유형</label>
                    <div>
                      <span
                        className={`sms-type-badge sms-type-${selectedHistory.messageType.toLowerCase()}`}
                      >
                        {selectedHistory.messageType}
                      </span>
                    </div>
                  </div>
                  <div className="sms-detail-item">
                    <label>광고/정보</label>
                    <div>{selectedHistory.purpose}</div>
                  </div>
                  <div className="sms-detail-item">
                    <label>전체 고객 수</label>
                    <div>{selectedHistory.totalCustomers}</div>
                  </div>
                  <div className="sms-detail-item">
                    <label>성공 수</label>
                    <div className="sms-success-cell">
                      {selectedHistory.successCount}
                    </div>
                  </div>
                  <div className="sms-detail-item">
                    <label>실패 수</label>
                    <div className="sms-failure-cell">
                      {selectedHistory.failureCount}
                    </div>
                  </div>
                  <div className="sms-detail-item">
                    <label>상태</label>
                    <div>
                      <span
                        className={`sms-status-badge sms-status-${
                          selectedHistory.status === "완료"
                            ? "success"
                            : selectedHistory.status === "실패"
                            ? "failure"
                            : "processing"
                        }`}
                      >
                        {selectedHistory.status}
                      </span>
                    </div>
                  </div>
                  <div className="sms-detail-item">
                    <label>발송자</label>
                    <div>{selectedHistory.sentBy}</div>
                  </div>
                  {selectedHistory.messageTitle && (
                    <div className="sms-detail-item sms-detail-full">
                      <label>제목</label>
                      <div>{selectedHistory.messageTitle}</div>
                    </div>
                  )}
                  <div className="sms-detail-item sms-detail-full">
                    <label>본문</label>
                    <div className="sms-message-body">
                      {selectedHistory.messageBody}
                    </div>
                  </div>
                </div>
              </div>
              <div className="sms-modal-footer">
                <button
                  className="sms-btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmsHistoryPage;
