'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '../../../lib/localStorage-utils';
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  PageHeader,
  EmptyState,
} from '../../../components/admin/ui';

const OrdersPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      router.replace('/admin/login');
    }
  }, [router]);

  const orders = [
    { id: 'ORD-001', customer: 'John Smith', products: ['Ergonomic Chair', 'Shift+ Table'], total: 2500, status: 'pending', date: '2023-11-15' },
    { id: 'ORD-002', customer: 'Sarah Johnson', products: ['Mobile Storage Unit'], total: 1200, status: 'completed', date: '2023-11-14' },
    { id: 'ORD-003', customer: 'Mike Davis', products: ['Executive Desk', 'Ergonomic Chair'], total: 3800, status: 'processing', date: '2023-11-13' },
    { id: 'ORD-004', customer: 'Lisa Wilson', products: ['Storage Unit'], total: 800, status: 'cancelled', date: '2023-11-12' },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const viewOrder = (id) => alert(`View order ${id}`);
  const updateStatus = (id, status) => alert(`Update order ${id} status to ${status}`);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusTone = (status) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'info';
      case 'completed':
        return 'active';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Orders"
        description="Manage customer orders and track status."
      />

      <AdminCard padding="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <AdminInput
              label="Search orders"
              icon="search"
              placeholder="Search by customer or order ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <AdminSelect
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statuses}
          />
        </div>
      </AdminCard>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="receipt_long"
          title="No orders found"
          description="Try adjusting your search filters."
        />
      ) : (
        <AdminCard padding="p-0" className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container">
            <h2 className="text-headline-md text-on-surface font-bold">Orders</h2>
            <p className="text-[13px] text-on-surface-variant/70 font-medium">
              {filteredOrders.length} orders found
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Order ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Customer</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 hidden md:table-cell">Products</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Total</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 hidden lg:table-cell">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-[13px] font-bold text-on-surface">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-on-surface font-bold">{order.customer}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-0.5">
                        {order.products.map((p, i) => (
                          <span key={i} className="text-[13px] text-on-surface-variant">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-bold text-on-surface">
                        ${order.total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge tone={statusTone(order.status)} dot>
                        {order.status}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-[13px] text-on-surface-variant/70">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => viewOrder(order.id)}
                          title="View"
                          className="w-9 h-9 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="h-9 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-[12px] text-on-surface font-medium focus:outline-none focus:border-on-surface"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
};

export default OrdersPage;
