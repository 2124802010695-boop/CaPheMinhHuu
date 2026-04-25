import React, { useState, useEffect } from 'react';
import { Circle } from 'lucide-react';

// Dummy orders data
const dummyOrders = [
  {
    id: 1,
    table: 'Table 12',
    startTime: Date.now() - 4.5 * 60 * 1000,
    items: [
      { name: 'Latte', modifiers: ['Oat Milk'] },
      { name: 'Cappuccino', modifiers: ['Extra Shot'] },
      { name: 'Croissant', modifiers: [] }
    ]
  },
  {
    id: 2,
    table: 'Table 4',
    startTime: Date.now() - 16.75 * 60 * 1000,
    items: [
      { name: 'Mocha', quantity: 3, modifiers: ['No Whip', 'Extra Hot'] },
      { name: 'Avocado Toast', modifiers: ['Gluten-Free Bread'] }
    ]
  },
  {
    id: 3,
    table: 'Table 7',
    startTime: Date.now() - 8.33 * 60 * 1000,
    items: [
      { name: 'Cold Brew', modifiers: [] },
      { name: 'Cortado', quantity: 2, modifiers: [] },
      { name: 'Breakfast Sandwich', modifiers: ['Bacon', 'Extra Egg'] },
      { name: 'Granola Bowl', modifiers: ['Greek Yogurt'] }
    ]
  },
  {
    id: 4,
    table: 'Table 8',
    startTime: Date.now() - 9.25 * 60 * 1000,
    items: [
      { name: 'Americano', modifiers: [] },
      { name: 'Flat White', modifiers: ['Soy Milk'] },
      { name: 'Chocolate Muffin', quantity: 2, modifiers: [] }
    ]
  },
  {
    id: 5,
    table: 'Table 15',
    startTime: Date.now() - 2.92 * 60 * 1000,
    items: [
      { name: 'Espresso', modifiers: [] },
      { name: 'Iced Coffee', modifiers: ['Vanilla Syrup'] },
      { name: 'Bagel with Cream Cheese', modifiers: [] }
    ]
  }
];

const OrderCard = ({ order, onDone, onOutOfStock }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - order.startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const minutes = elapsedTime / 60;
    if (minutes < 5) return 'text-green-500';
    if (minutes < 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBarColor = () => {
    const minutes = elapsedTime / 60;
    if (minutes < 5) return 'bg-green-500';
    if (minutes < 10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgress = () => {
    const minutes = elapsedTime / 60;
    if (minutes < 5) return (minutes / 5) * 100;
    if (minutes < 10) return ((minutes - 5) / 5) * 100;
    return 100;
  };

  return (
    <div className="bg-neutral-800 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-semibold text-white">{order.table}</h2>
          <div className="text-right min-w-[80px]">
            <div className={`text-2xl font-semibold ${getTimerColor()}`}>
              {formatTime(elapsedTime)}
            </div>
            <div className="w-full h-1 bg-neutral-700 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx}>
              <div className="text-white text-base">
                {item.quantity ? `${item.quantity}x` : '1x'} {item.name}
              </div>
              {item.modifiers.map((modifier, modIdx) => (
                <div
                  key={modIdx}
                  className="text-orange-400 text-sm font-medium ml-6 mt-0.5"
                >
                  + {modifier}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-0 flex gap-2">
        <button
          onClick={() => onDone(order.id)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg uppercase transition-colors"
        >
          Done
        </button>
        <button
          onClick={() => onOutOfStock(order.id)}
          className="bg-neutral-700 hover:bg-neutral-600 text-red-500 font-semibold py-3 px-4 rounded-lg whitespace-nowrap transition-colors"
        >
          Out of Stock
        </button>
      </div>
    </div>
  );
};

export default function KDSScreen() {
  const [orders, setOrders] = useState(dummyOrders);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleDone = (orderId) => {
    setOrders(orders.filter(order => order.id !== orderId));
  };

  const handleOutOfStock = (orderId) => {
    console.log('Out of stock for order:', orderId);
  };

  const pendingCount = orders.length;
  const cookingCount = orders.filter(o => (Date.now() - o.startTime) / 60000 < 5).length;

  return (
    <div className="min-h-screen bg-neutral-900 p-3">
      {/* Header Bar */}
      <div className="bg-neutral-800 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          {/* Left Side */}
          <div className="flex items-center gap-6 flex-wrap">
            {/* Status */}
            <div className="flex items-center gap-2">
              <Circle size={12} className="fill-green-500 text-green-500" />
              <span className="text-green-500 font-medium">Online</span>
              <span className="text-neutral-400 ml-2">Connection: Strong</span>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {['All', 'Drinks', 'Food'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2 rounded-full font-semibold transition-colors ${
                    activeFilter === filter
                      ? 'bg-white text-black'
                      : 'bg-transparent text-white border border-neutral-600 hover:bg-neutral-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Counters */}
          <div className="flex gap-6">
            <div className="text-yellow-500 font-semibold text-lg">
              Pending: {pendingCount}
            </div>
            <div className="text-orange-500 font-semibold text-lg">
              Cooking: {cookingCount}
            </div>
          </div>
        </div>
      </div>

      {/* Order Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onDone={handleDone}
            onOutOfStock={handleOutOfStock}
          />
        ))}
      </div>
    </div>
  );
}