/** the words of step 2: what is paid by whom, what the guest is told under each «i» */

export interface TransferSetting {
  /** the sanatorium meets its guests itself (its own shuttle is paid) */
  bySanH: boolean;
  /** the group transfer from Vilnius airport is in the flight package */
  inPkg: boolean;
  /** «санаторий Эгле Комфорт» — in the genitive form the policy gives */
  sanName: string;
  /** cities the sanatorium's shuttle serves for free */
  freeCities: string[];
}

const cityRu = (id: string) => (id === 'vilnius' ? 'Вильнюсе' : id === 'kaunas' ? 'Каунасе' : id);

export const yesInfo = ({ bySanH, inPkg, sanName, freeCities }: TransferSetting) =>
  bySanH
    ? sanName.replace(/^с/, 'С') +
      ' сам встречает гостей в ' +
      freeCities.map(cityRu).join(' и ') +
      ' — это входит в цену. Из других мест или отдельной машиной — по нашему тарифу.'
    : inPkg
      ? 'Групповой трансфер из аэропорта Вильнюса входит в пакет с перелётом. Другой город или отдельная машина — с доплатой.'
      : 'Водитель встретит с табличкой и довезёт до санатория. Групповой — от 30 € с человека, отдельная машина — от 130 €.';

export const noSub = ({ bySanH, inPkg }: TransferSetting) =>
  bySanH
    ? 'Цена не изменится — трансфер санатория просто не понадобится'
    : inPkg
      ? 'Цена пакета с перелётом не изменится'
      : 'Доберётесь сами — на машине или автобусом';

export const transferLead = ({ bySanH, inPkg }: TransferSetting, consultantPicksFlight: boolean) =>
  consultantPicksFlight
    ? 'Время встречи консультант уточнит, когда подберёт рейс.'
    : bySanH
      ? 'Санаторий сам встречает гостей в аэропорту или на вокзале — это входит в цену. Время встречи подтвердим заранее.'
      : inPkg
        ? 'Трансфер из аэропорта Вильнюса входит в пакет с перелётом. Время встречи подтвердим заранее.'
        : 'Водитель встретит с табличкой, поможет с багажом и довезёт до санатория. Время встречи подтвердим заранее.';

export const howNote = ({ bySanH }: TransferSetting, cityName: string) =>
  cityName
    ? 'Цены: ' + cityName + ' → санаторий, в одну сторону.'
    : bySanH
      ? 'Трансфер санатория — из Вильнюса и Каунаса. Город выберете дальше.'
      : 'Цены — от Вильнюса, в одну сторону. Город выберете дальше.';

export const seatNote = (
  { bySanH, inPkg, sanName }: TransferSetting,
  cityChosen: boolean,
  seatKind: 'free' | 'package' | 'paid' | string,
) =>
  !cityChosen
    ? bySanH
      ? 'из Вильнюса и Каунаса'
      : inPkg
        ? 'входит в пакет с перелётом'
        : 'с человека, в одну сторону'
    : seatKind === 'free'
      ? 'организует ' + sanName
      : seatKind === 'package'
        ? 'входит в пакет с перелётом'
        : inPkg
          ? 'доплата с человека, в одну сторону'
          : 'с человека, в одну сторону';

export const backSub = ({ bySanH, inPkg }: TransferSetting, individual: boolean) =>
  individual
    ? 'Отдельной машиной, как и туда'
    : bySanH
      ? 'В Вильнюс и Каунас — входит в цену'
      : inPkg
        ? 'В аэропорт Вильнюса — входит в пакет с перелётом'
        : 'В аэропорт, на вокзал или в отель';

export const FROM_INFO =
  'Большинство гостей прилетают в Вильнюс — до санатория около 2 часов. Из Каунаса столько же, из Варшавы около 5 часов.';
export const FROM_NOTE_PKG = 'Ваш рейс прилетает в аэропорт Вильнюса — его мы и отметили. Можно выбрать другое место.';
