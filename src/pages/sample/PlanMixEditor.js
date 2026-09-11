import React, { useRef, useState } from "react";
import "./PlanMixEditor.css";

export const PLAN_MIX = {
  rehabilitation: {
    minMonths: 12,
    maxMonths: 60,
    minRate: 5,
    maxRate: 100,
  },
  personalWorkout: {
    minMonths: 12,
    maxMonths: 120,
    minRate: 5,
    maxRate: 100,
  },
  newStartFund: {
    minMonths: 12,
    maxMonths: 120,
    minRate: 5,
    maxRate: 100,
  },
};

export const DEFAULT_PLAN_MONTHS = {
  rehabilitation: 60,
  personalWorkout: 96,
  newStartFund: 120,
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round1 = (n) => Math.round(n * 10) / 10;

const formatPlanPeriod = (months) => {
  if (months % 12 === 0) return `${months / 12}년`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return years ? `${years}년 ${rem}개월` : `${rem}개월`;
};

const formatMonthly = (n) => {
  const rounded = round1(n);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

const parseMixNumber = (raw) => {
  const cleaned = String(raw ?? "").replace(/[^\d.]/g, "");
  if (!cleaned || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const yearMonthsForMix = (spec) => {
  const list = [];
  for (let months = spec.minMonths; months <= spec.maxMonths; months += 12) {
    list.push(months);
  }
  return list;
};

const snapToList = (value, list) =>
  list.reduce((best, candidate) =>
    Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best,
  );

const attachPointerDrag = (event, measureEl, onT) => {
  event.preventDefault();
  const update = (clientX) => {
    const rect = measureEl.getBoundingClientRect();
    const t = clamp((clientX - rect.left) / rect.width, 0, 1);
    onT(t);
  };
  update(event.clientX);
  const onMove = (ev) => update(ev.clientX);
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
};

const MixNumberInput = ({
  ariaLabel,
  display,
  editing,
  suffix,
  className,
  warn,
  onStart,
  onChange,
  onCommit,
  onCancel,
}) => {
  const skipCommitRef = useRef(false);
  const shown = editing != null ? editing : display;
  return (
    <span className={`sdp-plan-num ${className || ""}`}>
      <input
        aria-label={ariaLabel}
        className={`sdp-plan-num-input ${warn ? "is-warn" : ""}`}
        value={shown}
        onFocus={(event) => {
          if (editing == null) onStart();
          const target = event.currentTarget;
          requestAnimationFrame(() => target.select());
        }}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => {
          if (skipCommitRef.current) {
            skipCommitRef.current = false;
            return;
          }
          onCommit(event.currentTarget.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            skipCommitRef.current = true;
            onCommit(event.currentTarget.value);
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            skipCommitRef.current = true;
            onCancel();
            event.currentTarget.blur();
          }
        }}
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        size={Math.max(1, String(shown).length)}
      />
      {suffix ? <span className="sdp-plan-num-suffix">{suffix}</span> : null}
    </span>
  );
};

const PlanMixEditor = ({
  mixSpec,
  planPrincipal,
  ratePct,
  months,
  onChange,
  disposableIncome,
}) => {
  const [mixFieldEdit, setMixFieldEdit] = useState(null);
  if (!mixSpec) return null;

  const mixYearOptions = yearMonthsForMix(mixSpec);
  const draftRatePct = round1(
    clamp(ratePct, mixSpec.minRate, mixSpec.maxRate),
  );
  const draftMonths = clamp(months, mixSpec.minMonths, mixSpec.maxMonths);
  const previewTotal =
    planPrincipal > 0
      ? Math.round((planPrincipal * draftRatePct) / 100)
      : 0;
  const previewMonthly = draftMonths > 0 ? previewTotal / draftMonths : 0;
  const previewExempt = Math.max(0, Math.round(planPrincipal - previewTotal));
  const previewOverIncome =
    disposableIncome != null && round1(previewMonthly) > disposableIncome;
  const previewIncomeGap =
    disposableIncome != null
      ? round1(disposableIncome - previewMonthly)
      : null;
  const periodPct =
    mixSpec.maxMonths === mixSpec.minMonths
      ? 0
      : ((draftMonths - mixSpec.minMonths) /
          (mixSpec.maxMonths - mixSpec.minMonths)) *
        100;
  const shortMonthly =
    mixSpec.minMonths > 0 ? previewTotal / mixSpec.minMonths : 0;
  const longMonthly =
    mixSpec.maxMonths > 0 ? previewTotal / mixSpec.maxMonths : 0;

  const patch = (next) => onChange(next);
  const cancelMixFieldEdit = () => setMixFieldEdit(null);

  const commitMixRate = (raw) => {
    setMixFieldEdit(null);
    const n = parseMixNumber(raw);
    if (n == null) return;
    patch({
      ratePct: round1(clamp(n, mixSpec.minRate, mixSpec.maxRate)),
    });
  };
  const commitMixAmount = (raw) => {
    setMixFieldEdit(null);
    if (planPrincipal <= 0) return;
    const n = parseMixNumber(raw);
    if (n == null) return;
    const minAmt = Math.round((planPrincipal * mixSpec.minRate) / 100);
    const maxAmt = Math.round((planPrincipal * mixSpec.maxRate) / 100);
    const amount = clamp(Math.round(n), minAmt, maxAmt);
    patch({
      ratePct: round1(
        clamp((amount / planPrincipal) * 100, mixSpec.minRate, mixSpec.maxRate),
      ),
    });
  };
  const commitMixMonthly = (raw) => {
    setMixFieldEdit(null);
    if (mixYearOptions.length === 0 || previewTotal <= 0) return;
    const n = parseMixNumber(raw);
    if (n == null || n <= 0) return;
    patch({ months: snapToList(previewTotal / n, mixYearOptions) });
  };

  const handleMixSplitPointerDown = (event) => {
    setMixFieldEdit(null);
    const track =
      event.currentTarget.querySelector(".sdp-plan-split-track") ||
      event.currentTarget;
    attachPointerDrag(event, track, (t) => {
      const minT = mixSpec.minRate / 100;
      const maxT = mixSpec.maxRate / 100;
      patch({ ratePct: round1(clamp(t, minT, maxT) * 100) });
    });
  };

  const handleMixPeriodPointerDown = (event) => {
    if (mixYearOptions.length === 0) return;
    setMixFieldEdit(null);
    const track =
      event.currentTarget.querySelector(".sdp-plan-period-track") ||
      event.currentTarget;
    attachPointerDrag(event, track, (t) => {
      const raw =
        mixSpec.minMonths + t * (mixSpec.maxMonths - mixSpec.minMonths);
      patch({ months: snapToList(raw, mixYearOptions) });
    });
  };

  return (
    <div className="sdp-plan-adjust-body scl-plan-mix">
      <div className="sdp-plan-split">
        <div className="sdp-plan-split-meta">
          <div className="sdp-plan-split-side">
            <span className="sdp-plan-split-k">변제</span>
            <MixNumberInput
              ariaLabel="변제액"
              className="sdp-plan-num--amt"
              display={previewTotal.toLocaleString()}
              editing={
                mixFieldEdit?.kind === "amount" ? mixFieldEdit.value : null
              }
              suffix="만원"
              onStart={() =>
                setMixFieldEdit({
                  kind: "amount",
                  value: String(previewTotal),
                })
              }
              onChange={(value) => setMixFieldEdit({ kind: "amount", value })}
              onCommit={commitMixAmount}
              onCancel={cancelMixFieldEdit}
            />
            <MixNumberInput
              ariaLabel="변제율"
              className="sdp-plan-num--pct"
              display={draftRatePct.toFixed(1)}
              editing={mixFieldEdit?.kind === "rate" ? mixFieldEdit.value : null}
              suffix="%"
              onStart={() =>
                setMixFieldEdit({
                  kind: "rate",
                  value: draftRatePct.toFixed(1),
                })
              }
              onChange={(value) => setMixFieldEdit({ kind: "rate", value })}
              onCommit={commitMixRate}
              onCancel={cancelMixFieldEdit}
            />
          </div>
          <div className="sdp-plan-split-side sdp-plan-split-side--end">
            <span className="sdp-plan-split-k">면책</span>
            <strong className="sdp-plan-split-v">
              {previewExempt.toLocaleString()}만원
            </strong>
            <span className="sdp-plan-split-pct">
              {(100 - draftRatePct).toFixed(1)}%
            </span>
          </div>
        </div>
        <div
          className="sdp-plan-split-hit"
          onPointerDown={handleMixSplitPointerDown}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            const delta = e.key === "ArrowLeft" ? -0.5 : 0.5;
            patch({
              ratePct: round1(
                clamp(draftRatePct + delta, mixSpec.minRate, mixSpec.maxRate),
              ),
            });
          }}
          role="slider"
          tabIndex={0}
          aria-label="변제율"
          aria-valuemin={mixSpec.minRate}
          aria-valuemax={mixSpec.maxRate}
          aria-valuenow={draftRatePct}
          aria-valuetext={`${draftRatePct.toFixed(1)}%`}
        >
          <div className="sdp-plan-split-track">
            <div
              className="sdp-plan-split-fill"
              style={{ width: `${draftRatePct}%` }}
            />
            <span
              className="sdp-plan-split-handle"
              style={{ left: `${draftRatePct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="sdp-plan-period">
        <div className="sdp-plan-mix-pair">
          <div className="sdp-plan-mix-stat">
            <span className="sdp-plan-mix-stat-k">월 변제액</span>
            <MixNumberInput
              ariaLabel="월 변제액"
              className="sdp-plan-num--monthly"
              display={formatMonthly(previewMonthly)}
              editing={
                mixFieldEdit?.kind === "monthly" ? mixFieldEdit.value : null
              }
              suffix="만원"
              warn={previewOverIncome}
              onStart={() =>
                setMixFieldEdit({
                  kind: "monthly",
                  value: formatMonthly(previewMonthly),
                })
              }
              onChange={(value) => setMixFieldEdit({ kind: "monthly", value })}
              onCommit={commitMixMonthly}
              onCancel={cancelMixFieldEdit}
            />
          </div>
          <div className="sdp-plan-mix-stat sdp-plan-mix-stat--end">
            <span className="sdp-plan-mix-stat-k">기간</span>
            <strong className="sdp-plan-mix-stat-v">
              {formatPlanPeriod(draftMonths)}
            </strong>
          </div>
        </div>
        <div className="sdp-plan-period-poles">
          <span>월 {formatMonthly(shortMonthly)}만</span>
          <span>월 {formatMonthly(longMonthly)}만</span>
        </div>
        <div
          className="sdp-plan-period-hit"
          onPointerDown={handleMixPeriodPointerDown}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            const current = snapToList(draftMonths, mixYearOptions);
            const from = mixYearOptions.indexOf(current);
            const next =
              mixYearOptions[
                clamp(
                  from + (e.key === "ArrowLeft" ? -1 : 1),
                  0,
                  mixYearOptions.length - 1,
                )
              ];
            if (next) patch({ months: next });
          }}
          role="slider"
          tabIndex={0}
          aria-label="변제 기간"
          aria-valuemin={mixSpec.minMonths}
          aria-valuemax={mixSpec.maxMonths}
          aria-valuenow={draftMonths}
          aria-valuetext={`${formatPlanPeriod(draftMonths)}, 월 ${formatMonthly(previewMonthly)}만원`}
        >
          <div className="sdp-plan-period-track">
            <span
              className="sdp-plan-period-handle"
              style={{ left: `${periodPct}%` }}
            />
          </div>
        </div>
        <div className="sdp-plan-period-ticks">
          {mixYearOptions.map((m) => (
            <button
              key={m}
              type="button"
              className={`sdp-plan-period-tick ${
                draftMonths === m ? "is-on" : ""
              }`}
              onClick={() => patch({ months: m })}
              aria-label={`${m / 12}년`}
            >
              {m / 12}
            </button>
          ))}
        </div>
        {disposableIncome != null &&
          (previewOverIncome ? (
            <p className="sdp-plan-adjust-warn">
              가용소득 {disposableIncome}만원 초과
            </p>
          ) : (
            <p className="sdp-plan-adjust-hint">
              {previewIncomeGap === 0
                ? `가용소득 ${disposableIncome}만원과 같음`
                : `가용소득 대비 ${formatMonthly(previewIncomeGap)}만원 여유`}
            </p>
          ))}
      </div>
    </div>
  );
};

export default PlanMixEditor;
