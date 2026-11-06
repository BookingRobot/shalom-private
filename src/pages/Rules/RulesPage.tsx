import { Link } from 'react-router-dom';
import { ADDRESS, AGENCY, EMAIL, MAILTO, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '../../data/contacts';
import { HeaderBar, Brand, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { PageLogic, usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { usePageTitle } from '../../lib/usePageTitle';
import './RulesPage.css';

const HELP_CTX: HelpContextInfo = {};

/** the page keeps no state of its own: the order comes from the shared booking */
class RulesLogic extends PageLogic<Record<string, never>> {
  renderVals(): Record<string, never> {
    return {};
  }
}

export default function RulesPage() {
  usePageTitle('Условия бронирования, оплаты и отмены');
  const [, logic] = usePageLogic(RulesLogic);
  return (
    <div className="page pg-rules">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <HeaderBar>
          <Brand />
          <MainNav gap={32} active="rules" />
          <PhoneLink />
        </HeaderBar>
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
            <div style={{ fontSize: '16px', color: 'var(--ink-2)' }}>
              <Link to="/">Главная</Link> › Условия
            </div>
            <h1 style={{ fontSize: '32px' }}>Условия бронирования, оплаты и отмены</h1>
            <p style={{ color: 'var(--ink-2)', fontSize: '18px' }}>
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
                <h2 style={{ fontSize: '23px' }}>1. Как проходит заказ</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="row" style={{ borderTop: 'none' }}>
                    <b>Вы оформляете заказ</b>
                    <p>Выбираете санаторий, номер, даты, трансфер и вводите имена гостей. Это занимает 5–7 минут.</p>
                  </div>
                  <div className="row">
                    <b>Мы подтверждаем места</b>
                    <p>
                      В течение 24 часов проверяем наличие в санатории и присылаем подтверждение на почту и в WhatsApp.
                    </p>
                  </div>
                  <div className="row">
                    <b>Вы вносите депозит</b>
                    <p>Картой на сайте или банковским переводом. После депозита номер и цена закреплены за вами.</p>
                  </div>
                  <div className="row">
                    <b>Ваучер и памятка</b>
                    <p>
                      За 7 дней до заезда присылаем ваучер, адрес санатория, время трансфера и памятку: что взять с
                      собой.
                    </p>
                  </div>
                </div>
              </section>
              <section
                id="pay"
                className="card"
                style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <h2 style={{ fontSize: '23px' }}>2. Оплата</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="row" style={{ borderTop: 'none' }}>
                    <b>Депозит</b>
                    <p>
                      35 € с человека за санаторий; если в заказе перелёт — ещё 100 € с человека за билеты. После
                      депозита цена зафиксирована и больше не меняется. Можно сразу оплатить всю сумму.
                    </p>
                  </div>
                  <div className="row">
                    <b>Остаток</b>
                    <p>
                      Оплачивается за 3 месяца до заезда (если до заезда меньше — за 7 дней), картой или переводом. Дата
                      и сумма указаны на шаге оплаты и в подтверждении. Санатории, которые сами встречают гостей
                      (например, Эгле), принимают остаток за проживание при заезде — это тоже видно на шаге оплаты. Если
                      до заезда меньше недели — оплата сразу всей суммы.
                    </p>
                  </div>
                  <div className="row">
                    <b>Карты</b>
                    <p>
                      Visa, Mastercard, Isracard и Amex любого банка, включая банки Израиля. Платёж проходит через
                      защищённую платёжную систему Tranzila; данные карты мы не видим.
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
                  border: '2px solid var(--green)',
                }}
              >
                <h2 style={{ fontSize: '23px' }}>3. Отмена и перенос</h2>
                <p style={{ color: 'var(--ink-2)' }}>
                  Сроки считаются от даты заезда. Отменить или перенести можно одним звонком или сообщением.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="row" style={{ borderTop: 'none' }}>
                    <b>До даты оплаты остатка</b>
                    <p>
                      <strong>Бесплатно.</strong> Депозит возвращаем на ту же карту или счёт в течение 5 рабочих дней.
                    </p>
                  </div>
                  <div className="row">
                    <b>После даты оплаты остатка</b>
                    <p>
                      Депозит не возвращается. Остаток возвращаем за вычетом того, что санаторий удерживает по своим
                      правилам, — заранее подскажем сумму.
                    </p>
                  </div>
                  <div className="row">
                    <b>Незаезд без предупреждения</b>
                    <p>
                      Депозит не возвращается. Санаторий может удержать стоимость первых суток при полной предоплате.
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
                      С медицинской справкой депозит возвращаем полностью в любой срок. Рекомендуем оформить страховку
                      отмены поездки.
                    </p>
                  </div>
                  <div className="row">
                    <b>Досрочный выезд</b>
                    <p>
                      Неиспользованные дни санаторий возвращает по своим правилам — заранее уточним их для вашего
                      санатория и поможем договориться.
                    </p>
                  </div>
                </div>
              </section>
              <section
                id="stay"
                className="card"
                style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <h2 style={{ fontSize: '23px' }}>4. Заезд и проживание</h2>
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
                <h2 style={{ fontSize: '23px' }}>5. Ваши данные</h2>
                <p>
                  Имена, даты рождения и контакты гостей передаём только санаторию и перевозчику — для регистрации,
                  лечения и трансфера. Удаляем по вашей просьбе, данные карт не храним. Подробно — в{' '}
                  <Link to="/privacy">политике конфиденциальности</Link>.
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
                  background: 'var(--green-soft)',
                  borderColor: 'var(--green-line)',
                }}
              >
                <h2 style={{ fontSize: '23px' }}>6. Как с нами связаться</h2>
                <p>
                  Заказы, оплату и билеты оформляет туристическое агентство {AGENCY}. Отвечаем на русском языке —
                  звоните, пишите в WhatsApp или на почту.
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <a className="btn btn-primary" href={PHONE_TEL} dir="ltr">
                    {PHONE_DISPLAY}
                  </a>
                  <a className="btn btn-secondary" href={WHATSAPP_URL}>
                    WhatsApp
                  </a>
                  <a className="btn btn-secondary" href={MAILTO}>
                    {EMAIL}
                  </a>
                </div>
                <p style={{ margin: 0 }}>Офис: {ADDRESS}</p>
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
        <SiteFooter right={<div>© 2026</div>} />
      </div>{' '}
      <HelpWidget ctx={HELP_CTX} pageState={logic.state} />
    </div>
  );
}
