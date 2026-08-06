import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
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
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
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

  const b0 = user?.birthDate ? user.birthDate.slice(0, 10) : '';
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [nicknameError, setNicknameError] = useState('');
  const [region, setRegion] = useState(user?.region ?? '');
  const [by, setBy] = useState(b0 ? b0.slice(0, 4) : '');
  const [bm, setBm] = useState(b0 ? b0.slice(5, 7) : '');
  const [bd, setBd] = useState(b0 ? b0.slice(8, 10) : '');
  const [gender, setGender] = useState<Gender | ''>(user?.gender ?? '');
  const [affiliation, setAffiliation] = useState(user?.affiliation ?? '');
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<'region' | 'birth' | null>(null);

  const birthLabel = by && bm && bd ? `${by}년 ${Number(bm)}월 ${Number(bd)}일` : '';

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
        birthDate: by && bm && bd ? `${by}-${bm}-${bd}` : null,
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
          <div className="ep-avatar-btn">
            <span className="ep-avatar"><PersonIcon /></span>
          </div>
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

          {/* 생년월일 */}
          <button className="ep-box ep-box-btn" onClick={() => setPicker('birth')}>
            <span className="ep-box-label">생년월일</span>
            <span className={`ep-box-value ${birthLabel ? '' : 'ph'}`}>{birthLabel || '생년월일을 선택해주세요'}</span>
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

      {/* 지역 선택 */}
      <Overlay visible={picker === 'region'} onClose={() => setPicker(null)} align="bottom">
        <div className="ep-picker">
          <div className="ep-picker-title">지역 선택</div>
          <div className="ep-picker-list">
            {REGIONS.map((v) => (
              <button
                key={v}
                className={`ep-picker-item ${region === v ? 'active' : ''}`}
                onClick={() => { setRegion(v); setPicker(null); }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </Overlay>

      {/* 생년월일 선택 (년/월/일) */}
      <Overlay visible={picker === 'birth'} onClose={() => setPicker(null)} align="bottom">
        <div className="ep-picker">
          <div className="ep-picker-title">생년월일 선택</div>
          <div className="ep-birth-cols">
            <div className="ep-birth-col">
              {YEARS.map((v) => (
                <button key={v} className={`ep-birth-item ${by === v ? 'active' : ''}`} onClick={() => setBy(v)}>{v}년</button>
              ))}
            </div>
            <div className="ep-birth-col">
              {MONTHS.map((v) => (
                <button key={v} className={`ep-birth-item ${bm === v ? 'active' : ''}`} onClick={() => setBm(v)}>{Number(v)}월</button>
              ))}
            </div>
            <div className="ep-birth-col">
              {DAYS.map((v) => (
                <button key={v} className={`ep-birth-item ${bd === v ? 'active' : ''}`} onClick={() => setBd(v)}>{Number(v)}일</button>
              ))}
            </div>
          </div>
          <button className="ep-picker-confirm" onClick={() => setPicker(null)}>확인</button>
        </div>
      </Overlay>

      <TabBar />
    </div>
  );
}
