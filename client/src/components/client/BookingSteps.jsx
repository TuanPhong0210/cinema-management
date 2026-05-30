import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChair, faCheck, faClock, faFilm } from '@fortawesome/free-solid-svg-icons';

const steps = [
  ['Movie', faFilm],
  ['Showtime', faClock],
  ['Seats', faChair],
  ['Done', faCheck]
];

export default function BookingSteps({ current = 1 }) {
  return (
    <div className="mx-auto mb-8 grid max-w-2xl grid-cols-4 overflow-hidden rounded-full border border-brand-pearl/15 bg-brand-black/20 p-1 shadow-[0_18px_50px_rgba(1,1,1,0.2)] backdrop-blur-xl">
      {steps.map(([label, icon], index) => {
        const step = index + 1;
        const active = step <= current;
        return (
          <div key={label} className={`flex min-w-0 items-center justify-center gap-2 rounded-full px-2 py-2.5 text-xs font-bold sm:text-sm ${active ? 'bg-brand-studio/90 text-brand-peach shadow-[0_0_22px_rgba(95,67,178,0.42)]' : 'text-brand-pearl/70'}`}>
            <FontAwesomeIcon icon={icon} />
            <span className="truncate">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
