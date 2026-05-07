import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './admin/AdminAuth';
import AdminLayout from './admin/AdminLayout';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminPromoCodes from './admin/AdminPromoCodes';
import AdminSettings from './admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<AdminAnalytics />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="promocodes" element={<AdminPromoCodes />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
