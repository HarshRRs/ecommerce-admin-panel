import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((res) => res.data),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Orders</h1>
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((order: any) => (
            <tr key={order.id}>
              <td>{order.orderNumber}</td>
              <td>{order.customer?.email}</td>
              <td>${order.total.toFixed(2)}</td>
              <td><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></td>
              <td>{order.paymentStatus}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
