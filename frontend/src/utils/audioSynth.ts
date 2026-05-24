class AudioSynth {
  constructor() {
    this.ctx = null
  }

  initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (AudioContextClass) {
        this.ctx = new AudioContextClass()
      }
    }
  }

  isMuted() {
    return localStorage.getItem('learnflow_sound_muted') === 'true'
  }

  playComplete() {
    if (this.isMuted()) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime

      // Note 1: E5 (659.25 Hz)
      const osc1 = this.ctx.createOscillator()
      const gain1 = this.ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(659.25, now)

      gain1.gain.setValueAtTime(0.1, now)
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

      osc1.connect(gain1)
      gain1.connect(this.ctx.destination)

      osc1.start(now)
      osc1.stop(now + 0.15)

      // Note 2: A5 (880 Hz) starting slightly later
      const osc2 = this.ctx.createOscillator()
      const gain2 = this.ctx.createGain()
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(880.0, now + 0.08)

      gain2.gain.setValueAtTime(0.12, now + 0.08)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc2.connect(gain2)
      gain2.connect(this.ctx.destination)

      osc2.start(now + 0.08)
      osc2.stop(now + 0.4)
    } catch {
      /* ignore audio context restrictions */
    }
  }

  playLevelUp() {
    if (this.isMuted()) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5] // C4, E4, G4, C5, E5, G5, C6 (C Major Arpeggio)

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.07
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        // alternate wave types for that classic retro feel
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine'
        osc.frequency.setValueAtTime(freq, noteStart)

        gain.gain.setValueAtTime(0.08, noteStart)
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(noteStart)
        osc.stop(noteStart + 0.3)
      })
    } catch {
      /* ignore */
    }
  }
}

export const audioSynth = new AudioSynth()
