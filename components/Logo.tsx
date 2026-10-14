import Image from "next/image";

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/logo-mark.png" alt="" width={size} height={size} priority className="h-auto" style={{ width: size, height: size }} />
      <span className="text-[17px] font-bold tracking-tight">UniqueVerse</span>
    </span>
  );
}
