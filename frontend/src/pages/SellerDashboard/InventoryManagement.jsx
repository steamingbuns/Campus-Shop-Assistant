import { useState, useEffect } from 'react';
import './InventoryManagement.css';

function InventoryManagement() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Laptop Stand',
      sku: 'LS-001',
      stock: 5,
      lowStockThreshold: 10,
      price: 29.99,
      category: 'Electronics'
    },
    {
      id: 2,
      name: 'Notebook Set',
      sku: 'NB-002',
      stock: 25,
      lowStockThreshold: 15,
      price: 12.99,
      category: 'Stationery'
    },
    {
      id: 3,
      name: 'USB Cable',
      sku: 'UC-003',
      stock: 0,
      lowStockThreshold: 20,
      price: 9.99,
      category: 'Electronics'
    },
    {
      id: 4,
      name: 'Coffee Mug',
      sku: 'CM-004',
      stock: 15,
      lowStockThreshold: 10,
      price: 14.99,
      category: 'Lifestyle'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    stock: 0,
    lowStockThreshold: 10,
    price: 0,
    category: ''
  });

  const getLowStockItems = () => {
    return items.filter(item => item.stock <= item.lowStockThreshold);
  };

  const getOutOfStockItems = () => {
    return items.filter(item => item.stock === 0);
  };

  const handleUpdateStock = (itemId, newStock) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, stock: parseInt(newStock) || 0 } : item
    ));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const item = {
      ...newItem,
      id: Date.now(),
      stock: parseInt(newItem.stock) || 0,
      lowStockThreshold: parseInt(newItem.lowStockThreshold) || 10,
      price: parseFloat(newItem.price) || 0
    };
    setItems([...items, item]);
    setNewItem({
      name: '',
      sku: '',
      stock: 0,
      lowStockThreshold: 10,
      price: 0,
      category: ''
    });
    setShowAddModal(false);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== itemId));
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
              <th>SKU</th>
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
                <td className="sku-cell">{item.sku}</td>
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
                <label>SKU *</label>
                <input
                  type="text"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
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
                  <option value="Apparel and Merchandise">Apparel and Merchandise</option>
                  <option value="School Supplies">School Supplies</option>
                  <option value="Textbooks and Course Materials">Textbooks and Course Materials</option>
                  <option value="Technology and Electronics">Technology and Electronics</option>
                  <option value="Stationery and Art Supplies">Stationery and Art Supplies</option>
                  <option value="Health and Personal Care">Health and Personal Care</option>
                  <option value="Snacks and Beverages">Snacks and Beverages</option>
                  <option value="Dorm Essentials">Dorm Essentials</option>
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
