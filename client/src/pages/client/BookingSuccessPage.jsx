import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faHouse } from '@fortawesome/free-solid-svg-icons';
import { Link, useParams } from 'react-router-dom';
import BookingSteps from '../../components/client/BookingSteps';

export default function BookingSuccessPage() {
  const { ticketId } = useParams();
  return (
    <>
      <BookingSteps current={4} />
      <div className="client-surface mx-auto max-w-lg rounded-[24px] p-8 text-center">
        <FontAwesomeIcon icon={faCircleCheck} className="text-5xl text-brand-studio" />
        <h1 className="mt-4 text-2xl font-extrabold text-brand-peach">Booking Confirmed</h1>
        <p className="mt-2 text-brand-pearl">Ticket #{ticketId} has been created. Your selected seats are now marked as booked.</p>
        <Link to="/" className="client-btn mt-6 px-5 py-3 text-sm"><FontAwesomeIcon icon={faHouse} /> Back to Movies</Link>
      </div>
    </>
  );
}
