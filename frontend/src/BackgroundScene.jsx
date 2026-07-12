export default function BackgroundScene() {
  return (
    <div className="bg-scene" aria-hidden="true">
      {/* dashed journey path with pins */}
      <svg className="scene-path" viewBox="0 0 1440 420" fill="none" preserveAspectRatio="xMidYMin slice">
        <path
          d="M -40 300 C 220 160, 420 340, 640 220 S 1040 80, 1280 190 S 1440 240, 1520 180"
          stroke="#4630A8" strokeOpacity="0.18" strokeWidth="2.5"
          strokeDasharray="2 12" strokeLinecap="round"
        />
        {/* location pins along the path */}
        <g opacity="0.35">
          <g transform="translate(220, 218)">
            <path d="M0 0 C-9 -14 -9 -26 0 -30 C9 -26 9 -14 0 0Z" fill="#4630A8" />
            <circle cx="0" cy="-22" r="3.4" fill="#FAF9FE" />
          </g>
          <g transform="translate(640, 218)">
            <path d="M0 0 C-9 -14 -9 -26 0 -30 C9 -26 9 -14 0 0Z" fill="#D9A62E" />
            <circle cx="0" cy="-22" r="3.4" fill="#FAF9FE" />
          </g>
          <g transform="translate(1120, 128)">
            <path d="M0 0 C-9 -14 -9 -26 0 -30 C9 -26 9 -14 0 0Z" fill="#4630A8" />
            <circle cx="0" cy="-22" r="3.4" fill="#FAF9FE" />
          </g>
        </g>
        {/* paper plane */}
        <g className="scene-plane" transform="translate(880, 150) rotate(14)" opacity="0.4">
          <path d="M0 0 L46 -12 L14 8 Z" fill="#4630A8" />
          <path d="M14 8 L46 -12 L20 16 Z" fill="#6B4FE0" />
        </g>
      </svg>

      {/* hot air balloon */}
      <svg className="scene-balloon" viewBox="0 0 120 170" fill="none">
        <ellipse cx="60" cy="52" rx="44" ry="50" fill="#6B4FE0" opacity="0.28" />
        <ellipse cx="60" cy="52" rx="26" ry="48" fill="#D9A62E" opacity="0.22" />
        <path d="M38 94 L50 122 L70 122 L82 94" stroke="#4630A8" strokeOpacity="0.3" strokeWidth="2" fill="none" />
        <rect x="48" y="122" width="24" height="18" rx="4" fill="#4630A8" opacity="0.3" />
      </svg>

      {/* clouds */}
      <svg className="scene-cloud scene-cloud-1" viewBox="0 0 160 60" fill="none">
        <path d="M20 45 Q20 25 40 25 Q45 8 65 12 Q80 0 95 12 Q120 8 122 28 Q140 30 138 45 Z" fill="#FFFFFF" opacity="0.55" />
      </svg>
      <svg className="scene-cloud scene-cloud-2" viewBox="0 0 160 60" fill="none">
        <path d="M20 45 Q20 25 40 25 Q45 8 65 12 Q80 0 95 12 Q120 8 122 28 Q140 30 138 45 Z" fill="#FFFFFF" opacity="0.45" />
      </svg>

      {/* mountain horizon */}
      <svg className="scene-mountains" viewBox="0 0 1440 190" fill="none" preserveAspectRatio="xMidYMax slice">
        <path d="M0 190 L0 130 L160 60 L300 140 L430 80 L560 150 L700 40 L860 140 L990 90 L1140 160 L1280 100 L1440 150 L1440 190 Z"
          fill="#4630A8" opacity="0.06" />
        <path d="M0 190 L0 160 L220 100 L380 165 L540 115 L760 175 L920 110 L1120 180 L1290 140 L1440 175 L1440 190 Z"
          fill="#241D4E" opacity="0.07" />
        {/* snow caps on the two tallest peaks */}
        <path d="M700 40 L676 62 L690 58 L700 66 L712 56 L724 62 Z" fill="#FFFFFF" opacity="0.5" />
        <path d="M160 60 L140 78 L152 74 L160 82 L170 73 L180 78 Z" fill="#FFFFFF" opacity="0.4" />
      </svg>
    </div>
  )
}