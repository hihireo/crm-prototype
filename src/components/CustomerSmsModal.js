import React, { useEffect, useMemo, useState } from "react";
import "./CustomerSmsModal.css";

const MAX_SMS_BYTES = 90;

const CustomerSmsModal = ({
  isOpen,
  onClose,
  selectedCustomers = [],
  senderNumbers = [],
}) => {
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messagePurpose, setMessagePurpose] = useState("info");
  const [sendMode, setSendMode] = useState("immediate");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedSender, setSelectedSender] = useState(senderNumbers[0] || "");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMessageTitle("");
      setMessageBody("");
      setMessagePurpose("info");
      setSendMode("immediate");
      setScheduleDate("");
      setScheduleTime("");
      setSelectedSender(senderNumbers[0] || "");
      setAttachmentFile(null);
      setAttachmentPreview(null);
      setErrorMessage("");
    }
  }, [isOpen, senderNumbers]);

  const messageBytes = useMemo(() => {
    const encoder = new TextEncoder();
    return encoder.encode(messageBody || "").length;
  }, [messageBody]);

  const messageType = useMemo(() => {
    if (attachmentFile) return "MMS";
    return messageBytes > MAX_SMS_BYTES ? "LMS" : "SMS";
  }, [attachmentFile, messageBytes]);

  const canSend =
    selectedCustomers.length > 0 &&
    selectedSender &&
    messageBody.trim().length > 0 &&
    (sendMode === "immediate" || (scheduleDate && scheduleTime));

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachmentFile(null);
      setAttachmentPreview(null);
      return;
    }

    setAttachmentFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
  };

  const handleSend = () => {
    if (!canSend) {
      setErrorMessage("필수 입력 값을 모두 채워주세요.");
      return;
    }

    setErrorMessage("");

    const payload = {
      senderNumber: selectedSender,
      recipients: selectedCustomers,
      purpose: messagePurpose,
      messageType,
      messageTitle: messageTitle.trim(),
      messageBody: messageBody.trim(),
      attachmentIncluded: Boolean(attachmentFile),
      sendMode,
      scheduledAt:
        sendMode === "scheduled"
          ? `${scheduleDate} ${scheduleTime}`
          : "immediate",
    };

    console.log("문자 전송 요청:", payload);
    alert("문자 전송 요청이 준비되었습니다. (콘솔 확인)");
    onClose();
  };

  if (!isOpen) return null;

  const previewRecipients = selectedCustomers.slice(0, 3);
  const hasMoreRecipients = selectedCustomers.length > previewRecipients.length;

  return (
    <div className="csms-overlay">
      <div className="csms-modal">
        <div className="csms-header">
          <div>
            <h2>문자 전송</h2>
            <p>선택한 고객에게 SMS/LMS/MMS를 발송합니다.</p>
          </div>
          <button className="csms-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="csms-body">
          <div className="csms-form-column">
            <div className="csms-field">
              <label>발신번호</label>
              <select
                value={selectedSender}
                onChange={(e) => setSelectedSender(e.target.value)}
              >
                {senderNumbers.length === 0 ? (
                  <option value="">등록된 번호가 없습니다</option>
                ) : (
                  senderNumbers.map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="csms-field">
              <label>수신자 ({selectedCustomers.length}명)</label>
              <div className="csms-recipient-badges">
                {previewRecipients.map((customer) => (
                  <span key={customer.id} className="csms-recipient-chip">
                    {customer.name} ({customer.phone})
                  </span>
                ))}
                {hasMoreRecipients && (
                  <span className="csms-recipient-chip csms-recipient-chip-muted">
                    +{selectedCustomers.length - previewRecipients.length}명
                  </span>
                )}
              </div>
            </div>

            <div className="csms-field">
              <label>메시지 유형</label>
              <div className="csms-type-pill">{messageType}</div>
              <span className="csms-byte-info">
                본문 {messageBytes} byte (90byte 초과 시 LMS)
              </span>
            </div>

            <div className="csms-field">
              <label>광고/정보 유형</label>
              <div className="csms-radio-group">
                <label>
                  <input
                    type="radio"
                    value="ad"
                    checked={messagePurpose === "ad"}
                    onChange={(e) => setMessagePurpose(e.target.value)}
                  />
                  광고성
                </label>
                <label>
                  <input
                    type="radio"
                    value="info"
                    checked={messagePurpose === "info"}
                    onChange={(e) => setMessagePurpose(e.target.value)}
                  />
                  정보성
                </label>
              </div>
            </div>

            <div className="csms-field">
              <label>제목 (LMS/MMS)</label>
              <input
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="csms-field">
              <label>본문</label>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="발송할 메시지를 입력하세요"
                rows={6}
              />
            </div>

            <div className="csms-field">
              <label>이미지 첨부 (선택)</label>
              <div className="csms-attachment-row">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAttachmentChange}
                />
                {attachmentFile && (
                  <button
                    type="button"
                    className="csms-link-btn"
                    onClick={handleRemoveAttachment}
                  >
                    첨부 제거
                  </button>
                )}
              </div>
              {attachmentPreview && (
                <div className="csms-attachment-preview">
                  <img src={attachmentPreview} alt="첨부 이미지 미리보기" />
                </div>
              )}
            </div>

            <div className="csms-field">
              <label>발송 방식</label>
              <div className="csms-radio-group">
                <label>
                  <input
                    type="radio"
                    value="immediate"
                    checked={sendMode === "immediate"}
                    onChange={(e) => setSendMode(e.target.value)}
                  />
                  즉시 발송
                </label>
                <label>
                  <input
                    type="radio"
                    value="scheduled"
                    checked={sendMode === "scheduled"}
                    onChange={(e) => setSendMode(e.target.value)}
                  />
                  예약 발송
                </label>
              </div>

              {sendMode === "scheduled" && (
                <div className="csms-schedule-row">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="csms-preview-column">
            <div className="csms-preview-card">
              <div className="csms-preview-header">
                <span>미리보기</span>
                <div
                  className={`csms-status-tag csms-status-${messageType.toLowerCase()}`}
                >
                  {messageType}
                </div>
              </div>
              <div className="csms-preview-device">
                <div className="csms-preview-bubble">
                  <span className="csms-preview-title">
                    {messageTitle || "제목 없음"}
                  </span>
                  <p className="csms-preview-text">
                    {messageBody || "작성된 본문이 여기에 표시됩니다."}
                  </p>
                  {attachmentPreview && (
                    <div className="csms-preview-image">
                      <img src={attachmentPreview} alt="미리보기" />
                    </div>
                  )}
                </div>
              </div>
              <div className="csms-preview-meta">
                <div>
                  <span className="csms-meta-label">발신번호</span>
                  <strong>{selectedSender || "-"}</strong>
                </div>
                <div>
                  <span className="csms-meta-label">광고 표시</span>
                  <strong>
                    {messagePurpose === "ad" ? "광고성" : "정보성"}
                  </strong>
                </div>
                <div>
                  <span className="csms-meta-label">발송 방식</span>
                  <strong>
                    {sendMode === "immediate"
                      ? "즉시 발송"
                      : `${scheduleDate || "날짜 선택"} ${
                          scheduleTime || "시간 선택"
                        }`}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {errorMessage && <p className="csms-error-text">{errorMessage}</p>}

        <div className="csms-footer">
          <button className="csms-secondary-btn" onClick={onClose}>
            취소
          </button>
          <button
            className="csms-primary-btn"
            onClick={handleSend}
            disabled={!canSend}
          >
            발송 요청
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSmsModal;
