function toHex(c: number) { const h = c.toString(16).padStart(2, '0'); return h }
function rgbToHex(r: number, g: number, b: number) { return `#${toHex(r)}${toHex(g)}${toHex(b)}` }
function distance(a: [number, number, number], b: [number, number, number]) { return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2) }
function clamp(n: number, min = 0, max = 255) { return Math.max(min, Math.min(max, n)) }
function adjustLightness([r, g, b]: [number, number, number], factor: number): [number, number, number] { return [clamp(r*factor), clamp(g*factor), clamp(b*factor)] }

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#','')
  const r = parseInt(m.substring(0,2), 16)
  const g = parseInt(m.substring(2,4), 16)
  const b = parseInt(m.substring(4,6), 16)
  return [r,g,b]
}

function relativeLuminance([r,g,b]: [number, number, number]) {
  const srgb = [r,g,b].map(v => {
    const c = v/255
    return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4)
  }) as [number,number,number]
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2]
}

export async function applyBrandPalette(url: string) {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const loaded: Promise<void> = new Promise((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = (e) => reject(e)
    })
    img.src = url
    await loaded

    const canvas = document.createElement('canvas')
    const w = 64, h = 64
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data

    const map = new Map<string, { rgb: [number, number, number]; count: number }>()
    for (let i=0;i<data.length;i+=4) {
      const r = data[i], g = data[i+1], b = data[i+2]
      // quantize in 16-level buckets
      const qr = r >> 4, qg = g >> 4, qb = b >> 4
      const key = `${qr}-${qg}-${qb}`
      const rgb: [number, number, number] = [qr*16, qg*16, qb*16]
      const entry = map.get(key)
      if (entry) entry.count++
      else map.set(key, { rgb, count: 1 })
    }
    const top = Array.from(map.values()).sort((a,b)=>b.count-a.count).slice(0, 20)
    const picked: [number, number, number][] = []
    for (const c of top) {
      if (picked.every(p => distance(p, c.rgb) > 60)) picked.push(c.rgb)
      if (picked.length >= 4) break
    }
    while (picked.length < 4 && top[picked.length]) picked.push(top[picked.length].rgb)

    const [c1,c2,c3,c4] = picked
    const primary = rgbToHex(...adjustLightness(c1, 1.0))
    const secondary = rgbToHex(...adjustLightness(c2 ?? c1, 1.0))
    const accent = rgbToHex(...adjustLightness(c3 ?? c1, 1.0))
    const muted = rgbToHex(...adjustLightness(c4 ?? c1, 0.8))
    const primaryDark = rgbToHex(...adjustLightness(c1, 0.8))

    const root = document.documentElement
    root.style.setProperty('--brand-1', primary)
    root.style.setProperty('--brand-2', secondary)
    root.style.setProperty('--brand-3', accent)
    root.style.setProperty('--brand-4', muted)
    root.style.setProperty('--color-primary', primary)
    root.style.setProperty('--color-primary-dark', primaryDark)
    root.style.setProperty('--color-secondary', secondary)
    root.style.setProperty('--color-accent', accent)
    root.style.setProperty('--color-muted', muted)

    // Ajuste de contraste para textos sobre cor primária
    const lum = relativeLuminance(hexToRgb(primary))
    const contrastText = lum > 0.6 ? '#0b1020' : '#ffffff'
    root.style.setProperty('--primary-contrast', contrastText)
  } catch (e) {
    // fallback: mantém tema padrão
    console.warn('applyBrandPalette failed, using defaults', e)
  }
}