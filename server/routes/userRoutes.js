import express from 'express'
import { getUserById, getUserResumes, loginUser, registerUser } from '../controllers/UserController';
import protect from '../middlewares/authMiddleware';


const userRouter = express.Router();
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserById )
userRouter.get('/resumes', protect, getUserResumes)

export default userRouter;