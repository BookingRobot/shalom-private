import { Link } from 'react-router-dom';
import { usePageTitle } from '../../lib/usePageTitle';
import './ScreensPage.css';

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: 'Поиск и выбор санатория',
    items: [
      ['1 · Главная и поиск', '/'],
      ['2 · Результаты (Друскининкай)', '/results'],
      ['3 · Санаторий и выбор номера', '/hotel'],
      ['Шаг 1 · Номер и программа', '/rooms'],
    ],
  },
  {
    title: 'Оформление заказа',
    items: [
      ['Шаг 2 · Дорога: перелёт и трансфер', '/transfer'],
      ['Шаг 3 · Данные гостей', '/guests'],
      ['Шаг 4 · Оплата', '/payment'],
      ['🏁 Финиш · Заказ принят', '/done'],
    ],
  },
  {
    title: 'Справочные экраны',
    items: [
      ['Справка · Условия и отмена', '/rules'],
      ['Справка · Форма «Свяжитесь со мной»', '/?help=1'],
    ],
  },
];

/** Overview of all screens — handy for reviewing the purchase path. */
export default function ScreensPage() {
  usePageTitle('Все экраны');
  return (
    <main className="screens">
      <h1>Санатории Литвы — путь покупки</h1>
      <p>
        Интерактивный прототип сайта бронирования санаториев для русскоязычных гостей из Израиля. Все экраны
        кликабельны; цены, наличие и рейсы — примерные данные.
      </p>
      <Link className="start" to="/">
        Начать с главной →
      </Link>
      {GROUPS.map((g) => (
        <section key={g.title}>
          <h2>{g.title}</h2>
          <div className="grid">
            {g.items.map(([name, to]) => (
              <a className="card" href={to} key={to}>
                <span className="name">{name}</span>
                <span className="url">{to}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
