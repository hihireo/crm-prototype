import React, { useState, useEffect } from "react";
import "./StatisticsPage.css";

const StatisticsPage = ({ user, service }) => {
  const [activeTab, setActiveTab] = useState("applications");

  // URL 파라미터에서 탭 정보 읽기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (
      tabParam &&
      [
        "applications",
        "assignments",
        "status",
        "payments",
        "rankings",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, []);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [assignmentViewType, setAssignmentViewType] = useState("team");
  const [paymentViewType, setPaymentViewType] = useState("team");
  const [rankingViewType, setRankingViewType] = useState("team");

  // 샘플 데이터
  const applicationStats = {
    week: [
      { date: "2024-01-01", count: 12 },
      { date: "2024-01-02", count: 8 },
      { date: "2024-01-03", count: 15 },
      { date: "2024-01-04", count: 22 },
      { date: "2024-01-05", count: 18 },
      { date: "2024-01-06", count: 25 },
      { date: "2024-01-07", count: 20 },
    ],
    month: [
      { date: "2024-01", count: 180 },
      { date: "2024-02", count: 165 },
      { date: "2024-03", count: 195 },
      { date: "2024-04", count: 220 },
      { date: "2024-05", count: 205 },
      { date: "2024-06", count: 240 },
    ],
  };

  const assignmentStats = {
    byTeam: [
      { team: "A팀", assigned: 45 },
      { team: "B팀", assigned: 38 },
      { team: "C팀", assigned: 42 },
    ],
    byMember: [
      { name: "김영업", team: "A팀", assigned: 25 },
      { name: "이마케팅", team: "A팀", assigned: 20 },
      { name: "박세일즈", team: "B팀", assigned: 22 },
      { name: "최고객", team: "B팀", assigned: 16 },
      { name: "정상담", team: "C팀", assigned: 42 },
    ],
  };

  const statusStats = [
    { status: "부재", count: 25, color: "#ff6b6b" },
    { status: "재상담", count: 18, color: "#ffd93d" },
    { status: "관리중", count: 32, color: "#6bcf7f" },
    { status: "AS요청", count: 8, color: "#4d96ff" },
    { status: "AS확정", count: 5, color: "#9c88ff" },
    { status: "실패", count: 12, color: "#ff8787" },
    { status: "결제완료", count: 45, color: "#51cf66" },
    { status: "무료방안내", count: 15, color: "#74c0fc" },
    { status: "무료방입장", count: 22, color: "#91a7ff" },
    { status: "결제유력", count: 28, color: "#69db7c" },
  ];

  const paymentStats = {
    byTeam: [
      { team: "A팀", amount: 15600000, count: 18 },
      { team: "B팀", amount: 14300000, count: 16 },
      { team: "C팀", amount: 12800000, count: 14 },
    ],
    byMember: [
      { name: "김영업", team: "A팀", amount: 8200000, count: 10 },
      { name: "이마케팅", team: "A팀", amount: 7400000, count: 8 },
      { name: "박세일즈", team: "B팀", amount: 7800000, count: 9 },
      { name: "최고객", team: "B팀", amount: 6500000, count: 7 },
      { name: "정상담", team: "C팀", amount: 12800000, count: 14 },
    ],
  };

  const rankings = {
    byTeam: [
      { rank: 1, team: "A팀", sales: 15600000, growth: "+1,200,000" },
      { rank: 2, team: "B팀", sales: 14300000, growth: "+800,000" },
      { rank: 3, team: "C팀", sales: 12800000, growth: "+1,500,000" },
    ],
    byMember: [
      {
        rank: 1,
        name: "김영업",
        team: "A팀",
        sales: 8200000,
        growth: "+18.5%",
      },
      {
        rank: 2,
        name: "이마케팅",
        team: "A팀",
        sales: 7400000,
        growth: "+12.8%",
      },
      {
        rank: 3,
        name: "박세일즈",
        team: "B팀",
        sales: 7800000,
        growth: "+9.7%",
      },
      {
        rank: 4,
        name: "최고객",
        team: "B팀",
        sales: 6500000,
        growth: "+22.1%",
      },
      {
        rank: 5,
        name: "정상담",
        team: "C팀",
        sales: 12800000,
        growth: "+15.2%",
      },
    ],
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  const getMaxValue = (data, key) => {
    return Math.max(...data.map((item) => item[key]));
  };

  const tabs = [
    { id: "applications", name: "신청통계", icon: "📈" },
    { id: "assignments", name: "배정통계", icon: "👥" },
    { id: "status", name: "처리상태", icon: "📋" },
    { id: "payments", name: "결제통계", icon: "💰" },
    { id: "rankings", name: "전체랭킹", icon: "🏆" },
  ];

  return (
    <div className="stats-page">
      <div className="container">
        {/* 페이지 헤더 */}
        <div className="stats-header">
          <h1>📊 통계</h1>
          <p>고객 신청, 배정, 처리상태, 결제, 랭킹 통계를 한눈에 확인하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="stats-tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`stats-tab-btn ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="stats-tab-icon">{tab.icon}</span>
              <span className="stats-tab-name">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="stats-tab-content">
          {/* 1. 신청통계 탭 */}
          {activeTab === "applications" && (
            <div className="stats-section">
              <div className="stats-section-header">
                <h2>📈 신청통계</h2>
                <div className="stats-period-selector">
                  <button
                    className={`stats-period-btn ${
                      selectedPeriod === "week" ? "active" : ""
                    }`}
                    onClick={() => setSelectedPeriod("week")}
                  >
                    주간
                  </button>
                  <button
                    className={`stats-period-btn ${
                      selectedPeriod === "month" ? "active" : ""
                    }`}
                    onClick={() => setSelectedPeriod("month")}
                  >
                    월간
                  </button>
                </div>
              </div>

              {/* 라인 차트 영역 */}
              <div className="stats-chart-container stats-full-width">
                <h3>기간별 신청 현황</h3>
                <div className="stats-line-chart">
                  <svg viewBox="0 0 1000 300" className="stats-line-svg">
                    {/* 그리드 라인 */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <line
                        key={i}
                        x1="50"
                        y1={50 + i * 40}
                        x2="950"
                        y2={50 + i * 40}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                    ))}

                    {/* 데이터 라인 */}
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      points={applicationStats[selectedPeriod]
                        .map((item, index) => {
                          const maxCount = getMaxValue(
                            applicationStats[selectedPeriod],
                            "count"
                          );
                          const x =
                            80 +
                            (index * 840) /
                              (applicationStats[selectedPeriod].length - 1);
                          const y = 250 - (item.count / maxCount) * 180;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />

                    {/* 데이터 포인트 */}
                    {applicationStats[selectedPeriod].map((item, index) => {
                      const maxCount = getMaxValue(
                        applicationStats[selectedPeriod],
                        "count"
                      );
                      const x =
                        80 +
                        (index * 840) /
                          (applicationStats[selectedPeriod].length - 1);
                      const y = 250 - (item.count / maxCount) * 180;
                      return (
                        <g key={index}>
                          <circle
                            cx={x}
                            cy={y}
                            r="6"
                            fill="#3b82f6"
                            stroke="#ffffff"
                            strokeWidth="3"
                          />
                          <text
                            x={x}
                            y={y - 15}
                            textAnchor="middle"
                            className="stats-line-value"
                            fill="#374151"
                            fontSize="14"
                            fontWeight="700"
                          >
                            {item.count}
                          </text>
                        </g>
                      );
                    })}

                    {/* X축 라벨 */}
                    {applicationStats[selectedPeriod].map((item, index) => {
                      const x =
                        80 +
                        (index * 840) /
                          (applicationStats[selectedPeriod].length - 1);
                      return (
                        <text
                          key={index}
                          x={x}
                          y="280"
                          textAnchor="middle"
                          className="stats-line-label"
                          fill="#64748b"
                          fontSize="13"
                        >
                          {selectedPeriod === "week"
                            ? formatDate(item.date)
                            : item.date}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* 표 영역 */}
              <div className="stats-table-container">
                <h3>상세 데이터</h3>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>{selectedPeriod === "week" ? "날짜" : "월"}</th>
                      <th>신청 건수</th>
                      <th>전일 대비</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationStats[selectedPeriod].map((item, index) => {
                      const prevCount =
                        index > 0
                          ? applicationStats[selectedPeriod][index - 1].count
                          : item.count;
                      const change = item.count - prevCount;
                      const changePercent =
                        prevCount > 0
                          ? ((change / prevCount) * 100).toFixed(1)
                          : 0;

                      return (
                        <tr key={index}>
                          <td>
                            {selectedPeriod === "week"
                              ? formatDate(item.date)
                              : item.date}
                          </td>
                          <td className="stats-count">{item.count}건</td>
                          <td
                            className={`stats-change ${
                              change >= 0 ? "positive" : "negative"
                            }`}
                          >
                            {change >= 0 ? "+" : ""}
                            {change}건 ({changePercent}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. 배정통계 탭 */}
          {activeTab === "assignments" && (
            <div className="stats-section">
              <div className="stats-section-header">
                <h2>👥 배정통계</h2>
                <div className="stats-radio-group">
                  <label className="stats-radio-label">
                    <input
                      type="radio"
                      name="assignmentView"
                      value="team"
                      checked={assignmentViewType === "team"}
                      onChange={(e) => setAssignmentViewType(e.target.value)}
                      className="stats-radio-input"
                    />
                    <span className="stats-radio-text">팀별</span>
                  </label>
                  <label className="stats-radio-label">
                    <input
                      type="radio"
                      name="assignmentView"
                      value="member"
                      checked={assignmentViewType === "member"}
                      onChange={(e) => setAssignmentViewType(e.target.value)}
                      className="stats-radio-input"
                    />
                    <span className="stats-radio-text">팀원별</span>
                  </label>
                </div>
              </div>

              <div className="stats-content-single">
                {assignmentViewType === "team" ? (
                  <div className="stats-chart-container stats-full-width">
                    <h3>팀별 배정 현황</h3>
                    <div className="stats-assignment-chart">
                      {assignmentStats.byTeam.map((team, index) => {
                        const maxAssigned = getMaxValue(
                          assignmentStats.byTeam,
                          "assigned"
                        );
                        const barWidth = (team.assigned / maxAssigned) * 100;
                        return (
                          <div key={index} className="stats-assignment-item">
                            <div className="stats-assignment-header">
                              <span className="stats-team-name">
                                {team.team}
                              </span>
                              <span className="stats-assignment-count">
                                {team.assigned}건
                              </span>
                            </div>
                            <div className="stats-assignment-bars">
                              <div className="stats-assignment-bar-wrapper">
                                <div className="stats-assignment-bar">
                                  <div
                                    className="stats-assignment-bar-fill assigned"
                                    style={{ width: `${barWidth}%` }}
                                  ></div>
                                </div>
                                <span className="stats-assignment-label">
                                  배정 {team.assigned}건
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="stats-table-container stats-full-width">
                    <h3>팀원별 배정 현황</h3>
                    <table className="stats-table">
                      <thead>
                        <tr>
                          <th>이름</th>
                          <th>팀</th>
                          <th>배정 건수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignmentStats.byMember.map((member, index) => (
                          <tr key={index}>
                            <td className="stats-member-name">{member.name}</td>
                            <td className="stats-team-badge">{member.team}</td>
                            <td className="stats-count">{member.assigned}건</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. 처리상태 통계 탭 */}
          {activeTab === "status" && (
            <div className="stats-section">
              <div className="stats-section-header">
                <h2>📋 처리상태 통계</h2>
                <p>고객들의 현재 처리상태를 한눈에 확인하세요</p>
              </div>

              <div className="stats-content-single">
                <div className="stats-chart-container stats-full-width">
                  <h3>상태별 분포</h3>
                  <div className="stats-status-bar-chart">
                    {statusStats.map((status, index) => {
                      const maxCount = getMaxValue(statusStats, "count");
                      const width = (status.count / maxCount) * 100;
                      const total = statusStats.reduce(
                        (sum, s) => sum + s.count,
                        0
                      );
                      const percentage = ((status.count / total) * 100).toFixed(
                        1
                      );

                      return (
                        <div key={index} className="stats-status-bar-item">
                          <div className="stats-status-bar-header">
                            <span className="stats-status-name">
                              {status.status}
                            </span>
                            <div className="stats-status-values">
                              <span className="stats-status-count">
                                {status.count}건
                              </span>
                              <span className="stats-status-percent">
                                ({percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="stats-status-bar-wrapper">
                            <div className="stats-status-bar">
                              <div
                                className="stats-status-bar-fill"
                                style={{
                                  width: `${width}%`,
                                  backgroundColor: status.color,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. 결제 통계 탭 */}
          {activeTab === "payments" && (
            <div className="stats-section">
              <div className="stats-section-header">
                <h2>💰 결제 통계</h2>
                <div className="stats-radio-group">
                  <label className="stats-radio-label">
                    <input
                      type="radio"
                      name="paymentView"
                      value="team"
                      checked={paymentViewType === "team"}
                      onChange={(e) => setPaymentViewType(e.target.value)}
                      className="stats-radio-input"
                    />
                    <span className="stats-radio-text">팀별</span>
                  </label>
                  <label className="stats-radio-label">
                    <input
                      type="radio"
                      name="paymentView"
                      value="member"
                      checked={paymentViewType === "member"}
                      onChange={(e) => setPaymentViewType(e.target.value)}
                      className="stats-radio-input"
                    />
                    <span className="stats-radio-text">팀원별</span>
                  </label>
                </div>
              </div>

              <div className="stats-content-single">
                {paymentViewType === "team" ? (
                  <div className="stats-chart-container stats-full-width">
                    <h3>팀별 결제 현황</h3>
                    <div className="stats-payment-chart">
                      {paymentStats.byTeam.map((team, index) => {
                        const maxAmount = getMaxValue(
                          paymentStats.byTeam,
                          "amount"
                        );
                        const height = (team.amount / maxAmount) * 100;
                        return (
                          <div
                            key={index}
                            className="stats-payment-bar-wrapper"
                          >
                            <div
                              className="stats-payment-bar"
                              style={{ height: `${height}%` }}
                              title={`${team.team}: ${formatCurrency(
                                team.amount
                              )}원`}
                            >
                              <span className="stats-payment-bar-value">
                                {formatCurrency(team.amount / 10000)}만원
                              </span>
                            </div>
                            <span className="stats-payment-bar-label">
                              {team.team}
                            </span>
                            <span className="stats-payment-bar-count">
                              {team.count}건
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="stats-table-container stats-full-width">
                    <h3>팀원별 결제 현황</h3>
                    <table className="stats-table">
                      <thead>
                        <tr>
                          <th>이름</th>
                          <th>팀</th>
                          <th>결제금액</th>
                          <th>건수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentStats.byMember.map((member, index) => (
                          <tr key={index}>
                            <td className="stats-member-name">{member.name}</td>
                            <td className="stats-team-badge">{member.team}</td>
                            <td className="stats-amount">
                              {formatCurrency(member.amount)}원
                            </td>
                            <td className="stats-count">{member.count}건</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. 전체 랭킹 탭 */}
          {activeTab === "rankings" && (
            <div className="stats-section">
              <div className="stats-section-header">
                <h2>🏆 전체 랭킹</h2>
                <div className="stats-radio-group">
                  <label className="stats-radio-label">
                    <input
                      type="radio"
                      name="rankingView"
                      value="team"
                      checked={rankingViewType === "team"}
                      onChange={(e) => setRankingViewType(e.target.value)}
                      className="stats-radio-input"
                    />
                    <span className="stats-radio-text">팀별</span>
                  </label>
                  <label className="stats-radio-label">
                    <input
                      type="radio"
                      name="rankingView"
                      value="member"
                      checked={rankingViewType === "member"}
                      onChange={(e) => setRankingViewType(e.target.value)}
                      className="stats-radio-input"
                    />
                    <span className="stats-radio-text">팀원별</span>
                  </label>
                </div>
              </div>

              <div className="stats-content-single">
                <div className="stats-ranking-container stats-full-width">
                  <h3>
                    {rankingViewType === "team" ? "팀별 랭킹" : "팀원별 랭킹"}
                  </h3>
                  <div className="stats-ranking-list">
                    {(rankingViewType === "team"
                      ? rankings.byTeam
                      : rankings.byMember
                    ).map((item, index) => (
                      <div key={index} className="stats-ranking-item">
                        <div className="stats-ranking-rank">
                          <span className="stats-rank-number">
                            #{item.rank}
                          </span>
                          {item.rank <= 3 && (
                            <span className="stats-medal">
                              {item.rank === 1
                                ? "🥇"
                                : item.rank === 2
                                ? "🥈"
                                : "🥉"}
                            </span>
                          )}
                        </div>
                        <div className="stats-ranking-info">
                          <div className="stats-ranking-name">
                            {rankingViewType === "team" ? item.team : item.name}
                          </div>
                          {rankingViewType === "member" && (
                            <div className="stats-ranking-team">
                              {item.team}
                            </div>
                          )}
                          <div className="stats-ranking-sales">
                            ₩{formatCurrency(item.sales)}
                          </div>
                        </div>
                        <span className="stats-ranking-growth positive">
                          {item.growth}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
