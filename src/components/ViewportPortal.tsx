import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Keep viewport overlays outside animated and scrolling page containers. */
export default function ViewportPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
