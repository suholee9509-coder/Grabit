/**
 * 사용자 생성 텍스트 무해화(순수) — 폴더명·메모 발췌 등 echo 시 방어선.
 * React JSX 텍스트 보간은 기본 HTML 이스케이프(누출 0의 1차선)이나, 제어문자·과도 길이·
 * 앵글브래킷 잔재를 추가로 정리해 title/aria 등 속성 echo 시에도 안전하게 한다.
 * (DOM 삽입은 절대 dangerouslySetInnerHTML로 하지 않음 — 텍스트 노드만.)
 */

/** 제어문자(C0: U+0000–U+001F, C1: U+007F–U+009F) 여부 — 리터럴/정규식 제어범위 없이 코드포인트로 판정. */
function isControlChar(code: number): boolean {
  return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
}

export function sanitizeUserText(raw: string | null | undefined, maxLen = 500): string {
  if (raw == null) return '';
  let out = '';
  for (const ch of String(raw)) {
    const code = ch.codePointAt(0) ?? 0;
    if (ch === '\n' || ch === '\r' || ch === '\t') {
      out += ' '; // 개행/탭 -> 공백
    } else if (isControlChar(code)) {
      continue; // 제어문자 제거
    } else if (ch === '<' || ch === '>') {
      continue; // 앵글브래킷 제거(태그 주입 잔재 방지)
    } else {
      out += ch;
    }
    if (out.length >= maxLen) break;
  }
  return out.slice(0, maxLen).trim();
}
