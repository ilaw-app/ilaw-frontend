import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoCheckmark } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';
import { Overlay } from '../components/Overlay';
import TabBar from '../components/TabBar';
import type { Gender } from '../api/types';
import './editProfile.css';

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];
const YEARS = Array.from({ length: 40 }, (_, i) => String(2026 - i)); // 2026 → 1987
const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남' },
  { value: 'female', label: '여' },
  { value: 'other', label: '기타' },
];
const NICKNAME_REGEX = /^[a-zA-Z0-9_]*$/;

function PersonIcon() {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <path d="M31.6658 34.9998V31.6665C31.6658 29.8984 30.9635 28.2028 29.7132 26.9526C28.463 25.7024 26.7674 25 24.9993 25H14.9995C13.2315 25 11.5358 25.7024 10.2856 26.9526C9.03537 28.2028 8.33301 29.8984 8.33301 31.6665V34.9998" stroke="#99A1AF" strokeWidth="2.49994" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.9995 18.333C23.6813 18.333 26.666 15.3483 26.666 11.6665C26.666 7.9847 23.6813 5 19.9995 5C16.3177 5 13.333 7.9847 13.333 11.6665C13.333 15.3483 16.3177 18.333 19.9995 18.333Z" stroke="#99A1AF" strokeWidth="2.49994" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <g clipPath="url(#clip_ep_cam)">
        <path d="M8.4585 2.33398H5.5419L4.0836 4.08395H2.33363C2.02422 4.08395 1.72748 4.20686 1.50869 4.42565C1.28991 4.64444 1.16699 4.94118 1.16699 5.25059V10.5005C1.16699 10.8099 1.28991 11.1066 1.50869 11.3254C1.72748 11.5442 2.02422 11.6671 2.33363 11.6671H11.6668C11.9762 11.6671 12.2729 11.5442 12.4917 11.3254C12.7105 11.1066 12.8334 10.8099 12.8334 10.5005V5.25059C12.8334 4.94118 12.7105 4.64444 12.4917 4.42565C12.2729 4.20686 11.9762 4.08395 11.6668 4.08395H9.91681L8.4585 2.33398Z" stroke="#6A7282" strokeWidth="1.16664" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.99996 9.33391C7.96644 9.33391 8.74993 8.55042 8.74993 7.58395C8.74993 6.61747 7.96644 5.83398 6.99996 5.83398C6.03348 5.83398 5.25 6.61747 5.25 7.58395C5.25 8.55042 6.03348 9.33391 6.99996 9.33391Z" stroke="#6A7282" strokeWidth="1.16664" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="clip_ep_cam"><rect width="13.9997" height="13.9997" fill="white" /></clipPath></defs>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path d="M5.9999 13.9997H3.3333C2.97969 13.9997 2.64056 13.8592 2.39051 13.6092C2.14047 13.3591 2 13.02 2 12.6664V3.3333C2 2.97969 2.14047 2.64056 2.39051 2.39051C2.64056 2.14047 2.97969 2 3.3333 2H5.9999" stroke="#FF6467" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.666 11.3325L13.9993 7.99927L10.666 4.66602" stroke="#FF6467" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.9998 8H6" stroke="#FF6467" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path d="M4 6L7.9999 9.9999L11.9998 6" stroke="#D1D5DC" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, role, setUser, logout } = useAuth();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [nicknameError, setNicknameError] = useState('');
  const [region, setRegion] = useState(user?.region ?? '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ? user.birthDate.slice(0, 10) : '');
  const [gender, setGender] = useState<Gender | ''>(user?.gender ?? '');
  const [affiliation, setAffiliation] = useState(user?.affiliation ?? '');
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<'region' | 'year' | null>(null);

  const birthYear = birthDate ? birthDate.slice(0, 4) : '';

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    setNicknameError(text && !NICKNAME_REGEX.test(text) ? '영어, 숫자, _만 사용 가능합니다.' : '');
  };

  const handleSave = async () => {
    if (!nickname) { window.alert('아이디를 입력해주세요.'); return; }
    if (!NICKNAME_REGEX.test(nickname)) { setNicknameError('영어, 숫자, _만 사용 가능합니다.'); return; }
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        nickname,
        region: region || null,
        birthDate: birthDate || null,
        gender: gender || null,
        affiliation: role === 'lawyer' ? affiliation : undefined,
      });
      if (user) setUser({ ...user, ...updated });
      navigate(-1);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setNicknameError('이미 사용 중인 아이디입니다.');
      else if (err instanceof ApiError && err.status === 400) window.alert(err.body?.message ?? '입력값을 확인해주세요.');
      else window.alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;
    await authApi.logout().catch(() => {});
    await logout();
    navigate('/login', { replace: true });
  };

  const pickerItems = picker === 'region' ? REGIONS : YEARS;
  const pickerSelected = picker === 'region' ? region : birthYear;
  const pickerFmt = (v: string) => (picker === 'year' ? `${v}년` : v);
  const onPick = (v: string) => {
    if (picker === 'region') setRegion(v);
    else setBirthDate(`${v}-01-01`);
    setPicker(null);
  };

  return (
    <div className="screen ep">
      <div className="ep-header">
        <button className="ep-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <IoArrowBack size={22} color="#101828" />
        </button>
        <h1 className="ep-header-title">정보 수정</h1>
        <button className="ep-save" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중' : '저장'}
        </button>
      </div>

      <div className="screen-scroll ep-inner">
        {/* 아바타 (흰 컨테이너) */}
        <div className="ep-avatar-section">
          <button className="ep-avatar-btn">
            <span className="ep-avatar"><PersonIcon /></span>
            <span className="ep-avatar-cam"><CameraIcon /></span>
          </button>
        </div>

        <div className="ep-fields">
          {/* 아이디 */}
          <div className="ep-box">
            <label className="ep-box-label">아이디</label>
            <input
              className="ep-box-input"
              placeholder="영어, 숫자, _만 사용 가능"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
            />
            {nicknameError ? <p className="ep-error-text">{nicknameError}</p> : null}
          </div>

          {/* 지역 */}
          <button className="ep-box ep-box-btn" onClick={() => setPicker('region')}>
            <span className="ep-box-label">지역</span>
            <span className={`ep-box-value ${region ? '' : 'ph'}`}>{region || '지역을 선택해주세요'}</span>
            <span className="ep-box-chevron"><ChevronDown /></span>
          </button>

          {/* 출생연도 */}
          <button className="ep-box ep-box-btn" onClick={() => setPicker('year')}>
            <span className="ep-box-label">출생연도</span>
            <span className={`ep-box-value ${birthYear ? '' : 'ph'}`}>{birthYear ? `${birthYear}년` : '출생연도를 선택해주세요'}</span>
            <span className="ep-box-chevron"><ChevronDown /></span>
          </button>

          {/* 소속 (변호사) */}
          {role === 'lawyer' && (
            <div className="ep-box">
              <label className="ep-box-label">소속</label>
              <input
                className="ep-box-input"
                placeholder="소속 기관을 입력해주세요"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
              />
            </div>
          )}

          {/* 성별 */}
          <div className="ep-box">
            <label className="ep-box-label">성별</label>
            <div className="ep-gender-row">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  className={`ep-gender-btn ${gender === g.value ? 'active' : ''}`}
                  onClick={() => setGender(gender === g.value ? '' : g.value)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 로그아웃 */}
          <button className="ep-logout" onClick={handleLogout}>
            <LogoutIcon />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* 지역/출생연도 선택 바텀시트 */}
      <Overlay visible={picker !== null} onClose={() => setPicker(null)} align="bottom">
        <div className="ep-picker">
          <div className="ep-picker-title">{picker === 'region' ? '지역 선택' : '출생연도 선택'}</div>
          <div className="ep-picker-list">
            {pickerItems.map((v) => {
              const active = pickerSelected === v;
              return (
                <button key={v} className={`ep-picker-item ${active ? 'active' : ''}`} onClick={() => onPick(v)}>
                  <span>{pickerFmt(v)}</span>
                  {active && <IoCheckmark size={18} color="#5EA500" />}
                </button>
              );
            })}
          </div>
        </div>
      </Overlay>

      <TabBar />
    </div>
  );
}
