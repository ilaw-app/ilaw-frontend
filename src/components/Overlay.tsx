import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import './Overlay.css';

// RN AppModal 웹 대체 — 폰 프레임(#app-frame) 안에 절대배치로 덮는 오버레이
export function Overlay({
  visible,
  onClose,
  children,
  align = 'center',
  dim = 0.45,
}: {
  visible: boolean;
  onClose?: () => void;
  children: ReactNode;
  align?: 'center' | 'bottom';
  dim?: number;
}) {
  if (!visible) return null;
  const host = document.getElementById('app-frame') ?? document.body;
  return createPortal(
    <div
      className={`overlay${align === 'bottom' ? ' overlay-bottom' : ''}`}
      style={{
        background: `rgba(0,0,0,${dim})`,
        alignItems: align === 'bottom' ? 'flex-end' : 'center',
      }}
      onClick={onClose}
    >
      <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    host
  );
}
