type IconProps = { className?: string };

export function LogoMark({ className = "size-11" }: IconProps) {
  return (
    <span className={`relative grid ${className} place-items-center`}>
      <svg viewBox="0 0 64 28" className="absolute -top-2 h-3 w-7 text-[#c4923a]" aria-hidden="true">
        <path fill="currentColor" d="M6 22 12 8l10 8L32 2l10 14 10-8 6 14H6z" />
        <circle cx="12" cy="8" r="2.2" />
        <circle cx="32" cy="3" r="2.2" />
        <circle cx="52" cy="8" r="2.2" />
      </svg>
      <span className="grid size-full place-items-center rounded-full bg-maroon font-display text-[11px] font-semibold tracking-[0.08em] text-[#fffaf3] shadow-[inset_0_0_0_1.5px_#e6c27a]">
        RKN
      </span>
    </span>
  );
}

export function VegMark({ label }: { label: string }) {
  return (
    <span className="veg-mark" role="img" aria-label={label}>
      <span />
    </span>
  );
}

export function PhoneIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3.8h2.8l1.1 2.8-1.7 1a12 12 0 0 0 5.2 5.2l1-1.7 2.8 1.1V17a1.8 1.8 0 0 1-2 1.8A15.2 15.2 0 0 1 5.2 7.8 1.8 1.8 0 0 1 7 5.8" />
    </svg>
  );
}

export function ChatIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 3.5c-5 0-8.5 3.3-8.5 7.4 0 2.3 1.3 4.4 3.4 5.8L6 20.2l3.4-1.5c.8.2 1.7.3 2.6.3 5 0 8.5-3.3 8.5-7.4S17 3.5 12 3.5z" />
    </svg>
  );
}

export function CartIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 6h15l-1.4 8.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.5L5 6z" />
      <path strokeLinecap="round" d="M5 6 4.2 3.5H2.5" />
      <circle cx="9" cy="19.2" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19.2" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SearchIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.2" />
      <path strokeLinecap="round" d="M16 16.5 20 20.5" />
    </svg>
  );
}

export function PinIcon({ className = "size-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6.5-5.2 6.5-10A6.5 6.5 0 0 0 5.5 11c0 4.8 6.5 10 6.5 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}
