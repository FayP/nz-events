import { config } from 'dotenv'
import { resolve } from 'path'
import OpenAI from 'openai'

// Load .env.local file
config({ path: resolve(__dirname, '../../.env.local') })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface DistanceDetail {
  name: string
  distance: string
  elevation: string
  time: string
  description: string
}

export async function generateDistanceDetails(
  eventType: string,
  distances: string[],
  location: string,
  region: string,
  eventName: string
): Promise<DistanceDetail[]> {
  const prompt = `Generate realistic distance details for this ${eventType.toLowerCase()} event in New Zealand.

Event Name: ${eventName}
Location: ${location}, ${region}
Distances: ${distances.join(', ')}

For each distance, generate:
1. Name (e.g., "Full Lap", "Half Marathon", etc.)
2. Distance (e.g., "160km", "21.1km")
3. Elevation gain (realistic for NZ terrain, e.g., "1,850m", "420m")
4. Estimated time range (e.g., "4-8 hrs", "1.5-2.5 hrs")
5. Brief description (one sentence highlighting the route)

Consider:
- Event type (${eventType}) typical characteristics
- New Zealand's terrain (often hilly/rolling)
- Realistic elevation for the distance
- Appropriate time estimates

Return a JSON array with this exact structure:
[
  {
    "name": "Distance name",
    "distance": "XXkm",
    "elevation": "XXXm",
    "time": "X-X hrs",
    "description": "One sentence description"
  }
]`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert on New Zealand endurance events. Generate realistic, engaging distance details based on typical NZ terrain and event types.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('Could not find JSON in response:', content)
      throw new Error('Invalid response format')
    }

    const data = JSON.parse(jsonMatch[0])
    return data as DistanceDetail[]
  } catch (error) {
    console.error(`Error generating distance details:`, error)

    // Return fallback data based on distance count
    return distances.map((dist, idx) => {
      const distanceNum = parseInt(dist.match(/\d+/)?.[0] || '10')
      const elevationEstimate = Math.round(distanceNum * 10) + 'm'
      const timeEstimate = distanceNum < 20 ? '1-2 hrs' : distanceNum < 50 ? '2-4 hrs' : '4-8 hrs'

      return {
        name: dist,
        distance: dist,
        elevation: elevationEstimate,
        time: timeEstimate,
        description: `Experience ${eventType.toLowerCase()} in ${location} with scenic views.`,
      }
    })
  }
}
