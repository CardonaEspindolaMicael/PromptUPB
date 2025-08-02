import { GoogleGenAI } from "@google/genai";
import fs from "fs";

export const postImgToHtml = async (req, res) => {
  try {
    const { apiKey } = req.params;
    console.log(req.file);

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Check supported image formats
    const supportedFormats = ['image/jpeg', 'image/png'];
    if (!supportedFormats.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Unsupported image format. Please upload JPG or PNG images only."
      });
    }

    // Read uploaded file as base64
    const filePath = req.file.path;
    const base64Image = fs.readFileSync(filePath, { encoding: "base64" });

    // Initialize Gemini API with provided key
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
[PERSONA]
You are a highly skilled code generator specializing in converting images into clean, production-ready HTML using Tailwind CSS.

[TASK]
Analyze the provided image and generate HTML code according to the following rules, based on the image's content.

[CONTEXT]
You will receive an image that represents one of two possibilities:
1.  A complete webpage design
2.  A hand-drawn webpage sketch

Your generated code MUST be:
* Valid HTML5
* Properly formatted
* Fully responsive (using Tailwind's breakpoint classes)
* Styled with Tailwind CSS utility classes

[FORMAT]
*   **If the image is a complete webpage design:**  Generate the complete HTML to precisely replicate the design using Tailwind CSS, ensuring responsive behavior.
*   **If the image is a webpage sketch:** Transform the sketch into a professional HTML layout with Tailwind CSS by:
    *   Using semantic HTML5 tags (<nav>, <header>, etc.) instead of generic rectangles.
    *   Employing Tailwind's spacing utilities (p-4, my-8, etc.) for visual balance.
    *   Implementing responsive design with Tailwind's breakpoint classes (sm:, md:, lg:, etc.).
    *   Applying appropriate typography using Tailwind's font and text utilities.
    *   Maintaining accurate alignment and proportions from the sketch.
    *   Adding subtle UI enhancements like shadows, rounded corners, and transitions where appropriate.
    *   Using a color scheme based on any available hints in the sketch.
    *   Ensuring the layout is clean, professional, and visually appealing.

[OUTPUT]
You MUST return ONLY the complete HTML code, styled with Tailwind CSS classes. No other text, explanations, or comments are permitted. The entire response should be the HTML code, and nothing else.
`;
    // --- END STRUCTURED PROMPT ---

    // Create prompt based on image content type analysis
    const contents = [
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: base64Image,
        },
      },
      {
        text: prompt, // Use the improved prompt here
      },
    ];

    // Generate content with Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      generationConfig: {
        temperature: 0.5, 
        topK: 3,       
        topP: 0.4       
      },
    });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Send only the HTML response
    res.send(response.text);

  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image", details: error.message });
  }
};

  /**************************************************************************************** */

  // Función 1: Limpieza de datos con IA
export const cleanDataWithAI = async (apiKey,rawData) => {
  try {

   if (!rawData || typeof rawData !== 'string') {
      return "Please provide rawData as a string.";
    }

    if (!apiKey) {
      return "API key is required.";
    }


    const ai = new GoogleGenAI({ apiKey });

    const cleaningPrompt = `You are a data cleaning expert. Your task is to clean and format the following raw data into a well-structured JSON object.
${JSON.stringify(rawData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ text: cleaningPrompt }],
    });

    let generatedText = response.text;
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let cleanedData;
    try {
      cleanedData = JSON.parse(generatedText);
    } catch (parseError) {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedData = JSON.parse(jsonMatch[0]);
      } else {
      console.error("Error cleaning data:", error);
      }
    }

   console.log(cleanedData)

    return JSON.stringify(cleanedData);



  } catch (error) {
    console.error("Error cleaning data:", error);
  }
};

export const generateEnergyDashboard = async (req, res) => {
  try {
    const { apiKey } = req.params;
    const { rawData } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API key is required." });
    }

    const cleanedData = await cleanDataWithAI(apiKey, rawData);

    const ai = new GoogleGenAI({ apiKey });

const dashboardPrompt = `You are a React + Tailwind developer. Create a PROFESSIONAL energy dashboard for executives.

**REQUIREMENTS:**
- **Theme**: Light theme - bg-white, bg-gray-50 for cards, text-gray-800
- **Colors**: Use blue-600, green-600, amber-500, red-600 for charts and status
- **Charts**: Use Apache ECharts (already installed) - create Line, Bar, and Doughnut charts
- **Layout**: Professional grid layout, clean and minimal

**STRUCTURE:**
1. Clean header with "Energy Dashboard" title
2. 4 KPI metric cards (consumption, efficiency, cost, alerts)
3. 3 charts section: Line chart (trends), Bar chart (comparison), Doughnut chart (distribution)
4. Compact status/alerts panel

**CHART IMPLEMENTATION:**
- Use ReactECharts component: <ReactECharts option={chartOption} style={{height: '300px'}} />
- Create proper ECharts options with the provided data
- Style charts with light theme colors
- Make charts responsive

**CODE RULES:**
- Clean, professional JSX
- Use Tailwind utilities only
- Keep code concise but functional
- Responsive grid system
- Professional typography

**DATA TO VISUALIZE:**
${JSON.stringify(cleanedData, null, 2)}

**OUTPUT:**
Return ONLY the JSX content that goes INSIDE the return statement.
- Start directly with the opening <div> tag
- End with the closing </div> tag
- NO "return (" at the beginning
- NO ");" at the end
- Just the pure JSX content inside the return
- Include chart configurations and options

Example format:
<div className="min-h-screen bg-white">
  {/* Dashboard content here */}
</div>`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ text: dashboardPrompt }],
    });

    const generatedText =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleanedJSX = generatedText
      .replace(/```(jsx|tsx)?/g, "")
      .trim();


console.log(cleanedJSX)
    return res.json({
      jsx: cleanedJSX
    });

  } catch (error) {
    console.error("Error generating dashboard JSX:", error);
    res.status(500).json({
      error: "Failed to generate dashboard JSX",
      details: error.message
    });
  }
};


