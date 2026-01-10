import React, { useEffect, useState } from "react";

/**
 * Controlled weeks stepper.
 * - Shows - and + buttons + numeric input
 * - Clamps to [min, max]
 * - Works with typing and buttons
 */
export default function WeeksStepper({
  value,                 // number (repeatWeeks)
  onChange,              // (nextNumber) => void
  min = 1,
  max = 52,
  step = 1,
  disabled = false,
  label = "Number of weeks",
  helper = "Set a specific number of weeks for this availability.",
}) {
  // Keep a local string for smooth typing (e.g., user types "1", "12", "")
  const [draft, setDraft] = useState(String(value ?? min));

  useEffect(() => {
    // sync if parent changes externally
    setDraft(String(value ?? min));
  }, [value, min]);

  const clamp = (n) => Math.min(max, Math.max(min, n));

  const commit = (raw) => {
    if (raw === "" || raw == null) return; // don't commit empty while typing
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    onChange(clamp(parsed));
  };

  const dec = () => {
    if (disabled) return;
    const next = clamp((Number(value) || min) - step);
    onChange(next);
  };

  const inc = () => {
    if (disabled) return;
    const next = clamp((Number(value) || min) + step);
    onChange(next);
  };

  const canDec = !disabled && (Number(value) || min) > min;
  const canInc = !disabled && (Number(value) || min) < max;

  return (
    <div className="w-full" onClick={(e) => e.stopPropagation()}>
      <div className="text-sm font-semibold text-gray-900 mb-1">{label}</div>
      <div className="text-xs text-gray-500 mb-3">{helper}</div>

      <div className={`flex items-center gap-2 ${disabled ? "opacity-60" : ""}`}>
        {/* - button */}
        <button
          type="button"
          onClick={dec}
          disabled={!canDec}
          className={`h-10 w-10 rounded-lg border flex items-center justify-center text-lg font-semibold
            ${canDec ? "bg-white hover:bg-gray-50 border-gray-200" : "bg-gray-100 border-gray-200 cursor-not-allowed"}
          `}
          aria-label="Decrease weeks"
        >
          −
        </button>

        {/* input */}
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        value={draft}
        onChange={(e) => {
          // allow empty typing
          const v = e.target.value;
          setDraft(v);
          if (v === "") return;
          const parsed = Number(v);
          if (!Number.isNaN(parsed)) {
            onChange(clamp(parsed));
          }
        }}
        onBlur={() => {
          // commit on blur; if empty revert to current value
          if (draft === "") {
            setDraft(String(value ?? min));
            return;
          }
          commit(draft);
        }}
          onKeyDown={(e) => {
            // Enter commits
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="h-10 flex-1 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-blue-200"
        />

        {/* + button */}
        <button
          type="button"
          onClick={inc}
          disabled={!canInc}
          className={`h-10 w-10 rounded-lg border flex items-center justify-center text-lg font-semibold
            ${canInc ? "bg-white hover:bg-gray-50 border-gray-200" : "bg-gray-100 border-gray-200 cursor-not-allowed"}
          `}
          aria-label="Increase weeks"
        >
          +
        </button>

        <div className="text-sm text-gray-600 ml-1">weeks</div>
      </div>

      {/* Optional validation hint */}
      <div className="mt-2 text-xs text-gray-500">
        Allowed range: {min}–{max}
      </div>
    </div>
  );
}
