import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, dateOfBirth, naamAnk, mulank } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert Indian numerologist specializing in Naam Ank (Name Number) and Mulank (Birth Number) analysis.

The user has:
- Name: ${name}
- Naam Ank (Name Number): ${naamAnk}
- Mulank (Birth Number): ${mulank}

Analyze how these two numbers interact - do they support or clash with each other?

Provide a warm, insightful analysis that includes:
1. An overview of their number combination
2. How the numbers harmonize or create tension
3. Their natural strengths
4. One challenge to be aware of
5. 3-4 practical real-life tips

Keep the tone warm, encouraging, and practical. Avoid scary predictions.

Respond with valid JSON in this exact format:
{
  "overview": "2-3 sentences about their number combination",
  "harmony": "2-3 sentences about how the numbers work together",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "challenges": "One challenge they might face",
  "tips": ["practical tip 1", "practical tip 2", "practical tip 3", "practical tip 4"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please provide the numerology analysis for ${name}.` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse insight from response");
    }

    const insight = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating naam numerology:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate insight" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
