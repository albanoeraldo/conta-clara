export type AvatarOption = {
  key: string;
  url: string;
  label: string;
};

export const avatarOptions: AvatarOption[] = [
  {
    key: "eraldo-1",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eraldo&backgroundColor=b6e3f4",
    label: "Avatar 1",
  },
  {
    key: "eraldo-2",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c0aede",
    label: "Avatar 2",
  },
  {
    key: "eraldo-3",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=d1d4f9",
    label: "Avatar 3",
  },
  {
    key: "eraldo-4",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simon&backgroundColor=ffd5dc",
    label: "Avatar 4",
  },
  {
    key: "eraldo-5",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leah&backgroundColor=ffdfbf",
    label: "Avatar 5",
  },
  {
    key: "eraldo-6",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=c0aede",
    label: "Avatar 6",
  },
  {
    key: "eraldo-7",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper&backgroundColor=b6e3f4",
    label: "Avatar 7",
  },
  {
    key: "eraldo-8",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cali&backgroundColor=ffdfbf",
    label: "Avatar 8",
  },
  {
    key: "eraldo-9",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco&backgroundColor=ffd5dc",
    label: "Avatar 9",
  },
  {
    key: "eraldo-10",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight&backgroundColor=d1d4f9",
    label: "Avatar 10",
  },
];

export function getAvatarOption(key?: string | null): AvatarOption {
  if (!key) return avatarOptions[0];
  const option = avatarOptions.find((opt) => opt.key === key);
  return option || avatarOptions[0];
}
