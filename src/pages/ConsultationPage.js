import React, { useState } from "react";
import CustomerInfoModal from "../components/CustomerInfoModal";
import "./ConsultationPage.css";

const ConsultationPage = ({ user, service }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // 메신저별 채팅 목록
  const [conversations, setConversations] = useState([
    {
      id: 1,
      platform: "telegram",
      platformName: "텔레그램",
      customerName: "투자왕",
      customerId: "31073160",
      lastMessage: "안녕하세요",
      timestamp: "Aug 20, 4:20:00 PM",
      unreadCount: 1,
      status: "New Lead",
      avatar: "S",
      messages: [
        {
          id: 1,
          sender: "customer",
          content: "안녕하세요",
          timestamp: "Aug 20, 4:20:00 PM",
          type: "text",
        },
      ],
    },
    {
      id: 2,
      platform: "instagram",
      platformName: "인스타그램",
      customerName: "김영희",
      customerId: "younghee_kim",
      lastMessage: "지표 관련 문의 드려요",
      timestamp: "Aug 20, 3:45:00 PM",
      unreadCount: 3,
      status: "Hot Lead",
      avatar: "김",
      messages: [
        {
          id: 1,
          sender: "customer",
          content: "지표 관련 문의 드려요",
          timestamp: "Aug 20, 3:40:00 PM",
          type: "text",
        },
        {
          id: 2,
          sender: "customer",
          content: "지표 이용료가 어떻게 되나요?",
          timestamp: "Aug 20, 3:42:00 PM",
          type: "text",
        },
        {
          id: 3,
          sender: "customer",
          content: "사용하고 싶어요",
          timestamp: "Aug 20, 3:45:00 PM",
          type: "text",
        },
      ],
    },
    {
      id: 3,
      platform: "line",
      platformName: "라인",
      customerName: "박철수",
      customerId: "chulsoo_park",
      lastMessage: "바로 됩니다. 감사합니다!",
      timestamp: "Aug 20, 2:15:00 PM",
      unreadCount: 0,
      status: "Customer",
      avatar: "박",
      messages: [
        {
          id: 1,
          sender: "agent",
          content: "안녕하세요! 문의 주신 내용 관련해서 연락드립니다.",
          timestamp: "Aug 20, 2:10:00 PM",
          type: "text",
        },
        {
          id: 2,
          sender: "customer",
          content: "네 안녕하세요",
          timestamp: "Aug 20, 2:12:00 PM",
          type: "text",
        },
        {
          id: 3,
          sender: "agent",
          content:
            "요청하신 조건에 맞는 상품을 찾았습니다. 언제 시간 되실까요?",
          timestamp: "Aug 20, 2:13:00 PM",
          type: "text",
        },
        {
          id: 4,
          sender: "customer",
          content: "바로 됩니다. 감사합니다!",
          timestamp: "Aug 20, 2:15:00 PM",
          type: "text",
        },
      ],
    },
    {
      id: 4,
      platform: "telegram",
      platformName: "텔레그램",
      customerName: "이민수",
      customerId: "minsu_lee",
      lastMessage: "상담 예약하고 싶어요",
      timestamp: "Aug 20, 1:30:00 PM",
      unreadCount: 2,
      status: "New Lead",
      avatar: "이",
      messages: [
        {
          id: 1,
          sender: "customer",
          content: "안녕하세요",
          timestamp: "Aug 20, 1:25:00 PM",
          type: "text",
        },
        {
          id: 2,
          sender: "customer",
          content: "상담 예약하고 싶어요",
          timestamp: "Aug 20, 1:30:00 PM",
          type: "text",
        },
      ],
    },
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const newMsg = {
        id: selectedChat.messages.length + 1,
        sender: "agent",
        content: newMessage,
        timestamp: new Date().toLocaleString(),
        type: "text",
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedChat.id
            ? {
                ...conv,
                messages: [...conv.messages, newMsg],
                lastMessage: newMessage,
              }
            : conv
        )
      );

      setNewMessage("");
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "telegram":
        return (
          <img
            src="/images/platforms/telegram_logo.png"
            alt="Telegram"
            className="platform-icon"
          />
        );
      case "instagram":
        return (
          <img
            src="/images/platforms/Instagram_logo.png"
            alt="Instagram"
            className="platform-icon"
          />
        );
      case "line":
        return (
          <img
            src="/images/platforms/line_logo.png"
            alt="Line"
            className="platform-icon"
          />
        );
      default:
        return "💬";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "New Lead":
        return "status-new";
      case "Hot Lead":
        return "status-hot";
      case "Customer":
        return "status-customer";
      case "Payment":
        return "status-payment";
      default:
        return "status-new";
    }
  };

  const filteredConversations = conversations.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="consultation-page">
      <div className="consultation-layout">
        {/* 채팅 목록 사이드바 */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>상담 채팅</h2>
            <div className="chat-stats">
              <span>총 {conversations.length}건</span>
              <span>
                미읽음{" "}
                {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
                건
              </span>
            </div>
          </div>

          <div className="platform-filters">
            <button className="platform-filter active">전체</button>
            <button className="platform-filter">
              <img
                src="/images/platforms/telegram_logo.png"
                alt="Telegram"
                className="filter-icon"
              />
            </button>
            <button className="platform-filter">
              <img
                src="/images/platforms/Instagram_logo.png"
                alt="Instagram"
                className="filter-icon"
              />
            </button>
            <button className="platform-filter">
              <img
                src="/images/platforms/line_logo.png"
                alt="Line"
                className="filter-icon"
              />
            </button>
          </div>

          <div className="chat-list">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`chat-item ${
                  selectedChat?.id === conversation.id ? "active" : ""
                }`}
                onClick={() => setSelectedChat(conversation)}
              >
                <div className="chat-avatar-section">
                  <div className="chat-avatar">{conversation.avatar}</div>
                </div>

                <div className="chat-info">
                  <div className="chat-header">
                    <div className="customer-name-with-icon">
                      <span className="customer-name">
                        {conversation.customerName}
                      </span>
                      <span className="platform-badge">
                        {getPlatformIcon(conversation.platform)}
                      </span>
                    </div>
                    <span className="chat-time">
                      {conversation.timestamp.split(" ").slice(-2).join(" ")}
                    </span>
                  </div>
                  <div className="chat-preview">
                    <span className="last-message">
                      {conversation.lastMessage}
                    </span>
                  </div>
                  <div className="chat-status">
                    {conversation.unreadCount > 0 && (
                      <span className="unread-count">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 채팅 메인 영역 */}
        <div className="chat-main">
          {selectedChat ? (
            <>
              {/* 채팅 헤더 */}
              <div className="chat-header-section">
                <div className="customer-info">
                  <div className="customer-avatar">{selectedChat.avatar}</div>
                  <div className="customer-details">
                    <div className="customer-title-with-icon">
                      <h3>{selectedChat.customerName}</h3>
                      <span className="platform-badge-header">
                        {getPlatformIcon(selectedChat.platform)}
                      </span>
                    </div>
                    <p>ID: {selectedChat.customerId}</p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsCustomerModalOpen(true)}
                  >
                    고객 정보
                  </button>
                  <button className="btn btn-primary">배정하기</button>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div className="messages-container">
                {selectedChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${
                      message.sender === "agent" ? "sent" : "received"
                    }`}
                  >
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 메시지 입력 영역 */}
              <div className="message-input-section">
                <div className="input-tools">
                  <button className="tool-btn">📎</button>
                  <button className="tool-btn">😊</button>
                  <button className="tool-btn">🖼️</button>
                </div>
                <div className="message-input-area">
                  <input
                    type="text"
                    className="message-input"
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    전송
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <h3>채팅을 선택하세요</h3>
                <p>왼쪽 목록에서 상담할 고객을 선택하세요</p>
              </div>
            </div>
          )}
        </div>

        {/* 고객 정보 사이드바 */}
        {selectedChat && (
          <div className="customer-sidebar">
            <div className="customer-profile">
              <div className="profile-header">
                <div className="consultation-profile-avatar">
                  {selectedChat.avatar}
                </div>
                <div className="profile-title-with-icon">
                  <h4>{selectedChat.customerName}</h4>
                  <span className="platform-badge-sidebar">
                    {getPlatformIcon(selectedChat.platform)}
                  </span>
                </div>
              </div>

              <div className="profile-fields">
                <div className="field-group">
                  <label>고객 ID</label>
                  <span>{selectedChat.customerId}</span>
                </div>
                <div className="field-group">
                  <label>첫 접촉</label>
                  <span>{selectedChat.timestamp}</span>
                </div>
                <div className="field-group">
                  <label>담당자</label>
                  <span>{user.name}</span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn btn-secondary">노트 추가</button>
                <button className="btn btn-primary">상담 완료</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 고객 정보 모달 */}
      <CustomerInfoModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerData={selectedChat}
      />
    </div>
  );
};

export default ConsultationPage;
