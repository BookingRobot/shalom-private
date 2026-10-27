import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './HotelPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

class HotelLogic extends PageLogic {
  constructor(props?: any) {
    super(props);
    this.state = { i: 0, det: {}, sec: {}, in: '2026-11-09', out: '2026-11-18' };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const I = {
      bed2: 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M5 9V6h6v3M13 9V6h6v3',
      balcony: 'M3 11h18M5 11v8M9 11v8M13 11v8M17 11v8M3 19h18M6 11V5h12v6',
      ac: 'M3 6h18v7H3zM7 16v3M12 16v4M17 16v3M6 10h12',
      wifi: 'M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 19.5h.01',
      shower: 'M4 20V7a4 4 0 0 1 8 0M8 11h8M9 14v1M12 14v1M15 14v1M9 18v1M12 18v1M15 18v1',
      area: 'M4 4h16v16H4zM4 9h5M4 14h3M9 4v5M14 4v3',
      tv: 'M3 5h18v12H3zM8 21h8M12 17v4',
      kettle: 'M6 9h11a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6zM6 9V7h8v2M6 12H4M9 20h6',
      safe: 'M4 4h16v16H4zM8 8h8v8H8zM12 12h.01M20 9h2M20 15h2',
      meals: 'M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8',
      doctor: 'M8 4h8v3H8zM6 6h12v15H6zM9 14h2l1-3 2 6 1-3h2',
      proc: 'M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0',
      gym: 'M2 12h3M19 12h3M5 8v8M8 6v12M16 6v12M19 8v8M8 12h8',
      pool: 'M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6',
      sauna: 'M8 4c-1 2 1 3 0 5M12 4c-1 2 1 3 0 5M16 4c-1 2 1 3 0 5M4 12h16v8H4zM8 16h8',
      parking: 'M6 20V4h7a4 4 0 0 1 0 8H6',
      lift: 'M4 3h16v18H4zM12 3v18M8 10l0-3M16 10l0-3M8 14v3M16 14v3',
      bar: 'M5 3h14l-7 8zM12 11v8M8 19h8',
      beach: 'M3 20h18M12 4c-5 0-8 4-8 8h16c0-4-3-8-8-8zM12 12v8',
      ski: 'M4 20l16-6M6 14l4-8 6 4',
      bike: 'M5 17a3 3 0 1 0 0 .01M19 17a3 3 0 1 0 0 .01M5 17l5-8h6l3 8M10 9l4 8M14 9h-3',
      tennis: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5 7c4 1 8 5 9 9M19 17c-4-1-8-5-9-9',
      library: 'M4 4h6v16H4zM10 4h6v16h-6zM16 6l4-1 3 14-4 1z',
      water: 'M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11zM9 15a3 3 0 0 0 3 3',
      salt: 'M8 3h8v4H8zM6 7h12l1 14H5zM12 12v5',
      mud: 'M4 16c2-2 5-2 8 0s6 2 8 0M4 20c2-2 5-2 8 0s6 2 8 0M9 8a3 3 0 1 1 6 0c0 3-3 3-3 6',
    };
    I.massage = I.massage || 'M12 20c-4 0-8-3-8-7 2 0 4 1 5 2-1-3 0-7 3-9 3 2 4 6 3 9 1-1 3-2 5-2 0 4-4 7-8 7z';
    I.bed1 = I.bed1 || 'M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M6 10V7h12v3';
    I.bath = I.bath || 'M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M7 19v2M17 19v2';
    I.fridge = I.fridge || 'M6 3h12v18H6zM6 10h12M9 6v2M9 13v3';
    const am = (k, t) => ({ d: I[k], t });
    const amen = [
      am('bed2', '2 односпальные кровати'),
      am('balcony', 'Балкон'),
      am('ac', 'Кондиционер'),
      am('wifi', 'Бесплатный Wi-Fi'),
      am('shower', 'Душ'),
      am('tv', 'Телевизор'),
      am('kettle', 'Чайник'),
      am('safe', 'Сейф'),
    ];
    const details =
      'Для взрослого в цену включено:\n— Консультация врача и по программе назначенные процедуры и исследования\n— Проживание\n— Трёхразовое питание «шведский стол» (завтрак, обед, ужин и 2 перекуса)\n— Ежедневное посещение бассейнов и саун — без ограничений по времени и количеству раз\n\nДень приезда и отъезда считаются как один лечебный день. Процедуры назначает врач, по одной из каждой группы:\n1. Лечебная ванна (минеральная жемчужная, углекислая) или грязевая аппликация\n2. Лечебный массаж 15 мин (каждый второй день), подводный или аппаратный массаж 20 мин\n3. Групповая кинезитерапия — в зале, в воде или в вертикальной ванне\n4. Аппаратная физиотерапия: электростимуляция, магнитотерапия, ингаляции, соляная комната';
    const base = [
      {
        n: 1,
        top: true,
        room: 'Двухместный номер · 17–18 м²',
        img: '/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg',
        title: 'Программа «Миди» — 3 процедуры в день',
        prog: [
          am('meals', 'Трёхразовое питание'),
          am('doctor', 'Консультация врача'),
          am('proc', '3 процедуры в день'),
          am('pool', 'Бассейны без ограничений'),
          am('sauna', 'Турецкая и финская бани'),
          am('gym', 'Тренажёрный зал'),
        ],
        price: '2\u00a0138',
        old: '2\u00a0250',
        adv: 86,
        rest: '2\u00a0052',
        details,
      },
      {
        n: 2,
        top: false,
        room: 'Двухместный номер · 17–18 м²',
        img: '/img/26b9aff2d91280c2b14c33946e17c65c.jpg',
        title: 'Программа «Макси» — 5 процедур в день',
        prog: [
          am('meals', 'Трёхразовое питание'),
          am('doctor', 'Консультация врача'),
          am('proc', '5 процедур в день'),
          am('pool', 'Бассейны без ограничений'),
          am('sauna', 'Турецкая и финская бани'),
          am('gym', 'Тренажёрный зал'),
        ],
        price: '2\u00a0275',
        old: '',
        adv: 91,
        rest: '2\u00a0184',
        details: details.replace(
          'по одной из каждой группы',
          'по одной из каждой группы, плюс одна дополнительная ванна и один дополнительный массаж в день',
        ),
      },
    ];
    const det = this.state.det || {},
      sec = this.state.sec || {};
    const secT = (k) => () => this.setState({ sec: { ...sec, [k]: !sec[k] } });
    // ---- Dates & price model (synthetic season curve, calibrated so 9–18 Nov = list price) [ЗАМЕНИТЬ НА ТАРИФЫ] ----
    const st = this.state;
    const MONTHS = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ];
    const MONTHS_N = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ];
    const WD = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const DAY = 86400000;
    const toD = (x) => new Date(x + 'T00:00:00Z');
    const iso = (d) => d.toISOString().slice(0, 10);
    const addD = (d, n) => new Date(d.getTime() + n * DAY);
    const TODAY = toD('2026-10-27'),
      BASE_IN = toD('2026-11-09');
    const toNum = (x) => Number(String(x).replace(/\s/g, ''));
    const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    const nightsWord = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'ночь'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'ночи'
          : 'ночей';
    const short = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];
    const range = (a, b) =>
      a.getUTCMonth() === b.getUTCMonth()
        ? a.getUTCDate() + '–' + b.getUTCDate() + ' ' + MONTHS[a.getUTCMonth()]
        : short(a) + ' – ' + short(b);
    const checkin = toD(st.in || '2026-11-09'),
      checkout = toD(st.out || '2026-11-18');
    const nights = Math.max(1, Math.round((checkout - checkin) / DAY));
    const G = (d) => {
      const n = Math.round((d - BASE_IN) / DAY),
        wd = d.getUTCDay();
      return (
        1 +
        0.11 * Math.sin(n * 0.55 + 1.1) +
        (wd === 5 || wd === 6 ? 0.07 : 0) +
        (d.getUTCMonth() === 11 && d.getUTCDate() > 20 ? 0.18 : 0)
      );
    };
    const sumG = (a, n) => {
      let t = 0;
      for (let i = 0; i < n; i++) t += G(addD(a, i));
      return t;
    };
    const K = 2138 / (2 * sumG(BASE_IN, 9)); // € per person-night at factor 1 for «Миди»
    const totalFor = (a, n, listPrice) => Math.round((listPrice / 2138) * 2 * K * sumG(a, n));
    const ppnDay = (d) => Math.round(K * G(d));
    const ADV_RATE = 0.04;
    const nightsLabel = nights + ' ' + nightsWord(nights);
    // ---- Room-first: each room priced with the cheapest programme; programmes are upgrades inside ----
    const PROGS = base
      .concat([
        {
          n: 3,
          title: 'Программа «Премиум» — 5 процедур в день + массаж',
          price: '2 550',
          prog: [
            am('meals', 'Полный пансион, диетическое меню'),
            am('doctor', 'Консультация врача'),
            am('proc', '5 процедур в день'),
            am('massage', 'Массаж каждый день'),
            am('pool', 'Бассейны без ограничений'),
          ],
          details:
            'Для взрослого в цену включено:\n— Всё, что в программе «Макси»\n— Ежедневный классический массаж 30 мин\n— Полный пансион: завтрак, обед, полдник, ужин, диетическое меню по назначению врача\n\nПроцедуры назначает врач после консультации.',
        },
      ])
      .map((p) => ({
        ...p,
        priceN: totalFor(checkin, nights, toNum(p.price)),
        meals: p.prog.some((x) => /пансион/i.test(x.t)) ? 'полный пансион' : 'питание 3 раза',
      }))
      .sort((a, b) => a.priceN - b.priceN);
    // [ПРИМЕР — ДОПЛАТЫ ЗА НОМЕР ЗАМЕНИТЬ ТАРИФАМИ]
    const ROOMS = [
      {
        n: 1,
        top: true,
        name: 'Двухместный номер',
        line: '17–18 м² · 2 отдельные кровати · Балкон',
        add: 0,
        img: '/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg',
        amen,
      },
      {
        n: 2,
        name: 'Улучшенный двухместный',
        line: '22 м² · двуспальная кровать · вид на парк',
        add: 162,
        img: '/img/b7bf541f72a32e5e2b9be1fa1ffd7676.jpg',
        amen: [
          am('bed1', 'Двуспальная кровать'),
          am('balcony', 'Балкон'),
          am('ac', 'Кондиционер'),
          am('shower', 'Душ без порога'),
          am('wifi', 'Бесплатный Wi-Fi'),
          am('tv', 'Телевизор'),
          am('kettle', 'Чайник'),
          am('safe', 'Сейф'),
        ],
      },
      {
        n: 3,
        name: 'Полулюкс',
        line: '30 м² · спальня и зона отдыха · ванна',
        add: 396,
        img: '/img/26b9aff2d91280c2b14c33946e17c65c.jpg',
        amen: [
          am('bed1', 'Двуспальная кровать'),
          am('bath', 'Ванна'),
          am('balcony', 'Большой балкон'),
          am('ac', 'Кондиционер'),
          am('fridge', 'Мини-холодильник'),
          am('wifi', 'Бесплатный Wi-Fi'),
          am('tv', 'Телевизор'),
          am('safe', 'Сейф'),
        ],
      },
      {
        n: 4,
        name: 'Апартаменты',
        line: '42 м² · 2 отдельные комнаты · ванна и душ',
        add: 684,
        img: '/img/1efd1efc34d4137ff98a8658a068afc5.jpg',
        amen: [
          am('bed2', '2 отдельные комнаты'),
          am('bath', 'Ванна и душ'),
          am('balcony', 'Балкон'),
          am('ac', 'Кондиционер'),
          am('wifi', 'Бесплатный Wi-Fi'),
          am('tv', 'Телевизор'),
          am('kettle', 'Чайник'),
          am('safe', 'Сейф'),
        ],
      },
    ];
    const pf1 = (n) =>
      n % 10 === 1 && n % 100 !== 11
        ? 'процедура'
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
          ? 'процедуры'
          : 'процедур';
    const valueOf = (p, roomName) => {
      const pm = String(p.title).match(/(\d+) процедур/);
      const nProc = pm ? Number(pm[1]) : 0;
      const perDay = /в день/.test(p.title);
      const progT = p.prog.map((x) => x.t).join(' ');
      return [
        nProc
          ? {
              d: I.proc,
              big: String(nProc),
              label: perDay ? pf1(nProc) + ' в день' : pf1(nProc) + ' за заезд',
              sub: perDay
                ? nProc * nights + ' ' + pf1(nProc * nights) + ' за весь заезд · по назначению врача'
                : 'по назначению врача',
            }
          : null,
        /массаж/i.test(progT)
          ? { d: I.massage, big: String(nights), label: 'массажей', sub: 'классический массаж каждый день' }
          : null,
        /питани|пансион/i.test(progT)
          ? {
              d: I.meals,
              big: /пансион/i.test(progT) ? '4' : '3',
              label: 'приёма пищи в день',
              sub: /пансион/i.test(progT) ? 'полный пансион, диетическое меню' : 'завтрак, обед, ужин · шведский стол',
            }
          : null,
        /врач/i.test(progT)
          ? { d: I.doctor, big: '1', label: 'консультация врача', sub: 'при заезде · говорит по-русски' }
          : null,
        /бассейн|бан/i.test(progT)
          ? { d: I.pool, big: '∞', label: 'бассейны и сауны', sub: 'каждый день, без ограничений' }
          : null,
        { d: I.bed2, big: String(nights), label: nightsWord(nights) + ' в номере', sub: roomName },
      ].filter(Boolean);
    };

    // Room types fully booked on some dates [ПРИМЕР — ИЗ ДАННЫХ О НАЛИЧИИ]: [from, to) per room
    const ROOM_BUSY = { 'egle-comfort:junior': ['2026-11-01', '2026-11-23'] };
    const busyRange = (key) => ROOM_BUSY[key] || null;
    const overlaps = (key, a, b) => {
      const r = busyRange(key);
      if (!r) return false;
      const s0 = new Date(r[0] + 'T00:00:00Z'),
        s1 = new Date(r[1] + 'T00:00:00Z');
      return a < s1 && b > s0;
    };
    const roomDayBusy = (key, d) => {
      const r = busyRange(key);
      if (!r) return false;
      const t = d.toISOString().slice(0, 10);
      return t >= r[0] && t < r[1];
    };
    const RU_M = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ];
    const freeFrom = (key) => {
      const r = busyRange(key);
      if (!r) return '';
      const d = new Date(r[1] + 'T00:00:00Z');
      return 'с ' + d.getUTCDate() + ' ' + RU_M[d.getUTCMonth()];
    };
    const BUSY_LOOK = {
      cardBorder: '1px solid #E3DED2',
      cardBg: '#F7F5F0',
      imgFilter: 'grayscale(1) opacity(.7)',
      pillBg: '#E8E6E1',
      pillColor: '#5E6862',
      nameColor: '#5E6862',
    };
    const FREE_LOOK = {
      cardBorder: '1px solid #E3DED2',
      cardBg: '#fff',
      imgFilter: 'none',
      pillBg: '#EEF5F1',
      pillColor: '#1F5F4A',
      nameColor: '#1C2620',
    };
    const ROOM_KEY = { 3: 'egle-comfort:junior' };
    const ps = st.ps || {};
    const offers = ROOMS.map((r) => {
      const dOpen = !!det[r.n];
      const addN = totalFor(checkin, nights, r.add);
      const cheapest = PROGS[0].priceN + addN;
      const adv = Math.ceil(cheapest * ADV_RATE);
      const selI = ps[r.n] ?? 0,
        sp = PROGS[selI] || PROGS[0];
      const progRows = PROGS.map((p, pi) => {
        const on = pi === selI,
          pp = p.title.split(' — ');
        return {
          name: pp[0],
          sub: (pp[1] || '') + ' · ' + p.meals,
          price: fmt(p.priceN + addN) + ' €',
          diff: pi === 0 ? 'самая доступная' : '+' + fmt(p.priceN - PROGS[0].priceN) + ' € к цене',
          diffColor: pi === 0 ? '#1F5F4A' : '#3E4B44',
          border: on ? '#1F5F4A' : '#CFC9BB',
          bg: on ? '#EEF5F1' : '#fff',
          dot: on ? '#1F5F4A' : 'transparent',
          pick: () => this.setState({ ps: { ...ps, [r.n]: pi } }),
        };
      });
      const detLines = String(sp.details)
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => ({
          t: l.replace(/^— ?/, '• '),
          fw: /:$/.test(l) || /^\d+\./.test(l) ? 700 : 400,
          pl: /^—/.test(l) ? '14px' : '0',
          mt: /:$/.test(l) || /^День/.test(l) ? '8px' : '0',
        }));
      const p0 = PROGS[0].title.split(' — ');
      const rkey = ROOM_KEY[r.n] || '';
      const busy = overlaps(rkey, checkin, checkout);
      return {
        ...r,
        room: r.name,
        short: r.name,
        roomLine: r.line,
        ...(busy ? BUSY_LOOK : FREE_LOOK),
        busy,
        avail: !busy,
        busyRange: range(checkin, checkout),
        nextFree: freeFrom(rkey),
        openRoomCal: () =>
          this.setState({
            cal: true,
            calRoom: rkey,
            calRoomName: r.name,
            sel: { in: iso(checkin), out: iso(checkout) },
            month: checkin.getUTCMonth(),
            year: checkin.getUTCFullYear(),
          }),
        pill: busy ? 'Нет мест на ваши даты' : r.add ? 'Номер +' + fmt(addN) + ' €' : 'Включён в цену программы',
        progLine: 'с программой ' + p0[0].replace('Программа ', '') + ' · ' + (p0[1] || '') + ' · ' + PROGS[0].meals,
        price: fmt(cheapest),
        adv,
        ppn: Math.round(cheapest / nights / 2),
        prog: sp.prog,
        value: valueOf(sp, r.name + ' · ' + r.line.split(' · ')[0]),
        detLines,
        progRows,
        roomText: 'Что ещё есть в номере: телефон, спутниковое ТВ, гардероб, сейф, фен, халат, тапочки.',
        selName: sp.title.split(' — ')[0],
        selPrice: fmt(sp.priceN + addN) + ' €',
        detBtn: 'Программы для этого номера (' + PROGS.length + ') и что входит',
        detChev: dOpen ? 'rotate(180deg)' : 'none',
        border: r.top ? '#1F5F4A' : '#E3DED2',
        detOpen: dOpen,
        toggleDet: () => this.setState({ det: { ...det, [r.n]: !dOpen } }),
      };
    });
    const about = [
      {
        h: 'Местность',
        items: [
          am('beach', 'Пляж на Немане'),
          am('ski', 'Горнолыжная SNOW arena'),
          am('pool', 'Много бассейнов и бань в городе'),
        ],
      },
      {
        h: 'Бассейны и бани',
        items: [
          am('pool', 'Закрытый бассейн'),
          am('sauna', 'Турецкая и финская бани'),
          am('water', 'Бювет с минеральной водой'),
        ],
      },
      {
        h: 'Лечебные процедуры',
        items: [
          am('proc', 'Минеральные и вертикальные ванны'),
          am('mud', 'Грязелечение'),
          am('salt', 'Соляная комната, ингаляции'),
        ],
      },
      {
        h: 'Досуг и спорт',
        items: [am('gym', 'Тренажёрный зал'), am('tennis', 'Теннис, сквош, бильярд'), am('bike', 'Аренда велосипедов')],
      },
      {
        h: 'Удобства',
        items: [
          am('lift', 'Лифт во всех корпусах'),
          am('parking', 'Бесплатная парковка'),
          am('library', 'Библиотека, 10 000 книг'),
        ],
      },
      {
        h: 'Питание',
        items: [am('meals', 'Шведский стол'), am('bar', 'Бар и кафе'), am('kettle', 'Диетическое меню по запросу')],
      },
    ];
    const photos = [
      { src: '/img/1efd1efc34d4137ff98a8658a068afc5.jpg', alt: 'Парк и корпус санатория' },
      { src: '/img/99a77311bc746e38e051bd1146cc0517.jpg', alt: 'Бассейн' },
      { src: '/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg', alt: 'Двухместный номер' },
      { src: '/img/b7bf541f72a32e5e2b9be1fa1ffd7676.jpg', alt: 'Номер с видом в сад' },
      { src: '/img/d4cc2009f5e9b68736ab9f9a044668e5.jpg', alt: 'Озеро в сосновом лесу' },
      { src: '/img/ec03ab120412f998fd082eb7bc49afb6.jpg', alt: 'Тропа в лесу' },
      { src: '/img/8b637dda5588aaa2a835e012e1b36612.jpg', alt: 'Сосновый бор' },
    ];
    const allPhotos = photos.concat([
      { src: '/img/26b9aff2d91280c2b14c33946e17c65c.jpg', alt: 'Двухместный номер' },
      { src: '/img/4af10be0f78f80567a55b4bd959f92cf.jpg', alt: 'Сосны у санатория' },
      { src: '/img/94582b10c29a7431c8ced47b9345bb6d.jpg', alt: 'Лес у санатория' },
    ]);
    const n = photos.length;
    const i = (((this.state.i ?? 0) % n) + n) % n;
    const specs = [
      {
        t: 'Опорно-двигательный аппарат',
        s: 'Суставы, артрозы, восстановление после травм и операций',
        d: 'M6.5 3.5a2.2 2.2 0 0 1 3.1 2.6l8.3 8.3a2.2 2.2 0 1 1 2.6 3.1 2.2 2.2 0 1 1-3.1-2.6L9.1 6.6a2.2 2.2 0 1 1-2.6-3.1z',
      },
      {
        t: 'Позвоночник',
        s: 'Остеохондроз, боли в спине и шее, грыжи дисков',
        d: 'M12 2v20M8.5 5h7M8.5 9.5h7M8.5 14h7M8.5 18.5h7',
      },
      {
        t: 'Нервная система',
        s: 'Стресс, бессонница, невралгии, усталость',
        d: 'M11 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 4 3h1V3zM13 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-4 3h-1V3z',
      },
      {
        t: 'Дыхательные пути',
        s: 'Бронхит, астма, восстановление после простуд',
        d: 'M12 3v9M12 8c-2 0-3 2-3 4v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5c0-3 2-6 6-5M12 8c2 0 3 2 3 4v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5c0-3-2-6-6-5',
      },
      {
        t: 'Пищеварительный тракт',
        s: 'Гастрит, печень, желчный пузырь, минеральная вода',
        d: 'M9 3v4a4 4 0 0 0 4 4h1a4.5 4.5 0 0 1 0 9h-2a4.5 4.5 0 0 1-4.5-4.5V14M15 3v4',
      },
      {
        t: 'Сердечно-сосудистая система',
        s: 'Гипертония, восстановление после инфаркта, варикоз',
        d: 'M20.8 8.6a5 5 0 0 0-8.8-3.2A5 5 0 0 0 3.2 8.6c0 5 8.8 11.4 8.8 11.4s8.8-6.4 8.8-11.4zM5 12h3l2-3 3 6 2-3h4',
      },
      {
        t: 'Диабет и эндокринология',
        s: 'Сахарный диабет, щитовидная железа, обмен веществ',
        d: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11zM9.5 11.5h.01M14.5 16.5h.01M9.5 16.5l5-5',
      },
      {
        t: 'Гинекология',
        s: 'Хронические воспаления, климакс, восстановление',
        d: 'M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 13v8M9 18h6',
      },
      {
        t: 'Дерматология',
        s: 'Псориаз, экзема, уход за кожей',
        d: 'M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V13M8 13l-2-2a1.5 1.5 0 0 0-2 2l3 5a6 6 0 0 0 5 3h2a5 5 0 0 0 5-5v-3',
      },
    ];
    const trCars = [
      {
        img: '/img/edfa76a71b436810e36bd398235820b7.png',
        name: 'Легковой автомобиль',
        info: 'до 3 человек, 3 чемодана',
        price: 'от 130\u00a0€ в одну сторону',
      },
      {
        img: '/img/165765111b3ce679a969db85fe7d023f.png',
        name: 'Микроавтобус',
        info: 'до 7 человек, 7 чемоданов',
        price: 'от 170\u00a0€ в одну сторону',
      },
      {
        img: '/img/3bd69c9fea391e27ab155af10bf6d27f.png',
        name: 'Премиум-класс',
        info: 'до 3 человек, вода, помощь с багажом',
        price: 'от 200\u00a0€ в одну сторону',
      },
    ];
    // Check-in / check-out: per-sanatorium parameters (come from the hotel record)
    const times = {
      checkin: '14:00',
      checkinDate: WD[checkin.getUTCDay()] + ', ' + short(checkin),
      checkout: '12:00',
      checkoutDate: WD[checkout.getUTCDay()] + ', ' + short(checkout),
      notes: [
        {
          t: 'Ранний приезд',
          s: 'багаж примут на хранение, можно сразу пойти на обед и к врачу',
          d: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2',
        },
        {
          t: 'Поздний выезд',
          s: 'по запросу, если номер свободен; обед в день выезда входит',
          d: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
        },
        {
          t: 'Регистрация',
          s: 'паспорт каждого гостя; остаток оплачивается на стойке',
          d: 'M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6',
        },
      ],
    };
    // ---- Calendar modal values ----
    const sel = st.sel || { in: iso(checkin), out: iso(checkout) };
    const sIn = sel.in ? toD(sel.in) : null,
      sOut = sel.out ? toD(sel.out) : null;
    const m0 = st.month ?? checkin.getUTCMonth(),
      y0 = st.year ?? checkin.getUTCFullYear();
    const m1 = (m0 + 1) % 12,
      y1 = m0 === 11 ? y0 + 1 : y0;
    const curPpn = Math.round(totalFor(checkin, nights, 2138) / nights / 2);
    const pickDay = (date) => () => {
      const k = iso(date);
      if (!sel.in || (sel.in && sel.out)) this.setState({ sel: { in: k, out: null } });
      else if (date > toD(sel.in)) this.setState({ sel: { in: sel.in, out: k } });
      else this.setState({ sel: { in: k, out: null } });
    };
    const monthCells = (y, m) => {
      const first = new Date(Date.UTC(y, m, 1));
      const lead = (first.getUTCDay() + 6) % 7;
      const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const cells = [];
      for (let i = 0; i < lead; i++)
        cells.push({
          day: '',
          fly: false,
          sub: '',
          bg: 'transparent',
          border: 'transparent',
          color: '#1C2620',
          subColor: '#3E4B44',
          off: true,
          cursor: 'default',
          aria: '',
          pick: () => {},
        });
      for (let d = 1; d <= days; d++) {
        const date = new Date(Date.UTC(y, m, d));
        const past = date < TODAY;
        const full =
          !past &&
          ([
            '2026-11-20',
            '2026-11-21',
            '2026-11-22',
            '2026-12-24',
            '2026-12-25',
            '2026-12-26',
            '2026-12-27',
            '2026-12-31',
            '2027-01-01',
          ].includes(iso(date)) ||
            (st.calRoom ? roomDayBusy(st.calRoom, date) : false));
        /* [ПРИМЕР] нет мест ни в одном объекте */ const p = ppnDay(date),
          r = p / curPpn;
        let bg = r < 0.97 ? '#E9F4EC' : r <= 1.03 ? '#FFF6E3' : '#FCEDE9',
          color = '#1C2620',
          subColor = '#3E4B44',
          border = 'transparent';
        const isIn = sIn && iso(date) === iso(sIn),
          isOut = sOut && iso(date) === iso(sOut),
          between = sIn && sOut && date > sIn && date < sOut;
        if (past) {
          bg = '#E8E6E1';
          color = '#9AA39E';
          subColor = '#9AA39E';
        }
        if (full) {
          bg = 'repeating-linear-gradient(135deg,#F3F0EA 0 6px,#E4DFD5 6px 12px)';
          color = '#8A968F';
          subColor = '#8A5A00';
        }
        if (between) border = '#1F5F4A';
        if (isIn || isOut) {
          bg = '#1F5F4A';
          color = '#fff';
          subColor = '#D9E2DC';
          border = '#1F5F4A';
        }
        cells.push({
          day: d,
          fly: [0, 2, 4].includes(date.getUTCDay()) && !(typeof past !== 'undefined' && past),
          sub: past ? '' : full ? 'нет мест' : isIn ? 'заезд' : isOut ? 'выезд' : p + '\u00a0€',
          bg,
          border,
          color,
          subColor,
          off: past || full,
          cursor: past || full ? 'not-allowed' : 'pointer',
          aria: d + ' ' + MONTHS[m] + (past ? ', недоступно' : ', ' + p + '\u00a0€ за человека в сутки'),
          pick: pickDay(date),
        });
      }
      return cells;
    };
    const months = [
      { title: MONTHS_N[m0] + ' ' + y0, cells: monthCells(y0, m0) },
      { title: MONTHS_N[m1] + ' ' + y1, cells: monthCells(y1, m1) },
    ];
    const selN = sIn && sOut ? Math.round((sOut - sIn) / DAY) : 0;
    const curTotal = totalFor(checkin, nights, 2138),
      newTotal = selN ? totalFor(sIn, selN, 2138) : 0,
      diff = curTotal - newTotal;
    const preset = (n) => () => {
      const a = sIn || checkin;
      this.setState({ sel: { in: iso(a), out: iso(addD(a, n)) } });
    };
    const calVals = {
      calOpen: !!st.cal,
      openCal: () =>
        this.setState({
          cal: true,
          calRoom: null,
          calRoomName: null,
          sel: { in: iso(checkin), out: iso(checkout) },
          month: checkin.getUTCMonth(),
          year: checkin.getUTCFullYear(),
        }),
      closeCal: () => this.setState({ cal: false }),
      calPrev: () => {
        const m = m0 - 1;
        this.setState({ month: (m + 12) % 12, year: m < 0 ? y0 - 1 : y0 });
      },
      calNext: () => {
        const m = m0 + 1;
        this.setState({ month: m % 12, year: m > 11 ? y0 + 1 : y0 });
      },
      months,
      calHint: !sIn
        ? 'Нажмите день заезда'
        : !sOut
          ? 'Теперь нажмите день выезда'
          : 'Можно поменять: нажмите новый день заезда',
      curRange: range(checkin, checkout),
      curTotal: fmt(curTotal),
      newRange: selN
        ? range(sIn, sOut) + ' · ' + selN + ' ' + nightsWord(selN)
        : sIn
          ? 'с ' + short(sIn) + ' — выберите выезд'
          : '—',
      newTotal: selN ? fmt(newTotal) + '\u00a0€' : '—',
      diffText: !selN
        ? ''
        : selN !== nights
          ? '(' + selN + ' ' + nightsWord(selN) + ' вместо ' + nights + ')'
          : diff > 0
            ? '↓ экономия ' + fmt(diff) + '\u00a0€'
            : diff < 0
              ? '↑ дороже на ' + fmt(-diff) + '\u00a0€'
              : 'та же цена',
      diffBg: !selN || selN !== nights ? '#EEF5F1' : diff > 0 ? '#DFF0E4' : diff < 0 ? '#FBE3DE' : '#F4F1EA',
      diffColor: diff > 0 ? '#1F5F4A' : diff < 0 ? '#B3261E' : '#3E4B44',
      applyOff: !(sIn && sOut),
      applyCal: () => {
        if (sIn && sOut) this.setState({ in: iso(sIn), out: iso(sOut), cal: false });
      },
      p7: preset(7),
      p10: preset(10),
      p14: preset(14),
      p21: preset(21),
    };
    return {
      ...calVals,
      calRoomOn: !!st.calRoom,
      calRoomName: st.calRoomName || '',
      dateRange: range(checkin, checkout) + ' ' + checkin.getUTCFullYear(),
      nightsLabel,
      freeTr:
        nights >= 10
          ? 'У вас ' +
            nightsLabel +
            ' — трансфер из аэропорта Вильнюса для вас бесплатный. Остальные направления — по тарифу.'
          : 'При заезде от 10 ночей трансфер из аэропорта Вильнюса — бесплатно (у вас ' + nightsLabel + ').',
      offers,
      about,
      specs,
      trCars,
      times,
      specOpen: !!sec.spec,
      toggleSpec: secT('spec'),
      timeOpen: !!sec.time,
      toggleTime: secT('time'),
      foodOpen: !!sec.food,
      toggleFood: secT('food'),
      trOpen: !!sec.tr,
      toggleTr: secT('tr'),
      lightbox: !!this.state.lb,
      closeLb: () => this.setState({ lb: false }),
      pickAll: () => this.setState({ lb: true }),
      photoCount: allPhotos.length,
      allPhotos: allPhotos.map((p, k) => ({ ...p, n: k + 1 })),
      pick0: () => this.setState({ lb: true, i: 0 }),
      pick1: () => this.setState({ lb: true, i: 1 }),
      pick2: () => this.setState({ lb: true, i: 2 }),
      mainImg: photos[i].src,
      mainAlt: photos[i].alt,
      counter: i + 1 + ' из ' + n,
      prev: () => this.setState({ i: i - 1 }),
      next: () => this.setState({ i: i + 1 }),
      thumbs: photos.map((p, k) => ({ ...p, cls: k === i ? 'on' : '', pick: () => this.setState({ i: k }) })),
    };
  }
}

export default function HotelPage() {
  usePageTitle('Санаторий Эгле Комфорт — вариант B');
  const [v, logic] = usePageLogic(HotelLogic);
  return (
    <div className="page pg-hotel">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #E3DED2' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '0 24px',
              minHeight: '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#1C2620' }}
            >
              <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true">
                <rect x="1" y="1" width="38" height="38" fill="#1F5F4A" />
                <path d="M20 9 L27 21 H23.5 L28 30 H12 L16.5 21 H13 Z" fill="#F4F1EA" />
              </svg>
              <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '23px', fontWeight: '700' }}>
                Санатории Литвы
              </span>
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '36px', flexWrap: 'wrap' }}>
              <Link className="navlink" to="/results">
                Курорты
              </Link>
              <Link className="navlink" to="/rules">
                Как оплатить
              </Link>
              <Link className="navlink" to="/rules">
                Условия
              </Link>
              <Link className="navlink" to="/done">
                Контакты
              </Link>
            </nav>
            <a
              href="tel:+37060000000"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                color: '#1C2620',
                fontWeight: '800',
                fontSize: '19px',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z" />
              </svg>
              +370&nbsp;600 00000
            </a>
          </div>
        </header>
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '18px 24px 56px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ fontSize: '15px', color: '#3E4B44' }}>
            <Link to="/">Санатории</Link> → <Link to="/results">Друскининкай</Link> → Эгле Комфорт
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '40px' }}>Санаторий Эгле Комфорт</h1>
                <span style={{ color: '#B8860B', fontSize: '22px', letterSpacing: '1px' }} aria-label="4 звезды">
                  ★★★★
                </span>
              </div>
              <div className="fact" style={{ fontSize: '16px' }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: 'none' }}
                >
                  <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                </svg>
                Друскининкай · Eglės g. 1 · <Link to="/hotel#reviews">26 отзывов</Link>
              </div>
            </div>
            <Link className="btn btn-secondary" to="/results" style={{ minHeight: '48px', fontSize: '16px' }}>
              ← К результатам
            </Link>
          </div>
          {/* Gallery: ONE row, sizes decreasing left to right; click opens the full gallery */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={v.pick0}
              aria-label="Территория санатория"
              style={{
                position: 'relative',
                padding: '0',
                border: 'none',
                background: '#2B3A33',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '250px',
                flex: '4 1 0',
                minWidth: '0',
              }}
            >
              <img
                src="/img/1efd1efc34d4137ff98a8658a068afc5.jpg"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '10px',
                  background: 'rgba(28,38,32,.8)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  padding: '5px 9px',
                  borderRadius: '2px',
                }}
              >
                Территория
              </span>
            </button>
            <button
              type="button"
              onClick={v.pick2}
              aria-label="Номер"
              style={{
                position: 'relative',
                padding: '0',
                border: 'none',
                background: '#2B3A33',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '250px',
                flex: '2.2 1 0',
                minWidth: '0',
              }}
            >
              <img
                src="/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '10px',
                  background: 'rgba(28,38,32,.8)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  padding: '5px 9px',
                  borderRadius: '2px',
                }}
              >
                Номер
              </span>
            </button>
            <button
              type="button"
              onClick={v.pick1}
              aria-label="Бассейн"
              style={{
                position: 'relative',
                padding: '0',
                border: 'none',
                background: '#2B3A33',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '250px',
                flex: '1.5 1 0',
                minWidth: '0',
              }}
            >
              <img
                src="/img/99a77311bc746e38e051bd1146cc0517.jpg"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '10px',
                  background: 'rgba(28,38,32,.8)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  padding: '5px 9px',
                  borderRadius: '2px',
                }}
              >
                Бассейн
              </span>
            </button>
            <button
              type="button"
              onClick={v.pickAll}
              aria-label="Все фото"
              style={{
                position: 'relative',
                padding: '0',
                border: 'none',
                background: '#2B3A33',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '250px',
                flex: '1 1 0',
                minWidth: '0',
              }}
            >
              <img
                src="/img/d4cc2009f5e9b68736ab9f9a044668e5.jpg"
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  bottom: '10px',
                  background: 'rgba(28,38,32,.8)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  padding: '5px 9px',
                  borderRadius: '2px',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: '0',
                  background: 'rgba(28,38,32,.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '16px',
                  textAlign: 'center',
                  padding: '8px',
                  lineHeight: '1.2',
                }}
              >
                Все {v.photoCount} фото →
              </span>
            </button>
          </div>
          {/* Full gallery overlay: all photos large, scrollable */}
          {v.lightbox ? (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: '0',
                  zIndex: '50',
                  background: 'rgba(20,28,24,.96)',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    position: 'sticky',
                    top: '0',
                    background: 'rgba(20,28,24,.96)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '14px 24px',
                    borderBottom: '1px solid rgba(255,255,255,.12)',
                  }}
                >
                  <div style={{ color: '#fff', fontFamily: 'Lora,Georgia,serif', fontSize: '20px', fontWeight: '600' }}>
                    Санаторий Эгле Комфорт — все фото ({v.photoCount})
                  </div>
                  <button
                    type="button"
                    onClick={v.closeLb}
                    style={{
                      minHeight: '44px',
                      padding: '0 16px',
                      border: 'none',
                      background: '#fff',
                      color: '#1C2620',
                      fontWeight: '800',
                      fontSize: '16px',
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >
                    Закрыть ✕
                  </button>
                </div>
                <div
                  style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    padding: '20px 24px 60px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                  }}
                >
                  {(v.allPhotos || []).map((p: any, _i0: number) => (
                    <Fragment key={_i0}>
                      <figure style={{ margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <img
                          src={p.src}
                          alt={p.alt}
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '680px',
                            objectFit: 'cover',
                            display: 'block',
                            borderRadius: '2px',
                          }}
                        />
                        <figcaption style={{ color: '#D9E2DC', fontSize: '15px' }}>
                          {p.n}. {p.alt}
                        </figcaption>
                      </figure>
                    </Fragment>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          {/* Key facts strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              background: '#EEF5F1',
              border: '1px solid #C8DED3',
              borderRadius: '2px',
            }}
          >
            <div className="strip">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flex: 'none' }}
              >
                <path d="M4 3h16v18H4zM12 3v18M8 10V7M16 10V7M8 14v3M16 14v3" />
              </svg>
              Всё в одном здании
            </div>
            <div className="strip">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flex: 'none' }}
              >
                <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2M12 15v4M10 17h4" />
              </svg>
              Врач говорит по-русски
            </div>
            <div className="strip">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flex: 'none' }}
              >
                <path d="M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8" />
              </svg>
              Питание 3 раза в день
            </div>
            <div className="strip">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F5F4A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flex: 'none' }}
              >
                <path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6" />
              </svg>
              Бассейн и сауны
            </div>
          </div>
          <nav style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #E3DED2', flexWrap: 'wrap' }}>
            <Link className="tab on" to="/hotel#rooms">
              Номера и программы
            </Link>
            <Link className="tab" to="/hotel#treat">
              Лечение
            </Link>
            <Link className="tab" to="/hotel#food">
              Питание
            </Link>
            <Link className="tab" to="/hotel#about">
              О санатории
            </Link>
            <Link className="tab" to="/hotel#reviews">
              Отзывы (26)
            </Link>
          </nav>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'start' }}>
            <div style={{ flex: '1 1 100%', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#EEF5F1',
                  border: '2px solid #1F5F4A',
                  borderRadius: '2px',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#3E4B44',
                        textTransform: 'uppercase',
                        letterSpacing: '.04em',
                      }}
                    >
                      Ваши даты
                    </span>
                    <strong style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '24px', lineHeight: '1.15' }}>
                      {v.dateRange}
                    </strong>
                  </div>
                  <span
                    style={{ fontSize: '17px', color: '#1C2620', paddingLeft: '14px', borderLeft: '1px solid #C8DED3' }}
                  >
                    {v.nightsLabel} · 2 взрослых
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.openCal}
                  style={{ minHeight: '50px', fontSize: '16px', padding: '0 20px' }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                  </svg>
                  Изменить даты · когда дешевле?
                </button>
              </div>
              <div id="rooms" style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '6px' }}>
                <h2 style={{ fontSize: '32px' }}>Выберите номер</h2>
                <div style={{ fontSize: '16px', color: '#3E4B44' }}>
                  Цена за весь заезд для двух гостей — с самой доступной программой. Программу можно улучшить внутри
                  карточки номера.
                </div>
              </div>
              {(v.offers || []).map((o: any, _i0: number) => (
                <Fragment key={_i0}>
                  <article
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      border: o.cardBorder,
                      background: o.cardBg,
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          position: 'relative',
                          flex: '0 0 300px',
                          minHeight: '210px',
                          margin: '14px 0 14px 14px',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          background: '#2B3A33',
                        }}
                      >
                        <img
                          src={o.img}
                          alt={o.room}
                          style={{
                            position: 'absolute',
                            inset: '0',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: o.imgFilter,
                          }}
                        />{' '}
                        {o.busy ? (
                          <>
                            <span
                              style={{
                                position: 'absolute',
                                left: '10px',
                                top: '10px',
                                background: '#5E6862',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '800',
                                padding: '5px 10px',
                                borderRadius: '2px',
                              }}
                            >
                              Занят на ваши даты
                            </span>
                          </>
                        ) : null}{' '}
                        <span
                          style={{
                            position: 'absolute',
                            left: '10px',
                            bottom: '10px',
                            background: 'rgba(28,38,32,.8)',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '5px 9px',
                            borderRadius: '2px',
                          }}
                        >
                          Фото номера
                        </span>
                      </div>
                      <div
                        style={{
                          flex: '1 1 300px',
                          minWidth: '0',
                          padding: '16px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <span
                          className="pill"
                          style={{ alignSelf: 'flex-start', background: o.pillBg, color: o.pillColor }}
                        >
                          {o.pill}
                        </span>
                        <h3 style={{ fontSize: '24px', color: o.nameColor }}>{o.short}</h3>
                        <div style={{ fontSize: '15px', color: '#3E4B44' }}>{o.roomLine}</div>
                        <div style={{ fontSize: '15px', color: '#3E4B44', marginTop: '-4px' }}>{o.progLine}</div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
                            gap: '10px 18px',
                            marginTop: '8px',
                          }}
                        >
                          <div className="ico2">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1F5F4A"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              style={{ flex: 'none' }}
                            >
                              <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2M12 15v4M10 17h4" />
                            </svg>
                            Консультация
                            <br />
                            врача
                          </div>
                          <div className="ico2">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1F5F4A"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              style={{ flex: 'none' }}
                            >
                              <path d="M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8" />
                            </svg>
                            Питание
                            <br />3 раза в день
                          </div>
                          <div className="ico2">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1F5F4A"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              style={{ flex: 'none' }}
                            >
                              <path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6" />
                            </svg>
                            Бассейн и сауны
                          </div>
                          <div className="ico2">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1F5F4A"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              style={{ flex: 'none' }}
                            >
                              <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                            </svg>
                            Процедуры
                            <br />
                            ежедневно
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          flex: '0 0 240px',
                          padding: '18px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          borderLeft: '1px solid #E3DED2',
                          justifyContent: 'center',
                        }}
                      >
                        {o.avail ? (
                          <>
                            <span
                              style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.1', whiteSpace: 'nowrap' }}
                            >
                              <span style={{ fontSize: '18px', fontWeight: '600' }}>от</span> {o.price}&nbsp;€
                            </span>
                            <span style={{ fontSize: '14px', color: '#3E4B44' }}>за 2 взрослых · {v.nightsLabel}</span>
                            <span style={{ fontSize: '13px', color: '#6B776F' }}>
                              ≈ {o.ppn}&nbsp;€ / человек / сутки · сейчас {o.adv}&nbsp;€
                            </span>
                            <Link
                              className="btn btn-primary"
                              to="/rooms"
                              style={{ minHeight: '48px', fontSize: '16px', marginTop: '12px' }}
                            >
                              Выбрать номер
                            </Link>
                          </>
                        ) : null}
                        {o.busy ? (
                          <>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: '#3E4B44', lineHeight: '1.25' }}>
                              Занят на {o.busyRange}
                            </span>
                            <span style={{ fontSize: '15px', color: '#3E4B44', marginTop: '4px' }}>
                              Свободен: <strong style={{ color: '#1C2620' }}>{o.nextFree}</strong>
                            </span>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={o.openRoomCal}
                              style={{ minHeight: '48px', fontSize: '16px', marginTop: '12px', padding: '0 14px' }}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
                              </svg>
                              Выбрать другие даты
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={o.toggleDet}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        width: '100%',
                        border: 'none',
                        borderTop: '1px solid #E3DED2',
                        background: '#FAFBF9',
                        padding: '12px 18px',
                        minHeight: '48px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '15px',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6" />
                        </svg>
                        {o.detBtn}
                      </span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ transform: o.detChev }}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {o.detOpen ? (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '18px',
                            padding: '18px 18px 18px',
                            borderTop: '1px solid #E3DED2',
                            background: '#FAFBF9',
                          }}
                        >
                          {/* 0. Programmes available for this room (cheapest first) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#6B776F',
                                textTransform: 'uppercase',
                                letterSpacing: '.04em',
                              }}
                            >
                              Программы для этого номера
                            </div>
                            {(o.progRows || []).map((pr: any, _i1: number) => (
                              <Fragment key={_i1}>
                                <button
                                  type="button"
                                  onClick={pr.pick}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    width: '100%',
                                    minHeight: '64px',
                                    padding: '10px 16px',
                                    border: `2px solid ${pr.border ?? ''}`,
                                    background: pr.bg,
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      border: `2px solid ${pr.border ?? ''}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flex: 'none',
                                      background: '#fff',
                                    }}
                                  >
                                    <span
                                      style={{ width: '12px', height: '12px', borderRadius: '50%', background: pr.dot }}
                                    />
                                  </span>
                                  <svg
                                    width="28"
                                    height="28"
                                    viewBox="-1 -1 26 26"
                                    fill="none"
                                    stroke="#1F5F4A"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    style={{ flex: 'none' }}
                                  >
                                    <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                                  </svg>
                                  <span
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      flex: '1',
                                      minWidth: '0',
                                      lineHeight: '1.25',
                                    }}
                                  >
                                    <strong style={{ fontSize: '17px' }}>{pr.name}</strong>
                                    <span style={{ fontSize: '14px', color: '#3E4B44' }}>{pr.sub}</span>
                                  </span>
                                  <span
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-end',
                                      lineHeight: '1.2',
                                    }}
                                  >
                                    <strong style={{ fontSize: '20px', whiteSpace: 'nowrap' }}>{pr.price}</strong>
                                    <span style={{ fontSize: '13px', color: pr.diffColor, whiteSpace: 'nowrap' }}>
                                      {pr.diff}
                                    </span>
                                  </span>
                                </button>
                              </Fragment>
                            ))}
                          </div>
                          {/* 1. Value at a glance: big numbers + icons */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#6B776F',
                                textTransform: 'uppercase',
                                letterSpacing: '.04em',
                              }}
                            >
                              {o.selName}: что вы получаете за {v.nightsLabel}
                            </div>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit,minmax(min(190px,100%),1fr))',
                                gap: '10px',
                              }}
                            >
                              {(o.value || []).map((v: any, _i1: number) => (
                                <Fragment key={_i1}>
                                  <div
                                    style={{
                                      background: '#EEF5F1',
                                      border: '1px solid #C8DED3',
                                      borderRadius: '2px',
                                      padding: '14px 16px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '4px',
                                      minHeight: '118px',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <svg
                                        width="34"
                                        height="34"
                                        viewBox="-1 -1 26 26"
                                        fill="none"
                                        stroke="#1F5F4A"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                        style={{ flex: 'none' }}
                                      >
                                        <path d={v.d} />
                                      </svg>
                                      <span
                                        style={{
                                          fontFamily: 'Lora,Georgia,serif',
                                          fontSize: '36px',
                                          fontWeight: '700',
                                          lineHeight: '1',
                                          color: '#1F5F4A',
                                        }}
                                      >
                                        {v.big}
                                      </span>
                                    </div>
                                    <strong style={{ fontSize: '16px', lineHeight: '1.2', color: '#1C2620' }}>
                                      {v.label}
                                    </strong>
                                    <span style={{ fontSize: '13px', lineHeight: '1.3', color: '#3E4B44' }}>
                                      {v.sub}
                                    </span>
                                  </div>
                                </Fragment>
                              ))}
                            </div>
                          </div>
                          {/* 2. Programme items + room amenities */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 28px' }}>
                            <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  color: '#6B776F',
                                  textTransform: 'uppercase',
                                  letterSpacing: '.04em',
                                }}
                              >
                                В программу входит
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(o.prog || []).map((p: any, _i1: number) => (
                                  <Fragment key={_i1}>
                                    <div className="fact" style={{ color: '#1C2620', fontSize: '16px' }}>
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#1F5F4A"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d={p.d} />
                                      </svg>
                                      {p.t}
                                    </div>
                                  </Fragment>
                                ))}
                              </div>
                            </div>
                            <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  color: '#6B776F',
                                  textTransform: 'uppercase',
                                  letterSpacing: '.04em',
                                }}
                              >
                                Номер
                              </div>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(170px,100%),1fr))',
                                  gap: '8px 12px',
                                }}
                              >
                                {(o.amen || []).map((a: any, _i1: number) => (
                                  <Fragment key={_i1}>
                                    <div className="fact" style={{ color: '#1C2620' }}>
                                      <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#3E4B44"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d={a.d} />
                                      </svg>
                                      {a.t}
                                    </div>
                                  </Fragment>
                                ))}
                              </div>
                              <p style={{ margin: '0', fontSize: '14px', color: '#3E4B44' }}>{o.roomText}</p>
                            </div>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '3px',
                              background: '#FAF8F3',
                              borderRadius: '2px',
                              padding: '12px 16px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#6B776F',
                                textTransform: 'uppercase',
                                letterSpacing: '.04em',
                                marginBottom: '4px',
                              }}
                            >
                              Подробно о программе
                            </div>
                            {(o.detLines || []).map((l: any, _i1: number) => (
                              <Fragment key={_i1}>
                                <div
                                  style={{
                                    fontSize: '15px',
                                    lineHeight: '1.45',
                                    color: '#1C2620',
                                    fontWeight: l.fw,
                                    paddingLeft: l.pl,
                                    marginTop: l.mt,
                                  }}
                                >
                                  {l.t}
                                </div>
                              </Fragment>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Link
                              className="btn btn-primary"
                              to="/rooms"
                              style={{ minHeight: '52px', fontSize: '17px' }}
                            >
                              Выбрать: {o.selName} · {o.selPrice}
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </article>
                </Fragment>
              ))}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '15px',
                  color: '#3E4B44',
                  background: '#EEF5F1',
                  borderRadius: '2px',
                  padding: '10px 16px',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: 'none' }}
                >
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v8M8 12h8" />
                </svg>
                Процедуры назначает врач после консультации.
              </div>
              <button type="button" className="accrow" onClick={v.toggleTr}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <path d="M5 17h14M3 11l1.5-5h15L21 11M3 11v6h18v-6M7 17a1.5 1.5 0 1 0 0 .01M17 17a1.5 1.5 0 1 0 0 .01" />
                  </svg>
                  Как добраться и заказать трансфер
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {v.trOpen ? (
                <>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #E3DED2',
                      borderTop: 'none',
                      borderRadius: '0 0 2px 2px',
                      padding: '18px 18px 16px',
                      marginTop: '-8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '16px' }}>
                      <span className="ico">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        Из аэропорта Вильнюса — <strong>130 км</strong>
                      </span>
                      <span className="ico">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                        В пути <strong>около 2 часов</strong>
                      </span>
                      <span className="ico">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1F5F4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 17h14M3 11l1.5-5h15L21 11M3 11v6h18v-6M7 17a1.5 1.5 0 1 0 0 .01M17 17a1.5 1.5 0 1 0 0 .01" />
                        </svg>
                        Также из Каунаса, Варшавы, Мариямполе
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '14px 18px 14px',
                        background: '#EDF4EF',
                        border: '1px solid #C8DED3',
                        borderRadius: '2px',
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '17px' }}>Как проходит трансфер</div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '4px',
                          flexWrap: 'nowrap',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            flex: '1 1 0',
                            minWidth: '0',
                          }}
                        >
                          <img
                            src="/img/39ad8fe2bfcea92423d717bc9dac8f37.png"
                            alt="Водитель встречает с табличкой"
                            style={{ height: '72px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                            }}
                          >
                            Встретим с табличкой
                          </span>
                          <span
                            style={{
                              fontSize: '13px',
                              color: '#3E4B44',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              maxWidth: '160px',
                            }}
                          >
                            Водитель ждёт в зале прилёта с вашей фамилией
                          </span>
                        </div>
                        <svg
                          width="30"
                          height="12"
                          viewBox="0 0 46 12"
                          fill="none"
                          stroke="#7FB49A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none', marginTop: '30px' }}
                        >
                          <path d="M2 6h30" strokeDasharray="2 4" />
                          <path d="M36 2l5 4-5 4" />
                        </svg>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            flex: '1 1 0',
                            minWidth: '0',
                          }}
                        >
                          <img
                            src="/img/838118fe86e78736560c2ece8886b813.png"
                            alt="Водитель укладывает чемодан в багажник"
                            style={{ height: '72px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                            }}
                          >
                            Поможем с багажом
                          </span>
                          <span
                            style={{
                              fontSize: '13px',
                              color: '#3E4B44',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              maxWidth: '160px',
                            }}
                          >
                            Чемоданы — в багажник, вам ничего нести не нужно
                          </span>
                        </div>
                        <svg
                          width="30"
                          height="12"
                          viewBox="0 0 46 12"
                          fill="none"
                          stroke="#7FB49A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none', marginTop: '30px' }}
                        >
                          <path d="M2 6h30" strokeDasharray="2 4" />
                          <path d="M36 2l5 4-5 4" />
                        </svg>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            flex: '1 1 0',
                            minWidth: '0',
                          }}
                        >
                          <img
                            src="/img/565b4c9fbca5b96b414361547b3a452f.png"
                            alt="Микроавтобус едет к санаторию"
                            style={{ height: '72px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                            }}
                          >
                            Довезём до санатория
                          </span>
                          <span
                            style={{
                              fontSize: '13px',
                              color: '#3E4B44',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              maxWidth: '160px',
                            }}
                          >
                            Остановки по пути — по вашей просьбе
                          </span>
                        </div>
                        <svg
                          width="30"
                          height="12"
                          viewBox="0 0 46 12"
                          fill="none"
                          stroke="#7FB49A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none', marginTop: '30px' }}
                        >
                          <path d="M2 6h30" strokeDasharray="2 4" />
                          <path d="M36 2l5 4-5 4" />
                        </svg>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            flex: '1 1 0',
                            minWidth: '0',
                          }}
                        >
                          <img
                            src="/img/05b41fccbf0a437d88db58e3ce3a1a91.png"
                            alt="Гость у стойки регистрации санатория"
                            style={{ height: '72px', width: 'auto', maxWidth: '100%', display: 'block' }}
                          />
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#1C2620',
                              textAlign: 'center',
                              lineHeight: '1.2',
                            }}
                          >
                            Проводим до стойки
                          </span>
                          <span
                            style={{
                              fontSize: '13px',
                              color: '#3E4B44',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              maxWidth: '160px',
                            }}
                          >
                            Передадим администратору, обратно — так же
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#3E4B44',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          paddingTop: '4px',
                          borderTop: '1px solid #C8DED3',
                        }}
                      >
                        <span>
                          • <strong>Если рейс задерживается</strong> — следим по номеру и ждём без доплаты.
                        </span>
                        <span>
                          • <strong>Обратно</strong> — заберём из санатория за 3 часа до вылета, время подтвердим за
                          день.
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontWeight: '800', fontSize: '17px' }}>Тип автомобиля выберете при оформлении</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                        {(v.trCars || []).map((v: any, _i0: number) => (
                          <Fragment key={_i0}>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#F7F5F0',
                                border: '1px solid #E3DED2',
                                borderRadius: '2px',
                                padding: '12px 12px 10px',
                                textAlign: 'center',
                              }}
                            >
                              <img
                                src={v.img}
                                alt={v.name}
                                style={{ height: '54px', width: 'auto', maxWidth: '100%', display: 'block' }}
                              />
                              <strong style={{ fontSize: '15px', lineHeight: '1.2' }}>{v.name}</strong>
                              <span style={{ fontSize: '13px', color: '#3E4B44', lineHeight: '1.3' }}>{v.info}</span>
                              <span style={{ fontSize: '16px', fontWeight: '800', color: '#1F5F4A' }}>{v.price}</span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          background: '#FFF8EC',
                          border: '1px solid #F0DDB8',
                          borderRadius: '2px',
                          padding: '12px 14px',
                          fontSize: '15px',
                          color: '#1C2620',
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#C9893A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          style={{ flex: 'none' }}
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M9 9.5a3 3 0 1 1 3 3v1.5M12 17h.01" />
                        </svg>
                        <span>
                          <strong>Хотите сэкономить?</strong> При оформлении можно отметить «совместная поездка»: если в
                          тот же день едут другие гости, объединим трансфер — цена ниже на <strong>30 %</strong>, дорога
                          длиннее не более чем на 30 минут.
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#3E4B44' }}>
                        {v.freeTr} Трансфер — следующий шаг после выбора программы.
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              <button type="button" className="accrow" onClick={v.toggleTime}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2" />
                  </svg>
                  Время заезда и выезда
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {v.timeOpen ? (
                <>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #E3DED2',
                      borderTop: 'none',
                      borderRadius: '0 0 2px 2px',
                      padding: '18px 18px 16px',
                      marginTop: '-8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'center',
                          background: '#EEF5F1',
                          border: '1px solid #C8DED3',
                          borderRadius: '2px',
                          padding: '14px 16px',
                        }}
                      >
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            flex: 'none',
                            background: '#fff',
                            border: '1px solid #C8DED3',
                            borderRadius: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1F5F4A"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 21h18M5 21V8l7-4 7 4v13M10 21v-5h4v5M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
                          </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#3E4B44',
                              textTransform: 'uppercase',
                              letterSpacing: '.04em',
                            }}
                          >
                            Заезд
                          </span>
                          <span
                            style={{
                              fontFamily: 'Lora,Georgia,serif',
                              fontSize: '30px',
                              fontWeight: '600',
                              lineHeight: '1',
                              color: '#1C2620',
                            }}
                          >
                            с {v.times?.checkin}
                          </span>
                          <span style={{ fontSize: '14px', color: '#3E4B44' }}>{v.times?.checkinDate}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'center',
                          background: '#F7F5F0',
                          border: '1px solid #E3DED2',
                          borderRadius: '2px',
                          padding: '14px 16px',
                        }}
                      >
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            flex: 'none',
                            background: '#fff',
                            border: '1px solid #E3DED2',
                            borderRadius: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1F5F4A"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M10 17l5-5-5-5M15 12H3M21 3v18" />
                          </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#3E4B44',
                              textTransform: 'uppercase',
                              letterSpacing: '.04em',
                            }}
                          >
                            Выезд
                          </span>
                          <span
                            style={{
                              fontFamily: 'Lora,Georgia,serif',
                              fontSize: '30px',
                              fontWeight: '600',
                              lineHeight: '1',
                              color: '#1C2620',
                            }}
                          >
                            до {v.times?.checkout}
                          </span>
                          <span style={{ fontSize: '14px', color: '#3E4B44' }}>{v.times?.checkoutDate}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(v.times?.notes || []).map((n: any, _i0: number) => (
                        <Fragment key={_i0}>
                          <div className="ico" style={{ fontSize: '15px', color: '#3E4B44', alignItems: 'flex-start' }}>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1F5F4A"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              style={{ marginTop: '2px' }}
                            >
                              <path d={n.d} />
                            </svg>
                            <span>
                              <strong style={{ color: '#1C2620' }}>{n.t}</strong> — {n.s}
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
              <button type="button" className="accrow" onClick={v.toggleSpec}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flex: 'none' }}
                  >
                    <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                  </svg>
                  Специализации санатория
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {v.specOpen ? (
                <>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #E3DED2',
                      borderTop: 'none',
                      borderRadius: '0 0 2px 2px',
                      padding: '18px 18px 16px',
                      marginTop: '-8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                      {(v.specs || []).map((s: any, _i0: number) => (
                        <Fragment key={_i0}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start',
                              background: '#F7F5F0',
                              border: '1px solid #E3DED2',
                              borderRadius: '2px',
                              padding: '12px 14px',
                            }}
                          >
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                flex: 'none',
                                background: '#EEF5F1',
                                border: '1px solid #C8DED3',
                                borderRadius: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1F5F4A"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d={s.d} />
                              </svg>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '0' }}>
                              <strong style={{ fontSize: '16px', lineHeight: '1.25', color: '#1C2620' }}>{s.t}</strong>
                              <span style={{ fontSize: '14px', lineHeight: '1.35', color: '#3E4B44' }}>{s.s}</span>
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#3E4B44' }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flex: 'none' }}
                      >
                        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01" />
                      </svg>
                      При заезде врач проводит осмотр и подбирает процедуры под ваш профиль. Если сомневаетесь, подходит
                      ли санаторий, — позвоните нам, подскажем.
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <section
              style={{
                width: '100%',
                background: '#EEF5F1',
                border: '1px solid #C8DED3',
                borderRadius: '2px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: 'none' }}
                >
                  <path d="M4 13a8 8 0 0 1 16 0M4 13v5a2 2 0 0 0 2 2h2v-7H4zM20 13v5a2 2 0 0 1-2 2h-2v-7h4" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '21px' }}>
                    Поможем выбрать программу
                  </strong>
                  <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                    Объясним условия, ответим на вопросы — на русском языке
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: '1 1 260px',
                  paddingLeft: '24px',
                  borderLeft: '1px solid #C8DED3',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1F5F4A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flex: 'none' }}
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <a href="tel:+37060000000" style={{ fontWeight: '800', fontSize: '19px', textDecoration: 'none' }}>
                    +370&nbsp;600 00000
                  </a>
                  <span style={{ fontSize: '13px', color: '#3E4B44' }}>
                    Ежедневно с 9:00 до 20:00 · <Link to="/rules">Условия оплаты и отмены</Link>
                  </span>
                </div>
              </div>
              <Link className="btn btn-secondary" to="/done" style={{ minHeight: '50px', fontSize: '16px' }}>
                Задать вопрос
              </Link>
            </section>
          </div>
        </div>
        <footer style={{ background: '#1C2620', color: '#D9E2DC', marginTop: 'auto' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '28px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '16px',
            }}
          >
            <div>Санатории Литвы · консультация на русском 24/7 · WhatsApp +370&nbsp;600 00000</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link to="/rules" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
                Как оплатить
              </Link>
              <Link to="/rules" style={{ color: '#D9E2DC', textDecoration: 'none' }}>
                Условия отмены
              </Link>
            </div>
          </div>
        </footer>
      </div>{' '}
      {/* "Когда дешевле?" — two-month range calendar with this sanatorium's prices; applying re-renders the page */}{' '}
      {v.calOpen ? (
        <>
          <div
            style={{
              position: 'fixed',
              inset: '0',
              background: 'rgba(18,34,27,.55)',
              zIndex: '50',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '40px 16px',
              overflow: 'auto',
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="calTitle"
              style={{
                background: '#fff',
                borderRadius: '2px',
                width: 'min(820px,100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                padding: '26px 28px 24px',
                boxShadow: '0 24px 60px rgba(0,0,0,.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 id="calTitle" style={{ fontSize: '32px' }}>
                    Когда дешевле? Выберите даты
                  </h2>
                  <span style={{ fontSize: '17px', color: '#3E4B44' }}>
                    {v.calHint} · Цены — за человека в сутки, программа «Миди»
                  </span>
                  {v.calRoomOn ? (
                    <>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignSelf: 'flex-start',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#FFF6E3',
                          border: '1px solid #F0DDB8',
                          borderRadius: '2px',
                          padding: '6px 12px',
                          fontSize: '16px',
                          marginTop: '4px',
                        }}
                      >
                        Даты для номера<strong>«{v.calRoomName}»</strong>— заштрихованные дни заняты
                      </span>
                    </>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={v.closeCal}
                  style={{ minHeight: '48px', fontSize: '16px', padding: '0 18px' }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                  Закрыть
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', color: '#3E4B44' }}>Быстрый выбор:</span>
                <button type="button" className="preset" onClick={v.p7}>
                  7 ночей
                </button>
                <button type="button" className="preset" onClick={v.p10}>
                  10 ночей
                </button>
                <button type="button" className="preset" onClick={v.p14}>
                  14 ночей
                </button>
                <button type="button" className="preset" onClick={v.p21}>
                  21 ночь
                </button>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span className="lg">
                    <i style={{ background: '#E9F4EC', border: '1px solid #C8DED3' }} />
                    дешевле
                  </span>
                  <span className="lg">
                    <i style={{ background: '#FFF6E3', border: '1px solid #F0DDB8' }} />
                    как сейчас
                  </span>
                  <span className="lg">
                    <i style={{ background: '#FCEDE9', border: '1px solid #F0CFC6' }} />
                    дороже
                  </span>
                  <span className="lg">
                    <i style={{ background: '#E8E6E1' }} />
                    прошедшие дни
                  </span>
                  <span className="lg">
                    <i
                      style={{
                        background: 'repeating-linear-gradient(135deg,#F3F0EA 0 6px,#E4DFD5 6px 12px)',
                        border: '1px solid #CFC9BB',
                      }}
                    />
                    нет свободных мест
                  </span>
                  <details style={{ display: 'inline-block', fontSize: '14px', color: '#3E4B44' }}>
                    <summary
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        listStyle: 'none',
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1F5F4A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                      </svg>
                      <span>
                        <strong style={{ color: '#1C2620' }}>Рейсы из Израиля</strong> — вт, чт, вс
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '1.5px solid #1F5F4A',
                          color: '#1F5F4A',
                          fontSize: '12px',
                          fontWeight: '800',
                        }}
                      >
                        i
                      </span>
                    </summary>
                    <div
                      style={{
                        marginTop: '8px',
                        maxWidth: '420px',
                        background: '#F4F1EA',
                        borderRadius: '2px',
                        padding: '10px 12px',
                        fontSize: '14px',
                        lineHeight: '1.45',
                        color: '#1C2620',
                      }}
                    >
                      Прямые рейсы Тель-Авив ⇄ Вильнюс выполняют <strong>Israir</strong> и <strong>Arkia</strong> (с
                      осени — также Wizz Air). В отмеченные дни удобнее всего заезжать и уезжать: трансфер встретит
                      прямо в аэропорту. Расписание рейсов уточняйте у авиакомпании [ПОДТВЕРДИТЬ ДНИ].
                    </div>
                  </details>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <button type="button" className="navbtn" onClick={v.calPrev} aria-label="Предыдущие месяцы">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                </button>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {(v.months || []).map((m: any, _i0: number) => (
                    <Fragment key={_i0}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div
                          style={{
                            fontFamily: 'Lora,Georgia,serif',
                            fontSize: '22px',
                            fontWeight: '600',
                            textAlign: 'center',
                          }}
                        >
                          {m.title}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                          <div className="wd">Пн</div>
                          <div className="wd">Вт</div>
                          <div className="wd">Ср</div>
                          <div className="wd">Чт</div>
                          <div className="wd">Пт</div>
                          <div className="wd">Сб</div>
                          <div className="wd">Вс</div>
                          {(m.cells || []).map((c: any, _i1: number) => (
                            <Fragment key={_i1}>
                              <button
                                type="button"
                                className="cell"
                                onClick={c.pick}
                                disabled={!!c.off}
                                aria-label={c.aria}
                                style={{ background: c.bg, borderColor: c.border, color: c.color, cursor: c.cursor }}
                              >
                                <span>{c.day}</span>
                                <small style={{ color: c.subColor }}>{c.sub}</small>
                                {c.fly ? (
                                  <>
                                    <span
                                      style={{ position: 'absolute', top: '4px', right: '5px', lineHeight: '0' }}
                                      title="Рейс из Израиля"
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#1F5F4A"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d="M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z" />
                                      </svg>
                                    </span>
                                  </>
                                ) : null}
                              </button>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <button type="button" className="navbtn" onClick={v.calNext} aria-label="Следующие месяцы">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1F5F4A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div
                  style={{
                    background: '#F4F1EA',
                    borderRadius: '2px',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span
                    className="lbl"
                    style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '.04em' }}
                  >
                    Сейчас
                  </span>
                  <strong style={{ fontSize: '18px' }}>
                    {v.curRange} · {v.nightsLabel}
                  </strong>
                  <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                    «Миди», 2 взрослых — <strong style={{ color: '#1C2620' }}>{v.curTotal}&nbsp;€</strong>
                  </span>
                </div>
                <div
                  style={{
                    background: v.diffBg,
                    borderRadius: '2px',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span
                    className="lbl"
                    style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '.04em' }}
                  >
                    Новые даты
                  </span>
                  <strong style={{ fontSize: '18px' }}>{v.newRange}</strong>
                  <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                    «Миди», 2 взрослых — <strong style={{ color: '#1C2620' }}>{v.newTotal}</strong>{' '}
                    <strong style={{ color: v.diffColor }}>{v.diffText}</strong>
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  borderTop: '1px solid #E3DED2',
                  paddingTop: '16px',
                }}
              >
                <button type="button" className="btn btn-secondary" onClick={v.closeCal}>
                  Оставить {v.curRange}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={v.applyCal}
                  disabled={!!v.applyOff}
                  style={{ minHeight: '56px', fontSize: '18px', padding: '0 32px' }}
                >
                  Применить новые даты
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
