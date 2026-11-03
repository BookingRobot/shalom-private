/**
 * Russian texts — the source every other language is translated from. Grouped by where they
 * appear. Pages move their texts here block by block (docs/i18n.md shows how); a text that
 * is still written in a page's JSX is Russian-only until it moves.
 */
export const ru = {
  nav: {
    resorts: 'Курорты',
    flights: 'Прямые перелёты',
    pay: 'Как оплатить',
    rules: 'Условия',
    contacts: 'Контакты',
    menu: 'Меню',
    close: 'Закрыть',
    mainMenu: 'Основное меню',
    consult: 'Консультация на русском',
    whatsapp: 'Написать в WhatsApp',
    language: 'Язык сайта',
  },
  steps: {
    aria: 'Шаги оформления',
    step: 'Шаг {n}',
    stepOf: 'Шаг {n} из {total}',
    labels: {
      rooms: 'Номер',
      transfer: 'Дорога',
      guests: 'Гости',
      payment: 'Оплата',
      done: 'Готово',
    },
    needRoom: 'Сначала выберите санаторий и номер',
    needProgram: 'Сначала выберите номер и программу',
    needRoad: 'Сначала ответьте на вопросы о дороге',
    needGuests: 'Сначала заполните данные гостей',
    notPaid: 'Заказ ещё не оплачен',
  },
  async: {
    loading: 'Загружаем…',
    noNetwork: 'Нет связи с сервером',
    failed: 'Не удалось загрузить',
    gone: 'Такой страницы или заказа больше нет.',
    tryAgain: 'Проверьте интернет и попробуйте ещё раз. Если не помогает — позвоните нам.',
    retry: 'Повторить',
    empty: 'Пока ничего нет.',
  },
  order: {
    title: 'Ваш заказ',
    opening: 'Открываем ваш заказ…',
    openingCode: 'Открываем заказ {code}…',
    badCode: 'Код заказа не распознан',
    badCodeHelp: 'Код состоит из 5 букв и цифр, например K7F2M. Проверьте ссылку или позвоните нам.',
    home: 'На главную',
  },
  footer: {
    helpTitle: 'Поможем выбрать',
    helpSub: 'Подскажем санаторий и программу, объясним условия — на русском языке',
    callMe: 'Свяжитесь со мной',
    hours: 'Ежедневно с 9:00 до 20:00',
  },
  legal: {
    privacy: 'Политика конфиденциальности',
    terms: 'Условия бронирования',
    cookies: 'Файлы cookie',
  },
};
