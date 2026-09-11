import React from "react";
import {
  DEBT_TYPE_OPTIONS,
  REPAY_METHOD_OPTIONS,
  assetKindMeta,
  debtTotalsOf,
  formatComma,
  formatWon,
  isSecured,
  manualPatchIfDifferent,
  maturityFromRemainingMonths,
  parseComma,
  resolveDebtCalc,
} from "./debtModel";

const PRINCIPAL_HINT =
  "오늘 기준 남은 원금(잔액)을 입력하세요. 남은기간이 있으면 월불입을 계산하고, 없으면 잔여이자는 0원·잔여상환액은 잔액입니다.";

const Field = ({ label, hint, className, children }) => (
  <label className={`scl-debt-cell ${className || ""}`}>
    <span className="scl-debt-cell-label">
      {label}
      {hint && (
        <span
          className="scl-th-hint"
          aria-hidden="true"
          data-tooltip={hint}
        >
          ?
        </span>
      )}
    </span>
    {children}
  </label>
);

const RevertIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path
      d="M3.2 4.2A4 4 0 1 1 2 7"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M3.2 1.8v2.6H5.7"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TypeSelect = ({ debt, onUpdate }) => (
  <select
    className="scl-grid-input scl-grid-select"
    value={debt.debtType || "은행대출"}
    onChange={(e) => onUpdate(debt.id, { debtType: e.target.value })}
  >
    {DEBT_TYPE_OPTIONS.map((t) => (
      <option key={t} value={t}>
        {t}
      </option>
    ))}
  </select>
);

const SecuredControl = ({ debt, onUpdate }) => {
  const asset = assetKindMeta(debt.collateralAssetId);
  if (asset) {
    return (
      <span className="scl-grid-collateral-locked">
        <span aria-hidden>{asset.icon}</span>
        담보
      </span>
    );
  }
  return (
    <select
      className="scl-grid-input scl-grid-select"
      value={isSecured(debt) ? "담보" : "무담보"}
      onChange={(e) =>
        onUpdate(debt.id, { secured: e.target.value === "담보" })
      }
    >
      <option value="무담보">무담보</option>
      <option value="담보">담보</option>
    </select>
  );
};

const LenderInput = ({ debt, onUpdate }) => (
  <input
    className="scl-grid-input"
    value={debt.lender}
    onChange={(e) => onUpdate(debt.id, { lender: e.target.value })}
    placeholder="예: 국민은행"
  />
);

const MethodSelect = ({ debt, onUpdate }) => (
  <select
    className="scl-grid-input scl-grid-select"
    value={debt.repayMethod || "원리금균등"}
    onChange={(e) => onUpdate(debt.id, { repayMethod: e.target.value })}
  >
    {REPAY_METHOD_OPTIONS.map((m) => (
      <option key={m} value={m}>
        {m}
      </option>
    ))}
  </select>
);

const OverdueInput = ({ debt, onUpdate }) => (
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
);

const DATE_FIELD_LABEL = {
  loanDate: "대출일",
  maturityDate: "만기일",
};

const DateInput = ({ debt, onUpdate, field }) => (
  <input
    className="scl-grid-input"
    type="date"
    value={debt[field]}
    aria-label={DATE_FIELD_LABEL[field]}
    onChange={(e) => onUpdate(debt.id, { [field]: e.target.value })}
  />
);

const PrincipalInput = ({ debt, onUpdate }) => (
  <input
    className="scl-grid-input scl-grid-num"
    type="text"
    inputMode="numeric"
    value={formatComma(debt.principal)}
    onChange={(e) =>
      onUpdate(debt.id, { principal: parseComma(e.target.value) })
    }
    placeholder="예: 50,000,000"
  />
);

const RateInput = ({ debt, onUpdate }) => (
  <input
    className="scl-grid-input scl-grid-num"
    type="number"
    step="0.1"
    value={debt.rate}
    onChange={(e) => onUpdate(debt.id, { rate: e.target.value })}
    placeholder="예: 15"
  />
);

const RemainingInput = ({ debt, onUpdate, months }) => (
  <div className="scl-debt-suffix">
    <input
      className="scl-grid-input scl-grid-num"
      type="number"
      min="1"
      inputMode="numeric"
      value={months ?? ""}
      onChange={(e) =>
        onUpdate(debt.id, {
          maturityDate: maturityFromRemainingMonths(
            e.target.value,
            debt.maturityDate,
          ),
        })
      }
      placeholder="—"
      aria-label="남은기간(개월)"
    />
    <span>개월</span>
  </div>
);

const EditableCalc = ({
  label,
  value,
  calculated,
  overridden,
  onChange,
  onRevert,
}) => (
  <div className={`scl-debt-cell${overridden ? " is-overridden" : ""}`}>
    <span className="scl-debt-cell-label">{label}</span>
    <div className="scl-debt-control">
      <input
        className="scl-grid-input scl-grid-num"
        type="text"
        inputMode="numeric"
        value={value != null ? formatComma(value) : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={calculated != null ? formatComma(calculated) : "—"}
        aria-label={label}
      />
      <button
        type="button"
        className="scl-debt-revert"
        onClick={onRevert}
        disabled={!overridden}
        title="계산값으로 되돌리기"
        aria-label={`${label} 계산값으로 되돌리기`}
      >
        <RevertIcon />
      </button>
    </div>
  </div>
);

const RemoveBtn = ({ onClick }) => (
  <button
    type="button"
    className="scl-debt-remove"
    onClick={onClick}
    title="삭제"
  >
    ×
  </button>
);

/**
 * 채무 입력 그리드 (간편/상세 공용).
 *
 * 간편과 상세는 같은 행 배열을 쓰고 보이는 필드만 다르다. 모드를 바꿔도
 * 입력값은 그대로 유지된다.
 *  - 간편: 카드 1행 (채무종류 · 담보 · 채권처 · 연체 · 금액)
 *  - 상세: 카드 2행. 만기일↔남은기간은 서로 연동되고,
 *    월불입·잔여이자·잔여상환액은 계산값 위에 직접 수정도 가능하다.
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

  return (
    <div className="scl-debt-cards">
      {rows.map((debt) => {
        const resolved = detail ? resolveDebtCalc(debt) : null;
        const asset = assetKindMeta(debt.collateralAssetId);
        const canRemove = onRemove && rows.length > minRows;
        const identity = (
          <>
            <Field label="채무종류">
              <TypeSelect debt={debt} onUpdate={onUpdate} />
            </Field>
            {showCollateral && (
              <Field label="담보" className={asset ? "is-linked" : ""}>
                <SecuredControl debt={debt} onUpdate={onUpdate} />
              </Field>
            )}
            <Field label="채권처" className="scl-debt-cell--grow">
              <LenderInput debt={debt} onUpdate={onUpdate} />
            </Field>
            <Field label="연체(개월)">
              <OverdueInput debt={debt} onUpdate={onUpdate} />
            </Field>
            <Field
              label="현재 잔액(원)"
              hint={PRINCIPAL_HINT}
              className="scl-debt-cell--grow"
            >
              <PrincipalInput debt={debt} onUpdate={onUpdate} />
            </Field>
          </>
        );
        return (
          <article
            key={debt.id}
            className={`scl-debt-card${
              showCollateral ? "" : " scl-debt-card--no-col"
            }${detail ? "" : " scl-debt-card--simple"}`}
            title={asset ? `${asset.label} 담보` : undefined}
          >
            {canRemove && <RemoveBtn onClick={() => onRemove(debt.id)} />}

            {detail ? (
              <>
                <div className="scl-debt-card-row scl-debt-card-row--main">
                  {identity}
                  <Field label="금리(%)">
                    <RateInput debt={debt} onUpdate={onUpdate} />
                  </Field>
                  <Field label="상환방식">
                    <MethodSelect debt={debt} onUpdate={onUpdate} />
                  </Field>
                </div>

                <div className="scl-debt-card-row scl-debt-card-row--money">
                  <Field label="대출일">
                    <DateInput
                      debt={debt}
                      onUpdate={onUpdate}
                      field="loanDate"
                    />
                  </Field>

                  <div
                    className="scl-debt-pair"
                    role="group"
                    aria-label="만기일과 남은기간"
                  >
                    <div className="scl-debt-pair-labels">
                      <span className="scl-debt-cell-label">만기일</span>
                      <span className="scl-debt-cell-label">남은기간</span>
                    </div>
                    <div className="scl-debt-pair-shell">
                      <DateInput
                        debt={debt}
                        onUpdate={onUpdate}
                        field="maturityDate"
                      />
                      <RemainingInput
                        debt={debt}
                        onUpdate={onUpdate}
                        months={resolved.months}
                      />
                    </div>
                  </div>

                  <EditableCalc
                    label="월불입"
                    value={resolved.monthly}
                    calculated={resolved.calc?.monthly}
                    overridden={resolved.overridden.monthly}
                    onChange={(raw) =>
                      onUpdate(
                        debt.id,
                        manualPatchIfDifferent(
                          "monthlyManual",
                          raw,
                          resolved.calc?.monthly,
                        ),
                      )
                    }
                    onRevert={() => onUpdate(debt.id, { monthlyManual: "" })}
                  />
                  <EditableCalc
                    label="잔여이자"
                    value={resolved.totalInterest}
                    calculated={resolved.calc?.totalInterest}
                    overridden={resolved.overridden.interest}
                    onChange={(raw) =>
                      onUpdate(
                        debt.id,
                        manualPatchIfDifferent(
                          "interestManual",
                          raw,
                          resolved.calc?.totalInterest,
                        ),
                      )
                    }
                    onRevert={() => onUpdate(debt.id, { interestManual: "" })}
                  />
                  <EditableCalc
                    label="잔여상환액"
                    value={resolved.totalRepay}
                    calculated={resolved.calc?.totalRepay}
                    overridden={resolved.overridden.repay}
                    onChange={(raw) =>
                      onUpdate(
                        debt.id,
                        manualPatchIfDifferent(
                          "repayManual",
                          raw,
                          resolved.calc?.totalRepay,
                        ),
                      )
                    }
                    onRevert={() => onUpdate(debt.id, { repayManual: "" })}
                  />
                </div>
              </>
            ) : (
              <div className="scl-debt-card-row scl-debt-card-row--simple">
                {identity}
              </div>
            )}
          </article>
        );
      })}

      {onAdd && (
        <button
          type="button"
          className="scl-debt-add-btn scl-debt-add-btn--block"
          onClick={onAdd}
        >
          {addLabel}
        </button>
      )}
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
