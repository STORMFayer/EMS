export function Pulse({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-[1] ${className ?? ''}`}>
      <div className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-red/25 blur-[100px] animate-siren-red" />
      <div className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-cyan/20 blur-[100px] animate-siren-blue" />
      <svg className="absolute bottom-[18%] left-0 w-[200%] opacity-20" viewBox="0 0 1000 80" preserveAspectRatio="none">
        <path
          d="M0 40 H360 L390 10 L420 70 L450 40 H1000 H1360 L1390 10 L1420 70 L1450 40 H2000"
          fill="none"
          stroke="#ff5566"
          strokeWidth="2"
          strokeDasharray="2000"
          className="animate-pulse-line"
        />
      </svg>
    </div>
  )
}
