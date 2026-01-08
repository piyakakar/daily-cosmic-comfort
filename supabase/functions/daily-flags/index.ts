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
    const { dateOfBirth, zodiacSign, lifePathNumber } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateString = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const systemPrompt = `You are a friendly cosmic guide providing daily micro-predictions.

Today is ${dayOfWeek}, ${dateString}.
The user is a ${zodiacSign} with Life Path Number ${lifePathNumber}.

Create quick, shareable daily guidance:
1. One GREEN FLAG - something that supports them today (what to embrace)
2. A quick action to maximize the green flag
3. One RED FLAG - something to avoid or be careful about today
4. A quick tip to navigate the red flag
5. A short, memorable daily mantra (max 10 words)
6. 3 practical real-life tips for today

Keep it fun, light, and actionable. Not scary or preachy.

Respond with valid JSON in this exact format:
{
  "greenFlag": "What supports you today (one sentence)",
  "greenFlagAction": "Quick action to take",
  "redFlag": "What to avoid today (one sentence)",
  "redFlagAction": "How to navigate this",
  "dailyMantra": "Short inspiring mantra",
  "tips": ["tip 1", "tip 2", "tip 3"]
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
          { role: "user", content: `What are my green and red flags for today?` },
        ],
        temperature: 0.8,
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
      throw new Error("Could not parse flags from response");
    }

    const flags = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ flags }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating daily flags:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate flags" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
