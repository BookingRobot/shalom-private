/**
 * Phone: the order box of a step lives behind the basket in the bottom bar. The bar asks the box to
 * open (BASKET_OPEN); the box's «Продолжить» asks the step to go on (BASKET_NEXT), the same as «Далее».
 */
export const BASKET_OPEN = 'br:basket-open';
export const BASKET_NEXT = 'br:basket-next';
export const openBasket = () => window.dispatchEvent(new Event(BASKET_OPEN));
export const basketNext = () => window.dispatchEvent(new Event(BASKET_NEXT));
