import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { gqlRequest } from '../../services/graphql';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const load = () => gqlRequest(`query { tickets { id totalPrice status seats { seatCode price } showtime { showDate startTime movie { title } room { name } } } }`).then((d) => setTickets(d.tickets));
  useEffect(() => {
    load();
  }, []);
  const update = async (id, status) => { await gqlRequest(`mutation($id:ID!,$status:String!){ updateTicketStatus(id:$id,status:$status){ id } }`, { id, status }); load(); };
  return (
    <>
      <PageHeader title="Tickets" subtitle="Review bookings and update ticket status" />
      <div className="panel overflow-auto">
        <table className="w-full">
          <thead><tr><th className="table-th">Movie</th><th className="table-th">Showtime</th><th className="table-th">Room</th><th className="table-th">Seats</th><th className="table-th">Price</th><th className="table-th">Status</th></tr></thead>
          <tbody>{tickets.map((t) => <tr key={t.id}><td className="table-td font-semibold">{t.showtime?.movie?.title}</td><td className="table-td">{t.showtime?.showDate} {t.showtime?.startTime}</td><td className="table-td">{t.showtime?.room?.name}</td><td className="table-td">{t.seats.map((s) => s.seatCode).join(', ')}</td><td className="table-td">{Number(t.totalPrice).toLocaleString()}</td><td className="table-td"><select className="input" value={t.status} onChange={(e) => update(t.id, e.target.value)}><option>booked</option><option>paid</option><option>cancelled</option></select></td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

