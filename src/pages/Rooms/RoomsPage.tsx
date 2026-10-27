import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter, footerInfo } from '../../components/layout/SiteFooter';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './RoomsPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
  bottom: '120px',
};

class RoomsLogic extends PageLogic {
  constructor(props?: any) {
    super(props);
    this.state = { prog: 'midi', open: {} };
  }
  renderVals() {
    return this._rv();
  }
  _rv() {
    const I = {
      meals: 'M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8',
      doctor: 'M8 4h8v3H8zM6 6h12v15H6zM9 14h2l1-3 2 6 1-3h2',
      proc: 'M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0',
      pool: 'M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6',
      sauna: 'M8 4c-1 2 1 3 0 5M12 4c-1 2 1 3 0 5M16 4c-1 2 1 3 0 5M4 12h16v8H4zM8 16h8',
      massage: 'M12 20c-4 0-8-3-8-7 2 0 4 1 5 2-1-3 0-7 3-9 3 2 4 6 3 9 1-1 3-2 5-2 0 4-4 7-8 7z',
      gym: 'M2 12h3M19 12h3M5 8v8M8 6v12M16 6v12M19 8v8M8 12h8',
      bed2: 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M5 9V6h6v3M13 9V6h6v3',
    };
    const am = (k, t) => ({ d: I[k], t });
    const st = this.state;
    const NIGHTS = 9,
      PERS = 2,
      ADV = 0.04;
    const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const eur = (n) => fmt(n) + ' €';
    const ROOM = { name: 'Двухместный номер', add: 0 };
    const base =
      'Для взрослого в цену включено:\n— Консультация врача и назначенные процедуры\n— Проживание\n— Трёхразовое питание «шведский стол»\n— Бассейны и сауны без ограничений\n\nДень приезда и отъезда считаются одним лечебным днём. Процедуры назначает врач, по одной из каждой группы:\n1. Лечебная ванна или грязевая аппликация\n2. Лечебный массаж или подводный массаж\n3. Кинезитерапия в зале или в воде\n4. Аппаратная физиотерапия, ингаляции, соляная комната';
    const PROGS = [
      {
        id: 'midi',
        name: 'Программа «Миди»',
        price: 2138,
        tag: '3 процедуры в день',
        sub: '3 процедуры в день · питание 3 раза · бассейны и сауны',
        prog: [
          am('meals', 'Трёхразовое питание'),
          am('doctor', 'Консультация врача'),
          am('proc', '3 процедуры в день'),
          am('pool', 'Бассейны без ограничений'),
          am('sauna', 'Турецкая и финская бани'),
        ],
        details: base,
        value: [
          ['proc', '3', 'процедуры в день', '27 за весь заезд'],
          ['meals', '3', 'приёма пищи', 'шведский стол'],
          ['doctor', '1', 'консультация врача', 'при заезде'],
          ['pool', '∞', 'бассейны и сауны', 'без ограничений'],
        ],
      },
      {
        id: 'maxi',
        name: 'Программа «Макси»',
        price: 2275,
        tag: '5 процедур в день',
        sub: '5 процедур в день · питание 3 раза · бассейны и сауны',
        prog: [
          am('meals', 'Трёхразовое питание'),
          am('doctor', 'Консультация врача'),
          am('proc', '5 процедур в день'),
          am('pool', 'Бассейны без ограничений'),
          am('gym', 'Тренажёрный зал'),
        ],
        details: base.replace(
          'по одной из каждой группы',
          'по одной из каждой группы, плюс дополнительная ванна и массаж в день',
        ),
        value: [
          ['proc', '5', 'процедур в день', '45 за весь заезд'],
          ['meals', '3', 'приёма пищи', 'шведский стол'],
          ['doctor', '1', 'консультация врача', 'при заезде'],
          ['pool', '∞', 'бассейны и сауны', 'без ограничений'],
        ],
      },
      {
        id: 'prem',
        name: 'Программа «Премиум»',
        price: 2550,
        tag: '5 процедур + массаж',
        sub: '5 процедур в день + массаж каждый день · полный пансион',
        prog: [
          am('meals', 'Полный пансион, диетическое меню'),
          am('doctor', 'Консультация врача'),
          am('proc', '5 процедур в день'),
          am('massage', 'Массаж каждый день, 30 мин'),
          am('pool', 'Бассейны без ограничений'),
        ],
        details:
          'Для взрослого в цену включено:\n— Всё, что в программе «Макси»\n— Ежедневный классический массаж 30 мин\n— Полный пансион: завтрак, обед, полдник, ужин, диетическое меню по назначению врача',
        value: [
          ['proc', '5', 'процедур в день', '45 за весь заезд'],
          ['massage', '9', 'массажей', 'каждый день по 30 мин'],
          ['meals', '4', 'приёма пищи', 'полный пансион'],
          ['doctor', '1', 'консультация врача', 'при заезде'],
        ],
      },
    ];
    const open = st.open || {};
    const sel = PROGS.find((p) => p.id === st.prog) || PROGS[0];
    const total = sel.price + ROOM.add;
    return {
      dateRange: '9–18 ноября 2026',
      nightsLabel: NIGHTS + ' ночей',
      progs: PROGS.map((p, i) => {
        const on = p.id === sel.id,
          t = p.price + ROOM.add,
          d = p.price - PROGS[0].price,
          isO = !!open[p.id];
        return {
          ...p,
          value: p.value.map(([k, big, label, sub]) => ({ d: I[k], big, label, sub })),
          detLines: p.details
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => ({
              t: l.replace(/^— ?/, '• '),
              fw: /:$/.test(l) || /^\d+\./.test(l) ? 700 : 400,
              pl: /^—/.test(l) ? '14px' : '0',
              mt: /:$/.test(l) || /^День/.test(l) ? '8px' : '0',
            })),
          deltaLabel: i === 0 ? 'Уже в цене номера' : 'Улучшение',
          delta: i === 0 ? 'Включена' : '+' + eur(d),
          deltaColor: i === 0 ? '#1F5F4A' : '#1C2620',
          total: eur(t),
          ppn: eur(Math.round(t / NIGHTS / PERS)),
          border: on ? '#1F5F4A' : '#E3DED2',
          btnCls: on ? 'btn-primary' : 'btn-secondary',
          btnLabel: on ? '✓ Выбрана' : i === 0 ? 'Оставить эту' : 'Улучшить до этой',
          open: isO,
          chev: isO ? 'rotate(180deg)' : 'none',
          toggleLabel: isO ? 'Свернуть' : 'Что входит в программу подробно',
          toggle: () => this.setState({ open: { ...open, [p.id]: !isO } }),
          pick: () => this.setState({ prog: p.id }),
        };
      }),
      sumLine:
        ROOM.name +
        ' · ' +
        sel.name +
        (sel.price > PROGS[0].price ? ' (+' + eur(sel.price - PROGS[0].price) + ')' : '') +
        ' · ' +
        NIGHTS +
        ' ночей · 2 взрослых',
      sumTotal: eur(total),
      sumAdv: eur(Math.ceil(total * ADV)),
    };
  }
}

export default function RoomsPage() {
  usePageTitle('Шаг 1 из 5 — номер и программа');
  const [v, logic] = usePageLogic(RoomsLogic);
  return (
    <div className="page pg-rooms">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar minHeight={84}>
          <Brand logo={40} size={24} />
          <HeaderAside>
            <span style={{ fontSize: '16px', color: '#3E4B44' }}>Нужна помощь с заказом?</span>
            <PhoneLink icon={24} />
          </HeaderAside>
        </HeaderBar>
        {/* Steps */}
        <CheckoutSteps current={1} />
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '28px 24px 40px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ fontSize: '15px', color: '#3E4B44' }}>
            <Link to="/">Главная</Link> › <Link to="/results">Друскининкай</Link> ›{' '}
            <Link to="/hotel">Эгле Комфорт</Link> › Номер и программа
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1 style={{ fontSize: '38px' }}>Хотите улучшить программу?</h1>
            <p style={{ margin: '0', fontSize: '18px', color: '#3E4B44' }}>
              Номер выбран. Самая доступная программа уже включена — если хотите больше процедур или полный пансион,
              выберите улучшение ниже.
            </p>
          </div>
          {/* Chosen room */}
          <section className="card" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
            <img
              src="/img/33f9767ee953a7f2d2c8ec5ee6a77798.jpg"
              alt="Двухместный номер"
              style={{
                width: '220px',
                height: '150px',
                objectFit: 'cover',
                display: 'block',
                margin: '12px 0 12px 12px',
                borderRadius: '2px',
                flex: 'none',
              }}
            />
            <div
              style={{
                flex: '1 1 300px',
                padding: '14px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#6B776F',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                }}
              >
                Ваш номер
              </span>
              <strong style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '24px' }}>Двухместный номер</strong>
              <span style={{ fontSize: '16px', color: '#3E4B44' }}>
                Санаторий Эгле Комфорт ★★★★ · 17–18 м² · 2 отдельные кровати · балкон
              </span>
              <span style={{ fontSize: '16px', color: '#3E4B44' }}>
                {v.dateRange} · {v.nightsLabel} · 2 взрослых
              </span>
            </div>
            <div
              style={{
                flex: '0 0 220px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Link
                className="btn btn-secondary"
                to="/hotel"
                style={{ minHeight: '48px', fontSize: '16px', padding: '0 18px' }}
              >
                Изменить номер
              </Link>
            </div>
          </section>
          {/* Programme upgrades */}
          {(v.progs || []).map((p: any, _i0: number) => (
            <Fragment key={_i0}>
              <article
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  border: `2px solid ${p.border ?? ''}`,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
                  <div
                    style={{
                      flex: '1 1 560px',
                      minWidth: '0',
                      padding: '18px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                        <path d="M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0" />
                      </svg>
                      <h2 style={{ fontSize: '26px' }}>{p.name}</h2>
                      <span className="pill">{p.tag}</span>
                    </div>
                    <div style={{ fontSize: '16px', color: '#3E4B44' }}>{p.sub}</div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
                        gap: '10px',
                      }}
                    >
                      {(p.value || []).map((v: any, _i1: number) => (
                        <Fragment key={_i1}>
                          <div
                            style={{
                              background: '#EEF5F1',
                              border: '1px solid #C8DED3',
                              borderRadius: '2px',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              minHeight: '104px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                <path d={v.d} />
                              </svg>
                              <span
                                style={{
                                  fontFamily: 'Lora,Georgia,serif',
                                  fontSize: '32px',
                                  fontWeight: '700',
                                  lineHeight: '1',
                                  color: '#1F5F4A',
                                }}
                              >
                                {v.big}
                              </span>
                            </div>
                            <strong style={{ fontSize: '15px', lineHeight: '1.2' }}>{v.label}</strong>
                            <span style={{ fontSize: '13px', lineHeight: '1.3', color: '#3E4B44' }}>{v.sub}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: '0 0 260px',
                      padding: '18px 20px',
                      margin: '14px 0',
                      borderLeft: '1px solid #E3DED2',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#3E4B44' }}>{p.deltaLabel}</span>
                    <span
                      style={{
                        fontSize: '30px',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        whiteSpace: 'nowrap',
                        color: p.deltaColor,
                      }}
                    >
                      {p.delta}
                    </span>
                    <span style={{ fontSize: '15px', marginTop: '6px' }}>Итого за заезд:</span>
                    <span style={{ fontSize: '22px', fontWeight: '800', whiteSpace: 'nowrap' }}>{p.total}</span>
                    <span style={{ fontSize: '13px', color: '#6B776F' }}>≈ {p.ppn} / чел. в сутки</span>
                    <button
                      type="button"
                      className={`btn ${p.btnCls ?? ''}`}
                      onClick={p.pick}
                      style={{ minHeight: '50px', fontSize: '16px', marginTop: '10px', padding: '0 16px' }}
                    >
                      {p.btnLabel}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={p.toggle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    width: '100%',
                    border: 'none',
                    borderTop: '1px solid #E3DED2',
                    background: '#FAFBF9',
                    padding: '12px 20px',
                    minHeight: '52px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '16px',
                    color: '#1F5F4A',
                    textAlign: 'left',
                  }}
                >
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
                      <path d="M6 3h9l5 5v13H6zM14 3v6h6M9 13h6M9 17h6" />
                    </svg>
                    {p.toggleLabel}
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
                    style={{ transform: p.chev }}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {p.open ? (
                  <>
                    <div
                      style={{
                        borderTop: '1px solid #E3DED2',
                        background: '#FAFBF9',
                        padding: '16px 22px 20px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '18px 32px',
                      }}
                    >
                      <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        {(p.prog || []).map((it: any, _i1: number) => (
                          <Fragment key={_i1}>
                            <div className="ico2" style={{ fontSize: '16px' }}>
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
                                <path d={it.d} />
                              </svg>
                              {it.t}
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <div
                        style={{
                          flex: '2 1 420px',
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
                        {(p.detLines || []).map((l: any, _i1: number) => (
                          <Fragment key={_i1}>
                            <div
                              style={{
                                fontSize: '15px',
                                lineHeight: '1.45',
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
                    </div>
                  </>
                ) : null}
              </article>
            </Fragment>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#3E4B44' }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F5F4A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flex: 'none' }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            Процедуры назначает врач после консультации. Улучшить программу можно и на месте — по наличию.
          </div>
        </div>
        {/* Sticky summary */}
        <div
          style={{
            position: 'sticky',
            bottom: '0',
            background: '#fff',
            borderTop: '2px solid #1F5F4A',
            boxShadow: '0 -6px 18px rgba(0,0,0,.08)',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '15px', color: '#3E4B44' }}>{v.sumLine}</span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '28px', whiteSpace: 'nowrap' }}>{v.sumTotal}</strong>
                <span style={{ fontSize: '15px', color: '#3E4B44' }}>
                  сейчас только аванс <strong style={{ color: '#1C2620', whiteSpace: 'nowrap' }}>{v.sumAdv}</strong>,
                  остальное при заезде
                </span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link className="btn btn-secondary" to="/hotel">
                ← К номерам
              </Link>
              <Link
                className="btn btn-primary"
                to="/transfer"
                style={{ minHeight: '60px', fontSize: '20px', padding: '0 34px' }}
              >
                Далее: трансфер →
              </Link>
            </div>
          </div>
        </div>
        <SiteFooter padding="24px 24px" pinned={false} info={footerInfo(false)} />
      </div>{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
