import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoChatbubbleOutline,
  IoBookmarkOutline,
  IoBookOutline,
  IoPeopleOutline,
} from 'react-icons/io5';
import type { IconType } from 'react-icons';
import { useAuth } from '../context/AuthContext';
import {
  useNotificationSettings,
  type NotiSettings,
} from '../context/NotificationSettingsContext';
import TabBar from '../components/TabBar';
import './notificationSettings.css';

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      className={`ns-track ${value ? 'on' : ''}`}
      onClick={onChange}
      aria-pressed={value}
    >
      <span className="ns-thumb" />
    </button>
  );
}

type ToggleItem = { key: keyof NotiSettings; icon: IconType; title: string; desc: string };

const USER_TOGGLES: ToggleItem[] = [
  {
    key: 'answer',
    icon: IoChatbubbleOutline,
    title: '내 질문 답변 알림',
    desc: '변호사님의 답변을 받으면 알려드려요',
  },
  {
    key: 'scrap',
    icon: IoBookmarkOutline,
    title: '스크랩한 질문 답변 알림',
    desc: '스크랩한 질문에 답변이 달리면 알려드려요',
  },
  {
    key: 'manual',
    icon: IoBookOutline,
    title: '매뉴얼 업데이트 알림',
    desc: '새로운 법률 정보가 추가되면 알려드려요',
  },
  {
    key: 'community',
    icon: IoPeopleOutline,
    title: '커뮤니티 좋아요, 댓글 알림',
    desc: '내 글에 댓글이나 좋아요가 달리면 알려드려요',
  },
];

const LAWYER_TOGGLES: ToggleItem[] = [
  {
    key: 'newQuestion',
    icon: IoChatbubbleOutline,
    title: '질문 등록 알림',
    desc: '학생의 질문이 등록되면 알려드려요',
  },
  {
    key: 'manual',
    icon: IoBookOutline,
    title: '매뉴얼 업데이트 알림',
    desc: '새로운 법률 정보가 추가되면 알려드려요',
  },
];

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { settings: enabled, toggle } = useNotificationSettings();
  const toggles = role === 'lawyer' ? LAWYER_TOGGLES : USER_TOGGLES;

  return (
    <div className="screen ns">
      <div className="ns-header">
        <button className="ns-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <IoArrowBack size={22} color="#101828" />
        </button>
        <h1 className="ns-header-title">알림 설정</h1>
      </div>

      <div className="screen-scroll ns-scroll">
        <div className="ns-list">
          {toggles.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="ns-row">
                <div className="ns-icon-box">
                  <Icon size={20} color="#5EA500" />
                </div>
                <div className="ns-text-group">
                  <span className="ns-row-title">{item.title}</span>
                  <span className="ns-row-desc">{item.desc}</span>
                </div>
                <Toggle value={enabled[item.key]} onChange={() => toggle(item.key)} />
              </div>
            );
          })}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
