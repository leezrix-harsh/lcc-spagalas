import { useState } from 'react';
import { EVENT_TITLE, SCHOOL_NAME } from '../config';
import { playSound } from '../audio/sfx';
import type { GameState } from '../game/types';
import Board from '../components/Board';
import TeamPanel from '../components/TeamPanel';
import StrikeOverlay from '../components/StrikeOverlay';
import Timer from '../components/Timer';
import Winner from '../components/Winner';

interface DisplayProps {
  state: Partial<GameState>;
  onHello: () => void;
}

export default function Display({ state, onHello }: DisplayProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const question = state.selectedQuestion ?? null;
  const opened = state.opened ?? [];
  const standing = state.categoryStandings?.[state.category ?? 'Kelas 7'];
  const names = standing?.teamNames ?? ['7A', '7B', '7C', '7D'];
  const scores = standing?.scores ?? [0, 0, 0, 0];
  const maxScore = Math.max(...scores);
  const winners = names.filter((_name, index) => scores[index] === maxScore);
  const winnerName = winners.length !== 1 ? 'SERI' : winners[0];
  const fullScreen = () => document.documentElement.requestFullscreen?.();

  return (
    <main className="display-page">
      <header className="display-header">
        <div className="school-seal">
          {!logoError ? <img src={`${import.meta.env.BASE_URL}logo-spagalas.png`} alt="Logo sekolah" onError={() => setLogoError(true)} /> : <>S<span>13</span></>}
        </div>
        <div className="display-title"><h1>{EVENT_TITLE}</h1><p>{SCHOOL_NAME}</p></div>
          <span className="session-badge">{state.category?.toLocaleUpperCase('id-ID') ?? 'KELAS 7'} · {state.session?.toLocaleUpperCase('id-ID') ?? 'PENYISIHAN'}</span>
      </header>
      <div className="display-toolbar">
        <button className="small-button" onClick={fullScreen}>Layar Penuh ⛶</button>
      </div>
      <div className="pot"><span>BANK RONDE</span><strong>{state.bank ?? 0}</strong></div>
      <div className="display-score-row">
        {names.map((name, team) => <TeamPanel name={name} score={scores[team]} active={state.control === team} strikes={state.control === team ? state.strikes ?? 0 : 0} side={team} key={team} />)}
      </div>
      <Board question={question} opened={opened} locked />
      <footer className="display-footer">
        <span>{state.stealing ? 'KESEMPATAN MENCURI!' : state.roundDone ? 'RONDE SELESAI' : question ? 'JAWABAN SOAL' : 'SELAMAT DATANG'}</span>
        <Timer seconds={state.seconds ?? 0} duration={state.timerDuration ?? 0} />
        <button className="small-button" onClick={onHello}>Sinkronkan ulang</button>
      </footer>
      <StrikeOverlay version={state.strikes ?? 0} />
      {state.winnerShown && <Winner name={winnerName} />}
      {!soundEnabled && <button className="sound-gate" onClick={() => { setSoundEnabled(true); void playSound('intro'); onHello(); }}>♫<strong>Klik untuk mengaktifkan suara</strong></button>}
    </main>
  );
}
