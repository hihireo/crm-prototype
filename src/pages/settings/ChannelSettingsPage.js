import React, { useState, useEffect } from "react";
import "./ChannelSettingsPage.css";

const ChannelSettingsPage = ({ service }) => {
  // Instagram 연결 상태를 로컬 스토리지에서 확인
  const getInstagramConnectionStatus = () => {
    const connection = localStorage.getItem("instagram_connection");
    return connection ? JSON.parse(connection).isConnected : false;
  };

  const [channels, setChannels] = useState([
    {
      id: "instagram",
      name: "Instagram",
      description: "인스타그램 DM 연동",
      icon: "/images/platforms/Instagram_logo.png",
      category: "Business Messaging",
      isPopular: false,
      isConnected: getInstagramConnectionStatus(),
      isBeta: false,
    },
    {
      id: "telegram",
      name: "Telegram",
      description: "텔레그램 봇 연동",
      icon: "/images/platforms/telegram_logo.png",
      category: "Business Messaging",
      isPopular: false,
      isConnected: true,
      isBeta: false,
    },
    {
      id: "line",
      name: "LINE",
      description: "라인 공식 계정 연동",
      icon: "/images/platforms/line_logo.png",
      category: "Business Messaging",
      isPopular: true,
      isConnected: false,
      isBeta: false,
    },
  ]);

  const [activeCategory, setActiveCategory] = useState("All");

  // 컴포넌트 마운트 시 Instagram 연결 상태 업데이트
  useEffect(() => {
    const updateInstagramStatus = () => {
      const isConnected = getInstagramConnectionStatus();
      setChannels((prev) =>
        prev.map((channel) =>
          channel.id === "instagram" ? { ...channel, isConnected } : channel
        )
      );
    };

    updateInstagramStatus();

    // storage 이벤트 리스너 추가 (다른 탭에서 연결 상태가 변경될 때)
    window.addEventListener("storage", updateInstagramStatus);

    return () => {
      window.removeEventListener("storage", updateInstagramStatus);
    };
  }, []);

  const categories = [
    "All",
    "Business Messaging",
    "Calls",
    "SMS",
    "Email",
    "Live Chat",
  ];

  const handleConnect = (channelId) => {
    if (channelId === "instagram") {
      handleInstagramConnect();
    } else {
      // 다른 채널들은 기존 로직 사용
      setChannels((prev) =>
        prev.map((channel) =>
          channel.id === channelId ? { ...channel, isConnected: true } : channel
        )
      );
    }
  };

  const handleInstagramConnect = () => {
    // Instagram OAuth URL 구성
    const clientId = "622214674056498";
    const redirectUri = "http://localhost:3000/instagram/callback";
    const scope = [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_content_publish",
      "instagram_business_manage_insights",
    ].join(",");

    const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}`;

    // 새 창에서 Instagram 인증 페이지 열기
    window.open(
      instagramAuthUrl,
      "instagram_auth",
      "width=600,height=700,scrollbars=yes"
    );
  };

  const handleDisconnect = (channelId) => {
    if (channelId === "instagram") {
      // Instagram 연결 해제
      localStorage.removeItem("instagram_connection");
      setChannels((prev) =>
        prev.map((channel) =>
          channel.id === channelId
            ? { ...channel, isConnected: false }
            : channel
        )
      );
    } else {
      // 다른 채널들은 기존 로직 사용
      setChannels((prev) =>
        prev.map((channel) =>
          channel.id === channelId
            ? { ...channel, isConnected: false }
            : channel
        )
      );
    }
  };

  const filteredChannels = channels.filter(
    (channel) => activeCategory === "All" || channel.category === activeCategory
  );

  const connectedCount = channels.filter(
    (channel) => channel.isConnected
  ).length;

  return (
    <div className="channel-settings">
      <div className="channel-header">
        <div className="header-content">
          <h2>상담 채널 연동</h2>
          {/* <p>
            Manage your messaging channels and discover new ones to help you
            acquire more customers.
          </p> */}
        </div>
        <div className="header-stats">
          <span className="connected-count">
            연결된 채널: {connectedCount}개
          </span>
        </div>
      </div>

      {/* <div className="channel-filters">
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search Channel Catalog"
            className="search-input"
          />
        </div>
      </div> */}

      <div className="channels-section">
        {/* <h3>{activeCategory}</h3> */}
        <div className="channels-grid">
          {filteredChannels.map((channel) => (
            <div key={channel.id} className="channel-card">
              <div className="channel-card-header">
                <div className="channel-icon">
                  <img src={channel.icon} alt={channel.name} />
                </div>
                <div className="channel-badges">
                  {channel.isPopular && (
                    <span className="badge popular">Popular</span>
                  )}
                  {channel.isBeta && <span className="badge beta">Beta</span>}
                </div>
              </div>

              <div className="channel-info">
                <h4 className="channel-name">{channel.name}</h4>
                <p className="channel-description">{channel.description}</p>
              </div>

              <div className="channel-actions">
                {channel.isConnected ? (
                  <div className="connected-state">
                    <span className="connection-status">연결됨</span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDisconnect(channel.id)}
                    >
                      연결 해제
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleConnect(channel.id)}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelSettingsPage;
