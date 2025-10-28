import React, { useState, useEffect, useCallback } from "react";
import CustomerInfoModal from "../components/CustomerInfoModal";
import CustomerRegistrationModal from "../components/CustomerRegistrationModal";
import "./ConsultationPage.css";

const ConsultationPage = ({ user, service }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCustomerLinkModalOpen, setIsCustomerLinkModalOpen] = useState(false);
  const [isCustomerLinkChoiceModalOpen, setIsCustomerLinkChoiceModalOpen] =
    useState(false);
  const [isCustomerRegistrationModalOpen, setIsCustomerRegistrationModalOpen] =
    useState(false);
  const [selectedCustomerForInfo, setSelectedCustomerForInfo] = useState(null);
  const [aiMessage, setAiMessage] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState([]);

  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState("전체");

  // 고객 연동 모달 관련 상태
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 연동 안된 고객 목록 샘플 데이터
  const unlinkedCustomers = [
    {
      id: 1,
      name: "홍길동",
      age: 35,
      phone: "010-1234-5678",
      team: "A팀",
      assignee: "김영업",
      applicationTime: "2024-09-15 14:20",
      assignmentTime: "2024-09-15 14:25",
    },
    {
      id: 2,
      name: "김철수",
      age: 42,
      phone: "010-2345-6789",
      team: "B팀",
      assignee: "박세일즈",
      applicationTime: "2024-09-15 13:45",
      assignmentTime: "2024-09-15 13:50",
    },
    {
      id: 3,
      name: "이영희",
      age: 28,
      phone: "010-3456-7890",
      team: "A팀",
      assignee: "이마케팅",
      applicationTime: "2024-09-15 12:30",
      assignmentTime: "2024-09-15 12:35",
    },
    {
      id: 4,
      name: "박민수",
      age: 31,
      phone: "010-4567-8901",
      team: "C팀",
      assignee: "정상담",
      applicationTime: "2024-09-15 11:15",
      assignmentTime: "2024-09-15 11:20",
    },
    {
      id: 5,
      name: "최수진",
      age: 39,
      phone: "010-5678-9012",
      team: "B팀",
      assignee: "최고객",
      applicationTime: "2024-09-15 10:00",
      assignmentTime: "2024-09-15 10:05",
    },
    {
      id: 6,
      name: "정민호",
      age: 45,
      phone: "010-6789-0123",
      team: "A팀",
      assignee: "김영업",
      applicationTime: "2024-09-15 09:30",
      assignmentTime: "2024-09-15 09:35",
    },
    {
      id: 7,
      name: "윤서연",
      age: 33,
      phone: "010-7890-1234",
      team: "C팀",
      assignee: "정상담",
      applicationTime: "2024-09-15 08:45",
      assignmentTime: "2024-09-15 08:50",
    },
    {
      id: 8,
      name: "강동원",
      age: 37,
      phone: "010-8901-2345",
      team: "B팀",
      assignee: "박세일즈",
      applicationTime: "2024-09-14 16:20",
      assignmentTime: "2024-09-14 16:25",
    },
    {
      id: 9,
      name: "송혜교",
      age: 29,
      phone: "010-9012-3456",
      team: "A팀",
      assignee: "이마케팅",
      applicationTime: "2024-09-14 15:10",
      assignmentTime: "2024-09-14 15:15",
    },
    {
      id: 10,
      name: "조인성",
      age: 41,
      phone: "010-0123-4567",
      team: "C팀",
      assignee: "정상담",
      applicationTime: "2024-09-14 14:30",
      assignmentTime: "2024-09-14 14:35",
    },
    {
      id: 11,
      name: "김태희",
      age: 34,
      phone: "010-1357-2468",
      team: "B팀",
      assignee: "최고객",
      applicationTime: "2024-09-14 13:15",
      assignmentTime: "2024-09-14 13:20",
    },
    {
      id: 12,
      name: "박보검",
      age: 30,
      phone: "010-2468-1357",
      team: "A팀",
      assignee: "김영업",
      applicationTime: "2024-09-14 12:00",
      assignmentTime: "2024-09-14 12:05",
    },
  ];

  // 필터 모달 상태 관리
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    platform: "all",
    statusCategories: [],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    platform: "all",
    statusCategories: [],
  });

  // 드롭다운 상태 관리
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // 레이아웃 모드 상태 관리
  const [layoutMode, setLayoutMode] = useState("default"); // "default" 또는 "compact"

  // 상담 카테고리 옵션
  const consultationCategories = [
    "일반",
    "부재",
    "재상담",
    "관리중",
    "AS요청",
    "AS확정",
    "실패",
    "결제완료",
    "무료방안내",
    "무료방입장",
    "결제유력",
  ];

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
      consultationStatus: "상담 중",
      avatar: "S",
      isLinked: false, // 고객 연동 안됨
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
      consultationStatus: "상담 중",
      avatar: "김",
      isLinked: true, // 고객 연동됨
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
      consultationStatus: "상담 완료",
      avatar: "박",
      isLinked: false, // 고객 연동 안됨
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
      consultationStatus: "상담 중",
      avatar: "이",
      isLinked: false, // 고객 연동 안됨
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

  // 필터 함수들
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleFilterApply = () => {
    setAppliedFilters({ ...filters });
    setIsFilterModalOpen(false);
  };

  const handleFilterReset = () => {
    const resetFilters = {
      platform: "all",
      statusCategories: [],
    };
    setFilters(resetFilters);
  };

  // 상담 카테고리 다중 선택 핸들러
  const handleStatusCategoryToggle = (category) => {
    setFilters((prev) => {
      const currentCategories = prev.statusCategories;
      const isSelected = currentCategories.includes(category);

      if (isSelected) {
        return {
          ...prev,
          statusCategories: currentCategories.filter((c) => c !== category),
        };
      } else {
        return {
          ...prev,
          statusCategories: [...currentCategories, category],
        };
      }
    });
  };

  // 카테고리 제거 핸들러
  const handleRemoveStatusCategory = (categoryToRemove) => {
    setFilters((prev) => ({
      ...prev,
      statusCategories: prev.statusCategories.filter(
        (category) => category !== categoryToRemove
      ),
    }));
  };

  // 드롭다운 위치 계산 및 열기
  const handleDropdownToggle = (e) => {
    if (!isStatusDropdownOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsStatusDropdownOpen(!isStatusDropdownOpen);
  };

  // 드롭다운 외부 클릭 감지
  const handleDropdownClickOutside = useCallback((e) => {
    if (!e.target.closest(".cp-status-dropdown-container")) {
      setIsStatusDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isStatusDropdownOpen) {
      document.addEventListener("click", handleDropdownClickOutside);
      return () => {
        document.removeEventListener("click", handleDropdownClickOutside);
      };
    }
  }, [isStatusDropdownOpen, handleDropdownClickOutside]);

  // 상담 완료 처리 함수
  const handleConsultationComplete = () => {
    if (selectedChat) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedChat.id
            ? { ...conv, consultationStatus: "상담 완료" }
            : conv
        )
      );
      setSelectedChat((prev) => ({
        ...prev,
        consultationStatus: "상담 완료",
      }));
      setActiveTab("상담 완료");
    }
  };

  // 고객 등록 핸들러
  const handleCustomerRegistration = (newCustomer) => {
    console.log("새로운 고객이 등록되었습니다:", newCustomer);
    setIsCustomerRegistrationModalOpen(false);
    alert("고객이 성공적으로 등록되었습니다.");
  };

  // 탭과 필터에 따른 대화 목록 필터링
  const getFilteredConversations = () => {
    let filtered = conversations;

    // 탭 필터링
    if (activeTab === "상담 중") {
      filtered = filtered.filter(
        (conv) => conv.consultationStatus === "상담 중"
      );
    } else if (activeTab === "상담 완료") {
      filtered = filtered.filter(
        (conv) => conv.consultationStatus === "상담 완료"
      );
    }

    // 플랫폼 필터링
    if (appliedFilters.platform !== "all") {
      filtered = filtered.filter(
        (conv) => conv.platform === appliedFilters.platform
      );
    }

    // 상담 카테고리 필터링
    if (appliedFilters.statusCategories.length > 0) {
      filtered = filtered.filter((conv) =>
        appliedFilters.statusCategories.includes(conv.status)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  const filteredConversations = getFilteredConversations();

  return (
    <div
      className="consultation-page"
      onClick={(e) => {
        // 컨테이너 바깥 영역 클릭 시 채팅방 선택 해제
        if (e.target === e.currentTarget) {
          setSelectedChat(null);
        }
      }}
    >
      <div className="consultation-container">
        <div
          className="consultation-layout"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 채팅 목록 사이드바 */}
          <div className="chat-sidebar">
            <div className="sidebar-header">
              <div className="cp-header-top">
                <h2>상담 채팅</h2>
                <div className="cp-header-actions">
                  <button
                    className="cp-filter-btn"
                    onClick={() => setIsFilterModalOpen(true)}
                    title="필터"
                  >
                    <div className="cp-filter-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </button>
                  <div className="cp-layout-toggle">
                    <button
                      className={`cp-layout-option ${
                        layoutMode === "default" ? "cp-layout-active" : ""
                      }`}
                      onClick={() => setLayoutMode("default")}
                      title="기본 레이아웃"
                    >
                      ☰
                    </button>
                    <button
                      className={`cp-layout-option ${
                        layoutMode === "compact" ? "cp-layout-active" : ""
                      }`}
                      onClick={() => setLayoutMode("compact")}
                      title="컴팩트 레이아웃"
                    >
                      <div className="cp-grid-icon">
                        <div className="cp-grid-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* 탭 영역 */}
              <div className="cp-tabs">
                {["전체", "상담 중", "상담 완료"].map((tab) => (
                  <button
                    key={tab}
                    className={`cp-tab ${
                      activeTab === tab ? "cp-tab-active" : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="chat-stats">
                <span>총 {filteredConversations.length}건</span>
                <span>
                  미읽음{" "}
                  {filteredConversations.reduce(
                    (sum, conv) => sum + conv.unreadCount,
                    0
                  )}
                  건
                </span>
              </div>
            </div>

            <div
              className={`chat-list ${
                layoutMode === "compact" ? "cp-compact-layout" : ""
              }`}
            >
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`chat-item ${
                    selectedChat?.id === conversation.id ? "active" : ""
                  } ${layoutMode === "compact" ? "cp-compact-item" : ""}`}
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
                  {layoutMode === "compact" ? (
                    // 컴팩트 레이아웃
                    <div className="cp-compact-content">
                      <div className="cp-compact-name">
                        {conversation.customerName}
                      </div>
                      <div className="cp-compact-platform">
                        {getPlatformIcon(conversation.platform)}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="cp-compact-unread">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  ) : (
                    // 기본 레이아웃
                    <>
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
                            {conversation.timestamp
                              .split(" ")
                              .slice(-2)
                              .join(" ")}
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
                    </>
                  )}
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
                    {selectedChat.isLinked ? (
                      <>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setIsCustomerModalOpen(true)}
                        >
                          고객 정보
                        </button>
                        <button
                          className="btn btn-secondary"
                          // onClick={() => setIsCustomerModalOpen(true)}
                        >
                          <img
                            src="/images/chain.png"
                            alt="연동 끊기"
                            className="cim-disconnect-icon"
                          />
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-warning"
                        onClick={() => setIsCustomerLinkChoiceModalOpen(true)}
                      >
                        고객 연동
                      </button>
                    )}
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
                        <span className="message-time">
                          {message.timestamp}
                        </span>
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
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
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
          <div className="customer-sidebar">
            {selectedChat ? (
              <>
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
                    {/* <div className="field-group-compact">
                      <label>담당자</label>
                      <span>{user.name}</span>
                    </div> */}
                  </div>

                  <div className="profile-actions-compact">
                    {/* <button className="btn btn-secondary btn-small">노트</button> */}
                    <button
                      className="btn btn-primary btn-small"
                      onClick={handleConsultationComplete}
                      disabled={
                        selectedChat?.consultationStatus === "상담 완료"
                      }
                    >
                      {selectedChat?.consultationStatus === "상담 완료"
                        ? "완료됨"
                        : "상담 완료"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* 기본 화면 - 채팅방이 선택되지 않았을 때 */
              <div className="customer-profile">
                <div className="empty-customer-illustration">
                  <div className="empty-icon">💬</div>
                  <h4>상담 대기중</h4>
                </div>
              </div>
            )}

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
                  placeholder={
                    selectedChat
                      ? "AI에게 질문하기..."
                      : "먼저 채팅방을 선택하세요"
                  }
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && selectedChat && handleSendAiMessage()
                  }
                  disabled={!selectedChat}
                />
                <button
                  className="ai-send-button"
                  onClick={handleSendAiMessage}
                  disabled={!selectedChat || !aiMessage.trim()}
                >
                  📤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 고객 정보 모달 */}
      <CustomerInfoModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerData={selectedChat}
      />

      {/* 고객 연동 선택 모달 */}
      {isCustomerLinkChoiceModalOpen && (
        <CustomerLinkChoiceModal
          isOpen={isCustomerLinkChoiceModalOpen}
          onClose={() => setIsCustomerLinkChoiceModalOpen(false)}
          onSelectNewCustomer={() => {
            setIsCustomerLinkChoiceModalOpen(false);
            setIsCustomerRegistrationModalOpen(true);
          }}
          onSelectExistingCustomer={() => {
            setIsCustomerLinkChoiceModalOpen(false);
            setIsCustomerLinkModalOpen(true);
          }}
        />
      )}

      {/* 고객 등록 모달 */}
      <CustomerRegistrationModal
        isOpen={isCustomerRegistrationModalOpen}
        onClose={() => setIsCustomerRegistrationModalOpen(false)}
        onRegister={handleCustomerRegistration}
      />

      {/* 선택된 고객 정보 모달 */}
      {selectedCustomerForInfo && (
        <CustomerInfoModal
          isOpen={!!selectedCustomerForInfo}
          onClose={() => setSelectedCustomerForInfo(null)}
          customerData={{
            name: selectedCustomerForInfo.name,
            phone: selectedCustomerForInfo.phone,
            age: selectedCustomerForInfo.age,
            workplace: selectedCustomerForInfo.team,
            memo: `담당자: ${selectedCustomerForInfo.assignee}`,
          }}
        />
      )}

      {/* 필터 모달 */}
      {isFilterModalOpen && (
        <div
          className="cp-filter-modal-overlay"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div className="cp-filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-filter-modal-header">
              <h3>필터 설정</h3>
              <button
                className="cp-filter-modal-close"
                onClick={() => setIsFilterModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="cp-filter-modal-content">
              {/* 메신저 필터 */}
              <div className="cp-filter-group">
                <label>메신저</label>
                <div className="cp-platform-options">
                  <button
                    className={`cp-platform-btn ${
                      filters.platform === "all" ? "cp-platform-active" : ""
                    }`}
                    onClick={() => handleFilterChange("platform", "all")}
                    title="전체"
                  >
                    전체
                  </button>
                  <button
                    className={`cp-platform-btn ${
                      filters.platform === "telegram"
                        ? "cp-platform-active"
                        : ""
                    }`}
                    onClick={() => handleFilterChange("platform", "telegram")}
                    title="텔레그램"
                  >
                    <img
                      src="/images/platforms/telegram_logo.png"
                      alt="Telegram"
                      className="cp-platform-icon"
                    />
                  </button>
                  <button
                    className={`cp-platform-btn ${
                      filters.platform === "instagram"
                        ? "cp-platform-active"
                        : ""
                    }`}
                    onClick={() => handleFilterChange("platform", "instagram")}
                    title="인스타그램"
                  >
                    <img
                      src="/images/platforms/Instagram_logo.png"
                      alt="Instagram"
                      className="cp-platform-icon"
                    />
                  </button>
                  <button
                    className={`cp-platform-btn ${
                      filters.platform === "line" ? "cp-platform-active" : ""
                    }`}
                    onClick={() => handleFilterChange("platform", "line")}
                    title="라인"
                  >
                    <img
                      src="/images/platforms/line_logo.png"
                      alt="Line"
                      className="cp-platform-icon"
                    />
                  </button>
                </div>
              </div>

              {/* 처리상태 필터 */}
              <div className="cp-filter-group">
                <label>처리상태</label>
                <div className="cp-status-filter-container">
                  <div className="cp-status-dropdown-container">
                    {/* 드롭다운 버튼 */}
                    <button
                      type="button"
                      onClick={handleDropdownToggle}
                      className="cp-dropdown-trigger"
                    >
                      <span className="cp-dropdown-text">
                        {filters.statusCategories.length === 0
                          ? "상태 선택"
                          : `${filters.statusCategories.length}개 선택됨`}
                      </span>
                      <svg
                        className={`cp-dropdown-icon ${
                          isStatusDropdownOpen ? "cp-dropdown-icon-open" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* 선택된 카테고리 태그들 */}
                  {filters.statusCategories.length > 0 && (
                    <div className="cp-selected-tags">
                      {filters.statusCategories.map((category) => (
                        <span key={category} className="cp-category-tag">
                          {category}
                          <button
                            type="button"
                            onClick={() => handleRemoveStatusCategory(category)}
                            className="cp-tag-remove"
                            aria-label={`${category} 제거`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="cp-filter-modal-actions">
              <button
                className="cp-filter-btn-reset"
                onClick={handleFilterReset}
              >
                초기화
              </button>
              <button
                className="cp-filter-btn-apply"
                onClick={handleFilterApply}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 드롭다운 메뉴 - 모달 외부에 렌더링 */}
      {isStatusDropdownOpen && (
        <div
          className="cp-dropdown-menu"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {/* 카테고리 옵션들 */}
          <div className="cp-dropdown-options">
            {consultationCategories.map((category) => (
              <label
                key={category}
                className="cp-dropdown-option"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleStatusCategoryToggle(category);
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.statusCategories.includes(category)}
                  onChange={() => {}} // 빈 함수로 설정하여 label onClick으로만 처리
                  className="cp-checkbox"
                />
                <span className="cp-checkbox-label">{category}</span>
              </label>
            ))}
          </div>

          {/* 드롭다운 하단 액션 */}
          <div className="cp-dropdown-actions">
            <button
              type="button"
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  statusCategories: [],
                }));
              }}
              className="cp-clear-all"
            >
              전체 해제
            </button>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(false)}
              className="cp-dropdown-close"
            >
              완료
            </button>
          </div>
        </div>
      )}

      {/* 고객 연동 모달 */}
      {isCustomerLinkModalOpen && (
        <CustomerLinkModal
          isOpen={isCustomerLinkModalOpen}
          onClose={() => {
            setIsCustomerLinkModalOpen(false);
            setCurrentPage(1);
            setCustomerSearchQuery("");
          }}
          unlinkedCustomers={unlinkedCustomers}
          customerSearchQuery={customerSearchQuery}
          setCustomerSearchQuery={setCustomerSearchQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onLinkCustomer={(customer) => {
            // 고객 연동 확인 알럿
            if (
              window.confirm(
                `${customer.name} 고객과 현재 채팅을 연동하시겠습니까?`
              )
            ) {
              // 고객 연동 처리 로직
              console.log("고객 연동:", customer);
              setIsCustomerLinkModalOpen(false);
              alert(`${customer.name} 고객이 성공적으로 연동되었습니다.`);
              // 실제로는 여기서 API 호출하여 연동 처리
            }
          }}
          onCustomerClick={(customer) => {
            setSelectedCustomerForInfo(customer);
          }}
        />
      )}
    </div>
  );
};

// 고객 연동 모달 컴포넌트
const CustomerLinkModal = ({
  isOpen,
  onClose,
  unlinkedCustomers,
  customerSearchQuery,
  setCustomerSearchQuery,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  onLinkCustomer,
  onCustomerClick,
}) => {
  if (!isOpen) return null;

  // 검색 필터링
  const filteredCustomers = unlinkedCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.phone.includes(customerSearchQuery) ||
      customer.assignee
        .toLowerCase()
        .includes(customerSearchQuery.toLowerCase())
  );

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // 검색어가 변경될 때 페이지를 1로 리셋
  const handleSearchChange = (e) => {
    setCustomerSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="consult-link-modal-overlay" onClick={onClose}>
      <div
        className="consult-link-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="consult-link-modal-header">
          <h3>고객 연동</h3>
          <button className="consult-link-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="consult-link-modal-body">
          <div className="consult-link-search-section">
            <p className="consult-link-description">
              현재 자신에게 할당된 고객 중 아직 연동이 안된 고객 목록입니다.
            </p>
            <div className="consult-link-search-wrapper">
              <input
                type="text"
                placeholder="이름, 연락처로 검색..."
                value={customerSearchQuery}
                onChange={handleSearchChange}
                className="consult-link-search-input"
              />
              <div className="consult-link-search-icon">🔍</div>
            </div>
          </div>

          <div className="consult-link-table-wrapper">
            <table className="consult-link-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연령</th>
                  <th>연락처</th>
                  <th>담당팀</th>
                  <th>담당자</th>
                  <th>신청시간</th>
                  <th>연동</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.length > 0 ? (
                  currentCustomers.map((customer) => (
                    <tr key={customer.id} className="consult-link-customer-row">
                      <td
                        className="consult-link-customer-name consult-link-clickable-cell"
                        onClick={() =>
                          onCustomerClick && onCustomerClick(customer)
                        }
                      >
                        {customer.name}
                      </td>
                      <td
                        className="consult-link-customer-age consult-link-clickable-cell"
                        onClick={() =>
                          onCustomerClick && onCustomerClick(customer)
                        }
                      >
                        {customer.age}세
                      </td>
                      <td
                        className="consult-link-customer-phone consult-link-clickable-cell"
                        onClick={() =>
                          onCustomerClick && onCustomerClick(customer)
                        }
                      >
                        {customer.phone}
                      </td>
                      <td
                        className="consult-link-customer-team consult-link-clickable-cell"
                        onClick={() =>
                          onCustomerClick && onCustomerClick(customer)
                        }
                      >
                        {customer.team}
                      </td>
                      <td
                        className="consult-link-customer-assignee consult-link-clickable-cell"
                        onClick={() =>
                          onCustomerClick && onCustomerClick(customer)
                        }
                      >
                        {customer.assignee}
                      </td>
                      <td
                        className="consult-link-customer-app-time consult-link-clickable-cell"
                        onClick={() =>
                          onCustomerClick && onCustomerClick(customer)
                        }
                      >
                        {customer.applicationTime}
                      </td>
                      <td>
                        <button
                          className="consult-link-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLinkCustomer(customer);
                          }}
                        >
                          연동
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="consult-link-no-results">
                      {customerSearchQuery
                        ? "검색 결과가 없습니다."
                        : "연동 가능한 고객이 없습니다."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {filteredCustomers.length > itemsPerPage && (
            <div className="consult-link-pagination">
              <button
                className="consult-link-pagination-btn"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </button>
              <div className="consult-link-pagination-info">
                {currentPage} / {totalPages} 페이지
                <span className="consult-link-pagination-total">
                  (총 {filteredCustomers.length}명)
                </span>
              </div>
              <button
                className="consult-link-pagination-btn"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>
          )}
        </div>

        <div className="consult-link-modal-footer">
          <button className="consult-link-cancel-btn" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

// 고객 연동 선택 모달 컴포넌트
const CustomerLinkChoiceModal = ({
  isOpen,
  onClose,
  onSelectNewCustomer,
  onSelectExistingCustomer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="cplcm-modal-overlay" onClick={onClose}>
      <div className="cplcm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cplcm-modal-header">
          <h3>고객 연동 방식 선택</h3>
          <button className="cplcm-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cplcm-modal-body">
          <p className="cplcm-description">
            고객 정보를 어떻게 연동하시겠습니까?
          </p>

          <div className="cplcm-choice-buttons">
            <button
              className="cplcm-choice-btn cplcm-new-customer"
              onClick={onSelectNewCustomer}
            >
              <div className="cplcm-btn-icon">👤</div>
              <div className="cplcm-btn-content">
                <h4>새 고객 정보 추가</h4>
                <p>새로운 고객 정보를 입력하여 등록합니다</p>
              </div>
            </button>

            <button
              className="cplcm-choice-btn cplcm-existing-customer"
              onClick={onSelectExistingCustomer}
            >
              <div className="cplcm-btn-icon">🔗</div>
              <div className="cplcm-btn-content">
                <h4>기존 고객과 연동</h4>
                <p>이미 등록된 고객과 채팅을 연결합니다</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;
