import type { IconType } from 'react-icons';

// 커뮤니티 공용 아이콘 (users 글리프). size/color는 react-icons와 동일 인터페이스.
const CommunityIcon: IconType = ({ size = 24, color = 'currentColor', ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21"
      stroke={color}
      strokeWidth="1.79996"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke={color}
      strokeWidth="1.79996"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 20.9999V18.9999C21.9993 18.1136 21.7044 17.2527 21.1614 16.5522C20.6184 15.8517 19.8581 15.3515 19 15.1299"
      stroke={color}
      strokeWidth="1.79996"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3.12988C16.8604 3.35018 17.623 3.85058 18.1676 4.55219C18.7122 5.2538 19.0078 6.11671 19.0078 7.00488C19.0078 7.89305 18.7122 8.75596 18.1676 9.45757C17.623 10.1592 16.8604 10.6596 16 10.8799"
      stroke={color}
      strokeWidth="1.79996"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CommunityIcon;
