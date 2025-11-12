import { OpenAI } from "openai";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import { createTransport } from "nodemailer";

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
