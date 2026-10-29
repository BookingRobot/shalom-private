import { EGLE_SPECIALIZATIONS } from './egleComfort';
import { ICON_PATHS } from './iconPaths';

/** the same signs as Eglė's specializations, found by the words of a sanatorium's profile */
const BY_TITLE = (t: string) => EGLE_SPECIALIZATIONS.find((s) => s.t === t)?.d || ICON_PATHS.proc;

const KIDNEY =
  'M9.5 3.5C6 3.5 4 6.8 4 10.5s2 8 5.5 8c2 0 3-1.6 3-3.4 0-1.3-.9-2.1-2-2.1 1.1 0 2-.8 2-2.1V7c0-2.1-1.2-3.5-3-3.5zM12.5 11H16a3 3 0 0 1 3 3v6.5';
const TOOTH =
  'M8 3.5c-2.5 0-4 2-4 4.6 0 3.6 2 5 2 8.6 0 2.1.8 3.8 2 3.8s1.8-1.9 2-3.6c.2-1.6.8-2.6 2-2.6s1.8 1 2 2.6c.2 1.7.8 3.6 2 3.6s2-1.7 2-3.8c0-3.6 2-5 2-8.6 0-2.6-1.5-4.6-4-4.6-1.6 0-2.4.8-4 .8s-2.4-.8-4-.8z';
const BANDAGE =
  'M4.6 14.8 14.8 4.6a3.3 3.3 0 0 1 4.6 4.6L9.2 19.4a3.3 3.3 0 0 1-4.6-4.6zM9.5 9.5l5 5M10.5 12.5h.01M12.5 10.5h.01M12.5 14.5h.01M14.5 12.5h.01';

const CHECKUP = 'M9 3.5h6v3H9zM7.5 5H5v16h14V5h-2.5M8.5 13.5l2.5 2.5 4.5-4.5';

const RULES: [RegExp, string][] = [
  [/опорно|сустав/i, BY_TITLE('Опорно-двигательный аппарат')],
  [/позвоно|спин/i, BY_TITLE('Позвоночник')],
  [/нервн|стресс|сна\b|сон/i, BY_TITLE('Нервная система')],
  [/дыха/i, BY_TITLE('Дыхательные пути')],
  [/пищевар|кишеч|желуд|печен/i, BY_TITLE('Пищеварительный тракт')],
  [/сердц|сосуд|кровообр/i, BY_TITLE('Сердечно-сосудистая система')],
  [/эндокрин|обмен|диабет/i, BY_TITLE('Диабет и эндокринология')],
  [/гинек/i, BY_TITLE('Гинекология')],
  [/кож|дерм/i, BY_TITLE('Дерматология')],
  [/почк|моче/i, KIDNEY],
  [/рта|дёсн|десн|зуб|пародонт/i, TOOTH],
  // general recovery and check-ups after the organs, so «кардиореабилитация» keeps the heart
  [/травм|реабилит|восстановл|операц/i, BANDAGE],
  [/диагност|профилакт|обследован/i, CHECKUP],
];

/** a sign for every illness profile (the spa leaf only when nothing fits) */
export function specIcon(profile: string) {
  return RULES.find(([re]) => re.test(profile))?.[1] || ICON_PATHS.proc;
}
