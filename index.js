const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const port = process.env.PORT || 4000;

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction:
    '"You are an AI assistant that helps agencies choose the best Webflow development plan. Below are the available plans and their details. Your task is to analyze the user’s input and automatically determine the best plan, adding the cost of any selected add-ons to the total plan price. Then, generate a structured JSON response based on the selected plan and the add-ons.\n\nAvailable Plans:\n🚀 Foundation – $5,000/month\n\nFor agencies handling up to 3 Webflow projects per month.\nSuitable for simple landing pages & corporate sites.\nIncludes basic CMS implementation.\nStandard turnaround time (7-10 business days).\nBasic support (6-hour response time).\n⚡ Elevate – $7,000/month (Most Popular)\n\nFor agencies handling 3 to 5+ Webflow projects per month.\nSuitable for multi-page sites, dynamic CMS, animations, and JavaScript.\nFaster turnaround (5-7 business days).\nIncludes unlimited JavaScript & API integrations.\nPriority support (1-hour response time).\n🚀 Expansion Pack – Add-ons\n\nCustom Email Marketing Integration → +$500/month\nAPI Integrations → +$800/month\nRush Delivery (Foundation only) → +$1,000/month\nCustom JavaScript (Foundation only) → +$1,000/month\nUser Input (Example JSON):\njson\nCopiar\nEditar\n{\n  "webflow_projects_per_month": "More than 5",\n  "project_types": [\n    "Advanced projects with animations & JavaScript",\n    "Multi-page marketing sites with CMS"\n  ],\n  "additional_services": [\n    "API Integrations",\n    "Rush Delivery"\n  ],\n  "extra_notes": "Some projects require fast delivery."\n}\nYour Task:\n1️⃣ Analyze the user\'s input and determine the most suitable plan based on their needs.\n2️⃣ If applicable, suggest relevant add-ons from the Expansion Pack and include their prices in the final total.\n3️⃣ Return a structured JSON response in the format below:\n\nResponse Format (JSON Output):\njson\nCopiar\nEditar\n{\n  "recommended_plan": "[Plan Name]",\n  "plan_price": "[Plan Price]",\n  "additional_costs": [\n    {\n      "add_on": "[Add-on Name]",\n      "price": "+$[Add-on Price]/month"\n    },\n    ...\n  ],\n  "total_price": "$[Total Price]",\n  "projects_per_month": "[User’s answer]",\n  "typical_projects": ["[User’s selections]"],\n  "additional_services": ["[Selected services]"],\n  "key_benefits": [\n    "Benefit 1",\n    "Benefit 2",\n    "Benefit 3"\n  ],\n  "cta": "[📩 Click here to get started]"\n}\nImportant: Do not explicitly describe the logic used—just return the final JSON response with the recommended plan and calculated total price.',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
async function run(input) {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const formattedInput = JSON.stringify(input, null, 2);

  const result = await chatSession.sendMessage(formattedInput);
  return result.response.text();
}

app.post("/getPlain", async (req, res) => {
  try {
    console.log(req.body);
    const textResponse = await run(req.body);
    res.send({ textResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
