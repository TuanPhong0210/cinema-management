import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faSackDollar, faTicket, faUserClock, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { gqlRequest } from '../../services/graphql';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => { gqlRequest(`query { dashboard { totalMovies totalShowtimes totalTicketsSold employeesOnShift revenue } }`).then((d) => setData(d.dashboard)); }, []);
  const cards = [
    ['Movies', data?.totalMovies ?? 0, faFilm],
    ['Showtimes', data?.totalShowtimes ?? 0, faVideo],
    ['Tickets Sold', data?.totalTicketsSold ?? 0, faTicket],
    ['On Shift', data?.employeesOnShift ?? 0, faUserClock],
    ['Revenue', `${Number(data?.revenue ?? 0).toLocaleString()} VND`, faSackDollar]
  ];
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live cinema operating summary" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, icon]) => (
          <div key={label} className="panel">
            <FontAwesomeIcon icon={icon} className="mb-4 text-2xl text-cinema-700" />
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-cinema-950">{value}</p>
          </div>
        ))}
      </div>
    </>
  );
}

