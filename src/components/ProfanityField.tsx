import { useMemo, useRef, type CSSProperties, type KeyboardEvent, type UIEvent } from 'react';
import type { ProfanityMatch } from '../api/moderation';
import { flaggedWords, splitByMatches } from '../utils/profanity';
import './ProfanityField.css';

type Props = {
  as?: 'input' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  /** 서버가 돌려준 금칙어 구간. 있으면 해당 글자를 빨갛게 표시하고 안내문을 띄운다. */
  matches?: ProfanityMatch[];
  /** 기존 입력창 클래스. 컨트롤과 뒤의 하이라이트 레이어에 같이 적용돼 글꼴·여백이 일치한다. */
  className?: string;
  wrapClassName?: string;
  wrapStyle?: CSSProperties;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** 안내문 표시 여부 (댓글창처럼 좁은 곳은 밖에서 따로 표시) */
  hint?: boolean;
  hintClassName?: string;
};

/**
 * 금칙어를 입력창 안에서 빨간 글씨로 표시하는 input/textarea.
 * 네이티브 입력창은 글자 일부만 색칠할 수 없으므로, 같은 글꼴·여백의 레이어를 뒤에 깔고
 * 걸린 구간만 <mark>로 그린 뒤 입력창의 글자색을 투명하게 만든다(커서·선택은 그대로 동작).
 * 걸린 게 없을 땐 원래 입력창 그대로다.
 */
export default function ProfanityField({
  as = 'textarea',
  value,
  onChange,
  matches,
  className = '',
  wrapClassName = '',
  wrapStyle,
  placeholder,
  maxLength,
  disabled,
  autoFocus,
  onKeyDown,
  hint = true,
  hintClassName = '',
}: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const active = !!matches && matches.length > 0;
  const segments = useMemo(() => (active ? splitByMatches(value, matches) : []), [active, value, matches]);
  const words = useMemo(() => flaggedWords(matches), [matches]);

  const syncScroll = (el: HTMLElement) => {
    const b = backdropRef.current;
    if (!b) return;
    b.scrollTop = el.scrollTop;
    b.scrollLeft = el.scrollLeft;
  };

  const controlClass = `${className} pf-control${active ? ' pf-active' : ''}`;
  const common = {
    value,
    placeholder,
    maxLength,
    disabled,
    autoFocus,
    className: controlClass,
    'aria-invalid': active || undefined,
    onScroll: (e: UIEvent<HTMLElement>) => syncScroll(e.currentTarget),
  };

  return (
    <div className={`pf-wrap${active ? ' pf-invalid' : ''} ${wrapClassName}`} style={wrapStyle}>
      <div className="pf-box">
        {active && (
          <div ref={backdropRef} aria-hidden className={`${className} pf-backdrop pf-backdrop--${as}`}>
            {segments.map((s, i) =>
              s.flagged ? (
                <mark key={i} className="pf-mark">
                  {s.text}
                </mark>
              ) : (
                <span key={i}>{s.text}</span>
              ),
            )}
            {'\u200b'}
          </div>
        )}
        {as === 'input' ? (
          <input {...common} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} />
        ) : (
          <textarea {...common} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} />
        )}
      </div>
      {hint && active && (
        <div className={`pf-hint ${hintClassName}`} role="alert">
          부적절한 표현이 포함되어 있어 등록할 수 없어요: <b>{words.join(', ')}</b>
        </div>
      )}
    </div>
  );
}
