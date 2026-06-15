import { Cast, Check } from 'lucide-react';
import type { SVGProps } from 'react';

/**
 * 그리드 카드 아이콘 — lucide(아이콘셋 결정 2026-06-16).
 *   클립수 아이콘 = 측정 18×18 #999999(chromecast/cast 글리프, 2117:22182).
 *   다중선택 체크 = u0c 패턴(픽셀 SoT 부재 → 합리값).
 */
export function ClipCountIcon(props: SVGProps<SVGSVGElement>) {
  return <Cast width={18} height={18} strokeWidth={1.8} color="#999999" aria-hidden="true" {...props} />;
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return <Check width={14} height={14} strokeWidth={2.4} color="#121212" aria-hidden="true" {...props} />;
}
