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

async function deleteImage(publicId) {
  // try{
    const result = await cloudinary.uploader.destroy(publicId, function(err, result){
      if(err){
        return console.log(err)
      }
      console.log(result,'deleted successfully')
    });
}

function createMulterInstance (folder, transformation) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      transformation: transformation
    }
  })
  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
          cb(null, true);
        } else {
          cb(new Error('Invalid file format. Only JPEG, WEBP and PNG images are allowed.'), false);
        }
      }
  })
}
const image_uploader = createMulterInstance('app-sar', [{width: 500, height: 500, crop: 'limit'}])

module.exports = { image_uploader, getPublicIdFromUrl, deleteImage }