import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm } from '@fortawesome/free-solid-svg-icons';

export default function EmptyState({ title, text }) {
  return (
    <div className="rounded-[18px] border border-dashed border-brand-pearl/25 bg-brand-black/20 px-6 py-12 text-center backdrop-blur-xl">
      <FontAwesomeIcon icon={faFilm} className="text-3xl text-brand-studio" />
      <h3 className="mt-3 text-lg font-extrabold text-brand-peach">{title}</h3>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-brand-pearl">{text}</p>}
    </div>
  );
}
