import { avatarOptions } from "@/components/profile/avatar-options";
import { UserAvatar } from "@/components/profile/user-avatar";

type AvatarPickerProps = {
  value: string | null;
  userName: string;
  onChange: (avatarKey: string | null) => void;
};

export function AvatarPicker({ value, userName, onChange }: AvatarPickerProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar avatarKey={value} name={userName} size="xl" />

          <div>
            <p className="text-sm font-black text-slate-950">
              Avatar do perfil
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Escolha um avatar pronto para personalizar sua Conta Clara.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-100"
        >
          Usar inicial
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {avatarOptions.map((avatar) => {
          const Icon = avatar.icon;
          const isSelected = value === avatar.key;

          return (
            <button
              key={avatar.key}
              type="button"
              title={avatar.label}
              aria-label={`Selecionar avatar ${avatar.label}`}
              aria-pressed={isSelected}
              onClick={() => onChange(avatar.key)}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-3xl border bg-white p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                isSelected
                  ? "border-blue-500 shadow-md ring-4 ring-blue-100"
                  : "border-slate-200 hover:border-blue-100"
              }`}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: avatar.backgroundColor,
                  borderColor: avatar.borderColor,
                  color: avatar.iconColor,
                }}
              >
                <Icon size={26} weight="duotone" />
              </div>

              <span className="line-clamp-2 text-[11px] leading-4 font-black text-slate-600">
                {avatar.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Depois de escolher, clique em <strong>Salvar perfil</strong> para
        aplicar no menu.
      </p>
    </section>
  );
}
