// 마크다운 굵게(**...**)·HTML 태그를 제거해 목록/카드 미리보기용 평문으로 변환
export function stripMd(s?: string): string {
  return (s ?? '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/<[^>]+>/g, ' ');
}

// 매뉴얼 질문 앞에 붙는 장식용 이모지(❓ + 이형 선택자)·공백 제거
export function cleanManualQuestion(q?: string): string {
  return (q ?? '').replace(/^[\s❓️]+/, '').trim();
}

// 상세 content 맨 앞 <blockquote>가 summary와 같은 문장이면 제거(답변 중복 방지).
// summary가 없으면 blockquote가 유일한 답변일 수 있으므로 건드리지 않는다.
export function stripDuplicateSummary(content?: string | null, summary?: string | null): string {
  const html = content ?? '';
  const sum = (summary ?? '').replace(/\s/g, '');
  if (!sum) return html;
  const m = html.match(/^\s*<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (!m) return html;
  const bqText = m[1].replace(/<[^>]+>/g, '').replace(/\s/g, '');
  if (bqText && (bqText === sum || bqText.includes(sum) || sum.includes(bqText))) {
    return html.slice(m[0].length);
  }
  return html;
}
