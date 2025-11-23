import { useState, useEffect } from 'react';
import productDetailsService from '../../services/productDetailsService';
import './InventoryManagement.css';

function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    stock: 0,
    lowStockThreshold: 10,
    price: 0,
    category: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await productDetailsService.getSellerInventory();
      // Ensure price is a number
      const formattedItems = response.map(item => ({
        ...item,
        price: parseFloat(item.price)
      }));
      setItems(formattedItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
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
      await productDetailsService.updateProduct(itemId, { stock: stockValue });
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
      
      const createdProduct = await productDetailsService.createProduct(productData);
      
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
        sku: '',
        stock: 0,
        lowStockThreshold: 10,
        price: 0,
        category: ''
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
        await productDetailsService.deleteProduct(itemId);
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

  if (loading) return <div className="loading">Loading inventory...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <div>
          <h2>Inventory Management</h2>
          <p>Track and manage your product stock levels</p>
        </div>
        <button className="btn-add-item" onClick={() => setShowAddModal(true)}>
          + Add New Item
        </button>
      </div>

      {/* Stock Alerts */}
      {(getLowStockItems().length > 0 || getOutOfStockItems().length > 0) && (
        <div className="stock-alerts">
          {getOutOfStockItems().length > 0 && (
            <div className="alert alert-danger">
              <span className="alert-icon">⚠️</span>
              <strong>Out of Stock Alert:</strong> {getOutOfStockItems().length} item(s) are out of stock
            </div>
          )}
          {getLowStockItems().length > 0 && (
            <div className="alert alert-warning">
              <span className="alert-icon">⚡</span>
              <strong>Low Stock Alert:</strong> {getLowStockItems().length} item(s) are running low
            </div>
          )}
        </div>
      )}

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="name-cell">{item.name}</td>
                <td>{item.category}</td>
                <td className="price-cell">${item.price.toFixed(2)}</td>
                <td className="stock-cell">
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) => handleUpdateStock(item.id, e.target.value)}
                    className="stock-input"
                    min="0"
                  />
                </td>
                <td>
                  <span className={`status-badge ${getStockStatus(item)}`}>
                    {getStockStatusText(item)}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete item"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Item</h3>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Books">Books</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Initial Stock *</label>
                <input
                  type="number"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Low Stock Threshold *</label>
                <input
                  type="number"
                  value={newItem.lowStockThreshold}
                  onChange={(e) => setNewItem({ ...newItem, lowStockThreshold: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
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
