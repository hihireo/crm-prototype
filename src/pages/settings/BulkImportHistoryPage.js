import React, { useState, useEffect } from "react";
import "./BulkImportHistoryPage.css";

// 에러 타입 정의
export const CustomerBulkImportErrorType = {
  RequiredFieldsMissing: "REQUIRED_FIELDS_MISSING",
  SystemError: "SYSTEM_ERROR",
  CustomerAlreadyExists: "CUSTOMER_ALREADY_EXISTS",
};

// 에러 타입 한글 매핑
const ErrorTypeLabels = {
  [CustomerBulkImportErrorType.RequiredFieldsMissing]: "필수 필드 누락",
  [CustomerBulkImportErrorType.SystemError]: "시스템 오류",
  [CustomerBulkImportErrorType.CustomerAlreadyExists]: "고객 중복",
};

// 상태 한글 매핑
const StatusLabels = {
  PENDING: "대기",
  PROCESSING: "진행 중",
  COMPLETED: "완료",
  FAILED: "실패",
};

// 상태별 클래스 매핑
const StatusClasses = {
  PENDING: "status-pending",
  PROCESSING: "status-processing",
  COMPLETED: "status-completed",
  FAILED: "status-failed",
};

// 실패 내역 상세보기 모달 컴포넌트
const FailureDetailModal = ({
  isOpen,
  onClose,
  failureDetails,
  fileName,
  uploadDate,
}) => {
  if (!isOpen) return null;

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bulk-modal-overlay" onClick={onClose}>
      <div className="bulk-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="bulk-modal-header">
          <h3>실패 내역 상세보기</h3>
          <button className="bulk-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="bulk-modal-body">
          <div className="bulk-failure-info">
            <div className="bulk-file-info">
              <h4>{fileName}</h4>
              <p className="bulk-upload-time">
                업로드 시간: {formatDate(uploadDate)}
              </p>
            </div>
            <div className="bulk-failure-summary">
              <p>총 {failureDetails.length}건의 실패 항목</p>
              <p className="bulk-failure-note">
                * 최대 20개 항목까지 표시됩니다
              </p>
            </div>
          </div>

          <div className="bulk-failure-grid">
            {failureDetails.map((failure, index) => (
              <div key={index} className="bulk-failure-card">
                <div className="bulk-failure-card-header">
                  <span className="bulk-failure-row-number">
                    {failure.row}행
                  </span>
                </div>
                <div className="bulk-failure-card-body">
                  <span className="bulk-failure-error-type">
                    {ErrorTypeLabels[failure.errorType]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bulk-modal-footer">
          <button className="bulk-btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkImportHistoryPage = ({ service }) => {
  const [importHistory, setImportHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedFailure, setSelectedFailure] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 샘플 데이터 생성
  useEffect(() => {
    const generateSampleData = () => {
      const sampleData = [];
      const uploaders = ["김철수", "이영희", "박민수", "정수진", "최영호"];
      const statuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];

      for (let i = 1; i <= 47; i++) {
        let totalCustomers = Math.floor(Math.random() * 500) + 50;
        let successCount, failureCount, status;

        // PENDING 상태 케이스 (처리 전이므로 모든 수치가 '-')
        if (i <= 10 && [1, 4, 9].includes(i)) {
          status = "PENDING";
          totalCustomers = null; // null로 설정하여 '-' 표시
          successCount = null;
          failureCount = null;
        }
        // 첫 페이지(1-10번)에 실패가 0인 케이스 3개 포함
        else if (i <= 10 && [2, 5, 8].includes(i)) {
          // 실패 0인 케이스
          successCount = totalCustomers;
          failureCount = 0;
          status = statuses[Math.floor(Math.random() * statuses.length)];
        } else {
          // 일반 케이스
          successCount = Math.floor(Math.random() * totalCustomers);
          failureCount = totalCustomers - successCount;
          status = statuses[Math.floor(Math.random() * statuses.length)];
        }

        // 실패 데이터가 있는 경우 실패 상세 정보 생성
        const failureDetails = [];
        if (failureCount > 0) {
          const errorTypes = Object.values(CustomerBulkImportErrorType);
          for (let j = 0; j < Math.min(failureCount, 20); j++) {
            const errorType =
              errorTypes[Math.floor(Math.random() * errorTypes.length)];
            let message = "";

            switch (errorType) {
              case CustomerBulkImportErrorType.RequiredFieldsMissing:
                message = "이름 또는 연락처가 누락되었습니다.";
                break;
              case CustomerBulkImportErrorType.SystemError:
                message = "데이터베이스 연결 오류가 발생했습니다.";
                break;
              case CustomerBulkImportErrorType.CustomerAlreadyExists:
                message = "이미 등록된 고객입니다.";
                break;
              default:
                message = "알 수 없는 오류가 발생했습니다.";
            }

            failureDetails.push({
              row: Math.floor(Math.random() * totalCustomers) + 2, // 헤더 제외
              errorType,
              message,
            });
          }
        }

        // 파일명 생성 (일부는 긴 파일명으로)
        let fileName;
        const longFileNames = [
          "2024년_상반기_신규고객_정보_일괄등록_데이터_최종본_v2.xlsx",
          "고객관리시스템_마이그레이션_데이터_백업_20241015_완료.xlsx",
          "영업팀_Q3분기_잠재고객_리스트_세그먼트별_분류_완료본.xlsx",
          "마케팅부서_캠페인_대상_고객_데이터_추출_결과_최종.xlsx",
          "CRM시스템_연동_고객정보_동기화_작업_결과_보고서.xlsx",
          "온라인_오프라인_통합_고객_데이터베이스_구축_프로젝트.xlsx",
        ];

        if ([3, 7, 12, 18, 25, 33].includes(i)) {
          // 긴 파일명 케이스
          fileName =
            longFileNames[Math.floor(Math.random() * longFileNames.length)];
        } else {
          // 일반 파일명
          fileName = `고객정보_${String(i).padStart(3, "0")}.xlsx`;
        }

        sampleData.push({
          id: i,
          fileName,
          uploader: uploaders[Math.floor(Math.random() * uploaders.length)],
          totalCustomers,
          successCount,
          failureCount,
          status,
          uploadDate: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          failureDetails,
        });
      }

      // 최신 순으로 정렬
      return sampleData.sort(
        (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
      );
    };

    setImportHistory(generateSampleData());
  }, []);

  // 페이지네이션 계산
  const totalPages = Math.ceil(importHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = importHistory.slice(startIndex, endIndex);

  // 실패 내역 클릭 핸들러
  const handleFailureClick = (item) => {
    if (item.failureCount > 0) {
      setSelectedFailure({
        fileName: item.fileName,
        failureDetails: item.failureDetails,
        uploadDate: item.uploadDate,
      });
      setIsModalOpen(true);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFailure(null);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bulk-import-history">
      <div className="bulk-header">
        <h3>일괄 등록 이력</h3>
        <p className="bulk-description">
          엑셀 파일을 통한 고객 정보 일괄 등록 이력을 확인할 수 있습니다.
        </p>
      </div>

      <div className="bulk-table-container">
        <table className="bulk-table">
          <thead>
            <tr>
              <th>파일명</th>
              <th>업로더</th>
              <th>전체 고객 수</th>
              <th>성공</th>
              <th>실패</th>
              <th>상태</th>
              <th>업로드 일시</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id}>
                <td className="bulk-filename" title={item.fileName}>
                  {item.fileName}
                </td>
                <td>{item.uploader}</td>
                <td className="bulk-number">
                  {item.totalCustomers !== null
                    ? item.totalCustomers.toLocaleString()
                    : "-"}
                </td>
                <td className="bulk-number bulk-success">
                  {item.successCount !== null
                    ? item.successCount.toLocaleString()
                    : "-"}
                </td>
                <td className="bulk-number">
                  {item.failureCount !== null ? (
                    item.failureCount > 0 ? (
                      <button
                        className="bulk-failure-link"
                        onClick={() => handleFailureClick(item)}
                      >
                        {item.failureCount.toLocaleString()}
                      </button>
                    ) : (
                      <span className="bulk-success">0</span>
                    )
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <span className={`bulk-status ${StatusClasses[item.status]}`}>
                    {StatusLabels[item.status]}
                  </span>
                </td>
                <td className="bulk-date">{formatDate(item.uploadDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="bulk-pagination">
        <button
          className="bulk-page-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>

        <div className="bulk-page-numbers">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                className={`bulk-page-btn ${
                  currentPage === pageNum ? "active" : ""
                }`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          className="bulk-page-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>

      {/* <div className="bulk-pagination-info">
        총 {importHistory.length}개 항목 중 {startIndex + 1}-
        {Math.min(endIndex, importHistory.length)}번째 표시
      </div> */}

      {/* 실패 내역 상세보기 모달 */}
      <FailureDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        failureDetails={selectedFailure?.failureDetails || []}
        fileName={selectedFailure?.fileName || ""}
        uploadDate={selectedFailure?.uploadDate || ""}
      />
    </div>
  );
};

export default BulkImportHistoryPage;
