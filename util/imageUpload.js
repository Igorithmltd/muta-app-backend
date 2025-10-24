require('dotenv').config()
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')

// configure cloudinary
cloudinary.config({
    // secure: true,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

function getPublicIdFromUrl(imageUrl) {
  const splittedUrls = imageUrl.split('/')
  const res = splittedUrls[splittedUrls.length - 1].split('.')[0]
  if(res){
    return res
  }
  return null;
}

async function deleteImage(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(result, 'deleted successfully');
  } catch (err) {
    console.log(err);
  }
}

function createMulterInstance (folder, transformation = [], resourceType = 'image') {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      resource_type: resourceType,
      transformation: transformation
    }
  });

  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

      if (resourceType === 'image' && imageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else if (resourceType === 'video' && videoTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file format. Only supported formats are JPEG, PNG, WEBP for images and MP4, WEBM, OGG for videos.'), false);
      }
    }
  });
}


const image_uploader = createMulterInstance('muta-images', [{width: 500, height: 500, crop: 'limit'}])
const video_uploader = createMulterInstance('muta-videos', [], 'video');


module.exports = { image_uploader, getPublicIdFromUrl, deleteImage, video_uploader }