import { getAvatarOption } from "@/components/profile/avatar-options";

type UserAvatarProps = {
  avatarKey?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | string;
  fallbackTone?: "dark" | "light" | string;
  className?: string;
};

// Mapeamento simples de tamanhos padrões
const sizeClasses: Record<string, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function UserAvatar({
  avatarKey,
  name,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const avatar = getAvatarOption(avatarKey);
  const sizeClass = sizeClasses[size] || size;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 ${sizeClass} ${className}`}
      title={name || "Avatar do usuário"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatar.url}
        alt={name || avatar.label}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
