// Popup React shell (spec [behavior] popup) — minimal: 로그인 상태 / 계정 / 현재 페이지 클립 가능 여부.
// No dedicated Figma frame ([디자인 공백]) → filled from the foundation tokens (same dark palette as
// the clip modal) for consistency. The popup never touches tokens/network itself; it asks the
// background SW for auth state and triggers sign-in / sign-out there.

import { useCallback, useEffect, useState } from 'react';
import { color, radius, font } from '@/shared/ui/tokens';
import { sendToBackground } from '@/shared/messaging/protocol';
import type { AuthState } from '@/shared/auth/session-manager';

const labelText = {
  fontFamily: font.family,
  letterSpacing: font.letterSpacing,
} as const;

export function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [clippable, setClippable] = useState(false);

  const refresh = useCallback(async () => {
    const res = await sendToBackground<{ type: 'AUTH_STATE'; state: AuthState }>({
      type: 'GET_AUTH_STATE',
    });
    setAuth(res.state);
  }, []);

  useEffect(() => {
    void refresh();
    // current page clippable iff it's a YouTube watch page.
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      const url = tab?.url ?? '';
      setClippable(/^https:\/\/(www\.|m\.|music\.)?youtube\.com\/watch/.test(url));
    });
  }, [refresh]);

  async function signIn() {
    await sendToBackground({ type: 'SIGN_IN' });
    window.close(); // login opens in a tab; the popup closes.
  }

  async function signOut() {
    await sendToBackground({ type: 'SIGN_OUT' });
    await refresh();
  }

  return (
    <main
      style={{
        ...labelText,
        width: 320,
        padding: 16,
        background: color.modalBg,
        color: color.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ ...labelText, fontWeight: 700, fontSize: 18, color: color.green }}>Grabit</span>
      </header>

      {/* auth status */}
      {auth?.status === 'signed-in' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row label="로그인됨" value={auth.email ?? '계정'} />
          <button type="button" style={ghostButton} onClick={() => void signOut()}>
            로그아웃
          </button>
        </div>
      ) : auth?.status === 'unconfigured' ? (
        <p style={{ ...labelText, margin: 0, fontSize: 13, color: color.textSecondary }}>
          확장이 아직 연결되지 않았어요. 설정을 확인해주세요.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ ...labelText, margin: 0, fontSize: 13, color: color.textSecondary }}>
            로그인하면 영상 구간을 클립할 수 있어요.
          </p>
          <button type="button" style={primaryButton} onClick={() => void signIn()}>
            로그인
          </button>
        </div>
      )}

      {/* current page clippability */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: radius.field,
          border: `1px solid ${color.borderSubtle}`,
          fontSize: 13,
          color: clippable ? color.textPrimary : color.textSecondary,
        }}
      >
        {clippable
          ? '이 페이지에서 클립할 수 있어요. 영상의 [영상 인사이트 얻기] 버튼을 눌러보세요.'
          : '영상(YouTube) 페이지에서 클립할 수 있어요.'}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ ...labelText, fontSize: 12, color: color.textSecondary }}>{label}</span>
      <span
        style={{
          ...labelText,
          fontSize: 14,
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}

const primaryButton = {
  ...labelText,
  height: 38,
  borderRadius: radius.field,
  background: color.green,
  color: color.greenText,
  border: 'none',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
} as const;

const ghostButton = {
  ...labelText,
  height: 34,
  borderRadius: radius.field,
  background: 'transparent',
  color: color.textSecondary,
  border: `1px solid ${color.borderSubtle}`,
  fontSize: 13,
  cursor: 'pointer',
} as const;
