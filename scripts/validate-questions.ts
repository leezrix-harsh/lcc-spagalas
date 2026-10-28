import { questions } from '../src/data/questions';
import { ROUND_CORRECT_POINTS, SESSIONS, type GradeCategory } from '../src/config';

let errors = 0;
const ids = new Set<string>();
const categories: GradeCategory[] = ['Kelas 7', 'Kelas 8', 'Kelas 9'];
for (const category of categories) {
  for (const session of SESSIONS) {
    const rows = questions.filter((question) => question.category === category && question.session === session);
    if (rows.length !== 60) {
      console.error(`${category} · ${session}: ditemukan ${rows.length} soal, seharusnya 60.`);
      errors++;
    }
    for (const question of rows) {
      if (ids.has(question.id)) {
        console.error(`ID soal duplikat: ${question.id}`);
        errors++;
      }
      ids.add(question.id);
      if (question.answers.length !== 1) {
        console.error(`${question.id}: soal harus memiliki satu kunci jawaban.`);
        errors++;
      }
      const expectedPoints = ROUND_CORRECT_POINTS[session];
      if (question.answers.reduce((sum, answer) => sum + answer.points, 0) !== expectedPoints) {
        console.error(`${question.id}: poin jawaban harus ${expectedPoints}.`);
        errors++;
      }
      if (category === 'Kelas 9' && question.options !== undefined) {
        console.error(`${question.id}: soal Kelas 9 harus berbentuk essay tanpa pilihan jawaban.`);
        errors++;
      }
      if (category === 'Kelas 9' && /^[A-D]\.\s/.test(question.answers[0]?.text ?? '')) {
        console.error(`${question.id}: kunci jawaban Kelas 9 tidak boleh menyertakan label pilihan.`);
        errors++;
      }
    }
    console.log(`${session} · ${category}: ${rows.length} soal diperiksa.`);
  }
}
if (errors) {
  console.error(`Validasi gagal: ${errors} kesalahan.`);
  process.exitCode = 1;
} else {
  console.log(`Validasi berhasil: ${questions.length} soal, ${ids.size} ID unik.`);
}
