
// ============== DATA INJECTED FROM PYTHON ==============
const DRINKS = __DRINKS__;
const GLOSSARY = __GLOSSARY__;
const TAXONOMY = __TAXONOMY__;
const QUIZ = __QUIZ__;
const DISH_PAIRS = __DISH_PAIRS__;
const BLIND_MODES = __BLIND_MODES__;

// Rehydrate quiz filters (lambdas were stringified)
const QUIZ_FILTERS = [
  null,
  [
    d => (d.type === 'wine' || d.type === 'sake' || d.type === 'cider' || d.type === 'spirit') && ['Игристое','Белое сухое','Белое полусухое','Белое ароматное','Десертное белое','Саке','Сидр','Джин'].includes(d.cat) || (d.type === 'spirit' && ['Ром','Текила/Мескаль','Бренди'].includes(d.cat) && [121,123,126,131].includes(d.id)),
    d => [59,60,63,77,81,82,83,111,112,115,116,118,124,131,132,133,135,136,137].includes(d.id),
    d => d.type === 'wine' && ['Красное сухое','Десертное красное'].includes(d.cat),
    d => [62,87,88,89,90,91,92,108,133,134].includes(d.id),
    d => [69,95,138].includes(d.id)
  ],
  [
    null,
    d => d.type === 'beer',
    null, null, null, null
  ],
  null,
  [
    d => ['2.','3.','4.','5.','6.','7.','8.','9.','10','11'].some(c => d.abv.includes(c)),
    null,
    d => d.type === 'spirit' || ['14','15','16','17','18','19','20'].some(c => d.abv.includes(c))
  ]
];

// ============== STATE ==============
let state = {
  view: 'blind', search: '', filter: 'all', glossary_search: '', notes_search: '',
  compare_list: [1, 8, 27],
  quiz: { step: 0, scores: {acid:0,sweet:0,bitter:0,tannin:0,body:0,alcohol:0,carbonation:0,savory:0}, excludes: [], done: false },
  blind: null
};
const NOTES_KEY = 'sommelier_notes_v2';
function loadNotes() { try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); } catch { return {}; } }
function saveNotes(n) { try { localStorage.setItem(NOTES_KEY, JSON.stringify(n)); } catch(e) {} }

// ============== TABS ==============
document.getElementById('tabs').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  switchView(btn.dataset.view);
});
function switchView(v) {
  state.view = v;
  document.querySelectorAll('nav.tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  // Scroll the active tab into view in the nav bar
  const activeBtn = document.querySelector('nav.tabs button.active');
  if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === 'view-'+v));
  // Scroll main to top
  const main = document.querySelector('main');
  if (main) main.scrollTop = 0;
  if (v === 'browse') renderBrowse();
  if (v === 'notes') renderNotes();
  if (v === 'quiz' && !state.quiz.done) renderQuiz();
  if (v === 'build') renderBuild();
  if (v === 'blind') renderBlind();
  if (v === 'notes-search') renderNotesSearch();
  if (v === 'pairing') renderPairing();
  if (v === 'compare') renderCompare();
  if (v === 'glossary') renderGlossary();
}

// ============== HELPERS ==============
function tagFor(d) {
  if (d.type === 'wine') return 'tag-wine';
  if (d.type === 'beer') return 'tag-beer';
  if (d.type === 'spirit') return 'tag-spirit';
  if (d.type === 'sake') return 'tag-sake';
  if (d.type === 'cider') return 'tag-cider';
  if (d.type === 'mead') return 'tag-mead';
  if (d.type === 'coffee') return 'tag-coffee';
  if (d.type === 'tea') return 'tag-tea';
  return 'tag-mead';
}
function typeLabel(d) {
  if (d.type === 'wine') return 'вино';
  if (d.type === 'beer') return 'пиво';
  if (d.type === 'spirit') return 'крепкое';
  if (d.type === 'sake') return 'саке';
  if (d.type === 'cider') return 'сидр';
  if (d.type === 'mead') return 'медовуха';
  if (d.type === 'coffee') return 'кофе';
  if (d.type === 'tea') return 'чай';
  return '';
}

// Температуры подачи по категориям (упрощённо, на основе книги Куликовой)
// Возвращает { temp, glass, note } или null если категория не определена
function servingInfo(d) {
  if (!d || !d.cat) return null;
  const cat = d.cat.toLowerCase();
  const type = d.type;
  // Вина
  if (type === 'wine') {
    if (/(игрист|шампанск|креман|кава|просекк|spumante)/i.test(cat)) return { temp: '6-10°', glass: 'флейта', note: 'Охладить до 6-8°, не трясти' };
    if (/(рислинг|совиньон|пино гриджио|грюнер|альбариньо|мюскаде|гевюрц)/i.test(cat)) return { temp: '7-10°', glass: 'белый малый', note: 'Освежающая кислотность' };
    if (/(шардоне|вионье|марсан)/i.test(cat)) return { temp: '10-13°', glass: 'белый большой', note: 'Если в бочке — чуть теплее' };
    if (/(пино нуар|гамэ|божоле|гренаш|зинфандель)/i.test(cat)) return { temp: '14-16°', glass: 'красный малый', note: 'Лёгкие красные — прохладнее' };
    if (/(каберн|мерло|сира|шираз|бордо|кьянти|риоха|темпранильо|неббиоло)/i.test(cat)) return { temp: '16-18°', glass: 'красный большой', note: 'Насыщенные — теплее, можно декантировать' };
    if (/(портвейн|херес|мадера|сотерн|токай|айсвайн|креплён)/i.test(cat)) return { temp: '12-16°', glass: 'десертный', note: 'Сладкие/креплёные' };
    if (/(розов|rose|rosé|розе)/i.test(cat)) return { temp: '8-12°', glass: 'белый универсальный', note: 'Пить молодым' };
    return { temp: '10-14°', glass: 'универсальный', note: 'Смотри по типу' };
  }
  // Пиво
  if (type === 'beer') {
    if (/(лагер|pilsner|пильзнер|light lager|хеллес)/i.test(cat)) return { temp: '4-7°', glass: 'прямая кружка', note: 'Освежающее' };
    if (/(weiss|weizen|пшенич|witbier|витбир)/i.test(cat)) return { temp: '6-8°', glass: 'пшеничный бокал', note: 'С дрожжами' };
    if (/(ipa|apa|pale ale|индийское)/i.test(cat)) return { temp: '8-10°', glass: 'тюльпан', note: 'Хмель раскрывается' };
    if (/(saison|saison|фармхаус)/i.test(cat)) return { temp: '10-12°', glass: 'тюльпан', note: 'Сложный аромат' };
    if (/(stout|porter|стаут|портер)/i.test(cat)) return { temp: '10-13°', glass: 'снифтер', note: 'Жарено-кофейные ноты' };
    if (/(barleywine|ячменное вино|old ale)/i.test(cat)) return { temp: '12-15°', glass: 'снифтер', note: 'Как крепкое вино' };
    if (/(lambic|гёз|крик|ламбик|дикое)/i.test(cat)) return { temp: '8-12°', glass: 'тюльпан', note: 'Дикие дрожжи' };
    if (/(doppelbock|двойной бок|tripel|трипель|quadrupel|квадрюпель)/i.test(cat)) return { temp: '10-13°', glass: 'кубок', note: 'Траппистские' };
    if (/(sour|кислое|гозе|берлинер)/i.test(cat)) return { temp: '6-9°', glass: 'прямая', note: 'Освежающая кислотность' };
    return { temp: '6-10°', glass: 'универсальный', note: 'По стилю' };
  }
  // Крепкое
  if (type === 'spirit') {
    if (/(виски|whisky|whiskey|скотч|бурбон|рай)/i.test(cat)) return { temp: '16-20°', glass: 'гленкэрн / снифтер', note: 'Комнатная, можно каплю воды' };
    if (/(коньяк|cognac|арманьяк|armagnac|бренди)/i.test(cat)) return { temp: '16-20°', glass: 'снифтер', note: 'Тёплой рукой раскрывать' };
    if (/(джин|gin)/i.test(cat)) return { temp: 'холодное', glass: 'рокс / мартини', note: 'Обычно в коктейле' };
    if (/(водка|vodka)/i.test(cat)) return { temp: '4-8°', glass: 'шот / рокс', note: 'Охлаждённая' };
    if (/(текила|tequila|мескаль|mezcal)/i.test(cat)) return { temp: '16-20°', glass: 'рокс / кабальито', note: 'Мескаль — теплее' };
    if (/(ром|rum)/i.test(cat)) return { temp: 'холодное', glass: 'рокс / тики', note: 'В коктейле' };
    if (/(абсент|absinthe)/i.test(cat)) return { temp: 'холодное', glass: 'абсентный', note: 'С водой через сахар' };
    if (/(ликёр|liqueur|campari|амаро)/i.test(cat)) return { temp: '6-12°', glass: 'ликёрный / рокс', note: 'Дижестив' };
    return { temp: '16-20°', glass: 'снифтер', note: 'По типу' };
  }
  // Саке
  if (type === 'sake') return { temp: '5-50°', glass: 'очоко / масу', note: 'Зависит от типа (холодное/тёплое)' };
  // Сидр
  if (type === 'cider') return { temp: '6-10°', glass: 'прямой / тюльпан', note: 'Освежающий' };
  // Медовуха
  if (type === 'mead') return { temp: '8-14°', glass: 'медовая чаша / тюльпан', note: 'Сухая холоднее, сладкая теплее' };
  // Кофе
  if (type === 'coffee') return { temp: '70-85°', glass: 'керамическая чашка', note: 'Не кипяток! 85° для эспрессо' };
  // Чай
  if (type === 'tea') return { temp: '70-95°', glass: 'гайвань / чайник', note: 'Зелёный 70-80°, чёрный 90-95°' };
  return null;
}
function highlightTerms(text) {
  // Wrap known glossary terms in clickable spans
  let result = text;
  // Sort terms by length desc to avoid partial overlaps
  const terms = Object.keys(GLOSSARY).sort((a,b) => b.length - a.length);
  // Replace using placeholder to avoid double-replacement
  const replaced = [];
  let idx = 0;
  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'gi');
    result = result.replace(re, (m) => {
      const placeholder = `__TERM_${idx}__`;
      replaced[idx] = { placeholder, term: m, original: term };
      idx++;
      return placeholder;
    });
  }
  // Now replace placeholders with HTML
  for (const r of replaced) {
    result = result.replace(r.placeholder, `<span class="term" onclick="showTerm('${r.original.replace(/'/g,"\\'")}')">${r.term}</span>`);
  }
  return result;
}

// ============== TREE (2 секции: Структура + Ароматика, с подкатегориями) ==============

// Подкатегории для каждого параметра структуры
// Подкатегории для структуры — по диапазону значений (1-2/3/4/5)
// Каждый параметр делится на 4 уровня, напитки фильтруются по значению
const TREE_STRUCT = [
  {key:'acid', icon:'🍋', label:'Кислотность', sub:'свежесть, бодрость',
   subs:[
     {title:'Плоское (1-2)', hint:'Почти не кислит', min:1, max:2},
     {title:'Свежее (3)', hint:'Умеренная кислотность', min:3, max:3},
     {title:'Кислотное (4)', hint:'Яркая кислотность', min:4, max:4},
     {title:'Очень кислотное (5)', hint:'Режущая, звонкая', min:5, max:5},
   ]},
  {key:'sweet', icon:'🍯', label:'Сладость', sub:'реальный сахар',
   subs:[
     {title:'Сухое (1-2)', hint:'Совсем не сладко', min:1, max:2},
     {title:'Полусухое (3)', hint:'Лёгкая сладость', min:3, max:3},
     {title:'Полусладкое (4)', hint:'Заметная сладость', min:4, max:4},
     {title:'Сладкое (5)', hint:'Десертное, приторное', min:5, max:5},
   ]},
  {key:'bitter', icon:'🌰', label:'Горечь', sub:'хмель, обжарка, травы',
   subs:[
     {title:'Не горькое (1-2)', hint:'Почти без горечи', min:1, max:2},
     {title:'Лёгкая горечь (3)', hint:'Сбалансированная', min:3, max:3},
     {title:'Горькое (4)', hint:'Яркая горечь', min:4, max:4},
     {title:'Очень горькое (5)', hint:'Кампари, DIPA, торф', min:5, max:5},
   ]},
  {key:'tannin', icon:'🫐', label:'Терпкость / танины', sub:'сухость на дёснах',
   subs:[
     {title:'Мягкое (1-2)', hint:'Не сушит рот', min:1, max:2},
     {title:'Средние танины (3)', hint:'Лёгкая терпкость', min:3, max:3},
     {title:'Танинное (4)', hint:'Заметная сухость', min:4, max:4},
     {title:'Очень танинное (5)', hint:'Сильно сушит (Бароло, Каберне)', min:5, max:5},
   ]},
  {key:'body', icon:'🍷', label:'Тело / плотность', sub:'вода vs сироп',
   subs:[
     {title:'Лёгкое (1-2)', hint:'Водянистое, как вода', min:1, max:2},
     {title:'Среднее (3)', hint:'Как сок', min:3, max:3},
     {title:'Плотное (4)', hint:'Обволакивающее', min:4, max:4},
     {title:'Тягучее (5)', hint:'Как сироп/сливки', min:5, max:5},
   ]},
  {key:'carbonation', icon:'🫧', label:'Газация', sub:'пузырьки',
   subs:[
     {title:'Тихое (1)', hint:'Без газа', min:1, max:1},
     {title:'Лёгкая (2-3)', hint:'Пет-нат, ламбик, английский эль', min:2, max:3},
     {title:'Средняя (4)', hint:'Пиво, сидр', min:4, max:4},
     {title:'Сильная (5)', hint:'Шампанское, игристое', min:5, max:5},
   ]},
  {key:'savory', icon:'🧂', label:'Солёное / Умами', sub:'соль, глутамат',
   subs:[
     {title:'Нейтральное (1-2)', hint:'Без соли/умами', min:1, max:2},
     {title:'Заметное (3)', hint:'Лёгкая солоноватость', min:3, max:3},
     {title:'Выраженное (4)', hint:'Гозе, херес, умами', min:4, max:4},
     {title:'Очень выраженное (5)', hint:'Манзанилья, Байцзю', min:5, max:5},
   ]},
];

// Подкатегории для ароматики — по диапазону значений (1-2/3/4/5)
const TREE_AROMA = [
  {key:'fruit', icon:'🍎', label:'Фрукты / Ягоды', sub:'цитрусы, ягоды, тропики, сухофрукты',
   subs:[
     {title:'Нет (1-2)', hint:'Не фруктовое', min:1, max:2},
     {title:'Лёгкие фрукты (3)', hint:'Намёки на фрукты', min:3, max:3},
     {title:'Фруктовое (4)', hint:'Яркие фрукты', min:4, max:4},
     {title:'Очень фруктовое (5)', hint:'Фруктовый взрыв', min:5, max:5},
   ]},
  {key:'floral', icon:'🌸', label:'Цветы / Травы', sub:'роза, мята, хмель, хвоя',
   subs:[
     {title:'Нет (1-2)', hint:'Не цветочное', min:1, max:2},
     {title:'Лёгкие (3)', hint:'Намёки на цветы/травы', min:3, max:3},
     {title:'Цветочное (4)', hint:'Яркие цветы/травы', min:4, max:4},
     {title:'Очень цветочное (5)', hint:'Парфюмерное', min:5, max:5},
   ]},
  {key:'spice', icon:'🌶️', label:'Специи', sub:'перец, корица, анис, кардамон',
   subs:[
     {title:'Нет (1-2)', hint:'Без специй', min:1, max:2},
     {title:'Лёгкие специи (3)', hint:'Намёки на специи', min:3, max:3},
     {title:'Пряное (4)', hint:'Яркие специи', min:4, max:4},
     {title:'Очень пряное (5)', hint:'Специи доминируют', min:5, max:5},
   ]},
  {key:'wood_smoke', icon:'💨', label:'Дерево / Дым', sub:'дуб, торф, дым, табак, кофе, шоколад',
   subs:[
     {title:'Нет (1-2)', hint:'Без древесных нот', min:1, max:2},
     {title:'Лёгкое (3)', hint:'Намёки на дуб/дым', min:3, max:3},
     {title:'Древесное/дымное (4)', hint:'Яркий дуб, дым, торф', min:4, max:4},
     {title:'Очень дымное (5)', hint:'Айла, стаут, Лапсанг', min:5, max:5},
   ]},
  {key:'mineral_earth', icon:'🪨', label:'Минералы / Земля', sub:'мел, камень, йод, земля, грибы',
   subs:[
     {title:'Нет (1-2)', hint:'Без минералов', min:1, max:2},
     {title:'Лёгкие (3)', hint:'Намёки на минералы', min:3, max:3},
     {title:'Минеральное (4)', hint:'Мел, камень, земля', min:4, max:4},
     {title:'Очень минеральное (5)', hint:'Херес, Шабли, Пуэр', min:5, max:5},
   ]},
  {key:'sweet_pastry', icon:'🍰', label:'Сладкое / Кондитер', sub:'мёд, карамель, выпечка, сливочное масло',
   subs:[
     {title:'Нет (1-2)', hint:'Без кондитерских нот', min:1, max:2},
     {title:'Лёгкие (3)', hint:'Намёки на мёд/карамель', min:3, max:3},
     {title:'Кондитерское (4)', hint:'Мёд, карамель, орех', min:4, max:4},
     {title:'Очень кондитерское (5)', hint:'Портвейн, бурбон, BA Stout', min:5, max:5},
   ]},
  {key:'yeast_ferment', icon:'🍞', label:'Дрожжи / Фермент', sub:'хлеб, сыр, прелое яблоко, Brett',
   subs:[
     {title:'Нет (1-2)', hint:'Без дрожжевых нот', min:1, max:2},
     {title:'Лёгкие (3)', hint:'Намёки на хлеб/брожение', min:3, max:3},
     {title:'Дрожжевое (4)', hint:'Хлеб, бриошь, Brett', min:4, max:4},
     {title:'Очень ферментативное (5)', hint:'Ламбик, Vin Jaune, Байцзю', min:5, max:5},
   ]},
];

function renderTree() {
  const c = document.getElementById('tree-container');
  // Init tree tab state if not set
  if (!state.treeTab) state.treeTab = 'struct';

  function buildSection(items, isStructure) {
    const html = items.map(item => {
      // For each subcategory, find matching drinks by value range
      const subsHTML = item.subs.map((sub, si) => {
        let drinks;
        if (isStructure) {
          drinks = DRINKS.filter(d => {
            const val = (d.s||{})[item.key] || 0;
            return val >= sub.min && val <= sub.max;
          });
        } else {
          drinks = DRINKS.filter(d => {
            const val = (d.a||{})[item.key] || 0;
            return val >= sub.min && val <= sub.max;
          });
        }
        if (!drinks.length) return '';
        return `
          <div class="leaf" onclick="event.stopPropagation(); showTreeDrinks('${item.key}-${si}', '${sub.title.replace(/'/g,"\\'")}', ${JSON.stringify(drinks.map(d=>d.id)).replace(/"/g,'&quot;')})">
            <span class="leaf-dot"></span>
            <div style="flex:1">
              <div class="leaf-title">${sub.title}</div>
              <div class="leaf-hint">${sub.hint}</div>
            </div>
            <span class="leaf-count">${drinks.length}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="tree-receptor" style="border-left-color: ${isStructure ? 'var(--' + getStructColor(item.key) + ')' : getAromaColor(item.key)};">
          <div class="receptor-head" onclick="toggleReceptor('tree-${item.key}')">
            <div class="receptor-icon">${isStructure ? getStructIcon(item.key) : getAromaIcon(item.key)}</div>
            <div style="flex:1">
              <div class="receptor-title">${item.label}</div>
              <div class="receptor-sub">${item.sub}</div>
            </div>
            <div class="receptor-chevron">▶</div>
          </div>
          <div class="receptor-body" id="body-tree-${item.key}">
            ${subsHTML || '<div style="padding:8px;color:var(--text-mute);font-size:12px;">Нет напитков</div>'}
          </div>
        </div>
      `;
    }).join('');

    return html;
  }

  c.innerHTML = `
    <div class="section-tabs" id="tree-section-tabs">
      <button class="section-tab ${state.treeTab==='struct'?'active':''}" data-tree-tab="struct">🫁 Структура</button>
      <button class="section-tab ${state.treeTab==='aroma'?'active':''}" data-tree-tab="aroma">👃 Ароматика</button>
      <div class="section-tab-indicator" id="tree-tab-indicator"></div>
    </div>
    <p style="font-size:12px;color:var(--text-mute);margin-bottom:12px;">
      ${state.treeTab==='struct'
        ? 'То, что физически чувствует язык. Нажми на параметр → выбери подкатегорию → увидишь напитки.'
        : 'Кластеры обоняния. Нажми на кластер → выбери подкатегорию → увидишь напитки.'}
    </p>
    <div class="tree-section-content" id="tree-section-content">
      ${state.treeTab==='struct' ? buildSection(TREE_STRUCT, true) : buildSection(TREE_AROMA, false)}
    </div>
  `;

  // Wire up tab clicks
  c.querySelectorAll('.section-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.treeTab = tab.dataset.treeTab;
      haptic('light');
      renderTree(); // re-render with new tab
    });
  });

  // Position tab indicator
  requestAnimationFrame(() => {
    const activeTab = c.querySelector('.section-tab.active');
    const indicator = c.querySelector('#tree-tab-indicator');
    if (activeTab && indicator) {
      indicator.style.left = activeTab.offsetLeft + 'px';
      indicator.style.width = activeTab.offsetWidth + 'px';
    }
  });
}

function getStructColor(key) {
  return {acid:'acid',sweet:'sweet',bitter:'bitter',tannin:'tannin',body:'gold',carbonation:'cider',savory:'umami'}[key] || 'gold';
}
function getStructIcon(key) {
  return {acid:'🍋',sweet:'🍯',bitter:'🌰',tannin:'🫐',body:'🍷',carbonation:'🫧',savory:'🧂'}[key] || '•';
}
function getAromaColor(key) {
  return {fruit:'#d47b6a',floral:'#b8d4a8',spice:'#c9b04a',wood_smoke:'#7a5a3a',mineral_earth:'#6a8a8a',sweet_pastry:'#d4b85a',yeast_ferment:'#8a7a9a'}[key] || '#888';
}
function getAromaIcon(key) {
  return {fruit:'🍎',floral:'🌸',spice:'🌶️',wood_smoke:'💨',mineral_earth:'🪨',sweet_pastry:'🍰',yeast_ferment:'🍞'}[key] || '•';
}

function showTreeDrinks(dummyId, title, ids) {
  const drinks = ids.map(id => DRINKS.find(d => d.id === id)).filter(Boolean);
  openModal(`
    <div class="modal-cat">🌳 Дерево вкусов</div>
    <h2>${title}</h2>
    <p style="color:var(--text-dim); font-size:14px; margin-bottom:14px;">${drinks.length} напитков в этой категории.</p>
    <div class="section-title">Напитки</div>
    ${drinks.map(d => drinkCardHTML(d)).join('')}
  `);
}

function toggleReceptor(id) {
  const head = document.querySelector(`.tree-receptor > .receptor-head[onclick*="${id}"]`);
  const body = document.getElementById('body-'+id);
  if (!head || !body) return;
  head.classList.toggle('open'); body.classList.toggle('open');
}
function toggleSubcat(receptorId, subId) {
  const subcat = document.querySelector(`.subcat[onclick*="${subId}"]`);
  const leaves = document.getElementById(`leaves-${receptorId}-${subId}`);
  if (!subcat || !leaves) return;
  subcat.classList.toggle('open');
  leaves.classList.toggle('open');
}
function showLeafDrinks(receptorId, subId, leafId) {
  const receptor = TAXONOMY.find(r => r.id === receptorId);
  const sub = receptor.subs.find(s => s.id === subId);
  const leaf = sub.leaves.find(l => l.id === leafId);
  const drinks = leaf.drinks.map(id => DRINKS.find(d => d.id === id)).filter(Boolean);
  openModal(`
    <div class="modal-cat">${receptor.icon} ${receptor.title} → ${sub.title} → ${leaf.title}</div>
    <h2>${leaf.title}</h2>
    <p style="color:var(--text-dim); font-size:14px; margin-bottom:6px;">${sub.hint}</p>
    <p style="color:var(--text-mute); font-size:13px; font-style:italic; margin-bottom:14px;">${leaf.hint}</p>
    <div class="section-title">Что это может быть (${drinks.length})</div>
    ${drinks.map(d => drinkCardHTML(d)).join('')}
  `);
}

// ============== DRINK CARD ==============
function drinkCardHTML(d) {
  // Top 3 structure params
  const sLabels = {acid:'кислота',sweet:'сладость',bitter:'горечь',tannin:'танины',body:'тело',alcohol:'алкоголь',carbonation:'газация',savory:'солёное'};
  const pills = Object.entries(d.s||{}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) =>
    `<span class="profile-pill ${v>=4?'strong':''}">${sLabels[k]||k} ${v}</span>`
  ).join('');
  const typeIcons = {wine:'🍷',beer:'🍺',spirit:'🥃',sake:'🍶',cider:'🍎',mead:'🍯',coffee:'☕',tea:'🍵'};
  const avatarIcon = typeIcons[d.type] || '🍾';
  const meta = [d.subcat || d.cat, d.origin, d.abv].filter(Boolean).join(' • ');
  return `
    <div class="list-item slide-in" onclick="haptic('light'); openDrink(${d.id})">
      <div class="li-avatar ${tagFor(d)}">${avatarIcon}</div>
      <div class="li-body">
        <div class="li-name">${d.name}</div>
        <div class="li-meta">${meta}</div>
        <div class="li-pills">${pills}</div>
      </div>
      <div class="li-chevron">›</div>
    </div>
  `;
}

// ============== MODAL ==============
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
  document.body.style.overflow = '';
  // Stop any running graph animation
  if (window._tagWebAnim) { cancelAnimationFrame(window._tagWebAnim); window._tagWebAnim = null; }
}
document.getElementById('modal-bg').addEventListener('click', e => { if (e.target.id === 'modal-bg') closeModal(); });

function openDrink(id) {
  const d = DRINKS.find(x => x.id === id);
  if (!d) return;
  const notes = loadNotes();
  const note = notes[id] || '';
  // Structure labels (7 осей)
  const sLabels = {acid:'Кислота',sweet:'Сладость',bitter:'Горечь',tannin:'Танины',body:'Тело',alcohol:'Алкоголь',carbonation:'Газация',savory:'Солёное/Умами'};
  const sColors = {acid:'var(--acid)',sweet:'var(--sweet)',bitter:'var(--bitter)',tannin:'var(--tannin)',body:'var(--gold)',alcohol:'#c95a4a',carbonation:'#6ab8c8',savory:'var(--umami)'};
  // Aroma labels (7 кластеров)
  const aLabels = {fruit:'Фрукты',floral:'Цветы/Травы',spice:'Специи',wood_smoke:'Дерево/Дым',mineral_earth:'Минералы/Земля',sweet_pastry:'Сладкое/Кондитер',yeast_ferment:'Дрожжи/Фермент'};
  const aColors = {fruit:'#d47b6a',floral:'#b8d4a8',spice:'#c9b04a',wood_smoke:'#7a5a3a',mineral_earth:'#6a8a8a',sweet_pastry:'#d4b85a',yeast_ferment:'#8a7a9a'};

  const s = d.s || {};
  const a = d.a || {};

  const sBars = Object.entries(sLabels).map(([k,v]) => `
    <div class="profile-bar">
      <div class="lbl">${v}</div>
      <div class="bar"><div class="fill" style="width:${(s[k]||1)*20}%; background:${sColors[k]}"></div></div>
      <div class="val">${s[k]||1}/5</div>
    </div>
  `).join('');
  const aBars = Object.entries(aLabels).map(([k,v]) => `
    <div class="profile-bar">
      <div class="lbl">${v}</div>
      <div class="bar"><div class="fill" style="width:${(a[k]||1)*20}%; background:${aColors[k]}"></div></div>
      <div class="val">${a[k]||1}/5</div>
    </div>
  `).join('');

  // Cross-category similar drinks (explicit + auto)
  let crossList = [];
  if (d.cross && d.cross.length) {
    crossList = d.cross.map(id => {
      const x = DRINKS.find(xx => xx.id === id);
      if (!x) return null;
      return { ...x, isExplicit: true };
    }).filter(Boolean);
  }
  // Auto-compute same-category similar
  const sameCat = findSimilar(d, 4).filter(s => !crossList.find(c => c.id === s.id));
  const allSimilar = [...crossList, ...sameCat];
  const similarHTML = allSimilar.map(s => `
    <div class="similar-card" onclick="openDrink(${s.id})">
      <div style="flex:1">
        <div class="similar-name">${s.name}</div>
        <div class="similar-cat">${s.cat} • ${typeLabel(s)}</div>
      </div>
      <div class="${s.isExplicit ? 'similar-cross' : 'similar-match'}">${s.isExplicit ? '↔ кросс' : (s.match + '%')}</div>
    </div>
  `).join('');
  openModal(`
    <div class="modal-cat">${d.cat} • ${getTranslatedTypeLabel(d)}</div>
    <h2>${d.name}</h2>
    <div style="font-size:13px;color:var(--text-mute);margin-bottom:14px;">${d.origin} • ${d.abv} алкоголя</div>
    <div class="modal-section" style="border-top:none;padding-top:0;">
      <h4>Описание</h4>
      <p>${highlightTerms(d.desc)}</p>
    </div>
    <div class="modal-section">
      <h4>Ароматы и вкусы</h4>
      <p>${d.tags.map(t=>`<span class="profile-pill" style="margin-right:4px;">${t}</span>`).join('')}</p>
    </div>
    <div class="modal-section">
      <h4>Вкусовой профиль</h4>
      <div class="radar-dual">
        <div class="radar-cell">
          <h5>🫁 Структура</h5>
          <canvas id="radar-s-${d.id}" width="240" height="240"></canvas>
        </div>
        <div class="radar-cell">
          <h5>👃 Ароматика</h5>
          <canvas id="radar-a-${d.id}" width="240" height="240"></canvas>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px;">
        <div>
          <div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Структура (язык)</div>
          <div class="profile-bars">${sBars}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Ароматика (обоняние)</div>
          <div class="profile-bars">${aBars}</div>
        </div>
      </div>
    </div>
    <div class="modal-section">
      <h4>Гастрономия</h4>
      <p>${d.pair.join(' • ')}</p>
    </div>
    <div class="modal-section">
      <h4>Сервировка</h4>
      ${(() => {
        const s = servingInfo(d);
        if (!s) return '<p style="color:var(--text-mute);font-size:13px;">Нет данных</p>';
        return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="background:var(--bg-2);border-radius:10px;padding:12px;">
            <div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">🌡️ Температура</div>
            <div style="font-size:18px;color:var(--gold);font-family:Georgia,serif;font-weight:600;">${s.temp}</div>
          </div>
          <div style="background:var(--bg-2);border-radius:10px;padding:12px;">
            <div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">🥃 Бокал</div>
            <div style="font-size:13px;color:var(--text);font-weight:500;">${s.glass}</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-dim);margin-top:10px;line-height:1.4;">💡 ${s.note}</p>`;
      })()}
    </div>
    <div class="modal-section">
      <h4>Похожие напитки ${crossList.length ? '(+ кросс-категории)' : ''}</h4>
      ${similarHTML || '<p style="color:var(--text-mute);font-size:13px;">Похожих в базе нет.</p>'}
    </div>
    <div class="modal-section">
      <h4>Моя заметка</h4>
      <textarea class="notes-area" id="note-text" placeholder="Что попробовал, что почувствовал, понравилось ли...">${note ? note.text : ''}</textarea>
      <button class="save-btn" onclick="saveNote(${d.id})">Сохранить заметку</button>
      <button class="compare-btn" onclick="addToCompare(${d.id}); closeModal();">⇆ Сравнить</button>
    </div>
  `);
  // Draw radar after DOM is ready
  setTimeout(() => {
    const sCanvas = document.getElementById('radar-s-'+d.id);
    if (sCanvas) drawRadar(sCanvas, d.s || {});
    const aCanvas = document.getElementById('radar-a-'+d.id);
    if (aCanvas) drawAromaRadar(aCanvas, d.a || {});
  }, 50);
}

function saveNote(id) {
  const text = document.getElementById('note-text').value.trim();
  const notes = loadNotes();
  if (text) { notes[id] = { text, date: new Date().toLocaleDateString('ru-RU') }; }
  else { delete notes[id]; }
  saveNotes(notes);
  haptic('success');
  toast(text ? 'Заметка сохранена' : 'Заметка удалена');
}

function findSimilar(d, n) {
  const sKeys = ['acid','sweet','bitter','tannin','body','carbonation','savory'];
  const aKeys = ['fruit','floral','spice','wood_smoke','mineral_earth','sweet_pastry','yeast_ferment'];
  return DRINKS
    .filter(x => x.id !== d.id && x.type === d.type)
    .map(x => {
      // Structure diff (8 params × 5 = 40 max)
      let sDiff = 0;
      for (const k of sKeys) {
        sDiff += Math.abs((d.s||{})[k] - (x.s||{})[k]);
      }
      // Aroma diff (7 params × 5 = 35 max)
      let aDiff = 0;
      for (const k of aKeys) {
        aDiff += Math.abs((d.a||{})[k] - (x.a||{})[k]);
      }
      // Combined match: structure 60% + aroma 40%
      const sMatch = 1 - sDiff/35;
      const aMatch = 1 - aDiff/35;
      const match = Math.round((sMatch * 0.6 + aMatch * 0.4) * 100);
      return { ...x, match };
    })
    .sort((a,b) => b.match - a.match)
    .slice(0, n);
}


// Read Build labels from hidden DOM spans (translated by GT)
function getTranslatedBuildStructLabels() {
  const keys = ['acid','sweet','bitter','tannin','body','carbonation','savory'];
  return keys.map(k => {
    const el = document.getElementById('gtl-build-' + k);
    return (el && el.textContent) || null;
  });
}
function getTranslatedBuildAromaLabels() {
  const keys = ['fruit','floral','spice','wood_smoke','mineral_earth','sweet_pastry','yeast_ferment'];
  return keys.map(k => {
    const el = document.getElementById('gtl-build-' + k);
    return (el && el.textContent) || null;
  });
}


// Read radar labels from hidden DOM spans (translated by Google Translate)
function isTranslated() {
  return document.documentElement.classList.contains('translated-ltr') || 
         document.documentElement.classList.contains('translated-rtl');
}
function getTranslatedStructLabels() {
  const keys = ['acid','sweet','bitter','tannin','body','carbonation','savory'];
  return keys.map(k => {
    const el = document.getElementById('gtl-struct-' + k);
    return (el && el.textContent) || STRUCT_LABELS[keys.indexOf(k)];
  });
}
function getTranslatedAromaLabels() {
  const keys = ['fruit','floral','spice','wood_smoke','mineral_earth','sweet_pastry','yeast_ferment'];
  return keys.map(k => {
    const el = document.getElementById('gtl-aroma-' + k);
    return (el && el.textContent) || AROMA_LABELS[keys.indexOf(k)];
  });
}
function getTranslatedStructLabelsForMode(useStruct) {
  return useStruct ? getTranslatedStructLabels() : getTranslatedAromaLabels();
}
function getTranslatedTypeLabel(d) {
  const el = document.getElementById('gtl-type-' + d.type);
  return (el && el.textContent) || typeLabel(d);
}
function getTranslatedBuildStructLabels() {
  const keys = ['acid','sweet','bitter','tannin','body','carbonation','savory'];
  return keys.map(k => {
    const el = document.getElementById('gtl-build-' + k);
    return (el && el.textContent) || null;
  });
}
function getTranslatedBuildAromaLabels() {
  const keys = ['fruit','floral','spice','wood_smoke','mineral_earth','sweet_pastry','yeast_ferment'];
  return keys.map(k => {
    const el = document.getElementById('gtl-build-' + k);
    return (el && el.textContent) || null;
  });
}

// ============== RADAR CHART ==============
// Structure: 7 axes (то, что чувствует язык) — alcohol removed to avoid info leak via ABV
const STRUCT_LABELS = ['Кислота','Сладость','Горечь','Танины','Тело','Газация','Солёность/Умами'];
const STRUCT_KEYS = ['acid','sweet','bitter','tannin','body','carbonation','savory'];
const STRUCT_N = 7;

// Aroma: 7 clusters (обоняние)
const AROMA_LABELS = ['Фрукты','Цветы/Травы','Специи','Дерево/Дым','Минералы/Земля','Сладкое/Кондитер','Дрожжи/Фермент'];
const AROMA_KEYS = ['fruit','floral','spice','wood_smoke','mineral_earth','sweet_pastry','yeast_ferment'];
const AROMA_N = 7;

// Legacy compatibility (для старого кода который использует RADAR_*)
const RADAR_LABELS = STRUCT_LABELS;
const RADAR_KEYS = STRUCT_KEYS;
const RADAR_N = STRUCT_N;

// Generic radar drawer — принимает labels, keys, n
function drawRadarGeneric(canvas, profile, labels, keys, n, profile2, progress) {
  if (!canvas) return;
  progress = progress === undefined ? 1 : progress;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2;
  // Padding: 25px — leaves room for HTML labels at the canvas edge without overlapping h5 title above.
  // (Was 38 when labels were drawn on canvas; 10 was too aggressive — top-axis labels collided with h5.)
  const r = Math.min(W, H)/2 - 25;
  const colors = { p1: 'rgba(201,165,92,0.6)', p2: 'rgba(216,123,106,0.5)' };
  ctx.clearRect(0, 0, W, H);
  // Background polygons (levels 1-5)
  for (let level = 1; level <= 5; level++) {
    const rr = r * level / 5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI/2 + i * 2*Math.PI/n;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = level === 5 ? '#5a4828' : '#3d2f24';
    ctx.lineWidth = level === 5 ? 1.2 : 0.5;
    ctx.stroke();
    // Number on the top axis
    if (level < 5) {
      ctx.fillStyle = '#5a4828';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(level.toString(), cx, cy - rr);
    }
  }
  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI/2 + i * 2*Math.PI/n;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = '#3d2f24';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  // Plot polygon
  function plot(p, color) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI/2 + i * 2*Math.PI/n;
      const rr = r * (p[keys[i]] || 0) / 5 * progress;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = color.replace(/0\.[0-9]+/, '1');
    ctx.lineWidth = 2;
    ctx.stroke();
    // Vertex dots
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI/2 + i * 2*Math.PI/n;
      const rr = r * (p[keys[i]] || 0) / 5 * progress;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, 2*Math.PI);
      ctx.fillStyle = color.replace(/0\.[0-9]+/, '1');
      ctx.fill();
    }
  }
  plot(profile, colors.p1);
  if (profile2) plot(profile2, colors.p2);
  // Labels are rendered as HTML overlay (see renderRadarLabels) — NOT drawn on canvas.
  // This prevents long labels ("Солёность/Умами") from being clipped by canvas bounds.
}

// Render radar labels as absolutely-positioned HTML elements over the canvas.
// Solves the "clipped label" problem — HTML can wrap text and overflow canvas bounds.
// Smart positioning: anchor point = edge of label closest to the radar,
// so top-axis labels hang DOWN from anchor (no overlap with h5 header above),
// bottom-axis labels sit UP from anchor, side labels extend outward.
function renderRadarLabels(canvas, labels, keys, profile, n) {
  if (!canvas) return;
  const wrapper = canvas.parentElement;
  if (!wrapper) return;
  // Ensure wrapper is positioned
  if (getComputedStyle(wrapper).position === 'static') wrapper.style.position = 'relative';
  // Remove old labels
  wrapper.querySelectorAll('.radar-label').forEach(n => n.remove());
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2;
  // Match the same padding as drawRadarGeneric (r-25)
  const r = Math.min(W, H)/2 - 25;
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI/2 + i * 2*Math.PI/n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Per-axis offset from radar edge:
    //   - Top:    +4 (small breathing room, label hangs DOWN from anchor)
    //   - Bottom: +10 ("припустить" — drop lower label a bit further from radar)
    //   - Sides:   0 (tight to radar — user feedback: "боковые разлетелись, поближе")
    let offset;
    if (sin < -0.7) offset = 4;
    else if (sin > 0.7) offset = 10;
    else offset = 0;
    const lx = cx + cos * (r + offset);
    const ly = cy + sin * (r + offset);
    // Convert canvas coords to % of canvas size (overlay scales with CSS-sized canvas)
    const px = (lx / W) * 100;
    const py = (ly / H) * 100;
    // Determine transform & alignment based on axis position.
    // The anchor becomes the EDGE of the label closest to the radar:
    //   - Top axis (sin < -0.7): label hangs DOWN from anchor → top of label at anchor
    //   - Bottom axis (sin > 0.7): label sits UP from anchor → bottom of label at anchor
    //   - Right side (cos > 0.3): label extends RIGHT → left edge at anchor
    //   - Left side (cos < -0.3): label extends LEFT → right edge at anchor
    //   - Middle: center on anchor
    let transform = 'translate(-50%, -50%)';
    let textAlign = 'center';
    let posClass = 'pos-mid';
    if (sin < -0.7) {
      transform = 'translate(-50%, 0%)';
      posClass = 'pos-top';
    } else if (sin > 0.7) {
      transform = 'translate(-50%, -100%)';
      posClass = 'pos-bot';
    } else if (cos > 0.3) {
      transform = 'translate(0%, -50%)';
      textAlign = 'left';
      posClass = 'pos-right';
    } else if (cos < -0.3) {
      transform = 'translate(-100%, -50%)';
      textAlign = 'right';
      posClass = 'pos-left';
    }
    const val = profile ? (profile[keys[i]] || 0) : 0;
    const labelEl = document.createElement('div');
    labelEl.className = 'radar-label ' + posClass;
    labelEl.style.left = px + '%';
    labelEl.style.top = py + '%';
    labelEl.style.transform = transform;
    labelEl.style.textAlign = textAlign;
    // Hide value if profile is null (multi-radar case — values would be ambiguous)
    labelEl.innerHTML = `<span class="rl-name">${labels[i]}</span>${profile ? `<span class="rl-val">${val}/5</span>` : ''}`;
    wrapper.appendChild(labelEl);
  }
}

// Structure radar (8 axes) — для обратной совместимости
function drawRadar(canvas, profile, profile2) {
  animateRadar(canvas, profile, getTranslatedStructLabels(), STRUCT_KEYS, STRUCT_N, profile2);
}

// Aroma radar (7 axes)
function drawAromaRadar(canvas, profile, profile2) {
  animateRadar(canvas, profile, getTranslatedAromaLabels(), AROMA_KEYS, AROMA_N, profile2);
}

// Animated radar: grows from 0 to 1 over ~500ms
function animateRadar(canvas, profile, labels, keys, n, profile2) {
  if (!canvas) return;
  // Render labels immediately — they shouldn't wait for animation completion.
  // Solves the "labels lag behind radar" perception.
  renderRadarLabels(canvas, labels, keys, profile, n);
  let start = null;
  const duration = 500;
  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const progress = Math.min(1, elapsed / duration);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    drawRadarGeneric(canvas, profile, labels, keys, n, profile2, eased);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Confetti burst
function fireConfetti() {
  const colors = ['#c9a55c', '#d47b6a', '#7a8a4a', '#6a8a8a', '#d4b85a', '#b8d4a8'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.top = '20%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.3 + 's';
    piece.style.animationDuration = (1 + Math.random() * 0.8) + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2500);
  }
}

// Animated count-up for score
function animateScore(element, target, duration) {
  if (!element) return;
  duration = duration || 800;
  let start = null;
  const startVal = 0;
  function frame(ts) {
    if (!start) start = ts;
    const progress = Math.min(1, (ts - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(startVal + (target - startVal) * eased);
    element.textContent = val;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Multi-radar for compare (generic)
function drawMultiRadarGeneric(canvas, profiles, fillColors, strokeColors, labels, keys, n) {
  if (!canvas || !profiles.length) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2;
  // Padding: 25 — same as drawRadarGeneric, leaves room for HTML labels at canvas edge.
  const r = Math.min(W, H)/2 - 25;
  ctx.clearRect(0, 0, W, H);
  // Background polygons with numbers
  for (let level = 1; level <= 5; level++) {
    const rr = r * level / 5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI/2 + i * 2*Math.PI/n;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = level === 5 ? '#5a4828' : '#3d2f24';
    ctx.lineWidth = level === 5 ? 1.2 : 0.5;
    ctx.stroke();
    if (level < 5) {
      ctx.fillStyle = '#5a4828';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(level.toString(), cx, cy - rr);
    }
  }
  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI/2 + i * 2*Math.PI/n;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = '#3d2f24';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  // Plot each profile
  profiles.forEach((p, idx) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI/2 + i * 2*Math.PI/n;
      const rr = r * (p[keys[i]] || 0) / 5;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColors[idx % fillColors.length];
    ctx.fill();
    ctx.strokeStyle = strokeColors[idx % strokeColors.length];
    ctx.lineWidth = 2;
    ctx.stroke();
    // Vertices dots
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI/2 + i * 2*Math.PI/n;
      const rr = r * (p[keys[i]] || 0) / 5;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2*Math.PI);
      ctx.fillStyle = strokeColors[idx % strokeColors.length];
      ctx.fill();
      // Number label on dot
      ctx.fillStyle = '#1a1410';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((idx + 1).toString(), x, y);
    }
  });
  // Labels rendered as HTML overlay (not on canvas) — prevents clipping on long labels.
  // Use first profile for value display (or hide values for multi-radar).
  renderRadarLabels(canvas, labels, keys, null, n);
}

function drawMultiRadar(canvas, profiles, fillColors, strokeColors) {
  drawMultiRadarGeneric(canvas, profiles, fillColors, strokeColors, getTranslatedStructLabels(), STRUCT_KEYS, STRUCT_N);
}

function drawMultiAromaRadar(canvas, profiles, fillColors, strokeColors) {
  drawMultiRadarGeneric(canvas, profiles, fillColors, strokeColors, getTranslatedAromaLabels(), AROMA_KEYS, AROMA_N);
}

// ============== BROWSE ==============
function renderBrowse() {
  const filters = document.getElementById('filters');
  const cats = ['all','wine','beer','spirit','sake','cider','mead','coffee','tea',
    'Игристое','Белое сухое','Белое полусухое','Красное сухое','Десертное белое','Десертное красное','Креплёное','Оранжевое (натуральное)','Розовое сухое','Красное полусладкое',
    'Лагер','Эль','Пшеничное','Аббатский эль','Стаут','Стаут/Портер','Кислое','Специальное','Гибрид',
    'Виски','Бренди','Ром','Джин','Текила/Мескаль','Прочее крепкое','Вермут/Амаро','Саке','Сидр','Медовуха'];
  filters.innerHTML = cats.map(c => `<button class="filter-chip ${state.filter===c?'active':''}" data-cat="${c}">${c==='all'?'Все':c==='wine'?'Вино':c==='beer'?'Пиво':c==='spirit'?'Крепкое':c==='coffee'?'Кофе':c==='tea'?'Чай':c}</button>`).join('');
  filters.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    state.filter = b.dataset.cat; renderBrowse();
  }));
  const search = state.search.toLowerCase();
  let list = DRINKS.filter(d => {
    if (state.filter !== 'all' && !['wine','beer','spirit','sake','cider','mead','coffee','tea'].includes(state.filter)) {
      if (d.cat !== state.filter) return false;
    }
    if (['wine','beer','spirit','sake','cider','mead','coffee','tea'].includes(state.filter) && d.type !== state.filter) return false;
    if (search) {
      const hay = (d.name + ' ' + d.cat + ' ' + d.origin + ' ' + d.tags.join(' ')).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
  const c = document.getElementById('browse-container');
  if (!list.length) {
    c.innerHTML = `<div class="empty"><div class="ic">🔍</div>Ничего не нашли. Попробуй другой запрос.</div>`;
    return;
  }
  c.innerHTML = `<div class="section-title">Найдено: ${list.length}</div>` + list.map(drinkCardHTML).join('');
}
document.getElementById('search-input').addEventListener('input', e => { state.search = e.target.value; renderBrowse(); });
document.getElementById('notes-search-input').addEventListener('input', e => { state.notes_search = e.target.value; renderNotesSearch(); });

// ============== NOTES SEARCH (by flavor tag) ==============
function renderNotesSearch() {
  const c = document.getElementById('notes-cloud');
  // Count tags across all drinks
  const tagCounts = {};
  const tagDrinks = {};
  DRINKS.forEach(d => {
    (d.tags||[]).forEach(t => {
      tagCounts[t] = (tagCounts[t]||0)+1;
      if (!tagDrinks[t]) tagDrinks[t] = [];
      tagDrinks[t].push(d);
    });
  });
  const search = (state.notes_search || '').toLowerCase();
  const tags = Object.entries(tagCounts)
    .filter(([t,_]) => !search || t.toLowerCase().includes(search))
    .sort((a,b) => b[1]-a[1]);
  if (!tags.length) {
    c.innerHTML = `<div class="empty"><div class="ic">🔍</div>Тег не найден.</div>`;
    return;
  }
  const max = tags[0][1];
  const min = tags[tags.length-1][1];
  const range = max - min || 1;
  c.innerHTML = `
    <div class="section-title">${tags.length} тегов вкуса • нажми на любой</div>
    <div class="tag-cloud">
      ${tags.map(([t, cnt]) => {
        const sizePct = (cnt - min) / range; // 0..1
        const fontSize = (13 + sizePct * 14).toFixed(1); // 13-27 px
        const opacity = (0.55 + sizePct * 0.45).toFixed(2);
        return `<button class="tag-cloud-item" style="font-size:${fontSize}px;opacity:${opacity}" onclick="showTagDrinks('${t.replace(/'/g,"\\'")}')">${t} <span class="tag-cloud-cnt">${cnt}</span></button>`;
      }).join('')}
    </div>
  `;
}
function showTagDrinks(tag) {
  const drinks = DRINKS.filter(d => (d.tags||[]).includes(tag));
  const typeOrder = ['wine','beer','spirit','sake','cider','mead','coffee','tea'];
  const typeLabelMap = {wine:'Вино',beer:'Пиво',spirit:'Крепкое',sake:'Саке',cider:'Сидр',mead:'Медовуха',coffee:'Кофе',tea:'Чай'};

  // Group by type
  const grouped = {};
  drinks.forEach(d => { if (!grouped[d.type]) grouped[d.type] = []; grouped[d.type].push(d); });
  const groupsHTML = typeOrder.filter(t => grouped[t]).map(t => `
    <div class="section-title">${typeLabelMap[t]} (${grouped[t].length})</div>
    ${grouped[t].map(d => drinkCardHTML(d)).join('')}
  `).join('');

  // === VARIANT B: Smart clusters by similarity ===
  // Compute pairwise match, group into clusters
  const sKeys = ['acid','sweet','bitter','tannin','body','carbonation','savory'];
  const aKeys = ['fruit','floral','spice','wood_smoke','mineral_earth','sweet_pastry','yeast_ferment'];

  function matchScore(d1, d2) {
    let sDiff = 0, aDiff = 0;
    for (const k of sKeys) sDiff += Math.abs((d1.s||{})[k] - (d2.s||{})[k]);
    for (const k of aKeys) aDiff += Math.abs((d1.a||{})[k] - (d2.a||{})[k]);
    return Math.round((1 - sDiff/35) * 0.6 * 100 + (1 - aDiff/35) * 0.4 * 100) / 100;
  }

  // Clustering: group by TYPE first, then sub-cluster within each type by similarity
  const clusters = [];
  typeOrder.forEach(t => {
    const typeDrinks = drinks.filter(d => d.type === t);
    if (!typeDrinks.length) return;
    // Sub-cluster within type by 70% similarity
    const assigned = new Set();
    const subClusters = [];
    for (const d of typeDrinks) {
      if (assigned.has(d.id)) continue;
      const cluster = [d];
      assigned.add(d.id);
      for (const d2 of typeDrinks) {
        if (assigned.has(d2.id)) continue;
        const ms = matchScore(d, d2);
        if (ms >= 0.7) { cluster.push(d2); assigned.add(d2.id); }
      }
      subClusters.push(cluster);
    }
    subClusters.sort((a,b) => b.length - a.length);
    subClusters.forEach(sc => clusters.push({ type: t, drinks: sc }));
  });

  // Generate cluster names
  function clusterName(cluster) {
    const sAvg = {};
    sKeys.forEach(k => { sAvg[k] = cluster.reduce((s,d) => s + ((d.s||{})[k]||1), 0) / cluster.length; });
    const sSorted = Object.entries(sAvg).sort((a,b) => b[1] - a[1]);
    const sLabel = {acid:'кислотные',sweet:'сладкие',bitter:'горькие',tannin:'танинные',body:'плотные',alcohol:'алкогольные',carbonation:'газированные',savory:'солёно-умами'};
    const aAvg = {};
    aKeys.forEach(k => { aAvg[k] = cluster.reduce((s,d) => s + ((d.a||{})[k]||1), 0) / cluster.length; });
    const aSorted = Object.entries(aAvg).sort((a,b) => b[1] - a[1]);
    const aLabel = {fruit:'фруктовые',floral:'цветочные',spice:'пряные',wood_smoke:'дымные',mineral_earth:'минеральные',sweet_pastry:'кондитерские',yeast_ferment:'дрожжевые'};
    return `${sLabel[sSorted[0][0]] || ''} + ${aLabel[aSorted[0][0]] || ''}`;
  }

  const clustersHTML = clusters.map((cl, ci) => {
    const name = clusterName(cl.drinks);
    const color = TYPE_COLORS[cl.type] || '#888';
    const typeLabelText = typeLabelMap[cl.type] || cl.type;
    const collapsed = 'collapsed';
    return `
      <div class="card cluster-card ${collapsed}" style="border-left:3px solid ${color};margin-bottom:8px;padding:0;overflow:hidden;">
        <div class="cluster-head" onclick="toggleCluster(this)" style="display:flex;align-items:center;gap:8px;padding:12px 14px;cursor:pointer;">
          <span style="width:12px;height:12px;border-radius:50%;background:${color};flex-shrink:0;"></span>
          <span style="font-size:14px;color:var(--text);font-family:Georgia,serif;font-weight:600;flex:1;">${typeLabelText}: ${name}</span>
          <span style="font-size:11px;color:var(--text-mute);">${cl.drinks.length}</span>
          <span class="cluster-chevron" style="color:var(--text-mute);font-size:11px;transition:transform 0.2s;">▶</span>
        </div>
        <div class="cluster-body" style="display:none;padding:0 8px 8px;">
          ${cl.drinks.map(d => `
            <div class="similar-card slide-in" onclick="openDrink(${d.id})">
              <div style="flex:1">
                <div class="similar-name">${d.name}</div>
                <div class="similar-cat">${d.subcat || d.cat} • ${typeLabelMap[d.type]}</div>
              </div>
              <div class="drink-tag ${tagFor(d)}" style="font-size:9px;">${getTranslatedTypeLabel(d)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  // === VARIANT D: Связи (semantic links with %) ===
  // For each drink, find top 3 most similar drinks (cross-type) with match %
  function linksHTML() {
    const links = [];
    for (let i = 0; i < drinks.length; i++) {
      const d1 = drinks[i];
      const matches = [];
      for (let j = 0; j < drinks.length; j++) {
        if (i === j) continue;
        const ms = matchScore(d1, drinks[j]);
        if (ms >= 0.65) matches.push({ drink: drinks[j], score: Math.round(ms * 100) });
      }
      matches.sort((a,b) => b.score - a.score);
      if (matches.length > 0) {
        links.push({ source: d1, matches: matches.slice(0, 3) });
      }
    }
    // Sort by best match descending
    links.sort((a,b) => (b.matches[0]?.score || 0) - (a.matches[0]?.score || 0));

    return links.map(link => `
      <div class="card" style="margin-bottom:8px;padding:12px;">
        <div class="similar-card" onclick="openDrink(${link.source.id})" style="margin-bottom:6px;background:var(--bg-2);">
          <div style="flex:1">
            <div class="similar-name">${link.source.name}</div>
            <div class="similar-cat">${link.source.subcat || link.source.cat} • ${typeLabelMap[link.source.type]}</div>
          </div>
          <div class="drink-tag ${tagFor(link.source)}" style="font-size:9px;">${typeLabel(link.source)}</div>
        </div>
        ${link.matches.map(m => `
          <div class="similar-card" onclick="openDrink(${m.drink.id})" style="padding:6px 8px;">
            <span style="font-size:11px;color:var(--text-mute);">↳</span>
            <div style="flex:1">
              <span style="font-size:13px;color:var(--text-dim);">${m.drink.name}</span>
              <span style="font-size:10px;color:var(--text-mute);margin-left:4px;">${m.drink.subcat || m.drink.cat}</span>
            </div>
            <span class="similar-match">${m.score}%</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  // No more rings — replaced by Связи

  state.current_tag = tag;
  openModal(`
    <div class="modal-cat">🎯 По ноте • ${tag}</div>
    <h2>${tag}</h2>
    <p style="color:var(--text-dim); font-size:14px; margin-bottom:14px;">${drinks.length} напитков с этой нотой во всех категориях.</p>
    <div style="display:flex;gap:6px;margin-bottom:12px;">
      <button class="filter-chip active" id="clusters-mode-btn" onclick="setTagViewMode('clusters')">📊 Кластеры</button>
      <button class="filter-chip" id="links-mode-btn" onclick="setTagViewMode('links')">🔗 Связи</button>
      <button class="filter-chip" id="list-mode-btn" onclick="setTagViewMode('list')">📋 Список</button>
    </div>
    <div id="tag-clusters-container">
      <p style="font-size:12px;color:var(--text-mute);margin-bottom:12px;">Напитки сгруппированы по типу и похожести. Нажми на кластер — раскрой.</p>
      ${clustersHTML}
    </div>
    <div id="tag-links-container" style="display:none;">
      <p style="font-size:12px;color:var(--text-mute);margin-bottom:10px;">Каждый напиток и его ближайшие соседи по профилю (≥65%). Кросс-категорийные связи!</p>
      ${linksHTML()}
    </div>
    <div id="tag-list-container" style="display:none;">
      ${groupsHTML}
    </div>
  `);
}

const TYPE_COLORS = {
  wine: '#a8484a', beer: '#d4a574', spirit: '#5a8a8a', sake: '#e8c8a8',
  cider: '#b8d4a8', mead: '#d4b85a', coffee: '#8a6a4a', tea: '#8a9a5a'
};


function toggleCluster(headEl) {
  const body = headEl.nextElementSibling;
  const chevron = headEl.querySelector('.cluster-chevron');
  if (!body) return;
  if (body.style.display === 'none') {
    body.style.display = 'block';
    chevron.style.transform = 'rotate(90deg)';
    haptic('light');
  } else {
    body.style.display = 'none';
    chevron.style.transform = '';
    haptic('light');
  }
}

function setTagViewMode(mode) {
  const allBtns = ['clusters','links','list'];
  const btnIds = { clusters: 'clusters-mode-btn', links: 'links-mode-btn', list: 'list-mode-btn' };
  const containerIds = { clusters: 'tag-clusters-container', links: 'tag-links-container', list: 'tag-list-container' };
  allBtns.forEach(m => {
    const btn = document.getElementById(btnIds[m]);
    const cont = document.getElementById(containerIds[m]);
    if (btn && cont) {
      if (m === mode) { btn.classList.add('active'); cont.style.display = 'block'; }
      else { btn.classList.remove('active'); cont.style.display = 'none'; }
    }
  });
}

function typeLabelForWeb(t) {
  return {wine:'Вино',beer:'Пиво',spirit:'Крепкое',sake:'Саке',cider:'Сидр',mead:'Медовуха',coffee:'Кофе',tea:'Чай'}[t] || t;
}

// ============== PAIRING ==============
function renderPairing() {
  const c = document.getElementById('pairing-container');
  c.innerHTML = DISH_PAIRS.map(p => `
    <div class="dish-card" onclick="showPairing('${p.dish.replace(/'/g,"\\'")}')">
      <div class="head">
        <div class="icon">${p.icon}</div>
        <div class="name">${p.dish}</div>
        <div class="count">${p.ids.length}</div>
      </div>
    </div>
  `).join('');
}
// ============== DISH PAIRING (rules-based math) ==============
// Для каждого блюда — целевой профиль структуры + объяснение почему
const DISH_RULES = {
  'Устрицы / моллюски': {
    target: {acid:5, sweet:1, bitter:1, tannin:1, body:2, alcohol:2, carbonation:4, savory:3},
    why: 'Устрицы солёные и слизистые. Нужна высокая кислотность (режет слизь) + минеральность (морской характер). Никаких танинов (дают металлический вкус). Игристое/газация добавляют свежесть.',
    avoid: 'Избегай танинных красных — дают железный привкус с устрицами.'
  },
  'Севиче / тартар': {
    target: {acid:5, sweet:1, bitter:2, tannin:1, body:2, alcohol:2, carbonation:3, savory:2},
    why: 'Севиче уже кислое (лайм). Вино должно Matchingать кислотностью. Низкие танины, лёгкое тело. Цитрусовая ароматика — бонус.',
    avoid: 'Тяжёлые красные и сладкие вина конфликтуют с лаймом.'
  },
  'Суши / сашими': {
    target: {acid:3, sweet:1, bitter:2, tannin:1, body:2, alcohol:2, carbonation:2, savory:3},
    why: 'Деликатный вкус рыбы. Нужна умеренная кислотность (как соевый соус), умами (саке/светлое вино). Без танинов. Лёгкое тело.',
    avoid: 'Танинные красные убивают тонкий вкус сырой рыбы.'
  },
  'Курица / птица': {
    target: {acid:3, sweet:2, bitter:2, tannin:2, body:3, alcohol:2, carbonation:2, savory:2},
    why: 'Универсальное мясо. Средняя кислотность, средние танины. Бархатистые красные (Пино Нуар, Мерло) или полнотелые белые (Шардоне). Пиво тоже отлично.',
    avoid: 'Слишком мощные танины (Бароло) подавят курицу.'
  },
  'Стейк / красное мясо': {
    target: {acid:3, sweet:1, bitter:3, tannin:4, body:4, alcohol:3, carbonation:1, savory:3},
    why: 'Белок и жир нейтрализуют танины. Нужны мощные танины (Каберне, Сира, Бароло) + плотное тело. Алкоголь растворяет жир. Кислое прорезает насыщенность.',
    avoid: 'Лёгкие белые потеряются на фоне стейка. Сладкие — конфликт.'
  },
  'Барбекю / гриль': {
    target: {acid:2, sweet:2, bitter:3, tannin:3, body:4, alcohol:3, carbonation:3, savory:3},
    why: 'Дым, карамелизированный сахар, специи. Нужны древесные/дымные ноты (виски, копчёное пиво, Сира). Газация очищает рецепторы. Сладость балансирует остроту соуса.',
    avoid: 'Тихие лёгкие вина потеряются среди дыма и специй.'
  },
  'Паста / пицца': {
    target: {acid:4, sweet:1, bitter:3, tannin:3, body:3, alcohol:2, carbonation:3, savory:3},
    why: 'Томатный соус кислый. Вино должно Matchingать кислотой (Кьянти, Санджовезе). Средние танины. Пиво с хмелем тоже работает. Газация освежает.',
    avoid: 'Сладкие вина и низкокислотные — кажутся плоскими с томатом.'
  },
  'Дичь': {
    target: {acid:3, sweet:1, bitter:3, tannin:4, body:4, alcohol:3, carbonation:1, savory:4},
    why: 'Землистый, мощный вкус. Нужны сложные вина с умами/землистостью (Неббиоло, Пино Нуар выдержанный, Сира). Выдержанные spirits (виски, коньяк). Плотное тело.',
    avoid: 'Лёгкие фруктовые вина и светлые пива потеряются.'
  },
  'Сыры (твёрдые)': {
    target: {acid:3, sweet:2, bitter:3, tannin:3, body:4, alcohol:3, carbonation:2, savory:4},
    why: 'Белок и жир сыра + умами от выдержки. Нужны танины (связываются с белком), плотное тело, умами (выдержанные вина, херес). Сладкие вина к солёным сырам — классика.',
    avoid: 'Лёгкие кислотные белые кажутся водянистыми с выдержанным сыром.'
  },
  'Сыры с плесенью': {
    target: {acid:3, sweet:5, bitter:2, tannin:2, body:5, alcohol:3, carbonation:3, savory:3},
    why: 'Солёный + острый сыр. Сладкое вино (Сотерн, Портвейн) — контраст сладкое/солёное. Плотное тело. Сладость гасит остроту плесени.',
    avoid: 'Сухие танинные красные — горький привкус с плесенью.'
  },
  'Орехи': {
    target: {acid:2, sweet:3, bitter:3, tannin:2, body:4, alcohol:4, carbonation:1, savory:4},
    why: 'Маслянистые, землистые. Нужны ореховые/карамельные ноты (выдержанные spirits, Tawny Port, Oloroso). Плотное тело, умами.',
    avoid: 'Лёгкие кислотные вина конфликтуют с маслом орехов.'
  },
  'Тёмный шоколад': {
    target: {acid:2, sweet:3, bitter:4, tannin:3, body:5, alcohol:4, carbonation:2, savory:3},
    why: 'Горько-сладкий, плотный. Нужны древесные/дымные ноты (виски, стаут, Banyuls). Плотное тело. Горечь какао + горечь напитка = гармония. Сладость балансирует.',
    avoid: 'Лёгкие белые и кислотные вина теряются на фоне шоколада.'
  },
  'Фруктовые десерты': {
    target: {acid:3, sweet:5, bitter:1, tannin:1, body:4, alcohol:2, carbonation:3, savory:1},
    why: 'Сладкое фруктовое блюдо. Вино должно быть слаще блюда (Сотерн, Москато, Токай). Фруктовая ароматика. Лёгкая кислотность освежает.',
    avoid: 'Сухие танинные вина кажутся горькими с десертом.'
  },
  'Острые блюда (карри, тайская)': {
    target: {acid:3, sweet:3, bitter:1, tannin:1, body:3, alcohol:2, carbonation:3, savory:1},
    why: 'Капсаицин (острота) усиливает алкоголь. Нужна сладость (гасит остроту), низкий алкоголь, низкие танины. Газация освежает. Рислинг, Москато, пшеничное пиво.',
    avoid: 'Высокий алкоголь и танины усиливают жжение!'
  },
  'Блины / пироги': {
    target: {acid:2, sweet:4, bitter:1, tannin:2, body:4, alcohol:3, carbonation:3, savory:2},
    why: 'Сладкое/сливочное тесто. Нужна сладость (Москато, игристое деми-сек, медовуха). Плотное тело. Газация контрастирует с тяжестью теста.',
    avoid: 'Сухие горькие вина конфликтуют со сладостью блинов.'
  },
  'Свинина / рёбра': {
    target: {acid:3, sweet:3, bitter:2, tannin:3, body:4, alcohol:3, carbonation:3, savory:3},
    why: 'Жирная свинина. Кислота прорезает жир, танины связываются с белком. Сладость (фруктовое вино, Doppelbock) классически контрастирует с солёностью. Пиво с газацией очищает рецепторы.',
    avoid: 'Деликатные лёгкие белые потеряются на фоне жирной свинины.'
  },
  'Утка': {
    target: {acid:3, sweet:2, bitter:2, tannin:3, body:4, alcohol:3, carbonation:1, savory:3},
    why: 'Жирное мясо с насыщенным вкусом. Пино Нуар — классика. Нужны средние танины, хорошая кислотность, фруктовость. Умами выдержанных вин резонирует с мясом.',
    avoid: 'Слишком лёгкие и кислотные белые не выдержат мощи утки.'
  },
  'Лосось / тунец': {
    target: {acid:3, sweet:1, bitter:2, tannin:2, body:3, alcohol:2, carbonation:2, savory:3},
    why: 'Жирная рыба. Нужна кислотность (режет жир), средние танины (Пино Нуар). Лёгкое-среднее тело. Умами (выдержка на осадке) дополняет рыбный вкус.',
    avoid: 'Мощные танинные красные дают металлический привкус с рыбой.'
  },
  'Грибы / трюфель': {
    target: {acid:2, sweet:1, bitter:2, tannin:3, body:4, alcohol:3, carbonation:1, savory:5},
    why: 'Землистый умами. Нужны вина с умами (Неббиоло, Пино Нуар, Vin Jaune). Плотное тело. Выдержанные spirits (виски, коньяк) идеально. Древесные/земляные ноты.',
    avoid: 'Лёгкие фруктовые вина и кислотные белые теряются на фоне грибов.'
  },
  'Салаты / овощи': {
    target: {acid:4, sweet:1, bitter:2, tannin:1, body:2, alcohol:2, carbonation:3, savory:2},
    why: 'Лёгкие, свежие. Высокая кислотность (Совиньон Блан, Грюнер). Низкие танины. Лёгкое тело. Газация освежает. Травяные/цветочные ноты идеальны.',
    avoid: 'Плотные танинные красные подавят нежный вкус овощей.'
  },
  'Ягнёнок': {
    target: {acid:3, sweet:1, bitter:3, tannin:4, body:4, alcohol:3, carbonation:1, savory:3},
    why: 'Плотное мясо с характерным вкусом. Мощные танины (Каберне, Сира, Бордо). Дымные/пряные ноты (Сира, Мескаль). Алкоголь растворяет жир.',
    avoid: 'Сладкие и лёгкие вина потеряются на фоне ягнёнка.'
  },
  'Торты / сладости': {
    target: {acid:3, sweet:5, bitter:1, tannin:1, body:4, alcohol:2, carbonation:3, savory:1},
    why: 'Сливочный крем, масляный. Напиток должен быть слаще. Сотерн, Токай, Портвейн Tawny, медовуха. Кислотность прорезает приторность.',
    avoid: 'Сухие танинные красные кажутся горькими рядом с тортом.'
  },
  'Фруктовые десерты': {
    target: {acid:4, sweet:4, bitter:1, tannin:1, body:3, alcohol:2, carbonation:3, savory:1},
    why: 'Кисло-сладкое, фруктовое. Нужна кислотность (Matchingает фруктовую) + сладость. Москато, Рислинг Kabinett, игристое demi-sec. Лёгкое тело.',
    avoid: 'Плотные танинные красные и крепкое подавят нежный фруктовый десерт.'
  },
  'Белый шоколад': {
    target: {acid:3, sweet:5, bitter:1, tannin:1, body:5, alcohol:3, carbonation:2, savory:1},
    why: 'Сливочно-сладкий, без горечи какао. Сотерн, Токай, BA Stout, ром, коньяк. Карамель резонирует. Плотное тело.',
    avoid: 'Сухие кислотные белые и горькие напитки конфликтуют со сливочной сладостью.'
  },
  'Мороженое / сорбет': {
    target: {acid:4, sweet:5, bitter:1, tannin:1, body:3, alcohol:1, carbonation:4, savory:1},
    why: 'Холодное, сливочное или фруктовое. Низкий алкоголь (не растапливает мороженое). Игристое demi-sec, Москато, гозе. Высокая кислотность + газация контрастируют с холодом.',
    avoid: 'Высокий алкоголь и танины — мороженое тает и вкус становится горьким.'
  },
  'Выпечка / печенье': {
    target: {acid:2, sweet:3, bitter:2, tannin:2, body:4, alcohol:3, carbonation:2, savory:3},
    why: 'Масляное, карамельное, ореховое. Херес Oloroso/Amontillado, коньяк, Doppelbock, Barleywine. Умами (выдержка) + карамель/орех резонируют. Плотное тело.',
    avoid: 'Лёгкие кислотные белые кажутся водянистыми с масляной выпечкой.'
  },
  'Картофель / крахмал': {
    target: {acid:2, sweet:2, bitter:2, tannin:2, body:3, alcohol:2, carbonation:3, savory:3},
    why: 'Нейтральный, крахмалистый. Нужен напиток с характером — солодовое пиво, херес, умами-саке. Газация контрастирует с плотностью. Умами подчёркивает.',
    avoid: 'Слишком мощные танинные вина подавят нейтральный вкус картофеля.'
  },
  'Ветчина / хамон': {
    target: {acid:3, sweet:3, bitter:2, tannin:2, body:3, alcohol:4, carbonation:2, savory:5},
    why: 'Солёно-умами. Сладкое вино (Херес, Портвейн) — контраст сладкое/солёное. Умами (херес, выдержанные вина) резонирует. Крепкое (граппа, коньяк) — классика.',
    avoid: 'Сухие танинные красные дают горький привкус с солёной ветчиной.'
  },
  'Морепродукты на гриле': {
    target: {acid:3, sweet:2, bitter:2, tannin:2, body:3, alcohol:3, carbonation:3, savory:3},
    why: 'Дым + сладость морепродуктов. Нужна кислотность (совиньон, рислинг), древесные ноты (выдержанное вино, виски). Газация освежает. Среднее тело.',
    avoid: 'Тяжёлые танинные красные конфликтуют с нежными морепродуктами.'
  }
};

function computePairingScore(drink, target) {
  const s = drink.s || {};
  let diff = 0;
  const keys = ['acid','sweet','bitter','tannin','body','alcohol','carbonation','savory'];
  for (const k of keys) {
    diff += Math.abs((s[k]||1) - (target[k]||3));
  }
  return Math.round((1 - diff/40) * 100);
}

function showPairing(dish) {
  const p = DISH_PAIRS.find(x => x.dish === dish);
  if (!p) return;
  // Manual picks
  const manualDrinks = p.ids.map(id => DRINKS.find(d => d.id === id)).filter(Boolean);
  // Compute scores for ALL drinks
  const rule = DISH_RULES[dish];
  let computedDrinks = [];
  let whyText = '';
  let avoidText = '';
  if (rule) {
    computedDrinks = DRINKS.map(d => ({
      ...d,
      pairScore: computePairingScore(d, rule.target)
    })).sort((a,b) => b.pairScore - a.pairScore).slice(0, 15);
    whyText = rule.why;
    avoidText = rule.avoid;
  }

  // Merge: computed excluding manual duplicates
  const manualIds = new Set(manualDrinks.map(d => d.id));
  const computedFiltered = computedDrinks.filter(d => !manualIds.has(d.id));

  const manualHTML = manualDrinks.map(d => drinkCardHTML(d)).join('');
  const computedHTML = computedFiltered.map(d => `
    <div class="drink slide-in" onclick="haptic('light'); openDrink(${d.id})">
      <div class="drink-head">
        <div class="drink-name">${d.name}</div>
        <div class="drink-tag ${tagFor(d)}">${getTranslatedTypeLabel(d)}</div>
      </div>
      <div class="drink-meta">${d.subcat || d.cat} • ${d.origin} • ${d.abv}</div>
      <div class="drink-profile">
        <span class="profile-pill strong" style="color:var(--gold);border-color:var(--gold);">${d.pairScore}% совпадение</span>
      </div>
    </div>
  `).join('');

  openModal(`
    <div class="modal-cat">${p.icon} ${p.dish}</div>
    <h2>${p.dish}</h2>
    ${whyText ? `
      <div style="background:var(--bg-2);border-radius:10px;padding:12px;margin-bottom:14px;">
        <div style="font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Почему это работает</div>
        <p style="font-size:13px;color:var(--text-dim);line-height:1.5;">${whyText}</p>
      </div>
    ` : ''}
    ${avoidText ? `
      <div style="background:rgba(107,46,47,0.3);border-radius:10px;padding:12px;margin-bottom:14px;border-left:3px solid var(--wine);">
        <div style="font-size:11px;color:var(--wine);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">⚠️ Избегай</div>
        <p style="font-size:13px;color:var(--text-dim);line-height:1.5;">${avoidText}</p>
      </div>
    ` : ''}
    <div class="pairing-tabs">
      <button class="pairing-tab active" id="pairing-classic-btn" onclick="switchPairingTab('classic')">📖 Классика (${manualDrinks.length})</button>
      <button class="pairing-tab" id="pairing-math-btn" onclick="switchPairingTab('math')">🧮 Математика (${computedFiltered.length})</button>
    </div>
    <div id="pairing-classic">
      ${manualHTML || '<div class="empty"><p>Нет классических пар для этого блюда.</p></div>'}
    </div>
    <div id="pairing-math" style="display:none;">
      <p style="font-size:12px;color:var(--text-mute);margin-bottom:10px;">Подобрано по совпадению структуры напитка с идеальным профилем для этого блюда. unexpected сочетания!</p>
      ${computedHTML || '<div class="empty"><p>Нет данных для расчёта.</p></div>'}
    </div>
  `);
}

function switchPairingTab(tab) {
  const classicBtn = document.getElementById('pairing-classic-btn');
  const mathBtn = document.getElementById('pairing-math-btn');
  const classicDiv = document.getElementById('pairing-classic');
  const mathDiv = document.getElementById('pairing-math');
  if (!classicDiv || !mathDiv) return;
  if (tab === 'classic') {
    classicBtn.classList.add('active'); mathBtn.classList.remove('active');
    classicDiv.style.display = 'block'; mathDiv.style.display = 'none';
  } else {
    classicBtn.classList.remove('active'); mathBtn.classList.add('active');
    classicDiv.style.display = 'none'; mathDiv.style.display = 'block';
  }
  haptic('light');
}

// ============== BUILD (Profile constructor) ==============
const BUILD_STRUCT = [
  {key:'acid', label:'\u041A\u0438\u0441\u043B\u043E\u0442\u0430', hint:'\u0441\u0432\u0435\u0436\u0435\u0441\u0442\u044C'},
  {key:'sweet', label:'\u0421\u043B\u0430\u0434\u043E\u0441\u0442\u044C', hint:'\u0441\u0430\u0445\u0430\u0440'},
  {key:'bitter', label:'\u0413\u043E\u0440\u0435\u0447\u044C', hint:'\u0445\u043C\u0435\u043B\u044C'},
  {key:'tannin', label:'\u0422\u0430\u043D\u0438\u043D\u044B', hint:'\u0432\u044F\u0436\u0443\u0447\u0435\u0441\u0442\u044C'},
  {key:'body', label:'\u0422\u0435\u043B\u043E', hint:'\u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C'},
  {key:'carbonation', label:'\u0413\u0430\u0437\u0430\u0446\u0438\u044F', hint:'\u043F\u0443\u0437\u044B\u0440\u044C\u043A\u0438'},
  {key:'savory', label:'\u0421\u043E\u043B\u0451\u043D\u043E\u0435/\u0423\u043C\u0430\u043C\u0438', hint:'\u0433\u043B\u0443\u0442\u043E\u0440\u0438\u0430\u0442'},
];
const BUILD_AROMA = [
  {key:'fruit', label:'\u0424\u0440\u0443\u043A\u0442\u044B', hint:'\u044F\u0431\u043B\u043E\u043A\u0438, \u0446\u0438\u0442\u0440\u0443\u0441'},
  {key:'floral', label:'\u0426\u0432\u0435\u0442\u044B/\u0422\u0440\u0430\u0432\u044B', hint:'\u0440\u043E\u0437\u0430, \u043B\u0430\u0432\u0430\u043D\u0434\u0430'},
  {key:'spice', label:'\u0421\u043F\u0435\u0446\u0438\u0438', hint:'\u043F\u0435\u0440\u0435\u0446, \u043A\u043E\u0440\u0438\u0446\u0430'},
  {key:'wood_smoke', label:'\u0414\u0435\u0440\u0435\u0432\u043E/\u0414\u044B\u043C', hint:'\u0434\u0443\u0431, \u0442\u043E\u0440\u0444'},
  {key:'mineral_earth', label:'\u041C\u0438\u043D\u0435\u0440\u0430\u043B\u044B', hint:'\u043A\u0430\u043C\u043D\u044C, \u043C\u0435\u043B'},
  {key:'sweet_pastry', label:'\u0421\u043B\u0430\u0434\u043A\u043E\u0435', hint:'\u043A\u0430\u0440\u0430\u043C\u0435\u043B\u044C, \u0432\u0430\u043D\u0438\u043B\u044C'},
  {key:'yeast_ferment', label:'\u0414\u0440\u043E\u0436\u0436\u0438', hint:'\u0445\u043B\u0435\u0431, \u0441\u044B\u0440'},
];
const BUILD_DEFAULT_S = {acid:3,sweet:2,bitter:2,tannin:2,body:3,carbonation:2,savory:1};
const BUILD_DEFAULT_A = {fruit:3,floral:2,spice:2,wood_smoke:2,mineral_earth:2,sweet_pastry:2,yeast_ferment:2};

function getBuildProfile() {
  if (!state.build_profile) state.build_profile = { s: {...BUILD_DEFAULT_S}, a: {...BUILD_DEFAULT_A} };
  return state.build_profile;
}

function renderBuild() {
  const p = getBuildProfile();
  const c = document.getElementById('build-container');
  c.innerHTML = `
    <div class="card">
      <div class="radar-container"><canvas id="build-radar-s" width="320" height="320"></canvas></div>
    </div>
    <div class="build-group">
      <h4>\u{1FAC1} \u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u00B7 \u044F\u0437\u044B\u043A</h4>
      ${BUILD_STRUCT.map(item => buildRowHTML('s', item, p.s[item.key])).join('')}
    </div>
    <div class="build-group">
      <h4>\u{1F443} \u0410\u0440\u043E\u043C\u0430\u0442\u0438\u043A\u0430 \u00B7 \u043D\u043E\u0441</h4>
      ${BUILD_AROMA.map(item => buildRowHTML('a', item, p.a[item.key])).join('')}
    </div>
    <div class="build-actions">
      <button class="restart-btn" onclick="randomizeBuild()" style="margin-top:0;">\u{1F3B2} \u0421\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u0439</button>
      <button class="restart-btn" onclick="resetBuild()" style="margin-top:0;">\u00D7 \u0421\u0431\u0440\u043E\u0441</button>
    </div>
    <button class="restart-btn" onclick="findSimilarByProfile()" style="background:var(--gold-dim);border-color:var(--gold);color:var(--text);font-weight:600;margin-top:6px;">\u{1F50D} \u041D\u0430\u0439\u0442\u0438 \u043F\u043E\u0445\u043E\u0436\u0438\u0435 \u043D\u0430\u043F\u0438\u0442\u043A\u0438</button>
  `;
  c.querySelectorAll('input.build-slider').forEach(sl => {
    sl.addEventListener('input', e => {
      const group = e.target.dataset.group;
      const key = e.target.dataset.key;
      const v = parseInt(e.target.value);
      p[group][key] = v;
      e.target.parentElement.querySelector('.val').textContent = v;
      e.target.style.setProperty('--p', ((v - 1) / 4 * 100) + '%');
      drawBuildRadar();
    });
    const v = parseInt(sl.value);
    sl.style.setProperty('--p', ((v - 1) / 4 * 100) + '%');
  });
  drawBuildRadar();
  setupBuildCanvasDrag(document.getElementById('build-radar-s'));
}

function buildRowHTML(group, item, val) {
  return `
    <div class="build-row">
      <div class="lbl">${item.label}<br><span style="font-size:9px;color:var(--text-mute);">${item.hint}</span></div>
      <input type="range" class="build-slider" min="1" max="5" step="1" value="${val}" data-group="${group}" data-key="${item.key}">
      <div class="val">${val}</div>
    </div>
  `;
}

// ============== BUILD PROFILE (Reverse Blind game) ==============
// User sees full drink info (name, desc, tags) and must reconstruct the flavor profile.
// Game compares user's profile to actual drink profile → % match + score.

const BP_DEFAULT_S = {acid:3,sweet:2,bitter:2,tannin:2,body:3,carbonation:2,savory:2};
const BP_DEFAULT_A = {fruit:3,floral:2,spice:2,wood_smoke:2,mineral_earth:2,sweet_pastry:2,yeast_ferment:2};

function getBpProfile() {
  if (!state.bp_profile) state.bp_profile = { s: {...BP_DEFAULT_S}, a: {...BP_DEFAULT_A} };
  return state.bp_profile;
}

function renderBuildProfile() {
  const c = document.getElementById('build-profile-container');

  // ===== SETUP PHASE — choose mode =====
  if (!state.bp_game || state.bp_game.phase === 'setup') {
    if (!state.bp_setup) state.bp_setup = { mode: 'both' };
    const setup = state.bp_setup;
    const modeLabels = {
      both: { ic:'🎯', name:'Оба', desc:'14 осей: структура + ароматика' },
      struct: { ic:'🫁', name:'Структура', desc:'7 осей — только язык' },
      aroma: { ic:'👃', name:'Ароматика', desc:'7 осей — только нос' },
    };
    c.innerHTML = `
      <div class="hero-cta">
        <div class="hero-eyebrow">🎯 Построй профиль</div>
        <div class="hero-title">Восстанови радар<br>по описанию</div>
        <div class="hero-sub">Покажем случайный напиток — попробуй угадать его вкусовой профиль. Чем точнее попадёшь, тем больше очков.</div>
        <div class="hero-meta">
          <span class="chip active">${modeLabels[setup.mode].ic} ${modeLabels[setup.mode].name}</span>
        </div>
        <button class="btn-primary large" onclick="startBpGame()">
          ▶ Начать
        </button>
      </div>

      <div style="margin-top:16px;">
        <div class="section-title">Режим</div>
        <div class="pill-row cols-3">
          <button class="pill ${setup.mode==='both'?'active':''}" onclick="setBpSetup('both')" title="${modeLabels.both.desc}">
            <div class="pill-head"><span class="pill-ic">🎯</span>Оба<span class="pill-mult">×2</span></div>
          </button>
          <button class="pill ${setup.mode==='struct'?'active':''}" onclick="setBpSetup('struct')" title="${modeLabels.struct.desc}">
            <div class="pill-head"><span class="pill-ic">🫁</span>Структура</div>
          </button>
          <button class="pill ${setup.mode==='aroma'?'active':''}" onclick="setBpSetup('aroma')" title="${modeLabels.aroma.desc}">
            <div class="pill-head"><span class="pill-ic">👃</span>Ароматика</div>
          </button>
        </div>
        <p style="font-size:11px;color:var(--text-mute);margin-top:8px;text-align:center;">${modeLabels[setup.mode].desc}</p>
      </div>
    `;
    return;
  }

  const g = state.bp_game;
  const p = getBpProfile();
  const d = g.target;

  // ===== REVEAL PHASE — show result with dual radar =====
  if (g.phase === 'reveal') {
    const mode = g.mode || 'both';
    const useStruct = mode === 'both' || mode === 'struct';
    const useAroma = mode === 'both' || mode === 'aroma';
    const axesResults = [];
    let totalDiff = 0, exactCount = 0, totalAxes = 0;
    if (useStruct) BUILD_STRUCT.forEach(item => {
      const user = p.s[item.key] || 0;
      const real = (d.s||{})[item.key] || 0;
      const diff = Math.abs(user - real);
      totalDiff += diff; if (diff === 0) exactCount++; totalAxes++;
      axesResults.push({ ...item, user, real, diff });
    });
    if (useAroma) BUILD_AROMA.forEach(item => {
      const user = p.a[item.key] || 0;
      const real = (d.a||{})[item.key] || 0;
      const diff = Math.abs(user - real);
      totalDiff += diff; if (diff === 0) exactCount++; totalAxes++;
      axesResults.push({ ...item, user, real, diff });
    });
    const maxDiff = totalAxes * 4;
    const pct = Math.round((1 - totalDiff/maxDiff) * 100);
    const stars = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1;
    const allCorrect = exactCount === totalAxes;
    // Score: pct × 10 + exact_bonus (50 per exact).
    // Mode "both" (14 axes) gets ×2 multiplier — it's much harder to score 75%+ with 14 axes.
    // Full profile (allCorrect) also gets ×2, stacks with mode multiplier.
    let score = pct * 10 + exactCount * 50;
    let multiplier = 1;
    let multLabel = '';
    if (mode === 'both') { multiplier *= 2; multLabel = '×2 (14 осей)'; }
    if (allCorrect) { multiplier *= 2; multLabel = (multLabel ? multLabel + ' + ' : '') + '×2 (полный профиль)'; }
    score = Math.round(score * multiplier);
    g.lastScore = score;
    g.lastPct = pct;

    // Build labels & profiles for dual radar
    let radarLabels, radarKeys, userProfile, realProfile;
    if (mode === 'struct') {
      radarLabels = BUILD_STRUCT.map(i => i.label);
      radarKeys = BUILD_STRUCT.map(i => i.key);
      userProfile = BUILD_STRUCT.map(i => p.s[i.key] || 0);
      realProfile = BUILD_STRUCT.map(i => (d.s||{})[i.key] || 0);
    } else if (mode === 'aroma') {
      radarLabels = BUILD_AROMA.map(i => i.label);
      radarKeys = BUILD_AROMA.map(i => i.key);
      userProfile = BUILD_AROMA.map(i => p.a[i.key] || 0);
      realProfile = BUILD_AROMA.map(i => (d.a||{})[i.key] || 0);
    } else {
      // both — show structure radar only (7 axes, cleaner)
      radarLabels = BUILD_STRUCT.map(i => i.label);
      radarKeys = BUILD_STRUCT.map(i => i.key);
      userProfile = BUILD_STRUCT.map(i => p.s[i.key] || 0);
      realProfile = BUILD_STRUCT.map(i => (d.s||{})[i.key] || 0);
    }
    // Convert arrays to profile objects for drawMultiRadarGeneric
    const userProfileObj = {};
    radarKeys.forEach((k, i) => userProfileObj[k] = userProfile[i]);
    const realProfileObj = {};
    radarKeys.forEach((k, i) => realProfileObj[k] = realProfile[i]);

    c.innerHTML = `
      <div class="result-card ${allCorrect ? 'win' : (pct >= 60 ? '' : 'loss')}">
        <div class="result-badge ${allCorrect ? 'win' : (pct >= 75 ? 'partial' : (pct >= 40 ? 'partial' : 'loss'))}">
          ${allCorrect ? '🏆' : (pct >= 75 ? '🎯' : (pct >= 40 ? '~' : '😵'))}
        </div>
        <div class="result-label ${allCorrect ? 'win' : (pct >= 75 ? 'partial' : (pct >= 40 ? 'partial' : 'loss'))}">
          ${allCorrect ? 'Идеально!' : (pct >= 75 ? 'Отлично!' : (pct >= 60 ? 'Хорошо' : (pct >= 40 ? 'Неплохо' : 'Мимо')))}
        </div>
        <div class="result-score">
          <span style="font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.1em;">Попадание</span>
          <span class="score-pts">${pct}%</span>
          <span style="color:var(--text-mute);">•</span>
          <span style="font-size:11px;color:var(--text-mute);">⭐</span>
          <span class="score-pts">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</span>
        </div>
        <div class="result-drink">${d.name}</div>
        <div class="result-meta">${typeLabel(d)} • ${d.subcat || d.cat} • ${d.origin}</div>
        <div class="bp-legend">
          <span class="bp-legend-item"><span class="bp-legend-dot" style="background:rgba(201,165,92,0.7);border:2px solid #c9a55c;"></span>Твоё</span>
          <span class="bp-legend-item"><span class="bp-legend-dot" style="background:rgba(106,138,200,0.7);border:2px solid #6a8ac8;"></span>Реальное</span>
        </div>
        <div class="radar-dual">
          <div class="radar-cell">
            <h5>${useStruct && useAroma ? '🫁 Структура' : (useStruct ? '🫁 Структура' : '👃 Ароматика')}</h5>
            <canvas id="bp-radar-result" width="220" height="220"></canvas>
          </div>
          ${useStruct && useAroma ? `
            <div class="radar-cell">
              <h5>👃 Ароматика</h5>
              <canvas id="bp-radar-result-a" width="220" height="220"></canvas>
            </div>
          ` : ''}
        </div>
        <div style="margin:14px 0; display:grid; gap:4px;">
          ${axesResults.map(r => `
            <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center;padding:6px 10px;background:${r.diff === 0 ? 'rgba(127,166,80,0.10)' : 'var(--bg-2)'};border-radius:8px;border:1px solid ${r.diff === 0 ? 'var(--green-dim)' : 'transparent'};">
              <span style="font-size:12px;color:var(--text-dim);">${r.label}</span>
              <span style="font-size:11px;color:var(--text-mute);">твоё <b style="color:var(--text);">${r.user}</b></span>
              <span style="font-size:11px;color:var(--text-mute);">реал <b style="color:var(--gold);">${r.real}</b></span>
              <span style="font-size:13px;color:${r.diff === 0 ? 'var(--green-bright)' : 'var(--wine)'};">${r.diff === 0 ? '✓' : 'Δ'+r.diff}</span>
            </div>
          `).join('')}
        </div>
        <div style="background:var(--bg-2);padding:8px 14px;border-radius:16px;display:inline-block;margin-bottom:8px;">
          <span style="font-size:12px;color:var(--text-dim);">Точных: <b style="color:var(--gold);">${exactCount}/${totalAxes}</b></span>
          <span style="font-size:12px;color:var(--gold);margin-left:10px;">Очки: <b>${score}</b>${multiplier > 1 ? `<span style="color:var(--green-bright);font-size:11px;margin-left:4px;">${multLabel}</span>` : ''}</span>
        </div>
        <div class="result-actions">
          <button class="btn-primary" onclick="exitBpToSetup()">▶ Ещё раз</button>
          <button class="btn-secondary" onclick="openDrink(${d.id});">📖 К напитку</button>
        </div>
      </div>
    `;
    // Draw dual radars: user (gold) vs real (blue — contrast, not green which blends with gold)
    setTimeout(() => {
      const canvasS = document.getElementById('bp-radar-result');
      if (canvasS) {
        const sLabels = useStruct ? BUILD_STRUCT.map(i => i.label) : BUILD_AROMA.map(i => i.label);
        const sKeys = useStruct ? BUILD_STRUCT.map(i => i.key) : BUILD_AROMA.map(i => i.key);
        const userS = useStruct ? p.s : p.a;
        const realS = useStruct ? (d.s||{}) : (d.a||{});
        drawMultiRadarGeneric(
          canvasS,
          [userS, realS],
          ['rgba(201,165,92,0.45)', 'rgba(106,138,200,0.40)'],
          ['#c9a55c', '#6a8ac8'],
          getTranslatedStructLabelsForMode(useStruct),
          sKeys,
          sKeys.length
        );
      }
      if (useStruct && useAroma) {
        const canvasA = document.getElementById('bp-radar-result-a');
        if (canvasA) {
          drawMultiRadarGeneric(
            canvasA,
            [p.a, d.a||{}],
            ['rgba(201,165,92,0.45)', 'rgba(106,138,200,0.40)'],
            ['#c9a55c', '#6a8ac8'],
            getTranslatedAromaLabels(),
            BUILD_AROMA.map(i => i.key),
            BUILD_AROMA.length
          );
        }
      }
    }, 50);
    return;
  }

  // ===== PLAY PHASE — sliders only, no radar =====
  const mode = g.mode || 'both';
  const useStruct = mode === 'both' || mode === 'struct';
  const useAroma = mode === 'both' || mode === 'aroma';
  c.innerHTML = `
    <div class="bp-drink-info" id="bp-drink-info">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:0.15em;">🎯 Построй</span>
        <span style="font-size:11px;color:var(--text-mute);">• ${useStruct && useAroma ? '14 осей' : '7 осей'}</span>
        <button class="bp-toggle" onclick="toggleBpInfo()" id="bp-toggle" style="margin-left:auto;background:none;border:none;color:var(--text-mute);font-size:14px;cursor:pointer;padding:4px 8px;">▼</button>
      </div>
      <div class="bp-drink-body" id="bp-drink-body">
        <div style="font-family:Georgia,serif;font-size:18px;color:var(--text);margin-bottom:2px;line-height:1.2;">${d.name}</div>
        <div style="font-size:11px;color:var(--text-mute);margin-bottom:8px;">${typeLabel(d)} • ${d.subcat || d.cat} • ${d.origin} • ${d.abv}</div>
        ${d.desc ? `<div style="font-size:12px;color:var(--text-dim);line-height:1.45;margin-bottom:6px;">${highlightTerms(d.desc)}</div>` : ''}
        ${d.tags && d.tags.length ? `
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            ${d.tags.slice(0, 6).map(t => `<span class="profile-pill" style="font-size:9px;">${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>

    ${useStruct ? `
      <div class="build-group bp-sliders">
        <h4>🫁 Структура</h4>
        ${BUILD_STRUCT.map(item => buildRowHTML('s', item, p.s[item.key])).join('')}
      </div>
    ` : ''}
    ${useAroma ? `
      <div class="build-group bp-sliders">
        <h4>👃 Ароматика</h4>
        ${BUILD_AROMA.map(item => buildRowHTML('a', item, p.a[item.key])).join('')}
      </div>
    ` : ''}

    <div class="bp-action-bar">
      <button class="btn-secondary" onclick="resetBpProfile()" style="flex:0 0 auto;">× Сброс</button>
      <button class="btn-primary" onclick="checkBpProfile()" style="flex:1;">✓ Проверить</button>
    </div>
  `;
  // Wire up sliders (no radar to redraw — just update state)
  c.querySelectorAll('input.build-slider').forEach(sl => {
    sl.addEventListener('input', e => {
      const group = e.target.dataset.group;
      const key = e.target.dataset.key;
      const v = parseInt(e.target.value);
      p[group][key] = v;
      e.target.parentElement.querySelector('.val').textContent = v;
      e.target.style.setProperty('--p', ((v - 1) / 4 * 100) + '%');
    });
    const v = parseInt(sl.value);
    sl.style.setProperty('--p', ((v - 1) / 4 * 100) + '%');
  });
}

function setBpSetup(mode) {
  if (!state.bp_setup) state.bp_setup = { mode: 'both' };
  state.bp_setup.mode = mode;
  haptic('light');
  renderBuildProfile();
}

function toggleBpInfo() {
  const body = document.getElementById('bp-drink-body');
  const btn = document.getElementById('bp-toggle');
  if (!body || !btn) return;
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? '' : 'none';
  btn.textContent = isHidden ? '▼' : '▲';
}

function startBpGame() {
  const target = DRINKS[Math.floor(Math.random() * DRINKS.length)];
  const mode = state.bp_setup?.mode || 'both';
  state.bp_game = { target, phase: 'play', mode };
  state.bp_profile = { s: {...BP_DEFAULT_S}, a: {...BP_DEFAULT_A} };
  renderBuildProfile();
}

function exitBpToSetup() {
  // Return to setup screen so user can choose mode again (struct / aroma / both)
  state.bp_game = null;
  haptic('light');
  renderBuildProfile();
}

function resetBpProfile() {
  state.bp_profile = { s: {...BP_DEFAULT_S}, a: {...BP_DEFAULT_A} };
  haptic('light');
  renderBuildProfile();
}

function checkBpProfile() {
  if (!state.bp_game) return;
  state.bp_game.phase = 'reveal';
  haptic('success');
  // Bonus: confetti if 90%+
  const p = getBpProfile();
  const d = state.bp_game.target;
  let totalDiff = 0;
  [...BUILD_STRUCT, ...BUILD_AROMA].forEach(item => {
    const group = BUILD_STRUCT.includes(item) ? 's' : 'a';
    const user = p[group][item.key] || 0;
    const real = (group === 's' ? (d.s||{}) : (d.a||{}))[item.key] || 0;
    totalDiff += Math.abs(user - real);
  });
  const pct = Math.round((1 - totalDiff/56) * 100);
  if (pct >= 75) { fireConfetti(); playSound('celebrate'); }
  else if (pct >= 50) playSound('tap');
  else playSound('error');
  renderBuildProfile();
}

function drawBuildRadar() {
  // Determine which profile to use: build-profile game (if active) or regular build
  const isBpActive = state.view === 'build-profile' && state.bp_game && state.bp_game.phase === 'play';
  const p = isBpActive ? getBpProfile() : getBuildProfile();
  const canvas = document.getElementById('build-radar-s');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W/2, cy = H/2;
  const r = Math.min(W, H)/2 - 38;
  const allItems = [...BUILD_STRUCT, ...BUILD_AROMA];
  const n = allItems.length;
  const transStruct = getTranslatedBuildStructLabels();
  const transAroma = getTranslatedBuildAromaLabels();
  for (let level = 1; level <= 5; level++) {
    const rr = r * level / 5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI/2 + i * 2*Math.PI/n;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = level === 5 ? '#5a4828' : '#3d2f24';
    ctx.lineWidth = level === 5 ? 1.2 : 0.5;
    ctx.stroke();
    if (level < 5) {
      ctx.fillStyle = '#5a4828';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(level.toString(), cx, cy - rr);
    }
  }
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI/2 + i * 2*Math.PI/n;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = i === BUILD_STRUCT.length ? '#5a4828' : '#3d2f24';
    ctx.lineWidth = i === BUILD_STRUCT.length ? 1.2 : 0.5;
    ctx.stroke();
  }
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const item = allItems[i];
    const group = i < BUILD_STRUCT.length ? 's' : 'a';
    const v = p[group][item.key];
    const angle = -Math.PI/2 + i * 2*Math.PI/n;
    const rr = r * v / 5;
    const x = cx + Math.cos(angle) * rr;
    const y = cy + Math.sin(angle) * rr;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(201,165,92,0.30)';
  ctx.fill();
  ctx.strokeStyle = '#c9a55c';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let i = 0; i < n; i++) {
    const item = allItems[i];
    const group = i < BUILD_STRUCT.length ? 's' : 'a';
    const v = p[group][item.key];
    const angle = -Math.PI/2 + i * 2*Math.PI/n;
    const rr = r * v / 5;
    const x = cx + Math.cos(angle) * rr;
    const y = cy + Math.sin(angle) * rr;
    const isDrag = i === buildDragIdx;
    const isHover = i === buildHoverIdx;
    let rad = 5;
    if (isHover) rad = 8;
    if (isDrag) rad = 10;
    if (isDrag || isHover) {
      ctx.beginPath();
      ctx.arc(x, y, rad + 5, 0, 2*Math.PI);
      ctx.fillStyle = isDrag ? 'rgba(201,165,92,0.40)' : 'rgba(201,165,92,0.22)';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 2*Math.PI);
    ctx.fillStyle = isDrag ? '#f5e6d3' : '#c9a55c';
    ctx.fill();
    ctx.strokeStyle = '#1a1410';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (isDrag || isHover) {
      ctx.fillStyle = '#1a1410';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(v.toString(), x, y);
    }
  }
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const item = allItems[i];
    const angle = -Math.PI/2 + i * 2*Math.PI/n;
    const x = cx + Math.cos(angle) * (r + 18);
    const y = cy + Math.sin(angle) * (r + 18);
    const isActive = i === buildDragIdx || i === buildHoverIdx;
    ctx.fillStyle = isActive ? '#f5e6d3' : (i < BUILD_STRUCT.length ? '#b8a08a' : '#c9a55c');
    ctx.font = isActive ? 'bold 10px sans-serif' : '10px sans-serif';
    // Use translated label if available
    let label = item.label.split('/')[0].slice(0, 12);
    if (i < BUILD_STRUCT.length && transStruct[i]) label = transStruct[i].split('/')[0].slice(0, 12);
    else if (i >= BUILD_STRUCT.length && transAroma[i - BUILD_STRUCT.length]) label = transAroma[i - BUILD_STRUCT.length].slice(0, 12);
    ctx.fillText(label, x, y);
  }
}

// ============== BUILD RADAR DRAG (interactive vertices) ==============
let buildDragIdx = -1;
let buildHoverIdx = -1;
let buildCanvasRef = null;
let buildWindowListenersWired = false;

function setupBuildCanvasDrag(canvas) {
  if (!canvas) return;
  buildCanvasRef = canvas;
  canvas.addEventListener('mousedown', onBuildPointerDown);
  canvas.addEventListener('touchstart', onBuildPointerDown, { passive: false });
  canvas.addEventListener('mousemove', onBuildPointerHover);
  canvas.addEventListener('mouseleave', onBuildPointerLeave);
  canvas.addEventListener('touchmove', onBuildPointerDrag, { passive: false });
  if (!buildWindowListenersWired) {
    window.addEventListener('mousemove', onBuildWindowDrag);
    window.addEventListener('mouseup', onBuildWindowUp);
    window.addEventListener('touchend', onBuildWindowUp, { passive: false });
    window.addEventListener('touchcancel', onBuildWindowUp, { passive: false });
    buildWindowListenersWired = true;
  }
}

function getBuildCanvasCoords(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  let clientX, clientY;
  if (e.touches && e.touches.length) {
    clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length) {
    clientX = e.changedTouches[0].clientX; clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX; clientY = e.clientY;
  }
  return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
}

function hitTestBuildVertex(x, y) {
  if (!buildCanvasRef) return -1;
  const canvas = buildCanvasRef;
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const r = Math.min(canvas.width, canvas.height) / 2 - 38;
  const allItems = [...BUILD_STRUCT, ...BUILD_AROMA];
  const n = allItems.length;
  // Use bp_profile if build-profile game is active
  const isBpActive = state.view === 'build-profile' && state.bp_game && state.bp_game.phase === 'play';
  const p = isBpActive ? getBpProfile() : getBuildProfile();
  for (let i = 0; i < n; i++) {
    const item = allItems[i];
    const group = i < BUILD_STRUCT.length ? 's' : 'a';
    const v = p[group][item.key];
    const angle = -Math.PI/2 + i * 2*Math.PI/n;
    const rr = r * v / 5;
    const vx = cx + Math.cos(angle) * rr;
    const vy = cy + Math.sin(angle) * rr;
    const dx = x - vx, dy = y - vy;
    if (dx*dx + dy*dy < 20*20) return i;
  }
  return -1;
}

function computeBuildValueFromPointer(idx, x, y) {
  if (!buildCanvasRef) return 1;
  const canvas = buildCanvasRef;
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const r = Math.min(canvas.width, canvas.height) / 2 - 38;
  const n = BUILD_STRUCT.length + BUILD_AROMA.length;
  const angle = -Math.PI/2 + idx * 2*Math.PI/n;
  const dx = x - cx, dy = y - cy;
  const proj = dx * Math.cos(angle) + dy * Math.sin(angle);
  let v = Math.round(proj / r * 5);
  if (v < 1) v = 1;
  if (v > 5) v = 5;
  return v;
}

function updateBuildValue(idx, v) {
  const allItems = [...BUILD_STRUCT, ...BUILD_AROMA];
  const item = allItems[idx];
  const group = idx < BUILD_STRUCT.length ? 's' : 'a';
  // Use bp_profile if build-profile game is active
  const isBpActive = state.view === 'build-profile' && state.bp_game && state.bp_game.phase === 'play';
  const p = isBpActive ? getBpProfile() : getBuildProfile();
  if (p[group][item.key] === v) return;
  p[group][item.key] = v;
  // Find slider in either container (build or build-profile)
  const containerId = isBpActive ? '#build-profile-container' : '#build-container';
  const sl = document.querySelector(`${containerId} input.build-slider[data-group="${group}"][data-key="${item.key}"]`);
  if (sl) {
    sl.value = v;
    sl.style.setProperty('--p', ((v - 1) / 4 * 100) + '%');
    sl.parentElement.querySelector('.val').textContent = v;
  }
  drawBuildRadar();
}

function onBuildPointerDown(e) {
  const canvas = buildCanvasRef;
  if (!canvas) return;
  const { x, y } = getBuildCanvasCoords(e, canvas);
  const idx = hitTestBuildVertex(x, y);
  if (idx >= 0) {
    e.preventDefault();
    buildDragIdx = idx;
    haptic('light');
    drawBuildRadar();
  }
}

function onBuildPointerHover(e) {
  if (buildDragIdx >= 0) return;
  const canvas = buildCanvasRef;
  if (!canvas) return;
  const { x, y } = getBuildCanvasCoords(e, canvas);
  const idx = hitTestBuildVertex(x, y);
  if (idx !== buildHoverIdx) {
    buildHoverIdx = idx;
    canvas.style.cursor = idx >= 0 ? 'grab' : 'default';
    drawBuildRadar();
  }
}

function onBuildPointerLeave(e) {
  if (buildDragIdx >= 0) return;
  if (buildHoverIdx >= 0) {
    buildHoverIdx = -1;
    if (buildCanvasRef) buildCanvasRef.style.cursor = 'default';
    drawBuildRadar();
  }
}

function onBuildPointerDrag(e) {
  if (buildDragIdx < 0) return;
  e.preventDefault();
  const canvas = buildCanvasRef;
  const { x, y } = getBuildCanvasCoords(e, canvas);
  const v = computeBuildValueFromPointer(buildDragIdx, x, y);
  updateBuildValue(buildDragIdx, v);
}

function onBuildWindowDrag(e) {
  if (buildDragIdx < 0) return;
  const canvas = buildCanvasRef;
  if (!canvas) return;
  const { x, y } = getBuildCanvasCoords(e, canvas);
  const v = computeBuildValueFromPointer(buildDragIdx, x, y);
  updateBuildValue(buildDragIdx, v);
}

function onBuildWindowUp(e) {
  if (buildDragIdx >= 0) {
    buildDragIdx = -1;
    haptic('light');
    drawBuildRadar();
  }
}

function randomizeBuild() {
  haptic('light');
  const p = getBuildProfile();
  BUILD_STRUCT.forEach(item => { p.s[item.key] = 1 + Math.floor(Math.random() * 5); });
  BUILD_AROMA.forEach(item => { p.a[item.key] = 1 + Math.floor(Math.random() * 5); });
  renderBuild();
}

function resetBuild() {
  haptic('light');
  state.build_profile = { s: {...BUILD_DEFAULT_S}, a: {...BUILD_DEFAULT_A} };
  renderBuild();
}

function findSimilarByProfile() {
  haptic('light');
  playSound('pop');
  const p = getBuildProfile();
  const sKeys = BUILD_STRUCT.map(i => i.key);
  const aKeys = BUILD_AROMA.map(i => i.key);
  const sMax = sKeys.length * 4;
  const aMax = aKeys.length * 4;
  const scored = DRINKS.map(d => {
    let sDiff = 0, aDiff = 0;
    for (const k of sKeys) sDiff += Math.abs((p.s[k]||0) - ((d.s||{})[k] || 0));
    for (const k of aKeys) aDiff += Math.abs((p.a[k]||0) - ((d.a||{})[k] || 0));
    const sMatch = 1 - sDiff/sMax;
    const aMatch = 1 - aDiff/aMax;
    const match = Math.round((sMatch * 0.6 + aMatch * 0.4) * 100);
    return { d, match };
  }).sort((a, b) => b.match - a.match);

  const top = scored.slice(0, 10);
  const best = top[0];
  const avgTop5 = Math.round(top.slice(0, 5).reduce((s, x) => s + x.match, 0) / 5);

  openModal(`
    <div class="modal-cat">\u{1F50D} \u041F\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u043F\u0440\u043E\u0444\u0438\u043B\u044E</div>
    <h2>\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0435 \u043D\u0430\u043F\u0438\u0442\u043A\u0438</h2>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:14px;">
      \u0422\u043E\u043F-${top.length} \u043F\u043E \u0431\u043B\u0438\u0437\u043E\u0441\u0442\u0438 \u043A \u043E\u043F\u0438\u0441\u0430\u043D\u043D\u043E\u043C\u0443 \u0432\u043A\u0443\u0441\u0443. \u0422\u0430\u043F\u043D\u0438 \u043F\u043E \u043B\u044E\u0431\u043E\u043C\u0443 \u2014 \u043E\u0442\u043A\u0440\u043E\u0435\u0442\u0441\u044F \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u043D\u0430\u043F\u0438\u0442\u043A\u0430.
    </p>
    <div class="card" style="text-align:center;">
      <div style="font-size:11px;color:var(--text-mute);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em;">\u041B\u0443\u0447\u0448\u0435\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435</div>
      <div style="font-size:18px;color:var(--text);font-family:Georgia,serif;margin-bottom:2px;">${best.d.name}</div>
      <div style="font-size:11px;color:var(--text-mute);margin-bottom:8px;">${best.d.cat} \u00B7 ${typeLabel(best.d)}</div>
      <div style="font-size:36px;color:var(--gold);font-family:Georgia,serif;line-height:1;">${best.match}%</div>
      <div style="font-size:11px;color:var(--text-mute);margin-top:8px;">\u0421\u0440\u0435\u0434\u043D\u0435\u0435 \u0442\u043E\u043F-5: ${avgTop5}%</div>
    </div>
    <div class="card">
      <h5 style="text-align:center;margin:0 0 8px;color:var(--gold);font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">\u0412\u0430\u0448 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0432\u0441. \u0411\u0430\u0437\u0430</h5>
      <div class="radar-container"><canvas id="build-result-radar" width="320" height="320"></canvas></div>
    </div>
    <div class="section-title" style="margin-top:14px;">\u0422\u043E\u043F-${top.length} \u043F\u043E\u0445\u043E\u0436\u0438\u0445</div>
    ${top.map((x, i) => `
      <div class="build-result-row" onclick="closeModal(); openDrink(${x.d.id});">
        <div class="build-result-rank">${i+1}</div>
        <div>
          <div class="build-result-name">${x.d.name}</div>
          <div class="build-result-cat">${x.d.cat} \u00B7 ${typeLabel(x.d)}</div>
        </div>
        <div class="build-result-match">${x.match}%</div>
      </div>
    `).join('')}
    <button class="restart-btn" onclick="closeModal()" style="margin-top:14px;">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button>
  `);

  setTimeout(() => {
    const canvas = document.getElementById('build-result-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W/2, cy = H/2;
    const r = Math.min(W, H)/2 - 38;
    const allItems = [...BUILD_STRUCT, ...BUILD_AROMA];
    const n = allItems.length;
    const transStruct = getTranslatedBuildStructLabels();
    const transAroma = getTranslatedBuildAromaLabels();
    for (let level = 1; level <= 5; level++) {
      const rr = r * level / 5;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI/2 + i * 2*Math.PI/n;
        const x = cx + Math.cos(angle) * rr;
        const y = cy + Math.sin(angle) * rr;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = level === 5 ? '#5a4828' : '#3d2f24';
      ctx.lineWidth = level === 5 ? 1.2 : 0.5;
      ctx.stroke();
    }
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI/2 + i * 2*Math.PI/n;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.strokeStyle = i === BUILD_STRUCT.length ? '#5a4828' : '#3d2f24';
      ctx.lineWidth = i === BUILD_STRUCT.length ? 1.2 : 0.5;
      ctx.stroke();
    }
    const plotProfile = (profile, fillColor, strokeColor, lineW) => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const item = allItems[i];
        const g = i < BUILD_STRUCT.length ? 's' : 'a';
        const v = profile[g][item.key] || 0;
        const angle = -Math.PI/2 + i * 2*Math.PI/n;
        const rr = r * v / 5;
        const x = cx + Math.cos(angle) * rr;
        const y = cy + Math.sin(angle) * rr;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineW;
      ctx.stroke();
    };
    plotProfile(best.d, 'rgba(212,123,106,0.25)', '#d47b6a', 2);
    plotProfile({s: p.s, a: p.a}, 'rgba(201,165,92,0.30)', '#c9a55c', 2.5);
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const item = allItems[i];
      const angle = -Math.PI/2 + i * 2*Math.PI/n;
      const x = cx + Math.cos(angle) * (r + 18);
      const y = cy + Math.sin(angle) * (r + 18);
      ctx.fillStyle = i < BUILD_STRUCT.length ? '#b8a08a' : '#c9a55c';
      let label = item.label.split('/')[0].slice(0, 12);
    if (i < BUILD_STRUCT.length && transStruct[i]) label = transStruct[i].split('/')[0].slice(0, 12);
    else if (i >= BUILD_STRUCT.length && transAroma[i - BUILD_STRUCT.length]) label = transAroma[i - BUILD_STRUCT.length].slice(0, 12);
    ctx.fillText(label, x, y);
    }
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#c9a55c';
    ctx.textAlign = 'left';
    ctx.fillText('\u25CF \u0412\u044B', 12, 18);
    ctx.fillStyle = '#d47b6a';
    ctx.fillText('\u25CF ' + best.d.name.slice(0, 14), 12, 34);
  }, 60);
}

// ============== COMPARE ==============
const COMPARE_PALETTES = [
  // Each palette: 4 colors (fill, stroke)
  [
    { fill: 'rgba(201,165,92,0.6)', stroke: '#c9a55c' },
    { fill: 'rgba(212,123,106,0.6)', stroke: '#d47b6a' },
    { fill: 'rgba(122,138,74,0.6)', stroke: '#7a8a4a' },
    { fill: 'rgba(106,138,138,0.6)', stroke: '#6a8a8a' },
  ],
  [
    { fill: 'rgba(168,72,74,0.6)', stroke: '#e85a5c' },
    { fill: 'rgba(74,138,168,0.6)', stroke: '#5ab4e8' },
    { fill: 'rgba(168,138,74,0.6)', stroke: '#e8b44a' },
    { fill: 'rgba(138,74,168,0.6)', stroke: '#b44ae8' },
  ],
  [
    { fill: 'rgba(218,165,32,0.6)', stroke: '#daa520' },
    { fill: 'rgba(178,34,34,0.6)', stroke: '#e84a4a' },
    { fill: 'rgba(34,139,34,0.6)', stroke: '#4ae84a' },
    { fill: 'rgba(70,130,180,0.6)', stroke: '#4a9ae8' },
  ],
  [
    { fill: 'rgba(255,99,71,0.6)', stroke: '#ff6347' },
    { fill: 'rgba(50,205,50,0.6)', stroke: '#32cd32' },
    { fill: 'rgba(255,215,0,0.6)', stroke: '#ffd700' },
    { fill: 'rgba(138,43,226,0.6)', stroke: '#8a2be2' },
  ],
];
let comparePaletteIdx = 0;

function getCompareColors() { return COMPARE_PALETTES[comparePaletteIdx].map(c => c.fill); }
function getCompareStrokes() { return COMPARE_PALETTES[comparePaletteIdx].map(c => c.stroke); }

const COMPARE_COLORS = getCompareColors();
const COMPARE_STROKE = getCompareStrokes();

function renderCompare() {
  // Render list of selected drinks with searchable dropdowns
  const listEl = document.getElementById('compare-list-container');
  listEl.innerHTML = `
    <div class="compare-items">
      ${state.compare_list.map((id, i) => {
        const d = DRINKS.find(x => x.id === id);
        if (!d) return '';
        return `
          <div class="compare-item" style="border-left:3px solid ${getCompareStrokes()[i]};">
            <div class="compare-search-wrap" data-idx="${i}">
              <input type="text" class="compare-search-input" placeholder="Поиск напитка..." value="${d.name}" data-idx="${i}"
                onfocus="openCompareDropdown(${i})" oninput="filterCompareDropdown(${i}, this.value)">
              <button class="compare-clear-btn" onclick="clearCompareSearch(${i})" title="Стереть текст">⌫</button>
              <div class="compare-dropdown" id="compare-dropdown-${i}" style="display:none;"></div>
            </div>
            <button class="compare-remove" data-idx="${i}" ${state.compare_list.length<=1?'disabled':''}>✕</button>
          </div>
        `;
      }).join('')}
      ${state.compare_list.length < 4 ? `
        <button class="compare-add-btn" onclick="addCompareSlot()">+ Добавить напиток (${state.compare_list.length}/4)</button>
      ` : ''}
      <button class="compare-add-btn" onclick="cycleComparePalette()" style="margin-top:6px;border-style:solid;">🎨 Сменить цвета</button>
    </div>
  `;
  // Bind remove handlers
  listEl.querySelectorAll('.compare-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = +e.target.dataset.idx;
      if (state.compare_list.length <= 1) return;
      state.compare_list.splice(idx, 1);
      renderCompare();
    });
  });
  // Close dropdowns when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.compare-search-wrap')) {
      document.querySelectorAll('.compare-dropdown').forEach(d => d.style.display = 'none');
    }
  });

  const drinks = state.compare_list.map(id => DRINKS.find(d => d.id === id)).filter(Boolean);
  if (!drinks.length) return;

  const sLabels = {acid:'Кислота',sweet:'Сладость',bitter:'Горечь',tannin:'Танины',body:'Тело',alcohol:'Алкоголь',carbonation:'Газация',savory:'Солёное/Умами'};
  const sColors = {acid:'var(--acid)',sweet:'var(--sweet)',bitter:'var(--bitter)',tannin:'var(--tannin)',body:'var(--gold)',alcohol:'#c95a4a',carbonation:'#6ab8c8',savory:'var(--umami)'};
  const aLabels = {fruit:'Фрукты',floral:'Цветы/Травы',spice:'Специи',wood_smoke:'Дерево/Дым',mineral_earth:'Минералы/Земля',sweet_pastry:'Сладкое/Кондитер',yeast_ferment:'Дрожжи/Фермент'};
  const aColors = {fruit:'#d47b6a',floral:'#b8d4a8',spice:'#c9b04a',wood_smoke:'#7a5a3a',mineral_earth:'#6a8a8a',sweet_pastry:'#d4b85a',yeast_ferment:'#8a7a9a'};
  function sBarsOf(p) {
    return Object.entries(sLabels).map(([k,v]) => `
      <div class="profile-bar">
        <div class="lbl">${v}</div>
        <div class="bar"><div class="fill" style="width:${(p[k]||1)*20}%; background:${sColors[k]}"></div></div>
        <div class="val">${p[k]||1}/5</div>
      </div>
    `).join('');
  }
  function aBarsOf(p) {
    return Object.entries(aLabels).map(([k,v]) => `
      <div class="profile-bar">
        <div class="lbl">${v}</div>
        <div class="bar"><div class="fill" style="width:${(p[k]||1)*20}%; background:${aColors[k]}"></div></div>
        <div class="val">${p[k]||1}/5</div>
      </div>
    `).join('');
  }

  // Compute pairwise matches (structure 60% + aroma 40%)
  let matchHTML = '';
  if (drinks.length >= 2) {
    const sKeys = ['acid','sweet','bitter','tannin','body','carbonation','savory'];
    const aKeys = ['fruit','floral','spice','wood_smoke','mineral_earth','sweet_pastry','yeast_ferment'];
    const pairs = [];
    for (let i = 0; i < drinks.length; i++) {
      for (let j = i+1; j < drinks.length; j++) {
        let sDiff = 0, aDiff = 0;
        for (const k of sKeys) sDiff += Math.abs((drinks[i].s||{})[k] - (drinks[j].s||{})[k]);
        for (const k of aKeys) aDiff += Math.abs((drinks[i].a||{})[k] - (drinks[j].a||{})[k]);
        const sMatch = 1 - sDiff/40;
        const aMatch = 1 - aDiff/35;
        const match = Math.round((sMatch * 0.6 + aMatch * 0.4) * 100);
        pairs.push({a: drinks[i], b: drinks[j], match});
      }
    }
    pairs.sort((x,y) => y.match - x.match);
    const best = pairs[0];
    const worst = pairs[pairs.length-1];
    matchHTML = `
      <div class="card" style="text-align:center;">
        <div style="font-size:13px; color:var(--text-mute); margin-bottom:6px;">Ближайшая пара (структура+ароматика)</div>
        <div style="font-size:14px;color:var(--text-dim);margin-bottom:4px;">${best.a.name} ↔ ${best.b.name}</div>
        <div style="font-size:28px; color:var(--gold); font-family:Georgia,serif;">${best.match}%</div>
        ${drinks.length >= 3 ? `<div style="font-size:11px;color:var(--text-mute);margin-top:6px;">Самая далёкая пара: ${worst.match}%</div>` : ''}
      </div>
    `;
  }

  // Sort state for compare table: {key, dir} or null
  // sortCompareBy и resetCompareSort — глобальные функции (см. ниже после renderCompare)

  // Determine column order based on sort
  let drinkOrder = drinks.map((d, i) => ({ d, originalIdx: i }));
  const allKeys = [...Object.keys(sLabels), ...Object.keys(aLabels)];
  const allLabels = { ...sLabels, ...aLabels };
  const isStructKey = k => k in sLabels;
  if (compareSort && compareSort.key) {
    const k = compareSort.key;
    const getter = (d) => isStructKey(k) ? ((d.s||{})[k] || 0) : ((d.a||{})[k] || 0);
    drinkOrder.sort((a, b) => {
      const va = getter(a.d), vb = getter(b.d);
      return compareSort.dir === 'desc' ? (vb - va) : (va - vb);
    });
  }

  // Sort arrow icon
  function sortIcon(key) {
    if (!compareSort || compareSort.key !== key) return `<span style="opacity:0.4;font-size:10px;">↕</span>`;
    return compareSort.dir === 'desc'
      ? `<span style="color:var(--gold);font-size:11px;">↓</span>`
      : `<span style="color:var(--gold);font-size:11px;">↑</span>`;
  }

  // Row label with inline sort control
  function rowLabelHTML(k) {
    const isActive = compareSort && compareSort.key === k;
    const icon = !isActive
      ? `<span style="opacity:0.4;font-size:10px;">↕</span>`
      : (compareSort.dir === 'desc'
          ? `<span style="color:var(--gold);font-size:11px;">↓</span>`
          : `<span style="color:var(--gold);font-size:11px;">↑</span>`);
    return `<span class="cmp-sort-btn" data-key="${k}" style="cursor:pointer;color:${isActive?'var(--gold)':'var(--text-dim)'};font-weight:${isActive?'700':'400'};font-size:12px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;padding:2px 4px;border-radius:4px;background:${isActive?'var(--card-2)':'transparent'};">${allLabels[k]}${icon}</span>`;
  }

  // Summary table — rows = params, columns = drinks (sorted). Max cell → ↑ + gold.
  function tableRows(keys) {
    return keys.map(k => {
      const maxVal = Math.max(...drinks.map(d => isStructKey(k) ? ((d.s||{})[k] || 0) : ((d.a||{})[k] || 0)));
      return `<tr>
        <td style="padding:6px 4px;font-size:12px;white-space:nowrap;">${rowLabelHTML(k)}</td>
        ${drinkOrder.map(({d}) => {
          const val = isStructKey(k) ? ((d.s||{})[k] || 0) : ((d.a||{})[k] || 0);
          const isMax = val === maxVal && val > 0;
          return `<td style="text-align:center;padding:6px 4px;color:${isMax?'var(--gold)':'var(--text-dim)'};font-weight:${isMax?'700':'400'};font-size:13px;">${val}${isMax?' <span style="color:var(--gold);font-size:11px;">↑</span>':''}</td>`;
        }).join('')}
      </tr>`;
    }).join('');
  }

  // Compact column headers — ●N + drink name (no sort chips)
  const headerCells = drinkOrder.map(({d, originalIdx}) => {
    const num = originalIdx + 1;
    const color = getCompareStrokes()[originalIdx];
    return `<th style="text-align:center;padding:6px 4px;border-bottom:1px solid var(--border);vertical-align:top;min-width:62px;">
      <div style="color:${color};font-weight:700;font-size:14px;">●${num}</div>
      <div style="font-size:9px;color:var(--text-mute);margin-top:2px;line-height:1.2;">${d.name.length>14?d.name.slice(0,12)+'…':d.name}</div>
    </th>`;
  }).join('');

  // Legend for radar
  const legendHTML = drinks.map((d, i) => `
    <span style="color:${getCompareStrokes()[i]};font-weight:600;">●${i+1} ${d.name.length > 22 ? d.name.slice(0,20)+'…' : d.name}</span>
  `).join('');

  document.getElementById('compare-container').innerHTML = `
    ${matchHTML}
    <div class="card">
      <h4 style="font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">🫁 Структура</h4>
      <div class="radar-container"><canvas id="compare-radar-s" width="400" height="400"></canvas></div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px 14px;font-size:11px;margin-top:8px;">${legendHTML}</div>
    </div>
    <div class="card">
      <h4 style="font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">👃 Ароматика</h4>
      <div class="radar-container"><canvas id="compare-radar-a" width="400" height="400"></canvas></div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px 14px;font-size:11px;margin-top:8px;">${legendHTML}</div>
    </div>
    <div class="card">
      <div style="font-size:12px;color:var(--text-mute);margin-bottom:8px;">Нажми по названию параметра — сортировка. ↑ = максимум.</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead><tr>
          <th style="text-align:left;padding:6px 4px;border-bottom:1px solid var(--border);"></th>
          ${headerCells}
        </tr></thead>
        <tbody>
          <tr><td colspan="${drinkOrder.length+1}" style="padding:8px 6px 5px;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--gold);border-bottom:1px solid var(--border);background:var(--card-2);">🫁 Структура · язык</td></tr>
          ${tableRows(Object.keys(sLabels))}
          <tr><td colspan="${drinkOrder.length+1}" style="padding:10px 6px 5px;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--gold);border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--card-2);">👃 Ароматика · нос</td></tr>
          ${tableRows(Object.keys(aLabels))}
        </tbody>
      </table>
      ${compareSort ? `<button class="restart-btn" onclick="resetCompareSort()" style="margin-top:12px;font-size:12px;padding:8px 16px;">✕ Сбросить сортировку</button>` : ''}
    </div>
    ${drinks.map(d => `<button class="restart-btn" onclick="openDrink(${d.id})">Подробнее: ${d.name.split('(')[0].trim().slice(0,30)}…</button>`).join('')}
  `;

  // Wire up sort buttons (now in row labels)
  document.querySelectorAll('.cmp-sort-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      sortCompareBy(btn.dataset.key);
    });
  });

  // Draw both multi-radars
  setTimeout(() => {
    const sCanvas = document.getElementById('compare-radar-s');
    if (sCanvas) drawMultiRadar(sCanvas, drinks.map(d => d.s||{}), getCompareColors(), getCompareStrokes());
    const aCanvas = document.getElementById('compare-radar-a');
    if (aCanvas) drawMultiAromaRadar(aCanvas, drinks.map(d => d.a||{}), getCompareColors(), getCompareStrokes());
  }, 50);
}

// Глобальные функции сортировки Compare (чтобы onclick из HTML их видел)
let compareSort = null;
function sortCompareBy(key) {
  haptic('light');
  if (compareSort && compareSort.key === key) {
    compareSort.dir = compareSort.dir === 'desc' ? 'asc' : 'desc';
  } else {
    compareSort = { key, dir: 'desc' };
  }
  renderCompare();
}
function resetCompareSort() {
  haptic('light');
  compareSort = null;
  renderCompare();
}

function cycleComparePalette() {
  comparePaletteIdx = (comparePaletteIdx + 1) % COMPARE_PALETTES.length;
  haptic('light');
  renderCompare();
}

function addCompareSlot() {
  if (state.compare_list.length >= 4) return;
  // Pick first drink not already in list
  const available = DRINKS.find(d => !state.compare_list.includes(d.id));
  if (available) state.compare_list.push(available.id);
  renderCompare();
}

function openCompareDropdown(idx) {
  // Close all other dropdowns
  document.querySelectorAll('.compare-dropdown').forEach((d, i) => {
    if (i !== idx) d.style.display = 'none';
  });
  const dd = document.getElementById('compare-dropdown-'+idx);
  if (!dd) return;
  const input = document.querySelector(`.compare-search-input[data-idx="${idx}"]`);
  filterCompareDropdown(idx, input ? input.value : '');
  dd.style.display = 'block';
}

function filterCompareDropdown(idx, query) {
  const dd = document.getElementById('compare-dropdown-'+idx);
  if (!dd) return;
  const q = query.toLowerCase().trim();
  // If input matches current drink name exactly, don't filter
  const currentId = state.compare_list[idx];
  const currentDrink = DRINKS.find(d => d.id === currentId);
  const isCurrentName = currentDrink && currentDrink.name.toLowerCase() === q;

  let list = DRINKS;
  if (q && !isCurrentName) {
    list = DRINKS.filter(d => {
      const hay = (d.name + ' ' + d.cat + ' ' + d.origin + ' ' + (d.tags||[]).join(' ')).toLowerCase();
      return hay.includes(q);
    });
  }
  // Show top 50 results
  list = list.slice(0, 50);
  dd.innerHTML = list.map(d => `
    <div class="compare-dropdown-item ${d.id===currentId?'selected':''}" onclick="selectCompareDrink(${idx}, ${d.id})">
      <span class="compare-dropdown-name">${d.name}</span>
      <span class="compare-dropdown-meta">${d.cat} • ${typeLabel(d)}</span>
    </div>
  `).join('');
  if (!list.length) {
    dd.innerHTML = '<div style="padding:12px;color:var(--text-mute);font-size:12px;text-align:center;">Ничего не найдено</div>';
  }
}

function clearCompareSearch(idx) {
  const input = document.querySelector(`.compare-search-input[data-idx="${idx}"]`);
  if (input) {
    input.value = '';
    input.focus();
    filterCompareDropdown(idx, '');
  }
}

function selectCompareDrink(idx, drinkId) {
  state.compare_list[idx] = drinkId;
  // Close dropdown
  const dd = document.getElementById('compare-dropdown-'+idx);
  if (dd) dd.style.display = 'none';
  renderCompare();
}

function addToCompare(id) {
  // If already in list — toast and don't duplicate
  if (state.compare_list.includes(id)) {
    toast('Уже в сравнении');
    return;
  }
  if (state.compare_list.length >= 4) {
    // Replace last
    state.compare_list[state.compare_list.length - 1] = id;
  } else {
    state.compare_list.push(id);
  }
  toast('Добавлено в сравнение');
  switchView('compare');
}

// ============== BLIND TASTING (reverse quiz) ==============
const BLIND_TYPE_LABELS = {wine:'Вино',beer:'Пиво',spirit:'Крепкое',sake:'Саке',cider:'Сидр',mead:'Медовуха',coffee:'Кофе',tea:'Чай'};
const BLIND_TYPE_ICONS = {wine:'🍷',beer:'🍺',spirit:'🥃',sake:'🍶',cider:'🍏',mead:'🍯',coffee:'☕',tea:'🍵'};

function startBlindRound(category, difficulty, mode) {
  // Filter drinks by category (if any)
  let pool = DRINKS;
  if (category) {
    if (category === 'coffee-tea') {
      pool = DRINKS.filter(d => d.type === 'coffee' || d.type === 'tea');
    } else {
      pool = DRINKS.filter(d => d.type === category);
    }
  }
  if (pool.length < 4) {
    toast('Слишком мало напитков в этой категории');
    return;
  }
  // Get difficulty mode config
  const diffMode = BLIND_MODES.find(m => m.id === difficulty) || BLIND_MODES[0];
  // Pick random drink from pool
  const target = pool[Math.floor(Math.random()*pool.length)];
  // Generate 3 distractor drinks from same pool (or from all if pool too small)
  const distractorPool = pool.length >= 8 ? pool : DRINKS;
  const distractors = [];
  let safety = 0;
  while (distractors.length < 3 && safety < 100) {
    safety++;
    const cand = distractorPool[Math.floor(Math.random()*distractorPool.length)];
    if (cand.id !== target.id && !distractors.find(d => d.id === cand.id)) distractors.push(cand);
  }
  // Generate 3 distractor types for step 1
  const allTypes = ['wine','beer','spirit','sake','cider','mead','coffee','tea'];
  const otherTypes = allTypes.filter(t => t !== target.type).sort(() => Math.random()-0.5).slice(0, 3);
  const typeOptions = [target.type, ...otherTypes].sort(() => Math.random()-0.5);
  // Generate 3 distractor subcats for step 2 (from same type, different subcat)
  const targetSubcat = target.subcat || target.cat;
  const sameTypeSubcats = [...new Set(DRINKS.filter(d => d.type === target.type).map(d => d.subcat || d.cat))].filter(c => c !== targetSubcat);
  const otherSubcats = sameTypeSubcats.sort(() => Math.random()-0.5).slice(0, 3);
  const catOptions = [targetSubcat, ...otherSubcats].sort(() => Math.random()-0.5);
  if (otherSubcats.length < 3) {
    while (catOptions.length < 4) {
      const rand = DRINKS[Math.floor(Math.random()*DRINKS.length)];
      const randSub = rand.subcat || rand.cat;
      if (randSub !== targetSubcat && !catOptions.includes(randSub)) catOptions.push(randSub);
    }
  }
  // Generate 4 drink options for step 3
  const drinkOptions = [target, ...distractors].sort(() => Math.random()-0.5);

  // If a specific category was selected (not 'all'), skip the "type" step
  // — it's trivial because the answer is already known. Go straight to "category" step.
  const skipTypeStep = category && category !== 'all';
  const gameMode = mode || 'single';
  const totalRounds = gameMode === 'series5' ? 5 : gameMode === 'series10' ? 10 : 1;

  state.blind = {
    target,
    category: category || 'all',
    difficulty: diffMode.id,
    diffMode: diffMode,
    gameMode: gameMode,
    totalRounds: totalRounds,
    phase: skipTypeStep ? 'cat' : 'intro',
    skipTypeStep: skipTypeStep,
    typeOptions, catOptions, drinkOptions,
    typeAnswer: skipTypeStep ? (category === 'coffee-tea' ? 'coffee' : category) : null,
    typeCorrect: skipTypeStep ? true : null,
    catAnswer: null, drinkAnswer: null,
    catCorrect: null, drinkCorrect: null,
    score: state.blind?.score || 0,
    round: (state.blind?.round || 0) + 1,
    rounds: state.blind?.rounds || [],
    lastRoundPoints: 0,
    _pointsAwarded: false  // reset for new round — prevents double-counting on re-render
  };
  renderBlind();
}

// Helper: render hints (radar/tags/hint) based on difficulty mode
function blindHintsHTML(b) {
  const m = b.diffMode;
  let html = '';
  if (m.show_radar) {
    // 2 compact radars side by side
    html += `<div class="radar-dual" style="padding:4px 0;">
      <div class="radar-cell">
        <h5>🫁 Структура</h5>
        <canvas id="blind-radar-s" width="220" height="220"></canvas>
      </div>
      <div class="radar-cell">
        <h5>👃 Ароматика</h5>
        <canvas id="blind-radar-a" width="220" height="220"></canvas>
      </div>
    </div>`;
  }
  if (m.show_tags) {
    // Compact single-line tags with horizontal scroll
    html += `<div style="display:flex;gap:4px;overflow-x:auto;padding:4px 0 8px;scrollbar-width:none;-webkit-overflow-scrolling:touch;">
      ${b.target.tags.map(t => `<span class="profile-pill" style="flex-shrink:0;font-size:11px;">${t}</span>`).join('')}
    </div>`;
  }
  if (m.show_hint) {
    html += `<div style="background:var(--bg-2);padding:10px;border-radius:8px;margin:8px 0;text-align:center;font-size:12px;color:var(--text-dim);">
      📍 ${b.target.origin} • 📊 ${b.target.abv}
    </div>`;
  }
  if (!m.show_radar && !m.show_tags && !m.show_hint) {
    // No hints at all — show placeholder
    html += `<div style="padding:40px 20px;text-align:center;color:var(--text-mute);font-style:italic;">
      🤐 Никаких подсказок. Только интуиция.
    </div>`;
  }
  return html;
}

function renderBlind() {
  const c = document.getElementById('blind-container');
  if (!state.blind) {
    // Ensure setup state exists
    if (!state.blind_setup) {
      state.blind_setup = { category: null, difficulty: 'all', mode: 'single' };
    }
    const setup = state.blind_setup;
    const catCounts = {
      wine: DRINKS.filter(d=>d.type==='wine').length,
      beer: DRINKS.filter(d=>d.type==='beer').length,
      spirit: DRINKS.filter(d=>d.type==='spirit').length,
      'coffee-tea': DRINKS.filter(d=>d.type==='coffee'||d.type==='tea').length,
      sake: DRINKS.filter(d=>d.type==='sake').length,
    };
    const catLabels = {
      null: { ic:'🎲', name:'Все категории', sub:`любой из ${DRINKS.length}` },
      wine: { ic:'🍷', name:'Вино', sub: catCounts.wine + ' напитков' },
      beer: { ic:'🍺', name:'Пиво', sub: catCounts.beer + ' напитков' },
      spirit: { ic:'🥃', name:'Крепкое', sub: catCounts.spirit + ' напитков' },
      'coffee-tea': { ic:'☕', name:'Кофе + Чай', sub: catCounts['coffee-tea'] + ' напитков' },
      sake: { ic:'🍶', name:'Саке', sub: catCounts.sake + ' напитков' },
    };
    const curCat = catLabels[setup.category];
    const curMode = BLIND_MODES.find(m => m.id === setup.difficulty) || BLIND_MODES[0];
    const modeLabels = { single:'1 раунд', series5:'Серия ×5', series10:'Марафон ×10' };
    c.innerHTML = `
      <div class="hero-cta">
        <div class="hero-eyebrow">🍷 Слепая дегустация</div>
        <div class="hero-title">Угадай напиток<br>по радару вкусов</div>
        <div class="hero-sub">Загадаем случайный напиток — попробуй распознать: тип → категорию → конкретное название. 3 шага, 3 уровня намёков.</div>
        <div class="hero-meta">
          <span class="chip active" id="hero-cat-chip">${curCat.ic} ${curCat.name}</span>
          <span class="chip active" id="hero-mode-chip">${curMode.icon} ${curMode.title}</span>
          <span class="chip active" id="hero-game-chip">🎯 ${modeLabels[setup.mode] || '1 раунд'}</span>
        </div>
        <button class="btn-primary large" onclick="startBlindRound(state.blind_setup.category, state.blind_setup.difficulty, state.blind_setup.mode)">
          ▶ Начать дегустацию
        </button>
      </div>

      <div style="margin-top:18px;">
        <div class="section-title">Категория</div>
        <div class="tile-grid">
          <button class="tile ${setup.category===null?'active':''}" onclick="setBlindSetup('category', null)">
            <div class="tile-ic">🎲</div>
            <div class="tile-name">Все</div>
            <div class="tile-count">${DRINKS.length} нап.</div>
          </button>
          <button class="tile ${setup.category==='wine'?'active':''}" onclick="setBlindSetup('category', 'wine')">
            <div class="tile-ic">🍷</div>
            <div class="tile-name">Вино</div>
            <div class="tile-count">${catCounts.wine} нап.</div>
          </button>
          <button class="tile ${setup.category==='beer'?'active':''}" onclick="setBlindSetup('category', 'beer')">
            <div class="tile-ic">🍺</div>
            <div class="tile-name">Пиво</div>
            <div class="tile-count">${catCounts.beer} нап.</div>
          </button>
          <button class="tile ${setup.category==='spirit'?'active':''}" onclick="setBlindSetup('category', 'spirit')">
            <div class="tile-ic">🥃</div>
            <div class="tile-name">Крепкое</div>
            <div class="tile-count">${catCounts.spirit} нап.</div>
          </button>
          <button class="tile ${setup.category==='coffee-tea'?'active':''}" onclick="setBlindSetup('category', 'coffee-tea')">
            <div class="tile-ic">☕</div>
            <div class="tile-name">Кофе + Чай</div>
            <div class="tile-count">${catCounts['coffee-tea']} нап.</div>
          </button>
          <button class="tile ${setup.category==='sake'?'active':''}" onclick="setBlindSetup('category', 'sake')">
            <div class="tile-ic">🍶</div>
            <div class="tile-name">Саке</div>
            <div class="tile-count">${catCounts.sake} нап.</div>
          </button>
        </div>
      </div>

      <div style="margin-top:16px;">
        <div class="section-title">Сложность</div>
        <div class="pill-row cols-4">
          ${BLIND_MODES.map(m => {
            const mult = m.id === 'expert' ? 2 : (m.id === 'notes' || m.id === 'profile') ? 1.5 : 1;
            const multBadge = mult > 1 ? `<span class="pill-mult">×${mult}</span>` : '';
            return `
              <button class="pill ${setup.difficulty===m.id?'active':''}" onclick="setBlindSetup('difficulty', '${m.id}')" title="${m.description}">
                <div class="pill-head"><span class="pill-ic">${m.icon}</span>${m.title}${multBadge}</div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div style="margin-top:16px;">
        <div class="section-title">Режим игры</div>
        <div class="pill-row cols-3">
          <button class="pill ${setup.mode==='single'?'active':''}" onclick="setBlindSetup('mode','single')" title="Разовый заезд">
            <div class="pill-head"><span class="pill-ic">🎯</span>1 раунд</div>
          </button>
          <button class="pill ${setup.mode==='series5'?'active':''}" onclick="setBlindSetup('mode','series5')" title="5 раундов подряд">
            <div class="pill-head"><span class="pill-ic">🏆</span>Серия ×5</div>
          </button>
          <button class="pill ${setup.mode==='series10'?'active':''}" onclick="setBlindSetup('mode','series10')" title="Длинная игра">
            <div class="pill-head"><span class="pill-ic">👑</span>×10</div>
          </button>
        </div>
      </div>
    `;
    return;
  }
  const b = state.blind;
  if (b.phase === 'intro') {
    // Show radar + tags, ask "type?"
    c.innerHTML = `
      <div class="card blind-hints-area" style="text-align:center; padding:12px; padding-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:11px; color:var(--gold); text-transform:uppercase; letter-spacing:0.15em;">Раунд ${b.round}${b.totalRounds > 1 ? '/' + b.totalRounds : ''} • ${b.skipTypeStep ? 'Шаг 1 из 2' : 'Шаг 1 из 3'} — ${b.skipTypeStep ? 'стиль' : 'тип напитка'}</div>
          <button class="quiz-back" style="margin:0;padding:4px 10px;font-size:11px;" onclick="skipBlind()">Пропустить →</button>
        </div>
        <h3 style="font-family:Georgia,serif; color:var(--text); margin-top:8px; margin-bottom:10px;">Что за категория?</h3>
        <p style="color:var(--text-mute); font-size:12px; margin-bottom:10px;">${b.diffMode.title}: ${b.diffMode.description}</p>
        ${blindHintsHTML(b)}
      </div>
      <div class="blind-sticky-bar">
        <div class="quiz-answers">
          ${b.typeOptions.map((t,i) => `
            <button class="quiz-ans" onclick="answerBlindType(${i})">
              <div class="ic">${BLIND_TYPE_ICONS[t]}</div>
              <div class="txt">${BLIND_TYPE_LABELS[t]}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    setTimeout(() => {
      const sCanvas = document.getElementById('blind-radar-s');
      if (sCanvas) drawRadar(sCanvas, b.target.s||{});
      const aCanvas = document.getElementById('blind-radar-a');
      if (aCanvas) drawAromaRadar(aCanvas, b.target.a||{});
    }, 50);
  } else if (b.phase === 'cat') {
    // After type answered, show feedback + ask category
    c.innerHTML = `
      <div class="card blind-hints-area" style="text-align:center; padding:12px; padding-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:11px; color:var(--gold); text-transform:uppercase; letter-spacing:0.15em;">Раунд ${b.round}${b.totalRounds > 1 ? '/' + b.totalRounds : ''} • ${b.skipTypeStep ? 'Шаг 1 из 2' : 'Шаг 2 из 3'} — стиль/категория</div>
          <button class="quiz-back" style="margin:0;padding:4px 10px;font-size:11px;" onclick="skipBlind()">Пропустить →</button>
        </div>
        ${b.skipTypeStep
          ? `<div style="margin:10px 0;font-size:12px;color:var(--text-mute);">Категория выбрана: <span style="color:var(--gold);">${BLIND_TYPE_ICONS[b.target.type]} ${BLIND_TYPE_LABELS[b.target.type]} (+1 авто)</span></div>`
          : ''}
        <h3 style="font-family:Georgia,serif; color:var(--text); margin-bottom:10px;">Какой стиль/категория?</h3>
        ${blindHintsHTML(b)}
      </div>
      <div class="blind-sticky-bar">
        <div class="quiz-answers">
          ${b.catOptions.map((cat,i) => `
            <button class="quiz-ans" onclick="answerBlindCat(${i})">
              <div class="ic">🏷️</div>
              <div class="txt">${cat}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    setTimeout(() => {
      const sCanvas = document.getElementById('blind-radar-s');
      if (sCanvas) drawRadar(sCanvas, b.target.s||{});
      const aCanvas = document.getElementById('blind-radar-a');
      if (aCanvas) drawAromaRadar(aCanvas, b.target.a||{});
    }, 50);
  } else if (b.phase === 'drink') {
    // After cat answered, show feedback + ask specific drink
    c.innerHTML = `
      <div class="card blind-hints-area" style="text-align:center; padding:12px; padding-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:11px; color:var(--gold); text-transform:uppercase; letter-spacing:0.15em;">Раунд ${b.round}${b.totalRounds > 1 ? '/' + b.totalRounds : ''} • ${b.skipTypeStep ? 'Шаг 2 из 2' : 'Шаг 3 из 3'} — конкретный напиток</div>
          <button class="quiz-back" style="margin:0;padding:4px 10px;font-size:11px;" onclick="skipBlind()">Пропустить →</button>
        </div>
        <h3 style="font-family:Georgia,serif; color:var(--text); margin-bottom:10px;">Что это за напиток?</h3>
        ${blindHintsHTML(b)}
      </div>
      <div class="blind-sticky-bar">
        <div class="quiz-answers">
          ${b.drinkOptions.map((d,i) => `
            <button class="quiz-ans" onclick="answerBlindDrink(${i})">
              <div class="ic">${BLIND_TYPE_ICONS[d.type]}</div>
              <div class="txt">${d.name}<small>${d.cat}</small></div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    setTimeout(() => {
      const sCanvas = document.getElementById('blind-radar-s');
      if (sCanvas) drawRadar(sCanvas, b.target.s||{});
      const aCanvas = document.getElementById('blind-radar-a');
      if (aCanvas) drawAromaRadar(aCanvas, b.target.a||{});
    }, 50);
  } else if (b.phase === 'reveal') {
    // Final reveal
    const allCorrect = b.typeCorrect && b.catCorrect && b.drinkCorrect;
    // Base points: 1 for type, 1 for cat, 3 for drink
    let basePoints = (b.typeCorrect?1:0) + (b.catCorrect?1:0) + (b.drinkCorrect?3:0);
    // Difficulty multiplier: harder modes give more points
    const diffMultipliers = { all: 1, notes: 1.5, profile: 1.5, expert: 2 };
    const mult = diffMultipliers[b.difficulty] || 1;
    const points = Math.round(basePoints * mult);
    // Award points only ONCE per round (when entering reveal for the first time).
    // Otherwise swipe-away-then-back would re-add points on every re-render.
    // _pointsAwarded flag is reset in startBlindRound() / nextBlindRound().
    if (!b._pointsAwarded) {
      b.score += points;
      b.lastRoundPoints = points;
      b._pointsAwarded = true;
    }
    c.innerHTML = `
      <div class="result-card ${allCorrect ? 'win' : (points > 0 ? '' : 'loss')}">
        <div class="result-badge ${allCorrect ? 'win' : (points > 0 ? 'partial' : 'loss')}">
          ${allCorrect ? '🏆' : (points > 0 ? '🎯' : '😵')}
        </div>
        <div class="result-label ${allCorrect ? 'win' : (points > 0 ? 'partial' : 'loss')}">
          ${allCorrect ? 'Полное попадание!' : (points > 0 ? 'Частично верно' : 'Мимо')}
        </div>
        <div class="result-drink">${b.target.name}</div>
        <div class="result-meta">${BLIND_TYPE_ICONS[b.target.type]} ${BLIND_TYPE_LABELS[b.target.type]} • ${b.target.subcat || b.target.cat} • ${b.target.origin}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px 0 10px;">
          ${b.target.tags.map(t => `<span class="profile-pill" style="margin-right:4px;">${t}</span>`).join('')}
        </div>
        <div class="result-steps">
          <div class="result-step ${b.skipTypeStep ? '' : (b.typeCorrect?'ok':'bad')}">
            <div class="step-label">Тип</div>
            <div class="step-icon">${b.skipTypeStep ? '⚡' : (b.typeCorrect?'✓':'✗')}</div>
            <div class="step-pts">${b.skipTypeStep ? 'авто' : '+1'}</div>
          </div>
          <div class="result-step ${b.catCorrect?'ok':'bad'}">
            <div class="step-label">Стиль</div>
            <div class="step-icon">${b.catCorrect?'✓':'✗'}</div>
            <div class="step-pts">+1</div>
          </div>
          <div class="result-step ${b.drinkCorrect?'ok':'bad'}">
            <div class="step-label">Напиток</div>
            <div class="step-icon">${b.drinkCorrect?'✓':'✗'}</div>
            <div class="step-pts">+3</div>
          </div>
        </div>
        <div class="result-score">
          <span style="font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.1em;">Очки</span>
          <span class="score-pts"><b id="blind-score-round" class="score-animate">${points}</b></span>
          ${mult > 1 ? `<span class="score-mult">×${mult} ${b.diffMode.title}</span>` : ''}
          <span style="color:var(--text-mute);">•</span>
          <span style="font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.1em;">Всего</span>
          <span class="score-pts"><b id="blind-score-total" class="score-animate">${b.score}</b></span>
        </div>
        ${b.gameMode !== 'single' ? `
          <div style="background:var(--bg-2);padding:6px 14px;border-radius:16px;display:inline-block;margin-bottom:6px;">
            <span style="font-size:12px;color:var(--text-dim);">Раунд ${b.round}/${b.totalRounds}</span>
            <span style="font-size:11px;color:var(--gold);margin-left:8px;">${'★'.repeat(Math.min(5, points))}${'☆'.repeat(Math.max(0, 5-points))}</span>
          </div>
        ` : ''}
        <div class="result-actions">
          ${b.gameMode !== 'single' && b.round < b.totalRounds ? `
            <button class="btn-primary" onclick="nextBlindRound()">▶ Следующий (${b.round}/${b.totalRounds})</button>
            <button class="btn-secondary" onclick="openDrink(${b.target.id}); closeBlind();">📖 К напитку</button>
          ` : b.gameMode !== 'single' && b.round >= b.totalRounds ? `
            <button class="btn-primary" onclick="showSeriesSummary()">🏁 Итоги серии</button>
            <button class="btn-secondary" onclick="openDrink(${b.target.id}); closeBlind();">📖 К напитку</button>
          ` : `
            <button class="btn-primary" onclick="resetBlindScore()">▶ Ещё раз</button>
            <button class="btn-secondary" onclick="openDrink(${b.target.id}); closeBlind();">📖 К напитку</button>
          `}
        </div>
      </div>
    `;
    setTimeout(() => {
      // Confetti on correct drink guess
      if (b.drinkCorrect) { fireConfetti(); playSound('celebrate'); haptic('success'); }
      else if (b.drinkGuess) { playSound('error'); haptic('warning'); }
      else { playSound('pop'); }
      // Animate scores
      const roundEl = document.getElementById('blind-score-round');
      if (roundEl) { roundEl.textContent = '0'; animateScore(roundEl, points, 800); }
      const totalEl = document.getElementById('blind-score-total');
      if (totalEl) { totalEl.textContent = '0'; animateScore(totalEl, b.score, 1000); }
    }, 100);
  }
}
function answerBlindType(i) {
  const b = state.blind;
  b.typeAnswer = b.typeOptions[i];
  b.typeCorrect = (b.typeAnswer === b.target.type);
  b.phase = 'cat';
  haptic('light');
  renderBlind();
}
function answerBlindCat(i) {
  const b = state.blind;
  b.catAnswer = b.catOptions[i];
  b.catCorrect = (b.catAnswer === (b.target.subcat || b.target.cat));
  b.phase = 'drink';
  haptic('light');
  renderBlind();
}
function answerBlindDrink(i) {
  const b = state.blind;
  b.drinkAnswer = b.drinkOptions[i];
  b.drinkCorrect = (b.drinkAnswer.id === b.target.id);
  b.phase = 'reveal';
  haptic(b.drinkCorrect ? 'success' : 'error');
  if (!b.drinkCorrect) {
    // Shake the clicked button
    const btns = document.querySelectorAll('#blind-container .quiz-ans');
    if (btns[i]) {
      btns[i].classList.add('shake');
      setTimeout(() => btns[i] && btns[i].classList.remove('shake'), 400);
    }
    setTimeout(() => renderBlind(), 300);
  } else {
    renderBlind();
  }
}
function skipBlind() {
  // Skip current step: set answer to null (incorrect), advance phase
  const b = state.blind;
  if (b.phase === 'intro') {
    b.typeAnswer = null; b.typeCorrect = false; b.phase = 'cat';
  } else if (b.phase === 'cat') {
    b.catAnswer = null; b.catCorrect = false; b.phase = 'drink';
  } else if (b.phase === 'drink') {
    b.drinkAnswer = null; b.drinkCorrect = false; b.phase = 'reveal';
  }
  renderBlind();
}
function nextBlindRound() {
  const b = state.blind;
  if (!b) return;
  // Save current round result
  b.rounds = b.rounds || [];
  b.rounds.push({
    target: b.target.name,
    points: b.lastRoundPoints || 0,
    typeCorrect: b.typeCorrect,
    catCorrect: b.catCorrect,
    drinkCorrect: b.drinkCorrect
  });
  // Increment round, reset answers, keep score+rounds+settings
  b.round = (b.round || 1) + 1;
  b.phase = b.skipTypeStep ? 'cat' : 'intro';
  b.typeAnswer = b.skipTypeStep ? (b.category === 'coffee-tea' ? 'coffee' : b.category) : null;
  b.typeCorrect = b.skipTypeStep ? true : null;
  b.catAnswer = null; b.drinkAnswer = null;
  b.catCorrect = null; b.drinkCorrect = null;
  b.lastRoundPoints = 0;
  // Pick new target from same pool
  const cat = b.category;
  let pool = DRINKS;
  if (cat && cat !== 'all') {
    pool = cat === 'coffee-tea' ? DRINKS.filter(d => d.type === 'coffee' || d.type === 'tea') : DRINKS.filter(d => d.type === cat);
  }
  b.target = pool[Math.floor(Math.random()*pool.length)];
  // Generate new options
  const allTypes = ['wine','beer','spirit','sake','cider','mead','coffee','tea'];
  const otherTypes = allTypes.filter(t => t !== b.target.type).sort(() => Math.random()-0.5).slice(0, 3);
  b.typeOptions = [b.target.type, ...otherTypes].sort(() => Math.random()-0.5);
  const targetSubcat = b.target.subcat || b.target.cat;
  const sameTypeSubcats = [...new Set(DRINKS.filter(d => d.type === b.target.type).map(d => d.subcat || d.cat))].filter(c => c !== targetSubcat);
  const otherSubcats = sameTypeSubcats.sort(() => Math.random()-0.5).slice(0, 3);
  b.catOptions = [targetSubcat, ...otherSubcats].sort(() => Math.random()-0.5);
  if (otherSubcats.length < 3) {
    while (b.catOptions.length < 4) {
      const rand = DRINKS[Math.floor(Math.random()*DRINKS.length)];
      const randSub = rand.subcat || rand.cat;
      if (randSub !== targetSubcat && !b.catOptions.includes(randSub)) b.catOptions.push(randSub);
    }
  }
  const distractorPool = pool.length >= 8 ? pool : DRINKS;
  const distractors = [];
  let safety = 0;
  while (distractors.length < 3 && safety < 100) {
    safety++;
    const cand = distractorPool[Math.floor(Math.random()*distractorPool.length)];
    if (cand.id !== b.target.id && !distractors.find(d => d.id === cand.id)) distractors.push(cand);
  }
  b.drinkOptions = [b.target, ...distractors].sort(() => Math.random()-0.5);
  renderBlind();
}

function showSeriesSummary() {
  const b = state.blind;
  if (!b) return;
  // Save last round
  b.rounds.push({
    target: b.target.name,
    points: b.lastRoundPoints || 0,
    typeCorrect: b.typeCorrect,
    catCorrect: b.catCorrect,
    drinkCorrect: b.drinkCorrect
  });

  const total = b.rounds.length;
  const totalScore = b.score;
  const maxPossible = total * 5 * (b.difficulty === 'expert' ? 2 : b.difficulty === 'notes' || b.difficulty === 'profile' ? 1.5 : 1);
  const avgScore = Math.round(totalScore / total);
  const bestRound = b.rounds.reduce((best, r) => r.points > best.points ? r : best, b.rounds[0]);
  const worstRound = b.rounds.reduce((worst, r) => r.points < worst.points ? r : worst, b.rounds[0]);
  const correctTypes = b.rounds.filter(r => r.typeCorrect).length;
  const correctCats = b.rounds.filter(r => r.catCorrect).length;
  const correctDrinks = b.rounds.filter(r => r.drinkCorrect).length;

  // Stars rating
  const pct = totalScore / maxPossible;
  let stars = 1;
  if (pct >= 0.4) stars = 2;
  if (pct >= 0.55) stars = 3;
  if (pct >= 0.7) stars = 4;
  if (pct >= 0.85) stars = 5;

  const c = document.getElementById('blind-container');
  c.innerHTML = `
    <div class="card" style="text-align:center; padding:24px;">
      <div style="font-size:56px; margin-bottom:8px; animation:bounce-in 0.6s ease;">${stars >= 4 ? '🏆' : stars >= 3 ? '🎯' : '🍷'}</div>
      <div style="font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">Серия завершена</div>
      <h3 style="font-family:Georgia,serif; color:var(--text); font-size:24px; margin-bottom:6px;">${'⭐'.repeat(stars)}${'☆'.repeat(5-stars)}</h3>
      <div style="font-size:28px;color:var(--gold);font-family:Georgia,serif;margin-bottom:4px;">${totalScore} очков</div>
      <div style="font-size:12px;color:var(--text-mute);margin-bottom:20px;">из ${Math.round(maxPossible)} возможных • ${total} раундов</div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:20px;">
        <div style="background:var(--bg-2);padding:10px;border-radius:8px;">
          <div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;">Тип</div>
          <div style="font-size:20px;color:var(--gold);">${correctTypes}/${total}</div>
        </div>
        <div style="background:var(--bg-2);padding:10px;border-radius:8px;">
          <div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;">Стиль</div>
          <div style="font-size:20px;color:var(--gold);">${correctCats}/${total}</div>
        </div>
        <div style="background:var(--bg-2);padding:10px;border-radius:8px;">
          <div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;">Напиток</div>
          <div style="font-size:20px;color:var(--gold);">${correctDrinks}/${total}</div>
        </div>
      </div>

      <div style="background:var(--bg-2);padding:12px;border-radius:10px;margin-bottom:8px;text-align:left;">
        <div style="font-size:11px;color:var(--cider);margin-bottom:4px;">🏆 Лучший раунд: ${bestRound.points} очк.</div>
        <div style="font-size:12px;color:var(--text-dim);">${bestRound.target}</div>
      </div>
      ${worstRound !== bestRound ? `
        <div style="background:var(--bg-2);padding:12px;border-radius:10px;margin-bottom:20px;text-align:left;">
          <div style="font-size:11px;color:var(--wine);margin-bottom:4px;">📉 Худший раунд: ${worstRound.points} очк.</div>
          <div style="font-size:12px;color:var(--text-dim);">${worstRound.target}</div>
        </div>
      ` : ''}

      <div style="font-size:11px;color:var(--text-mute);margin-bottom:14px;">Все раунды:</div>
      <div style="display:grid;gap:4px;margin-bottom:20px;">
        ${b.rounds.map((r, i) => `
          <div style="display:flex;align-items:center;gap:8px;background:var(--bg-2);padding:6px 10px;border-radius:6px;">
            <span style="font-size:11px;color:var(--text-mute);width:24px;">${i+1}.</span>
            <span style="font-size:12px;color:var(--text-dim);flex:1;text-align:left;">${r.target}</span>
            <span style="font-size:11px;color:${r.points >= 4 ? 'var(--gold)' : r.points >= 2 ? 'var(--text-dim)' : 'var(--wine)'};">${r.points} очк.</span>
          </div>
        `).join('')}
      </div>

      <button class="save-btn" style="width:100%;padding:14px;font-size:15px;" onclick="resetBlindScore()">↻ Новая серия</button>
    </div>
  `;
  if (stars >= 4) fireConfetti();
}

function resetBlindScore() {
  state.blind = null;
  renderBlind();
}
function setBlindSetup(field, value) {
  if (!state.blind_setup) state.blind_setup = { category: null, difficulty: 'all', mode: 'single' };
  state.blind_setup[field] = value;
  renderBlind();
}
function closeBlind() {
  // Just close modal, blind state preserved
}

// ============== GLOSSARY ==============
function renderGlossary() {
  const search = state.glossary_search.toLowerCase();
  const terms = Object.entries(GLOSSARY).filter(([t, d]) => {
    if (!search) return true;
    return t.toLowerCase().includes(search) || d.toLowerCase().includes(search);
  }).sort((a, b) => a[0].localeCompare(b[0], 'ru'));
  const c = document.getElementById('glossary-container');
  if (!terms.length) {
    c.innerHTML = `<div class="empty"><div class="ic">📚</div>Термин не найден.</div>`;
    return;
  }
  c.innerHTML = `<div class="section-title">${terms.length} терминов</div>` + terms.map(([t, d]) => `
    <div class="glossary-item">
      <div class="t">${t}</div>
      <div class="d">${d}</div>
    </div>
  `).join('');
}
document.getElementById('glossary-search').addEventListener('input', e => { state.glossary_search = e.target.value; renderGlossary(); });
function showTerm(term) {
  const t = term.charAt(0).toUpperCase() + term.slice(1);
  const lower = term.toLowerCase();
  let key = Object.keys(GLOSSARY).find(k => k.toLowerCase() === lower);
  if (!key) {
    toast('Термин не найден');
    return;
  }
  openModal(`
    <div class="modal-cat">📖 Словарь</div>
    <h2>${key}</h2>
    <div class="modal-section" style="border-top:none;padding-top:0;">
      <p>${GLOSSARY[key]}</p>
    </div>
    <button class="restart-btn" onclick="closeModal(); switchView('glossary');">Открыть весь словарь</button>
  `);
}

// ============== NOTES ==============
function renderNotes() {
  const notes = loadNotes();
  const ids = Object.keys(notes).map(Number);
  const c = document.getElementById('notes-container');
  if (!ids.length) {
    c.innerHTML = `<div class="empty"><div class="ic">📝</div>Пока нет заметок.<br>Открой любой напиток и напиши, что попробовал — заметка сохранится на этом устройстве.</div>`;
    return;
  }
  const html = ids.map(id => {
    const d = DRINKS.find(x => x.id === id);
    if (!d) return '';
    const n = notes[id];
    return `
      <div class="note-item">
        <div class="head">
          <div class="name" onclick="openDrink(${id})" style="cursor:pointer">${d.name}</div>
          <div style="display:flex;gap:6px;align-items:center;">
            <span class="date">${n.date}</span>
            <button class="del" onclick="delNote(${id})">✕</button>
          </div>
        </div>
        <div class="text">${escapeHtml(n.text)}</div>
      </div>
    `;
  }).join('');
  c.innerHTML = `<div class="section-title">Мои заметки (${ids.length})</div>` + html;
}
function delNote(id) { const notes = loadNotes(); delete notes[id]; saveNotes(notes); renderNotes(); toast('Заметка удалена'); }
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// ============== QUIZ ==============
function renderQuiz() {
  const q = QUIZ[state.quiz.step];
  if (!q) { renderQuizResult(); return; }
  const progress = QUIZ.map((_, i) => {
    let cls = '';
    if (i < state.quiz.step) cls = 'done';
    if (i === state.quiz.step) cls = 'current';
    return `<div class="dot ${cls}"></div>`;
  }).join('');
  const answers = q.a.map((a, i) => {
    let extra = '';
    if (a.sc) {
      const entries = Object.entries(a.sc);
      if (entries.length) extra = `<small>вкус: ${entries.map(([k,v])=>`${k}+${v}`).join(', ')}</small>`;
    }
    return `
      <button class="quiz-ans" onclick="answerQuiz(${i})">
        <div class="ic">${a.ic}</div>
        <div class="txt">${a.txt}${extra}</div>
      </button>
    `;
  }).join('');
  document.getElementById('quiz-container').innerHTML = `
    <div class="quiz-progress">${progress}</div>
    <div class="quiz-q">${q.q}</div>
    <div class="quiz-hint">${q.hint}</div>
    <div class="quiz-answers">${answers}</div>
    ${state.quiz.step > 0 ? '<button class="quiz-back" onclick="backQuiz()">← назад</button>' : ''}
  `;
}
function answerQuiz(i) {
  const q = QUIZ[state.quiz.step];
  const a = q.a[i];
  if (a.sc) {
    for (const [k, v] of Object.entries(a.sc)) {
      state.quiz.scores[k] = (state.quiz.scores[k] || 0) + v;
    }
  }
  // Apply filter from QUIZ_FILTERS
  const filtersArr = QUIZ_FILTERS[state.quiz.step];
  if (filtersArr && filtersArr[i]) {
    const filterFn = filtersArr[i];
    if (state.quiz.excludes.length === 0) {
      const matched = DRINKS.filter(filterFn).map(d => d.id);
      state.quiz.excludes = DRINKS.filter(d => !matched.includes(d.id)).map(d => d.id);
    } else {
      const candidates = DRINKS.filter(d => !state.quiz.excludes.includes(d.id));
      const stillMatch = candidates.filter(filterFn).map(d => d.id);
      state.quiz.excludes = DRINKS.filter(d => !stillMatch.includes(d.id)).map(d => d.id);
    }
  }
  state.quiz.step++;
  if (state.quiz.step >= QUIZ.length) {
    state.quiz.done = true;
    renderQuizResult();
  } else {
    renderQuiz();
  }
}
function backQuiz() {
  if (state.quiz.step === 0) return;
  state.quiz.step--;
  renderQuiz();
}
function resetQuiz() {
  state.quiz = { step: 0, scores: {acid:0,sweet:0,bitter:0,tannin:0,body:0,alcohol:0,carbonation:0,savory:0}, excludes: [], done: false };
  renderQuiz();
}
function renderQuizResult() {
  state.quiz.done = true;
  const target = state.quiz.scores;
  const sKeys = ['acid','sweet','bitter','tannin','body','carbonation','savory'];
  const scored = DRINKS.map(d => {
    let diff = 0;
    for (const k of sKeys) {
      const norm = (d.s||{})[k] || 1;
      const qNorm = Math.min(5, Math.max(1, (target[k]||0) / 2 + 1));
      diff += Math.abs(norm - qNorm);
    }
    const penalty = state.quiz.excludes.includes(d.id) ? 50 : 0;
    const match = Math.max(0, Math.round((1 - diff/40) * 100) - penalty);
    return { ...d, match };
  }).sort((a,b) => b.match - a.match);

  const top = scored[0];
  const top10 = scored.slice(0, 10);
  const labels = {acid:'кислота',sweet:'сладость',bitter:'горечь',tannin:'танины',body:'тело',alcohol:'алкоголь',carbonation:'газация',savory:'солёное'};

  // Build a "profile archetype" — top 2-3 dominant traits as a readable description
  const archetype = buildArchetype(top.s);
  // Detect dominant flavors from tags of top10 — find tags shared by 3+ drinks
  const clusters = buildFlavorClusters(top10);

  // Build cluster sections HTML
  const clusterHTML = clusters.map(c => `
    <div style="margin-bottom:14px;">
      <div class="section-title" style="margin-top:6px;">${c.icon} Похоже по: ${c.label}</div>
      <div style="font-size:12px;color:var(--text-mute);margin-bottom:6px;font-style:italic;">${c.drinks.length} ${typeOf(c.drinks[0])}ов в этой группе</div>
      ${c.drinks.map(d => `
        <div class="similar-card" onclick="openDrink(${d.id})">
          <div style="flex:1">
            <div class="similar-name">${d.name}</div>
            <div class="similar-cat">${d.cat} • ${typeLabel(d)} • ${d.origin}</div>
          </div>
          <div class="similar-match">${d.match}%</div>
        </div>
      `).join('')}
    </div>
  `).join('');

  // Plain "остальные похожие" — top10 not in any cluster
  const inClusters = new Set();
  clusters.forEach(c => c.drinks.forEach(d => inClusters.add(d.id)));
  const others = top10.filter(d => !inClusters.has(d.id));

  document.getElementById('quiz-container').innerHTML = `
    <div class="quiz-result-match">
      <div class="crown">🎯</div>
      <div style="font-size:11px;color:var(--gold);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">Твой типаж</div>
      <div class="name" style="font-size:18px;">${archetype}</div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-mute);text-transform:uppercase;letter-spacing:0.1em;">Ближайший представитель</div>
      <div style="font-family:Georgia,serif;font-size:20px;color:var(--text);margin-top:4px;">${top.name}</div>
      <div style="color:var(--text-dim); font-size:13px;margin-top:4px;">${top.cat} • ${top.origin}</div>
      <div class="match-pct">Совпадение ${top.match}%</div>
    </div>
    <p style="color:var(--text-dim); font-size:14px; margin-bottom:14px; line-height:1.5;">${top.desc}</p>
    <div class="section-title">Вкусовой профиль</div>
    <div class="radar-dual">
      <div class="radar-cell">
        <h5>🫁 Структура</h5>
        <canvas id="quiz-radar-s" width="220" height="220"></canvas>
      </div>
      <div class="radar-cell">
        <h5>👃 Ароматика</h5>
        <canvas id="quiz-radar-a" width="220" height="220"></canvas>
      </div>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;justify-content:center;">
      ${Object.entries(top.s||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span class="profile-pill ${v>=4?'strong':''}">${labels[k]} ${v}/5</span>`).join('')}
    </div>
    ${clusterHTML}
    ${others.length ? `
      <div class="section-title">Ещё похожие</div>
      ${others.map(s => `
        <div class="similar-card" onclick="openDrink(${s.id})">
          <div style="flex:1">
            <div class="similar-name">${s.name}</div>
            <div class="similar-cat">${s.cat} • ${typeLabel(s)}</div>
          </div>
          <div class="similar-match">${s.match}%</div>
        </div>
      `).join('')}
    ` : ''}
    <button class="restart-btn" onclick="openDrink(${top.id})">📖 Подробнее о №1</button>
    <button class="restart-btn" onclick="resetQuiz()">↻ Пройти заново</button>
  `;
  setTimeout(() => {
    const sCanvas = document.getElementById('quiz-radar-s');
    if (sCanvas) drawRadar(sCanvas, top.s||{});
    const aCanvas = document.getElementById('quiz-radar-a');
    if (aCanvas) drawAromaRadar(aCanvas, top.a||{});
  }, 50);
}

function buildArchetype(p) {
  const labels = {acid:'кислотное',sweet:'сладкое',bitter:'горькое',tannin:'танинное',body:'плотное',alcohol:'алкогольное',carbonation:'газированное',savory:'солёное/умами'};
  const sorted = Object.entries(p||{}).sort((a,b)=>b[1]-a[1]);
  // Take top 2 descriptors (if >=4), or 1 if only one is strong
  const top2 = sorted.slice(0, 2).filter(([_,v])=>v>=4).map(([k,_])=>labels[k]).filter(Boolean);
  if (top2.length === 0) {
    // No dominant trait — describe by body+acid
    const body = (p.body||1) >= 4 ? 'плотное' : (p.body||1) <= 2 ? 'лёгкое' : 'среднее';
    const acid = (p.acid||1) >= 4 ? 'кислотное' : (p.acid||1) <= 2 ? 'мягкое' : 'сбалансированное';
    return `${body} ${acid}`;
  }
  return top2.join(' • ');
}

function buildFlavorClusters(top10) {
  // Find tags that appear in 3+ drinks of top10
  const tagCounts = {};
  top10.forEach(d => {
    (d.tags||[]).forEach(t => { tagCounts[t] = (tagCounts[t]||0)+1; });
  });
  const sharedTags = Object.entries(tagCounts).filter(([_,c])=>c>=3).sort((a,b)=>b[1]-a[1]).slice(0, 4);
  // For each shared tag, get drinks having it
  const flavorIcons = {
    'лимон':'🍋','цитрус':'🍋','грейпфрут':'🍋','лайм':'🍋',
    'яблоко':'🍏','зелёное яблоко':'🍏','айва':'🍏',
    'персик':'🍑','абрикос':'🍑','манго':'🥭','маракуйя':'🥭','тропики':'🥭','ананас':'🥭',
    'вишня':'🍒','ежевика':'🫐','слива':'🫐','малина':'🍓','клубника':'🍓','земляника':'🍓','красные ягоды':'🍓',
    'груша':'🍐',
    'мёд':'🍯','медовый':'🍯','карамель':'🍯','ваниль':'🍯',
    'шоколад':'🍫','тёмный шоколад':'🍫','какао':'🍫','кофе':'☕',
    'орех':'🥜','миндаль':'🥜','фундук':'🥜',
    'перец':'🌶️','специи':'🌶️','гвоздика':'🌶️',
    'хмель':'🌿','хвоя':'🌿','трава':'🌿','травы':'🌿','крыжовник':'🌿','крапива':'🌿',
    'дым':'💨','торф':'💨','копчёное':'💨',
    'земля':'🍄','грибы':'🍄','кожа':'🍄','табак':'🍄','трюфель':'🍄',
    'морская соль':'🧂','соль':'🧂','минерал':'🧂','мел':'🧂',
    'дрожжи':'🍞','хлеб':'🍞','бриошь':'🍞','выпечка':'🍞',
    'фрукты':'🍓','фруктовый':'🍓','фруктовый леденец':'🍓',
    'роза':'🌸','цветы':'🌸','фиалка':'🌸',
    'банан':'🍌'
  };
  return sharedTags.map(([tag, _count]) => {
    const drinks = top10.filter(d => (d.tags||[]).includes(tag));
    const icon = flavorIcons[tag] || '✨';
    return { label: tag, icon, drinks };
  }).filter(c => c.drinks.length >= 2);
}

function typeOf(d) {
  return d ? typeLabel(d) : '';
}

// ============== TOAST ==============
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ============== HAPTIC FEEDBACK (mobile) ==============
// Light vibration on supported devices (Capacitor / Android WebView, iOS Safari)
function haptic(pattern) {
  // Уважает настройку пользователя (settings.haptic)
  if (typeof settings !== 'undefined' && settings && !settings.haptic) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const patterns = {
      light: 10,
      medium: 20,
      success: [10, 30, 10],
      error: [40, 30, 40],
      warning: [20, 50, 20]
    };
    try { navigator.vibrate(patterns[pattern] || 10); } catch(e) {}
  }
  // Capacitor Haptics plugin (если доступен)
  if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Haptics) {
    try {
      const H = Capacitor.Plugins.Haptics;
      if (pattern === 'light') H.impact({ style: 'LIGHT' });
      else if (pattern === 'medium') H.impact({ style: 'MEDIUM' });
      else if (pattern === 'success') H.notification({ type: 'SUCCESS' });
      else if (pattern === 'error') H.notification({ type: 'ERROR' });
      else if (pattern === 'warning') H.notification({ type: 'WARNING' });
    } catch(e) {}
  }
}

// Wrap common tap actions with haptic
function tapFeedback(pattern) {
  haptic(pattern || 'light');
}

// ============== SETTINGS ==============
// Глобальные настройки: тема, звук, вибрация, язык
const SETTINGS_KEY = 'sommelier_settings_v1';
const DEFAULT_SETTINGS = { theme: 'dark', sound: false, haptic: true, lang: 'ru' };
let settings = { ...DEFAULT_SETTINGS };
try {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  settings = { ...DEFAULT_SETTINGS, ...saved };
} catch(e) {}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch(e) {}
}

function openSettings() {
  haptic('light');
  setTimeout(moveGTToSettings, 50);
  const btn = document.getElementById('settings-btn');
  if (btn) { btn.style.transform = 'rotate(120deg)'; setTimeout(() => btn.style.transform = '', 300); }
  openModal(`
    <div class="modal-cat">⚙ Настройки</div>
    <h2>Настройки</h2>
    <div style="margin-top:14px;">
      <div class="settings-row">
        <div>
          <div class="settings-label">Тема</div>
          <div class="settings-hint">Тёмная / Светлая</div>
        </div>
        <div class="settings-segmented" id="seg-theme">
          <button class="seg-btn ${settings.theme==='dark'?'active':''}" data-val="dark">🌙 Тёмная</button>
          <button class="seg-btn ${settings.theme==='light'?'active':''}" data-val="light">☀️ Светлая</button>
        </div>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-label">Звук</div>
          <div class="settings-hint">Звуки в слепой и при совпадениях</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="set-sound" ${settings.sound?'checked':''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-label">Вибрация</div>
          <div class="settings-hint">Тактильный отклик на тапы</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="set-haptic" ${settings.haptic?'checked':''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-label">🌐 Translate</div>
          <div class="settings-hint">Google Translate • 8 languages</div>
        </div>
        <div id="google_translate_element"></div>
      </div>
      <div class="settings-row" style="border-bottom:none;">
        <div>
          <div class="settings-label" style="color:var(--text-mute);">↩ Reset translation</div>
          <div class="settings-hint">Back to Russian</div>
        </div>
        <button onclick="resetTranslation()" style="border:1px solid var(--border);background:var(--card);color:var(--text-dim);padding:8px 14px;border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit;">Reset</button>
      </div>
    </div>
    <button class="restart-btn" onclick="closeSettings()" style="margin-top:18px;">Готово</button>
    <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--border);text-align:center;">
      <div style="font-size:11px;color:var(--text-mute);">Помощник сомелье v1.1.3</div>
      <div style="font-size:10px;color:var(--text-mute);margin-top:2px;">255 напитков • 11 вкладок • 29 блюд</div>
    </div>
  `);
  // Wire up
  document.querySelectorAll('#seg-theme .seg-btn').forEach(b => {
    b.addEventListener('click', () => {
      haptic('light');
      settings.theme = b.dataset.val;
      applyTheme();
      saveSettings();
      document.querySelectorAll('#seg-theme .seg-btn').forEach(x => x.classList.toggle('active', x.dataset.val === settings.theme));
    });
  });
  // Language switching via Google Translate
  document.getElementById('set-sound').addEventListener('change', e => {
    settings.sound = e.target.checked;
    saveSettings();
    if (settings.sound) playSound('tap');
    haptic('light');
  });
  document.getElementById('set-haptic').addEventListener('change', e => {
    settings.haptic = e.target.checked;
    saveSettings();
    haptic('light');
  });
}

function closeSettings() {
  moveGTToHidden();
  closeModal();
}

function applyTheme() {
  const root = document.documentElement;
  if (settings.theme === 'light') root.classList.add('light');
  else root.classList.remove('light');
  // Re-render current view (canvas colors depend on theme)
  if (state.view === 'tree') { const tc = document.getElementById('tree-container'); if (!tc || !tc.children.length) renderTree(); }
  if (state.view === 'build') renderBuild();
}
// Apply theme on load
(function() {
  if (settings.theme === 'light') document.documentElement.classList.add('light');
})();

// ============== SOUND (Web Audio API) ==============
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { return null; }
  }
  return audioCtx;
}

function playSound(type) {
  if (!settings.sound) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  // Resume if suspended (Android WebView often starts suspended)
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  switch(type) {
    case 'tap':
      osc.type = 'sine'; osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now); osc.stop(now + 0.07);
      break;
    case 'success':
      // C5 → E5 → G5 major chord arpeggio
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.value = f;
        const t = now + i * 0.08;
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.start(t); o.stop(t + 0.26);
      });
      break;
    case 'error':
      osc.type = 'square'; osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.26);
      break;
    case 'celebrate':
      // C major scale up + sustain
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'triangle'; o.frequency.value = f;
        const t = now + i * 0.1;
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        o.start(t); o.stop(t + 0.41);
      });
      break;
    case 'pop':
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now); osc.stop(now + 0.09);
      break;
  }
}

// ============== SWIPE NAVIGATION ==============
const SWIPE_VIEWS = ['blind', 'build-profile', 'tree', 'quiz', 'build', 'browse', 'notes-search', 'pairing', 'compare', 'glossary', 'notes'];
let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

document.addEventListener('touchstart', e => {
  // Only ignore inside modal — swipe everywhere else including tag cloud
  if (!e.target || !e.target.closest) return;
  // Ignore swipe-initiation inside horizontally-scrollable containers:
  // nav.tabs (header tabs), .pill-row (difficulty/mode pickers), .filters (browse filters).
  // Otherwise scrolling those quickly (>60px) would trigger a tab switch.
  if (e.target.closest('#modal-bg, input, textarea, select, .compare-dropdown, nav.tabs, .pill-row, .filters, .hero-meta')) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  if (touchStartX === 0) return;
  touchEndX = e.changedTouches[0].clientX;
  touchEndY = e.changedTouches[0].clientY;
  handleSwipe();
  touchStartX = 0;
}, { passive: true });

function handleSwipe() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  // Only horizontal swipes (dx > 2× dy), minimum 60px
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 2) return;
  const currentIdx = SWIPE_VIEWS.indexOf(state.view);
  if (currentIdx < 0) return;
  if (dx > 0 && currentIdx > 0) {
    // Swipe right → previous tab
    switchView(SWIPE_VIEWS[currentIdx - 1]);
    haptic('light');
  } else if (dx < 0 && currentIdx < SWIPE_VIEWS.length - 1) {
    // Swipe left → next tab
    switchView(SWIPE_VIEWS[currentIdx + 1]);
    haptic('light');
  }
}

// ============== ANDROID BACK BUTTON ==============
// Логика: модалка → закрыть; не на Дереве → Дерево; на Дереве → toast "ещё раз для выхода"
let backPressTime = 0;
function handleBackButton() {
  // 1. Если модалка открыта — закрыть
  const modalBg = document.getElementById('modal-bg');
  if (modalBg && modalBg.classList.contains('open')) {
    closeModal();
    return;
  }
  // 2. Если не на Дереве — перейти на Дерево
  if (state.view !== 'tree') {
    switchView('tree');
    window.scrollTo(0, 0);
    return;
  }
  // 3. На Дереве — двойное нажатие для выхода
  const now = Date.now();
  if (now - backPressTime < 2000) {
    // Выход из приложения
    if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) {
      Capacitor.Plugins.App.exitApp();
    } else {
      // Веб- fallback — закрываем вкладку (работает только если открыто через window.open)
      window.close();
    }
  } else {
    backPressTime = now;
    toast('Нажми ещё раз для выхода');
  }
}

// Capacitor Android back button
document.addEventListener('backbutton', handleBackButton, false);
// Capacitor v3+ listener
if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) {
  Capacitor.Plugins.App.addListener('backButton', handleBackButton);
}
// Browser fallback (Escape = back)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') handleBackButton();
});


// Reset translation WITHOUT page reload.
// Google Translate removes 'translated-ltr' class from <html> when select is set to ''.
// gtObserver (defined below) catches the class change and re-renders canvas radars.
function resetTranslation(){
  try{
    localStorage.removeItem('gt_lang');
    // Clear googtrans cookie in all common forms (root + dotted host + bare host)
    const hosts = ['/', '/; domain=.'+location.hostname, '/; domain='+location.hostname];
    hosts.forEach(h=>{ document.cookie='googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path='+h; });
    // Reset the select — GT will remove translation and restore original Russian text
    const s=document.querySelector('.goog-te-combo');
    if(s){ s.value=''; s.dispatchEvent(new Event('change')); }
    // Manual fallback: if GT doesn't remove the class within 600ms, force it.
    // This is rare but happens if GT lost its internal state.
    setTimeout(()=>{
      if(isTranslated()){
        // GT didn't respond — reload is the only reliable fallback.
        // But first, try once more to dispatch change.
        const sel=document.querySelector('.goog-te-combo');
        if(sel){ sel.value=''; sel.dispatchEvent(new Event('change')); }
        setTimeout(()=>{ if(isTranslated()) location.reload(); }, 400);
      }
    }, 600);
  }catch(e){
    console.warn('resetTranslation failed:', e);
    // Last resort: reload.
    location.reload();
  }
}

// Move GT widget from hidden host container into the Settings modal.
// Retries every 200ms for up to 6s — handles the case where GT script
// hasn't finished loading yet (e.g. user tapped a fast tab like 'К еде'
// before opening Settings — GT init takes ~800ms after script load).
let _gtMoveTimer = null;
function moveGTToSettings(){
  if(_gtMoveTimer){ clearInterval(_gtMoveTimer); _gtMoveTimer=null; }
  const dest=document.getElementById('google_translate_element');
  if(!dest) return;
  let attempts = 0;
  const maxAttempts = 30; // 30 × 200ms = 6s
  const tryMove = () => {
    const src=document.getElementById('gt_init_container');
    if(!src){ return; }
    if(src.children.length>0){
      // GT is loaded — move it.
      dest.innerHTML='';
      while(src.children.length>0) dest.appendChild(src.children[0]);
      if(_gtMoveTimer){ clearInterval(_gtMoveTimer); _gtMoveTimer=null; }
      return;
    }
    attempts++;
    if(attempts >= maxAttempts){
      if(_gtMoveTimer){ clearInterval(_gtMoveTimer); _gtMoveTimer=null; }
      // Show a small hint so user isn't left guessing.
      if(!dest.children.length){
        dest.innerHTML='<span style="font-size:11px;color:var(--text-mute);">Translate loading…</span>';
      }
    }
  };
  tryMove();
  if(!_gtMoveTimer && (!document.getElementById('gt_init_container') || !document.getElementById('gt_init_container').children.length)){
    _gtMoveTimer = setInterval(tryMove, 200);
  }
}
function moveGTToHidden(){
  if(_gtMoveTimer){ clearInterval(_gtMoveTimer); _gtMoveTimer=null; }
  const src=document.getElementById('google_translate_element'),
        dest=document.getElementById('gt_init_container');
  if(src&&dest){
    // Clear the 'Translate loading…' hint if present
    src.querySelectorAll(':scope > span:not([class])').forEach(n=>{ if(n.textContent && n.textContent.includes('loading')) n.remove(); });
    while(src.children.length>0) dest.appendChild(src.children[0]);
  }
}
document.addEventListener('change',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('goog-te-combo')){try{localStorage.setItem('gt_lang',e.target.value);}catch(err){}}},true);
setInterval(()=>{document.querySelectorAll('iframe.goog-te-banner-frame,.goog-te-banner-frame.skiptranslate').forEach(e=>e.remove());if(document.body.style.top)document.body.style.top='';document.querySelectorAll('.goog-tooltip').forEach(t=>t.remove());},200);
const gtObserver=new MutationObserver(()=>{const w=window._gtActive||false,n=isTranslated();if(w!==n){window._gtActive=n;setTimeout(()=>{if(state.view==='tree')renderTree();if(state.view==='build')renderBuild();if(state.view==='build-profile')renderBuildProfile();if(state.view==='blind')renderBlind();if(state.view==='compare')renderCompare();},300);}});
gtObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});

// ============== INIT ==============
// Wait for DOM and data, then render
function initApp() {
  // Check if DOM and data are ready
  if (typeof DRINKS === 'undefined' || !DRINKS || !DRINKS.length) {
    console.log('DRINKS not ready, retrying in 50ms...');
    setTimeout(initApp, 50);
    return;
  }
  if (typeof TREE_STRUCT === 'undefined' || typeof STRUCT_LABELS === 'undefined') {
    console.log('Tree data not ready, retrying in 50ms...');
    setTimeout(initApp, 50);
    return;
  }
  if (!document.getElementById('tree-container') || !document.getElementById('blind-container')) {
    console.log('DOM not ready, retrying in 50ms...');
    setTimeout(initApp, 50);
    return;
  }
  // Render all views that may be visited (lazy views render on tab switch).
  // Initial active view is 'blind' (Дегустация) — render it last so it's visible immediately.
  renderTree();
  renderQuiz();
  renderBlind();
  // Verify active view rendered
  setTimeout(() => {
    if (state.view === 'blind') {
      const blind = document.getElementById('blind-container');
      if (blind && blind.children.length === 0) {
        console.log('Blind still empty after render, force retry...');
        renderBlind();
      }
    } else if (state.view === 'tree') {
      const tree = document.getElementById('tree-container');
      if (tree && tree.children.length === 0) {
        console.log('Tree still empty after render, force retry...');
        renderTree();
      }
    }
  }, 300);
}

// Start init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Extra safety: re-render on window load
window.addEventListener('load', () => {
  setTimeout(() => {
    if (typeof DRINKS !== 'undefined' && DRINKS && DRINKS.length) {
      const tree = document.getElementById('tree-container');
      if (tree && tree.children.length === 0) {
        console.log('Tree empty on window load, force render...');
        renderTree();
      }
    }
  }, 200);
});
