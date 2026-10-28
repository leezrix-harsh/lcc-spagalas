import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface WinnerProps {
  name: string;
  onClose?: () => void;
}

export default function Winner({ name, onClose }: WinnerProps) {
  useEffect(() => {
    void confetti({ particleCount: 150, spread: 90, colors: ['#C8102E', '#FFFDF7', '#F6B800'] });
  }, []);
  return (
    <div className="winner-screen">
      <div className="winner-card">
        <p>PEMENANG LCC SPAGALAS</p>
        <h1>{name}</h1>
        {onClose && <button className="button button-gold" onClick={onClose}>Kembali ke papan</button>}
      </div>
    </div>
  );
}
