import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import {
  BankIcon,
  BriefcaseIcon,
  CarIcon,
  CreditCardIcon,
  CurrencyCircleDollarIcon,
  GraduationCapIcon,
  HeartbeatIcon,
  HouseIcon,
  LightbulbIcon,
  PawPrintIcon,
  PiggyBankIcon,
  ReceiptIcon,
  ShoppingCartIcon,
} from "@phosphor-icons/react";

export type AvatarOption = {
  key: string;
  label: string;
  icon: ComponentType<IconProps>;
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
};

export const avatarOptions: AvatarOption[] = [
  {
    key: "blue-receipt",
    label: "Controle azul",
    icon: ReceiptIcon,
    backgroundColor: "#dbeafe",
    iconColor: "#2563eb",
    borderColor: "#93c5fd",
  },
  {
    key: "green-piggy",
    label: "Cofrinho verde",
    icon: PiggyBankIcon,
    backgroundColor: "#d1fae5",
    iconColor: "#059669",
    borderColor: "#6ee7b7",
  },
  {
    key: "purple-card",
    label: "Cartão roxo",
    icon: CreditCardIcon,
    backgroundColor: "#ede9fe",
    iconColor: "#7c3aed",
    borderColor: "#c4b5fd",
  },
  {
    key: "orange-house",
    label: "Casa laranja",
    icon: HouseIcon,
    backgroundColor: "#ffedd5",
    iconColor: "#ea580c",
    borderColor: "#fdba74",
  },
  {
    key: "pink-heart",
    label: "Cuidado rosa",
    icon: HeartbeatIcon,
    backgroundColor: "#fce7f3",
    iconColor: "#db2777",
    borderColor: "#f9a8d4",
  },
  {
    key: "yellow-car",
    label: "Transporte amarelo",
    icon: CarIcon,
    backgroundColor: "#fef3c7",
    iconColor: "#d97706",
    borderColor: "#fcd34d",
  },
  {
    key: "emerald-money",
    label: "Moeda verde",
    icon: CurrencyCircleDollarIcon,
    backgroundColor: "#ccfbf1",
    iconColor: "#0f766e",
    borderColor: "#5eead4",
  },
  {
    key: "indigo-bank",
    label: "Banco azul",
    icon: BankIcon,
    backgroundColor: "#e0e7ff",
    iconColor: "#4f46e5",
    borderColor: "#a5b4fc",
  },
  {
    key: "cyan-lightbulb",
    label: "Ideia clara",
    icon: LightbulbIcon,
    backgroundColor: "#cffafe",
    iconColor: "#0891b2",
    borderColor: "#67e8f9",
  },
  {
    key: "rose-pet",
    label: "Pet vermelho",
    icon: PawPrintIcon,
    backgroundColor: "#ffe4e6",
    iconColor: "#e11d48",
    borderColor: "#fda4af",
  },
  {
    key: "red-shopping",
    label: "Compras vermelho",
    icon: ShoppingCartIcon,
    backgroundColor: "#fee2e2",
    iconColor: "#dc2626",
    borderColor: "#fca5a5",
  },
  {
    key: "slate-work",
    label: "Trabalho cinza",
    icon: BriefcaseIcon,
    backgroundColor: "#f1f5f9",
    iconColor: "#475569",
    borderColor: "#cbd5e1",
  },
  {
    key: "blue-study",
    label: "Estudos azul",
    icon: GraduationCapIcon,
    backgroundColor: "#e0f2fe",
    iconColor: "#0284c7",
    borderColor: "#7dd3fc",
  },
];

export function getAvatarOption(avatarKey?: string | null) {
  if (!avatarKey) {
    return null;
  }

  return avatarOptions.find((avatar) => avatar.key === avatarKey) ?? null;
}
