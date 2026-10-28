interface StrikeOverlayProps {
  version: number;
}

export default function StrikeOverlay({ version }: StrikeOverlayProps) {
  if (!version) return null;
  return <div className="strike-overlay" key={version} aria-label="Jawaban salah">×</div>;
}
