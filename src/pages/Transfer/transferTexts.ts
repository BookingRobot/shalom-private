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
      ' — в аэропорту, на вокзале или у отеля. Это входит в цену. Из других мест или отдельной машиной — по нашему тарифу.'
    : inPkg
      ? 'Групповой трансфер из аэропорта Вильнюса уже в пакете с перелётом. Другой город или отдельная машина — с доплатой.'
      : 'Встретим с табличкой в аэропорту, на вокзале или у отеля, поможем с багажом и довезём до стойки регистрации. Групповой — от 30 € с человека, отдельная машина — от 130 €.';

export const noSub = ({ bySanH, inPkg }: TransferSetting) =>
  bySanH
    ? 'Цена не изменится — трансфер санатория просто не понадобится'
    : inPkg
      ? 'Цена пакета с перелётом не изменится'
      : 'На машине или общественным транспортом';

export const withNote = ({ bySanH, inPkg }: TransferSetting) =>
  bySanH
    ? 'Из Вильнюса и Каунаса санаторий привезёт вас бесплатно — это входит в цену.'
    : inPkg
      ? 'Групповой трансфер из аэропорта Вильнюса входит в пакет с перелётом.'
      : 'Групповой трансфер — всего 30 € с человека, индивидуальный — от 130 € за машину.';

export const transferLead = ({ bySanH, inPkg }: TransferSetting, consultantPicksFlight: boolean) =>
  consultantPicksFlight
    ? 'Консультант уточнит время, когда подберёт рейс. Отметьте, нужен ли трансфер.'
    : bySanH
      ? 'Санаторий сам встречает гостей — это входит в цену. Отметьте, нужен ли он вам.'
      : inPkg
        ? 'Трансфер из аэропорта Вильнюса уже в пакете с перелётом. Отметьте, нужен ли он вам.'
        : 'Встретим с табличкой, поможем с багажом, довезём до стойки регистрации. Отметьте, нужен ли трансфер.';

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
        ? 'В аэропорт Вильнюса — в пакете с перелётом'
        : 'В аэропорт, на вокзал или в отель';

export const FROM_INFO =
  'Большинство гостей прилетают в Вильнюс — до санатория около 2 часов. Из Каунаса столько же, из Варшавы около 5 часов.';
export const FROM_NOTE_PKG = 'Ваш рейс прилетает в аэропорт Вильнюса — его мы и отметили. Можно выбрать другое место.';
