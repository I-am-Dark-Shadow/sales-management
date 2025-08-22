import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSuccess, product }) => {
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', category: '' });
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!product;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price || '',
        category: product.category || '',
      });
    } else {
      setFormData({ name: '', sku: '', price: '', category: '' });
    }
  }, [product, isEditing]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading(isEditing ? 'Updating product...' : 'Creating product...');
    try {
      if (isEditing) {
        await axiosInstance.put(`/api/products/${product._id}`, formData);
      } else {
        await axiosInstance.post('/api/products', formData);
      }
      toast.success(isEditing ? 'Product updated successfully!' : 'Product created successfully!', { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center" onClick={onClose}>
      <div className="relative rounded-2xl bg-white p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-medium hover:text-gray-dark"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-semibold tracking-tight">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4">
          <input type="text" placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          <input type="number" placeholder="Price (RS)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          <input type="text" placeholder="Category (e.g., Beverage, Snack)" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          <input type="text" placeholder="SKU (Optional)" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 transition">Cancel</button>
            <button type="submit" disabled={isLoading} className="rounded-lg bg-pran-red text-white px-4 py-2 text-sm hover:bg-[#b72828] transition disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;