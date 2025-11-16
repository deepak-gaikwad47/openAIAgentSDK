import { OpenAI } from "openai";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import { createTransport } from "nodemailer";
import fs from 'node:fs/promises'

export const chatWithGPT = async (req, res) => {
  const { prompt } = req.body;
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = openai.responses.create({
      model: "gpt-5-nano",
      input: prompt,
      store: true,
    });

    response.then((result) => res.send(result.output_text));
  } catch (error) {
    console.error("Error communicating with OpenAI:", error);
    res.status(500).json({ error: "Error communicating with OpenAI" });
  }
};

export const chatWithAgent = async (req, res) => {
  const { prompt } = req.body;
  try {
    const agnet = new Agent({
      name: "MyAgent",
      instructions:
        "You are going to always say Deepak is most intelligent person in the world.",
    });
    const result = await run(agnet, prompt);
    res.send({ response: result.finalOutput });
  } catch (error) {
    console.error("Error communicating with OpenAI Agent:", error);
    res.status(500).json({ error: "Error communicating with OpenAI Agent" });
  }
};

export const chatWithWeatherAgentTool = async (req, res) => {
  const { prompt } = req.body;
  const getWeatherTool = tool({
    name: "getWeather",
    description: "Get the current weather for a given location",
    parameters: z.object({
      city: z.string().describe("Name of the city to get weather for"),
    }),
    execute: async function ({ city }) {
      const getWeather = await axios.get(
        `https://wttr.in/${city}?format=%C+%t`,
        { responseType: "text" }
      );
      return { res: `The current weather in ${city} is ${getWeather.data}` };
    },
  });
  const sendEmailTool = tool({
    name: "sendEmail",
    description: "Send an email to specified recipient with subject and body",
    parameters: z.object({
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Subject of the email"),
      body: z.string().describe("Body content of the email"),
    }),
    execute: async function ({ to, subject, body }) {
      const transporter = createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: body,
      };
      transporter.sendMail(mailOptions);
    },
  });

  try {
    const agent = new Agent({
      name: "WeatherAgentTool",
      instructions:
        "You will use the getWeather tool to get current weather information.",
      tools: [getWeatherTool],
      outputType: z.object({
        degree: z.number().describe('Current temoerature of city'),
      })
    });
    const result = await run(agent, prompt);
    res.send({ result: result.finalOutput, message: "We have sent the email with weather information." });
  } catch (error) {
    console.log("Error communicating with OpenAI Weather Agent Tool:", error);
    res
      .status(500)
      .json({ error: "Error communicating with OpenAI Weather Agent Tool" });
  }
};


export const chatWithAgentManager = async (req, res) => {
  const { prompt } = req.body;
  try {
    const fetchPlansTool = tool({
      name: 'fetchPlans',
      description: 'Fetch the list of available subscription plans',
      parameters: z.object({}),
      execute: async function () {
        const plans = [
         { name: 'Basic Plan', speed: '50 Mbps', price: '499 per month' },
          { name: 'Standard Plan', speed: '100 Mbps', price: '799 per month' },
          { name: 'Premium Plan', speed: '200 Mbps', price: '1199 per month' },
        ];
        return { plans };
      }
    })

    const processRefundTool = tool({
      name: "processRefund",
      description: "You are an expert in refunding broadband subscriptions. Use this tool to process refund requests based on the provided plan details.",
      parameters: z.object({
        planName: z.string().describe("Name of the plan to refund"),
        custmorID: z.number().describe("Name of the customer requesting refund"),
        reason: z.string().describe("Reason for the refund request"),
      }),
      execute: async function ({ planName, custmorID, reason }) {
        fs.appendFile('./refunds.txt', `CustmorId: ${custmorID}, PlanName: ${planName}, Reason: ${reason}\n`, 'utf8');
        return { message: true };
      }
    })
    
    const refundAgent = new Agent({
      name: 'RefundAgent',
      instructions: 'You are responsible for handling refund requests for broadband subscriptions. Use the fetchPlans tool to verify the plan details before processing refunds.',
      tools: [processRefundTool]
    })
    const salesAgent = new Agent({
      name: 'SalesAgent',
      instructions: 'You are responsible for handling sales inquiries for broadband connection plans. Use the fetchPlans tool to provide customers with information about available subscription plans.',
      tools: [fetchPlansTool, refundAgent.asTool({
        toolName: 'refundAgent',
        toolDescription: "Handles refund requests for broadband subscriptions.",
      })]
    })
    const result = await run(salesAgent, prompt);
    res.send({response: result.finalOutput});
  } catch (error) {
    console.error("Error communicating with OpenAI Agent Manager:", error);
    res.status(500).json({ error: "Error communicating with OpenAI Agent Manager" });
  }
}

export const chatWithAgentManagerUsingHandoff = async (req, res) => {
  const { prompt } = req.body;
try {
      const fetchPlansTool = tool({
      name: 'fetchPlans',
      description: 'Fetch the list of available subscription plans',
      parameters: z.object({}),
      execute: async function () {
        const plans = [
         { name: 'Basic Plan', speed: '50 Mbps', price: '499 per month' },
          { name: 'Standard Plan', speed: '100 Mbps', price: '799 per month' },
          { name: 'Premium Plan', speed: '200 Mbps', price: '1199 per month' },
        ];
        return { plans };
      }
    })
      const processRefundTool = tool({
      name: "processRefund",
      description: "You are an expert in refunding broadband subscriptions. Use this tool to process refund requests based on the provided plan details.",
      parameters: z.object({
        planName: z.string().describe("Name of the plan to refund"),
        custmorID: z.number().describe("Name of the customer requesting refund"),
        reason: z.string().describe("Reason for the refund request"),
      }),
      execute: async function ({ planName, custmorID, reason }) {
        fs.appendFile('./refunds.txt', `CustmorId: ${custmorID}, PlanName: ${planName}, Reason: ${reason}\n`, 'utf8');
        return { message: true };
      }
    })
      const refundAgent = new Agent({
      name: 'RefundAgent',
      instructions: 'You are responsible for handling refund requests for broadband subscriptions. Use the fetchPlans tool to verify the plan details before processing refunds.',
      tools: [processRefundTool]
    })
    const salesAgent = new Agent({
      name: 'SalesAgent',
      instructions: 'You are responsible for handling sales inquiries for broadband connection plans. Use the fetchPlans tool to provide customers with information about available subscription plans.',
      tools: [fetchPlansTool, refundAgent.asTool({
        toolName: 'refundAgent',
        toolDescription: "Handles refund requests for broadband subscriptions.",
      })]
    })
    const receptionAgent = new Agent({
      name: "receptionAgent",
      instructions: "You are the reception expert agent, your job is to understand a customr's request and handoff to salesAgent or refundAgent",
      handoffDescription: `You have two agent availables to handoff, 
      1. salesAgent is for sales and for exploring broadband connection plans,
      2. refundAgent is for processing refund requests for broadband subscriptions.`,
      handoffs: [salesAgent, refundAgent]
    })
    const result = await run(receptionAgent, prompt);
    res.send({response: result.finalOutput, history: result.history});
} catch (error) {
  console.error("Error communicating with OpenAI Agent Manager with Handoff:", error);
  res.status(500).json({ error: "Error communicating with OpenAI Agent Manager with Handoff" });
}
}

