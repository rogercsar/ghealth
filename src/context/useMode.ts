import { useContext } from 'react'
import { Ctx } from './mode-context'

export function useMode() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useMode must be used within ModeProvider')
  return v
}
