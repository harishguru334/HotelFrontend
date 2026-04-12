import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

const STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full',
};

const LAUNDRY_ITEMS = [
  { item: 'Shirt', price: 30 },
  { item: 'Trouser', price: 40 },
  { item: 'Saree', price: 80 },
  { item: 'Kurta', price: 50 },
  { item: 'Bedsheet', price: 100 },
  { item: 'Towel', price: 30 },
  { item: 'Suit/Blazer', price: 150 },
  { item: 'Jeans', price: 50 },
];

const ServiceInn = ({ serviceType, title, emoji, fields = [] }) => {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('new');
  const [form, setForm] = useState({
    guestName: '', guestPhone: '', roomNumber: '',
    date: '', timeSlot: '', numberOfGuests: 1,
    duration: 1, amount: 0, notes: '',
    eventName: '', occasion: '',
    laundryItems: [{ item: '', quantity: 1, price: 0 }]
  });
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get(`/${serviceType}`);
      setBookings(data);
    } catch { toast.error('Failed to load'); }
  };

  useEffect(() => { fetchBookings(); }, [serviceType]);

  const laundryTotal = form.laundryItems.reduce((s, i) => s + (i.price * i.quantity), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (serviceType === 'laundry') payload.amount = laundryTotal;
      await API.post(`/${serviceType}`, payload);
      toast.success('Booking confirmed!');
      setForm({
        guestName: '', guestPhone: '', roomNumber: '',
        date: '', timeSlot: '', numberOfGuests: 1,
        duration: 1, amount: 0, notes: '',
        eventName: '', occasion: '',
        laundryItems: [{ item: '', quantity: 1, price: 0 }]
      });
      fetchBookings();
      setTab('list');
    } catch { toast.error('Booking failed'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/${serviceType}/${id}/status`, { status });
      toast.success('Status updated');
      fetchBookings();
    } catch { toast.error('Update failed'); }
  };

  const addLaundryItem = () => setForm({ ...form, laundryItems: [...form.laundryItems, { item: '', quantity: 1, price: 0 }] });
  const updateLaundry = (i, field, value) => {
    const updated = [...form.laundryItems];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'item') {
      const found = LAUNDRY_ITEMS.find(l => l.item === value);
      if (found) updated[i].price = found.price;
    }
    setForm({ ...form, laundryItems: updated });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-hotel-dark">{emoji} {title}</h1>
        <p className="text-gray-500 mt-1">{title} booking management</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[['new', '+ New Booking'], ['list', 'All Bookings']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === key ? 'border-hotel-gold text-hotel-gold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'new' && (
        <div className="max-w-lg">
          <div className="card">
            <h2 className="text-xl font-serif font-semibold mb-5">New {title} Booking</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                  <input className="input-field" required placeholder="Full name"
                    value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input className="input-field" required placeholder="9876543210"
                    value={form.guestPhone} onChange={e => setForm({ ...form, guestPhone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room No.</label>
                  <input className="input-field" placeholder="e.g. 101"
                    value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input className="input-field" type="date" required
                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>

              {/* Time slot for dine/pool/garden/party */}
              {serviceType !== 'laundry' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                    <select className="input-field" value={form.timeSlot} onChange={e => setForm({ ...form, timeSlot: e.target.value })}>
                      <option value="">Select time</option>
                      {['07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. of Guests</label>
                    <input className="input-field" type="number" min="1"
                      value={form.numberOfGuests} onChange={e => setForm({ ...form, numberOfGuests: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Event name for party */}
              {serviceType === 'party' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                  <input className="input-field" placeholder="Birthday Party, Anniversary..."
                    value={form.eventName} onChange={e => setForm({ ...form, eventName: e.target.value })} />
                </div>
              )}

              {/* Occasion for garden/pool */}
              {(serviceType === 'garden' || serviceType === 'pool') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                  <input className="input-field" placeholder="Leisure, Family outing..."
                    value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })} />
                </div>
              )}

              {/* Laundry items */}
              {serviceType === 'laundry' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Laundry Items</label>
                  <div className="space-y-2">
                    {form.laundryItems.map((li, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <select className="input-field flex-1" value={li.item} onChange={e => updateLaundry(i, 'item', e.target.value)}>
                          <option value="">Select item</option>
                          {LAUNDRY_ITEMS.map(l => <option key={l.item} value={l.item}>{l.item} — ₹{l.price}</option>)}
                        </select>
                        <input type="number" min="1" className="input-field w-16" value={li.quantity}
                          onChange={e => updateLaundry(i, 'quantity', parseInt(e.target.value))} />
                        <span className="text-sm font-semibold text-hotel-gold w-16 text-right">₹{li.price * li.quantity}</span>
                        <button type="button" onClick={() => setForm({ ...form, laundryItems: form.laundryItems.filter((_, idx) => idx !== i) })}
                          className="text-red-400"><FiTrash2 /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addLaundryItem}
                    className="mt-2 flex items-center gap-1 text-sm text-hotel-gold hover:underline">
                    <FiPlus /> Add Item
                  </button>
                  <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-hotel-gold text-lg">₹{laundryTotal}</span>
                  </div>
                </div>
              )}

              {/* Amount for non-laundry */}
              {serviceType !== 'laundry' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input className="input-field" type="number" placeholder="0"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="input-field" rows={2} placeholder="Special requests..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>

              <button type="submit" disabled={loading} className="btn-gold w-full py-3">
                {loading ? 'Booking...' : `✓ Confirm ${title} Booking`}
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No {title} bookings yet</div>
          ) : bookings.map(b => (
            <div key={b._id} className="card border border-gray-100">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-hotel-dark">{b.guestName}</h3>
                  <p className="text-sm text-gray-500">{b.guestPhone} {b.roomNumber && `· Room ${b.roomNumber}`}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    📅 {new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {b.timeSlot && ` · ${b.timeSlot}`}
                    {b.numberOfGuests > 1 && ` · ${b.numberOfGuests} guests`}
                  </p>
                  {b.eventName && <p className="text-sm text-gray-500">🎉 {b.eventName}</p>}
                  {b.occasion && <p className="text-sm text-gray-500">✨ {b.occasion}</p>}
                  {b.notes && <p className="text-sm text-gray-400 italic mt-1">"{b.notes}"</p>}
                  {/* Laundry items summary */}
                  {b.laundryItems?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {b.laundryItems.filter(l => l.item).map((l, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{l.item} × {l.quantity}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xl font-bold text-hotel-gold">₹{b.amount}</span>
                  <select value={b.status} onChange={e => updateStatus(b._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-hotel-gold">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceInn;
