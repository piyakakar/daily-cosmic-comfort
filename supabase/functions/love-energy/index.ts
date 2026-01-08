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
    const { dateOfBirth, zodiacSign, lifePathNumber, mode, partnerDob, partnerZodiac, partnerLifePath } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = '';
    let compatibilityScore = undefined;

    if (mode === 'compatibility' && partnerZodiac) {
      // Calculate a fun compatibility score
      const zodiacCompatibility: Record<string, string[]> = {
        Aries: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
        Taurus: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
        Gemini: ['Libra', 'Aquarius', 'Aries', 'Leo'],
        Cancer: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
        Leo: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
        Virgo: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
        Libra: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
        Scorpio: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
        Sagittarius: ['Aries', 'Leo', 'Libra', 'Aquarius'],
        Capricorn: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
        Aquarius: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
        Pisces: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
      };

      const compatible = zodiacCompatibility[zodiacSign] || [];
      let baseScore = 60;
      if (compatible.includes(partnerZodiac)) baseScore = 85;
      if (zodiacSign === partnerZodiac) baseScore = 75;
      
      // Add some variance
      compatibilityScore = Math.min(98, Math.max(55, baseScore + Math.floor(Math.random() * 15) - 5));

      systemPrompt = `You are a fun, insightful love compatibility guide.

User 1: ${zodiacSign}, Life Path ${lifePathNumber}
User 2: ${partnerZodiac}, Life Path ${partnerLifePath}
Compatibility Score: ${compatibilityScore}%

Analyze their romantic compatibility with:
1. Current romantic energy level (Low/Medium/High/Very High)
2. Description of their combined energy
3. Best times for them to connect
4. Advice if they're in early dating
5. Advice if they're in a committed relationship
6. Their "crush energy" - how sparks fly between them
7. 3 green flag traits they bring out in each other
8. 3 red flag traits to watch for
9. 3-4 practical relationship tips

Keep it fun, positive, and empowering!

Respond with valid JSON:
{
  "energyLevel": "High",
  "energyDescription": "2-3 sentences about their combined energy",
  "bestTimeToConnect": "When they should talk/meet",
  "singleAdvice": "Advice for early dating stage",
  "coupleAdvice": "Advice for committed couples",
  "crushEnergy": "How sparks fly between them",
  "greenFlagTraits": ["trait 1", "trait 2", "trait 3"],
  "redFlagTraits": ["trait 1", "trait 2", "trait 3"],
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}`;
    } else {
      systemPrompt = `You are a warm, fun love energy guide.

The user is a ${zodiacSign} with Life Path Number ${lifePathNumber}.

Analyze their current romantic energy:
1. Energy level (Low/Medium/High/Very High)
2. Description of their current love energy
3. Best time today to connect with someone special
4. Advice if they're single
5. Advice if they're in a relationship
6. Their "crush energy" - how attractive they are right now
7. 3 green flag traits they should look for in partners
8. 3 red flag traits to avoid in partners
9. 3-4 practical dating/relationship tips

Keep it fun, empowering, and not preachy!

Respond with valid JSON:
{
  "energyLevel": "Medium",
  "energyDescription": "2-3 sentences about their current love energy",
  "bestTimeToConnect": "Best time to reach out or be open",
  "singleAdvice": "Advice for singles",
  "coupleAdvice": "Advice for those in relationships",
  "crushEnergy": "Their current attraction energy",
  "greenFlagTraits": ["trait 1", "trait 2", "trait 3"],
  "redFlagTraits": ["trait 1", "trait 2", "trait 3"],
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}`;
    }

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
          { role: "user", content: mode === 'compatibility' ? `Analyze our compatibility!` : `What's my love energy like today?` },
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
      throw new Error("Could not parse insight from response");
    }

    const insight = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ insight, compatibilityScore }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating love energy:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate insight" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
