const ProductController = require('../controllers/product.controller')
const auth = require('../middlewares/auth')
const adminAuth = require('../middlewares/adminAuth')
const { ROUTE_CREATE_PRODUCT, ROUTE_GET_PRODUCT, ROUTE_GET_ALL_PRODUCTS, ROUTE_UPDATE_PRODUCT, ROUTE_DELETE_PRODUCT, ROUTE_CREATE_PRODUCT_CATEGORY, ROUTE_GET_PRODUCT_CATEGORY, ROUTE_GET_ALL_PRODUCT_CATEGORIES, ROUTE_UPDATE_PRODUCT_CATEGORY, ROUTE_DELETE_PRODUCT_CATEGORY } = require('../util/page-route')

const router = require('express').Router()

/**
 * @swagger
 * /products/create-product:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the product
 *                 example: Sneaker 5
 *               price:
 *                 type: number
 *                 description: Price of the product
 *                 example: 4000
 *               category:
 *                 type: string
 *                 description: Category of the product
 *                 example: 686265149ba9c6ad79f60bfe
 *               color:
 *                 type: string
 *                 description: Color of the product
 *                 example: red
 *               description:
 *                 type: string
 *                 description: Description of the product
 *                 example: Best sneakers in anambra
 *               size:
 *                 type: Number
 *                 description: Size of the product
 *                 example: 44
 *               stock:
 *                 type: number
 *                 description: Stock of the product
 *                 example: 101
 *               image:
 *                 type: object
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                     example: https://cloudinary/muta-app/48858483.jpg
 *                   publicId:
 *                     type: string
 *                     example: dlmgki54ifu
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *       400:
 *         description: Bad request, such as missing or invalid fields
 *       500:
 *         description: Server error
 */
router.post(ROUTE_CREATE_PRODUCT, adminAuth, (req, res)=>{
    const productController = new ProductController()
    return productController.createProduct(req, res)
})

/**
 * @swagger
 * /products/get-product/{id}:
 *   get:
 *     summary: Get one product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to get
 *         example: "6863d1d9f94e880960616e38"
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Title of the product
 *                   example: Sneaker 5
 *                 price:
 *                   type: number
 *                   description: Price of the product
 *                   example: 4000
 *                 category:
 *                   type: string
 *                   description: Category of the product
 *                   example: 686265149ba9c6ad79f60bfe
 *                 color:
 *                   type: string
 *                   description: Color of the product
 *                   example: red
 *                 description:
 *                   type: string
 *                   description: Description of the product
 *                   example: Best sneakers in anambra
 *                 size:
 *                   type: Number
 *                   description: Size of the product
 *                   example: 44
 *                 stock:
 *                   type: number
 *                   description: Stock of the product
 *                   example: 101
 *                 image:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       example: https://cloudinary/muta-app/48858483.jpg
 *                     publicId:
 *                       type: string
 *                       example: dlmgki54ifu
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_PRODUCT+"/:id", auth, (req, res)=>{
    const productController = new ProductController()
    return productController.getProduct(req, res)
})

/**
 * @swagger
 * /products/get-all-products:
 *   get:
 *     summary: get all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Title of the product
 *                     example: Sneaker 5
 *                   price:
 *                     type: number
 *                     description: Price of the product
 *                     example: 4000
 *                   category:
 *                     type: string
 *                     description: Category of the product
 *                     example: 686265149ba9c6ad79f60bfe
 *                   color:
 *                     type: string
 *                     description: Color of the product
 *                     example: red
 *                   description:
 *                     type: string
 *                     description: Description of the product
 *                     example: Best sneakers in anambra
 *                   size:
 *                     type: Number
 *                     description: Size of the product
 *                     example: 44
 *                   stock:
 *                     type: number
 *                     description: Stock of the product
 *                     example: 101
 *                   image:
 *                     type: object
 *                     properties:
 *                       imageUrl:
 *                         type: string
 *                         example: https://cloudinary/muta-app/48858483.jpg
 *                       publicId:
 *                         type: string
 *                         example: dlmgki54ifu
 *       404:
 *         description: Products not found
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_ALL_PRODUCTS, auth, (req, res)=>{
    const productController = new ProductController()
    return productController.getAllProducts(req, res)
})

/**
 * @swagger
 * /products/update-product/{id}:
 *   put:
 *     summary: Update one product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to update
 *         example: "6863d1d9f94e880960616e38"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_UPDATE_PRODUCT+"/:id", adminAuth, (req, res)=>{
    const productController = new ProductController()
    return productController.updateProduct(req, res)
})

/**
 * @swagger
 * /products/delete-product/{id}:
 *   delete:
 *     summary: Delete one product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to delete
 *         example: "6863d1d9f94e880960616e38"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete(ROUTE_DELETE_PRODUCT+"/:id", adminAuth, (req, res)=>{
    const productController = new ProductController()
    return productController.deleteProduct(req, res)
})

//product category
/**
 * @swagger
 * /products/create-product-category:
 *   post:
 *     summary: Create a new product category
 *     tags:
 *       - Products Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the product category
 *                 example: shoes
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *       400:
 *         description: Bad request, such as missing or invalid fields
 *       500:
 *         description: Server error
 */
router.post(ROUTE_CREATE_PRODUCT_CATEGORY, adminAuth, (req, res)=>{
    const productController = new ProductController()
    return productController.createProduct(req, res)
})

/**
 * @swagger
 * /products/get-product-category/{id}:
 *   get:
 *     summary: Get one product category by ID
 *     tags:
 *       - Products Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product category to get
 *         example: "6863d1d9f94e880960616e38"
 *     responses:
 *       200:
 *         description: Product category fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Title of the product category
 *                   example: shoes
 *       404:
 *         description: Product category not found
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_PRODUCT_CATEGORY+"/:id", auth, (req, res)=>{
    const productController = new ProductController()
    return productController.getProduct(req, res)
})

/**
 * @swagger
 * /products/get-all-product-categories:
 *   get:
 *     summary: get all products categories
 *     tags:
 *       - Products Categories
 *     responses:
 *       200:
 *         description: Products categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Title of the product category
 *                     example: shoes
 *       404:
 *         description: Product categories not found
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_ALL_PRODUCT_CATEGORIES, auth, (req, res)=>{
    const productController = new ProductController()
    return productController.getAllProducts(req, res)
})

/**
 * @swagger
 * /products/update-product-category/{id}:
 *   put:
 *     summary: Update one product category by ID
 *     tags:
 *       - Products Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to update
 *         example: "6863d1d9f94e880960616e38"
 *     responses:
 *       200:
 *         description: Product category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product category updated successfully
 *       404:
 *         description: Product category not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_UPDATE_PRODUCT_CATEGORY+"/:id", adminAuth, (req, res)=>{
    const productController = new ProductController()
    return productController.updateProduct(req, res)
})

/**
 * @swagger
 * /products/delete-product-category/{id}:
 *   delete:
 *     summary: Delete one product category by ID
 *     tags:
 *       - Products Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to delete
 *         example: "6863d1d9f94e880960616e38"
 *     responses:
 *       200:
 *         description: Product category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product category deleted successfully
 *       404:
 *         description: Product category not found
 *       500:
 *         description: Server error
 */
router.delete(ROUTE_DELETE_PRODUCT_CATEGORY+"/:id", adminAuth, (req, res)=>{
    const productController = new ProductController()
    return productController.deleteProduct(req, res)
})

module.exports = router