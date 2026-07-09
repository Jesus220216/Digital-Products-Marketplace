import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { VideosPage } from './pages/VideosPage';
import { PDFsPage } from './pages/PDFsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { AffiliateProgramPage } from './pages/AffiliateProgramPage';
import { AffiliateDashboardPage } from './pages/AffiliateDashboardPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideFooter = ['/checkout'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/pdfs" element={<PDFsPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-compras" element={<PurchasesPage />} />
            <Route path="/afiliados" element={<AffiliateProgramPage />} />
            <Route path="/afiliado" element={<AffiliateDashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;