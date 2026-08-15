export default function Logo({ size = 32, withText = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="2" y="2" width="36" height="36" rx="9" fill="currentColor" className="text-pine-700" />
        <path
          d="M6 30.5 L14 13.5 L21.5 22 L26.5 15.5 L34 30.5 Z"
          fill="#fd6a0e"
        />
        <circle cx="26.5" cy="15.5" r="2.4" fill="#faf7f2" />
      </svg>
      {withText && (
        <span className="font-display text-lg font-extrabold uppercase tracking-tight leading-none">
          Trailblaze
        </span>
      )}
    </span>
  )
}
