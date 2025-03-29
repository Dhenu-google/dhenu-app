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
  FirestoreError
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
  error: string | null;
  addProduct: (product: { name: string; category: string; description?: string; location?: string; }) => Promise<void>;
}

export const ProductsContext = createContext<ProductsContextType>({
  products: [],
  loading: false,
  error: null,
  addProduct: async () => {},
});

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const userResponse = await getCurrentUser() as FirebaseUserResponse | null;
      const userId = userResponse?.user?.uid;
      
      if (!userId) {
        setError('User not authenticated');
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
      const firestoreError = error as FirestoreError;
      setError(firestoreError.message || 'Error fetching products');
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
      setError(null);
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
      const firestoreError = error as FirestoreError;
      setError(firestoreError.message || 'Error adding product');
      console.error('Error adding product:', error);
      throw error;
    }
  };

  return (
    <ProductsContext.Provider value={{ products, loading, error, addProduct }}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsProvider;

