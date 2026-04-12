import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

const ROOM_TYPES = ['Single', 'Double', 'Deluxe', 'Suite', 'Presidential'];
const AMENITY_OPTIONS = ['AC', 'WiFi', 'TV', 'Smart TV', 'Mini Fridge', 'Mini Bar', 'Full Bar', 'Bathtub', 'Jacuzzi', 'Balcony', 'Private Pool', 'Butler Service', 'Lounge'];

const EMPTY_ROOM = { roomNumber: '', type: 'Single', price: '', floor: '', description: '', amenities: [], status: 'available' };

const AdminPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_ROOM);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('rooms');

  const fetchRooms = async () => {
    try {
      const { data } = await API.get('/rooms');
      setRooms(data);
    } catch { toast.error('Failed to load rooms'); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const openAdd = () => { setForm(EMPTY_ROOM); setModal('add'); };
  const openEdit = (room) => { setForm(room); setModal('edit'); };

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === 'add') {
        await API.post('/rooms', form);
        toast.success(`Room ${form.roomNumber} added!`);
      } else {
        await API.put(`/rooms/${form._id}`, form);
        toast.success(`Room ${form.roomNumber} updated!`);
      }
      setModal(null);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, roomNumber) => {
    if (!window.confirm(`Delete Room ${roomNumber}? This cannot be undone.`)) return;
    try {
      await API.delete(`/rooms/${id}`);
      toast.success(`Room ${roomNumber} deleted`);
      fetchRooms();
    } catch { toast.error('Delete failed'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/rooms/${id}/status`, { status });
      fetchRooms();
    } catch { toast.error('Failed to update'); }
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-hotel-dark">⚙️ Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage rooms and hotel settings</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2">
          <FiPlus /> Add Room
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Rooms',  value: stats.total,       color: 'bg-blue-50 text-blue-700' },
          { label: 'Available',    value: stats.available,   color: 'bg-green-50 text-green-700' },
          { label: 'Occupied',     value: stats.occupied,    color: 'bg-red-50 text-red-700' },
          { label: 'Maintenance',  value: stats.maintenance, color: 'bg-yellow-50 text-yellow-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rooms table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Room No.', 'Type', 'Floor', 'Price/Night', 'Amenities', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left py-3 pr-4 text-gray-500 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-12 text-gray-400">
                No rooms yet. Click "Add Room" to get started.
              </td></tr>
            ) : rooms.map(room => (
              <tr key={room._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-4 font-bold text-hotel-dark">{room.roomNumber}</td>
                <td className="py-3 pr-4 text-gray-600">{room.type}</td>
                <td className="py-3 pr-4 text-gray-600">{room.floor || '—'}</td>
                <td className="py-3 pr-4 font-semibold text-hotel-gold">₹{room.price}</td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {room.amenities?.slice(0, 3).map(a => (
                      <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                    {room.amenities?.length > 3 && (
                      <span className="text-xs text-gray-400">+{room.amenities.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <select value={room.status} onChange={e => updateStatus(room._id, e.target.value)}
                    className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-hotel-gold
                      ${room.status === 'available' ? 'border-green-200 bg-green-50 text-green-700' :
                        room.status === 'occupied' ? 'border-red-200 bg-red-50 text-red-700' :
                        'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(room)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><FiEdit2 size={15} /></button>
                    <button onClick={() => handleDelete(room._id, room.roomNumber)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><FiTrash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold text-hotel-dark">
                {modal === 'add' ? '+ Add New Room' : `Edit Room ${form.roomNumber}`}
              </h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input className="input-field" required placeholder="e.g. 101"
                    value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })}
                    disabled={modal === 'edit'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input className="input-field" type="number" placeholder="1"
                    value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (₹) *</label>
                  <input className="input-field" type="number" required placeholder="1500"
                    value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map(a => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1
                        ${form.amenities?.includes(a)
                          ? 'bg-hotel-gold text-white border-hotel-gold'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-hotel-gold'}`}>
                      {form.amenities?.includes(a) && <FiCheck size={11} />}
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={2} placeholder="Room description..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-gold flex-1">
                  {loading ? 'Saving...' : modal === 'add' ? 'Add Room' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
