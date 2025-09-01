import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = (e) => {
    e.preventDefault();
    // 간단한 데모용 로그인
    if (email && password) {
      onLogin({
        name: "김직원",
        email: email,
        role: "staff",
      });
    }
  };

  const handleSocialLogin = (provider) => {
    // 소셜 로그인 데모
    onLogin({
      name: `${provider} 사용자`,
      email: `user@${provider.toLowerCase()}.com`,
      role: "staff",
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>TalkGate</h1>
          </div>

          <form className="login-form" onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label className="label">이메일</label>
              <input
                type="email"
                className="input"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">비밀번호</label>
              <input
                type="password"
                className="input"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary login-btn">
              로그인
            </button>
          </form>

          <div className="divider">
            <span>또는</span>
          </div>

          <div className="social-login">
            <button
              className="btn social-btn google-btn"
              onClick={() => handleSocialLogin("Google")}
            >
              Google로 로그인
            </button>
            <button
              className="btn social-btn kakao-btn"
              onClick={() => handleSocialLogin("Kakao")}
            >
              카카오로 로그인
            </button>
            <button
              className="btn social-btn naver-btn"
              onClick={() => handleSocialLogin("Naver")}
            >
              네이버로 로그인
            </button>
          </div>

          <div className="login-footer">
            <p>
              계정이 없으신가요? <a href="#signup">회원가입</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
