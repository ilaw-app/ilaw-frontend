import type { ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TabBar.css';

// 탭 아이콘 — stroke는 currentColor로, tab-item 색(비활성 #99A1AF / 활성 #B2D36E)을 상속
function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M14.9983 20.9969V12.9979C14.9983 12.7327 14.8929 12.4784 14.7054 12.2909C14.5179 12.1034 14.2636 11.998 13.9984 11.998H9.9989C9.73372 11.998 9.47939 12.1034 9.29188 12.2909C9.10437 12.4784 8.99902 12.7327 8.99902 12.9979V20.9969" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 9.99848C2.99993 9.70758 3.06333 9.42017 3.18576 9.1563C3.3082 8.89243 3.48674 8.65844 3.70891 8.47067L10.708 2.47242C11.069 2.16737 11.5263 2 11.9989 2C12.4715 2 12.9288 2.16737 13.2897 2.47242L20.2888 8.47067C20.511 8.65844 20.6895 8.89243 20.812 9.1563C20.9344 9.42017 20.9978 9.70758 20.9977 9.99848V18.9974C20.9977 19.5277 20.7871 20.0364 20.412 20.4114C20.037 20.7864 19.5284 20.9971 18.998 20.9971H4.99975C4.46938 20.9971 3.96074 20.7864 3.58571 20.4114C3.21069 20.0364 3 19.5277 3 18.9974V9.99848Z" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ManualIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M11.998 7V20.9983" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.99987 17.9981C2.73469 17.9981 2.48037 17.8928 2.29286 17.7053C2.10534 17.5178 2 17.2634 2 16.9982V3.99987C2 3.73469 2.10534 3.48037 2.29286 3.29286C2.48037 3.10534 2.73469 3 2.99987 3H7.99925C9.05998 3 10.0773 3.42137 10.8273 4.17143C11.5774 4.92148 11.9987 5.93877 11.9987 6.9995C11.9987 5.93877 12.4201 4.92148 13.1702 4.17143C13.9202 3.42137 14.9375 3 15.9982 3H20.9976C21.2628 3 21.5171 3.10534 21.7046 3.29286C21.8922 3.48037 21.9975 3.73469 21.9975 3.99987V16.9982C21.9975 17.2634 21.8922 17.5178 21.7046 17.7053C21.5171 17.8928 21.2628 17.9981 20.9976 17.9981H14.9984C14.2028 17.9981 13.4399 18.3142 12.8773 18.8767C12.3148 19.4392 11.9987 20.2022 11.9987 20.9977C11.9987 20.2022 11.6827 19.4392 11.1202 18.8767C10.5576 18.3142 9.79467 17.9981 8.99912 17.9981H2.99987Z" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function QnaIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7.89926 19.9979C9.8076 20.9769 12.0028 21.242 14.0894 20.7456C16.1759 20.2492 18.0166 19.0239 19.2796 17.2904C20.5426 15.557 21.145 13.4295 20.9782 11.2912C20.8114 9.15289 19.8863 7.1445 18.3698 5.62791C16.8532 4.11132 14.8448 3.18627 12.7065 3.01946C10.5682 2.85265 8.44067 3.45504 6.70723 4.71808C4.9738 5.98112 3.74847 7.82175 3.25207 9.90829C2.75566 11.9948 3.02081 14.1901 3.99975 16.0984L2 21.9977L7.89926 19.9979Z" stroke="currentColor" strokeWidth="2.49969" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function CommunityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15.9983 20.9973V18.9975C15.9983 17.9368 15.5769 16.9195 14.8268 16.1695C14.0768 15.4194 13.0595 14.998 11.9988 14.998H5.9995C4.93877 14.998 3.92148 15.4194 3.17143 16.1695C2.42137 16.9195 2 17.9368 2 18.9975V20.9973" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.99902 11C11.2082 11 12.999 9.20914 12.999 7C12.999 4.79086 11.2082 3 8.99902 3C6.78988 3 4.99902 4.79086 4.99902 7C4.99902 9.20914 6.78988 11 8.99902 11Z" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.998 20.9989V18.9989C21.9974 18.1126 21.7024 17.2517 21.1594 16.5512C20.6164 15.8508 19.8562 15.3505 18.998 15.1289" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.998 3.12891C16.8585 3.34921 17.6211 3.84961 18.1657 4.55122C18.7103 5.25283 19.0059 6.11574 19.0059 7.00391C19.0059 7.89208 18.7103 8.75499 18.1657 9.4566C17.6211 10.1582 16.8585 10.6586 15.998 10.8789" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function MyPageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M18.9973 20.9973V18.9975C18.9973 17.9368 18.5759 16.9195 17.8258 16.1695C17.0758 15.4194 16.0585 14.998 14.9978 14.998H8.99852C7.93779 14.998 6.9205 15.4194 6.17045 16.1695C5.4204 16.9195 4.99902 17.9368 4.99902 18.9975V20.9973" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.999 11C14.2082 11 15.999 9.20914 15.999 7C15.999 4.79086 14.2082 3 11.999 3C9.78988 3 7.99902 4.79086 7.99902 7C7.99902 9.20914 9.78988 11 11.999 11Z" stroke="currentColor" strokeWidth="1.79978" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type Tab = { path: string; title: string; Icon: () => ReactElement };

const TABS: Tab[] = [
  { path: '/home', title: '홈', Icon: HomeIcon },
  { path: '/manual', title: '매뉴얼', Icon: ManualIcon },
  { path: '/qna', title: 'Q&A', Icon: QnaIcon },
  { path: '/community', title: '커뮤니티', Icon: CommunityIcon },
  { path: '/profile', title: '마이페이지', Icon: MyPageIcon },
];

export default function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="tabbar">
      {TABS.map(({ path, title, Icon }) => {
        const active = pathname.startsWith(path);
        return (
          <button
            key={path}
            className={`tab ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <span className="tab-item">
              <Icon />
              <span className="tab-label">{title}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
