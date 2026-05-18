import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCouch } from '@fortawesome/free-solid-svg-icons';

export default function SeatMap({ seats, selected = [], onToggle }) {
  const grouped = seats.reduce((acc, item) => {
    const seat = item.seat || item;
    acc[seat.rowLabel] = acc[seat.rowLabel] || [];
    acc[seat.rowLabel].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="mx-auto mb-6 max-w-lg text-center">
        <div className="h-2 rounded-full bg-brand-black shadow-[0_12px_30px_rgba(95,67,178,0.35)] dark:bg-brand-studio" />
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-pearl">Screen</p>
      </div>
      {Object.entries(grouped).map(([row, rowSeats]) => (
        <div key={row} className="flex items-center justify-center gap-2">
          <span className="w-6 text-sm font-bold text-brand-pearl">{row}</span>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${rowSeats.length}, minmax(34px, 1fr))` }}>
            {rowSeats.map((item) => {
              const seat = item.seat || item;
              const booked = item.status === 'booked';
              const active = selected.includes(String(item.id));
              const color = booked ? 'bg-pink-500 text-white opacity-80' : active ? 'bg-brand-studio text-brand-peach shadow-md shadow-brand-pearl' : 'bg-brand-pearl/15 text-brand-pearl hover:bg-brand-studio/30 hover:text-brand-peach';
              return (
                <button key={item.id} disabled={booked || !onToggle} onClick={() => onToggle?.(String(item.id))} className={`grid h-9 w-9 place-items-center rounded-md text-xs transition focus:outline-none focus:ring-2 focus:ring-brand-studio ${color}`} title={seat.seatCode}>
                  <FontAwesomeIcon icon={faCouch} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap justify-center gap-4 pt-4 text-xs text-brand-pearl">
        <span><i className="mr-2 inline-block h-3 w-3 rounded bg-brand-pearl/25" />Available</span>
        <span><i className="mr-2 inline-block h-3 w-3 rounded bg-pink-500" />Booked</span>
        <span><i className="mr-2 inline-block h-3 w-3 rounded bg-brand-studio" />Selected</span>
      </div>
    </div>
  );
}
