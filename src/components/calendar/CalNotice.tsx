/**
 * Pop-up note above the calendar's confirm row: "В этот период нет мест …".
 * Slides in; the guest can close it or send a request to a consultant instead.
 */
export function CalNotice({ text, onClose, onAsk }: { text: string; onClose: () => void; onAsk?: () => void }) {
  return (
    <div className="cal-note" role="alert">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--warn-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flex: 'none' }}
      >
        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      </svg>
      <span className="cal-note-t">{text}</span>
      {onAsk ? (
        <button type="button" className="cal-note-ask" onClick={onAsk}>
          Отправить запрос
        </button>
      ) : null}
      <button type="button" className="cal-note-x" onClick={onClose} aria-label="Скрыть сообщение">
        ✕
      </button>
    </div>
  );
}
