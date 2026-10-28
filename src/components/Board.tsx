import type { Question } from '../game/types';

interface BoardProps {
  question: Question | null;
  opened: boolean[];
  onAnswer?: (index: number) => void;
  locked?: boolean;
  revealOnHost?: boolean;
}

export default function Board({ question, opened, onAnswer, locked = false, revealOnHost = false }: BoardProps) {
  return (
    <section className="board-frame">
      {question ? <h2 className="question-text">{question.question}</h2> : <h2 className="question-text">Pilih soal untuk memulai permainan</h2>}
      <div className="answer-grid">
        {question?.answers.map((answer, index) => (
          <button
            className={`answer-slot ${opened[index] ? 'is-open' : ''}`}
            key={`${question.id}-${index}`}
            onClick={() => onAnswer?.(index)}
            disabled={locked || opened[index] || !onAnswer}
            aria-label={`Jawaban ${index + 1}${opened[index] ? `: ${answer.text}` : ', tertutup'}`}
          >
            <span className="slot-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="answer-text">{opened[index] || revealOnHost ? answer.text.toLocaleUpperCase('id-ID') : '••••••••••'}</span>
            <span className="answer-points">{opened[index] || revealOnHost ? answer.points : '?'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
