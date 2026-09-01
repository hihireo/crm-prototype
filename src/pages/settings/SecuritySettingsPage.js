import React, { useEffect, useRef, useState } from "react";
import "./SecuritySettingsPage.css";

const MAX_ALLOW_IPS = 20;
const PAGE_SIZE = 5;
const EMPTY_OCTETS = ["", "", "", ""];
const IPV4_OCTET = /^(?:0|[1-9]\d{0,2})$/;

const parseIpv4 = (raw) => {
  const parts = String(raw || "")
    .trim()
    .split(".");
  if (parts.length !== 4 || !parts.every((part) => IPV4_OCTET.test(part))) {
    return null;
  }
  const nums = parts.map(Number);
  if (nums.some((n) => n > 255)) return null;
  return nums.map(String);
};

const MODE_OPTIONS = [
  { id: "myip", label: "내 IP" },
  { id: "ip", label: "특정 IP" },
  { id: "cidr", label: "CIDR 대역" },
  { id: "range", label: "시작~끝 범위" },
];

const ipToInt = (ip) =>
  ip.split(".").reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;

const octetsToIp = (octets) => {
  if (octets.some((part) => part === "")) {
    return { error: "IP 네 자리를 모두 입력하세요." };
  }
  const nums = octets.map(Number);
  if (nums.some((n) => Number.isNaN(n) || n > 255)) {
    return { error: "각 자리는 0–255여야 합니다." };
  }
  return { ip: nums.join(".") };
};

const IpOctetInput = ({ value, onChange, disabled, onEnter }) => {
  const refs = useRef([]);

  const setOctet = (index, raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    if (digits !== "" && Number(digits) > 255) return;
    const next = [...value];
    next[index] = digits;
    onChange(next);
    if (digits.length === 3 && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, event) => {
    const text = event.clipboardData.getData("text").trim().replace(/\s/g, "");
    const parts = text.split(".");
    if (parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part))) {
      event.preventDefault();
      const next = parts.map((part) => String(Number(part)));
      if (next.some((part) => Number(part) > 255)) return;
      onChange(next);
      refs.current[3]?.focus();
      return;
    }
    if (/^\d{1,3}$/.test(text)) {
      event.preventDefault();
      setOctet(index, text);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onEnter?.();
      return;
    }
    if ((event.key === "." || event.key === " ") && index < 3) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
    if (event.key === "Backspace" && value[index] === "" && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={`sip-octets ${disabled ? "is-disabled" : ""}`}>
      {value.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="sip-dot">.</span>}
          <input
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            maxLength={3}
            value={part}
            disabled={disabled}
            aria-label={`IP ${index + 1}번째 자리`}
            onChange={(e) => setOctet(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

const TypeMenu = ({ mode, options, myIp, myIpStatus, disabled, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const current = options.find((option) => option.id === mode) || options[1];

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hintFor = (id) => {
    if (id !== "myip") return "";
    if (myIpStatus === "loading") return "확인 중";
    if (myIpStatus === "error") return "확인 실패";
    return myIp;
  };

  return (
    <div className={`sip-type ${open ? "is-open" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className="sip-type-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="IP 입력 형식"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{current.label}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul className="sip-type-menu" role="listbox" aria-label="IP 입력 형식">
          {options.map((option) => {
            const hint = hintFor(option.id);
            return (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={mode === option.id}
                  className={`sip-type-option ${
                    mode === option.id ? "is-active" : ""
                  }`}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {hint && <code>{hint}</code>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const SipSwitch = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    className={`sip-switch ${checked ? "is-on" : ""}`}
    onClick={() => onChange(!checked)}
  >
    <span className="sip-switch-thumb" />
  </button>
);

const SecuritySettingsPage = () => {
  const [entries, setEntries] = useState([
    {
      id: 1,
      value: "203.0.113.10",
      type: "ip",
      memo: "본사 고정 IP",
    },
    {
      id: 2,
      value: "203.0.113.0/24",
      type: "cidr",
      memo: "본사 사무실 대역",
    },
    {
      id: 3,
      value: "203.0.113.1-203.0.113.50",
      type: "range",
      memo: "VPN 할당 구간",
    },
    {
      id: 4,
      value: "198.51.100.8",
      type: "ip",
      memo: "지사 고정 IP",
    },
    {
      id: 5,
      value: "198.51.100.0/24",
      type: "cidr",
      memo: "지사 사무실 대역",
    },
    {
      id: 6,
      value: "192.0.2.10",
      type: "ip",
      memo: "개발 서버",
    },
    {
      id: 7,
      value: "192.0.2.1-192.0.2.20",
      type: "range",
      memo: "테스트 구간",
    },
    {
      id: 8,
      value: "203.0.113.80",
      type: "ip",
      memo: "콜센터",
    },
  ]);
  const [restrictionOn, setRestrictionOn] = useState(true);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState("ip");
  const [ipOctets, setIpOctets] = useState([...EMPTY_OCTETS]);
  const [endOctets, setEndOctets] = useState([...EMPTY_OCTETS]);
  const [prefix, setPrefix] = useState("24");
  const [memoInput, setMemoInput] = useState("");
  const [error, setError] = useState("");
  const [myIp, setMyIp] = useState("");
  const [myIpStatus, setMyIpStatus] = useState("loading");

  const isFull = entries.length >= MAX_ALLOW_IPS;
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageEntries = entries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const myIpRegistered = Boolean(
    myIp && entries.some((entry) => entry.value === myIp),
  );
  const fieldsLocked = isFull || mode === "myip";

  const fillDetectedIp = () => {
    const octets = parseIpv4(myIp);
    if (octets) {
      setIpOctets(octets);
      setError("");
      return;
    }
    setIpOctets([...EMPTY_OCTETS]);
    if (myIpStatus === "error") {
      setError("현재 IP를 가져오지 못했습니다.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch("https://api.ipify.org?format=json")
      .then((res) => {
        if (!res.ok) throw new Error("ip lookup failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const octets = parseIpv4(data.ip);
        if (!octets) {
          setMyIpStatus("error");
          return;
        }
        setMyIp(octets.join("."));
        setMyIpStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setMyIpStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "myip") return;
    fillDetectedIp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, myIp, myIpStatus]);

  const resetFields = (keepMyIp) => {
    setEndOctets([...EMPTY_OCTETS]);
    setPrefix("24");
    setMemoInput("");
    if (keepMyIp) {
      const octets = parseIpv4(myIp);
      setIpOctets(octets || [...EMPTY_OCTETS]);
      setError("");
      return;
    }
    setIpOctets([...EMPTY_OCTETS]);
    setError("");
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    resetFields(nextMode === "myip");
  };

  const buildValue = () => {
    const start = octetsToIp(ipOctets);
    if (start.error) return start;

    if (mode === "ip" || mode === "myip") {
      return { value: start.ip, type: "ip" };
    }

    if (mode === "cidr") {
      const prefixNum = Number(prefix);
      if (!Number.isInteger(prefixNum) || prefixNum < 0 || prefixNum > 32) {
        return { error: "CIDR 프리픽스는 0–32이어야 합니다." };
      }
      return { value: `${start.ip}/${prefixNum}`, type: "cidr" };
    }

    const end = octetsToIp(endOctets);
    if (end.error) {
      return {
        error: end.error.startsWith("IP") ? `끝 ${end.error}` : end.error,
      };
    }
    if (ipToInt(start.ip) > ipToInt(end.ip)) {
      return { error: "시작 IP가 끝 IP보다 클 수 없습니다." };
    }
    return { value: `${start.ip}-${end.ip}`, type: "range" };
  };

  const canSubmit = () => {
    if (isFull) return false;
    if (mode === "myip") {
      return myIpStatus === "ready" && !myIpRegistered;
    }
    if (ipOctets.some((part) => part === "")) return false;
    if (mode === "cidr" && prefix === "") return false;
    if (mode === "range" && endOctets.some((part) => part === "")) return false;
    return true;
  };

  const handleAdd = () => {
    if (!canSubmit()) return;
    const parsed = buildValue();
    if (parsed.error) {
      setError(parsed.error);
      return;
    }
    if (entries.some((entry) => entry.value === parsed.value)) {
      setError("이미 등록된 값입니다.");
      return;
    }

    setEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        value: parsed.value,
        type: parsed.type,
        memo: memoInput.trim(),
      },
    ]);
    setPage(Math.ceil((entries.length + 1) / PAGE_SIZE));
    resetFields(mode === "myip");
  };

  const handleDelete = (id) => {
    const target = entries.find((entry) => entry.id === id);
    if (!target) return;
    if (window.confirm(`"${target.value}" 항목을 삭제하시겠습니까?`)) {
      const nextLen = entries.length - 1;
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      setPage((prev) =>
        Math.min(prev, Math.max(1, Math.ceil(nextLen / PAGE_SIZE)))
      );
    }
  };

  return (
    <div className="settings-section sip-page">
      <h3>보안</h3>

      <div className="sip-panel">
        <div className="sip-header">
          <div>
            <h4>접속 허용 IP</h4>
            <p>
              {restrictionOn
                ? "관리자와 부관리자를 제외한 멤버는 등록된 IP에서만 접속이 가능합니다."
                : "모든 IP에서 접속할 수 있습니다."}
            </p>
          </div>
          <div className="sip-header-meta">
            {restrictionOn && (
              <span className="sip-count">
                {entries.length}
                <em>/{MAX_ALLOW_IPS}</em>
              </span>
            )}
            <div className="sip-restrict">
              <span>{restrictionOn ? "사용" : "해제"}</span>
              <SipSwitch
                checked={restrictionOn}
                onChange={setRestrictionOn}
                label="IP 제한 사용"
              />
            </div>
          </div>
        </div>

        {restrictionOn && (
          <>
            <div className="sip-composer">
              <TypeMenu
                mode={mode}
                options={MODE_OPTIONS}
                myIp={myIp}
                myIpStatus={myIpStatus}
                disabled={isFull}
                onChange={handleModeChange}
              />
              <div className="sip-fields">
                {mode === "range" && (
                  <span className="sip-field-label">시작</span>
                )}
                <IpOctetInput
                  value={ipOctets}
                  onChange={(next) => {
                    setIpOctets(next);
                    if (error) setError("");
                  }}
                  disabled={fieldsLocked}
                  onEnter={handleAdd}
                />
                {mode === "cidr" && (
                  <>
                    <span className="sip-slash">/</span>
                    <input
                      type="number"
                      min="0"
                      max="32"
                      value={prefix}
                      disabled={isFull}
                      className="sip-prefix"
                      aria-label="CIDR 프리픽스"
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next === "") {
                          setPrefix("");
                          return;
                        }
                        const num = Number(next);
                        if (num >= 0 && num <= 32) setPrefix(String(num));
                        if (error) setError("");
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                    />
                  </>
                )}
                {mode === "range" && (
                  <>
                    <span className="sip-range-sep">~</span>
                    <span className="sip-field-label">끝</span>
                    <IpOctetInput
                      value={endOctets}
                      onChange={(next) => {
                        setEndOctets(next);
                        if (error) setError("");
                      }}
                      disabled={isFull}
                      onEnter={handleAdd}
                    />
                  </>
                )}
              </div>
              <input
                type="text"
                value={memoInput}
                onChange={(e) => setMemoInput(e.target.value)}
                placeholder="메모"
                className="sip-memo-input"
                disabled={isFull}
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
              />
              <button
                type="button"
                className="sip-add-btn"
                onClick={handleAdd}
                disabled={!canSubmit()}
              >
                추가
              </button>
            </div>
            {error && <p className="sip-error">{error}</p>}
            {mode === "myip" && myIpRegistered && !error && (
              <p className="sip-hint">이미 목록에 있습니다.</p>
            )}
            {isFull && (
              <p className="sip-limit">
                최대 {MAX_ALLOW_IPS}개까지 등록할 수 있습니다.
              </p>
            )}

            {entries.length === 0 ? (
              <div className="sip-empty">등록된 허용 IP가 없습니다.</div>
            ) : (
              <>
                <ul className="sip-list">
                  {pageEntries.map((entry) => (
                    <li key={entry.id} className="sip-item">
                      <code className="sip-value">{entry.value}</code>
                      {entry.memo && (
                        <span className="sip-memo">{entry.memo}</span>
                      )}
                      <button
                        type="button"
                        className="sip-delete"
                        onClick={() => handleDelete(entry.id)}
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
                {totalPages > 1 && (
                  <nav className="sip-pager" aria-label="허용 IP 페이지">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      aria-label="이전 페이지"
                      onClick={() => setPage(currentPage - 1)}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (num) => (
                        <button
                          key={num}
                          type="button"
                          className={num === currentPage ? "is-active" : ""}
                          aria-current={
                            num === currentPage ? "page" : undefined
                          }
                          onClick={() => setPage(num)}
                        >
                          {num}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      aria-label="다음 페이지"
                      onClick={() => setPage(currentPage + 1)}
                    >
                      ›
                    </button>
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SecuritySettingsPage;
