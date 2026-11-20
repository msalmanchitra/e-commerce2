import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function CartPage({ cart, onRemove }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // قیمت کو نمبر میں تبدیل کر کے ٹوٹل نکالنا تاکہ ایرر نہ آئے
  const total = cart.reduce((sum, product) => sum + (Number(product.price) || 0), 0);

  // بیک اینڈ سے کارٹ آئٹم ڈیلیٹ کرنے کا فنکشن
  const handleRemoveItem = async (product, index) => {
    try {
      const token = localStorage.getItem('token');
      const productId = product._id || product.id;
      
      if (token && productId) {
        await axios.delete(`http://localhost:5000/api/cart/items/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Unable to remove item from backend:', error);
    }
    
    // UI کو فوراً اپڈیٹ کرنے کے لیے آپ کا پرانا فنکشن
    onRemove(index);
  };

  // بیک اینڈ پر آرڈر پلیس کرنے کا فنکشن
  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to place an order.');
      return;
    }

    try {
      setIsCheckingOut(true);
      // بیک اینڈ کی Orders API کو کال کرنا
      await axios.post(
        'http://localhost:5000/api/orders',
        { products: cart }, // کارٹ کا ڈیٹا بھیجنا
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Order placed successfully!');
      // آرڈر ہونے کے بعد ہوم پیج پر بھیج دینا تاکہ کارٹ خالی ہو جائے
      window.location.href = '/'; 
    } catch (error) {
      console.error('Unable to place order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
        Your cart
      </h1>

      {cart.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-gray-50 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-gray-900">Your cart is empty</p>
          <p className="mt-2 text-gray-600">Find something you like and add it to your cart.</p>
          <Link
            to="/new-arrivals"
            className="mt-6 inline-flex rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 px-5">
            {cart.map((product, index) => {
              const productId = product._id || product.id || index;
              // بیک اینڈ یا لوکل امیج کو محفوظ طریقے سے دکھانا
              const productImage = product.images?.[0] || product.image || '';

              return (
                <li key={`cart-${productId}-${index}`} className="flex items-center gap-4 py-5">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="h-20 w-20 rounded-xl bg-gray-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-gray-950">{product.name}</h2>
                    <p className="mt-1 text-gray-600">${Number(product.price).toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(product, index)}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                    aria-label={`Remove ${product.name} from cart`}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-2xl bg-gray-50 p-6">
            <h2 className="text-lg font-bold text-gray-950">Order summary</h2>
            <div className="mt-5 flex justify-between border-t border-gray-200 pt-4 text-gray-700">
              <span>Total</span>
              <span className="font-bold text-gray-950">${total.toFixed(2)}</span>
            </div>
            
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="mt-6 w-full rounded-full bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            <p className="mt-4 text-xs text-center text-gray-500">
              Connected to MongoDB Orders API.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}