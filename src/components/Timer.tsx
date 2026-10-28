interface TimerProps {
  seconds: number;
  duration: number;
}

export default function Timer({ seconds, duration }: TimerProps) {
  if (!duration) return null;
  return <div className={`timer ${seconds <= 5 ? 'timer-urgent' : ''}`} aria-live="polite">{seconds}</div>;
}
