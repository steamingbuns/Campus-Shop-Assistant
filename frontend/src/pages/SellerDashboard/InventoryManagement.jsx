import { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, BadgeCheck, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import productDetailsService from '../../services/productDetailsService';

function InventoryManagement() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    stock: 0,
    lowStockThreshold: 10,
    price: 0,
    category: '',
    image: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  const fetchInventory = async () => {
    if (!token) {
      setError('Please log in with a seller account to view inventory.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await productDetailsService.getSellerInventory({ token });
      // Ensure price is a number
      const formattedItems = response.map(item => ({
        ...item,
        price: parseFloat(item.price),
        description: item.description || ''
      }));
      setItems(formattedItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      if (err?.status === 401 || err?.status === 403) {
        setError('Unauthorized. Please log in with a seller account.');
      } else {
        setError('Failed to load inventory. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await productDetailsService.getCategories?.({ token });
      if (Array.isArray(cats)) {
        setCategories(cats);
      }
    } catch (err) {
      console.warn('Failed to fetch categories', err);
    }
  };

  const getLowStockItems = () => {
    return items.filter(item => item.stock <= item.lowStockThreshold);
  };

  const getOutOfStockItems = () => {
    return items.filter(item => item.stock === 0);
  };

  const handleUpdateStock = async (itemId, newStock) => {
    const stockValue = parseInt(newStock) || 0;
    
    // Optimistic update
    const oldItems = [...items];
    setItems(items.map(item =>
      item.id === itemId ? { ...item, stock: stockValue } : item
    ));

    try {
      await productDetailsService.updateProduct(itemId, { stock: stockValue }, { token });
    } catch (err) {
      console.error('Error updating stock:', err);
      // Revert on error
      setItems(oldItems);
      alert('Failed to update stock');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newItem,
        stock: parseInt(newItem.stock) || 0,
        lowStockThreshold: parseInt(newItem.lowStockThreshold) || 10,
        price: parseFloat(newItem.price) || 0
      };
      
      const createdProduct = await productDetailsService.createProduct(productData, { token });
      
      // Add to list with correct format
      setItems([
        ...items, 
        { 
          ...createdProduct, 
          price: parseFloat(createdProduct.price) 
        }
      ]);
      
      setNewItem({
        name: '',
        description: '',
        sku: '',
        stock: 0,
        lowStockThreshold: 10,
        price: 0,
        category: '',
        image: ''
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await productDetailsService.deleteProduct(itemId, { token });
        setItems(items.filter(item => item.id !== itemId));
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const getStockStatus = (item) => {
    if (item.stock === 0) return 'out-of-stock';
    if (item.stock <= item.lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusText = (item) => {
    if (item.stock === 0) return 'Out of Stock';
    if (item.stock <= item.lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) return <div className="text-sm text-slate-600">Loading inventory...</div>;
  if (error) return <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inventory Management</h2>
          <p className="text-sm text-slate-600">Track and manage your product stock levels</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Item
        </button>
      </div>

      {(getLowStockItems().length > 0 || getOutOfStockItems().length > 0) && (
        <div className="space-y-2">
          {getOutOfStockItems().length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Out of Stock: {getOutOfStockItems().length} item(s)
            </div>
          )}
          {getLowStockItems().length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Low Stock: {getLowStockItems().length} item(s) running low
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-blue-50 bg-white/80 shadow-sm shadow-blue-50">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-blue-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-blue-50 hover:bg-blue-50/50">
                <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-slate-600">{item.category}</td>
                <td className="px-4 py-3 text-slate-600">{item.description || '—'}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">${item.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) => handleUpdateStock(item.id, e.target.value)}
                    className="w-24 rounded-lg border border-blue-100 bg-white/80 px-2 py-1 text-sm font-semibold text-slate-900 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      getStockStatus(item) === 'out-of-stock'
                        ? 'bg-red-50 text-red-700'
                        : getStockStatus(item) === 'low-stock'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {getStockStatusText(item)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl shadow-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900">Add New Item</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-800">Product Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.category_id || cat.id || cat.name} value={cat.name || cat.category}>
                        {cat.name || cat.category}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Books">Books</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Lifestyle">Lifestyle</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Price (VND) *</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                  placeholder="e.g., 50000"
                  className="mt-1 w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Product Image URL</label>
                <input
                  type="url"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-slate-500">Optional: Paste an image URL from Unsplash, Imgur, etc.</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Initial Stock *</label>
                <input
                  type="number"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                  required
                  min="0"
                  className="mt-1 w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Low Stock Threshold *</label>
                <input
                  type="number"
                  value={newItem.lowStockThreshold}
                  onChange={(e) => setNewItem({ ...newItem, lowStockThreshold: e.target.value })}
                  required
                  min="0"
                  className="mt-1 w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-800">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows="3"
                  placeholder="Add product details to help buyers"
                  className="mt-1 w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-200"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryManagement;
