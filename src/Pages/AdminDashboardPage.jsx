import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const fieldClassName =
  'mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100';

export default function AdminDashboardPage({
  products,
  account,
  onSignOut,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (formOpen) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [formOpen, editingProduct]);

  // مونگو ڈی بی کے فیلڈز کے مطابق فلٹر کرنا (createdBy یا admin)
  const myProducts = products || [];
  const saleCount = myProducts.filter((product) => product.discount || product.oldPrice).length;
  const averagePrice = myProducts.length
    ? myProducts.reduce((sum, product) => sum + (Number(product.price) || 0), 0) / myProducts.length
    : 0;
  const visibleProducts = myProducts.filter((product) =>
    product.name && product.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  const openNewProductForm = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEditProductForm = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const closeForm = () => {
    setEditingProduct(null);
    setFormOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const price = Number(formData.get('price'));
    const oldPriceValue = formData.get('oldPrice');
    const oldPrice = oldPriceValue ? Number(oldPriceValue) : null;
    const discount =
      oldPrice && oldPrice > price
        ? `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`
        : null;

    // بیک اینڈ کے ماڈل کے مطابق ڈیٹا تیار کرنا
    const productData = {
      _id: editingProduct?._id || editingProduct?.id,
      name: formData.get('name').trim(),
      description: formData.get('description')?.trim() || formData.get('name').trim(), // بیک اینڈ کے لیے ڈسکرپشن لازمی ہے
      category: formData.get('category')?.trim() || 'General', // بیک اینڈ کے لیے کیٹیگری
      price,
      oldPrice,
      discount,
      rating: Number(formData.get('rating') || 5),
      stock: Number(formData.get('stock') || 10), // بیک اینڈ کے لیے اسٹاک
      images: [formData.get('image').trim()], // بیک اینڈ ایرے کی شکل میں لیتا ہے
      isActive: true,
    };

    if (editingProduct) {
      onUpdateProduct(productData);
    } else {
      delete productData._id;
      onCreateProduct(productData);
    }
    closeForm();
  };

  const confirmDelete = () => {
    const targetId = pendingDeleteId?._id || pendingDeleteId?.id || pendingDeleteId;
    onDeleteProduct(targetId);
    setPendingDeleteId(null);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
            Shop.co Admin
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
            Product management
          </h1>
          <p className="mt-2 text-gray-600">
            Add products, update details, and manage what appears in your store.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Signed in as {account?.name || 'Admin'} ({account?.email || ''})
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View storefront
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="text-sm font-semibold text-gray-600 hover:text-gray-950"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="My products" value={myProducts.length} />
        <SummaryCard label="Products on sale" value={saleCount} />
        <SummaryCard label="Average price" value={`$${averagePrice.toFixed(2)}`} />
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-950">Store products</h2>
        <button
          type="button"
          onClick={openNewProductForm}
          className="rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
        >
          Add product
        </button>
      </div>

      {formOpen && (
        <form
          ref={formRef}
          key={editingProduct?._id ?? editingProduct?.id ?? 'new'}
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-7"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-950">
              {editingProduct ? 'Edit product' : 'Add a product'}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="text-sm font-semibold text-gray-600 hover:text-gray-950"
            >
              Cancel
            </button>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Product name
              <input
                name="name"
                required
                maxLength={100}
                defaultValue={editingProduct?.name ?? ''}
                className={fieldClassName}
                placeholder="e.g. Classic cotton shirt"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Category
              <input
                name="category"
                required
                defaultValue={editingProduct?.category ?? 'Clothing'}
                className={fieldClassName}
                placeholder="e.g. Clothing, Electronics"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              Image URL
              <input
                name="image"
                type="url"
                required
                defaultValue={editingProduct?.images?.[0] ?? editingProduct?.image ?? ''}
                className={fieldClassName}
                placeholder="https://example.com/product.jpg"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Price ($)
              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                required
                defaultValue={editingProduct?.price ?? ''}
                className={fieldClassName}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Stock Quantity
              <input
                name="stock"
                type="number"
                min="0"
                required
                defaultValue={editingProduct?.stock ?? '50'}
                className={fieldClassName}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Original price ($, optional)
              <input
                name="oldPrice"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={editingProduct?.oldPrice ?? ''}
                className={fieldClassName}
                placeholder="Set higher than current price for a sale"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Rating (0-5)
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                required
                defaultValue={editingProduct?.rating ?? '5'}
                className={fieldClassName}
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {editingProduct ? 'Save changes' : 'Create product'}
          </button>
        </form>
      )}

      <label className="mt-6 block max-w-sm text-sm font-medium text-gray-700">
        Search products
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by product name"
          className={fieldClassName}
        />
      </label>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
        {visibleProducts.length ? (
          <ul className="divide-y divide-gray-200">
            {visibleProducts.map((product) => {
              const productId = product._id || product.id;
              const productImage = product.images?.[0] || product.image || '';
              return (
                <li
                  key={productId}
                  className="flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center sm:px-5"
                >
                  <img
                    src={productImage}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-xl bg-gray-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-950">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      ${Number(product.price).toFixed(2)}
                      {product.oldPrice && (
                        <span className="ml-2 text-gray-400 line-through">
                          ${Number(product.oldPrice).toFixed(2)}
                        </span>
                      )}
                      <span className="ml-3">Rating: {Number(product.rating || 5).toFixed(1)}/5</span>
                      <span className="ml-3 text-gray-500">Stock: {product.stock ?? 'N/A'}</span>
                    </p>
                  </div>
                  {product.discount && (
                    <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                      {product.discount} off
                    </span>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditProductForm(product)}
                      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-600 hover:text-indigo-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(productId)}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                  {pendingDeleteId === productId && (
                    <div
                      role="group"
                      aria-label={`Confirm deleting ${product.name}`}
                      className="flex items-center gap-2 rounded-xl bg-red-50 p-3 sm:ml-auto"
                    >
                      <span className="text-sm text-red-800">Delete this product?</span>
                      <button
                        type="button"
                        onClick={confirmDelete}
                        className="rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        className="rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-white"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="bg-white px-5 py-10 text-center text-gray-500">
            {myProducts.length ? 'No matching products found.' : 'No products yet. Add your first product.'}
          </p>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-gray-950">{value}</p>
    </article>
  );
}