import { useState } from 'react';
import type { Question } from '../game/types';

interface PickerProps {
  questions: Question[];
  played: string[];
  onSelect: (question: Question) => void;
}

export default function QuestionPicker({ questions, played, onSelect }: PickerProps) {
  const [query, setQuery] = useState('');
  const filtered = questions.filter((question) =>
    `${question.number} ${question.question}`.toLocaleLowerCase('id-ID').includes(query.toLocaleLowerCase('id-ID')),
  );
  return (
    <section className="control-card">
      <h2>Pilih soal <span className="muted">({questions.length})</span></h2>
      <input className="field" placeholder="Cari nomor atau kata kunci…" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="question-list">
        {filtered.map((question) => (
          <button className={`question-pick ${played.includes(question.id) ? 'played' : ''}`} key={question.id} onClick={() => onSelect(question)}>
            <span>{String(question.number).padStart(2, '0')}</span>
            <span>{question.question}</span>
            <span>{played.includes(question.id) ? '✓' : '›'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
