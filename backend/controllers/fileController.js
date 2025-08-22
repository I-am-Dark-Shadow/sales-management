import SharedFile from '../models/sharedFileModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Upload a new shared file record
// @route   POST /api/files
// @access  Private/Manager
const uploadFileRecord = async (req, res) => {
  const { fileName, fileInfo, fileType } = req.body;
  if (!fileName || !fileInfo || !fileType) {
    return res.status(400).json({ message: 'Missing required file data.' });
  }

  const file = new SharedFile({
    fileName,
    fileInfo,
    fileType,
    uploadedBy: req.user._id,
  });

  const createdFile = await file.save();
  res.status(201).json(createdFile);
};

// @desc    Get all shared files
// @route   GET /api/files
// @access  Private
const getSharedFiles = async (req, res) => {
    const files = await SharedFile.find({})
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 });
    res.json(files);
};

// @desc    Delete a shared file
// @route   DELETE /api/files/:id
// @access  Private/Manager
const deleteSharedFile = async (req, res) => {
    const file = await SharedFile.findById(req.params.id);
    if (!file) {
        return res.status(404).json({ message: 'File not found.' });
    }

    // Ensure only the uploader can delete (or any manager)
    if (req.user.role !== 'MANAGER') {
        return res.status(403).json({ message: 'Not authorized to delete this file.' });
    }

    try {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(file.fileInfo.publicId, { resource_type: "raw" });
        // Delete from database
        await file.deleteOne();
        res.json({ message: 'File removed successfully.' });
    } catch (error) {
        console.error("Cloudinary deletion error:", error);
        res.status(500).json({ message: 'Error removing file from storage.' });
    }
};

export { uploadFileRecord, getSharedFiles, deleteSharedFile };