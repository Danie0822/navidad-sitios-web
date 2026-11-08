/* Propósito: íconos SVG navideños reutilizables sin dependencias externas. */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { title?: string }

export function IconRegalo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3" y="8" width="18" height="13" rx="2" strokeWidth="1.5" />
      <path d="M12 8v13" strokeWidth="1.5" />
      <path d="M3 12h18" strokeWidth="1.5" />
      <path d="M7 6c0-1.1.9-2 2-2 1.9 0 3 2 3 2s-1.1 2-3 2c-1.1 0-2-.9-2-2Z" strokeWidth="1.5" />
      <path d="M17 6c0-1.1-.9-2-2-2-1.9 0-3 2-3 2s1.1 2 3 2c1.1 0 2-.9 2-2Z" strokeWidth="1.5" />
    </svg>
  )
}

export function IconArbol(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 3l3 4h-2l2 3h-2l3 4h-4v4H9v-4H5l3-4H6l2-3H6l3-4Z" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCopos(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 2v20M4 6l16 12M4 18L20 6M2 12h20" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconCampana(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 3a5 5 0 00-5 5v2.5L5 13v2h14v-2l-2-2.5V8a5 5 0 00-5-5Z" strokeWidth="1.5" />
      <circle cx="12" cy="18" r="2" strokeWidth="1.5" />
    </svg>
  )
}

export function IconEstrella(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M12 2l2.9 6 6.6.6-5 4.4 1.5 6.5L12 16.8 6 19.5l1.5-6.5-5-4.4 6.6-.6L12 2z" />
    </svg>
  )
}
