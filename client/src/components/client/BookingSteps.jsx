import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChair, faClock, faFilm, faCreditCard, faTicket } from '@fortawesome/free-solid-svg-icons';

const steps = [
  ['Phim', faFilm],
  ['Lịch Chiếu', faClock],
  ['Ghế & Combo', faChair],
  ['Thanh Toán', faCreditCard],
  ['Vé', faTicket]
];

export default function BookingSteps({ current = 1 }) {
  return (
    <div className="mx-auto mb-8 grid max-w-3xl grid-cols-5 overflow-hidden rounded-full border border-brand-pearl/15 bg-brand-black/10 p-1 shadow-[0_10px_30px_rgba(1,1,1,0.05)] dark:bg-brand-black/20 backdrop-blur-xl">
      {steps.map(([label, icon], index) => {
        const step = index + 1;
        const active = step <= current;
        return (
          <div key={label} className={`flex min-w-0 items-center justify-center gap-1.5 rounded-full py-2.5 text-[10px] sm:text-xs font-extrabold ${active ? 'bg-brand-studio text-white shadow-[0_4px_18px_rgba(95,67,178,0.35)]' : 'text-brand-pearl/70'}`}>
            <FontAwesomeIcon icon={icon} />
            <span className="truncate hidden sm:inline">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
