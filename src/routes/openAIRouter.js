import express from 'express';
import { chatWithAgent, chatWithAgentManager, chatWithAgentManagerUsingHandoff, chatWithGPT, chatWithmathAgentWithGuardian, chatWithWeatherAgentTool } from '../controller/openAIController.js';

export const openAIRouter = express.Router();

openAIRouter.get('/chatgpt', chatWithGPT);
openAIRouter.get('/agent', chatWithAgent);
openAIRouter.get('/agentTool', chatWithWeatherAgentTool);
// patterns
openAIRouter.get('/agentManager', chatWithAgentManager);
openAIRouter.get('/chatWithAgentManagerUsingHandoff', chatWithAgentManagerUsingHandoff);
// gaurdian
openAIRouter.get('/mathAgentWithGuardian', chatWithmathAgentWithGuardian);





