import { useEffect, useState } from 'react';
import { transferBySanatorium } from '../data/transferPolicy';
import { api } from '../api';
import { useBooking } from '../context/BookingContext';
import { useHelp } from '../context/HelpContext';
import { eur, quote } from '../lib/pricing';

/**
 * "Помогите выбрать": three questions, one per screen, big buttons — then 2–3
 * sanatoriums with a "почему подходит" line built from their treatment profile and
 * facilities. Agencies get "какой санаторий посоветуете при …" every day.
 */
type Goal = 'oda' | 'heart' | 'diab' | 'nerv' | 'rest';
type Mob = 'easy' | 'lift';
type Budget = 'low' | 'mid' | 'any';

const GOALS: [Goal, string, string][] = [
  ['oda', 'Спина и суставы', 'p-oda'],
  ['heart', 'Сердце, давление, сосуды', 'p-heart'],
  ['diab', 'Диабет, обмен веществ', 'p-diab'],
  ['nerv', 'Нервы, сон, стресс', 'p-nerv'],
  ['rest', 'Просто отдохнуть и восстановиться', ''],
];
const MOBS: [Mob, string, string][] = [
  ['easy', 'Хожу без труда', 'можно жить в корпусе отдельно от процедур'],
  ['lift', 'Тяжело ходить, нужен лифт', 'покажем, где всё в одном здании и есть лифт'],
];
const BUDGETS: [Budget, string, number][] = [
  ['low', 'До 700 € на человека', 700],
  ['mid', 'До 1 000 € на человека', 1000],
  ['any', 'Не важно — главное лечение', Infinity],
];

export interface WizardResult {
  filters: Record<string, boolean>;
  hotelId: string;
}

export function ChooseWizard({
  open,
  onClose,
  onShow,
}: {
  open: boolean;
  onClose: () => void;
  onShow: (r: WizardResult) => void;
}) {
  const { booking } = useBooking();
  const help = useHelp();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [mob, setMob] = useState<Mob | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  const step = !goal ? 1 : !mob ? 2 : !budget ? 3 : 4;
  const g = { adults: booking.adults, children: booking.children };

  let picks: { h: any; why: string[]; pp: number }[] = [];
  const filters: Record<string, boolean> = {};
  if (step === 4) {
    const profile = GOALS.find((x) => x[0] === goal)![2];
    const max = BUDGETS.find((x) => x[0] === budget)![2];
    if (profile) filters[profile] = true;
    if (mob === 'lift') {
      filters.samebld = true;
      filters.lift = true;
    }
    const { sanatoriums } = api.searchSanatoriums({
      dest: booking.dest,
      checkin: booking.checkin,
      nights: 9,
      adults: booking.adults,
    });
    const scored = (sanatoriums as any[]).map((h) => {
      const pp = quote(h.price, g, booking.flightPackage, transferBySanatorium(h.id)).perPerson;
      let score = 0;
      const why: string[] = [];
      if (profile && h.tags.includes(profile)) {
        score += 4;
        why.push('лечит: ' + GOALS.find((x) => x[0] === goal)![1].toLowerCase());
      }
      if (!profile && h.tags.includes('pool')) {
        score += 2;
        why.push('бассейны и сауны без ограничений');
      }
      if (mob === 'lift') {
        if (h.tags.includes('samebld')) {
          score += 2;
          why.push('процедуры, номер и столовая в одном здании');
        }
        if (h.tags.includes('lift')) score += 1;
      }
      if (pp <= max) {
        score += 2;
        if (max !== Infinity) why.push('укладывается в бюджет');
      }
      if (h.tags.includes('daily')) why.push('процедуры каждый день');
      if (h.tags.includes('ru')) why.push('врач говорит по-русски');
      return { h, why: why.slice(0, 3), pp, score };
    });
    picks = scored.sort((a, b) => b.score - a.score || a.h.pop - b.h.pop).slice(0, 3);
  }
  const reset = () => {
    setGoal(null);
    setMob(null);
    setBudget(null);
  };

  return (
    <div className="wz-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="wzTitle" className="wz">
        <div className="wz-head">
          <div>
            <span className="wz-step">{step < 4 ? `Вопрос ${step} из 3` : 'Подходят вам'}</span>
            <h2 id="wzTitle" style={{ fontSize: '26px' }}>
              {step === 1
                ? 'Что хотите подлечить?'
                : step === 2
                  ? 'Как вам удобнее ходить?'
                  : step === 3
                    ? 'Какой бюджет на человека?'
                    : 'Мы бы посоветовали'}
            </h2>
            {step < 4 ? (
              <p className="wz-intro">
                Ответьте на 3 коротких вопроса — подберём 2–3 санатория по профилю лечения, удобству и бюджету.
              </p>
            ) : null}
          </div>
          <button type="button" className="btn btn-secondary wz-close" onClick={onClose}>
            ✕ Закрыть
          </button>
        </div>
        {step === 1 ? (
          <div className="wz-opts">
            {GOALS.map(([k, t]) => (
              <button type="button" key={k} className="wz-opt" onClick={() => setGoal(k)}>
                {t}
              </button>
            ))}
          </div>
        ) : null}
        {step === 2 ? (
          <div className="wz-opts">
            {MOBS.map(([k, t, sub]) => (
              <button type="button" key={k} className="wz-opt" onClick={() => setMob(k)}>
                {t}
                <small>{sub}</small>
              </button>
            ))}
          </div>
        ) : null}
        {step === 3 ? (
          <div className="wz-opts">
            {BUDGETS.map(([k, t]) => (
              <button type="button" key={k} className="wz-opt" onClick={() => setBudget(k)}>
                {t}
              </button>
            ))}
            <span className="wz-note">
              за весь заезд, проживание, лечение и питание{booking.flightPackage ? ', перелёт' : ''}
            </span>
          </div>
        ) : null}
        {step === 4 ? (
          <div className="wz-res">
            {picks.map(({ h, why, pp }) => (
              <div className="wz-card" key={h.id}>
                <img src={h.img} alt="" />
                <div className="wz-body">
                  <strong className="wz-name">
                    {h.name} <span className="wz-stars">{'★'.repeat(h.starsN)}</span>
                  </strong>
                  <span className="wz-why">Почему подходит: {why.join(', ')}.</span>
                  <span className="wz-price">
                    от <strong>{eur(pp)}</strong> {g.adults === 1 ? 'за одного' : 'на человека'}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary wz-show"
                  onClick={() => {
                    onShow({ filters, hotelId: h.id });
                    onClose();
                    reset();
                  }}
                >
                  Посмотреть номера
                </button>
              </div>
            ))}
            <p className="wz-disc">
              Подбор — по профилю лечения санатория. Процедуры назначает врач на месте после консультации.
            </p>
            <div className="wz-foot">
              <button type="button" className="btn btn-secondary wz-close" onClick={reset}>
                ← Ответить заново
              </button>
              <button
                type="button"
                className="btn btn-secondary wz-close"
                onClick={() => {
                  onClose();
                  help.open();
                }}
              >
                Спросить консультанта
              </button>
            </div>
          </div>
        ) : null}
        {step > 1 && step < 4 ? (
          <button type="button" className="wz-back" onClick={() => (step === 3 ? setMob(null) : setGoal(null))}>
            ← Назад
          </button>
        ) : null}
      </div>
    </div>
  );
}
