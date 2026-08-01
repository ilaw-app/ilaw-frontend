import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoArrowBack, IoCheckmark, IoClose, IoCopyOutline, IoOpenOutline } from 'react-icons/io5';
import { manualApi } from '../api/manual';
import type { Agency } from '../api/types';
import TabBar from '../components/TabBar';
import { Overlay } from '../components/Overlay';
import './manualHelp.css';

// 전국 공통 긴급번호 (고정)
const NATIONAL = [
  { label: '아동학대', number: '1577-1391' },
  { label: '가정폭력', number: '1366' },
  { label: '학교폭력', number: '117' },
  { label: '청소년상담', number: '1388' },
];

const REGIONS = ['전체', '서울', '부산', '대구', '인천', '대전', '광주', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

type TipsKey = 'where' | 'who' | 'what' | 'help' | 'question' | 'evidence';

const TIPS_FIELDS: { key: TipsKey; label: string; placeholder: string }[] = [
  { key: 'where',    label: '어디에서',         placeholder: '예) 학교, 집, 편의점 등' },
  { key: 'who',      label: '누구와',           placeholder: '예) 친구, 선생님, 사장님 등' },
  { key: 'what',     label: '어떤 일을 겪었는지', placeholder: '예) 알바비를 3개월째 못 받았어요' },
  { key: 'help',     label: '받고 싶은 도움',    placeholder: '예) 밀린 알바비를 받고 싶어요' },
  { key: 'question', label: '궁금한 점',         placeholder: '예) 이게 불법인지 궁금해요' },
  { key: 'evidence', label: '가지고 있는 증거',  placeholder: '예) 카카오톡 대화 캡처, 녹음 파일 등' },
];

const initTips = (): Record<TipsKey, string> => ({ where: '', who: '', what: '', help: '', question: '', evidence: '' });

// 12x12 전화 아이콘 (색상 지정) — 경찰신고(빨강)/기관(초록) 공용
function Phone12({ color }: { color: string }) {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <g clipPath="url(#clip_phone12)">
        <path d="M10.9995 8.45986V9.95982C11 10.0991 10.9715 10.2369 10.9157 10.3645C10.8599 10.4921 10.7781 10.6066 10.6755 10.7007C10.5729 10.7949 10.4518 10.8665 10.3199 10.9112C10.188 10.9558 10.0482 10.9723 9.9095 10.9598C8.37096 10.7926 6.89308 10.2669 5.59461 9.42484C4.38655 8.65719 3.36233 7.63297 2.59468 6.42491C1.74969 5.12055 1.22384 3.63548 1.05972 2.09002C1.04723 1.95176 1.06366 1.81241 1.10797 1.68084C1.15228 1.54928 1.2235 1.42838 1.3171 1.32585C1.41069 1.22332 1.52461 1.1414 1.6516 1.08531C1.77859 1.02922 1.91587 1.00018 2.0547 1.00005H3.55466C3.79731 0.99766 4.03254 1.08359 4.21652 1.24181C4.4005 1.40003 4.52067 1.61976 4.55464 1.86003C4.61795 2.34005 4.73536 2.81137 4.90463 3.26499C4.9719 3.44395 4.98646 3.63844 4.94658 3.82542C4.9067 4.0124 4.81406 4.18402 4.67963 4.31997L4.04465 4.95495C4.75641 6.20669 5.79283 7.24311 7.04457 7.95487L7.67956 7.31989C7.8155 7.18546 7.98713 7.09282 8.1741 7.05294C8.36108 7.01307 8.55557 7.02763 8.73453 7.0949C9.18816 7.26417 9.65948 7.38158 10.1395 7.44489C10.3824 7.47915 10.6042 7.60149 10.7627 7.78863C10.9213 7.97577 11.0056 8.21466 10.9995 8.45986Z" stroke={color} strokeWidth="0.999975" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip_phone12">
          <rect width="11.9997" height="11.9997" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ChevronDown16() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path d="M4 6L7.9999 9.9999L11.9998 6" stroke="#99A1AF" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUp16() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path d="M12 10L8.0001 6.0001L4.0002 10" stroke="#99A1AF" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path d="M13.9997 9.9998C13.9997 10.3534 13.8592 10.6925 13.6092 10.9426C13.3591 11.1926 13.02 11.3331 12.6664 11.3331H4.6666L2 13.9997V3.3333C2 2.97969 2.14047 2.64056 2.39051 2.39051C2.64056 2.14047 2.97969 2 3.3333 2H12.6664C13.02 2 13.3591 2.14047 13.6092 2.39051C13.8592 2.64056 13.9997 2.97969 13.9997 3.3333V9.9998Z" stroke="#6A7282" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ManualHelp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categoryId = params.get('categoryId') ?? '';

  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [callTarget, setCallTarget] = useState<Agency | null>(null);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [tipsValues, setTipsValues] = useState<Record<TipsKey, string>>(initTips());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    manualApi
      .agencies(categoryId, selectedRegion === '전체' ? undefined : selectedRegion)
      .then((data) => !cancelled && setAgencies(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setAgencies([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [categoryId, selectedRegion]);

  const handleCloseAll = () => {
    setShowTips(false);
    setCallTarget(null);
    setTipsValues(initTips());
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number.replace(/[^0-9]/g, '')}`;
  };

  const copyTips = () => {
    const text = TIPS_FIELDS.filter((f) => tipsValues[f.key].trim())
      .map((f) => `${f.label}: ${tipsValues[f.key].trim()}`)
      .join('\n');
    navigator.clipboard?.writeText(text).then(
      () => window.alert('내용을 복사했어요.'),
      () => {}
    );
  };

  // "/", "또는", "," 모두 구분자로 처리 ("112 또는 1577-1391" → ["112", "1577-1391"])
  const getNumbers = (contact: string) =>
    contact.split(/\/|또는|,/).map(n => n.trim()).filter(Boolean);

  // 전국 공통 번호는 위 카드에 이미 있으므로 기관 목록에서 제외
  const NATIONAL_DIGITS = new Set(['15771391', '1366', '117', '1388', '112']);
  const onlyDigits = (s: string) => s.replace(/[^0-9]/g, '');
  const isUrl = (s: string) => /^https?:\/\//i.test(s) || /^www\./i.test(s) || /\.(go|or|com|net|kr)\b/i.test(s);
  const toHref = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`);
  const visibleAgencies = agencies.filter(
    (a) => isUrl(a.contact) || !getNumbers(a.contact).some((n) => NATIONAL_DIGITS.has(onlyDigits(n)))
  );

  // 긴급 신고 번호도 기관 카드처럼 '전화 걸기' 팝업을 띄운다
  const handleEmergencyPress = (item: { label: string; number: string }) => {
    setCallTarget({ id: -1, region: '', name: item.label, role: '', contact: item.number });
  };

  return (
    <div className="mh">
      <div className="mh-header">
        <button className="mh-back" onClick={() => navigate(-1)}>
          <IoArrowBack size={24} color="#101828" />
        </button>
        <h1 className="mh-title">긴급 연락처</h1>
      </div>

      <div className="screen-scroll mh-content">
        {/* 전국 공통 긴급번호 */}
        <div className="mh-ec-card">
          <div className="mh-ec-head">
            <span className="mh-ec-dot" />
            <span className="mh-ec-head-title">전국 공통 긴급번호</span>
          </div>
          <div className="mh-ec-grid">
            {NATIONAL.map((n) => (
              <button key={n.label} className="mh-ec-cell" onClick={() => handleEmergencyPress(n)}>
                <span className="mh-ec-label">{n.label}</span>
                <span className="mh-ec-num">{n.number}</span>
              </button>
            ))}
          </div>
          <button className="mh-ec-police" onClick={() => handleEmergencyPress({ label: '경찰 신고', number: '112' })}>
            <span className="mh-ec-police-label">경찰 신고</span>
            <span className="mh-ec-police-right">
              <Phone12 color="#FB2C36" />
              <span className="mh-ec-police-num">112</span>
            </span>
          </button>
        </div>

        {/* 지역 필터 */}
        <button className="mh-region-filter" onClick={() => setRegionModalVisible(true)}>
          <span className="mh-region-filter-text">{selectedRegion === '전체' ? '지역 필터' : selectedRegion}</span>
          <ChevronDown16 />
        </button>

        {/* 기관 목록 */}
        {loading ? (
          <div className="mh-spinner-wrap">
            <div className="spinner" />
          </div>
        ) : visibleAgencies.length === 0 ? (
          <p className="mh-empty">선택한 지역에 등록된 기관이 없어요.</p>
        ) : (
          <div className="mh-agency-card">
            {visibleAgencies.map((agency) =>
              isUrl(agency.contact) ? (
                <a
                  key={agency.id}
                  className="mh-agency"
                  href={toHref(agency.contact)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="mh-agency-info">
                    <span className="mh-agency-name">{agency.name}</span>
                    {agency.role ? <span className="mh-agency-desc">{agency.role}</span> : null}
                  </span>
                  <span className="mh-agency-phones">
                    <span className="mh-agency-phone">
                      <IoOpenOutline size={12} color="#5EA500" />
                      <span className="mh-agency-num">홈페이지</span>
                    </span>
                  </span>
                </a>
              ) : (
                <button key={agency.id} className="mh-agency" onClick={() => setCallTarget(agency)}>
                  <span className="mh-agency-info">
                    <span className="mh-agency-name">{agency.name}</span>
                    {agency.role ? <span className="mh-agency-desc">{agency.role}</span> : null}
                  </span>
                  <span className="mh-agency-phones">
                    {getNumbers(agency.contact).map((num) => (
                      <span key={num} className="mh-agency-phone">
                        <Phone12 color="#5EA500" />
                        <span className="mh-agency-num">{num}</span>
                      </span>
                    ))}
                  </span>
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* 지역 선택 모달 */}
      <Overlay visible={regionModalVisible} onClose={() => setRegionModalVisible(false)}>
        <div className="mh-region-card">
          <div className="mh-region-modal-title">지역 선택</div>
          <div className="mh-region-list">
            {REGIONS.map((r) => (
              <button
                key={r}
                className={`mh-region-option ${selectedRegion === r ? 'active' : ''}`}
                onClick={() => { setSelectedRegion(r); setRegionModalVisible(false); }}
              >
                <span className={`mh-region-option-text ${selectedRegion === r ? 'active' : ''}`}>{r}</span>
                {selectedRegion === r && <IoCheckmark size={18} color="#3C6802" />}
              </button>
            ))}
          </div>
        </div>
      </Overlay>

      {/* 전화 걸기 바텀시트 (이렇게 말해보세요 토글) */}
      <Overlay visible={callTarget !== null} onClose={handleCloseAll} align="bottom">
        <div className={`mh-sheet${showTips ? ' expanded' : ''}`}>
          {callTarget && (
            <>
              <div className="mh-sheet-head">
                <div className="mh-sheet-head-text">
                  <div className="mh-sheet-name">{callTarget.name}</div>
                  <div className="mh-sheet-num">{callTarget.contact}</div>
                </div>
                <button className="mh-sheet-x" onClick={handleCloseAll} aria-label="닫기">
                  <IoClose size={20} color="#4a5565" />
                </button>
              </div>

              <button className="mh-tips-toggle" onClick={() => setShowTips((v) => !v)}>
                <span className="mh-tips-toggle-left">
                  <ChatBubbleIcon />
                  <span className="mh-tips-toggle-text">이렇게 말해보세요</span>
                </span>
                {showTips ? <ChevronUp16 /> : <ChevronDown16 />}
              </button>

              {showTips && (
                <div className="mh-tips-body">
                  <div className="mh-tips-body-hint">전화 전에 미리 정리하면 도움받기 쉬워요.</div>
                  {TIPS_FIELDS.map((field) => (
                    <div key={field.key} className="mh-tips-field">
                      <div className="mh-tips-field-label">{field.label}</div>
                      {field.key === 'what' ? (
                        <textarea
                          className="mh-tips-input large"
                          placeholder={field.placeholder}
                          value={tipsValues[field.key]}
                          onChange={(e) => setTipsValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      ) : (
                        <input
                          className="mh-tips-input"
                          placeholder={field.placeholder}
                          value={tipsValues[field.key]}
                          onChange={(e) => setTipsValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}
                  <button className="mh-copy-btn" onClick={copyTips}>
                    <IoCopyOutline size={16} color="#364153" />
                    <span>내용 복사하기</span>
                  </button>
                </div>
              )}

              <div className="mh-sheet-btns">
                {getNumbers(callTarget.contact).length > 1 ? (
                  getNumbers(callTarget.contact).map((num) => (
                    <button key={num} className="mh-sheet-btn danger" onClick={() => handleCall(num)}>
                      <Phone12 color="#fff" />
                      전화 걸기 ({num})
                    </button>
                  ))
                ) : (
                  <button className="mh-sheet-btn danger" onClick={() => handleCall(getNumbers(callTarget.contact)[0] ?? callTarget.contact)}>
                    <Phone12 color="#fff" />
                    전화 걸기
                  </button>
                )}
                {!showTips && (
                  <button className="mh-sheet-btn cancel" onClick={handleCloseAll}>
                    취소
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Overlay>

      <TabBar />
    </div>
  );
}
