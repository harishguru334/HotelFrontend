import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';

const MENU_ITEMS = [
  { name: 'Paneer Butter Masala', price: 220 },
  { name: 'Dal Makhani', price: 180 },
  { name: 'Butter Naan', price: 40 },
  { name: 'Tandoori Roti', price: 30 },
  { name: 'Jeera Rice', price: 120 },
  { name: 'Biryani (Veg)', price: 250 },
  { name: 'Biryani (Chicken)', price: 320 },
  { name: 'Chicken Tikka Masala', price: 350 },
  { name: 'Cold Coffee', price: 90 },
  { name: 'Fresh Lime Soda', price: 60 },
  { name: 'Masala Chai', price: 40 },
  { name: 'Veg Sandwich', price: 110 },
];

const FoodInn = () => {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('new'); // new | orders | bill
  const [roomNumber, setRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [items, setItems] = useState([{ name: '', price: 0, quantity: 1 }]);
  const [billRoom, setBillRoom] = useState('');
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/food');
      setOrders(data);
    } catch { toast.error('Failed to load orders'); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const addItem = () => setItems([...items, { name: '', price: 0, quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'name') {
      const menuItem = MENU_ITEMS.find(m => m.name === value);
      if (menuItem) updated[i].price = menuItem.price;
    }
    setItems(updated);
  };

  const totalBill = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNumber) return toast.error('Room number required');
    const validItems = items.filter(i => i.name && i.price > 0 && i.quantity > 0);
    if (validItems.length === 0) return toast.error('Add at least one item');
    setLoading(true);
    try {
      await API.post('/food', { roomNumber, guestName, items: validItems, type: 'room-service' });
      toast.success('Order placed successfully!');
      setItems([{ name: '', price: 0, quantity: 1 }]);
      setRoomNumber('');
      setGuestName('');
      fetchOrders();
      setTab('orders');
    } catch { toast.error('Failed to place order'); }
    finally { setLoading(false); }
  };

  const fetchBill = async () => {
    if (!billRoom) return toast.error('Enter room number');
    try {
      const { data } = await API.get(`/food/bill/${billRoom}`);
      setBillData(data);
    } catch { toast.error('Failed to fetch bill'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/food/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-hotel-dark">🍽️ Food Inn</h1>
        <p className="text-gray-500 mt-1">Room service & food order management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[['new', '+ New Order'], ['orders', 'All Orders'], ['bill', 'Room Bill']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === key ? 'border-hotel-gold text-hotel-gold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* New Order */}
      {tab === 'new' && (
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-xl font-serif font-semibold mb-5">New Food Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input className="input-field" placeholder="e.g. 101" value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                  <input className="input-field" placeholder="Guest name" value={guestName}
                    onChange={e => setGuestName(e.target.value)} />
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select className="input-field flex-1" value={item.name}
                        onChange={e => updateItem(i, 'name', e.target.value)}>
                        <option value="">-- Select Item --</option>
                        {MENU_ITEMS.map(m => (
                          <option key={m.name} value={m.name}>{m.name} - ₹{m.price}</option>
                        ))}
                      </select>
                      <input type="number" min="1" className="input-field w-20" value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', parseInt(e.target.value))} />
                      <span className="text-sm font-semibold text-hotel-gold w-20 text-right">
                        ₹{item.price * item.quantity}
                      </span>
                      <button type="button" onClick={() => removeItem(i)}
                        className="text-red-400 hover:text-red-600 p-1"><FiTrash2 /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItem}
                  className="mt-2 flex items-center gap-1 text-sm text-hotel-gold hover:underline">
                  <FiPlus /> Add Item
                </button>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-hotel-gold">₹{totalBill}</span>
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full py-3">
                {loading ? 'Placing order...' : '🍽️ Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* All Orders */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No food orders yet</div>
          ) : orders.map(order => (
            <div key={order._id} className="card border border-gray-100">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <span className="font-bold text-hotel-dark text-lg">Room {order.roomNumber}</span>
                  {order.guestName && <span className="text-gray-500 ml-2 text-sm">({order.guestName})</span>}
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.orderedAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-hotel-gold">₹{order.totalAmount}</span>
                  <select value={order.status} onChange={e => updateStatus(order._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-hotel-gold">
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="delivered">Delivered</option>
                    <option value="billed">Billed</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.items.map((item, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Bill */}
      {tab === 'bill' && (
        <div className="max-w-lg">
          <div className="card mb-4">
            <h2 className="text-xl font-serif font-semibold mb-4">Check Room Food Bill</h2>
            <div className="flex gap-3">
              <input className="input-field" placeholder="Enter Room Number" value={billRoom}
                onChange={e => setBillRoom(e.target.value)} />
              <button onClick={fetchBill} className="btn-gold whitespace-nowrap">Get Bill</button>
            </div>
          </div>
          {billData && (
            <div className="card">
              <h3 className="font-serif font-semibold text-lg mb-4">Bill — Room {billData.roomNumber}</h3>
              {billData.orders.length === 0 ? (
                <p className="text-gray-400 text-center py-6">No food orders for this room</p>
              ) : (
                <>
                  {billData.orders.map((order, idx) => (
                    <div key={order._id} className="mb-3 pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">Order #{idx + 1} — {new Date(order.orderedAt).toLocaleString('en-IN')}</p>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-0.5">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-medium">₹{item.total}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-gray-700 text-lg">Total Food Bill</span>
                    <span className="text-2xl font-bold text-hotel-gold">₹{billData.totalBill}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodInn;
