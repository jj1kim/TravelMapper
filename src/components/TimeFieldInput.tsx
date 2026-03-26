"use client";

import { useState, useRef } from "react";

export function isValidTime(h: string, m: string): boolean {
  const hh = parseInt(h, 10);
  const mm = parseInt(m, 10);
  return h.length === 2 && m.length === 2 && hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
}

export function isValidTimeStr(t: string): boolean {
  const parts = t.split(":");
  if (parts.length !== 2) return false;
  return isValidTime(parts[0], parts[1]);
}

export default function TimeFieldInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [hh, mm] = value.split(":");
  const [hour, setHour] = useState(hh || "00");
  const [minute, setMinute] = useState(mm || "00");
  const minRef = useRef<HTMLInputElement>(null);

  const update = (h: string, m: string) => {
    setHour(h);
    setMinute(m);
    onChange(`${h}:${m}`);
  };

  const handleHourChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    if (digits.length === 2) {
      const n = parseInt(digits, 10);
      const clamped = String(Math.min(n, 23)).padStart(2, "0");
      update(clamped, minute);
      minRef.current?.focus();
      minRef.current?.select();
    } else {
      setHour(digits);
    }
  };

  const handleMinuteChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    if (digits.length === 2) {
      const n = parseInt(digits, 10);
      const clamped = String(Math.min(n, 59)).padStart(2, "0");
      update(hour, clamped);
    } else {
      setMinute(digits);
    }
  };

  const handleHourBlur = () => {
    const padded = hour.padStart(2, "0");
    const n = Math.min(parseInt(padded, 10) || 0, 23);
    update(String(n).padStart(2, "0"), minute);
  };

  const handleMinuteBlur = () => {
    const padded = minute.padStart(2, "0");
    const n = Math.min(parseInt(padded, 10) || 0, 59);
    update(hour, String(n).padStart(2, "0"));
  };

  return (
    <div className="flex items-center gap-0 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden w-[72px] focus-within:ring-2 focus-within:ring-blue-500">
      <input type="text" inputMode="numeric" value={hour}
        onChange={(e) => handleHourChange(e.target.value)} onBlur={handleHourBlur}
        onFocus={(e) => e.target.select()} maxLength={2}
        className="w-7 text-center text-sm py-1.5 outline-none bg-transparent" placeholder="00" />
      <span className="text-sm text-gray-400 dark:text-gray-500 font-bold select-none">:</span>
      <input ref={minRef} type="text" inputMode="numeric" value={minute}
        onChange={(e) => handleMinuteChange(e.target.value)} onBlur={handleMinuteBlur}
        onFocus={(e) => e.target.select()} maxLength={2}
        className="w-7 text-center text-sm py-1.5 outline-none bg-transparent" placeholder="00" />
    </div>
  );
}
