import { useEffect, useState } from "react";

export default function HubCD() {
  const [shopeeOrders, setShopeeOrders] = useState([]);
  const [mlOrders, setMlOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/shopee/orders")
      .then(res => res.json())
      .then(data => setShopeeOrders(data));

    fetch("http://localhost:4000/api/ml/orders")
      .then(res => res.json())
      .then(data => setMlOrders(data));
  }, []);

  return (
    <div className="p-6 grid gap-6 grid-cols-2">
      {/* Shopee Orders */}
      <div className="bg-white shadow-xl rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4 text-orange-600">Shopee Orders</h2>
        <ul className="space-y-3">
          {shopeeOrders.map((o) => (
            <li key={o.orderId} className="border p-3 rounded-xl">
              <p><b>{o.product}</b> — {o.buyer}</p>
              <p>Status: <span className="text-blue-600">{o.status}</span></p>
              <p className="text-gray-500 text-sm">{o.address}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Mercado Livre Orders */}
      <div className="bg-white shadow-xl rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4 text-yellow-600">Mercado Livre Orders</h2>
        <ul className="space-y-3">
          {mlOrders.map((o) => (
            <li key={o.orderId} className="border p-3 rounded-xl">
              <p><b>{o.product}</b> — {o.buyer}</p>
              <p>Status: <span className="text-green-600">{o.status}</span></p>
              <p className="text-gray-500 text-sm">{o.address}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
