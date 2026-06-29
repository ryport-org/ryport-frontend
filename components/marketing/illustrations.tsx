import { cn } from "@/lib/utils";

type IllustrationProps = {
  className?: string;
};

/** Shared inset frame drawn inside every illustration SVG */
function IllustrationCanvas({
  children,
  className,
  width = 240,
  height = 180,
}: IllustrationProps & { width?: number; height?: number; children: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}

export function IllustrationUnderstand({ className }: IllustrationProps) {
  return (
    <IllustrationCanvas className={className}>
      <rect x="16" y="16" width="208" height="148" rx="14" fill="#EAF2FF" stroke="#E2E5EB" />
      <text x="32" y="44" fill="#13171F" fontSize="11" fontFamily="system-ui" fontWeight="600">
        Spending breakdown
      </text>
      <rect x="32" y="56" width="64" height="8" rx="4" fill="#3D8BFF" opacity="0.35" />
      <rect x="32" y="72" width="176" height="6" rx="3" fill="#8A93A3" opacity="0.35" />
      <rect x="32" y="86" width="140" height="6" rx="3" fill="#8A93A3" opacity="0.25" />
      <path
        d="M32 132 L72 116 L108 124 L148 100 L192 108"
        stroke="#3D8BFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="72" cy="116" r="4" fill="#3D8BFF" />
      <circle cx="148" cy="100" r="4" fill="#3D8BFF" />
    </IllustrationCanvas>
  );
}

export function IllustrationManage({ className }: IllustrationProps) {
  return (
    <IllustrationCanvas className={className}>
      <rect x="16" y="16" width="208" height="148" rx="14" fill="white" stroke="#E2E5EB" />
      <text x="32" y="44" fill="#13171F" fontSize="11" fontFamily="system-ui" fontWeight="600">
        Budget limits
      </text>
      <rect x="32" y="60" width="176" height="14" rx="7" fill="#EAF2FF" />
      <rect x="32" y="60" width="112" height="14" rx="7" fill="#3D8BFF" opacity="0.7" />
      <rect x="32" y="86" width="176" height="14" rx="7" fill="#EAF2FF" />
      <rect x="32" y="86" width="64" height="14" rx="7" fill="#3D8BFF" opacity="0.5" />
      <rect x="32" y="112" width="176" height="14" rx="7" fill="#EAF2FF" />
      <rect x="32" y="112" width="152" height="14" rx="7" fill="#E8604C" opacity="0.55" />
    </IllustrationCanvas>
  );
}

export function IllustrationGrow({ className }: IllustrationProps) {
  return (
    <IllustrationCanvas className={className}>
      <rect x="16" y="16" width="208" height="148" rx="14" fill="#13171F" />
      <rect x="148" y="32" width="60" height="24" rx="12" fill="#3D8BFF" opacity="0.25" />
      <text x="156" y="48" fill="#3D8BFF" fontSize="9" fontFamily="system-ui">
        AI CFO
      </text>
      <text x="32" y="52" fill="#EAF2FF" fontSize="10" fontFamily="system-ui">
        Runway forecast
      </text>
      <text x="32" y="84" fill="white" fontSize="24" fontFamily="Georgia">
        11 weeks
      </text>
      <path
        d="M32 136 L60 124 L92 130 L128 106 L164 114 L200 92"
        stroke="#3D8BFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="200" cy="92" r="3.5" fill="#3D8BFF" />
    </IllustrationCanvas>
  );
}

export function IllustrationBankConnect({ className }: IllustrationProps) {
  return (
    <IllustrationCanvas className={className} width={200} height={180}>
      <circle cx="100" cy="90" r="64" fill="#EAF2FF" />
      <rect x="62" y="68" width="76" height="52" rx="8" fill="white" stroke="#3D8BFF" strokeWidth="1.5" />
      <path
        d="M72 82 H128 M72 94 H116 M72 106 H100"
        stroke="#8A93A3"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="148" cy="68" r="16" fill="#3D8BFF" />
      <path
        d="M141 68 L146 73 L155 63"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IllustrationCanvas>
  );
}

export function IllustrationAiChat({ className }: IllustrationProps) {
  return (
    <IllustrationCanvas className={className} width={240} height={180}>
      <rect x="16" y="20" width="148" height="44" rx="14" fill="white" stroke="#E2E5EB" />
      <text x="32" y="48" fill="#8A93A3" fontSize="10" fontFamily="system-ui">
        Where did my money go?
      </text>
      <rect x="72" y="76" width="152" height="72" rx="14" fill="#EAF2FF" stroke="#3D8BFF" strokeWidth="1" />
      <text x="88" y="100" fill="#13171F" fontSize="10" fontFamily="system-ui">
        Food: ₦40,000 (45%)
      </text>
      <text x="88" y="118" fill="#13171F" fontSize="10" fontFamily="system-ui">
        Transport: ₦18,500
      </text>
      <text x="88" y="136" fill="#3D8BFF" fontSize="9" fontFamily="system-ui" fontWeight="600">
        Top category this month
      </text>
    </IllustrationCanvas>
  );
}

export function IllustrationCfo({ className }: IllustrationProps) {
  return (
    <IllustrationCanvas className={className}>
      <rect x="16" y="16" width="208" height="148" rx="14" fill="white" stroke="#E2E5EB" />
      <rect x="32" y="36" width="88" height="48" rx="10" fill="#EAF2FF" />
      <text x="44" y="56" fill="#8A93A3" fontSize="8" fontFamily="system-ui">
        Revenue
      </text>
      <text x="44" y="76" fill="#13171F" fontSize="15" fontFamily="Georgia">
        ₦2.4M
      </text>
      <rect x="128" y="36" width="80" height="48" rx="10" fill="#13171F" />
      <text x="140" y="56" fill="#8A93A3" fontSize="8" fontFamily="system-ui">
        Margin
      </text>
      <text x="140" y="76" fill="white" fontSize="15" fontFamily="Georgia">
        31%
      </text>
      <rect x="32" y="96" width="176" height="44" rx="10" fill="#EAF2FF" />
      <text x="44" y="122" fill="#13171F" fontSize="9" fontFamily="system-ui">
        Shipping costs up 34%
      </text>
    </IllustrationCanvas>
  );
}
