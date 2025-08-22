import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Plus, Trash2 } from 'lucide-react';

const SubmitSalePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]); // List of all available products
    const [saleItems, setSaleItems] = useState([]); // Items added to the current sale
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentQuantity, setCurrentQuantity] = useState(1);
    //const [commonData, setCommonData] = useState({ date: new Date().toISOString().split('T')[0], location: '', remarks: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axiosInstance.get('/api/products');
                setProducts(data.map(p => ({ value: p._id, label: `${p.name} - RS ${p.price}`, price: p.price })));
            } catch (error) {
                toast.error("Could not fetch products.");
            }
        };
        fetchProducts();
    }, []);

    const totalAmount = useMemo(() => {
        return saleItems.reduce((acc, item) => acc + item.pricePerUnit * item.quantity, 0);
    }, [saleItems]);

    const handleAddItem = () => {
        if (!selectedProduct || currentQuantity < 1) {
            toast.error("Please select a product and enter a valid quantity.");
            return;
        }
        const existingItem = saleItems.find(item => item.productId === selectedProduct.value);
        if (existingItem) {
            toast.error("Product already added to the list. You can remove it to add again with a new quantity.");
            return;
        }
        setSaleItems([...saleItems, {
            productId: selectedProduct.value,
            quantity: Number(currentQuantity),
            pricePerUnit: selectedProduct.price,
            name: selectedProduct.label.split(' - ')[0],
        }]);
        setSelectedProduct(null);
        setCurrentQuantity(1);
    };
    
    const handleRemoveItem = (productId) => {
        setSaleItems(saleItems.filter(item => item.productId !== productId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saleItems.length === 0) {
            toast.error("Please add at least one product to the sale.");
            return;
        }
        setIsSubmitting(true);
        const toastId = toast.loading('Submitting sale...');

        const finalData = {
            ...commonData,
            products: saleItems.map(({ productId, quantity, pricePerUnit }) => ({ productId, quantity, pricePerUnit })),
        };

        try {
            await axiosInstance.post('/api/sales', finalData);
            toast.success('Sales report submitted successfully!', { id: toastId });
            navigate('/executive');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getLocalDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [commonData, setCommonData] = useState({ 
        date: getLocalDateString(), // Use the safe function
        location: '', 
        remarks: '' 
    });

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-5">
                <h2 className="text-lg font-semibold tracking-tight mb-4">Sale Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {/* --- UPDATED SECTION START --- */}
                    <div>
                        <label className="text-sm font-medium text-gray-medium">Sale Date</label>
                        <input 
                            type="date" 
                            value={commonData.date} 
                            readOnly 
                            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-medium">Route / Area</label>
                         <input 
                            type="text" 
                            placeholder="Enter Route / Area" 
                            value={commonData.location} 
                            onChange={(e) => setCommonData({...commonData, location: e.target.value})} 
                            required 
                            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" 
                        />
                    </div>
                    {/* --- UPDATED SECTION END --- */}
                </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5">
                <h2 className="text-lg font-semibold tracking-tight mb-4">Add Products to Sale</h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <div className="md:col-span-7">
                        <Select options={products} value={selectedProduct} onChange={setSelectedProduct} placeholder="Select a product..." isClearable />
                    </div>
                    <div className="md:col-span-3">
                        <input type="number" placeholder="Quantity" value={currentQuantity} onChange={(e) => setCurrentQuantity(e.target.value)} min="1" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="button" onClick={handleAddItem} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-pran-blue text-white px-4 py-2 text-sm hover:opacity-90 transition">
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5">
                <h2 className="text-lg font-semibold tracking-tight">Sale Summary</h2>
                <div className="mt-4 flow-root">
                    {saleItems.length === 0 ? <p className="text-sm text-gray-medium text-center py-4">No products added yet.</p> :
                        <div className="-mx-5">
                            <table className="w-full text-sm">
                                <thead className="text-left text-gray-medium"><tr className="border-b border-black/5"><th className="px-5 pb-2 font-medium">Product</th><th className="px-5 pb-2 font-medium">Qty</th><th className="px-5 pb-2 font-medium">Subtotal</th><th></th></tr></thead>
                                <tbody>
                                    {saleItems.map(item => (
                                        <tr key={item.productId}><td className="px-5 py-2">{item.name}</td><td className="px-5 py-2">{item.quantity}</td><td className="px-5 py-2">RS {(item.quantity * item.pricePerUnit).toLocaleString()}</td>
                                        <td className="px-5 py-2 text-right"><button type="button" onClick={() => handleRemoveItem(item.productId)}><Trash2 className="w-4 h-4 text-pran-red"/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
                 <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center">
                     <textarea placeholder="Remarks (optional)" value={commonData.remarks} onChange={(e) => setCommonData({...commonData, remarks: e.target.value})} className="w-full max-w-sm rounded-lg border border-black/10 px-3 py-2 text-sm" rows="1"></textarea>
                     <div className="text-right">
                        <p className="text-sm text-gray-medium">Total Amount</p>
                        <p className="text-2xl font-semibold tracking-tight">RS {totalAmount.toLocaleString()}</p>
                     </div>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-pran-red text-white px-6 py-3 text-sm font-medium hover:bg-[#b72828] transition disabled:opacity-50">
                    {isSubmitting ? 'Submitting Report...' : 'Submit Final Sale Report'}
                </button>
            </div>
        </form>
    );
};

export default SubmitSalePage;