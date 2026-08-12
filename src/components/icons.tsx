// 여러 화면에서 복붙되던 공용 아이콘 (size/color 파라미터화)

// 사람(익명 프사·프로필) — 40 viewBox 기준, 어떤 크기로도 스케일됨
export function PersonIcon({ size = 40, color = '#99A1AF' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M31.6658 34.9998V31.6665C31.6658 29.8984 30.9635 28.2028 29.7132 26.9526C28.463 25.7024 26.7674 25 24.9993 25H14.9995C13.2315 25 11.5358 25.7024 10.2856 26.9526C9.03537 28.2028 8.33301 29.8984 8.33301 31.6665V34.9998" stroke={color} strokeWidth="2.49994" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.9995 18.333C23.6813 18.333 26.666 15.3483 26.666 11.6665C26.666 7.9847 23.6813 5 19.9995 5C16.3177 5 13.333 7.9847 13.333 11.6665C13.333 15.3483 16.3177 18.333 19.9995 18.333Z" stroke={color} strokeWidth="2.49994" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
