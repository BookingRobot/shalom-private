import { Link } from 'react-router-dom';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './RulesPage.css';

const HELP_CTX: HelpContextInfo = {};

class RulesLogic extends PageLogic {
  renderVals() {
    return this._rv();
  }
  _rv() {
    return {};
  }
}

export default function RulesPage() {
  usePageTitle('Условия бронирования, оплаты и отмены');
  const [v, logic] = usePageLogic(RulesLogic);
  return (
    <div className="page pg-rules">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #E3DED2' }}>
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '0 24px',
              minHeight: '84px',
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
              <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                <rect x="1" y="1" width="38" height="38" fill="#1F5F4A" />
                <path d="M20 9 L27 21 H23.5 L28 30 H12 L16.5 21 H13 Z" fill="#F4F1EA" />
              </svg>
              <span style={{ fontFamily: 'Lora,Georgia,serif', fontSize: '24px', fontWeight: '700' }}>
                Санатории Литвы
              </span>
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
              <Link className="navlink" to="/results">
                Курорты
              </Link>
              <Link className="navlink" to="/rules">
                Как оплатить
              </Link>
              <Link className="navlink" to="/rules" style={{ color: '#1F5F4A' }}>
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
                fontSize: '20px',
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
            padding: '32px 24px 56px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '800px' }}>
            <div style={{ fontSize: '16px', color: '#3E4B44' }}>
              <Link to="/">Главная</Link> › Условия
            </div>
            <h1 style={{ fontSize: '40px' }}>Условия бронирования, оплаты и отмены</h1>
            <p style={{ color: '#3E4B44', fontSize: '19px' }}>
              Простыми словами — что происходит после заказа, сколько и когда платить, и что будет, если планы
              изменятся.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'start' }}>
            <aside
              className="card toc"
              style={{ flex: '1 1 240px', maxWidth: '300px', padding: '12px', position: 'sticky', top: '16px' }}
            >
              <Link to="/rules#how">1. Как проходит заказ</Link> <Link to="/rules#pay">2. Оплата</Link>{' '}
              <Link to="/rules#cancel">3. Отмена и перенос</Link> <Link to="/rules#stay">4. Заезд и проживание</Link>{' '}
              <Link to="/rules#data">5. Ваши данные</Link> <Link to="/rules#contact">6. Как с нами связаться</Link>
            </aside>
            <div style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section
                id="how"
                className="card"
                style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <h2 style={{ fontSize: '26px' }}>1. Как проходит заказ</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="row" style={{ borderTop: 'none' }}>
                    <b>Вы оформляете заказ</b>
                    <p>Выбираете санаторий, номер, даты, трансфер и вводите имена гостей. Это занимает 5–7 минут.</p>
                  </div>
                  <div className="row">
                    <b>Мы подтверждаем места</b>
                    <p>
                      В течение <span className="ph">[N часов]</span> проверяем наличие в санатории и присылаем
                      подтверждение на почту и в WhatsApp.
                    </p>
                  </div>
                  <div className="row">
                    <b>Вы оплачиваете аванс</b>
                    <p>Картой на сайте или банковским переводом. После оплаты номер закреплён за вами.</p>
                  </div>
                  <div className="row">
                    <b>Ваучер и памятка</b>
                    <p>
                      За <span className="ph">[N дней]</span> до заезда присылаем ваучер, адрес санатория, время
                      трансфера и памятку: что взять с собой.
                    </p>
                  </div>
                </div>
              </section>
              <section
                id="pay"
                className="card"
                style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <h2 style={{ fontSize: '26px' }}>2. Оплата</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="row" style={{ borderTop: 'none' }}>
                    <b>Аванс</b>
                    <p>
                      Минимальный аванс — 4 % стоимости бронирования (проживание и программа), округляется до евро.
                      Этого достаточно, чтобы санаторий подтвердил бронь. Точная сумма показана перед оплатой; можно
                      сразу оплатить всю сумму.
                    </p>
                  </div>
                  <div className="row">
                    <b>Остаток</b>
                    <p>
                      Оплачивается в санатории при заезде: наличными (евро), банковской картой или переводом заранее.
                    </p>
                  </div>
                  <div className="row">
                    <b>Карты</b>
                    <p>
                      Visa, Mastercard, Maestro любого банка, включая банки Израиля. Платёж проходит через Paysera;
                      данные карты мы не видим.
                    </p>
                  </div>
                  <div className="row">
                    <b>Валюта</b>
                    <p>Все цены в евро. Ваш банк конвертирует по своему курсу на день оплаты.</p>
                  </div>
                  <div className="row">
                    <b>Почему цены ниже</b>
                    <p>
                      Работаем с санаториями напрямую и получаем партнёрские тарифы. Цена на сайте — окончательная, без
                      сборов за бронирование.
                    </p>
                  </div>
                </div>
              </section>
              <section
                id="cancel"
                className="card"
                style={{
                  padding: '26px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  border: '2px solid #1F5F4A',
                }}
              >
                <h2 style={{ fontSize: '26px' }}>3. Отмена и перенос</h2>
                <p style={{ color: '#3E4B44' }}>
                  Сроки считаются от даты заезда. Отменить или перенести можно одним звонком или сообщением.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="row" style={{ borderTop: 'none' }}>
                    <b>
                      За <span className="ph">[N]</span> дней и раньше
                    </b>
                    <p>
                      <strong>Бесплатно.</strong> Аванс возвращаем на ту же карту или счёт в течение 5 рабочих дней.
                    </p>
                  </div>
                  <div className="row">
                    <b>
                      Менее чем за <span className="ph">[N]</span> дней
                    </b>
                    <p>Аванс не возвращается. Остальную сумму вы не платите, других штрафов нет.</p>
                  </div>
                  <div className="row">
                    <b>Незаезд без предупреждения</b>
                    <p>
                      Аванс не возвращается. Санаторий может удержать стоимость{' '}
                      <span className="ph">[первых суток]</span> при полной предоплате.
                    </p>
                  </div>
                  <div className="row">
                    <b>Перенос дат</b>
                    <p>
                      Бесплатно при наличии мест. Если новый период дороже — доплата по разнице, если дешевле — разницу
                      вернём.
                    </p>
                  </div>
                  <div className="row">
                    <b>Болезнь или форс-мажор</b>
                    <p>
                      С медицинской справкой аванс возвращаем полностью в любой срок. Рекомендуем оформить страховку
                      отмены поездки.
                    </p>
                  </div>
                  <div className="row">
                    <b>Досрочный выезд</b>
                    <p>
                      Неиспользованные дни санаторий возвращает по своим правилам —{' '}
                      <span className="ph">[уточнить по санаториям]</span>. Поможем договориться.
                    </p>
                  </div>
                </div>
              </section>
              <section
                id="stay"
                className="card"
                style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <h2 style={{ fontSize: '26px' }}>4. Заезд и проживание</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="row" style={{ borderTop: 'none' }}>
                    <b>Заезд и выезд</b>
                    <p>
                      Заезд с 14:00, выезд до 12:00. Если приезжаете рано — багаж примут на хранение, можно сразу пойти
                      на обед.
                    </p>
                  </div>
                  <div className="row">
                    <b>Документы</b>
                    <p>
                      Паспорт каждого гостя. Для лечения — желательно выписка от врача или список принимаемых лекарств.
                    </p>
                  </div>
                  <div className="row">
                    <b>Первый день лечения</b>
                    <p>
                      Консультация врача санатория в день приезда; процедуры назначаются с первого полного дня. День
                      приезда и день отъезда считаются одним лечебным днём.
                    </p>
                  </div>
                  <div className="row">
                    <b>Питание</b>
                    <p>Шведский стол. Диетические и кошерные варианты — по предварительной просьбе в заказе.</p>
                  </div>
                </div>
              </section>
              <section
                id="data"
                className="card"
                style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <h2 style={{ fontSize: '26px' }}>5. Ваши данные</h2>
                <p>
                  Имена, даты рождения и контакты гостей передаём только санаторию и перевозчику — для регистрации,
                  лечения и трансфера. Храним их <span className="ph">[срок]</span> и удаляем по вашей просьбе. Данные
                  карт не храним.
                </p>
              </section>
              <section
                id="contact"
                className="card"
                style={{
                  padding: '26px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  background: '#EEF5F1',
                  borderColor: '#C8DED3',
                }}
              >
                <h2 style={{ fontSize: '26px' }}>6. Как с нами связаться</h2>
                <p>Отвечаем на русском языке круглосуточно. Звоните, пишите в WhatsApp или на почту.</p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <a className="btn btn-primary" href="tel:+37060000000">
                    +370&nbsp;600 00000
                  </a>
                  <a className="btn btn-secondary" href="tel:+37060000001">
                    +370&nbsp;600 00001
                  </a>
                  <a className="btn btn-secondary" href="mailto:[EMAIL]">
                    [EMAIL]
                  </a>
                </div>
              </section>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <Link className="btn btn-secondary" to="/payment">
                  ← Вернуться к оплате
                </Link>
                <Link className="btn btn-primary" to="/">
                  На главную
                </Link>
              </div>
            </div>
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
            <div>© 2026</div>
          </div>
        </footer>
      </div>{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
