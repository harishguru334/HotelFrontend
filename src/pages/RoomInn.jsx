import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiLogIn, FiLogOut, FiSearch } from 'react-icons/fi';

const EMPTY_FORM = { guestName: '', guestPhone: '', guestEmail: '', room: '', checkIn: '', advancePaid: 0, notes: '' };

const RoomInn = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('rooms'); // rooms | checkin | active
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchAll = async () => {
    try {
      const [rRes, bRes] = await Promise.all([API.get('/rooms'), API.get('/bookings')]);
      setRooms(rRes.data);
      setBookings(bRes.data);
    } catch { toast.error('Failed to load data'); }
  };

  useEffect(() => { fetchAll(); }, []);

  const availableRooms = rooms.filter(r => r.status === 'available');

  const handleCheckin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/bookings', form);
      toast.success(`${form.guestName} checked in successfully!`);
      setForm(EMPTY_FORM);
      fetchAll();
      setTab('active');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally { setLoading(false); }
  };

  const handleCheckout = async () => {
    try {
      await API.patch(`/bookings/${checkoutModal._id}/checkout`, { totalAmount });
      toast.success('Check-out successful!');
      setCheckoutModal(null);
      fetchAll();
    } catch { toast.error('Check-out failed'); }
  };

  const activeBookings = bookings.filter(b => b.status === 'checked-in');
  const filtered = activeBookings.filter(b =>
    b.guestName.toLowerCase().includes(search.toLowerCase()) ||
    b.roomNumber?.includes(search)
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-hotel-dark">🏨 Room Inn</h1>
          <p className="text-gray-500 mt-1">Check-in & Check-out Management</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="badge-available">{availableRooms.length} Available</span>
          <span className="badge-occupied">{rooms.filter(r => r.status === 'occupied').length} Occupied</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[['rooms', 'Room Status'], ['checkin', '+ Check In'], ['active', 'Active Guests']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${tab === key ? 'border-hotel-gold text-hotel-gold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Room Status Grid */}
      {tab === 'rooms' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {rooms.map(room => (
            <div key={room._id} className={`card p-4 text-center cursor-pointer border-2 transition
              ${room.status === 'available' ? 'border-green-200 hover:border-green-400' :
                room.status === 'occupied' ? 'border-red-200' : 'border-yellow-200'}`}>
              <p className="text-2xl font-bold font-serif text-hotel-dark">{room.roomNumber}</p>
              <p className="text-xs text-gray-500 mb-2">{room.type}</p>
              <span className={`badge-${room.status === 'available' ? 'available' : room.status === 'occupied' ? 'occupied' : 'pending'}`}>
                {room.status}
              </span>
              <p className="text-sm font-semibold text-hotel-gold mt-2">₹{room.price}/night</p>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No rooms added yet. Add rooms from admin panel.
            </div>
          )}
        </div>
      )}

      {/* Check-In Form */}
      {tab === 'checkin' && (
        <div className="max-w-lg">
          <div className="card">
            <h2 className="text-xl font-serif font-semibold text-hotel-dark mb-5 flex items-center gap-2">
              <FiLogIn className="text-hotel-gold" /> New Check-In
            </h2>
            <form onSubmit={handleCheckin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                  <input className="input-field" required placeholder="Full Name"
                    value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input className="input-field" required placeholder="9876543210"
                    value={form.guestPhone} onChange={e => setForm({ ...form, guestPhone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input className="input-field" type="email" placeholder="guest@email.com"
                  value={form.guestEmail} onChange={e => setForm({ ...form, guestEmail: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Room *</label>
                <select className="input-field" required value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}>
                  <option value="">-- Select Available Room --</option>
                  {availableRooms.map(r => (
                    <option key={r._id} value={r._id}>Room {r.roomNumber} - {r.type} (₹{r.price}/night)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date *</label>
                  <input className="input-field" type="datetime-local" required
                    value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid (₹)</label>
                  <input className="input-field" type="number" placeholder="0"
                    value={form.advancePaid} onChange={e => setForm({ ...form, advancePaid: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="input-field" rows={2} placeholder="Any special requests..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full py-3">
                {loading ? 'Checking in...' : '✓ Confirm Check-In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Active Guests */}
      {tab === 'active' && (
        <div>
          <div className="relative mb-4 max-w-sm">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search by name or room..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(b => (
              <div key={b._id} className="card border border-gray-100 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-hotel-dark">{b.guestName}</h3>
                    <p className="text-sm text-gray-500">{b.guestPhone}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                    Room {b.roomNumber}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>📅 Check-in: {new Date(b.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p>💰 Advance: ₹{b.advancePaid}</p>
                  {b.notes && <p>📝 {b.notes}</p>}
                </div>
                <button onClick={() => { setCheckoutModal(b); setTotalAmount(b.totalAmount || 0); }}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 rounded-lg transition text-sm">
                  <FiLogOut /> Check Out
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">No active guests found</div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-serif font-bold text-hotel-dark mb-4">Confirm Check-Out</h3>
            <p className="text-gray-600 mb-1"><strong>{checkoutModal.guestName}</strong></p>
            <p className="text-gray-500 text-sm mb-4">Room {checkoutModal.roomNumber}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Bill Amount (₹)</label>
              <input className="input-field" type="number" value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Advance paid: ₹{checkoutModal.advancePaid} | Balance: ₹{totalAmount - checkoutModal.advancePaid}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCheckoutModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleCheckout} className="btn-gold flex-1">Confirm Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomInn;
