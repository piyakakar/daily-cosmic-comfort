import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate lunar phase based on date
function getLunarPhase(date: Date): string {
  const synodic = 29.53059;
  const refDate = new Date('2000-01-06');
  const daysSince = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % synodic) / synodic);
  
  if (phase < 0.03 || phase >= 0.97) return 'New Moon';
  if (phase < 0.22) return 'Waxing Crescent';
  if (phase < 0.28) return 'First Quarter';
  if (phase < 0.47) return 'Waxing Gibbous';
  if (phase < 0.53) return 'Full Moon';
  if (phase < 0.72) return 'Waning Gibbous';
  if (phase < 0.78) return 'Last Quarter';
  return 'Waning Crescent';
}

// Check if date is a major lunar phase (new, first quarter, full, last quarter)
function isMajorLunarPhase(date: Date): { isMajor: boolean; phase: string } {
  const synodic = 29.53059;
  const refDate = new Date('2000-01-06');
  const daysSince = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % synodic) / synodic);
  
  if (phase < 0.02 || phase >= 0.98) return { isMajor: true, phase: 'New Moon' };
  if (phase >= 0.23 && phase < 0.27) return { isMajor: true, phase: 'First Quarter' };
  if (phase >= 0.48 && phase < 0.52) return { isMajor: true, phase: 'Full Moon' };
  if (phase >= 0.73 && phase < 0.77) return { isMajor: true, phase: 'Last Quarter' };
  
  return { isMajor: false, phase: getLunarPhase(date) };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate } = await req.json();
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const events: Array<{
      date: string;
      type: string;
      name: string;
      description: string;
      significance: string;
    }> = [];
    
    // Generate lunar phase events
    const current = new Date(start);
    while (current <= end) {
      const { isMajor, phase } = isMajorLunarPhase(current);
      
      if (isMajor) {
        const descriptions: Record<string, { desc: string; sig: string }> = {
          'New Moon': {
            desc: 'The Moon is between Earth and Sun, invisible from Earth.',
            sig: 'Traditionally associated with new beginnings, setting intentions, and introspection.'
          },
          'First Quarter': {
            desc: 'The Moon is 90° from the Sun, half-illuminated.',
            sig: 'Traditionally associated with taking action, overcoming obstacles, and commitment.'
          },
          'Full Moon': {
            desc: 'The Moon is opposite the Sun, fully illuminated.',
            sig: 'Traditionally associated with culmination, release, heightened emotions, and clarity.'
          },
          'Last Quarter': {
            desc: 'The Moon is 270° from the Sun, half-illuminated.',
            sig: 'Traditionally associated with reflection, gratitude, and letting go.'
          }
        };
        
        events.push({
          date: current.toISOString().split('T')[0],
          type: 'lunar',
          name: phase,
          description: descriptions[phase]?.desc || 'A major lunar phase.',
          significance: descriptions[phase]?.sig || 'A time of celestial transition.'
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    // Add seasonal markers if within range
    const year = start.getFullYear();
    const seasonalEvents = [
      { date: `${year}-03-20`, name: 'Spring Equinox', type: 'seasonal', desc: 'Day and night are equal length', sig: 'Marks the beginning of spring, traditionally associated with renewal and balance.' },
      { date: `${year}-06-21`, name: 'Summer Solstice', type: 'seasonal', desc: 'Longest day of the year', sig: 'Marks the peak of solar energy, traditionally associated with celebration and abundance.' },
      { date: `${year}-09-22`, name: 'Autumn Equinox', type: 'seasonal', desc: 'Day and night are equal length', sig: 'Marks the beginning of autumn, traditionally associated with harvest and gratitude.' },
      { date: `${year}-12-21`, name: 'Winter Solstice', type: 'seasonal', desc: 'Shortest day of the year', sig: 'Marks the return of longer days, traditionally associated with reflection and hope.' }
    ];
    
    seasonalEvents.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= start && eventDate <= end) {
        events.push({
          date: event.date,
          type: event.type,
          name: event.name,
          description: event.desc,
          significance: event.sig
        });
      }
    });
    
    // Sort by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return new Response(
      JSON.stringify({ events }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch calendar events' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
