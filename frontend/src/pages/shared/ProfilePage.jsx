import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { uploadFile } from '../../api/uploadService';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import { UploadCloud } from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user.name);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');
    try {
      const uploadedImage = await uploadFile(file);
      await handleProfileUpdate({ profilePicture: uploadedImage });
      toast.success('Profile picture updated!', { id: toastId });
    } catch (error) {
      toast.error('Image upload failed.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleProfileUpdate = async (updateData) => {
      setIsUpdating(true);
      try {
          const { data: updatedUser } = await axiosInstance.patch('/api/users/profile', updateData);
          setUser(updatedUser); // Update user in Zustand store
      } catch (error) {
          toast.error('Failed to update profile.');
      } finally {
          setIsUpdating(false);
      }
  };

  const handleNameSubmit = (e) => {
      e.preventDefault();
      if(name !== user.name) {
          handleProfileUpdate({ name });
          toast.success('Name updated!');
      }
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold tracking-tight">Profile Settings</h2>
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={user.profilePicture?.url || `https://ui-avatars.com/api/?name=${user.name}&background=D32F2F&color=fff&size=96`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <label htmlFor="profilePicInput" className="absolute -bottom-1 -right-1 cursor-pointer bg-white p-1.5 rounded-full border border-black/10 shadow-sm hover:bg-gray-light">
            <UploadCloud className="w-4 h-4 text-gray-medium" />
            <input type="file" id="profilePicInput" className="sr-only" onChange={handleFileChange} disabled={isUploading} accept="image/*" />
          </label>
        </div>
        <form onSubmit={handleNameSubmit} className="flex-1 w-full">
            <label className="text-sm font-medium">Full Name</label>
            <div className="mt-1 flex gap-2">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-pran-blue/30" />
                <button type="submit" disabled={isUpdating || name === user.name} className="rounded-lg bg-pran-red text-white px-4 py-2 text-sm hover:bg-[#b72828] transition disabled:opacity-50">
                    Save
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;