import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const InstagramCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Instagram 연결을 처리 중입니다...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      setStatus("error");
      setMessage(`연결 실패: ${errorDescription || error}`);
      return;
    }

    if (code) {
      // Instagram OAuth 인증 코드 처리
      handleInstagramAuth(code);
    } else {
      setStatus("error");
      setMessage("인증 코드를 받지 못했습니다.");
    }
  }, [searchParams]);

  const handleInstagramAuth = async (code) => {
    try {
      // 실제 구현에서는 백엔드 API를 호출하여 access token을 교환합니다
      console.log("Instagram 인증 코드:", code);
      
      // 시뮬레이션: 백엔드 API 호출
      // const response = await fetch('/api/instagram/oauth/callback', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ code }),
      // });
      // const data = await response.json();

      // 임시로 성공 상태 설정
      setTimeout(() => {
        // Instagram 연결 상태를 로컬 스토리지에 저장
        const instagramConnection = {
          isConnected: true,
          connectedAt: new Date().toISOString(),
          code: code,
        };
        localStorage.setItem("instagram_connection", JSON.stringify(instagramConnection));
        
        setStatus("success");
        setMessage("Instagram 연결이 성공적으로 완료되었습니다!");
        
        // 3초 후 설정 페이지로 리다이렉트
        setTimeout(() => {
          navigate("/settings/channels");
        }, 3000);
      }, 2000);

    } catch (error) {
      console.error("Instagram 인증 오류:", error);
      setStatus("error");
      setMessage("Instagram 연결 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh",
      padding: "20px",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "400px",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        backgroundColor: "#fff"
      }}>
        {status === "processing" && (
          <>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}></div>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </>
        )}
        
        {status === "success" && (
          <div style={{ color: "#27ae60", fontSize: "24px", marginBottom: "20px" }}>
            ✅
          </div>
        )}
        
        {status === "error" && (
          <div style={{ color: "#e74c3c", fontSize: "24px", marginBottom: "20px" }}>
            ❌
          </div>
        )}
        
        <h2 style={{ marginBottom: "16px", color: "#333" }}>
          Instagram 연결
        </h2>
        
        <p style={{ color: "#666", lineHeight: "1.5" }}>
          {message}
        </p>
        
        {status === "success" && (
          <p style={{ color: "#666", fontSize: "14px", marginTop: "16px" }}>
            잠시 후 설정 페이지로 이동합니다...
          </p>
        )}
        
        {status === "error" && (
          <button
            onClick={() => navigate("/settings/channels")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            설정 페이지로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
};

export default InstagramCallbackPage;

