// Toast — foundation-gap fill ([state] 에러/중복/네트워크) for states without a dedicated frame.
// Tokenized from the modal palette for consistency (no new visual language). Auto-dismiss + manual.

import { useEffect, type CSSProperties } from 'react';
import { color, radius, font, shadow } from '@/shared/ui/tokens';

export type ToastTone = 'success' | 'info' | 'error';

interface ToastProps {
  message: string;
  tone: ToastTone;
  onDismiss: () => void;
}

const toneBg: Record<ToastTone, string> = {
  success: color.modalBg,
  info: color.modalBg,
  error: color.errorToastBg,
};

const toneAccent: Record<ToastTone, string> = {
  success: color.green,
  info: color.textPrimary,
  error: color.textPrimary,
};

export function Toast({ message, tone, onDismiss }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 4000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  const style: CSSProperties = {
    position: 'fixed',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 16px',
    borderRadius: radius.field,
    background: toneBg[tone],
    border: `1px solid ${color.borderSubtle}`,
    boxShadow: shadow.modal,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    zIndex: 2147483647,
    maxWidth: 480,
  };

  return (
    <div role="status" style={style} onClick={onDismiss}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: toneAccent[tone], flexShrink: 0 }} />
      <span
        style={{
          fontFamily: font.family,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '130%',
          letterSpacing: font.letterSpacing,
          color: color.textPrimary,
        }}
      >
        {message}
      </span>
    </div>
  );
}
