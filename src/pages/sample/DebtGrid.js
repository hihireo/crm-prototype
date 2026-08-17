import React from "react";
import {
  DEBT_TYPE_OPTIONS,
  REPAY_METHOD_OPTIONS,
  assetKindMeta,
  calcDebtItem,
  debtTotalsOf,
  formatComma,
  formatWon,
  isSecured,
  parseComma,
} from "./debtModel";

/**
 * 채무 입력 그리드 (간편/상세 공용).
 *
 * 간편과 상세는 같은 행 배열을 쓰고 보이는 컬럼만 다르다. 덕분에 모드를 바꿔도
 * 입력값이 그대로 유지된다.
 *  - 간편: 채무종류 · 담보 · 채권처 · 연체 · 금액
 *  - 상세: + 상환방식 · 대출일 · 만기일 · 금리 · 계산 결과 4컬럼
 *
 * 자산 단계에서 연결된 담보 채무(collateralAssetId)는 목록 맨 위에 고정한다.
 * 담보 컬럼 값은 그대로 '담보'이고, 행 배경·작은 아이콘으로만 구분한다.
 */
const DebtGrid = ({
  rows,
  mode = "detail",
  onUpdate,
  onAdd,
  onRemove,
  showCollateral = true,
  minRows = 1,
  addLabel = "+ 행 추가",
}) => {
  const detail = mode === "detail";
  const colCount =
    (detail ? 12 : 4) + (showCollateral ? 1 : 0) + (onRemove ? 1 : 0);

  return (
    <div className="scl-debt-grid-wrap">
      <table className={`scl-debt-grid ${detail ? "detail" : "simple"}`}>
        <thead>
          <tr>
            <th className="col-type">채무종류</th>
            {showCollateral && <th className="col-secured">담보</th>}
            <th className="col-lender">채권처</th>
            {detail && <th className="col-method">상환방식</th>}
            <th className="col-overdue">연체(개월)</th>
            {detail && <th className="col-date">대출일</th>}
            {detail && <th className="col-date">만기일</th>}
            <th className="col-num">
              현재 잔액(원)
              <span
                className="scl-th-hint"
                aria-hidden="true"
                data-tooltip="오늘 기준 남은 원금(잔액)을 입력하세요. 계산 기간은 오늘~만기일로 적용됩니다."
              >?</span>
            </th>
            {detail && <th className="col-rate">금리(%)</th>}
            {detail && <th className="col-calc">남은기간</th>}
            {detail && <th className="col-calc">월불입</th>}
            {detail && <th className="col-calc">잔여이자</th>}
            {detail && <th className="col-calc">잔여상환액</th>}
            {onRemove && <th className="col-act" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((debt) => {
            const calc = detail ? calcDebtItem(debt) : null;
            const asset = assetKindMeta(debt.collateralAssetId);
            return (
              <tr
                key={debt.id}
                className={asset ? "scl-debt-row-linked" : ""}
                title={asset ? `${asset.label} 담보` : undefined}
              >
                <td>
                  <select
                    className="scl-grid-input scl-grid-select"
                    value={debt.debtType || "은행대출"}
                    onChange={(e) =>
                      onUpdate(debt.id, { debtType: e.target.value })
                    }
                  >
                    {DEBT_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>

                {showCollateral && (
                  <td className={`col-secured${asset ? " is-linked" : ""}`}>
                    {asset ? (
                      <span className="scl-grid-collateral-locked">
                        <span aria-hidden>{asset.icon}</span>
                        담보
                      </span>
                    ) : (
                      <select
                        className="scl-grid-input scl-grid-select"
                        value={isSecured(debt) ? "담보" : "무담보"}
                        onChange={(e) =>
                          onUpdate(debt.id, {
                            secured: e.target.value === "담보",
                          })
                        }
                      >
                        <option value="무담보">무담보</option>
                        <option value="담보">담보</option>
                      </select>
                    )}
                  </td>
                )}

                <td>
                  <input
                    className="scl-grid-input"
                    value={debt.lender}
                    onChange={(e) =>
                      onUpdate(debt.id, { lender: e.target.value })
                    }
                    placeholder="예: 국민은행"
                  />
                </td>

                {detail && (
                  <td>
                    <select
                      className="scl-grid-input scl-grid-select"
                      value={debt.repayMethod || "원리금균등"}
                      onChange={(e) =>
                        onUpdate(debt.id, { repayMethod: e.target.value })
                      }
                    >
                      {REPAY_METHOD_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>
                )}

                <td>
                  <input
                    className="scl-grid-input scl-grid-num"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={debt.overduePeriod ?? "0"}
                    onChange={(e) =>
                      onUpdate(debt.id, {
                        overduePeriod: e.target.value.replace(/[^\d]/g, ""),
                      })
                    }
                  />
                </td>

                {detail && (
                  <td>
                    <input
                      className="scl-grid-input"
                      type="date"
                      value={debt.loanDate}
                      onChange={(e) =>
                        onUpdate(debt.id, { loanDate: e.target.value })
                      }
                    />
                  </td>
                )}
                {detail && (
                  <td>
                    <input
                      className="scl-grid-input"
                      type="date"
                      value={debt.maturityDate}
                      onChange={(e) =>
                        onUpdate(debt.id, { maturityDate: e.target.value })
                      }
                    />
                  </td>
                )}

                <td>
                  <input
                    className="scl-grid-input scl-grid-num"
                    type="text"
                    inputMode="numeric"
                    value={formatComma(debt.principal)}
                    onChange={(e) =>
                      onUpdate(debt.id, {
                        principal: parseComma(e.target.value),
                      })
                    }
                    placeholder="예: 50,000,000"
                  />
                </td>

                {detail && (
                  <td>
                    <input
                      className="scl-grid-input scl-grid-num"
                      type="number"
                      step="0.1"
                      value={debt.rate}
                      onChange={(e) =>
                        onUpdate(debt.id, { rate: e.target.value })
                      }
                      placeholder="예: 15"
                    />
                  </td>
                )}
                {detail && (
                  <td className="scl-grid-calc">
                    {calc ? `${calc.months}개월 남음` : "—"}
                  </td>
                )}
                {detail && (
                  <td className="scl-grid-calc">
                    {calc ? formatWon(calc.monthly) : "—"}
                  </td>
                )}
                {detail && (
                  <td className="scl-grid-calc">
                    {calc ? formatWon(calc.totalInterest) : "—"}
                  </td>
                )}
                {detail && (
                  <td className="scl-grid-calc">
                    {calc ? formatWon(calc.totalRepay) : "—"}
                  </td>
                )}

                {onRemove && (
                  <td className="col-act">
                    {rows.length > minRows && (
                      <button
                        type="button"
                        className="scl-debt-remove"
                        onClick={() => onRemove(debt.id)}
                        title="삭제"
                      >
                        ×
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
          {onAdd && (
            <tr className="scl-debt-add-row">
              <td colSpan={colCount}>
                <button
                  type="button"
                  className="scl-debt-add-btn"
                  onClick={onAdd}
                >
                  {addLabel}
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/** 간편/상세 전환 탭 — 어디서 바꿔도 같은 행 배열을 공유한다 */
export const DebtModeToggle = ({ mode, onChange }) => (
  <div className="scl-mode-toggle" role="tablist">
    {[
      { id: "simple", label: "간편" },
      { id: "detail", label: "상세" },
    ].map((m) => (
      <button
        key={m.id}
        type="button"
        role="tab"
        aria-selected={mode === m.id}
        className={`scl-mode-btn ${mode === m.id ? "on" : ""}`}
        onClick={() => onChange(m.id)}
      >
        {m.label}
      </button>
    ))}
  </div>
);

/** 그리드 하단 담보/무담보/총 합산 카드 */
export const DebtTotals = ({ rows, mode = "detail" }) => {
  const totals = debtTotalsOf(rows);
  if (totals.totalWon <= 0) return null;
  const detail = mode === "detail";

  const card = (label, amountWon, monthlyWon, interestWon, className = "") => (
    <div className={`scl-debt-summary-item ${className}`}>
      <span className="scl-debt-summary-label">{label}</span>
      <strong className="scl-debt-summary-val">{formatWon(amountWon)}</strong>
      {detail && interestWon > 0 && (
        <div className="scl-debt-summary-meta">
          <span>월불입 {formatWon(monthlyWon)}</span>
          <span>총이자 {formatWon(interestWon)}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="scl-debt-summary">
      {card(
        "담보대출 합산",
        totals.securedWon,
        totals.securedMonthlyWon,
        totals.securedInterestWon,
      )}
      {card(
        "무담보대출 합산",
        totals.unsecuredWon,
        totals.unsecuredMonthlyWon,
        totals.unsecuredInterestWon,
      )}
      {card(
        "총 합산",
        totals.totalWon,
        totals.totalMonthlyWon,
        totals.totalInterestWon,
        "total",
      )}
    </div>
  );
};

export default DebtGrid;
