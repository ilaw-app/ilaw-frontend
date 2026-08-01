// 커뮤니티 글/댓글 메뉴용 아이콘 (피그마 지정 SVG)

// 삭제하기 — 빨강(#E7000B) 휴지통
export function TrashRedIcon({ w = 13, h = 15 }: { w?: number; h?: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 13 15" fill="none">
      <path
        d="M11.9631 0.666992V11.9329C11.9631 12.7376 11.1562 13.5423 10.3493 13.5423H2.28072C1.47385 13.5423 0.666992 12.7376 0.666992 11.9329V0.666992"
        stroke="#E7000B"
        strokeWidth="1.33308"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 수정하기 — 빨강(#E7000B)
export function EditRedIcon({ w = 17, h = 17 }: { w?: number; h?: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 19 19" fill="none">
      <path
        d="M6.25384 15.8337C7.7648 16.6088 9.50291 16.8187 11.155 16.4257C12.807 16.0326 14.2644 15.0625 15.2644 13.69C16.2644 12.3175 16.7414 10.633 16.6093 8.93999C16.4772 7.24697 15.7448 5.6568 14.544 4.45602C13.3432 3.25523 11.7531 2.52281 10.06 2.39073C8.36703 2.25866 6.68251 2.73561 5.31003 3.73564C3.93756 4.73567 2.96739 6.19303 2.57435 7.84508C2.18131 9.49713 2.39125 11.2352 3.16634 12.7462L1.58301 17.417L6.25384 15.8337Z"
        stroke="#E7000B"
        strokeWidth="0.99945"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 삭제 확인 바텀시트용 — 회색 휴지통 (QnA와 동일)
export function TrashSheetIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M3.5 7H24.4996" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22.166 7V23.333C22.166 24.4996 20.9994 25.6663 19.8327 25.6663H8.16629C6.99965 25.6663 5.83301 24.4996 5.83301 23.333V7" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.33301 7.00055V4.66727C9.33301 3.50063 10.4996 2.33398 11.6663 2.33398H16.3329C17.4995 2.33398 18.6661 3.50063 18.6661 4.66727V7.00055" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.666 12.834V19.8338" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.333 12.834V19.8338" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
