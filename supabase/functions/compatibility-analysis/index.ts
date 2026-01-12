import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { person1, person2, compatibleNumbers } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const isNumerologyCompatible = compatibleNumbers.includes(person2.lifePath);

    const systemPrompt = `You are a relationship astrology and numerology analyst. Provide thoughtful, balanced compatibility analysis based on zodiac signs and life path numbers.

IMPORTANT GUIDELINES:
- Be factual about astrological and numerological principles
- Use neutral, non-predictive language
- Include confidence levels and limitations
- Focus on pattern analysis, not predictions
- Acknowledge this is for reflection and entertainment

Person 1: ${person1.name}, ${person1.zodiac} (Life Path ${person1.lifePath})
Person 2: ${person2.name}, ${person2.zodiac} (Life Path ${person2.lifePath})
Numerology Compatibility Match: ${isNumerologyCompatible ? 'Yes' : 'No'}

Respond with a JSON object containing:
{
  "overallScore": (number 1-100, balanced assessment),
  "emotionalCompatibility": (number 1-100),
  "intellectualCompatibility": (number 1-100),
  "physicalChemistry": (number 1-100),
  "longTermPotential": (number 1-100),
  "strengths": (array of 3-4 relationship strengths),
  "challenges": (array of 2-3 potential challenges to be aware of),
  "communicationStyle": (string describing how these signs/numbers communicate),
  "growthAreas": (array of 2-3 areas for mutual growth),
  "advice": (practical relationship advice, non-predictive),
  "confidenceLevel": ("Low", "Medium", or "High" - based on astrological principles),
  "limitations": (brief note about the limitations of this analysis)
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a compatibility analysis for ${person1.name} (${person1.zodiac}) and ${person2.name} (${person2.zodiac}). Their life path numbers are ${person1.lifePath} and ${person2.lifePath}.` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI service error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      analysis = {
        overallScore: 65,
        emotionalCompatibility: 70,
        intellectualCompatibility: 65,
        physicalChemistry: 60,
        longTermPotential: 65,
        strengths: [
          "Shared values and mutual respect",
          "Complementary personality traits",
          "Strong communication foundation"
        ],
        challenges: [
          "Different approaches to conflict resolution",
          "Varying energy levels and social needs"
        ],
        communicationStyle: "Both partners bring unique perspectives to conversations, creating opportunities for growth and understanding.",
        growthAreas: [
          "Practicing active listening",
          "Finding balance in decision-making",
          "Supporting individual goals"
        ],
        advice: "Focus on understanding each other's perspectives and celebrating your differences as opportunities for mutual growth.",
        confidenceLevel: "Medium",
        limitations: "This analysis is based on general astrological principles and should be used for reflection only."
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate analysis' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
