import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getFirestore, 
  query, 
  orderBy,
  Timestamp,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import app from '@/lib/firebase-config';
import { getCurrentUser, FirebaseUserResponse } from '@/lib/firebase-service';

// Initialize Firestore
const db = getFirestore(app);

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  location?: string;
  enquiries: number;
  createdAt: Timestamp;
  userId: string;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: { name: string; category: string; description?: string; location?: string; }) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  editProduct: (productId: string, product: { name: string; category: string; description?: string; location?: string; }) => Promise<void>;
}

export const ProductsContext = createContext<ProductsContextType>({
  products: [],
  loading: false,
  addProduct: async () => {},
  deleteProduct: async () => {},
  editProduct: async () => {},
});

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const userResponse = await getCurrentUser() as FirebaseUserResponse | null;
      const userId = userResponse?.user?.uid;
      
      if (!userId) {
        setLoading(false);
        return;
      }

      const productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(productsQuery);
      const fetchedProducts: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Product, 'id'>;
        // Only include products that belong to the current user
        if (data.userId === userId) {
          fetchedProducts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt as Timestamp
          });
        }
      });

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when the provider mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Add a new product to Firestore
  const addProduct = async (product: { name: string; category: string; description?: string; location?: string; }) => {
    try {
      const userResponse = await getCurrentUser() as FirebaseUserResponse | null;
      const userId = userResponse?.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const newProduct = {
        name: product.name,
        category: product.category,
        description: product.description || '',
        location: product.location || '',
        enquiries: 0,
        createdAt: Timestamp.now(),
        userId
      };

      await addDoc(collection(db, 'products'), newProduct);
      
      // Refresh products after adding a new one
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  // Delete a product from Firestore
  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      // Refresh products after deleting
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Edit a product in Firestore
  const editProduct = async (productId: string, product: { name: string; category: string; description?: string; location?: string; }) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        name: product.name,
        category: product.category,
        description: product.description || '',
        location: product.location || '',
      });
      // Refresh products after editing
      fetchProducts();
    } catch (error) {
      console.error('Error editing product:', error);
      throw error;
    }
  };

  return (
    <ProductsContext.Provider value={{ products, loading, addProduct, deleteProduct, editProduct }}>
      {children}
    </ProductsContext.Provider>
  );
};
