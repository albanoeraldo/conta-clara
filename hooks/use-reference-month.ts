"use client";

import { useCallback, useEffect, useState } from "react";

const REFERENCE_MONTH_STORAGE_KEY = "conta-clara:reference-month";
const REFERENCE_MONTH_EVENT = "conta-clara:reference-month-change";

export function getCurrentMonthValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function isValidReferenceMonth(
  value: string | null | undefined,
): value is string {
  if (!value) {
    return false;
  }

  return /^\d{4}-\d{2}$/.test(value);
}

function getInitialReferenceMonth() {
  if (typeof window === "undefined") {
    return getCurrentMonthValue();
  }

  const storedReferenceMonth = window.localStorage.getItem(
    REFERENCE_MONTH_STORAGE_KEY,
  );

  if (isValidReferenceMonth(storedReferenceMonth)) {
    return storedReferenceMonth;
  }

  return getCurrentMonthValue();
}

export function formatReferenceMonthLabel(referenceMonth: string) {
  if (!isValidReferenceMonth(referenceMonth)) {
    return "";
  }

  const [yearValue, monthValue] = referenceMonth.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue) - 1;

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

export function useReferenceMonth() {
  const [referenceMonth, setReferenceMonthState] = useState(
    getInitialReferenceMonth,
  );

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (
        event.key === REFERENCE_MONTH_STORAGE_KEY &&
        isValidReferenceMonth(event.newValue)
      ) {
        setReferenceMonthState(event.newValue);
      }
    }

    function handleReferenceMonthEvent(event: Event) {
      const nextReferenceMonth = (event as CustomEvent<unknown>).detail;

      if (
        typeof nextReferenceMonth === "string" &&
        isValidReferenceMonth(nextReferenceMonth)
      ) {
        setReferenceMonthState(nextReferenceMonth);
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(REFERENCE_MONTH_EVENT, handleReferenceMonthEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        REFERENCE_MONTH_EVENT,
        handleReferenceMonthEvent,
      );
    };
  }, []);

  const setReferenceMonth = useCallback((nextReferenceMonth: string) => {
    if (!isValidReferenceMonth(nextReferenceMonth)) {
      return;
    }

    setReferenceMonthState(nextReferenceMonth);

    window.localStorage.setItem(
      REFERENCE_MONTH_STORAGE_KEY,
      nextReferenceMonth,
    );

    window.dispatchEvent(
      new CustomEvent(REFERENCE_MONTH_EVENT, {
        detail: nextReferenceMonth,
      }),
    );
  }, []);

  const resetReferenceMonth = useCallback(() => {
    const currentMonth = getCurrentMonthValue();

    setReferenceMonth(currentMonth);
  }, [setReferenceMonth]);

  return {
    referenceMonth,
    setReferenceMonth,
    resetReferenceMonth,
    referenceMonthLabel: formatReferenceMonthLabel(referenceMonth),
  };
}
