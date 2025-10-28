import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ServiceSelectPage.css";

const ServiceSelectPage = ({ onServiceSelect, onServiceCreate }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState([
    {
      id: 1,
      name: "거래소 텔레마케팅 관리",
      members: 12,
      assignedCustomers: 23,
      todaySchedules: 5,
    },
    {
      id: 2,
      name: "대출 컨설팅 영업 관리",
      members: 8,
      assignedCustomers: 15,
      todaySchedules: 3,
    },
  ]);

  // 프로젝트 생성 페이지로 이동
  const handleCreateServicePage = () => {
    navigate("/create-service");
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      setServices(services.filter((service) => service.id !== serviceId));
    }
  };

  return (
    <div className="service-select-page">
      <div className="container">
        <div className="page-header">
          <h1>프로젝트 선택</h1>
          <p>관리할 프로젝트를 선택하거나 새로운 프로젝트를 생성하세요</p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div
              key={service.id}
              className="service-card clickable"
              onClick={() => onServiceSelect(service.name)}
            >
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteService(service.id);
                }}
                title="프로젝트 삭제"
              >
                🗑️
              </button>
              <div className="service-info">
                <div className="service-header">
                  <h3>{service.name}</h3>
                  <span className="team-info">멤버 {service.members}명</span>
                </div>

                <div className="personal-stats">
                  <div className="personal-stat-item">
                    <span className="personal-stat-label">
                      나에게 할당된 고객
                    </span>
                    <span className="personal-stat-value">
                      {service.assignedCustomers}건
                    </span>
                  </div>
                  <div className="personal-stat-item">
                    <span className="personal-stat-label">오늘 예약 일정</span>
                    <span className="personal-stat-value">
                      {service.todaySchedules}건
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="service-card create-card">
            <button
              className="create-service-btn"
              onClick={handleCreateServicePage}
            >
              <div className="create-icon">+</div>
              <h3>새 프로젝트 생성</h3>
              <p>새로운 고객관리 프로젝트를 만들어보세요</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectPage;
