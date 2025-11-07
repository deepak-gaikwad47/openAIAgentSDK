import express from 'express';
import { connectDB } from './config/db.js';
import { configuration } from './config/configuration.js';
import { userRouter } from './routes/userRouter.js';
import { openAIRouter } from './routes/openAIRouter.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/user', userRouter);
app.use('/api/openAI', openAIRouter);


await connectDB();

app.listen(configuration.PORT, () => {
  console.log(`Server is running on http://localhost:${configuration.PORT}`);
});