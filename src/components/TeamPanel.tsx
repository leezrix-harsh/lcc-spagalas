interface TeamPanelProps {
  name: string;
  score: number;
  active: boolean;
  strikes: number;
  side: number;
}

export default function TeamPanel({ name, score, active, strikes, side }: TeamPanelProps) {
  return (
    <section className={`team-panel ${active ? 'team-active' : ''}`}>
      <div className="team-label">{name || `Tim ${side + 1}`}</div>
      <div className="team-score">{score}</div>
      <div className="strike-row" aria-label={`${strikes} strike`}>
        {[0, 1, 2].map((strike) => <span className={strike < strikes ? 'strike-mark hit' : 'strike-mark'} key={strike}>×</span>)}
      </div>
    </section>
  );
}
