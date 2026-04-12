import React, { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiSearch, FiPrinter } from 'react-icons/fi';

const BillingPage = () => {
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [foodBill, setFoodBill] = useState(null);
  const [serviceBills, setServiceBills] = useState({});
  const [loading, setLoading] = useState(false);

  const searchGuests = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { data } = await API.get('/bookings');
      const filtered = data.filter(b =>
        b.guestName.toLowerCase().includes(search.toLowerCase()) ||
        b.roomNumber?.includes(search) ||
        b.guestPhone?.includes(search)
      );
      setBookings(filtered);
      if (filtered.length === 0) toast.error('No guest found');
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const loadInvoice = async (booking) => {
    setSelected(booking);
    setLoading(true);
    try {
      // Food bill
      const { data: fb } = await API.get(`/food/bill/${booking.roomNumber}`);
      setFoodBill(fb);

      // Service bookings for this guest (by phone)
      const serviceTypes = ['dine', 'garden', 'pool', 'party', 'laundry'];
      const results = {};
      for (const type of serviceTypes) {
        const { data } = await API.get(`/${type}`);
        const guestServices = data.filter(s =>
          s.guestPhone === booking.guestPhone ||
          s.roomNumber === booking.roomNumber
        );
        if (guestServices.length > 0) results[type] = guestServices;
      }
      setServiceBills(results);
    } catch { toast.error('Failed to load bill details'); }
    finally { setLoading(false); }
  };

  const calcNights = (checkIn, checkOut) => {
    const a = new Date(checkIn);
    const b = checkOut ? new Date(checkOut) : new Date();
    return Math.max(1, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
  };

  const roomCharge = selected
    ? calcNights(selected.checkIn, selected.checkOut) * (selected.room?.price || 0)
    : 0;

  const foodCharge = foodBill?.totalBill || 0;

  const serviceCharge = Object.values(serviceBills)
    .flat()
    .filter(s => s.status !== 'cancelled')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const grandTotal = roomCharge + foodCharge + serviceCharge;
  const balance = grandTotal - (selected?.advancePaid || 0);

  const printInvoice = () => window.print();

  const SERVICE_LABELS = { dine: '🥂 Dine Inn', garden: '🌿 Garden Inn', pool: '🏊 Pool Inn', party: '🎉 Party Inn', laundry: '👕 Laundry Inn' };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-hotel-dark">🧾 Billing & Invoice</h1>
          <p className="text-gray-500 mt-1">Generate full guest invoice</p>
        </div>
        {selected && (
          <button onClick={printInvoice} className="btn-outline flex items-center gap-2">
            <FiPrinter /> Print Invoice
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card mb-6 max-w-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">Search Guest</label>
        <div className="flex gap-3">
          <input className="input-field" placeholder="Name / Room No. / Phone"
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchGuests()} />
          <button onClick={searchGuests} className="btn-gold flex items-center gap-2 whitespace-nowrap">
            <FiSearch /> Search
          </button>
        </div>
        {bookings.length > 0 && !selected && (
          <div className="mt-3 space-y-2">
            {bookings.map(b => (
              <button key={b._id} onClick={() => loadInvoice(b)}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-hotel-gold hover:bg-yellow-50 transition">
                <span className="font-semibold text-hotel-dark">{b.guestName}</span>
                <span className="text-gray-500 text-sm ml-2">Room {b.roomNumber} · {b.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Invoice */}
      {selected && !loading && (
        <div id="invoice" className="card max-w-2xl print:shadow-none">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-start">
            <div>
              <h2 className="font-serif text-2xl font-bold text-hotel-dark">🏨 Hotel Inn</h2>
              <p className="text-gray-500 text-sm">Tax Invoice</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p>Invoice #: {selected._id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Guest info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Guest</p>
              <p className="font-semibold text-hotel-dark text-base">{selected.guestName}</p>
              <p className="text-gray-600">{selected.guestPhone}</p>
              {selected.guestEmail && <p className="text-gray-600">{selected.guestEmail}</p>}
            </div>
            <div>
              <p className="text-gray-500 mb-1">Stay Details</p>
              <p className="font-semibold text-hotel-dark">Room {selected.roomNumber}</p>
              <p className="text-gray-600">Check-in: {new Date(selected.checkIn).toLocaleDateString('en-IN')}</p>
              <p className="text-gray-600">
                Check-out: {selected.checkOut ? new Date(selected.checkOut).toLocaleDateString('en-IN') : 'Ongoing'}
              </p>
              <p className="text-gray-600">{calcNights(selected.checkIn, selected.checkOut)} night(s)</p>
            </div>
          </div>

          {/* Room charges */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">🏨 Room Charges</h3>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex justify-between text-sm">
                <span>{selected.room?.type || 'Room'} × {calcNights(selected.checkIn, selected.checkOut)} nights @ ₹{selected.room?.price}/night</span>
                <span className="font-semibold">₹{roomCharge}</span>
              </div>
            </div>
          </div>

          {/* Food charges */}
          {foodBill && foodBill.orders.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">🍽️ Food & Room Service</h3>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {foodBill.orders.map((order, idx) => (
                  <div key={order._id} className="text-sm">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-0.5">
                        <span className="text-gray-600">{item.name} × {item.quantity}</span>
                        <span>₹{item.total}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                  <span>Food Total</span>
                  <span>₹{foodCharge}</span>
                </div>
              </div>
            </div>
          )}

          {/* Service charges */}
          {Object.keys(serviceBills).length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">🛎️ Other Services</h3>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {Object.entries(serviceBills).map(([type, items]) =>
                  items.filter(s => s.status !== 'cancelled').map(s => (
                    <div key={s._id} className="flex justify-between text-sm py-0.5">
                      <span className="text-gray-600">
                        {SERVICE_LABELS[type]} — {new Date(s.date).toLocaleDateString('en-IN')}
                        {s.eventName ? ` (${s.eventName})` : ''}
                      </span>
                      <span>₹{s.amount}</span>
                    </div>
                  ))
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                  <span>Services Total</span>
                  <span>₹{serviceCharge}</span>
                </div>
              </div>
            </div>
          )}

          {/* Total summary */}
          <div className="border-t-2 border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>₹{grandTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Advance Paid</span><span>— ₹{selected.advancePaid || 0}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-hotel-dark pt-2 border-t border-gray-200">
              <span>Balance Due</span>
              <span className="text-hotel-gold">₹{balance}</span>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">Thank you for staying with us! 🙏</p>

          <button onClick={() => { setSelected(null); setBookings([]); setSearch(''); }}
            className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 underline">
            ← Search another guest
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-hotel-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default BillingPage;
