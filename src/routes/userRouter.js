import express from 'express';
import { createUser, getUsers } from '../controller/userController.js';

export const userRouter = express.Router();

userRouter.get('/getAll', getUsers);
userRouter.post('/create', createUser);
