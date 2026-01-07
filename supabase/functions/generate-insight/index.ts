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
    const { mood, dateOfBirth } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate zodiac sign and life path number
    const birthDate = new Date(dateOfBirth);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();
    
    // Simple zodiac calculation
    const zodiacSigns = [
      { sign: "Capricorn", start: [12, 22], end: [1, 19] },
      { sign: "Aquarius", start: [1, 20], end: [2, 18] },
      { sign: "Pisces", start: [2, 19], end: [3, 20] },
      { sign: "Aries", start: [3, 21], end: [4, 19] },
      { sign: "Taurus", start: [4, 20], end: [5, 20] },
      { sign: "Gemini", start: [5, 21], end: [6, 20] },
      { sign: "Cancer", start: [6, 21], end: [7, 22] },
      { sign: "Leo", start: [7, 23], end: [8, 22] },
      { sign: "Virgo", start: [8, 23], end: [9, 22] },
      { sign: "Libra", start: [9, 23], end: [10, 22] },
      { sign: "Scorpio", start: [10, 23], end: [11, 21] },
      { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
    ];

    let zodiacSign = "Capricorn";
    for (const z of zodiacSigns) {
      const [startMonth, startDay] = z.start;
      const [endMonth, endDay] = z.end;
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      ) {
        zodiacSign = z.sign;
        break;
      }
    }

    // Calculate life path number
    const digitSum = (n: number): number => {
      let sum = 0;
      while (n > 0) {
        sum += n % 10;
        n = Math.floor(n / 10);
      }
      return sum;
    };

    let lifePathNumber = digitSum(month) + digitSum(day) + digitSum(year);
    while (lifePathNumber > 9 && lifePathNumber !== 11 && lifePathNumber !== 22 && lifePathNumber !== 33) {
      lifePathNumber = digitSum(lifePathNumber);
    }

    const systemPrompt = `You are a warm, intuitive astrology and numerology guide.

Based on the user's selected current mood and their date of birth, generate a short, emotionally relatable astrology insight.

The user is a ${zodiacSign} with a Life Path Number of ${lifePathNumber}.

Include:
- A brief reason for why the user may be feeling this way (astrology or numerology based)
- One gentle, practical piece of advice for today
- One simple action they should take today

Rules:
- Keep the tone calm, comforting, and non-scary
- Do not use complex astrological jargon
- Keep the output concise and easy to understand
- Do not make absolute predictions or claims
- Focus on emotional clarity and self-awareness
- Each section should be 1-3 sentences maximum

You must respond with valid JSON in exactly this format:
{
  "moodInsight": "2-3 sentences about why they might be feeling this way based on their zodiac and numerology",
  "advice": "One gentle, practical piece of advice",
  "todaysAction": "One simple action to take today"
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
          { role: "user", content: `The user is feeling ${mood} today. Please provide their personalized cosmic insight.` },
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

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse insight from response");
    }

    const insight = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ insight, zodiacSign, lifePathNumber }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating insight:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate insight" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
