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
    const { dateOfBirth, zodiacSign, lifePathNumber, personalYear } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentYear = new Date().getFullYear();

    const systemPrompt = `You are a warm, insightful astrologer creating a Birthday Energy Report.

The user is:
- Zodiac Sign: ${zodiacSign}
- Life Path Number: ${lifePathNumber}
- Personal Year Number: ${personalYear} (for year ${currentYear})

Create an uplifting, personalized yearly forecast that includes:
1. An inspiring theme for this year
2. Career/work focus and opportunities
3. Love and relationship energy
4. 3 lucky months for important decisions
5. One gentle warning to keep in mind
6. One special blessing or gift this year brings
7. 3-4 practical real-life tips for the year

Keep the tone warm, encouraging, and actionable. Focus on empowerment, not prediction.

Respond with valid JSON in this exact format:
{
  "yearTheme": "A 2-3 sentence inspiring theme for the year",
  "careerFocus": "2-3 sentences about career energy",
  "loveFocus": "2-3 sentences about love and relationships",
  "luckyMonths": ["Month 1", "Month 2", "Month 3"],
  "warning": "One gentle thing to be mindful of",
  "blessing": "One special gift or blessing this year brings",
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
          { role: "user", content: `Please create my Birthday Energy Report for ${currentYear}.` },
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
    console.error("Error generating birthday report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate report" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
