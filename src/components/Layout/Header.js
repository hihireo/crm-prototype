import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = ({ user, currentService }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <Link to="/dashboard" className="logo">
              CRM 시스템
            </Link>
            {currentService && (
              <div className="service-info">
                <span className="service-name">{currentService}</span>
              </div>
            )}
          </div>

          <nav className="nav">
            <Link to="/dashboard" className="nav-link">
              대시보드
            </Link>
            <Link to="/notice" className="nav-link">
              공지사항
            </Link>
            <Link to="/applications" className="nav-link">
              신청현황
            </Link>
            <Link to="/settings" className="nav-link">
              설정
            </Link>
          </nav>

          <div className="header-right">
            {user && (
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <button className="btn btn-secondary">로그아웃</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
