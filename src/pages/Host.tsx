import { useEffect, useMemo, useState } from 'react';
import type { Dispatch } from 'react';
import { CATEGORY_NAMES, DEFAULT_MULTIPLIERS, SESSIONS, TIMER_OPTIONS, type GradeCategory } from '../config';
import { getMuted, getVolume, playSound, setMuted, setVolume } from '../audio/sfx';
import type { GameAction, GameState, Question, TeamIndex } from '../game/types';
import Board from '../components/Board';
import QuestionPicker from '../components/QuestionPicker';
import TeamPanel from '../components/TeamPanel';
import Timer from '../components/Timer';

interface HostProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  questions: Question[];
  connected: boolean;
  emitSound: (name: string) => void;
}

export default function Host({ state, dispatch, questions, connected, emitSound }: HostProps) {
  const [muted, setMutedState] = useState(getMuted());
  const [volume, setVolumeState] = useState(getVolume());
  const [panelSound, setPanelSound] = useState(localStorage.getItem('lcc-spagalas-host-sound') === 'true');
  const [manualAmount, setManualAmount] = useState(10);
  const standing = state.categoryStandings[state.category];
  const teamNames = standing.teamNames;
  const scores = standing.scores;
  const currentQuestions = useMemo(
    () => questions.filter((question) => question.category === state.category && question.session === state.session),
    [questions, state.category, state.session],
  );
  const sound = (name: string) => { emitSound(name); if (panelSound && !muted) void playSound(name); };
  const selectQuestion = (question: Question) => { dispatch({ type: 'selectQuestion', question }); sound('pilihSoal'); };
  const openAnswer = (index: number) => {
    const alreadyOpen = state.opened[index];
    if (alreadyOpen || !state.selectedQuestion || state.control === null || state.roundDone) return;
    dispatch({ type: 'answer', index });
    sound('benar');
  };
  const strike = () => {
    if (!state.selectedQuestion || state.control === null || state.roundDone) return;
    dispatch({ type: 'strike' });
    if (state.strikes === 2) {
      sound('strike3');
      sound('steal');
    } else {
      sound('salah');
    }
  };
  const toggleMute = () => { const next = !muted; setMutedState(next); setMuted(next); };
  const fullscreen = () => document.documentElement.requestFullscreen?.();

  useEffect(() => {
    if (!state.timerRunning) return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => window.clearInterval(id);
  }, [state.timerRunning, dispatch]);
  useEffect(() => {
    if (state.timerDuration && state.seconds === 0 && !state.timerRunning) sound('waktuHabis');
    else if (state.timerRunning && state.seconds > 0 && state.seconds <= 5) sound('tik');
    // Dipicu hanya saat angka timer berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.seconds]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const key = event.key.toLowerCase();
      if (/^[1-7]$/.test(key)) openAnswer(Number(key) - 1);
      else if (key === 'x') strike();
      else if (key === 'a') dispatch({ type: 'control', team: 0 });
      else if (key === 'b') dispatch({ type: 'control', team: Math.min(1, teamNames.length - 1) });
      else if (key === 'n') dispatch({ type: 'nextQuestion' });
      else if (key === 't') dispatch({ type: 'timerToggle' });
      else if (key === 'z') dispatch({ type: 'undo' });
      else if (key === 'm') toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, state, teamNames.length, muted, panelSound]);
  const randomQuestion = () => {
    const available = currentQuestions.filter((question) => !state.played.includes(question.id));
    if (available.length) selectQuestion(available[Math.floor(Math.random() * available.length)]);
  };
  const manualScore = (team: TeamIndex, amount: number) => dispatch({ type: 'manualScore', team, amount });
  const applyManualScore = (team: TeamIndex, direction: -1 | 1) => {
    if (Number.isSafeInteger(manualAmount) && manualAmount > 0) manualScore(team, manualAmount * direction);
  };
  const resetAll = () => { if (window.confirm('Reset semua skor dan progres permainan?')) dispatch({ type: 'resetAll' }); };
  const activeTeam = state.control === null ? 'Belum ditentukan' : teamNames[state.control];

  return (
    <main className="host-page">
      <header className="host-header">
        <a href="#/" className="back-link">← Beranda</a>
        <div><p className="eyebrow">PANEL OPERATOR</p><h1>LCC Spagalas <span>Family 100</span></h1></div>
        <div className={`connection ${connected ? 'online' : ''}`}><i /> Layar penonton: {connected ? 'Terhubung' : 'Belum terhubung'}</div>
      </header>
      <div className="host-layout">
        <aside className="host-sidebar">
          <section className="control-card">
            <h2>Pengaturan permainan</h2>
            <label>Kategori kelas<select className="field" value={state.category} onChange={(event) => dispatch({ type: 'category', category: event.target.value as GradeCategory })}>{CATEGORY_NAMES.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Sesi<select className="field" value={state.session} onChange={(event) => dispatch({ type: 'session', session: event.target.value as typeof SESSIONS[number] })}>{SESSIONS.map((session) => <option key={session}>{session}</option>)}</select></label>
            <label>Pengali poin ×{state.multipliers[state.session]}<input className="field" type="number" min="1" value={state.multipliers[state.session]} onChange={(event) => dispatch({ type: 'multiplier', session: state.session, value: Number(event.target.value) || DEFAULT_MULTIPLIERS[state.session] })} /></label>
            {teamNames.map((name, team) => <label key={team}>Nama tim {team + 1}<input className="field" value={name} onChange={(event) => dispatch({ type: 'teamName', team, value: event.target.value })} /></label>)}
            <label>Timer<select className="field" value={state.timerDuration} onChange={(event) => dispatch({ type: 'timerDuration', value: Number(event.target.value) })}>{TIMER_OPTIONS.map((time) => <option key={time} value={time}>{time ? `${time} detik` : 'Mati'}</option>)}</select></label>
            <label>Volume utama {Math.round(volume * 100)}%<input className="field" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => { const next = Number(event.target.value); setVolumeState(next); setVolume(next); }} /></label>
            <div className="inline-controls">
              <button className="small-button" onClick={toggleMute}>{muted ? 'Suara mati' : 'Suara aktif'}</button>
              <button className="small-button" onClick={() => { const next = !panelSound; setPanelSound(next); localStorage.setItem('lcc-spagalas-host-sound', String(next)); }}>Suara panel: {panelSound ? 'Aktif' : 'Mati'}</button>
            </div>
            <button className="small-button full-width" onClick={fullscreen}>Layar Penuh ⛶</button>
          </section>
          {currentQuestions.length > 0
            ? <QuestionPicker questions={currentQuestions} played={state.played} onSelect={selectQuestion} />
            : <section className="control-card"><h2>Soal belum tersedia</h2><p className="muted">Bank soal untuk {state.category} belum dimasukkan.</p></section>}
          <button className="button button-red full-width" onClick={randomQuestion}>Soal acak yang belum dimainkan</button>
        </aside>
        <section className="host-main">
          <div className="pot host-pot"><span>BANK RONDE</span><strong>{state.bank}</strong></div>
          <div className="host-score-row">
            {teamNames.map((name, team) => <TeamPanel name={name} score={scores[team]} active={state.control === team} strikes={state.control === team ? state.strikes : 0} side={team} key={team} />)}
          </div>
          <div className="control-card round-card">
            <div className="round-title"><h2>{state.selectedQuestion ? `Soal ${state.selectedQuestion.number}` : 'Belum ada soal'}</h2><span className="muted">Kontrol: {activeTeam}{state.stealing ? ' · STEAL' : ''}</span><Timer seconds={state.seconds} duration={state.timerDuration} /></div>
            <Board question={state.selectedQuestion} opened={state.opened} onAnswer={openAnswer} locked={state.control === null || state.roundDone} revealOnHost />
            <div className="action-row">
              {teamNames.map((name, team) => <button className={`button ${team % 2 ? 'button-team-b' : 'button-team-a'}`} onClick={() => dispatch({ type: 'control', team })} key={team}>{name} kontrol ({team + 1})</button>)}
              <button className="button button-red" onClick={strike}>Jawaban salah (X)</button>
              {state.timerDuration > 0 && <button className="button button-dark" onClick={() => dispatch({ type: 'timerToggle' })}>{state.timerRunning ? 'Hentikan timer' : 'Mulai timer'} (T)</button>}
            </div>
            <div className="action-row secondary-actions">
              <button className="small-button" onClick={() => { dispatch({ type: 'revealAll' }); sound('flip'); }}>Buka semua sisa jawaban</button>
              <button className="small-button" onClick={() => dispatch({ type: 'resetStrikes' })}>Reset strike</button>
              <button className="small-button" onClick={() => dispatch({ type: 'undo' })}>Undo (Z)</button>
              <button className="small-button" onClick={() => dispatch({ type: 'nextQuestion' })}>Soal berikutnya (N)</button>
            </div>
          </div>
          <div className="control-card manual-card">
            <h2>Skor manual</h2>
            <div className="manual-adjustment">
              <span>Nominal poin</span>
              <div className="manual-presets" aria-label="Pilihan nominal poin">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    className={`small-button ${manualAmount === amount ? 'preset-active' : ''}`}
                    key={amount}
                    onClick={() => setManualAmount(amount)}
                    aria-pressed={manualAmount === amount}
                  >
                    {amount}
                  </button>
                ))}
              </div>
              <label className="manual-custom">
                Atau masukkan nominal sendiri
                <input
                  className="field"
                  type="number"
                  min="1"
                  step="1"
                  value={manualAmount}
                  onChange={(event) => setManualAmount(Number(event.target.value))}
                />
              </label>
            </div>
            {teamNames.map((name, team) => (
              <div className="manual-line" key={team}>
                <strong>{name}</strong>
                <button className="small-button" disabled={!Number.isSafeInteger(manualAmount) || manualAmount <= 0} onClick={() => applyManualScore(team, -1)}>−{manualAmount || 0}</button>
                <button className="small-button" disabled={!Number.isSafeInteger(manualAmount) || manualAmount <= 0} onClick={() => applyManualScore(team, 1)}>+{manualAmount || 0}</button>
              </div>
            ))}
            <div className="action-row">
              <button className="button button-gold" onClick={() => { dispatch({ type: 'winner' }); sound('menang'); }}>Tampilkan pemenang</button>
              <button className="small-button" onClick={() => dispatch({ type: 'newMatch' })}>Pertandingan baru</button>
              <button className="small-button danger-outline" onClick={resetAll}>Reset semua</button>
            </div>
          </div>
          <p className="shortcut-legend"><b>Pintasan:</b> 1–7 buka jawaban · X salah · A/B kontrol · N berikutnya · T timer · Z undo · M mute</p>
        </section>
      </div>
    </main>
  );
}
