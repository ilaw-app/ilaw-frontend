import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { manualApi } from '../api/manual';
import type { ManualCategory } from '../api/types';
import TabBar from '../components/TabBar';
import './manual.css';

const S = { stroke: 'white', strokeWidth: 2.49989, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M20 13.0004C20 18.0004 16.5 20.5005 12.34 21.9505C12.1222 22.0243 11.8855 22.0207 11.67 21.9405C7.5 20.5005 4 18.0004 4 13.0004V6.00045C4 5.73523 4.10536 5.48088 4.29289 5.29334C4.48043 5.10581 4.73478 5.00045 5 5.00045C7 5.00045 9.5 3.80045 11.24 2.28045C11.4519 2.09945 11.7214 2 12 2C12.2786 2 12.5481 2.09945 12.76 2.28045C14.51 3.81045 17 5.00045 19 5.00045C19.2652 5.00045 19.5196 5.10581 19.7071 5.29334C19.8946 5.48088 20 5.73523 20 6.00045V13.0004Z" {...S} />
  </svg>
);
const IconBriefcase = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15.9996 20V4C15.9996 3.46957 15.7889 2.96086 15.4138 2.58579C15.0388 2.21071 14.5301 2 13.9996 2H9.99963C9.4692 2 8.96049 2.21071 8.58542 2.58579C8.21035 2.96086 7.99963 3.46957 7.99963 4V20" {...S} />
    <path d="M19.9999 6H3.99991C2.89534 6 1.99991 6.89543 1.99991 8V18C1.99991 19.1046 2.89534 20 3.99991 20H19.9999C21.1045 20 21.9999 19.1046 21.9999 18V8C21.9999 6.89543 21.1045 6 19.9999 6Z" {...S} />
  </svg>
);
const IconMoney = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M11.9995 2V22" {...S} />
    <path d="M16.9997 5H9.49973C8.57147 5 7.68123 5.36875 7.02485 6.02513C6.36847 6.6815 5.99973 7.57174 5.99973 8.5C5.99973 9.42826 6.36847 10.3185 7.02485 10.9749C7.68123 11.6313 8.57147 12 9.49973 12H14.4997C15.428 12 16.3182 12.3687 16.9746 13.0251C17.631 13.6815 17.9997 14.5717 17.9997 15.5C17.9997 16.4283 17.631 17.3185 16.9746 17.9749C16.3182 18.6313 15.428 19 14.4997 19H5.99973" {...S} />
  </svg>
);
const IconTriangle = () => (
  <svg width="23" height="21" viewBox="0 0 23 21" fill="none">
    <path d="M20.9979 16.2639L12.9979 2.2639C12.8235 1.9561 12.5705 1.70008 12.2649 1.52197C11.9592 1.34385 11.6117 1.25 11.2579 1.25C10.9041 1.25 10.5567 1.34385 10.251 1.52197C9.94533 1.70008 9.69237 1.9561 9.51793 2.2639L1.51793 16.2639C1.34162 16.5693 1.24916 16.9158 1.24994 17.2684C1.25072 17.621 1.34471 17.9671 1.52238 18.2717C1.70005 18.5763 1.95508 18.8285 2.26163 19.0027C2.56818 19.177 2.91534 19.2671 3.26794 19.2639H19.2679C19.6188 19.2635 19.9635 19.1709 20.2672 18.9952C20.571 18.8195 20.8232 18.567 20.9984 18.263C21.1737 17.959 21.266 17.6143 21.2659 17.2634C21.2658 16.9125 21.1734 16.5678 20.9979 16.2639Z" {...S} />
  </svg>
);
const IconWifi = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M11.9995 19.999H12.0095" {...S} />
    <path d="M2 8.81966C4.75011 6.35989 8.31034 5 12 5C15.6897 5 19.2499 6.35989 22 8.81966" {...S} />
    <path d="M4.99976 12.8586C6.86904 11.0263 9.38223 10 11.9998 10C14.6173 10 17.1305 11.0263 18.9998 12.8586" {...S} />
    <path d="M8.4996 16.4283C9.43425 15.5122 10.6908 14.999 11.9996 14.999C13.3084 14.999 14.565 15.5122 15.4996 16.4283" {...S} />
  </svg>
);
const IconBaby = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M8.99957 11.999H9.00957" {...S} />
    <path d="M14.9993 11.999H15.0093" {...S} />
    <path d="M9.99954 15.999C10.4995 16.299 11.1995 16.499 11.9995 16.499C12.7995 16.499 13.4995 16.299 13.9995 15.999" {...S} />
    <path d="M19 6.3C19.906 7.43567 20.5236 8.77378 20.8 10.2C21.1381 10.3638 21.4233 10.6195 21.6229 10.9378C21.8224 11.2562 21.9282 11.6243 21.9282 12C21.9282 12.3757 21.8224 12.7438 21.6229 13.0622C21.4233 13.3805 21.1381 13.6362 20.8 13.8C20.3683 15.8135 19.2592 17.618 17.6577 18.9125C16.0562 20.207 14.0592 20.9132 12 20.9132C9.94076 20.9132 7.94379 20.207 6.34231 18.9125C4.74083 17.618 3.63171 15.8135 3.2 13.8C2.86186 13.6362 2.57668 13.3805 2.37714 13.0622C2.17761 12.7438 2.07178 12.3757 2.07178 12C2.07178 11.6243 2.17761 11.2562 2.37714 10.9378C2.57668 10.6195 2.86186 10.3638 3.2 10.2C3.61426 8.1705 4.71589 6.34602 6.31902 5.03437C7.92216 3.72271 9.92866 3.00418 12 3C14 3 15.5 4.1 15.5 5.5C15.5 6.9 14.6 8 13.5 8C12.7 8 12 7.6 12 7" {...S} />
  </svg>
);
const IconScale = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15.9993 16L18.9993 8L21.9993 16C21.1293 16.65 20.0793 17 18.9993 17C17.9193 17 16.8693 16.65 15.9993 16Z" {...S} />
    <path d="M1.99991 16L4.99991 8L7.99991 16C7.12991 16.65 6.07991 17 4.99991 17C3.91991 17 2.86991 16.65 1.99991 16Z" {...S} />
    <path d="M6.99966 20.999H16.9997" {...S} />
    <path d="M11.9995 3V21" {...S} />
    <path d="M3 7H5C7 7 10 6 12 5C14 6 17 7 19 7H21" {...S} />
  </svg>
);
const IconSchool = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 21H21" {...S} />
    <path d="M4 21V8.5L12 3.5L20 8.5V21" {...S} />
    <path d="M10 21V15.5H14V21" {...S} />
    <path d="M12 3.5V1.5" {...S} />
  </svg>
);

const IconLife = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3l9 6.5" {...S} />
    <path d="M5 9V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V9" {...S} />
    <path d="M9.5 21V14.5H14.5V21" {...S} />
  </svg>
);

// slug → 아이콘 (BE가 새 카테고리를 추가하면 기본 아이콘으로 표시됨)
const ICON_BY_SLUG: Record<string, () => React.ReactElement> = {
  'child-abuse': IconShield,
  labor: IconBriefcase,
  finance: IconMoney,
  'sexual-violence': IconTriangle,
  'online-violence': IconWifi,
  'birth-and-parenting': IconBaby,
  'parental-rights': IconScale,
  'school-violence': IconSchool,
  'out-of-school-youth': IconLife,
};
const DEFAULT_ICON = IconShield;

// slug → 카드 배경 사진 (있는 것만). 없으면 기본(초록) 카드 그대로.
// 새 사진은 public/assets/manual/<slug>.jpg 로 넣고 여기 한 줄 추가.
const IMAGE_BY_SLUG: Record<string, string> = {
  'child-abuse': '/assets/manual/child-abuse.jpg',
};

// API 실패 시 최소 화면 유지용 폴백 (실제 API 응답과 동일한 순서/이름/개수로 맞춰 첫 렌더 깜빡임 방지)
const FALLBACK_CATEGORIES: ManualCategory[] = [
  { id: 4, name: '아동학대/가정폭력', slug: 'child-abuse', order: 1 },
  { id: 2, name: '노동', slug: 'labor', order: 2 },
  { id: 1, name: '금융', slug: 'finance', order: 3 },
  { id: 3, name: '성폭력', slug: 'sexual-violence', order: 4 },
  { id: 5, name: '온라인폭력', slug: 'online-violence', order: 5 },
  { id: 6, name: '출생/양육', slug: 'birth-and-parenting', order: 6 },
  { id: 7, name: '법정대리인', slug: 'parental-rights', order: 7 },
  { id: 69, name: '학교폭력', slug: 'school-violence', order: 8 },
  { id: 95, name: '학교 밖 청소년', slug: 'out-of-school-youth', order: 9 },
];

// 직전 성공 응답을 캐시 → 재방문 시 즉시 최신 목록으로 렌더(BE가 카테고리를 바꿔도 깜빡임 없음)
const CACHE_KEY = 'ilaw.manualCategories';
function readCache(): ManualCategory[] | null {
  try {
    const s = localStorage.getItem(CACHE_KEY);
    if (s) {
      const arr = JSON.parse(s);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch { /* noop */ }
  return null;
}

export default function Manual() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ManualCategory[]>(() => readCache() ?? FALLBACK_CATEGORIES);

  useEffect(() => {
    let cancelled = false;
    manualApi
      .categories()
      .then((cats) => {
        if (!cancelled && Array.isArray(cats) && cats.length) {
          setCategories(cats);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(cats)); } catch { /* noop */ }
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="screen">
      <div className="screen-scroll manual-scroll">
        <div className="manual-header">
          <h1>매뉴얼</h1>
          <p>상황에 맞는 법률 정보를 확인해보세요</p>
        </div>
        <div className="manual-list">
          {categories.map((cat) => {
            const Icon = ICON_BY_SLUG[cat.slug] ?? DEFAULT_ICON;
            const image = IMAGE_BY_SLUG[cat.slug];
            return (
              <button
                key={cat.slug}
                className={`manual-card${image ? ' has-image' : ''}`}
                style={image ? { backgroundImage: `url(${image})` } : undefined}
                onClick={() => navigate(`/manual-list?categoryId=${cat.slug}`)}
              >
                <span className="manual-icon">
                  <Icon />
                </span>
                <span className="manual-card-label">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <TabBar />
    </div>
  );
}
