// Design-canvas logic for the search band (home page and results): working date calendar
// (exact dates + "Не знаю точных дат"), guests +/−, resort-or-sanatorium list.
// Mirrors src/pages/Main (calendar), src/components/FlexDates, GuestsPicker, PlaceSearch.
// Plain JS: the canvas runtime runs it as `class Component extends DCLogic`.
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { inD: '2026-11-09', outD: '2026-11-18', ad: 2, ch: 0, city: 'Друскининкай' };
  }
  renderVals() {
    const st = this.state;
    const DAY = 86400000;
    const toD = (s) => new Date(s + 'T00:00:00Z');
    const iso = (d) => d.toISOString().slice(0, 10);
    const addD = (d, n) => new Date(d.getTime() + n * DAY);
    const days = (a, b) => Math.round((b.getTime() - a.getTime()) / DAY);
    const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const MONTHS_N = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const TODAY = toD('2026-10-27');
    // [ПРИМЕР] no places in any sanatorium
    const SOLD = ['2026-11-20', '2026-11-21', '2026-11-22', '2026-12-24', '2026-12-25', '2026-12-26', '2026-12-27', '2026-12-31', '2027-01-01'];
    const fly = (d) => [0, 2, 4].indexOf(d.getUTCDay()) >= 0;
    const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const nW = (n) =>
      n % 10 === 1 && n % 100 !== 11 ? 'ночь' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'ночи' : 'ночей';
    const priceOf = (d) => {
      const n = days(TODAY, d),
        wd = d.getUTCDay(),
        m = d.getUTCMonth();
      return Math.round(
        100 *
          (1 +
            0.12 * Math.sin(n * 0.42) +
            (wd === 5 || wd === 6 ? 0.06 : 0) +
            (m === 11 && d.getUTCDate() > 20 ? 0.22 : 0) +
            (m >= 5 && m <= 7 ? 0.15 : 0) +
            (m === 0 && d.getUTCDate() < 8 ? 0.18 : 0)),
      );
    };
    const long = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    const short = (d) => d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()];

    const inD = toD(st.inD),
      outD = toD(st.outD);
    const sel = st.sel || { in: st.inD, out: st.outD };
    const sIn = sel.in ? toD(sel.in) : null,
      sOut = sel.out ? toD(sel.out) : null;
    const m0 = st.month != null ? st.month : inD.getUTCMonth(),
      y0 = st.year != null ? st.year : inD.getUTCFullYear();
    const pickDay = (date) => () => {
      const k = iso(date);
      if (!sel.in || (sel.in && sel.out)) this.setState({ sel: { in: k, out: null } });
      else if (date > toD(sel.in)) this.setState({ sel: { in: sel.in, out: k } });
      else this.setState({ sel: { in: k, out: null } });
    };
    const first = new Date(Date.UTC(y0, m0, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const dim = new Date(Date.UTC(y0, m0 + 1, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < lead; i++)
      cells.push({ day: '', sub: '', fly: false, bg: 'transparent', border: 'transparent', color: '#1C2620', subColor: '#3E4B44', off: true, cursor: 'default', aria: '', pick: () => {} });
    for (let d = 1; d <= dim; d++) {
      const date = new Date(Date.UTC(y0, m0, d));
      const past = date < TODAY;
      const full = !past && SOLD.indexOf(iso(date)) >= 0;
      const p = priceOf(date),
        r = p / 100;
      let bg = r < 0.97 ? '#E9F4EC' : r <= 1.05 ? '#FFF6E3' : '#FCEDE9',
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
        fly: fly(date) && !past,
        sub: past ? '' : full ? 'нет мест' : isIn ? 'заезд' : isOut ? 'выезд' : p + ' €',
        bg,
        border,
        color,
        subColor,
        off: past || full,
        cursor: past || full ? 'not-allowed' : 'pointer',
        aria: d + ' ' + MONTHS[m0] + (past ? ', недоступно' : ', около ' + p + ' € за человека в сутки'),
        pick: pickDay(date),
      });
    }
    const nSel = sIn && sOut ? days(sIn, sOut) : 0;
    const preset = (n) => () => {
      const a = sIn || inD;
      this.setState({ sel: { in: iso(a), out: iso(addD(a, n)) } });
    };
    const nights = days(inD, outD);

    // ---- "Не знаю точных дат" ----
    const fm = st.fm != null ? st.fm : 1,
      fn = st.fn || 14;
    const start = new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1));
    const months = [];
    for (let i = 0; i < 9; i++) months.push(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1)));
    const fmD = months[fm];
    const fdim = new Date(Date.UTC(fmD.getUTCFullYear(), fmD.getUTCMonth() + 1, 0)).getUTCDate();
    let opts = [];
    for (let i = 1; i <= fdim; i++) {
      const d = new Date(Date.UTC(fmD.getUTCFullYear(), fmD.getUTCMonth(), i));
      if (d <= TODAY) continue;
      let sum = 0,
        ok = true;
      for (let k = 0; k < fn; k++) {
        const x = addD(d, k);
        if (SOLD.indexOf(iso(x)) >= 0) ok = false;
        sum += priceOf(x);
      }
      if (ok) opts.push({ d, sum: Math.round(sum / 10) * 10 });
    }
    opts = opts.sort((a, b) => a.sum - b.sum).slice(0, 5).sort((a, b) => a.d - b.d);
    const minSum = opts.length ? Math.min.apply(null, opts.map((o) => o.sum)) : 0;
    const NL = { 7: '7 ночей · неделя', 10: '10 ночей', 14: '14 ночей · 2 недели', 21: '21 ночь · 3 недели' };

    // ---- guests ----
    const ad = st.ad,
      ch = st.ch;

    // ---- resort or sanatorium ----
    const PLACES = [
      ['Друскининкай', 'курорт'],
      ['Бирштонас', 'курорт'],
      ['Паланга', 'курорт'],
      ['Аникщяй', 'курорт'],
      ['Беларусь', 'санаторий · Друскининкай'],
      ['Эгле Комфорт', 'санаторий · Друскининкай'],
      ['Эгле Стандарт', 'санаторий · Друскининкай'],
      ['Гранд Спа Лиетува', 'санаторий · Друскининкай'],
      ['Гранд Спа Друскининкай', 'санаторий · Друскининкай'],
      ['Минерал Спа Драугисте', 'санаторий · Друскининкай'],
      ['Упа Медикал Спа', 'санаторий · Друскининкай · нет мест на ваши даты'],
      ['SPA Vilnius Друскининкай', 'санаторий · Друскининкай · нет мест на ваши даты'],
    ];

    return {
      // search band
      inLabel: long(inD),
      outLabel: long(outD),
      nightsLabel: nights + ' ' + nW(nights),
      rangeLine:
        (inD.getUTCMonth() === outD.getUTCMonth()
          ? inD.getUTCDate() + '–' + outD.getUTCDate() + ' ' + MONTHS[inD.getUTCMonth()]
          : short(inD) + ' – ' + short(outD)) +
        ' ' +
        outD.getUTCFullYear() +
        ' · ' +
        nights +
        ' ' +
        nW(nights) +
        ' · ' +
        ad +
        ' ' +
        (ad === 1 ? 'взрослый' : 'взрослых') +
        (ch ? ', ' + ch + ' ' + (ch === 1 ? 'ребёнок' : 'ребёнка') : ''),
      // calendar
      calOpen: !!st.calOpen,
      openCal: () =>
        this.setState({ calOpen: true, flex: false, sel: { in: st.inD, out: st.outD }, month: inD.getUTCMonth(), year: inD.getUTCFullYear() }),
      closeCal: () => this.setState({ calOpen: false }),
      calPrev: () => {
        const m = m0 - 1;
        this.setState({ month: (m + 12) % 12, year: m < 0 ? y0 - 1 : y0 });
      },
      calNext: () => {
        const m = m0 + 1;
        this.setState({ month: m % 12, year: m > 11 ? y0 + 1 : y0 });
      },
      monthTitle: MONTHS_N[m0] + ' ' + y0,
      cells,
      calHint: !sIn ? 'Нажмите день заезда' : !sOut ? 'Теперь нажмите день выезда' : 'Можно поменять: нажмите новый день заезда',
      selIn: sIn ? short(sIn) : '—',
      selOut: sOut ? short(sOut) : '—',
      selNights: nSel ? nSel + ' ' + nW(nSel) : '—',
      applyOff: !nSel,
      applyCal: () => {
        if (nSel) this.setState({ inD: sel.in, outD: sel.out, calOpen: false });
      },
      p7: preset(7),
      p10: preset(10),
      p14: preset(14),
      p21: preset(21),
      exactOn: !st.flex,
      flexOn: !!st.flex,
      tabExact: st.flex ? '' : 'on',
      tabFlex: st.flex ? 'on' : '',
      tabExactFn: () => this.setState({ flex: false }),
      tabFlexFn: () => this.setState({ flex: true }),
      fdMonths: months.map((m, i) => ({
        label: MONTHS_N[m.getUTCMonth()] + (m.getUTCFullYear() !== TODAY.getUTCFullYear() ? ' ' + m.getUTCFullYear() : ''),
        cls: i === fm ? 'on' : '',
        pick: () => this.setState({ fm: i }),
      })),
      fdNights: [7, 10, 14, 21].map((n) => ({ label: NL[n], cls: n === fn ? 'on' : '', pick: () => this.setState({ fn: n }) })),
      fdTitle: 'Самые выгодные даты заезда в ' + MONTHS[fmD.getUTCMonth()].replace(/я$/, 'е').replace(/а$/, 'е'),
      fdList: opts.map((o) => {
        const out = addD(o.d, fn);
        return {
          when: WD[o.d.getUTCDay()] + ', ' + short(o.d) + ' → ' + short(out) + (fly(o.d) ? ' ✈' : ''),
          sum: fmt(o.sum),
          best: o.sum === minSum,
          pick: () => this.setState({ sel: { in: iso(o.d), out: iso(out) }, flex: false, month: o.d.getUTCMonth(), year: o.d.getUTCFullYear() }),
        };
      }),
      // guests
      gOpen: !!st.gOpen,
      gToggle: () => this.setState({ gOpen: !st.gOpen, psOpen: false }),
      gClose: () => this.setState({ gOpen: false }),
      gAdL: ad + ' ' + (ad === 1 ? 'взрослый' : 'взрослых'),
      gHasCh: ch > 0,
      gChL: ch + ' ' + (ch === 1 ? 'ребёнок' : 'ребёнка'),
      gAd: String(ad),
      gCh: String(ch),
      adMinus: () => ad > 1 && this.setState({ ad: ad - 1 }),
      adPlus: () => ad < 4 && this.setState({ ad: ad + 1 }),
      chMinus: () => ch > 0 && this.setState({ ch: ch - 1 }),
      chPlus: () => ch < 3 && this.setState({ ch: ch + 1 }),
      adMinusOff: ad <= 1,
      adPlusOff: ad >= 4,
      chMinusOff: ch <= 0,
      chPlusOff: ch >= 3,
      // resort or sanatorium
      cityLabel: st.city,
      psOpen: !!st.psOpen,
      psToggle: () => this.setState({ psOpen: !st.psOpen, gOpen: false }),
      psItems: PLACES.map(([label, sub], i) => ({
        label,
        sub,
        cls: label === st.city ? 'on' : '',
        pick: () => this.setState({ city: label, psOpen: false }),
      })),
    };
  }
}
