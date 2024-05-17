import express from 'express';
import connect from './schemas/index.js';
import productsRouter from 'routers/products.router.js';

const app = express();
const PORT = 3000;

connect();

// 바디 데이터로 접근과 사용
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

app.use('/', [router, productsRouter]);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!!');
});
