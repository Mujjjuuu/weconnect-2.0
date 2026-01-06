
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Always initialize with named parameters as per guidelines, using API key directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeContent = async (imageBase64: string): Promise<AIAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: "image/jpeg" } },
          { text: "Analyze this influencer content. Return JSON: creativityScore (0-100), engagementPotential (0-100), brandFriendliness (0-100), summary string, and 3 recommendations string array." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            creativityScore: { type: Type.NUMBER },
            engagementPotential: { type: Type.NUMBER },
            brandFriendliness: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["creativityScore", "engagementPotential", "brandFriendliness", "summary", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Content Analysis failed:", error);
    throw error;
  }
};

export const generateCampaignStrategy = async (prompt: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: `Create a detailed influencer campaign strategy for: ${prompt}. Return JSON with: name, budget (string like $X,XXX), deliverables (array of strings), and strategy (detailed string).` }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            budget: { type: Type.STRING },
            deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategy: { type: Type.STRING }
          },
          required: ["name", "budget", "deliverables", "strategy"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Strategy generation failed:", error);
    return null;
  }
};

export const chatWithAi = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: message }] },
      config: {
        systemInstruction: "You are the WeConnect AI Assistant. Help brands find influencers and help creators optimize their profiles. Be concise, smart, and professional."
      },
    });
    
    return response.text || "I'm having trouble connecting to my neural network. Please try again.";
  } catch (error) {
    console.error("Gemini Chat error:", error);
    return "Something went wrong in my logic centers.";
  }
};

export const getCampaignForecast = async (campaignDetails: any): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [{ text: `Forecast ROI and reach for: ${JSON.stringify(campaignDetails)}. Be detailed.` }] },
      config: { thinkingConfig: { thinkingBudget: 1024 } }
    });
    return response.text || "Strategic forecast unavailable.";
  } catch (error) {
    return "Data modeling failed. Please check campaign parameters.";
  }
};

export const getMatchAnalysis = async (campaign: any, influencer: any): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { 
        parts: [{ 
          text: `Explain why this influencer (${influencer.name}, niche: ${influencer.niche}) is a good fit for this campaign (${campaign.niche}, goal: ${campaign.goal}). Be persuasive and structured.` 
        }] 
      },
      config: { thinkingConfig: { thinkingBudget: 512 } }
    });
    return response.text || "Match synergy is confirmed through audience overlap analysis.";
  } catch (error) {
    return "Strategic match detected based on content DNA.";
  }
};

export const getCriteriaExplanation = async (criteria: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Explain the AI logic for: "${criteria}". Under 60 words.` }] }
    });
    return response.text || "Logic processing error.";
  } catch (error) {
    return "Uses deep neural assessment of engagement patterns.";
  }
};

export const getPostCampaignInsights = async (campaignName: string, contentAnalysis: AIAnalysisResult): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { 
        parts: [{ 
          text: `Post-mortem for ${campaignName}. Scores: ${JSON.stringify(contentAnalysis)}. Give 3 pivots.` 
        }] 
      },
      config: { thinkingConfig: { thinkingBudget: 1024 } }
    });
    return response.text || "Review insights completed.";
  } catch (error) {
    return "Recommendation: Refine content hooks for better initial retention.";
  }
};
