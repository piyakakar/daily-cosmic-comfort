import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate lunar phase based on date
function getLunarPhase(date: Date): { name: string; illumination: number } {
  const synodic = 29.53059;
  const refDate = new Date('2000-01-06'); // Known new moon
  const daysSince = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % synodic) / synodic);
  
  const illumination = Math.round(Math.abs(Math.cos(phase * 2 * Math.PI)) * 100);
  
  if (phase < 0.03 || phase >= 0.97) return { name: 'New Moon', illumination };
  if (phase < 0.22) return { name: 'Waxing Crescent', illumination };
  if (phase < 0.28) return { name: 'First Quarter', illumination };
  if (phase < 0.47) return { name: 'Waxing Gibbous', illumination };
  if (phase < 0.53) return { name: 'Full Moon', illumination };
  if (phase < 0.72) return { name: 'Waning Gibbous', illumination };
  if (phase < 0.78) return { name: 'Last Quarter', illumination };
  return { name: 'Waning Crescent', illumination };
}

// Get zodiac sign for a date (Sun sign)
function getSunSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const signs = [
    { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
  ];
  
  for (const z of signs) {
    if ((month === z.start[0] && day >= z.start[1]) || (month === z.end[0] && day <= z.end[1])) {
      return z.sign;
    }
  }
  return 'Capricorn';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, userMood, userActivities, userZodiac } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const selectedDate = new Date(date);
    const lunarPhase = getLunarPhase(selectedDate);
    const sunSign = getSunSign(selectedDate);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    const systemPrompt = `You are a factual astrology analyst that explains past experiences through verified celestial data. 

CRITICAL RULES:
- Use ONLY verifiable astronomical facts (lunar phases, planetary positions, eclipses, retrogrades)
- NEVER make future predictions
- NEVER make absolute claims about causation
- Use phrases like "may have influenced", "often correlates with", "traditionally associated with"
- Include confidence levels and limitations
- Focus on reflection and pattern recognition

Date analyzed: ${date} (${dayOfWeek})
Lunar Phase: ${lunarPhase.name} (${lunarPhase.illumination}% illumination)
Sun Sign Period: ${sunSign}
${userMood ? `User's reported mood: ${userMood}` : ''}
${userActivities ? `User's reported activities: ${userActivities}` : ''}

Respond with a JSON object:
{
  "date": "${date}",
  "lunarPhase": {
    "name": "${lunarPhase.name}",
    "illumination": ${lunarPhase.illumination},
    "description": (factual description of this lunar phase's traditional associations)
  },
  "planetaryPositions": [
    { "planet": "Sun", "sign": "${sunSign}", "influence": (traditional interpretation, non-predictive) },
    { "planet": "Moon", "sign": (estimated based on lunar phase), "influence": (traditional interpretation) },
    { "planet": "Mercury", "sign": (general period position), "influence": (traditional interpretation) }
  ],
  "celestialEvents": [
    (any notable events for this date if applicable, otherwise empty array)
  ],
  "moodCorrelation": (if user provided mood, explain how celestial positions MAY have correlated - use careful language),
  "activitySuggestions": [
    (3-4 activities that traditionally align with these celestial conditions)
  ],
  "reflectionPrompts": [
    (2-3 thoughtful questions for self-reflection based on the day's energy)
  ],
  "confidenceLevel": "Medium - based on general astronomical patterns",
  "limitations": "Celestial correlations are not causative. Individual experiences vary greatly.",
  "dataSource": "Calculated lunar phases and general planetary periods"
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
          { role: 'user', content: `Explain the celestial context for ${date}. Focus on factual astronomical data and use careful, non-predictive language.` }
        ],
        temperature: 0.6,
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

    let explanation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        explanation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      explanation = {
        date,
        lunarPhase: {
          name: lunarPhase.name,
          illumination: lunarPhase.illumination,
          description: `During the ${lunarPhase.name}, the Moon is ${lunarPhase.illumination}% illuminated. This phase is traditionally associated with ${lunarPhase.name === 'Full Moon' ? 'heightened emotions and completion' : lunarPhase.name === 'New Moon' ? 'new beginnings and introspection' : 'transition and growth'}.`
        },
        planetaryPositions: [
          { planet: 'Sun', sign: sunSign, influence: `The Sun in ${sunSign} traditionally emphasizes themes of ${sunSign === 'Aries' ? 'initiative and courage' : 'growth and self-expression'}.` },
          { planet: 'Moon', sign: 'Variable', influence: 'The Moon moves through signs quickly, influencing emotional rhythms.' }
        ],
        celestialEvents: [],
        moodCorrelation: userMood ? `Your ${userMood.toLowerCase()} mood may have aligned with the ${lunarPhase.name} energy, though individual experiences vary.` : '',
        activitySuggestions: [
          'Journaling and self-reflection',
          'Connecting with nature',
          'Creative expression',
          'Mindful movement or meditation'
        ],
        reflectionPrompts: [
          'What patterns do you notice in your energy levels?',
          'How did your interactions with others feel today?',
          'What brought you the most peace or challenge?'
        ],
        confidenceLevel: 'Medium - based on calculated lunar data',
        limitations: 'This analysis uses general astronomical patterns. Personal experiences vary greatly.',
        dataSource: 'Calculated lunar phases and general planetary periods'
      };
    }

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to explain day' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
