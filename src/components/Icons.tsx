/**
 * Arayüz ikonları.
 *
 * Hepsi 24'lük ızgarada, 2px konturlu, yuvarlak uçlu — Muiget'in Icons.tsx
 * dosyasıyla aynı çizim dili. Renk `currentcolor`, boyut CSS'ten
 * (`.dugme svg`); ikonun kendi içinde renk/boyut sabiti yok.
 *
 * Ürün marka işaretleri burada DEĞİL: onlar public/icons/*.svg altında,
 * çünkü kartta <img> ile geliyorlar ve her ürünün kendi deposundaki
 * favicon'uyla aynı yol olmaları gerekiyor.
 */

interface IconProps {
  className?: string;
}

const ortak = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentcolor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function IconDownload({ className }: IconProps) {
  return (
    <svg {...ortak} className={className}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function IconExternal({ className }: IconProps) {
  return (
    <svg {...ortak} className={className}>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export function IconStore({ className }: IconProps) {
  return (
    <svg {...ortak} className={className}>
      <path d="M4 4h16l-1 5H5L4 4Z" />
      <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg {...ortak} className={className}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function IconGlobe({ className }: IconProps) {
  return (
    <svg {...ortak} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z" />
    </svg>
  );
}

export function IconLock({ className }: IconProps) {
  return (
    <svg {...ortak} className={className}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconGeri({ className }: IconProps) {
  return (
    <svg {...ortak} className={className}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}

export function IconSun({ className }: IconProps) {
  return (
    <svg {...ortak} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function IconMoon({ className }: IconProps) {
  return (
    <svg {...ortak} className={className}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}
