import express from 'express';
import { chatWithAgent, chatWithAgentManager, chatWithAgentManagerUsingHandoff, chatWithGPT, chatWithWeatherAgentTool } from '../controller/openAIController.js';

export const openAIRouter = express.Router();

openAIRouter.get('/chatgpt', chatWithGPT);
openAIRouter.get('/agent', chatWithAgent);
openAIRouter.get('/agentTool', chatWithWeatherAgentTool);
openAIRouter.get('/agentManager', chatWithAgentManager);
openAIRouter.get('/chatWithAgentManagerUsingHandoff', chatWithAgentManagerUsingHandoff);




