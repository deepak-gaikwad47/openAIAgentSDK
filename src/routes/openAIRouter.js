import express from 'express';
import { chatWithAgent, chatWithGPT, chatWithWeatherAgentTool } from '../controller/openAIController.js';

export const openAIRouter = express.Router();

openAIRouter.get('/chatgpt', chatWithGPT);
openAIRouter.get('/agent', chatWithAgent);
openAIRouter.get('/agentTool', chatWithWeatherAgentTool);


