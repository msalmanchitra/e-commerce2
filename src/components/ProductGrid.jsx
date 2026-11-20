import ProductCard from './ProductCard';

export default function ProductGrid({
  products = [],
  sellers = [],
  title = 'NEW ARRIVALS',
  onAddToCart,
  searchTerm = '',
  saleOnly = false,
}) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProducts = (products || []).filter((product) => {
    const productName = (product?.name || '').toLowerCase();
    const matchesSearch = productName.includes(normalizedSearch);
    const hasDiscount = Boolean(
      product?.discount ||
        (product?.oldPrice !== null &&
          product?.oldPrice !== undefined &&
          Number(product.oldPrice) > Number(product.price)),
    );
    return matchesSearch && (!saleOnly || hasDiscount);
  });

  return (
    <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => {
          const productKey = product?._id || product?.id || index;
          const matchedSeller = sellers.find(
            (item) =>
              (item?.email &&
                product?.createdBy &&
                item.email.toLowerCase() === product.createdBy.toLowerCase()) ||
              (item?._id && item._id === product?.sellerId) ||
              (item?.id && item.id === product?.sellerId),
          );

          return (
            <ProductCard
              key={productKey}
              product={product}
              seller={matchedSeller}
              onAddToCart={onAddToCart}
            />
          );
        })}
      </div>
      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500">No products found.</p>
      )}
    </section>
  );
}