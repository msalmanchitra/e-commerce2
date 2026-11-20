import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import SellerLogo from '../components/SellerLogo';

export default function SellerProfilePage({ seller, products, sellers, onAddToCart, searchTerm }) {
  if (!seller) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-extrabold text-gray-950">Seller not found</h1>
        <p className="mt-3 text-gray-600">This seller profile may no longer be available.</p>
        <Link to="/" className="mt-6 inline-block font-semibold text-indigo-600 hover:text-indigo-700">
          Back to the store
        </Link>
      </section>
    );
  }

  const sellerEmail = seller.email?.toLowerCase();
  const sellerId = seller._id || seller.id;

  // بیک اینڈ یا لوکل پروڈکٹس میں سے اس سیلر کی پراڈکٹس نکالنا
  const sellerProducts = (products || []).filter((product) => {
    if (sellerEmail && product.createdBy) {
      return product.createdBy.toLowerCase() === sellerEmail;
    }
    if (sellerId && (product.sellerId === sellerId || product.seller === sellerId)) {
      return true;
    }
    return false;
  });

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <SellerLogo seller={seller} className="h-20 w-20 text-2xl" />
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Seller profile
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
              {seller.name}
            </h1>
            <p className="mt-1 text-gray-600">
              {sellerProducts.length
                ? `${sellerProducts.length} product${sellerProducts.length === 1 ? '' : 's'} available`
                : 'No products listed yet.'}
            </p>
          </div>
        </div>
      </section>
      {sellerProducts.length > 0 && (
        <ProductGrid
          title={`Products by ${seller.name}`}
          products={sellerProducts}
          sellers={sellers}
          onAddToCart={onAddToCart}
          searchTerm={searchTerm}
        />
      )}
    </>
  );
}