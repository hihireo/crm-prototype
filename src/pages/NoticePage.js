import React, { useState, useEffect } from "react";
import "./NoticePage.css";

const NoticePage = () => {
  const [notices] = useState([
    {
      id: 1,
      title: "시스템 점검 안내",
      content:
        "2024년 1월 15일 오전 2시부터 4시까지 시스템 정기 점검이 예정되어 있습니다. 점검 시간 동안에는 서비스 이용이 제한될 수 있습니다.",
      author: "관리자",
      date: "2024-01-10",
      important: true,
      views: 156,
    },
    {
      id: 4,
      title: "보안 정책 업데이트",
      content:
        "고객 정보 보호를 위한 새로운 보안 정책이 적용됩니다. 모든 직원은 반드시 숙지하시기 바랍니다.",
      author: "보안팀",
      date: "2024-01-03",
      important: true,
      views: 234,
    },
    {
      id: 2,
      title: "신규 기능 업데이트 안내",
      content:
        "고객 관리 시스템에 새로운 기능들이 추가되었습니다. 자동 배정 기능과 실시간 알림 기능을 확인해보세요.",
      author: "개발팀",
      date: "2024-01-08",
      important: false,
      views: 89,
    },
    {
      id: 3,
      title: "1월 팀 미팅 일정",
      content:
        "1월 정기 팀 미팅이 1월 20일 오후 2시에 예정되어 있습니다. 회의실 A에서 진행됩니다.",
      author: "인사팀",
      date: "2024-01-05",
      important: false,
      views: 67,
    },

    {
      id: 5,
      title: "휴가 신청 안내",
      content:
        "2024년 상반기 휴가 신청이 시작되었습니다. 인사 시스템을 통해 신청해주세요.",
      author: "인사팀",
      date: "2024-01-01",
      important: false,
      views: 123,
    },
  ]);

  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // URL 파라미터에서 공지사항 ID 확인하여 자동으로 열기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const noticeId = urlParams.get("id");

    if (noticeId) {
      const notice = notices.find((n) => n.id === parseInt(noticeId));
      if (notice) {
        setSelectedNotice(notice);
        // URL에서 파라미터 제거 (선택사항)
        window.history.replaceState({}, "", "/notice");
      }
    }
  }, [notices]);

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
  };

  const handleBackToList = () => {
    setSelectedNotice(null);
  };

  const handleSaveNotice = () => {
    // 실제로는 서버에 저장하는 로직
    alert("공지사항이 저장되었습니다.");
    setSelectedNotice(null);
  };

  const handlePermissionDenied = () => {
    setIsPermissionModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 글쓰기 페이지
  if (selectedNotice === "write") {
    return (
      <div className="notice-page">
        <div className="container">
          <div className="notice-write">
            <div className="notice-header">
              <button
                className="btn btn-secondary back-btn"
                onClick={handleBackToList}
              >
                ← 목록으로
              </button>
              <h1>공지사항 작성</h1>
            </div>

            <div className="write-form">
              <div className="form-group">
                <label htmlFor="title">제목</label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">내용</label>
                <textarea
                  id="content"
                  className="form-textarea"
                  rows="12"
                  placeholder="내용을 입력하세요"
                ></textarea>
              </div>

              <div className="form-bottom">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="important"
                    className="checkbox-input"
                  />
                  <label htmlFor="important" className="checkbox-label">
                    이 공지사항을 중요 공지로 설정
                  </label>
                </div>
                <button className="btn btn-primary" onClick={handleSaveNotice}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedNotice) {
    return (
      <div className="notice-page">
        <div className="container">
          <div className="notice-detail">
            <div className="notice-header">
              <button
                className="btn btn-secondary back-btn"
                onClick={handleBackToList}
              >
                ← 목록으로
              </button>
              <div className="notice-title-section">
                <h1>
                  {selectedNotice.important && (
                    <span className="important-badge">중요</span>
                  )}
                  {selectedNotice.title}
                </h1>
                <div className="notice-meta">
                  <span className="author">
                    작성자: {selectedNotice.author}
                  </span>
                  <span className="date">
                    {formatDate(selectedNotice.date)}
                  </span>
                  {/* <span className="views">조회수: {selectedNotice.views}</span> */}
                </div>
              </div>
            </div>

            <div className="notice-content">
              <p>{selectedNotice.content}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notice-page">
      <div className="container">
        <div className="page-header">
          <h1>공지사항</h1>
          <p>공지사항과 중요한 안내사항을 확인하세요</p>
        </div>

        <div className="notice-board">
          <div className="board-header">
            <div className="search-section">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="검색..."
                  // value={searchTerm}
                  // onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="search-btn">🔍</button>
              </div>
            </div>
            <div className="header-buttons">
              <button
                className="btn btn-secondary"
                onClick={handlePermissionDenied}
              >
                글쓰기 권한없음 버튼
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setSelectedNotice("write")}
              >
                글쓰기
              </button>
            </div>
          </div>

          <div className="notice-list">
            <div className="notice-list-header">
              <div className="col-title">제목</div>
              <div className="col-author">작성자</div>
              <div className="col-date">작성일</div>
            </div>

            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`notice-item ${notice.important ? "important" : ""}`}
                onClick={() => handleNoticeClick(notice)}
              >
                <div className="col-title">
                  {notice.important && (
                    <span className="important-badge">중요</span>
                  )}
                  <span className="title">{notice.title}</span>
                </div>
                <div className="col-author">{notice.author}</div>
                <div className="col-date">{formatDate(notice.date)}</div>
              </div>
            ))}
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

        {/* 권한 없음 모달 */}
        {isPermissionModalOpen && (
          <div
            className="modal-overlay"
            onClick={() => setIsPermissionModalOpen(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>권한 없음</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsPermissionModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="permission-icon">🚫</div>
                <p>공지사항을 작성할 권한이 없습니다.</p>
                <p>관리자에게 문의하세요.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => setIsPermissionModalOpen(false)}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticePage;
