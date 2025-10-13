const ProductController = require('../controllers/product.controller')
const auth = require('../middlewares/auth')
const adminAuth = require('../middlewares/adminAuth')
const { ROUTE_CREATE_PRODUCT, ROUTE_GET_PRODUCT, ROUTE_GET_ALL_PRODUCTS, ROUTE_UPDATE_PRODUCT, ROUTE_DELETE_PRODUCT, ROUTE_CREATE_PRODUCT_CATEGORY, ROUTE_GET_PRODUCT_CATEGORY, ROUTE_GET_ALL_PRODUCT_CATEGORIES, ROUTE_UPDATE_PRODUCT_CATEGORY, ROUTE_DELETE_PRODUCT_CATEGORY, ROUTE_ADD_PRODUCT_TO_FAVORITE, ROUTE_REMOVE_PRODUCT_FROM_FAVORITE, ROUTE_REVIEW_PRODUCT, ROUTE_GET_PRODUCT_REVIEWS, ROUTE_GET_FAVORITES } = require('../util/page-route')

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
 *               - price
 *               - category
 *               - description
 *               - keyFeatures
 *               - images
 *               - variations
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the product
 *                 example: Men's Running Shoe
 *               description:
 *                 type: string
 *                 description: Description of the product
 *                 example: Lightweight and breathable running shoe
 *               price:
 *                 type: number
 *                 description: Base price of the product
 *                 example: 5500
 *               category:
 *                 type: string
 *                 description: Category of the product
 *                 example: Footwear
 *               keyFeatures:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Key features of the product
 *                 example: ["lightweight", "durable"]
 *               images:
 *                 type: array
 *                 description: General product images
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://example.com/image.jpg
 *                     publicId:
 *                       type: string
 *                       example: product-image-public-id
 *               variations:
 *                 type: array
 *                 description: Product variations (color, size, stock)
 *                 items:
 *                   type: object
 *                   required:
 *                     - color
 *                     - size
 *                     - stock
 *                   properties:
 *                     color:
 *                       type: string
 *                       description: Color of the variation
 *                       example: Red
 *                     size:
 *                       type: string
 *                       description: Size of the variation
 *                       example: "42"
 *                     stock:
 *                       type: number
 *                       description: Stock available for this variation
 *                       example: 10
 *                     price:
 *                       type: number
 *                       description: Optional price override for the variation
 *                       example: 5800
 *                     sku:
 *                       type: string
 *                       description: SKU for the variation
 *                       example: SHOE-RED-42
 *                     images:
 *                       type: array
 *                       description: Images specific to this variation
 *                       items:
 *                         type: object
 *                         properties:
 *                           imageUrl:
 *                             type: string
 *                             format: uri
 *                             example: https://example.com/variation-image.jpg
 *                           publicId:
 *                             type: string
 *                             example: variation-image-public-id
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
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Color of the product
 *                     example: "#fffbee"
 *                 size:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: size of the product
 *                     example: "54"
 *                 keyFeatures:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: key features of the product
 *                     example: "lightweight, durable"
 *                 description:
 *                   type: string
 *                   description: Description of the product
 *                   example: Best sneakers in anambra
 *                 stock:
 *                   type: number
 *                   description: Stock of the product
 *                   example: 101
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       imageUrl:
 *                         type: string
 *                         example: https://cloudinary/muta-app/48858483.jpg
 *                       publicId:
 *                         type: string
 *                         example: dlmgki54ifu
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
 *     summary: Get all products or products filtered by category
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Category ID to filter products by
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
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Colors of the product
 *                     example: ["#fffbee", "#000000"]
 *                   size:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Sizes of the product
 *                     example: ["42", "43", "44"]
 *                   keyFeatures:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Key features of the product
 *                     example: ["lightweight", "durable"]
 *                   description:
 *                     type: string
 *                     description: Description of the product
 *                     example: Best sneakers in Anambra
 *                   stock:
 *                     type: number
 *                     description: Stock quantity of the product
 *                     example: 101
 *                   images:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         imageUrl:
 *                           type: string
 *                           example: https://cloudinary/muta-app/48858483.jpg
 *                         publicId:
 *                           type: string
 *                           example: dlmgki54ifu
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
    return productController.createProductCategory(req, res)
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
    return productController.getAllProductCategories(req, res)
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

/**
 * @swagger
 * /products/get-favorites:
 *   get:
 *     summary: Get all favorite products of the authenticated user
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []      # Assuming you use bearer token auth
 *     responses:
 *       200:
 *         description: Favorite products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: ID of the user
 *                   example: 615d7f92b6e17c1a9f7c4b3d
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Product ID
 *                         example: 615d7f92b6e17c1a9f7c4b4a
 *                       title:
 *                         type: string
 *                         description: Title of the product
 *                         example: Sneaker 5
 *                       price:
 *                         type: number
 *                         description: Price of the product
 *                         example: 4000
 *                       category:
 *                         type: string
 *                         description: Category of the product
 *                         example: 686265149ba9c6ad79f60bfe
 *                       description:
 *                         type: string
 *                         description: Description of the product
 *                         example: Best sneakers in Anambra
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             imageUrl:
 *                               type: string
 *                               example: https://cloudinary/muta-app/48858483.jpg
 *                             publicId:
 *                               type: string
 *                               example: dlmgki54ifu
 *       404:
 *         description: Favorite products not found
 *       500:
 *         description: Server error
 */
router.get(ROUTE_GET_FAVORITES, auth, (req, res)=>{
    const productController = new ProductController()
    return productController.getFavorites(req, res)
})

/**
 * @swagger
 * /products/add-product-to-favorite:
 *   put:
 *     summary: Add a product to user's favorites
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "64b123456abcde0001345678"
 *     responses:
 *       200:
 *         description: Product added to favorites
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
 *                   example: Product added to favorites
 *       400:
 *         description: Product is already in favorites
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put(ROUTE_ADD_PRODUCT_TO_FAVORITE, auth, (req, res)=>{
    const productController = new ProductController()
    return productController.addProductToFavorites(req, res)
})

/**
 * @swagger
 * /products/remove-product-from-favorite:
 *   put:
 *     summary: Remove a product from user's favorites
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "64b123456abcde0001345678"
 *     responses:
 *       200:
 *         description: Product removed from favorites
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
 *                   example: Product removed from favorites
 *       400:
 *         description: Product is not in favorites
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(ROUTE_REMOVE_PRODUCT_FROM_FAVORITE, auth, (req, res)=>{
    const productController = new ProductController()
    return productController.removeFavoriteProduct(req, res)
})

/**
 * @swagger
 * /products/review-product/{id}:
 *   post:
 *     summary: Add a review and rating to a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating score (1 to 5)
 *               comment:
 *                 type: string
 *                 description: Optional review comment
 *     responses:
 *       200:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review added successfully
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Rating is required and must be between 1 and 5.
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product not found
 */
router.post(ROUTE_REVIEW_PRODUCT+"/:id", auth, (req, res)=>{
    const productController = new ProductController()
    return productController.reviewProduct(req, res)
})

/**
 * @swagger
 * /products/get-product-reviews/{id}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to get reviews for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews per page (optional)
 *     responses:
 *       200:
 *         description: List of reviews for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalReviews:
 *                   type: integer
 *                   example: 25
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 60f7c4ef3b56c72f8c8a1234
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                       rating:
 *                         type: integer
 *                         example: 4
 *                       comment:
 *                         type: string
 *                         example: Great product, highly recommend!
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-04-26T15:24:00Z
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product not found
 */
router.get(ROUTE_GET_PRODUCT_REVIEWS+"/id", auth, (req, res)=>{
    const productController = new ProductController()
    return productController.getAllProductReview(req, res)
})

module.exports = router