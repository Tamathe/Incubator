"use client";

import { useEffect, useMemo, useState } from "react";
import type { FridaySlot } from "@/lib/friday-booking";
import styles from "./FridayCalendarPicker.module.css";

type SelectionTarget = "preferred" | "alternate";

interface Props {
  slots: FridaySlot[];
  loading: boolean;
  preferredFriday: string;
  alternateFriday: string;
  onPreferredChange: (date: string) => void;
  onAlternateChange: (date: string) => void;
  onRetry: () => void;
}

interface CalendarDay {
  date: string;
  day: number;
  inMonth: boolean;
}

function isoDate(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function calendarDays(monthKey: string): CalendarDay[] {
  const [year, month] = monthKey.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const start = new Date(first);
  start.setUTCDate(first.getUTCDate() - first.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      date: isoDate(date),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month - 1,
    };
  });
}

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function shortDate(iso: string, fallback: string): string {
  if (!iso) return fallback;
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default function FridayCalendarPicker({
  slots,
  loading,
  preferredFriday,
  alternateFriday,
  onPreferredChange,
  onAlternateChange,
  onRetry,
}: Props) {
  const [target, setTarget] = useState<SelectionTarget>("preferred");
  const [monthIndex, setMonthIndex] = useState(0);

  const monthKeys = useMemo(
    () => Array.from(new Set(slots.map((slot) => slot.date.slice(0, 7)))),
    [slots],
  );
  const slotByDate = useMemo(
    () => new Map(slots.map((slot) => [slot.date, slot])),
    [slots],
  );

  useEffect(() => {
    const preferredMonth = preferredFriday.slice(0, 7);
    const firstOpenMonth = slots
      .find((slot) => slot.state === "available")
      ?.date.slice(0, 7);
    const openingMonth = preferredMonth || firstOpenMonth || monthKeys[0];
    setMonthIndex(Math.max(monthKeys.indexOf(openingMonth), 0));
  }, [monthKeys, preferredFriday, slots]);

  useEffect(() => {
    if (!preferredFriday) setTarget("preferred");
  }, [preferredFriday]);

  function chooseFriday(date: string) {
    if (target === "preferred") {
      onPreferredChange(date);
      if (date === alternateFriday) onAlternateChange("");
      setTarget("alternate");
      return;
    }

    if (date !== preferredFriday) onAlternateChange(date);
  }

  function clearDates() {
    onPreferredChange("");
    onAlternateChange("");
    setTarget("preferred");
  }

  if (loading) {
    return (
      <div className={styles.loading} role="status" aria-label="Loading availability">
        <div className={styles.loadingHeader} />
        <div className={styles.loadingGrid} aria-hidden="true">
          {Array.from({ length: 42 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <span className={styles.loadingText}>Finding open dates...</span>
      </div>
    );
  }

  if (monthKeys.length === 0) {
    return (
      <div className={styles.unavailable} role="status">
        <div>
          <strong>Availability is temporarily unavailable.</strong>
          <span>You can retry or send the proposal without choosing a date.</span>
        </div>
        <button type="button" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  const currentMonth = monthKeys[monthIndex];
  const days = calendarDays(currentMonth);
  const choosingAlternate = target === "alternate" && Boolean(preferredFriday);

  return (
    <div className={styles.picker}>
      <input type="hidden" name="preferredFriday" value={preferredFriday} />
      <input type="hidden" name="alternateFriday" value={alternateFriday} />

      <div className={styles.selectionRail} role="group" aria-label="Date preference">
        <button
          type="button"
          className={`${styles.selection} ${target === "preferred" ? styles.selectionActive : ""}`}
          aria-pressed={target === "preferred"}
          onClick={() => setTarget("preferred")}
        >
          <span className={styles.selectionNumber}>1</span>
          <span>
            <small>Preferred</small>
            <strong>{shortDate(preferredFriday, "Choose a date")}</strong>
          </span>
        </button>
        <button
          type="button"
          className={`${styles.selection} ${target === "alternate" ? styles.selectionActive : ""}`}
          aria-pressed={target === "alternate"}
          disabled={!preferredFriday}
          onClick={() => setTarget("alternate")}
        >
          <span className={styles.selectionNumber}>2</span>
          <span>
            <small>Alternate <em>optional</em></small>
            <strong>{shortDate(alternateFriday, "Add date")}</strong>
          </span>
        </button>
      </div>

      <div className={styles.calendar}>
        <div className={styles.monthHeader}>
          <div>
            <span className={styles.monthKicker}>Available dates</span>
            <strong aria-live="polite">{monthLabel(currentMonth)}</strong>
          </div>
          <div className={styles.monthControls}>
            <button
              type="button"
              aria-label="Previous month"
              disabled={monthIndex === 0}
              onClick={() => setMonthIndex((current) => Math.max(current - 1, 0))}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              aria-label="Next month"
              disabled={monthIndex === monthKeys.length - 1}
              onClick={() =>
                setMonthIndex((current) => Math.min(current + 1, monthKeys.length - 1))
              }
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className={styles.weekdays} aria-hidden="true">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <span key={`${day}-${index}`} className={index === 5 ? styles.fridayHeading : ""}>
              {day}
            </span>
          ))}
        </div>

        <div className={styles.days} aria-label={`${monthLabel(currentMonth)} calendar`}>
          {days.map((day) => {
            const slot = slotByDate.get(day.date);
            const isAvailable = slot?.state === "available";
            const isPreferred = day.date === preferredFriday;
            const isAlternate = day.date === alternateFriday;

            if (!day.inMonth) {
              return <span key={day.date} className={styles.outsideDay} aria-hidden="true" />;
            }

            if (!slot) {
              return (
                <span key={day.date} className={styles.passiveDay} aria-hidden="true">
                  {day.day}
                </span>
              );
            }

            const selectedText = isPreferred
              ? " Selected as preferred."
              : isAlternate
                ? " Selected as alternate."
                : "";

            return (
              <button
                key={day.date}
                type="button"
                className={`${styles.friday} ${styles[`state_${slot.state}`]} ${
                  isPreferred ? styles.preferred : ""
                } ${isAlternate ? styles.alternate : ""}`}
                aria-label={`${slot.label}. ${slot.detail}.${selectedText}`}
                aria-pressed={isPreferred || isAlternate}
                disabled={!isAvailable}
                title={`${slot.label} · ${slot.detail}`}
                onClick={() => chooseFriday(day.date)}
              >
                <span>{day.day}</span>
                <i aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className={styles.calendarFooter}>
          <div className={styles.legend} aria-label="Calendar key">
            <span><i className={styles.openDot} /> Open</span>
            <span><i className={styles.unavailableDot} /> Unavailable</span>
          </div>
          {preferredFriday && (
            <button type="button" className={styles.clear} onClick={clearDates}>
              Clear dates
            </button>
          )}
        </div>
      </div>

      <p className={styles.guidance} aria-live="polite">
        {choosingAlternate
          ? alternateFriday
            ? "Alternate selected. Choose another date to change it."
            : "Preferred date selected. Add an alternate, or continue without one."
          : "Choose your preferred open date."}
      </p>
    </div>
  );
}
