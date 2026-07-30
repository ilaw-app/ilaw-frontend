import { Fragment, type ReactNode } from 'react';

// 가벼운 마크다운 렌더러 (변호사 답변용).
// 지원: # / ## / ### 제목, **볼드**, `- `·`* ` 불릿, `1.` 번호, `> ` 인용, 빈 줄 문단 구분.
// dangerouslySetInnerHTML 대신 React 엘리먼트로 렌더 → XSS 안전.

function renderInline(text: string, keyBase: string): ReactNode[] {
  // **볼드** 파싱
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(p);
    if (m) return <strong key={`${keyBase}-b${i}`}>{m[1]}</strong>;
    return <Fragment key={`${keyBase}-t${i}`}>{p}</Fragment>;
  });
}

const isBullet = (l: string) => /^\s*[-*]\s+/.test(l);
const isOrdered = (l: string) => /^\s*\d+\.\s+/.test(l);
const isHeading = (l: string) => /^#{1,3}\s+/.test(l);
const isQuote = (l: string) => /^\s*>\s?/.test(l);
const isBlock = (l: string) => isBullet(l) || isOrdered(l) || isHeading(l) || isQuote(l);

export function Markdown({ text, className }: { text: string; className?: string }) {
  const lines = (text ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    // 제목
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const Tag = (['h2', 'h3', 'h4'] as const)[h[1].length - 1];
      blocks.push(<Tag key={key++}>{renderInline(h[2], `h${key}`)}</Tag>);
      i++;
      continue;
    }

    // 불릿 목록
    if (isBullet(line)) {
      const items: string[] = [];
      while (i < lines.length && isBullet(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((it, j) => (
            <li key={j}>{renderInline(it, `ul${key}-${j}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // 번호 목록
    if (isOrdered(line)) {
      const items: string[] = [];
      while (i < lines.length && isOrdered(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={key++}>
          {items.map((it, j) => (
            <li key={j}>{renderInline(it, `ol${key}-${j}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // 인용
    if (isQuote(line)) {
      const quote: string[] = [];
      while (i < lines.length && isQuote(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote key={key++}>
          {quote.map((q, j) => (
            <Fragment key={j}>
              {renderInline(q, `q${key}-${j}`)}
              {j < quote.length - 1 && <br />}
            </Fragment>
          ))}
        </blockquote>
      );
      continue;
    }

    // 문단 (빈 줄 또는 블록 시작 전까지)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !isBlock(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++}>
        {para.map((pl, j) => (
          <Fragment key={j}>
            {renderInline(pl, `p${key}-${j}`)}
            {j < para.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
    );
  }

  return <div className={className}>{blocks}</div>;
}
