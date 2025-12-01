import { 
  getProductById, 
  getProductsBySellerId, 
  createProduct as createProductModel, 
  updateProduct as updateProductModel, 
  deleteProduct as deleteProductModel 
} from '../models/productDetailsModel.js';

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Format data to match frontend expectations
    const formattedProduct = {
      id: product.id,
      name: product.name || "Product Name", 
      price: Number(product.price),
      description: product.description,
      stock: product.stock,
      rating: Number(product.rating) || 0,
      reviewCount: product.reviewCount,
      category: product.category,
      images: product.images.length > 0 ? product.images : ['https://via.placeholder.com/600x600?text=No+Image'],
      reviews: product.reviews.map(r => ({
        id: r.id,
        user: r.user,
        rating: r.rating,
        comment: r.comment,
        date: r.date ? new Date(r.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      })),
      seller: {
        name: product.seller_name,
        email: product.seller_email,
        phone: product.seller_phone,
        rating: 4.8, // Mocked as not in DB
        totalSales: 100, // Mocked
        joinDate: product.seller_join_date,
        responseTime: '< 2 hours' // Mocked
      },
      specifications: [ // Mocked as not in DB
        { name: 'Condition', value: 'New' },
        { name: 'Warranty', value: '6 Months' }
      ],
      shipping: { // Mocked
        free: true,
        estimatedDelivery: '2-4 days'
      }
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.userId; // From auth middleware
    if (!sellerId) {
      console.error('Seller ID missing in request user');
      return res.status(400).json({ message: 'User ID missing' });
    }
    const products = await getProductsBySellerId(sellerId);
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const productData = { ...req.body, sellerId };
    const newProduct = await createProductModel(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedProduct = await updateProductModel(id, updates);
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProductModel(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
