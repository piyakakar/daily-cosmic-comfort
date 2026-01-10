import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function calculateLifePathNumber(date: Date): number {
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  let sum = dateStr.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  return sum;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dateOfBirth, name } = await req.json();
    
    if (!dateOfBirth) {
      return new Response(JSON.stringify({ error: 'Date of birth is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dob = new Date(dateOfBirth);
    const zodiac = getZodiacSign(dob);
    const lifePathNumber = calculateLifePathNumber(dob);
    const dayOfBirth = dob.getDate();

    const prompt = `You are an expert Indian astrologer and numerologist specializing in career and education guidance.

Person details:
- ${name ? `Name: ${name}` : 'Anonymous user'}
- Zodiac Sign: ${zodiac}
- Life Path Number: ${lifePathNumber}
- Birth Day: ${dayOfBirth}

Generate a comprehensive career and study analysis in JSON format:

{
  "careerPath": "2-3 sentences about ideal career directions based on their chart. Mention specific industries suitable for them.",
  "studyAdvice": "Personalized study tips based on their numerology. How they learn best, subjects they excel in.",
  "bestDaysToStudy": ["Monday", "Thursday", "Saturday"], // 2-4 specific days
  "examSuccessPeriods": "When are their strongest periods for exams. Mention specific months or times.",
  "careerEnergies": {
    "tech": 65, // 0-100 percentage for tech/IT affinity
    "creative": 45, // 0-100 for creative fields
    "business": 80 // 0-100 for business/commerce
  },
  "actionTips": [
    "Specific actionable tip 1",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ]
}

Make it India-specific where relevant (mention UPSC, JEE, NEET if applicable). Be encouraging but practical.
Return ONLY valid JSON, no other text.`;

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a precise JSON generator. Output only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content?.trim();
    
    // Clean up the response
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const insight = JSON.parse(content);

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate career insight' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
