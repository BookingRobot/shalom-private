import { InfoTitle } from '../InfoTip';

const PLANE = 'M2 20h20M3.5 15.5l16-5.5a2 2 0 0 0-1.3-3.8l-4.7 1.6L7 4 5 4.7l3.8 4.7-3.6 1.2L3 9l-1.5.5z';

/**
 * What the colours of the date calendar mean — one quiet line under the two months (two
 * columns on a phone). The flight days explanation waits under «i».
 */
export function CalLegend() {
  return (
    <div className="cal-legend">
      <span className="lg">
        <i style={{ background: '#E9F4EC', border: '1px solid #C8DED3' }} />
        дешевле
      </span>
      <span className="lg">
        <i style={{ background: '#FFF6E3', border: '1px solid #F0DDB8' }} />
        обычная цена
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
        нет мест
      </span>
      <span className="lg lg-fly">
        <InfoTitle
          title={
            <span className="lg-fly-t">
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
                <path d={PLANE} />
              </svg>
              рейсы из Израиля: вт, чт, вс
            </span>
          }
          info={
            <>
              Прямые рейсы Тель-Авив ⇄ Вильнюс выполняют <strong>Israir</strong> и <strong>Arkia</strong> (с осени —
              также Wizz Air). В дни с самолётиком удобнее всего заезжать и уезжать: трансфер встретит прямо в
              аэропорту. Расписание рейсов уточняйте у авиакомпании [ПОДТВЕРДИТЬ ДНИ].
            </>
          }
        />
      </span>
    </div>
  );
}
