import { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";

export function GuestDropdown({
  value,
  setValue,
  max,
}: {
  value: string;
  setValue: (v: string) => void;
  max: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="pdp-calendar-wrapper" ref={ref}>
      <button
        type="button"
        className={`pdp-cal-trigger${open ? " open" : ""}`}
        onClick={() => setOpen(p => !p)}
      >
        <span style={{ fontSize: 13, fontWeight: 500}}>
          {value} {value === "1" ? "Guest" : "Guests"}
        </span>
        <Users style={{ width: 15, height: 15 }} />
      </button>

      {open && (
        <div
          className="pdp-dropdown-popover"
          style={{ padding: 6, zIndex: 60, minWidth: "100%" }}
        >
          {Array.from({ length: max }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setValue(String(n));
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                textAlign: "left",
                borderRadius: 8,
                border: "none",
                background: n === Number(value) ? "#eef2ff" : "transparent",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {n} {n === 1 ? "Guest" : "Guests"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}