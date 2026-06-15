import type { AuthorTone } from '../model/types';

/**
 * 작성자 직군 라벨 가변색 → CSS module 클래스 매핑(측정 mint/violet/magenta).
 * 카드 컴포넌트 공용(rec/grid/cross/grab/stream). 색 자체는 각 module.css의 .toneXxx에 토큰으로 정의.
 */
export function toneClass(tone: AuthorTone, styleMap: Record<string, string>): string {
  if (tone === 'mint') return styleMap.toneMint;
  if (tone === 'magenta') return styleMap.toneMagenta;
  return styleMap.toneViolet;
}
