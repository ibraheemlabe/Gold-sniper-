import { GoogleGenAI } from "@google/genai";


export interface Impact {
  immediate: string;
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
}

export interface DimensionData {
  analysis: string;
  impact: Impact;
  metaphor: string;
}

export interface GoalPlan {
  goal: string;
  steps: string[];
  motivation: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface HistoricalTrends {
  week: PricePoint[];
  month: PricePoint[];
  year: PricePoint[];
}

export interface NewsEvent {
  title: string;
  time: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
}

export interface GoldFundamentalData {
  macro: DimensionData;
  yields: DimensionData;
  sentiment: DimensionData;
  summary: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sources: { title: string; uri: string }[];
  lastUpdated: string;
  mentorAdvice: string;
  goalPlan: GoalPlan;
  historicalTrends: HistoricalTrends;
  newsToWatch: NewsEvent[];
  scalperLevels: {
    support: { level: number; reason: string }[];
    resistance: { level: number; reason: string }[];
    pivot: number;
  };
  cmeData?: {
    highOIStrikes: { strike: number; type: 'CALL' | 'PUT'; oi: string; expiration: string }[];
    heatmapSummary: string;
    contractExpirations: { code: string; dte: number; price: number }[];
  };
}

const MOCK_DATA: GoldFundamentalData = {
  macro: {
    analysis: "The US Dollar is showing signs of exhaustion as cooling inflation data suggests the Fed might pause rate hikes. This creates a massive tailwind for Gold as a non-yielding asset.",
    metaphor: "A coiled spring ready to snap higher as the weight of the Dollar lifts.",
    impact: { immediate: "Bullish", shortTerm: "Neutral", mediumTerm: "Bullish", longTerm: "Bullish" }
  },
  yields: {
    analysis: "10-Year Treasury yields are retreating from recent highs, reducing the opportunity cost of holding Gold. Watch the 4.2% level closely.",
    metaphor: "The gravity holding Gold down is weakening.",
    impact: { immediate: "Bullish", shortTerm: "Bullish", mediumTerm: "Neutral", longTerm: "Bullish" }
  },
  sentiment: {
    analysis: "Retail sentiment is currently split, but institutional flow shows heavy accumulation at the $2,680 support zone. Fear of missing out (FOMO) is building.",
    metaphor: "The smart money is quietly loading the boat.",
    impact: { immediate: "Neutral", shortTerm: "Bullish", mediumTerm: "Bullish", longTerm: "Bullish" }
  },
  summary: "Gold is entering a high-probability breakout phase supported by macro weakness in the USD and technical accumulation at key pivot levels.",
  bias: 'BULLISH',
  sources: [{ title: 'Market Example', uri: 'https://example.com' }],
  lastUpdated: new Date().toLocaleTimeString(),
  mentorAdvice: "Don't chase the green candles. Wait for the retest of the pivot at $2,715. Risk management is your only edge in this volatility. 💰",
  goalPlan: {
    goal: "Capture the $2,750 Breakout",
    steps: ["Wait for H1 close above $2,720", "Set SL at $2,705", "TP1 at $2,745"],
    motivation: "Discipline equals freedom. Stick to the sniper code."
  },
  historicalTrends: {
    week: [
      { date: "Mon", price: 2680 }, { date: "Tue", price: 2695 }, { date: "Wed", price: 2710 },
      { date: "Thu", price: 2705 }, { date: "Fri", price: 2725 }, { date: "Sat", price: 2722 }, { date: "Sun", price: 2730 }
    ],
    month: [],
    year: []
  },
  newsToWatch: [
    { title: "CPI Inflation Data", time: "13:30 UTC", importance: 'HIGH', impact: "High Volatility Expected" }
  ],
  scalperLevels: {
    support: [{ level: 2680, reason: "Daily Order Block" }, { level: 2700, reason: "Psychological Level" }],
    resistance: [{ level: 2745, reason: "Previous Month High" }],
    pivot: 2715
  }
};

function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        throw new Error("Failed to parse AI response as JSON");
      }
    }
    throw new Error("No valid JSON found in AI response");
  }
}

export async function fetchGoldFundamentals(): Promise<GoldFundamentalData> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Falling back to mock data.");
      return { ...MOCK_DATA, lastUpdated: `${new Date().toLocaleTimeString()} (DEMO MODE)` };
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Role: You are an advanced AI financial mentor for a "Gold Sniper Scalper".
      Return the response in STRICT JSON format.
      {
        "macro": { "analysis": "...", "impact": { "immediate": "...", "shortTerm": "...", "mediumTerm": "...", "longTerm": "..." }, "metaphor": "..." },
        "yields": { "analysis": "...", "impact": { "immediate": "...", "shortTerm": "...", "mediumTerm": "...", "longTerm": "..." }, "metaphor": "..." },
        "sentiment": { "analysis": "...", "impact": { "immediate": "...", "shortTerm": "...", "mediumTerm": "...", "longTerm": "..." }, "metaphor": "..." },
        "summary": "...",
        "bias": "BULLISH/BEARISH/NEUTRAL",
        "mentorAdvice": "...",
        "goalPlan": { "goal": "...", "steps": ["...", "..."], "motivation": "..." },
        "historicalTrends": {
          "week": [ {"date": "...", "price": 0}, ... ],
          "month": [ {"date": "...", "price": 0}, ... ],
          "year": [ {"date": "...", "price": 0} ]
        },
        "newsToWatch": [ {"title": "...", "time": "...", "importance": "HIGH/MEDIUM/LOW", "impact": "..."} ],
        "scalperLevels": {
          "support": [ {"level": 0, "reason": "..."} ],
          "resistance": [ {"level": 0, "reason": "..."} ],
          "pivot": 0
        }
      }
    `;

    const attemptFetch = async (useUrlContext: boolean) => {
      const tools: any[] = [{ googleSearch: {} }];
      if (useUrlContext) {
        tools.push({ urlContext: { entries: [{ url: "https://www.tradingview.com/chart/XwQY6Sf4/" }] } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools,
          responseMimeType: "application/json",
        },
      });

      // Safely access text to avoid potential getter errors
      let responseText = '';
      try {
        responseText = response.text || '{}';
      } catch (e) {
        console.error("Error accessing response.text:", e);
        // If it's a tool call or error, response.text might throw
        throw new Error("Invalid AI response format");
      }

      const data = extractJson(responseText);
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '',
      })).filter((s: any) => s.uri) || [];

      const normalizeDimension = (dim: any): DimensionData => ({
        analysis: dim?.analysis || 'Analysis unavailable',
        metaphor: dim?.metaphor || 'Metaphor unavailable',
        impact: {
          immediate: dim?.impact?.immediate || 'N/A',
          shortTerm: dim?.impact?.shortTerm || 'N/A',
          mediumTerm: dim?.impact?.mediumTerm || 'N/A',
          longTerm: dim?.impact?.longTerm || 'N/A',
        }
      });

      return {
        ...data,
        macro: normalizeDimension(data.macro),
        yields: normalizeDimension(data.yields),
        sentiment: normalizeDimension(data.sentiment),
        goalPlan: {
          goal: data.goalPlan?.goal || 'Goal unavailable',
          steps: data.goalPlan?.steps || [],
          motivation: data.goalPlan?.motivation || 'Stay disciplined.'
        },
        historicalTrends: data.historicalTrends || { week: [], month: [], year: [] },
        scalperLevels: data.scalperLevels || { support: [], resistance: [], pivot: 0 },
        newsToWatch: data.newsToWatch || [],
        sources,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    };

    try {
      return await attemptFetch(true);
    } catch (error) {
      console.warn("Primary fetch failed, retrying...", error);
      try {
        return await attemptFetch(false);
      } catch (fallbackError) {
        console.error("All AI fetch attempts failed. Using mock data.", fallbackError);
        return { ...MOCK_DATA, lastUpdated: `${new Date().toLocaleTimeString()} (OFFLINE)` };
      }
    }
  } catch (globalError) {
    console.error("CRITICAL: Global fetch error in geminiService:", globalError);
    return { ...MOCK_DATA, lastUpdated: `${new Date().toLocaleTimeString()} (RECOVERY MODE)` };
  }
}
