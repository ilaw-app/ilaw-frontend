import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/notifications';
import type { Notification } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { useNotificationSettings } from '../context/NotificationSettingsContext';
import TabBar from '../components/TabBar';
import CommunityGlyph from '../components/CommunityIcon';
import './notifications.css';

type NotificationSettingKey = 'answer' | 'scrap' | 'manual' | 'newQuestion' | 'community';

const TYPE_TO_SETTING: Record<string, NotificationSettingKey> = {
  answer: 'answer',
  qna_answered: 'answer',
  scrap_answer: 'scrap',
  manual_update: 'manual',
  new_question: 'newQuestion',
  community_comment: 'community',
  community_like: 'community',
};

// ── 아이콘 ──────────────────────────────────────────────────
function QnaAnswerIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path
        d="M6.58105 16.6605C8.17098 17.4761 9.99994 17.697 11.7383 17.2834C13.4767 16.8699 15.0103 15.849 16.0626 14.4048C17.1149 12.9606 17.6168 11.188 17.4778 9.40648C17.3388 7.62498 16.5681 5.95168 15.3045 4.68814C14.041 3.42459 12.3677 2.65389 10.5862 2.51491C8.80469 2.37593 7.03212 2.87781 5.58791 3.93011C4.14369 4.98242 3.12282 6.51594 2.70924 8.25434C2.29565 9.99274 2.51657 11.8217 3.33217 13.4116L1.66608 18.3266L6.58105 16.6605Z"
        stroke="#364153" strokeWidth={1.66609} strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function ScrapAnswerIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path
        d="M15.8279 17.4938L9.99654 14.1617L4.16522 17.4938V4.16512C4.16522 3.72324 4.34076 3.29946 4.65321 2.98701C4.96566 2.67456 5.38944 2.49902 5.83131 2.49902H14.1618C14.6036 2.49902 15.0274 2.67456 15.3399 2.98701C15.6523 3.29946 15.8279 3.72324 15.8279 4.16512V17.4938Z"
        stroke="#364153" strokeWidth={1.66609} strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function ManualUpdateIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path
        d="M9.99652 5.83105V17.4937"
        stroke="#364153" strokeWidth={1.66609} strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M2.49912 14.9947C2.27818 14.9947 2.0663 14.9069 1.91007 14.7507C1.75384 14.5945 1.66608 14.3826 1.66608 14.1617V3.33207C1.66608 3.11113 1.75384 2.89924 1.91007 2.74302C2.0663 2.58679 2.27818 2.49902 2.49912 2.49902H6.66435C7.5481 2.49902 8.39566 2.85009 9.02056 3.475C9.64547 4.0999 9.99654 4.94746 9.99654 5.83121C9.99654 4.94746 10.3476 4.0999 10.9725 3.475C11.5974 2.85009 12.445 2.49902 13.3287 2.49902H17.4939C17.7149 2.49902 17.9268 2.58679 18.083 2.74302C18.2392 2.89924 18.327 3.11113 18.327 3.33207V14.1617C18.327 14.3826 18.2392 14.5945 18.083 14.7507C17.9268 14.9069 17.7149 14.9947 17.4939 14.9947H12.4957C11.8329 14.9947 11.1972 15.258 10.7285 15.7267C10.2598 16.1954 9.99654 16.831 9.99654 17.4938C9.99654 16.831 9.73323 16.1954 9.26455 15.7267C8.79588 15.258 8.16021 14.9947 7.4974 14.9947H2.49912Z"
        stroke="#364153" strokeWidth={1.66609} strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function NotiIcon({ type }: { type: string }) {
  if (type === 'answer' || type === 'qna_answered') return <QnaAnswerIcon />;
  if (type === 'scrap_answer') return <ScrapAnswerIcon />;
  if (type === 'manual_update') return <ManualUpdateIcon />;
  if (type === 'community_comment' || type === 'community_like') return <CommunityGlyph size={20} color="#364153" />;
  return <QnaAnswerIcon />;
}

// ── 빈 알림 아이콘 (회색 종) ─────────────────────────────────
function EmptyBellIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <path d="M11.9775 24.4961C12.1823 24.8507 12.4768 25.1452 12.8315 25.3499C13.1861 25.5547 13.5884 25.6625 13.9979 25.6625C14.4074 25.6625 14.8097 25.5547 15.1643 25.3499C15.5189 25.1452 15.8134 24.8507 16.0182 24.4961" stroke="#BEE966" strokeWidth="2.33295" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.80476 17.8775C3.65238 18.0445 3.55182 18.2522 3.51531 18.4753C3.4788 18.6984 3.50792 18.9273 3.59912 19.1342C3.69033 19.3411 3.83968 19.517 4.02903 19.6406C4.21837 19.7641 4.43954 19.83 4.66562 19.8301H23.3292C23.5553 19.8302 23.7765 19.7646 23.966 19.6413C24.1554 19.518 24.305 19.3423 24.3964 19.1355C24.4879 18.9288 24.5173 18.6999 24.481 18.4768C24.4448 18.2536 24.3446 18.0458 24.1924 17.8786C22.641 16.2794 20.9963 14.5798 20.9963 9.33186C20.9963 7.47565 20.2589 5.69546 18.9464 4.38292C17.6338 3.07038 15.8536 2.33301 13.9974 2.33301C12.1412 2.33301 10.361 3.07038 9.04849 4.38292C7.73595 5.69546 6.99857 7.47565 6.99857 9.33186C6.99857 14.5798 5.35268 16.2794 3.80476 17.8775Z" stroke="#BEE966" strokeWidth="2.33295" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path d="M9.99618 15.8273L4.16504 9.99618L9.99618 4.16504" stroke="#678720" strokeWidth="1.66604" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.8273 9.99609H4.16504" stroke="#678720" strokeWidth="1.66604" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── 날짜 포맷 ────────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { settings } = useNotificationSettings();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    notificationsApi
      .list()
      .then((data) => !cancelled && setNotifications(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setNotifications([]))
      .finally(() => !cancelled && setLoading(false));

    // fire-and-forget
    notificationsApi.readAll().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleNotifications = notifications.filter((n) => {
    if (role === 'lawyer' && n.type !== 'new_question') return false;
    const settingKey = TYPE_TO_SETTING[n.type];
    if (!settingKey) return true;
    return settings[settingKey];
  });

  const handlePress = (noti: Notification) => {
    if (!noti.refId) return;
    if (
      noti.type === 'answer' ||
      noti.type === 'qna_answered' ||
      noti.type === 'scrap_answer' ||
      noti.type === 'new_question'
    ) {
      navigate(`/qna/${noti.refId}`);
    } else if (noti.type === 'community_comment' || noti.type === 'community_like') {
      navigate(`/community/${noti.refId}`);
    }
  };

  return (
    <div className="screen noti">
      <div className="noti-header">
        <button className="noti-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <ArrowLeftIcon />
        </button>
        <h1 className="noti-title font-airo">알림</h1>
      </div>

      {loading ? (
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="screen-scroll noti-list">
          {visibleNotifications.length === 0 ? (
            <div className="noti-empty">
              <span className="noti-empty-icon">
                <EmptyBellIcon />
              </span>
              <span className="noti-empty-text">아직 알림이 없어요</span>
            </div>
          ) : (
            visibleNotifications.map((noti) => (
              <button
                key={noti.id}
                type="button"
                className="noti-card"
                onClick={() => handlePress(noti)}
              >
                <span className="noti-icon">
                  <NotiIcon type={noti.type} />
                </span>
                <span className="noti-body">
                  <span className="noti-title-row">
                    <span className="noti-card-title">{noti.title}</span>
                    {!noti.read && <span className="noti-unread-dot" />}
                  </span>
                  <span className="noti-desc">{noti.body}</span>
                  <span className="noti-date">{formatDate(noti.createdAt)}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}

      <TabBar />
    </div>
  );
}
