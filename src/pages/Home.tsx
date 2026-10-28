import { EVENT_TITLE, SCHOOL_NAME } from '../config';

export default function Home() {
  return (
    <main className="home-page">
      <div className="home-mark">SPAGALAS <span>•</span> 2026</div>
      <div className="home-content">
        <p className="eyebrow">LOMBA CERDAS CERMAT</p>
        <h1>{EVENT_TITLE}</h1>
        <p className="school-name">{SCHOOL_NAME}</p>
        <div className="home-actions">
          <a className="button button-red" href="#/host">Buka Panel Operator</a>
          <a className="button button-gold" href="#/display" target="_blank" rel="noreferrer">Buka Layar Penonton ↗</a>
        </div>
        <ol className="howto">
          <li>Buka panel operator dan pilih kategori Kelas 7, 8, atau 9.</li>
          <li>Tim untuk kategori terpilih muncul otomatis; buka layar penonton di jendela kedua.</li>
          <li>Seret layar penonton ke proyektor, aktifkan suara, lalu mulai permainan.</li>
        </ol>
      </div>
      <div className="home-seal">SATU<br />NUSA<br />SATU<br />BAHASA</div>
    </main>
  );
}
