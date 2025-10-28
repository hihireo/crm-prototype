import React, { useState, useEffect } from "react";
import "./ChannelSettingsPage.css";

const ChannelSettingsPage = ({ service }) => {
  // 현재 보여줄 화면 상태 관리
  const [currentView, setCurrentView] = useState("main"); // main, telegram, line
  const [lineStep, setLineStep] = useState(1); // 라인 연동 단계 (1, 2, 3)

  // 텔레그램 봇 토큰 상태
  const [telegramBotToken, setTelegramBotToken] = useState("");

  // 라인 연동 정보 상태
  const [lineChannelId, setLineChannelId] = useState("");
  const [lineChannelSecret, setLineChannelSecret] = useState("");

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

  const handleConnect = (channelId) => {
    if (channelId === "instagram") {
      handleInstagramConnect();
    } else if (channelId === "telegram") {
      setCurrentView("telegram");
    } else if (channelId === "line") {
      setCurrentView("line");
      setLineStep(1);
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

  // 뒤로가기 함수
  const handleGoBack = () => {
    setCurrentView("main");
    setLineStep(1);
    setTelegramBotToken("");
    setLineChannelId("");
    setLineChannelSecret("");
  };

  // 텔레그램 연동 완료 함수
  const handleTelegramConnect = () => {
    if (!telegramBotToken.trim()) {
      alert("봇 토큰을 입력해주세요.");
      return;
    }

    // 텔레그램 연결 상태 업데이트
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === "telegram" ? { ...channel, isConnected: true } : channel
      )
    );

    // 메인 화면으로 돌아가기
    handleGoBack();
    alert("텔레그램 연동이 완료되었습니다!");
  };

  // 라인 다음 단계로 이동
  const handleLineNext = () => {
    if (lineStep < 3) {
      setLineStep(lineStep + 1);
    }
  };

  // 라인 연동 완료 함수
  const handleLineConnect = () => {
    if (!lineChannelId.trim() || !lineChannelSecret.trim()) {
      alert("Channel ID와 Channel Secret을 모두 입력해주세요.");
      return;
    }

    // 라인 연결 상태 업데이트
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === "line" ? { ...channel, isConnected: true } : channel
      )
    );

    // 메인 화면으로 돌아가기
    handleGoBack();
    alert("라인 연동이 완료되었습니다!");
  };

  const filteredChannels = channels;

  const connectedCount = channels.filter(
    (channel) => channel.isConnected
  ).length;

  // 텔레그램 연동 화면 렌더링
  const renderTelegramSetup = () => (
    <div className="channel-settings">
      <div className="channel-header">
        <div className="header-content">
          <button className="back-button" onClick={handleGoBack}>
            ← 뒤로가기
          </button>
          <h2>텔레그램 봇 연동</h2>
        </div>
      </div>

      <div className="setup-content">
        <div className="setup-card">
          <div className="setup-instructions">
            <h3>텔레그램 봇 토큰 설정</h3>
            <div className="instruction-steps">
              <p>
                <strong>봇 토큰을 얻는 방법:</strong>
              </p>
              <ol>
                <li>
                  텔레그램에서 <strong>@BotFather</strong>를 검색하여 대화를
                  시작합니다.
                </li>
                <li>
                  채팅 입력창 좌측의 Open 버튼을 클릭하여 미니앱을 실행합니다.
                </li>
                <li>
                  <strong>Create a New Bot</strong> 버튼을 클릭합니다.
                </li>
                <li>생성 완료 후 봇 상세 화면에서 봇 토큰을 복사 합니다.</li>
                <li>아래 필드에 토큰을 입력하고 연동을 완료합니다.</li>
              </ol>
            </div>
          </div>

          <div className="setup-form">
            <div className="form-group">
              <label htmlFor="bot-token">봇 토큰</label>
              <input
                id="bot-token"
                type="text"
                placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={handleTelegramConnect}
              >
                연동
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 라인 연동 화면 렌더링
  const renderLineSetup = () => (
    <div className="channel-settings">
      <div className="channel-header">
        <div className="header-content">
          <button className="back-button" onClick={handleGoBack}>
            ← 뒤로가기
          </button>
          <h2>라인 공식 계정 연동</h2>
        </div>
      </div>

      <div className="setup-content">
        <div className="setup-card">
          <div className="step-indicator">
            <div className="steps">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`step ${lineStep >= step ? "active" : ""}`}
                >
                  <div className="step-number">{step}</div>
                  <div className="step-title">
                    {step === 1 && "계정 생성"}
                    {step === 2 && "웹훅 설정"}
                    {step === 3 && "인증 정보"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {lineStep === 1 && (
            <div className="step-content">
              <h3>1단계: LINE Official Account Manager 설정</h3>
              <div className="instruction-steps">
                <ol>
                  <li>
                    <strong>LINE Official Account Manager</strong> 페이지에서
                    계정을 생성합니다.
                  </li>
                  <li>
                    계정 생성 후 홈 화면에서 우측 상단의 <strong>설정</strong>{" "}
                    버튼을 클릭합니다.
                  </li>
                  <li>
                    좌측 메뉴에서 <strong>답변 설정</strong> 메뉴를 선택합니다.
                  </li>
                  <li>
                    <strong>Webhook</strong> 항목을 활성화합니다.
                  </li>
                  <li>설정이 완료되면 다음 단계로 진행합니다.</li>
                </ol>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleLineNext}>
                  다음
                </button>
              </div>
            </div>
          )}

          {lineStep === 2 && (
            <div className="step-content">
              <h3>2단계: 웹훅 URL 등록</h3>
              <div className="instruction-steps">
                <p>
                  아래 웹훅 URL을 LINE Official Account Manager의 Webhook URL에
                  등록해주세요:
                </p>
                <div className="webhook-url">
                  <code>
                    https://talkgate.im/v1/line/webhook/receive/1fdx73
                  </code>
                  <button
                    className="copy-btn"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        "https://talkgate.im/v1/line/webhook/receive/1fdx73"
                      )
                    }
                  >
                    복사
                  </button>
                </div>
                <p>
                  <strong>등록 방법:</strong>
                </p>
                <ol>
                  <li>
                    LINE Official Account Manager에서{" "}
                    <strong>설정 → Messaging API</strong>메뉴로 이동
                  </li>
                  <li>
                    <strong>Webhook URL</strong> 필드에 위 URL을 입력하고 저장
                    버튼을 클릭합니다.
                  </li>
                  <li>등록이 완료되면 다음 단계로 진행합니다.</li>
                </ol>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleLineNext}>
                  다음
                </button>
              </div>
            </div>
          )}

          {lineStep === 3 && (
            <div className="step-content">
              <h3>3단계: 인증 정보 입력</h3>
              <div className="instruction-steps">
                <p>
                  설정 - Messaging API 메뉴에서 Channel ID와 Channel Secret을
                  확인하여 입력해주세요.
                </p>
              </div>
              <div className="setup-form">
                <div className="form-group">
                  <label htmlFor="channel-id">Channel ID</label>
                  <input
                    id="channel-id"
                    type="text"
                    placeholder="1234567890"
                    value={lineChannelId}
                    onChange={(e) => setLineChannelId(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="channel-secret">Channel Secret</label>
                  <input
                    id="channel-secret"
                    type="text"
                    placeholder="abcdefghijklmnopqrstuvwxyz1234567890"
                    value={lineChannelSecret}
                    onChange={(e) => setLineChannelSecret(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="btn btn-primary btn-large"
                    onClick={handleLineConnect}
                  >
                    연동
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 메인 화면 렌더링
  const renderMainView = () => (
    <div className="channel-settings">
      <div className="channel-header">
        <div className="header-content">
          <h2>상담 채널 연동</h2>
        </div>
        <div className="header-stats">
          <span className="connected-count">
            연결된 채널: {connectedCount}개
          </span>
        </div>
      </div>

      <div className="channels-section">
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

  // 현재 뷰에 따라 렌더링
  if (currentView === "telegram") {
    return renderTelegramSetup();
  } else if (currentView === "line") {
    return renderLineSetup();
  } else {
    return renderMainView();
  }
};

export default ChannelSettingsPage;
