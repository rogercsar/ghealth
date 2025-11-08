// Camada de sensores: tenta usar Capacitor quando disponível e faz fallback web
export type BloodPressure = { sys: number; dia: number }

export class Sensors {
  private lastSteps = 0

  async getStepDelta(): Promise<number> {
    // Web fallback: simula poucos passos por ciclo
    // Em mobile, integre com @capawesome/capacitor-health para ler passos
    try {
      // dynamic import example (evita quebrar web):
      // const { Health } = await import('@capawesome/capacitor-health')
      // const res = await Health.getQuantity({ type: 'steps', startDate: new Date(Date.now()-3000), endDate: new Date() })
      // const delta = res?.value ?? 0
      const delta = Math.random() < 0.4 ? Math.floor(Math.random() * 12) : 0
      this.lastSteps += delta
      return delta
    } catch {
      const delta = Math.random() < 0.3 ? 3 : 0
      this.lastSteps += delta
      return delta
    }
  }

  async readHeartRate(): Promise<number | null> {
    // Web fallback: valor sintético próximo de 65-110
    // Em mobile, usar Health.getQuantity('heartRate') ou wearable via BLE
    return Math.round(65 + Math.random() * 45)
  }

  async readBloodPressure(): Promise<BloodPressure | null> {
    // Sem leitura real no web
    const sys = Math.round(110 + Math.random() * 20)
    const dia = Math.round(70 + Math.random() * 15)
    return { sys, dia }
  }

  async estimateCalories(mode: 'SONO' | 'ATLETA' | 'REPOUSO'): Promise<number | null> {
    const base = mode === 'ATLETA' ? 6 : mode === 'REPOUSO' ? 2 : 1
    return Math.round(base + Math.random() * base)
  }
}