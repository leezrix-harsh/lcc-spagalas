import { customSounds } from '../config';

let context: AudioContext | null = null;
let muted = localStorage.getItem('lcc-spagalas-muted') === 'true';
let volume = Number(localStorage.getItem('lcc-spagalas-volume') ?? '0.55');
const customBuffers = new Map<string, AudioBuffer>();

window.addEventListener('storage', (event) => {
  if (event.key === 'lcc-spagalas-muted') muted = event.newValue === 'true';
  if (event.key === 'lcc-spagalas-volume' && event.newValue !== null) volume = Number(event.newValue);
});

export function setMuted(value: boolean): void {
  muted = value;
  localStorage.setItem('lcc-spagalas-muted', String(value));
}
export function getMuted(): boolean { return muted; }
export function setVolume(value: number): void {
  volume = value;
  localStorage.setItem('lcc-spagalas-volume', String(value));
}
export function getVolume(): number { return volume; }

export async function playSound(name: string): Promise<void> {
  if (muted) return;
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') await context.resume();
    const customPath = customSounds[name];
    if (customPath) {
      try {
        let buffer = customBuffers.get(name);
        if (!buffer) {
          const response = await fetch(customPath);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          buffer = await context.decodeAudioData(await response.arrayBuffer());
          customBuffers.set(name, buffer);
        }
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = buffer;
        gain.gain.value = volume;
        source.connect(gain).connect(context.destination);
        source.start();
        return;
      } catch (error) {
        console.warn(`Suara kustom "${name}" gagal dimuat; memakai suara sintesis.`, error);
      }
    }
    const now = context.currentTime;
    const notes: Record<string, number[]> = {
      benar: [523, 659, 784, 1047], salah: [110, 80], strike3: [100, 75, 100, 65],
      flip: [700], pilihSoal: [330, 440, 660], steal: [440, 415, 440, 415],
      tik: [880], waktuHabis: [620, 420, 260], menang: [523, 659, 784, 1047],
      intro: [523, 659, 784, 659, 784, 1047],
    };
    const sequence = notes[name] ?? [440];
    sequence.forEach((frequency, index) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      const start = now + index * (name === 'benar' || name === 'intro' ? 0.16 : 0.22);
      oscillator.type = name === 'salah' || name === 'strike3' ? 'sawtooth' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);
      if (name === 'salah' || name === 'waktuHabis') oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, frequency * 0.72), start + 0.28);
      gain.gain.setValueAtTime(Math.max(0.001, volume * 0.3), start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + (name === 'intro' ? 0.25 : 0.18));
      oscillator.connect(gain).connect(context!.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.3);
    });
  } catch (error) {
    console.warn('Efek suara tidak dapat diputar.', error);
  }
}
