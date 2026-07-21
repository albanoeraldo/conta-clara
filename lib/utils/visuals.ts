// lib/utils/visuals.ts

import {
  LucideIcon,
  BriefcaseBusiness,
  Car,
  CircleDollarSign,
  Clapperboard,
  CreditCard,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Lightbulb,
  PawPrint,
  PiggyBank,
  Receipt,
  ShoppingCart,
  Smartphone,
  Utensils,
  Wifi,
} from "lucide-react";

import type { IconType } from "react-icons";

import {
  SiIfood,
  SiUber,
  SiNetflix,
  SiSpotify,
  SiNubank,
  SiShopee,
  SiMercadopago,
} from "react-icons/si";

import { FaAmazon } from "react-icons/fa";

// Substitua pelo caminho correto da sua tipagem de Category, se necessário
import type { Category } from "@/services/categories";

export function getTransactionVisuals(
  description: string = "",
  category?: Category | null,
  transactionType: "income" | "expense" = "expense",
) {
  const descNormalizada = description
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // 1. Tenta encontrar marcas reais pela descrição primeiro
  if (descNormalizada.includes("ifood"))
    return { icon: SiIfood, colors: "bg-red-50 text-[#EA1D2C]" };
  if (descNormalizada.includes("uber"))
    return { icon: SiUber, colors: "bg-slate-100 text-black" };
  if (descNormalizada.includes("netflix"))
    return { icon: SiNetflix, colors: "bg-black text-[#E50914]" };
  if (descNormalizada.includes("spotify"))
    return { icon: SiSpotify, colors: "bg-[#191414] text-[#1DB954]" };
  if (descNormalizada.includes("amazon") || descNormalizada.includes("prime"))
    return { icon: FaAmazon, colors: "bg-orange-50 text-[#FF9900]" };
  if (descNormalizada.includes("shopee"))
    return { icon: SiShopee, colors: "bg-orange-50 text-[#EE4D2D]" };
  if (descNormalizada.includes("nubank") || descNormalizada.includes("nu"))
    return { icon: SiNubank, colors: "bg-purple-50 text-[#8A05BE]" };
  if (
    descNormalizada.includes("mercado livre") ||
    descNormalizada.includes("mercado pago")
  )
    return { icon: SiMercadopago, colors: "bg-yellow-50 text-[#009EE3]" };

  // 2. Fallback: Lógica de Categorias Originais com Cores Customizadas (baseado no seu layout)
  let Icon: LucideIcon | IconType =
    transactionType === "income" ? CircleDollarSign : Receipt;
  let colors =
    transactionType === "income"
      ? "bg-green-50 text-green-600"
      : "bg-red-50 text-red-500";

  if (category) {
    const catName = category.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (category.type === "income") {
      colors = "bg-green-50 text-green-600";
      if (catName.includes("salario") || catName.includes("comissao"))
        Icon = BriefcaseBusiness;
      else if (catName.includes("invest") || catName.includes("rendimento"))
        Icon = PiggyBank;
    } else {
      // Mapeamento visual matching o seu print do painel de categorias
      if (catName.includes("mercado") || catName.includes("compras")) {
        Icon = ShoppingCart;
        colors = "bg-red-50 text-red-500";
      } else if (catName.includes("assinatura")) {
        Icon = Clapperboard;
        colors = "bg-purple-50 text-purple-500";
      } else if (catName.includes("cartao") || catName.includes("credito")) {
        Icon = CreditCard;
        colors = "bg-purple-50 text-purple-500";
      } else if (
        catName.includes("moradia") ||
        catName.includes("casa") ||
        catName.includes("aluguel")
      ) {
        Icon = Home;
        colors = "bg-orange-50 text-orange-500";
      } else if (catName.includes("internet") || catName.includes("wifi")) {
        Icon = Wifi;
        colors = "bg-blue-50 text-blue-500";
      } else if (catName.includes("estudo") || catName.includes("curso")) {
        Icon = GraduationCap;
        colors = "bg-red-50 text-red-500";
      } else if (
        catName.includes("alimentacao") ||
        catName.includes("restaurante")
      ) {
        Icon = Utensils;
        colors = "bg-orange-50 text-orange-500";
      } else if (catName.includes("celular")) {
        Icon = Smartphone;
        colors = "bg-blue-50 text-blue-500";
      } else if (catName.includes("energia") || catName.includes("luz")) {
        Icon = Lightbulb;
        colors = "bg-yellow-50 text-yellow-600";
      } else if (catName.includes("transporte") || catName.includes("carro")) {
        Icon = Car;
        colors = "bg-yellow-50 text-yellow-600";
      } else if (catName.includes("pet") || catName.includes("animal")) {
        Icon = PawPrint;
        colors = "bg-red-50 text-red-400";
      } else if (catName.includes("saude") || catName.includes("farmacia")) {
        Icon = HeartPulse;
        colors = "bg-red-50 text-red-500";
      } else if (catName.includes("presente")) {
        Icon = Gift;
        colors = "bg-pink-50 text-pink-500";
      } else if (catName.includes("banco") || catName.includes("taxa")) {
        Icon = Landmark;
        colors = "bg-slate-100 text-slate-600";
      }
    }
  }

  return { icon: Icon, colors };
}
