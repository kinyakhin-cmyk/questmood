"use client";
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Heart, Sparkles, Moon, Sun, Compass, Zap, Smile, Brain, Music, MapPin, Share2, Download, Shuffle, Check, Copy, Loader2 } from "lucide-react";

type MoodKey = "drive"|"romance"|"inspire"|"calm"|"sunny"|"explore"|"energy"|"joy"|"focus"|"music";

const MOODS: { key: MoodKey; label: string; icon: any }[] = [
  { key: "drive", label: "Драйв", icon: Flame },
  { key: "romance", label: "Романтика", icon: Heart },
  { key: "inspire", label: "Вдохновение", icon: Sparkles },
  { key: "calm", label: "Спокойствие", icon: Moon },
  { key: "sunny", label: "Солнечность", icon: Sun },
  { key: "explore", label: "Исследование", icon: Compass },
  { key: "energy", label: "Энергия", icon: Zap },
  { key: "joy", label: "Радость", icon: Smile },
  { key: "focus", label: "Фокус", icon: Brain },
  { key: "music", label: "Музыка", icon: Music },
];

const DURATIONS = [
  { key: "45m", label: "45 минут" },
  { key: "90m", label: "1.5 часа" },
  { key: "2-3h", label: "2–3 часа" },
  { key: "half", label: "Полдня" },
  { key: "full", label: "Целый день" },
];
const BUDGETS = [
  { key: "free", label: "0 ₸" },
  { key: "low", label: "до 3 000 ₸" },
  { key: "mid", label: "до 10 000 ₸" },
  { key: "high", label: "10 000+ ₸" },
];
const MODES = [
  { key: "solo", label: "Соло" },
  { key: "duo", label: "С другом" },
];

function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFrom(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0);
}
function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

type Step = { title: string; action: string; why?: string; };
type Bank = { intro: string[]; steps: (((ctx: any)=>Step)|Step)[]; finale: string[]; };

const BANK: Record<MoodKey, Bank> = {
  drive: {
    intro: [
      "Сегодня ты охотник за адреналином. Нужна скорость и лёгкая дерзость.",
      "Включаем режим трассы: минимальный план, максимум импровизации.",
      "Делаем день, который ускоряет кровоток и улыбку.",
    ],
    steps: [
      ({city}:{city?:string}) => ({
        title: "Старт с высоты",
        action: `Найди самую высокую точку поблизости (${city ? city + "," : "в городе,"} крыша парковки/холм). Сделай панорамное фото как точку ноль.`,
        why: "Высота сразу даёт чувство масштаба и драйва",
      }),
      () => ({
        title: "Мини-челлендж на скорость",
        action: "Выбери маршрут 400–800 м и устрой спринт/быструю ходьбу на время. Зафиксируй результат.",
        why: "Короткий пик усилия — быстрый дофамин",
      }),
      () => ({
        title: "Холодный якорь",
        action: "Ополосни лицо холодной водой у уличного крана/в санузле/дома. Смотри в зеркало 10 сек, зафиксируй лозунг дня.",
        why: "Физиология + фокус создают пиковое состояние",
      }),
      ({mode}:{mode:string}) => ({
        title: "Социальный импульс",
        action: mode === "duo" ? "Позвони другу: за 60 сек предложи совместный мини-квест. Если согласен — плюс 1 шаг к удаче." : "Сделай комплимент незнакомцу: кратко, естественно, без ожиданий.",
        why: "Лёгкое вовлечение людей усиливает азарт",
      }),
    ],
    finale: [
      "Фикс результата: запиши 3 строки — лучший момент, чему научился, что повторишь завтра.",
      "Self-high-five: отметь достижение в трекере, сделай фото-символ победы.",
    ],
  },
  romance: {
    intro: [
      "Нежность — это действие. Сегодня собираем тёплые детали.",
      "Мягкий сценарий: свет, вода, цветы, музыка.",
    ],
    steps: [
      ({city}:{city?:string}) => ({
        title: "Цветочный сигнал",
        action: `Найди лавку/уличного продавца цветов в ${city || 'твоём городе'}. Купи один необычный цветок. Подари человеку, которого захочешь (даже себе).`,
        why: "Дарение запускает тепло и открывает сердце",
      }),
      () => ({
        title: "Музыка момента",
        action: "Собери плейлист из 5 треков, которые пахнут закатом. Включи его на прогулке.",
        why: "Саундтрек делает день кинематографичным",
      }),
      () => ({
        title: "Запах памяти",
        action: "Зайди в кофейню/чайную, закажи напиток с нотами ванили/карамели/бергамота. Сделай первый глоток с закрытыми глазами.",
        why: "Аромат быстро меняет эмоциональный фон",
      }),
    ],
    finale: [
      "Напиши одно короткое письмо человеку, которому благодарен. Отправь сегодня.",
    ],
  },
  inspire: {
    intro: [
      "Сегодня ты охотник за смыслами. Ищем искру.",
      "Откроем новый угол зрения в знакомых местах.",
    ],
    steps: [
      ({city}:{city?:string}) => ({
        title: "Галерея/витрина",
        action: `Зайди в галерею/книжный или рассмотри витрины на центральной улице ${city ? 'города ' + city : ''}. Выбери один объект и дай ему альтернативное имя.`,
        why: "Переименование = новая перспектива",
      }),
      () => ({
        title: "15-минутный набросок",
        action: "Сделай быстрый скетч или заметку идеи, не оценивая. Важна скорость, не качество.",
        why: "Быстрый поток отключает внутреннего критика",
      }),
      () => ({
        title: "Разговор с будущим",
        action: "Запиши аудио самому себе через год: 60 сек — за что спасибо, 60 сек — чего ждёшь.",
        why: "Самонастрой создаёт вектор",
      }),
    ],
    finale: [
      "Закрепи: опубликуй одну мысль (пост/сториз) — пусть мир станет соавтором.",
    ],
  },
  calm: {
    intro: ["Снижаем обороты. Находим тишину в деталях."],
    steps: [
      () => ({ title: "Три островка тишины", action: "Найди библиотеку, двор без машин и зелёный угол. В каждом — 5 глубоких вдохов.", why: "Микро-практики стабилизируют нервную систему" }),
      () => ({ title: "Дигитальный детокс", action: "30 минут без экрана. Переключись на бумагу, чай и взгляд в окно.", why: "Перегрев уходит, мозг дышит" }),
      () => ({ title: "Ритуал света", action: "Зажги свечу/лампу тёплого света вечером. 10 минут просто будь.", why: "Тёплый свет заземляет" }),
    ],
    finale: ["Запланируй ещё один тихий слот завтра. Консистентность > разовый эффект."],
  },
  sunny: {
    intro: ["Ловим свет. Идём за солнцем и видами."],
    steps: [
      ({city}:{city?:string}) => ({ title: "Охота на луч", action: `Найди место с прямым солнцем в ${city || 'твоём городе'}. 5 минут грейся, глаза прикрыты.`, why: "Свет = быстрый серотонин" }),
      () => ({ title: "Тёплый напиток на лавке", action: "Возьми кофе/чай to go, сядь на открытую лавку, смотри на людей как на кино.", why: "Созерцание улучшает настроение" }),
      () => ({ title: "Фото-знак дня", action: "Сделай фото предмета, который отражает твоё солнце сегодня.", why: "Якорим хорошее" }),
    ],
    finale: ["Поделись фото-серией с подписью из 7 слов."],
  },
  explore: {
    intro: ["Карта — не территория. Сегодня ты следопыт."],
    steps: [
      ({city}:{city?:string}) => ({ title: "Случайный поворот", action: `Иди по улице и трижды выбери случайный поворот. Окажись в незнакомом месте ${city ? 'в ' + city : ''}.`, why: "Случайность = новые нейросвязи" }),
      () => ({ title: "Местная точка силы", action: "Спроси у местного одну точку, куда стоит заглянуть. Иди.", why: "Живые подсказки сильнее гидов" }),
      () => ({ title: "Артефакт", action: "Найди предмет < 1000 ₸, который станет талисманом этой вылазки.", why: "Материальный якорь усиливает память" }),
    ],
    finale: ["Запиши на карте гвоздик — пусть будет коллекция открытий."],
  },
  energy: {
    intro: ["Поднимаем тонус через тело и контакт."],
    steps: [
      () => ({ title: "Силовой стартер", action: "3 раунда: 20 приседаний, 10 отжиманий, 20 прыжков. Запиши время.", why: "Кровообращение = энергия" }),
      () => ({ title: "Водный бонус", action: "Выпей 500 мл воды с щепоткой соли/лимона.", why: "Гидратация влияет на уровень бодрости" }),
      ({mode}:{mode:string}) => ({ title: "Микро-социальность", action: mode === 'duo' ? "Позови друга на быстрый раунд — совместно дойдите до шага 3." : "Поздоровайся с 3 людьми по пути — коротко и тепло.", why: "Контакт усиливает заряд" }),
    ],
    finale: ["Оцени шкалу энергии 1–10. Если <7 — повтори стартер вечером (1 раунд)."],
  },
  joy: {
    intro: ["Играем. Сегодня всё — чуть-чуть детство."],
    steps: [
      () => ({ title: "Смешной квест", action: "Найди предмет жёлтого цвета в трёх местах. Сфотографируй как комикс.", why: "Игра = лёгкость" }),
      () => ({ title: "Мини-щедрость", action: "Оставь маленький сюрприз на видном месте (стикер с добрым словом).", why: "Дарение зажигает радость" }),
      () => ({ title: "Прыжок", action: "Сделай 10 детских прыжков. Да, прямо так.", why: "Телесная свобода возвращает улыбку" }),
    ],
    finale: ["Напиши другу одну нелепую шутку."],
  },
  focus: {
    intro: ["Режим создателя систем. За 90 минут — кирпич в будущее."],
    steps: [
      () => ({ title: "Один важный блок", action: "Выбери 1 задачу с высоким эффектом. 45 минут без отвлечений.", why: "Фокус > размен энергия" }),
      () => ({ title: "10-минутный разбор", action: "Сделай review: что мешало, что помогло, что убрать завтра.", why: "Рефлексия усиливает цикл" }),
      () => ({ title: "Маленький публичный след", action: "Опубликуй один артефакт: скрин/заметку/картинку. Мини-репорт.", why: "Публичность повышает вероятность продолжения" }),
    ],
    finale: ["Забронируй слот повторения в календаре."],
  },
  music: {
    intro: ["Саундтрек дня. Пусть ритм ведёт тебя."],
    steps: [
      () => ({ title: "Тема дня", action: "Выбери трек-драйвер и слушай его в пути.", why: "Ритм задаёт состояние" }),
      () => ({ title: "Улица-оркестр", action: "Запиши 30-секундное аудио окрестных звуков — собери луп из города.", why: "Замечать — значит жить глубже" }),
      () => ({ title: "Маленький танец", action: "30 секунд свободного танца там, где не ожидаешь.", why: "Движение освобождает" }),
    ],
    finale: ["Собери мини-плейлист из 5 треков — назови его датой."],
  },
};

function createQuest({ mood, city, duration, budget, mode, note }:{mood:MoodKey, city:string, duration:string, budget:string, mode:string, note:string}) {
  const seed = seedFrom([mood, city, duration, budget, mode, note].join("|"));
  const rng = mulberry32(seed);
  const bank = BANK[mood] || BANK.drive;

  const intro = pick(rng, bank.intro);
  const stepsCount = (duration === "full" || duration === "half") ? 4 : 3;
  const steps = Array.from({ length: stepsCount }).map(() => {
    const s = pick(rng, bank.steps);
    return (typeof s === "function" ? s({ city, mode, budget, duration }) : s) as Step;
  });
  const finale = pick(rng, bank.finale);
  return { intro, steps, finale, seed };
}

function formatShareURL(state: any) {
  const p = new URLSearchParams(state);
  return `${typeof window!=='undefined' ? window.location.origin+window.location.pathname : ''}?${p.toString()}`;
}

function parseFromURL() {
  if (typeof window === 'undefined') return { mood: "drive", city: "Алматы", duration: "90m", budget: "low", mode: "solo", note: "" };
  const q = new URLSearchParams(window.location.search);
  return {
    mood: (q.get("m") as MoodKey) || "drive",
    city: q.get("c") || "Алматы",
    duration: q.get("d") || "90m",
    budget: q.get("b") || "low",
    mode: q.get("o") || "solo",
    note: q.get("n") || "",
  };
}

export default function Page() {
  const urlState = useMemo(parseFromURL, []);
  const [mood, setMood] = useState<MoodKey>(urlState.mood as MoodKey);
  const [city, setCity] = useState(urlState.city);
  const [duration, setDuration] = useState(urlState.duration);
  const [budget, setBudget] = useState(urlState.budget);
  const [mode, setMode] = useState(urlState.mode);
  const [note, setNote] = useState(urlState.note);
  const [quest, setQuest] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("questmood:last") : null;
    if (!quest && saved) {
      try { setQuest(JSON.parse(saved)); } catch {}
    }
  }, []);

  function handleGenerate() {
    setLoading(true);
    setTimeout(() => {
      const q = createQuest({ mood, city, duration, budget, mode, note });
      const withMeta = { ...q, meta: { mood, city, duration, budget, mode, note, ts: Date.now() } };
      setQuest(withMeta);
      if (typeof window !== 'undefined') localStorage.setItem("questmood:last", JSON.stringify(withMeta));
      setLoading(false);
    }, 250);
  }
  function handleShare() {
    const url = formatShareURL({ m: mood, c: city, d: duration, b: budget, o: mode, n: note });
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); setTimeout(()=>setCopied(false), 1200);
    });
  }
  function handlePrint() { if (typeof window !== 'undefined') window.print(); }

  return (
    <div>
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="font-semibold">QuestMood</span>
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">MVP</span>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={handleShare} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Ссылка скопирована" : "Поделиться"}
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
              <Download className="h-4 w-4" /> Скачать (PDF)
            </button>
            <a href="#build" className="text-sm underline">Собрать квест</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-5">
          <motion.div layout className="md:col-span-3 space-y-6">
            <section className="rounded-2xl border p-4">
              <div className="mb-2">
                <div className="text-lg font-semibold">Выбери настроение</div>
                <div className="text-sm text-slate-600">Кликни по карточке — мы соберём квест под твой день</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {MOODS.map(({ key, label, icon: Icon }) => (
                  <motion.button key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setMood(key)}
                    className={`group relative rounded-2xl border p-3 text-left transition ${mood===key? 'border-slate-900 shadow-lg' : 'border-slate-200 hover:border-slate-400'}`}>
                    <Icon className="h-5 w-5 mb-2" />
                    <div className="font-medium">{label}</div>
                    {mood===key && <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full bg-black text-white">Выбрано</span>}
                  </motion.button>
                ))}
              </div>
            </section>

            <section id="build" className="rounded-2xl border p-4">
              <div className="mb-2">
                <div className="text-lg font-semibold">Параметры дня</div>
                <div className="text-sm text-slate-600">Сделаем сценарий реалистичным под твои условия</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1">Город</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="Алматы"
                      className="w-full rounded-lg border pl-9 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"/>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Длительность</label>
                  <select value={duration} onChange={(e)=>setDuration(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300">
                    {DURATIONS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Бюджет</label>
                  <select value={budget} onChange={(e)=>setBudget(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300">
                    {BUDGETS.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Режим</label>
                  <select value={mode} onChange={(e)=>setMode(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300">
                    {MODES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium block mb-1">Своя ремарка (опц.)</label>
                  <textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Например: хочу у воды / без кафе / с видом на горы"
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 min-h-[88px]"/>
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <button onClick={handleGenerate} className="inline-flex items-center justify-center w-full rounded-lg bg-black text-white px-4 py-2 text-sm">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Собрать квест
                  </button>
                  <button onClick={()=>setMood(MOODS[Math.floor(Math.random()*MOODS.length)].key)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm">
                    <Shuffle className="h-4 w-4"/>Случайное настроение
                  </button>
                </div>
              </div>
            </section>
          </motion.div>

          <motion.aside layout className="md:col-span-2">
            <section className="rounded-2xl border p-4">
              <div className="mb-2">
                <div className="text-lg font-semibold">Твой квест</div>
                <div className="text-sm text-slate-600">Шаги отмечай галочкой, чтобы фиксировать прогресс</div>
              </div>
              <AnimatePresence mode="popLayout">
                {quest ? (
                  <motion.div key={quest.meta?.ts || quest.seed} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed">{quest.intro}</div>
                    <div className="h-px bg-slate-200" />
                    <div className="space-y-3">
                      {quest.steps.map((s:Step, i:number)=> (<StepItem key={i} index={i+1} step={s} />))}
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="rounded-xl bg-emerald-50 p-4">
                      <div className="font-semibold mb-1">Финал</div>
                      <div className="text-sm">{quest.finale}</div>
                    </div>
                    <div className="text-xs text-slate-500">Сид: {quest.seed}</div>
                  </motion.div>
                ) : (
                  <div className="text-sm text-slate-500">Собери квест слева — и здесь появится твой сценарий.</div>
                )}
              </AnimatePresence>
            </section>

            <section className="rounded-2xl border p-4 mt-6 print:hidden">
              <div className="mb-2">
                <div className="text-lg font-semibold">Шеринг и экспорт</div>
                <div className="text-sm text-slate-600">Поделись квестом друзьям или сохрани офлайн</div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button onClick={handleShare} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
                    <Share2 className="h-4 w-4"/>Скопировать ссылку
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(quest, null, 2)); setCopied(true); setTimeout(()=>setCopied(false),1200); }} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
                    <Copy className="h-4 w-4"/>Скопировать текст
                  </button>
                </div>
                <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-3 py-2 text-sm">
                  <Download className="h-4 w-4"/>Скачать как PDF (Печать)
                </button>
              </div>
            </section>
          </motion.aside>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-10 text-xs text-slate-500 print:hidden">
        Сделано для быстрого MVP. Все действия — безопасные, этичные и добровольные. Настраивай банку шагов под свой город и стиль.
      </footer>
    </div>
  );
}

function StepItem({ index, step }: {index:number, step:Step}) {
  const [done, setDone] = useState(false);
  return (
    <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.2, delay:index*0.03}} className={"rounded-2xl border p-4 "+(done?"bg-slate-50 opacity-80":"bg-white")}>
      <div className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 h-4 w-4" checked={done} onChange={(e)=>setDone(e.target.checked)}/>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-slate-500">Шаг {index}</div>
          <div className="font-semibold text-slate-900 mb-1">{step.title}</div>
          <div className="text-sm text-slate-700 leading-relaxed">{step.action}</div>
          {step.why && <div className="mt-2 text-xs text-slate-500">Почему: {step.why}</div>}
        </div>
      </div>
    </motion.div>
  );
}
