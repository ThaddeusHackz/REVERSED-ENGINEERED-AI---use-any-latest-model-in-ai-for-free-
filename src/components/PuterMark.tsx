interface PuterMarkProps {
  size?: number
  className?: string
  color?: string
}

export default function PuterMark({ size = 48, className, color = '#444444' }: PuterMarkProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform="matrix(0 1 -1 0 47.999504 .000014)" stroke={color} strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
        <polyline points="39 24 25 24 25 28" />
        <polyline points="35.879 10.121 32 14 25 14 25 18" />
        <path d="M13 26a10.29 10.29 0 0 1-7.2-3" />
        <path d="M17 31.6A5.826 5.826 0 0 1 13 26a5.731 5.731 0 0 1 2-4.4" />
        <path d="M35.879 37.879 32 34H25v2A9.9 9.9 0 0 1 15 46 9.9 9.9 0 0 1 5 36a9.058 9.058 0 0 1 .6-3.2A5.627 5.627 0 0 1 3 28a5.888 5.888 0 0 1 2.8-5A9.994 9.994 0 0 1 3 16 9.9 9.9 0 0 1 13 6h.4A5.826 5.826 0 0 1 19 2a5.893 5.893 0 0 1 6 6" />
        <circle cx="38" cy="8" r="3" />
        <circle cx="42" cy="24" r="3" />
        <circle cx="38" cy="40" r="3" />
      </g>
    </svg>
  )
}
