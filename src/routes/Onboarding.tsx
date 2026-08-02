import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';
import type { Gender } from '../api/types';
import './onboarding.css';

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타' },
];

const NICKNAME_REGEX = /^[a-zA-Z0-9_]*$/;

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [region, setRegion] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedAge14, setAgreedAge14] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allAgreed = agreedTerms && agreedPrivacy && agreedAge14 && agreedMarketing;
  const allRequiredAgreed = agreedTerms && agreedPrivacy && agreedAge14;
  const canSubmit = nickname.trim().length > 0 && !nicknameError && allRequiredAgreed;

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    if (text && !NICKNAME_REGEX.test(text)) {
      setNicknameError('영어, 숫자, _만 사용 가능합니다.');
    } else {
      setNicknameError('');
    }
  };

  const handleAgreeAll = () => {
    const newVal = !allAgreed;
    setAgreedTerms(newVal);
    setAgreedPrivacy(newVal);
    setAgreedAge14(newVal);
    setAgreedMarketing(newVal);
  };

  const agreeRows = [
    { label: '이용약관 동의 (필수)', value: agreedTerms, onToggle: () => setAgreedTerms((v) => !v) },
    { label: '개인정보처리방침 동의 (필수)', value: agreedPrivacy, onToggle: () => setAgreedPrivacy((v) => !v) },
    { label: '14세 이상 확인 (필수)', value: agreedAge14, onToggle: () => setAgreedAge14((v) => !v) },
    { label: '마케팅 수신 동의 (선택)', value: agreedMarketing, onToggle: () => setAgreedMarketing((v) => !v) },
  ];

  const handleSubmit = async () => {
    if (!nickname) {
      window.alert('아이디를 입력해주세요.');
      return;
    }
    if (!NICKNAME_REGEX.test(nickname)) {
      setNicknameError('영어, 숫자, _만 사용 가능합니다.');
      return;
    }
    if (!allRequiredAgreed) {
      window.alert('필수 약관에 모두 동의해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.submitOnboarding({
        nickname,
        region: region || null,
        birthDate: birthDate || null,
        gender: gender || null,
        agreedTermsOfService: true,
        agreedPrivacyPolicy: true,
        agreedAge14: true,
        agreedMarketing,
      });
      await refreshMe();
      navigate('/home', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setNicknameError('이미 사용 중인 아이디입니다.');
      } else if (err instanceof ApiError && err.status === 400) {
        window.alert(err.body?.message ?? '입력값을 확인해주세요.');
      } else {
        window.alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-scroll ob-inner">
        <div className="ob-logo-wrap">
          <img className="ob-shadow" src="/assets/shadow.png" alt="" aria-hidden="true" />
          <img className="ob-logo" src="/assets/logo2.png" alt="아이로" />
        </div>

        <p className="ob-subtitle font-airo">
          아이로가 더 잘 도와드릴 수 있도록
          <br />
          기본 정보를 입력해주세요
        </p>

        {/* 아이디 */}
        <div className="ob-field">
          <label className="ob-label">아이디</label>
          <input
            className={`ob-input ${nicknameError ? 'ob-input-error' : ''}`}
            placeholder="영어, 숫자, _만 사용 가능"
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
          />
          {nicknameError ? <p className="ob-error-text">{nicknameError}</p> : null}
        </div>

        {/* 지역 */}
        <div className="ob-field">
          <label className="ob-label">지역</label>
          <select
            className={`ob-input ob-select ${region ? '' : 'ob-select-placeholder'}`}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">지역을 선택해주세요</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* 생년월일 */}
        <div className="ob-field">
          <label className="ob-label">생년월일</label>
          <input
            type="date"
            className={`ob-input ob-date ${birthDate ? '' : 'ob-date-empty'}`}
            value={birthDate}
            max="2026-12-31"
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        {/* 성별 */}
        <div className="ob-field">
          <label className="ob-label">성별</label>
          <div className="ob-gender-row">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                className={`ob-gender-btn ${gender === g.value ? 'active' : ''}`}
                onClick={() => setGender(gender === g.value ? '' : g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 약관 */}
        <div className="ob-agree-box">
          <button className="ob-agree-row" onClick={handleAgreeAll}>
            <span className={`ob-checkbox ${allAgreed ? 'active' : ''}`}>
              {allAgreed && <span className="ob-checkmark">✓</span>}
            </span>
            <span className="ob-agree-all-text">전체 동의</span>
          </button>

          <div className="ob-divider" />

          {agreeRows.map((item) => (
            <button key={item.label} className="ob-agree-row" onClick={item.onToggle}>
              <span className={`ob-checkbox ${item.value ? 'active' : ''}`}>
                {item.value && <span className="ob-checkmark">✓</span>}
              </span>
              <span className="ob-agree-text">{item.label}</span>
            </button>
          ))}
        </div>

        <button
          className={`ob-submit${canSubmit ? ' active' : ''}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '가입 중...' : '가입하기'}
        </button>
      </div>
    </div>
  );
}
