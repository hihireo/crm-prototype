import React, { useState } from "react";
import CustomerInfoModal from "../components/CustomerInfoModal";
import "./ConsultationPage.css";

const ConsultationPage = ({ user, service }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState([]);

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

      // conversations 상태 업데이트
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedChat.id
            ? {
                ...conv,
                messages: [...conv.messages, newMsg],
                lastMessage: newMessage,
                timestamp: new Date().toLocaleString(),
              }
            : conv
        )
      );

      // selectedChat 상태도 동시에 업데이트하여 메인 채팅 화면에 실시간 반영
      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, newMsg],
        lastMessage: newMessage,
        timestamp: new Date().toLocaleString(),
      }));

      setNewMessage("");
    }
  };

  const handleSendAiMessage = () => {
    if (aiMessage.trim()) {
      const userMsg = {
        id: aiChatHistory.length + 1,
        sender: "user",
        content: aiMessage,
        timestamp: new Date().toLocaleString(),
      };

      // 사용자 메시지 추가
      setAiChatHistory((prev) => [...prev, userMsg]);

      // AI 응답 시뮬레이션 (실제로는 API 호출)
      setTimeout(() => {
        const aiResponse = {
          id: aiChatHistory.length + 2,
          sender: "ai",
          content: `"${aiMessage}"에 대한 AI 응답입니다. 이 부분에서 실제 AI API와 연동하여 답변을 받을 수 있습니다.`,
          timestamp: new Date().toLocaleString(),
        };
        setAiChatHistory((prev) => [...prev, aiResponse]);
      }, 1000);

      setAiMessage("");
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

  // eslint-disable-next-line no-unused-vars
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
                onClick={() => {
                  // 채팅방 선택시 해당 채팅방의 읽지 않은 메시지 카운트를 0으로 설정
                  const updatedConversation = {
                    ...conversation,
                    unreadCount: 0,
                  };
                  setSelectedChat(updatedConversation);

                  // conversations 상태에서도 해당 채팅방의 unreadCount를 0으로 업데이트
                  setConversations((prev) =>
                    prev.map((conv) =>
                      conv.id === conversation.id
                        ? { ...conv, unreadCount: 0 }
                        : conv
                    )
                  );
                }}
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
            {/* 고객 정보 영역 - 축소됨 */}
            <div className="customer-profile">
              <div className="profile-header-compact">
                <div className="consultation-profile-avatar-small">
                  {selectedChat.avatar}
                </div>
                <div className="profile-info-compact">
                  <h4>{selectedChat.customerName}</h4>
                  <span className="platform-badge-sidebar">
                    {getPlatformIcon(selectedChat.platform)}
                  </span>
                </div>
              </div>

              <div className="profile-fields-compact">
                <div className="field-group-compact">
                  <label>ID</label>
                  <span>{selectedChat.customerId}</span>
                </div>
                <div className="field-group-compact">
                  <label>담당자</label>
                  <span>{user.name}</span>
                </div>
              </div>

              <div className="profile-actions-compact">
                {/* <button className="btn btn-secondary btn-small">노트</button> */}
                <button className="btn btn-primary btn-small">상담 완료</button>
              </div>
            </div>

            {/* AI 채팅 영역 */}
            <div className="ai-chat-section">
              <div className="ai-chat-header">
                <h5>🤖 AI 상담 도우미</h5>
                <span className="ai-status">온라인</span>
              </div>

              <div className="ai-chat-messages">
                {aiChatHistory.length === 0 ? (
                  <div className="ai-welcome">
                    <p>상담에 도움이 필요하시면 언제든 AI에게 질문하세요.</p>
                  </div>
                ) : (
                  aiChatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`ai-message ${
                        message.sender === "user" ? "user" : "ai"
                      }`}
                    >
                      <div className="ai-message-content">
                        <p>{message.content}</p>
                        <span className="ai-message-time">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="ai-chat-input">
                <input
                  type="text"
                  className="ai-input"
                  placeholder="AI에게 질문하기..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendAiMessage()}
                />
                <button
                  className="ai-send-button"
                  onClick={handleSendAiMessage}
                  disabled={!aiMessage.trim()}
                >
                  📤
                </button>
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
