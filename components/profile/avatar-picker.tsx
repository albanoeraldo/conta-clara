"use client";

import { Check } from "lucide-react";
import { avatarOptions } from "@/components/profile/avatar-options";

type AvatarPickerProps = {
  value?: string | null;
  userName?: string | null;
  onChange: (key: string) => void;
};

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {avatarOptions.map((option) => {
        const isSelected = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 transition-all ${
              isSelected
                ? "border-blue-500 bg-blue-50"
                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={option.url}
                alt={option.label}
                className="h-full w-full object-cover"
              />
            </div>
            <span
              className={`text-xs font-semibold ${isSelected ? "text-blue-700" : "text-slate-500"}`}
            >
              {option.label}
            </span>

            {isSelected && (
              <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
                <Check className="h-4 w-4" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
