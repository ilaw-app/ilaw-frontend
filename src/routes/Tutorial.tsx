import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './tutorial.css';

const TUTORIAL_IMAGES = Array.from({ length: 8 }, (_, i) => `/assets/tutorial/tutorial_${i + 1}.png`);

export default function Tutorial() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const last = idx === TUTORIAL_IMAGES.length - 1;

  const finish = () => navigate('/home', { replace: true });
  const next = () => (last ? finish() : setIdx((i) => i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  return (
    <div className="tut">
      <img className="tut-img" src={TUTORIAL_IMAGES[idx]} alt={`튜토리얼 ${idx + 1}/${TUTORIAL_IMAGES.length}`} />

      {/* 좌/우 탭 영역 (왼쪽=이전, 오른쪽=다음) */}
      <button className="tut-zone tut-zone-left" onClick={prev} aria-label="이전" />
      <button className="tut-zone tut-zone-right" onClick={next} aria-label="다음" />

      {/* 건너뛰기 */}
      <button className="tut-skip" onClick={finish}>건너뛰기</button>

      {/* 하단: 진행 점 + 다음/시작하기 */}
      <div className="tut-bottom">
        <div className="tut-dots">
          {TUTORIAL_IMAGES.map((_, i) => (
            <span key={i} className={`tut-dot${i === idx ? ' active' : ''}`} />
          ))}
        </div>
        <button className="tut-next" onClick={next}>
          {last ? '시작하기' : '다음'}
        </button>
      </div>
    </div>
  );
}
