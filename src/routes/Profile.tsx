import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TabBar from '../components/TabBar';
import './profile.css';

const G = { stroke: '#99A1AF', strokeWidth: '1.24997', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function PersonIcon() {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <path d="M31.6658 34.9998V31.6665C31.6658 29.8984 30.9635 28.2028 29.7132 26.9526C28.463 25.7024 26.7674 25 24.9993 25H14.9995C13.2315 25 11.5358 25.7024 10.2856 26.9526C9.03537 28.2028 8.33301 29.8984 8.33301 31.6665V34.9998" stroke="#99A1AF" strokeWidth="2.49994" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.9995 18.333C23.6813 18.333 26.666 15.3483 26.666 11.6665C26.666 7.9847 23.6813 5 19.9995 5C16.3177 5 13.333 7.9847 13.333 11.6665C13.333 15.3483 16.3177 18.333 19.9995 18.333Z" stroke="#99A1AF" strokeWidth="2.49994" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <g clipPath="url(#clip_pf_pencil)">
        <path d="M12.3515 3.97318C12.66 3.66485 12.8332 3.24663 12.8333 2.81053C12.8334 2.37444 12.6602 1.95618 12.3518 1.64777C12.0435 1.33936 11.6253 1.16607 11.1892 1.16602C10.7531 1.16596 10.3348 1.33915 10.0264 1.64748L2.24143 9.43423C2.106 9.56927 2.00584 9.73553 1.94977 9.91838L1.1792 12.457C1.16413 12.5074 1.16299 12.561 1.17591 12.6121C1.18883 12.6631 1.21532 12.7097 1.25258 12.7469C1.28984 12.7841 1.33648 12.8105 1.38754 12.8234C1.4386 12.8362 1.49219 12.835 1.54261 12.8198L4.08181 12.0498C4.26449 11.9943 4.43074 11.8947 4.56596 11.7599L12.3515 3.97318Z" stroke="#5EA500" strokeWidth="1.4583" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.75 2.91602L11.0833 5.2493" stroke="#5EA500" strokeWidth="1.4583" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="clip_pf_pencil"><rect width="13.9997" height="13.9997" fill="white" /></clipPath></defs>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path d="M6 11.9998L9.9999 7.9999L6 4" stroke="#D1D5DC" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcScrap() {
  return (<svg width={20} height={20} viewBox="0 0 20 20" fill="none"><path d="M15.8334 17.4996L10.0002 14.1664L4.16699 17.4996V4.16663C4.16699 3.72461 4.34258 3.3007 4.65514 2.98814C4.96769 2.67559 5.3916 2.5 5.83362 2.5H14.1667C14.6088 2.5 15.0327 2.67559 15.3452 2.98814C15.6578 3.3007 15.8334 3.72461 15.8334 4.16663V17.4996Z" {...G} /></svg>);
}
function IcMyQ() {
  return (<svg width={20} height={20} viewBox="0 0 20 20" fill="none"><path d="M6.58354 16.667C8.17398 17.4829 10.0035 17.7038 11.7425 17.2901C13.4814 16.8764 15.0155 15.8552 16.0681 14.4105C17.1207 12.9659 17.6228 11.1927 17.4837 9.41065C17.3447 7.62857 16.5738 5.95474 15.3098 4.6908C14.0459 3.42685 12.372 2.6559 10.59 2.51687C8.80789 2.37784 7.03475 2.87989 5.59008 3.93253C4.1454 4.98517 3.1242 6.51918 2.71049 8.25814C2.29677 9.9971 2.51776 11.8266 3.33362 13.4171L1.66699 18.3336L6.58354 16.667Z" {...G} /></svg>);
}
function IcBell() {
  return (<svg width={20} height={20} viewBox="0 0 20 20" fill="none"><path d="M8.55664 17.5C8.70292 17.7533 8.91331 17.9637 9.16666 18.11C9.42001 18.2562 9.7074 18.3332 9.99994 18.3332C10.2925 18.3332 10.5799 18.2562 10.8332 18.11C11.0866 17.9637 11.297 17.7533 11.4432 17.5" {...G} /><path d="M2.7187 12.7707C2.60984 12.8901 2.538 13.0384 2.51191 13.1978C2.48583 13.3572 2.50663 13.5208 2.57179 13.6685C2.63694 13.8163 2.74364 13.942 2.8789 14.0303C3.01417 14.1185 3.17217 14.1656 3.33368 14.1657H16.6667C16.8282 14.1658 16.9862 14.1189 17.1216 14.0308C17.2569 13.9427 17.3637 13.8172 17.4291 13.6695C17.4944 13.5218 17.5154 13.3583 17.4895 13.1989C17.4637 13.0395 17.392 12.891 17.2833 12.7716C16.175 11.6291 15.0001 10.415 15.0001 6.66589C15.0001 5.33984 14.4733 4.0681 13.5356 3.13044C12.598 2.19279 11.3262 1.66602 10.0002 1.66602C8.67413 1.66602 7.40239 2.19279 6.46474 3.13044C5.52708 4.0681 5.00031 5.33984 5.00031 6.66589C5.00031 10.415 3.8245 11.6291 2.7187 12.7707Z" {...G} /></svg>);
}
function IcDoc() {
  return (<svg width={20} height={20} viewBox="0 0 20 20" fill="none"><path d="M12.4994 1.66602H4.99963C4.55762 1.66602 4.1337 1.84161 3.82115 2.15416C3.5086 2.46671 3.33301 2.89062 3.33301 3.33264V16.6656C3.33301 17.1077 3.5086 17.5316 3.82115 17.8441C4.1337 18.1567 4.55762 18.3323 4.99963 18.3323H14.9994C15.4414 18.3323 15.8653 18.1567 16.1779 17.8441C16.4904 17.5316 16.666 17.1077 16.666 16.6656V5.83258L12.4994 1.66602Z" {...G} /><path d="M11.666 1.66602V4.99927C11.666 5.44128 11.8416 5.86519 12.1542 6.17775C12.4667 6.4903 12.8906 6.66589 13.3326 6.66589H16.6659" {...G} /><path d="M8.33264 7.5H6.66602" {...G} /><path d="M13.3325 10.834H6.66602" {...G} /><path d="M13.3325 14.166H6.66602" {...G} /></svg>);
}
function IcShield() {
  return (<svg width={20} height={20} viewBox="0 0 20 20" fill="none"><path d="M16.666 10.8328C16.666 14.9994 13.7494 17.0827 10.2828 18.291C10.1013 18.3525 9.90412 18.3495 9.72451 18.2826C6.2496 17.0827 3.33301 14.9994 3.33301 10.8328V4.99964C3.33301 4.77863 3.4208 4.56668 3.57708 4.4104C3.73336 4.25412 3.94531 4.16633 4.16632 4.16633C5.83295 4.16633 7.91623 3.16635 9.36619 1.89972C9.54273 1.74889 9.76731 1.66602 9.99951 1.66602C10.2317 1.66602 10.4563 1.74889 10.6328 1.89972C12.0911 3.17469 14.1661 4.16633 15.8327 4.16633C16.0537 4.16633 16.2657 4.25412 16.4219 4.4104C16.5782 4.56668 16.666 4.77863 16.666 4.99964V10.8328Z" {...G} /></svg>);
}
function IcInfo() {
  return (<svg width={20} height={20} viewBox="0 0 20 20" fill="none"><path d="M10.0001 18.3323C14.6024 18.3323 18.3332 14.6014 18.3332 9.99914C18.3332 5.39688 14.6024 1.66602 10.0001 1.66602C5.39786 1.66602 1.66699 5.39688 1.66699 9.99914C1.66699 14.6014 5.39786 18.3323 10.0001 18.3323Z" {...G} /><path d="M10 13.3333V10" {...G} /><path d="M10 6.66602H10.0083" {...G} /></svg>);
}

type MenuItem = { Icon: () => React.ReactElement; label: string; route: string };

const USER_MENU_ITEMS: MenuItem[] = [
  { Icon: IcScrap, label: '내 스크랩', route: '/my-scraps' },
  { Icon: IcMyQ, label: '내 질문 보기', route: '/my-questions' },
  { Icon: IcBell, label: '알림설정', route: '/notification-settings' },
  { Icon: IcDoc, label: '이용약관', route: '/terms' },
  { Icon: IcShield, label: '개인정보처리방침', route: '/privacy' },
];
const LAWYER_MENU_ITEMS: MenuItem[] = [
  { Icon: IcMyQ, label: '내 답변 보기', route: '/my-answers' },
  { Icon: IcBell, label: '알림설정', route: '/notification-settings' },
  { Icon: IcDoc, label: '이용약관', route: '/terms' },
  { Icon: IcShield, label: '개인정보처리방침', route: '/privacy' },
];

const APP_VERSION = 'v1.1.0';

export default function Profile() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const menuList = role === 'lawyer' ? LAWYER_MENU_ITEMS : USER_MENU_ITEMS;

  return (
    <div className="screen pf">
      <div className="pf-topbar">
        <h1 className="pf-title font-airo">마이페이지</h1>
      </div>

      <div className="screen-scroll pf-body">
        <div className="pf-avatar-wrap">
          <button className="pf-avatar-btn" onClick={() => navigate('/edit-profile')} aria-label="정보 수정">
            <span className="pf-avatar"><PersonIcon /></span>
            <span className="pf-avatar-edit"><PencilIcon /></span>
          </button>
          <p className="pf-name">{user?.nickname ?? '000'}</p>
          {role === 'lawyer' && <p className="pf-affiliation">{user?.affiliation ?? '소속 미등록'}</p>}
        </div>

        <div className="pf-menu">
          {menuList.map((item) => (
            <button key={item.label} className="pf-row" onClick={() => navigate(item.route)}>
              <span className="pf-row-left">
                <item.Icon />
                <span className="pf-row-label">{item.label}</span>
              </span>
              <ChevronRight />
            </button>
          ))}
          <div className="pf-row">
            <span className="pf-row-left">
              <IcInfo />
              <span className="pf-row-label">앱버전</span>
            </span>
            <span className="pf-version">{APP_VERSION}</span>
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
