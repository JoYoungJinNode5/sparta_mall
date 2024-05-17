import express from 'express';
import Joi from 'joi';
import Products from '../schemas/product.schema.js';

const router = express.Router();

const createTodoSchema = Joi.object({
  value: Joi.string().min(1).max(50).required(),
});

// 상품생성 API
router.post('/products', async (req, res, next) => {
  //try{
  const { name, description, manager, password } = req.body;

  // 유효성 검사
  const existingName = await Products.findOne({ name }).exec();
  if (existingName) {
    return res.status(400).json({
      status: '400',
      message: '이미 등록된 상품입니다.',
    });
  }
  if (!name || !description || !manager || !password) {
    return res.status(400).json({
      status: '400',
      message: '상품 정보를 전부 입력하셔야합니다.',
    });
  }

  const newProduct = new Products({
    name: name,
    description: description,
    manager: manager,
    password: password,
  });

  await newProduct.save();

  return res.status(201).json({
    status: '201',
    message: '상품 생성에 성공했습니다.',
    data: {
      id: newProduct._id,
      name: name,
      description: description,
      manager: manager,
      status: newProduct.status,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt,
    },
  });
});

// 상품 목록 조회 api
router.get('/products', async (req, res, next) => {
  const products = await Products.find().sort('-createdAt').exec();

  return res.status(200).json({
    status: '200',
    message: '상품 목록 조회에 성공했습니다.',
    data: [products],
  });
});

// 상품 상세 조회 api
router.get('/products/:productId', async (req, res, next) => {
  const { productId } = req.params;
  const currentProduct = await Products.findById(productId).exec();
  if (!currentProduct) {
    return res.status(404).json({
      status: '404',
      message: '상품이 존재하지 않습니다.',
    });
  }
  return res.status(200).json({
    status: '200',
    message: '상품 상세 조회에 성공했습니다.',
    data: {
      id: currentProduct._id,
      name: currentProduct.name,
      description: currentProduct.description,
      manager: currentProduct.manager,
      status: currentProduct.status,
      createdAt: currentProduct.createdAt,
      updatedAt: currentProduct.updatedAt,
    },
  });
});

// 상품 수정 api
router.patch('/products/:productId', async (req, res, next) => {
  const { productId } = req.params;
  const currentProduct = await Products.findById(productId).exec();
  if (!currentProduct) {
    return res.status(404).json({
      status: '404',
      message: '상품이 존재하지 않습니다.',
    });
  }
  const { name, description, manager, status } = req.body;

  if (!name || !description || !manager || !status) {
    return res.status(400).json({
      status: '400',
      message: '상품 정보를 전부 입력하셔야합니다.',
    });
  }
  if (name) {
    const existingName = await Products.findOne({ name }).exec();
    if (existingName) {
      return res.status(400).json({
        status: '400',
        message: '이미 등록된 상품입니다.',
      });
    }
  }
  if (status !== 'FOR_SALE' && status !== 'SOLD_OUT') {
    return res.status(400).json({
      status: '400',
      message: 'status는 FOR_SALE 혹은 SOLD_OUT만 가능합니다.',
    });
  }

  currentProduct.name = name;
  currentProduct.description = description;
  currentProduct.manager = manager;
  currentProduct.status = status;
  const updatedAt = new Date();
  currentProduct.updatedAt = updatedAt;

  await currentProduct.save();

  return res.status(200).json({
    status: '200',
    message: '상품 정보 수정에 성공했습니다.',
    data: {
      id: currentProduct._id,
      name: currentProduct.name,
      description: currentProduct.description,
      manager: currentProduct.manager,
      status: currentProduct.status,
      createdAt: currentProduct.createdAt,
      updatedAt: currentProduct.updatedAt,
    },
  });
});

// 상품 삭제 api
router.delete('/products/:productId', async (req, res, next) => {
  const { productId } = req.params;
  const currentProduct = await Products.findById(productId).exec();

  if (!currentProduct) {
    return res.status(404).json({
      status: '404',
      message: '상품이 존재하지 않습니다.',
    });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      status: '400',
      message: '비밀번호를 입력해주세요.',
    });
  }

  if (password !== currentProduct.password) {
    return res.status(401).json({
      status: '401',
      message: '비밀번호가 일치하지 않습니다.',
    });
  }
  await Products.deleteOne({ _id: productId });
  return res.status(200).json({
    status: '200',
    message: '상품 삭제에 성공했습니다.',
    data: {
      id: productId,
    },
  });
});

export default router;
