import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeletonLoader } from '../../components/shared/SkeletonLoader';
import ProductModal from '../../components/manager/ProductModal';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/api/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    fetchProducts();
  };
  
  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;
    try {
        await axiosInstance.delete(`/api/products/${productId}`);
        toast.success('Product deleted successfully!');
        fetchProducts();
    } catch(error) {
        toast.error('Failed to delete product.');
    }
  }

  return (
    <>
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        product={selectedProduct}
      />
      <div className="rounded-2xl border border-black/10 bg-white">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-lg font-semibold tracking-tight">Product Management</h2>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-pran-red text-white px-4 py-2 text-sm font-medium tracking-tight hover:bg-[#b72828] transition">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-medium bg-gray-light">
              <tr>
                <th className="px-5 py-3 font-medium">Product Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price (RS)</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeletonLoader rows={4} />
            ) : (
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="4"><EmptyState icon={Package} title="No Products Found" message="Get started by adding your first product." /></td></tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod._id} className="border-t border-black/5">
                      <td className="px-5 py-4 font-medium">{prod.name}</td>
                      <td className="px-5 py-4 text-gray-medium">{prod.category || '-'}</td>
                      <td className="px-5 py-4">{prod.price.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setSelectedProduct(prod); setIsModalOpen(true); }} title="Edit"><Edit className="w-4 h-4 text-pran-blue"/></button>
                            <button onClick={() => handleDelete(prod._id, prod.name)} title="Delete"><Trash2 className="w-4 h-4 text-pran-red"/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;