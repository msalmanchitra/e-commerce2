import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminDashboardPage from './Pages/AdminDashboardPage';
import AdminLoginPage from './Pages/AdminmLoginPage';
import CreateAccountPage from './Pages/CreateAccountPage';
import SellerProfilePage from './Pages/SellerProfilePage';
import AboutPage from './Pages/AboutPage';
import CartPage from './Pages/CartPage';
import defaultProducts from './data/products';
import { getPublicSellers } from './data/accounts';
import CategorySection from './components/CategorySection';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';

const API_BASE = 'http://localhost:5000/api';

function loadSellersSafe() {
  try {
    return { sellers: getPublicSellers(), error: '' };
  } catch (error) {
    console.error('Unable to load seller directory:', error);
    return {
      sellers: [],
      error: 'Seller directory is temporarily unavailable.',
    };
  }
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState(defaultProducts);
  const [sellerDirectory, setSellerDirectory] = useState(loadSellersSafe);

  const [currentAccount, setCurrentAccount] = useState(() => {
    try {
      const savedAccount = sessionStorage.getItem('shopco-session');
      return savedAccount ? JSON.parse(savedAccount) : null;
    } catch (error) {
      console.error('Unable to load current account:', error);
      return null;
    }
  });

  // بیک اینڈ سے پروڈکٹس فیچ کرنا
  const fetchProducts = async (category = '') => {
    try {
      const params = {};
      if (category) {
        params.category = category;
      }
      const response = await axios.get(`${API_BASE}/products`, { params });
      if (Array.isArray(response.data?.products)) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Unable to fetch products from backend:', error);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const handleSelectCategory = async (category, backendProducts) => {
    const nextCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(nextCategory);

    if (!nextCategory) {
      await fetchProducts('');
      return;
    }

    if (Array.isArray(backendProducts)) {
      setProducts(backendProducts);
    } else {
      await fetchProducts(nextCategory);
    }
  };

  const addToCart = async (product) => {
    const productId = product?._id || product?.id;
    try {
      const token = localStorage.getItem('token');
      if (token && productId) {
        await axios.post(
          `${API_BASE}/cart/items`,
          { productId, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch (error) {
      console.error('Unable to sync cart item with backend:', error);
    }
    setCart((items) => [...items, product]);
  };

  const createProduct = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/products`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.product) {
        setProducts((items) => [response.data.product, ...items]);
      }
    } catch (error) {
      console.error('Unable to create product:', error);
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const token = localStorage.getItem('token');
      const productId = updatedProduct._id || updatedProduct.id;
      const response = await axios.patch(
        `${API_BASE}/products/${productId}`,
        updatedProduct,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProducts((items) =>
        items.map((product) =>
          (product._id && product._id === productId) ||
          (product.id && product.id === productId)
            ? response.data.product || { ...product, ...updatedProduct }
            : product,
        ),
      );
    } catch (error) {
      console.error('Unable to update product:', error);
    }
  };

  const authenticate = (account) => {
    try {
      sessionStorage.setItem('shopco-session', JSON.stringify(account));
      setCurrentAccount(account);
      setSellerDirectory(loadSellersSafe());
    } catch (error) {
      console.error('Unable to save current account:', error);
      throw new Error(
        'Unable to start your session. Please check browser storage.',
        { cause: error },
      );
    }
  };

  const signOut = () => {
    sessionStorage.removeItem('shopco-session');
    localStorage.removeItem('token');
    setCurrentAccount(null);
  };

  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((items) =>
        items.filter(
          (product) => product._id !== productId && product.id !== productId,
        ),
      );
    } catch (error) {
      console.error('Unable to delete product:', error);
    }
  };

  const removeFromCart = (itemIndex) => {
    setCart((items) => items.filter((_, index) => index !== itemIndex));
  };

  const search = (value) => {
    setSearchTerm(value);
    setSellerDirectory(loadSellersSafe());
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar
          cartCount={cart.length}
          searchTerm={searchTerm}
          onSearch={search}
          sellers={sellerDirectory.sellers}
          sellerSearchError={sellerDirectory.error}
        />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <CategorySection onSelectCategory={handleSelectCategory} />
                  <ProductGrid
                    title={selectedCategory ? `${selectedCategory.toUpperCase()}` : 'NEW ARRIVALS'}
                    products={products}
                    sellers={sellerDirectory.sellers}
                    onAddToCart={addToCart}
                    searchTerm={searchTerm}
                  />
                </>
              }
            />
            <Route
              path="/new-arrivals"
              element={
                <ProductGrid
                  products={products}
                  sellers={sellerDirectory.sellers}
                  onAddToCart={addToCart}
                  searchTerm={searchTerm}
                />
              }
            />
            <Route
              path="/sale"
              element={
                <ProductGrid
                  title="ON SALE"
                  products={products}
                  sellers={sellerDirectory.sellers}
                  onAddToCart={addToCart}
                  searchTerm={searchTerm}
                  saleOnly
                />
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/sellers/:sellerId"
              element={
                <SellerProfileRoute
                  sellers={sellerDirectory.sellers}
                  products={products}
                  onAddToCart={addToCart}
                  searchTerm={searchTerm}
                />
              }
            />
            <Route
              path="/cart"
              element={<CartPage cart={cart} onRemove={removeFromCart} />}
            />
            <Route
              path="/admin-login"
              element={<AdminLoginPage onAuthenticated={authenticate} />}
            />
            <Route
              path="/create-account"
              element={<CreateAccountPage onAuthenticated={authenticate} />}
            />
            <Route
              path="/admin"
              element={
                currentAccount ? (
                  <AdminDashboardPage
                    products={products}
                    account={currentAccount}
                    onSignOut={signOut}
                    onCreateProduct={createProduct}
                    onUpdateProduct={updateProduct}
                    onDeleteProduct={deleteProduct}
                  />
                ) : (
                  <Navigate to="/admin-login" replace />
                )
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function SellerProfileRoute({ sellers, products, onAddToCart, searchTerm }) {
  const { sellerId } = useParams();
  const seller = sellers.find((item) => item.id === sellerId || item._id === sellerId);

  return (
    <SellerProfilePage
      seller={seller}
      products={products}
      sellers={sellers}
      onAddToCart={onAddToCart}
      searchTerm={searchTerm}
    />
  );
}

function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">404</p>
      <h1 className="mt-3 text-4xl font-extrabold text-gray-950">Page not found</h1>
      <p className="mt-4 text-gray-600">The page you are looking for does not exist.</p>
    </section>
  );
}