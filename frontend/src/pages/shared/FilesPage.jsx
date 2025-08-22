import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { uploadFile } from '../../api/uploadService';
import { UploadCloud, File, Download, Trash2 } from 'lucide-react';

const FilesPage = () => {
  const { user } = useAuthStore();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/files');
      setFiles(data);
    } catch (error) {
      toast.error("Failed to load files.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !fileName) {
        toast.error("Please provide a file name and select a file.");
        return;
    }
    
    setIsUploading(true);
    const toastId = toast.loading("Uploading to cloud...");
    try {
        const uploadedFile = await uploadFile(file);
        toast.loading("Saving file record...", { id: toastId });
        
        await axiosInstance.post('/api/files', {
            fileName,
            fileInfo: uploadedFile,
            fileType: file.type || 'unknown'
        });

        toast.success("File uploaded successfully!", { id: toastId });
        setFileName('');
        fetchFiles();
    } catch (error) {
        toast.error("Upload failed.", { id: toastId });
    } finally {
        setIsUploading(false);
        e.target.value = null;
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to permanently delete this file?")) return;
    try {
        await axiosInstance.delete(`/api/files/${fileId}`);
        toast.success("File deleted.");
        fetchFiles();
    } catch (error) {
        toast.error("Failed to delete file.");
    }
  };

  return (
    <div className="space-y-6">
      {user.role === 'MANAGER' && (
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="text-lg font-semibold tracking-tight">Upload New Shared File</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4 items-end">
            <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="Enter a display name for the file" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
            <input type="file" onChange={handleFileChange} disabled={isUploading} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pran-red/10 file:text-pran-red hover:file:bg-pran-red/20" />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-lg font-semibold tracking-tight">Shared Files Repository</h2>
        <div className="mt-4 space-y-3">
            {isLoading ? <p>Loading files...</p> : files.map(file => (
                <div key={file._id} className="p-3 rounded-lg border border-black/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <File className="w-6 h-6 text-pran-blue" />
                        <div>
                            <p className="font-medium">{file.fileName}</p>
                            <p className="text-xs text-gray-medium">Uploaded by {file.uploadedBy.name} on {new Date(file.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href={file.fileInfo.url} target="_blank" rel="noopener noreferrer" download className="p-2 rounded-md hover:bg-gray-light transition"><Download className="w-4 h-4" /></a>
                        {user.role === 'MANAGER' && (
                            <button onClick={() => handleDelete(file._id)} className="p-2 rounded-md hover:bg-gray-light transition"><Trash2 className="w-4 h-4 text-pran-red"/></button>
                        )}
                    </div>
                </div>
            ))}
            {!isLoading && files.length === 0 && <p className="text-center py-8 text-gray-medium">No files have been shared yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default FilesPage;