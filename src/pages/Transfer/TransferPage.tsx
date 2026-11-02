import { HeaderBar, Brand, PhoneLink, HeaderAside } from '../../components/layout/SiteHeader';
import { CheckoutSteps } from '../../components/layout/CheckoutSteps';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { AdvanceNote, OrderSummary, orderPriceRows } from '../../components/OrderSummary';
import { StepNext, type Missing } from '../../components/StepNext';
import { InfoTitle } from '../../components/InfoTip';
import { orderSummary } from '../../lib/orderSummary';
import { toD } from '../../lib/dates';
import { usePageLogic } from '../../lib/pageLogic';
import { HelpWidget, type HelpContextInfo } from '../../components/HelpWidget';
import { FlightChoice } from '../../components/FlightChoice';
import { isFlightDay } from '../../data/flights';
import { usePageTitle } from '../../lib/usePageTitle';
import type { Booking } from '../../data/booking';
import { TransferLogic } from './transferLogic';
import { NeedQuestion } from './NeedQuestion';
import { HowItGoes, HowQuestion } from './HowQuestion';
import { CarsQuestion, FromQuestion } from './FromQuestion';
import { BackQuestion } from './BackQuestion';
import './TransferPage.css';

const HELP_CTX: HelpContextInfo = {
  hotel: 'Санаторий Эгле Комфорт, Друскининкай',
  in: '2026-11-09',
  out: '2026-11-18',
};

/** the flight question comes first in the bubble: until it is answered nothing else is asked */
function flightGaps(b: Booking): Missing[] {
  const flyDays = isFlightDay(toD(b.checkin)) && isFlightDay(toD(b.checkout));
  if (!b.flightAsked) return [{ label: 'как вы доберётесь до Литвы', target: '#flyChoice' }];
  if (b.flights === 'no' || b.flights === 'help' || (b.flightPackage && flyDays)) return [];
  if (b.flights === 'yes' || b.flightPackage)
    return [{ label: 'даты с нашим рейсом', target: document.getElementById('flyAlt') ? '#flyAlt' : '#flyChoice' }];
  return [{ label: 'как вы доберётесь до Литвы', target: '#flyChoice' }];
}

/**
 * Step 2 of 4 — «Дорога»: the flight, then the transfer question by question. Each question is
 * its own component; the answers and the prices live in TransferLogic.
 */
export default function TransferPage() {
  usePageTitle('Шаг 2 из 4 — дорога');
  const [v, logic] = usePageLogic(TransferLogic);
  const order = orderSummary(logic.props.booking.booking);
  return (
    <div className="page pg-transfer">
      <div className="tr-page">
        <HeaderBar>
          <Brand />
          <HeaderAside>
            <span className="hd-note">Нужна помощь с заказом?</span>
            <PhoneLink />
          </HeaderAside>
        </HeaderBar>
        <CheckoutSteps current={2} />
        <div className="tr-wrap">
          <div className="tr-main" data-canvas="transfer-main">
            {/* fewer words on the screen: the explanations wait under «i» next to the titles */}
            <div className="tr-title">
              <InfoTitle
                tag="h1"
                title="Дорога до санатория"
                info="Сначала перелёт, затем трансфер — от аэропорта до стойки регистрации санатория."
              />
            </div>
            <div data-canvas="transfer-flight">
              <FlightChoice />
            </div>
            <NeedQuestion v={v} />
            {v.need ? (
              <div className="card ios-in tr-card">
                <HowQuestion v={v} />
                {/* the rest opens once the guest has said how they go: less on the screen at first */}
                {v.howChosen ? (
                  <>
                    <HowItGoes v={v} />
                    <FromQuestion v={v} />
                    {v.isInd && v.cityChosen ? <CarsQuestion v={v} /> : null}
                    <BackQuestion v={v} />
                  </>
                ) : null}
              </div>
            ) : null}
            <StepNext
              back={{ to: '/rooms', label: '← Назад к номеру' }}
              next={{ to: '/guests', label: 'Далее: данные гостей →' }}
              info={
                <>
                  Итого: <strong>{v.total}</strong>
                </>
              }
              missing={() => [...flightGaps(logic.props.booking.booking), ...logic.gaps()]}
            />
          </div>
          {/* the order box (a laptop); on a phone the basket in the bottom bar opens it */}
          <OrderSummary
            details={[
              ['Даты', order.dates],
              ['Номер', order.roomName],
              ['Программа', order.programName, order.programPerDay],
              ['Гости', order.guests],
            ]}
            prices={orderPriceRows(order)}
            total={v.total}
            footer={<AdvanceNote order={order} />}
          />
        </div>
        <SiteFooter />
      </div>
      <HelpWidget ctx={HELP_CTX} />
    </div>
  );
}
