import React, { useState } from "react";
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

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
  };

  const handleBackToList = () => {
    setSelectedNotice(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
                  <span className="views">조회수: {selectedNotice.views}</span>
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
          <p>시스템 관련 공지사항과 중요한 안내사항을 확인하세요</p>
        </div>

        <div className="notice-board">
          <div className="board-header">
            <div className="board-stats">
              <span>전체 {notices.length}개</span>
            </div>
            <button className="btn btn-primary">글쓰기</button>
          </div>

          <div className="notice-list">
            <div className="notice-list-header">
              <div className="col-title">제목</div>
              <div className="col-author">작성자</div>
              <div className="col-date">작성일</div>
              <div className="col-views">조회수</div>
            </div>

            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`notice-item ${notice.important ? "important" : ""}`}
                onClick={() => handleNoticeClick(notice)}
              >
                <div className="col-title">
                  {notice.important && (
                    <span className="important-icon">📌</span>
                  )}
                  <span className="title">{notice.title}</span>
                </div>
                <div className="col-author">{notice.author}</div>
                <div className="col-date">{formatDate(notice.date)}</div>
                <div className="col-views">{notice.views}</div>
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
      </div>
    </div>
  );
};

export default NoticePage;
