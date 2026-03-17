const cloudinary = require('../utils/cloudinary');
const multer = require('multer');


const storage = multer.memoryStorage();


const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
}).single('image');


const uploadImage = async (req, res) => {
    
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
       
        const result = await cloudinary.uploader.upload(
            
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            {
                folder: 'campus-bites/menu-items', 
                resource_type: 'image',
            }
        );

        
        res.status(200).json({
            message: 'Image uploaded successfully.',
            imageUrl: result.secure_url,
            publicId: result.public_id 
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ error: 'Image upload failed. Check Cloudinary settings.' });
    }
};

module.exports = {
    upload,
    uploadImage, 
};