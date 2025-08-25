import React, { useState } from "react";
import "./ChannelSettingsPage.css";

const ChannelSettingsPage = ({ service }) => {
  const [channels, setChannels] = useState([
    {
      id: "instagram",
      name: "Instagram",
      description: "인스타그램 DM 연동",
      icon: "/images/platforms/Instagram_logo.png",
      category: "Business Messaging",
      isPopular: false,
      isConnected: true,
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

  const categories = [
    "All",
    "Business Messaging",
    "Calls",
    "SMS",
    "Email",
    "Live Chat",
  ];

  const handleConnect = (channelId) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === channelId ? { ...channel, isConnected: true } : channel
      )
    );
  };

  const handleDisconnect = (channelId) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === channelId ? { ...channel, isConnected: false } : channel
      )
    );
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
