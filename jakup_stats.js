/**
 * jakup_stats.js — jakup_quiz.html의 questions 배열을 파싱하여
 * 연도·회차·카테고리 통계를 계산하고 콜백으로 반환합니다.
 */
(function () {
  'use strict';

  function loadStats(callback) {
    fetch('jakup_quiz.html')
      .then(r => r.text())
      .then(html => {
        const arrMatch = html.match(/const questions\s*=\s*(\[[\s\S]*?\]);\s*\n/);
        if (!arrMatch) { console.error('jakup_stats.js: questions 배열 추출 실패'); return; }

        const questions = (new Function('return ' + arrMatch[1]))();

        const totalQ = questions.length;
        const roundMap = {};
        const yearSet  = new Set();

        questions.forEach(q => {
          yearSet.add(q.year);
          const key = `${q.year}_${q.round}`;
          roundMap[key] = (roundMap[key] || 0) + 1;
        });

        const totalRounds = Object.keys(roundMap).length;
        const years = [...yearSet].sort();

        const yearRounds = {};
        years.forEach(y => { yearRounds[y] = []; });
        Object.keys(roundMap).sort().forEach(key => {
          const [y, ...rest] = key.split('_');
          const r = rest.join('_');
          if (yearRounds[y]) yearRounds[y].push(r);
        });
        Object.keys(yearRounds).forEach(y => {
          yearRounds[y].sort((a, b) => {
            const na = parseInt(a), nb = parseInt(b);
            if (na !== nb) return na - nb;
            return a.localeCompare(b);
          });
        });

        const catMap = {};
        questions.forEach(q => {
          catMap[q.cat] = (catMap[q.cat] || 0) + 1;
        });

        callback({ totalQ, totalRounds, years, yearRounds, roundMap, catMap, questions });
      })
      .catch(err => console.error('jakup_stats.js fetch 오류:', err));
  }

  window.JakupStats = { load: loadStats };
})();
