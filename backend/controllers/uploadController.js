import cloudinary from '../config/cloudinary.js';

// @desc    Get Cloudinary signature for upload
// @route   GET /api/uploads/signature
// @access  Private
const getCloudinarySignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({ timestamp, signature });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating signature.' });
  }
};

export { getCloudinarySignature };