export default function Emblem({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flex: "0 0 auto" }}
    >
      <circle cx="100" cy="100" r="92" fill="#ffffff" stroke="#1b3fae" strokeWidth="7" />
      <circle cx="142" cy="60" r="11" fill="#f6b21a" />
      <g fill="none" stroke="#1b3fae" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <rect x="118" y="88" width="26" height="40" />
        <rect x="146" y="72" width="20" height="56" />
        <line x1="125" y1="98" x2="137" y2="98" />
        <line x1="125" y1="110" x2="137" y2="110" />
        <line x1="152" y1="86" x2="160" y2="86" />
        <line x1="152" y1="100" x2="160" y2="100" />
        <line x1="152" y1="114" x2="160" y2="114" />
      </g>
      <g fill="none" stroke="#1b3fae" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="70" cy="76" r="16" />
        <path d="M70 92 v10" />
        <path d="M46 128 q24 -26 48 0" />
        <path d="M85 68 q16 8 11 30 q-3 12 -11 16" />
      </g>
      <g fill="none" stroke="#1b3fae" strokeWidth="5" strokeLinecap="round">
        <path d="M38 150 q10 -11 20 0 t20 0 t20 0 t20 0 t20 0" />
        <path d="M38 165 q10 -11 20 0 t20 0 t20 0 t20 0 t20 0" />
      </g>
    </svg>
  );
}
