/**
 * Who meets the guest at the sanatorium: a doctor, a rehabilitologist, a Russian-speaking
 * administrator. Shown as small round photos («heads»): 0–3 per sanatorium. For a guest of 60+
 * it matters to see that there are people, not only nice pictures.
 * [ПРИМЕР ДАННЫХ] — the photos are illustrative until the sanatoriums send their own.
 */
export type StaffRole = 'doctor' | 'rehab' | 'admin';

export const STAFF: Record<StaffRole, { img: string; role: string; d: string }> = {
  doctor: { img: '/img/82493a836fac6144cdfcf1d45964e670.jpg', role: 'Врач', d: 'Консультация и назначение процедур' },
  rehab: { img: '/img/1e720a808ad884024d7c6a1cd741bb71.jpg', role: 'Реабилитолог', d: 'Сопровождение во время отдыха' },
  admin: { img: '/img/93118f2665a62c9ec3f6b47389a7993c.jpg', role: 'Администратор', d: 'Помощь на русском языке' },
};

const ORDER: StaffRole[] = ['doctor', 'rehab', 'admin'];

const TEAM: Record<string, StaffRole[]> = {
  'egle-comfort': ['doctor', 'rehab', 'admin'],
  'egle-standart': ['rehab', 'admin'],
  'grand-spa-lietuva': ['rehab', 'admin'],
  'grand-spa-druskininkai': ['doctor', 'admin'],
  belorus: [],
  draugyste: ['rehab'],
  upa: ['admin'],
  'spa-vilnius': ['rehab', 'admin'],
};

/** the staff of a sanatorium, always in the same order: doctor, rehabilitologist, administrator */
export const teamOf = (id: string): StaffRole[] => ORDER.filter((r) => (TEAM[id] || []).includes(r));

/** one short line about the team, for the card */
export function teamLine(roles: StaffRole[]): { t: string; s: string } {
  const has = (r: StaffRole) => roles.includes(r);
  if (roles.length === 3) return { t: 'Врач, реабилитолог и администратор', s: 'помогут на русском' };
  if (has('doctor') && has('rehab')) return { t: 'Врач и реабилитолог', s: 'консультация и сопровождение' };
  if (has('doctor') && has('admin')) return { t: 'Врач и администратор', s: 'помогут на русском' };
  if (has('rehab') && has('admin')) return { t: 'Реабилитолог и администратор', s: 'помогут на русском' };
  if (has('doctor')) return { t: 'Врач в санатории', s: 'консультация и назначение процедур' };
  if (has('rehab')) return { t: 'Реабилитолог в санатории', s: 'сопровождение во время отдыха' };
  if (has('admin')) return { t: 'Администратор', s: 'говорит по-русски' };
  return { t: '', s: '' };
}
