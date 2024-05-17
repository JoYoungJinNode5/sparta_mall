import express from "express";
import Joi from "joi";
import Products from "../schemas/product.schema.js";

const router = express.Router();

const createTodoSchema = Joi.object({
  value: Joi.string().min(1).max(50).required(),
});

// 상품생성 API
router.post("/products", async (req, res, next) => {
  // 1. 클라이언트로가 보낸 리퀘스트 데이터 저장
  const { name, description, manager, password } = req.body;

  // 2. 유효성 검사
  // 2-1. 만약 이미 등록된 상품이라면? -> 400, 이미 등록된 상품입니다.
  const existingName = await Products.findOne({ name }).exec();
  if (existingName) {
    return res.status(400).json({
      status: "400",
      message: "이미 등록된 상품입니다.",
    });
  }
  // 2-2. 필요한 정보를 모두 입력하지 않은 경우 -> 400, 상품 정보를 모두 입력해주세요.
  if (!name || !description || !manager || !password) {
    return res.status(400).json({
      status: "400",
      message: "상품 정보를 모두 입력해주세요.",
    });
  }

  // 3. 상품(product) 생성(C)
  const newProduct = new Products({
    name: name,
    description: description,
    manager: manager,
    password: password,
  });

  // 4. 상품 등록
  await newProduct.save();

  // 5. 생성된 상품 정보를 클라이언트에게 응답(Response) 반환!
  return res.status(201).json({
    status: "201",
    message: "상품 생성에 성공했습니다.",
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

/** 상품 목록 조회(R),[GET],'/products' API **/
router.get("/products", async (req, res, next) => {
  // 1. 상품 목록 조회를 진행한다.
  const products = await Products.find().sort("-createdAt").exec();

  // 2. 상품 목록 조회 결과를 클라이언트에게 반환한다.
  return res.status(200).json({
    status: "200",
    message: "상품 목록 조회에 성공했습니다.",
    data: [products],
  });
});

/** 상품 상세 조회(R),[GET],'/products/:id' API **/
router.get("/products/:productId", async (req, res, next) => {
  // 1. 경로매개변수에서 productId 가져오기
  const { productId } = req.params;
  // 2. 현재 나의 product를 조회해온다
  const currentProduct = await Products.findById(productId).exec();
  // 3. 만약 해당 id의 상품이 존재하지 않는 경우 -> 404, 상품이 존재하지 않습니다.
  if (!currentProduct) {
    return res.status(404).json({
      status: "404",
      message: "상품이 존재하지 않습니다.",
    });
  }
  // 4. 상품 상세 조회 결과를 클라이언트에게 반환한다.
  return res.status(200).json({
    status: "200",
    message: "상품 상세 조회에 성공했습니다.",
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

/** 상품 수정(U),[PATCH],'/products/:id' API **/
router.patch("/products/:productId", async (req, res, next) => {
  // 1. 경로매개변수에서 productId 가져오기
  const { productId } = req.params;
  // 2. 현재 나의 product를 조회해온다
  const currentProduct = await Products.findById(productId).exec();
  // 3. 만약 해당 id의 상품이 존재하지 않는 경우 -> 404, 상품이 존재하지 않습니다.
  if (!currentProduct) {
    return res.status(404).json({
      status: "404",
      message: "상품이 존재하지 않습니다.",
    });
  }
  // 4. 수정하고자 하는 내용을 수정한다. 일단 req.body내용을 불러온다.
  const { name, description, manager, status } = req.body;

  // 4-1. 만약 수정된 내용 중 누락된 항목이 있는 경우
  if (!name || !description || !manager || !status) {
    return res.status(400).json({
      status: "400",
      message: "상품 정보를 모두 입력해주세요.",
    });
  }
  // 4-2. 만약 수정된 이름이 이미 존재하는 이름인 경우
  if (name) {
    const existingName = await Products.findOne({ name }).exec();
    if (existingName) {
      return res.status(400).json({
        status: "400",
        message: "이미 등록된 상품입니다.",
      });
    }
  }
  // 4-3. 만약 status가 "FOR_SALE"이나 "SOLD_OUT"이 아닌 경우
  if (status !== "FOR_SALE" && status !== "SOLD_OUT") {
    return res.status(400).json({
      status: "400",
      message: "status는 FOR_SALE 혹은 SOLD_OUT만 가능합니다.",
    });
  }
  // 4-4. 수정된 내용을 할당한다.
  currentProduct.name = name;
  currentProduct.description = description;
  currentProduct.manager = manager;
  currentProduct.status = status;
  const updatedAt = new Date();
  currentProduct.updatedAt = updatedAt;
  // 4-5. 수정된 내용을 최종 저장한다.
  await currentProduct.save();
  // 5. 수정된 결과를 클라이언트에 반환한다.
  return res.status(200).json({
    status: "200",
    message: "상품 수정에 성공했습니다.",
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

/** 상품 삭제(D),[DELETE],'/products/:id' API **/
router.delete("/products/:productId", async (req, res, next) => {
  // 1. 경로매개변수에서 productId 가져오기
  const { productId } = req.params;
  // 2. 현재 나의 product를 조회해온다
  const currentProduct = await Products.findById(productId).exec();
  // 3. 유효성 검사
  // 3-1. 만약 해당 id의 상품이 존재하지 않는 경우 -> 404, 상품이 존재하지 않습니다.
  if (!currentProduct) {
    return res.status(404).json({
      status: "404",
      message: "상품이 존재하지 않습니다.",
    });
  }
  // 3-2. 비밀번호
  const { password } = req.body;
  // 3-2-1. 비밀번호를 입력하지 않은 경우 -> 400, 비밀번호를 입력하지 않았습니다.
  if (!password) {
    return res.status(400).json({
      status: "400",
      message: "비밀번호를 입력해주세요.",
    });
  }
  // 3-2-2. 만약 비밀번호가 일치하지 않는 경우 -> 400, 비밀번호가 일치하지 않습니다.
  if (password !== currentProduct.password) {
    return res.status(401).json({
      status: "401",
      message: "비밀번호가 일치하지 않습니다.",
    });
  }
  // 4. 삭제한다.
  await Products.deleteOne({ _id: productId });
  // 5. 삭제된 결과를 클라이언트에 반환한다.
  return res.status(200).json({
    status: "200",
    message: "상품 삭제에 성공했습니다.",
    data: {
      id: productId,
    },
  });
});

export default router;
