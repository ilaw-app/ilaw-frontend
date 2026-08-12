// 마크다운 굵게(**...**)·HTML 태그를 제거해 목록/카드 미리보기용 평문으로 변환
export function stripMd(s?: string): string {
  return (s ?? '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/<[^>]+>/g, ' ');
}
