import { getAvatarOption } from "@/components/profile/avatar-options";

type UserAvatarProps = {
  avatarKey?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackTone?: "light" | "dark";
  className?: string;
};

const sizeClasses = {
  sm: {
    wrapper: "h-10 w-10 rounded-2xl",
    icon: 22,
    text: "text-sm",
  },
  md: {
    wrapper: "h-12 w-12 rounded-2xl",
    icon: 25,
    text: "text-base",
  },
  lg: {
    wrapper: "h-14 w-14 rounded-3xl",
    icon: 30,
    text: "text-lg",
  },
  xl: {
    wrapper: "h-20 w-20 rounded-[2rem]",
    icon: 42,
    text: "text-2xl",
  },
};

function getInitial(name?: string | null) {
  const cleanName = name?.trim();

  if (!cleanName) {
    return "U";
  }

  return cleanName.charAt(0).toUpperCase();
}

export function UserAvatar({
  avatarKey,
  name,
  size = "md",
  fallbackTone = "light",
  className = "",
}: UserAvatarProps) {
  const avatar = getAvatarOption(avatarKey);
  const sizeConfig = sizeClasses[size];

  if (!avatar) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center border font-black shadow-sm ring-1 ${
          sizeConfig.wrapper
        } ${sizeConfig.text} ${
          fallbackTone === "dark"
            ? "border-white/10 bg-white/15 text-white ring-white/20"
            : "border-slate-200 bg-slate-100 text-slate-700 ring-slate-200"
        } ${className}`}
      >
        {getInitial(name)}
      </div>
    );
  }

  const Icon = avatar.icon;

  return (
    <div
      className={`flex shrink-0 items-center justify-center border shadow-sm ring-1 ring-white/70 ${sizeConfig.wrapper} ${className}`}
      style={{
        backgroundColor: avatar.backgroundColor,
        borderColor: avatar.borderColor,
        color: avatar.iconColor,
      }}
      title={avatar.label}
    >
      <Icon size={sizeConfig.icon} weight="duotone" />
    </div>
  );
}
