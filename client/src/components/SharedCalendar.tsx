import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";

interface SharedCalendarProps {
  value?: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  onClose?: () => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabledDates?: string[];
  defaultCalendarMonth?: Dayjs;
  accentColor?: string;
  hoverAccentColor?: string;
  todayBorderColor?: string;
}

function DisabledDay(
  props: PickersDayProps<Dayjs> & { disabledSet?: Set<string> },
) {
  const { disabledSet, day, ...rest } = props;
  const dateStr = day.format("YYYY-MM-DD");
  const isLocked = disabledSet?.has(dateStr);
  return (
    <PickersDay
      {...rest}
      day={day}
      disabled={rest.disabled || isLocked}
      sx={{
        ...(isLocked && {
          backgroundColor: "#fee2e2 !important",
          color: "#fca5a5 !important",
          borderRadius: "50%",
        }),
      }}
    />
  );
}

export default function SharedCalendar({
  value,
  onChange,
  onClose,
  minDate,
  maxDate,
  disabledDates = [],
  defaultCalendarMonth,
  accentColor = "#1F8A84",
  hoverAccentColor = "#264948",
  todayBorderColor = "#1F8A84",
}: SharedCalendarProps) {
  const disabledSet = React.useMemo(
    () => new Set(disabledDates),
    [disabledDates],
  );

  const shouldDisableDate = React.useCallback(
    (date: Dayjs) => disabledSet.has(date.format("YYYY-MM-DD")),
    [disabledSet],
  );

  const hasValue = !!value;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
          overflow: "hidden",
          width: "fit-content",
        }}
      >
        <DateCalendar
          value={value ?? null}
          onChange={onChange}
          minDate={minDate ?? dayjs()}
          maxDate={maxDate}
          shouldDisableDate={shouldDisableDate}
          defaultCalendarMonth={defaultCalendarMonth}
          views={["year", "month", "day"]}
          openTo="day"
          slots={{ day: DisabledDay }}
          slotProps={{
            day: { disabledSet } as any,
          }}
          sx={{
            backgroundColor: "#fff",
            margin: 0,
            "& .MuiPickersDay-root": {
              borderRadius: "50%",
              fontSize: 13,
            },
            "& .MuiPickersDay-root.Mui-selected": {
              backgroundColor: `${accentColor} !important`,
              color: "#fff !important",
            },
            "& .MuiPickersDay-root.Mui-selected:hover": {
              backgroundColor: `${hoverAccentColor} !important`,
            },
            "& .MuiPickersDay-today": {
              border: `1.5px solid ${todayBorderColor} !important`,
            },
            "& .MuiPickersCalendarHeader-label": {
              fontWeight: 600,
              fontSize: 15,
            },
          }}
        />

        {/* Minimal Clear / Done buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "0 12px 12px",
          }}
        >
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              flex: 1,
              height: 32,
              background: "none",
              border: `1px solid ${hasValue ? "#fecaca" : "#e2e8f0"}`,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: hasValue ? "#ef4444" : "#94a3b8",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => onClose?.()}
            style={{
              flex: 1,
              height: 32,
              background: accentColor,
              border: "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </LocalizationProvider>
  );
}
