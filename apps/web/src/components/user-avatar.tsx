import Image from "next/image";

type UserAvatarProps = {
  name: string;
  photo?: string;
  size?: number;
  className?: string;
};

function initials(name: string) {
  const value = name.trim();
  if (!value) return "S";
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function UserAvatar({ name, photo, size = 44, className = "" }: UserAvatarProps) {
  const style = { width: size, height: size };

  if (photo) {
    return <Image src={photo} alt={`${name}'s profile`} width={size} height={size} style={style} className={`flex-none rounded-full object-cover ring-2 ring-white shadow-sm ${className}`} />;
  }

  return (
    <span
      role="img"
      aria-label={`${name}'s profile placeholder`}
      style={style}
      className={`grid flex-none place-items-center rounded-full bg-gradient-to-br from-teal-100 via-emerald-50 to-cyan-100 text-sm font-extrabold text-accent-deep ring-2 ring-white shadow-sm ${className}`}
    >
      {initials(name)}
    </span>
  );
}
