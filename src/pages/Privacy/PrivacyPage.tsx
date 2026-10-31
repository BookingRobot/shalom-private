import { Link } from 'react-router-dom';
import { ADDRESS, AGENCY, AGENCY_LICENSE, EMAIL, MAILTO, PHONE_DISPLAY, PHONE_TEL } from '../../data/contacts';
import { Brand, HeaderBar, MainNav, PhoneLink } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { DemoMark } from '../../components/DemoMark';
import { usePageTitle } from '../../lib/usePageTitle';
import '../Rules/RulesPage.css';
import './PrivacyPage.css';

/**
 * Privacy policy: who keeps the guests' data, what for, whom it goes to, how long, and how
 * to ask for it back or deleted. Written for GDPR (the data goes to Lithuania, EU) and the
 * Israeli Privacy Protection Law. Text to be approved by the agency's lawyer (launch checklist).
 */
export default function PrivacyPage() {
  usePageTitle('Политика конфиденциальности');
  return (
    <div className="page pg-rules pg-privacy">
      <HeaderBar>
        <Brand />
        <MainNav gap={32} />
        <PhoneLink />
      </HeaderBar>
      <main className="pv-main">
        <div className="pv-crumbs">
          <Link to="/">Главная</Link> › Политика конфиденциальности
        </div>
        <h1>Политика конфиденциальности</h1>
        <p className="pv-lead">
          Какие данные гостей мы получаем при заказе, зачем, кому передаём и как их можно получить обратно или удалить.
          <DemoMark> [ПОДТВЕРДИТЬ У ЮРИСТА]</DemoMark>
        </p>

        <section className="card pv-sec" id="who">
          <h2>1. Кто отвечает за ваши данные</h2>
          <p>
            Туристическое агентство {AGENCY}, {ADDRESS}
            {AGENCY_LICENSE ? <>, лицензия № {AGENCY_LICENSE}</> : null}. Телефон{' '}
            <a href={PHONE_TEL} dir="ltr">
              {PHONE_DISPLAY}
            </a>
            , e-mail <a href={MAILTO}>{EMAIL}</a>.
          </p>
        </section>

        <section className="card pv-sec" id="what">
          <h2>2. Какие данные и зачем</h2>
          <ul>
            <li>
              <b>Имена и фамилии, даты рождения</b> — для бронирования номера, регистрации в санатории и карты лечения у
              врача; для билетов — как в паспорте.
            </li>
            <li>
              <b>Телефон и e-mail</b> — чтобы прислать подтверждение, детали трансфера и связаться, если что-то
              изменится.
            </li>
            <li>
              <b>Данные о рейсе и месте встречи</b> — чтобы водитель встретил вас вовремя.
            </li>
            <li>
              <b>Данные карты</b> вводятся в защищённой форме платёжной системы. Мы их не видим и не храним.
            </li>
          </ul>
        </section>

        <section className="card pv-sec" id="to">
          <h2>3. Кому мы их передаём</h2>
          <p>Только тем, без кого поездка не состоится, и только то, что им нужно:</p>
          <ul>
            <li>санаторию в Литве — имена, даты рождения, даты заезда;</li>
            <li>авиакомпании — имена как в паспорте, даты рождения, контакты для билетов;</li>
            <li>перевозчику трансфера — имя контактного лица, телефон, рейс и место встречи;</li>
            <li>платёжной системе — сумму и номер заказа.</li>
          </ul>
          <p>
            Санатории находятся в Литве (Европейский союз). Данные передаются туда для исполнения вашего заказа. Мы не
            продаём данные и не передаём их для рекламы.
          </p>
        </section>

        <section className="card pv-sec" id="keep">
          <h2>4. Сколько храним</h2>
          <p>
            Пока действует заказ и затем столько, сколько требует закон об учёте и налогах
            <DemoMark> [СРОК ПОДТВЕРДИТЬ]</DemoMark>. Черновик заказа, который не был оплачен, удаляем через 90 дней.
          </p>
        </section>

        <section className="card pv-sec" id="rights">
          <h2>5. Ваши права</h2>
          <p>
            Вы можете узнать, какие данные о вас у нас есть, исправить их, попросить удалить или перестать их
            использовать — если закон не обязывает нас их хранить. Напишите на <a href={MAILTO}>{EMAIL}</a> или
            позвоните — ответим в течение 30 дней. Если вы не согласны с нашим ответом, можно обратиться в
            государственный орган по защите данных (в Израиле — Управление по защите частной информации, в Литве — State
            Data Protection Inspectorate).
          </p>
        </section>

        <section className="card pv-sec" id="cookies">
          <h2>6. Файлы cookie и статистика</h2>
          <p>
            Сайт не использует рекламные файлы cookie. Чтобы понять, на каком шаге гостям трудно, мы считаем посещения
            страниц без cookie и без личных данных (сервис Plausible). Ваш выбор на сайте хранится только в вашем
            браузере, пока открыта вкладка.
          </p>
        </section>

        <p className="pv-foot">
          См. также <Link to="/rules">условия бронирования, оплаты и отмены</Link>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
