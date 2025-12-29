import { openai } from '@/lib/openai'
import { Event } from '@/types'

export class ContentGeneratorService {
  async generateEventDescription(event: Partial<Event>): Promise<string> {
    const prompt = `Generate an engaging, informative description for a ${event.eventType?.toLowerCase()} event in New Zealand.

Event details:
- Name: ${event.name}
- Location: ${event.location}, ${event.region}
- Date: ${event.startDate}
${event.distances ? `- Distances: ${event.distances.join(', ')}` : ''}
${event.organizer ? `- Organizer: ${event.organizer}` : ''}

Write a compelling description (2-3 paragraphs) that:
1. Highlights what makes this event special
2. Provides practical information for participants
3. Is engaging and encourages participation
4. Includes relevant details about the location and event type

Return only the description text, no markdown formatting.`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at writing engaging event descriptions for sports events in New Zealand.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error generating description:', error)
      return ''
    }
  }

  async generateSEOContent(event: Partial<Event>): Promise<{ title: string; description: string }> {
    const prompt = `Generate SEO-optimized title and meta description for a ${event.eventType?.toLowerCase()} event.

Event details:
- Name: ${event.name}
- Location: ${event.location}, ${event.region}
- Date: ${event.startDate}
${event.distances ? `- Distances: ${event.distances.join(', ')}` : ''}

Return a JSON object with:
{
  "title": "SEO title (50-60 characters)",
  "description": "Meta description (150-160 characters)"
}

The title and description should be compelling, include the event name and location, and encourage clicks.`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert specializing in event marketing.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        return {
          title: `${event.name} - ${event.location}`,
          description: `Join us for ${event.name} in ${event.location}, ${event.region}`,
        }
      }

      const data = JSON.parse(content)
      return {
        title: data.title || `${event.name} - ${event.location}`,
        description: data.description || `Join us for ${event.name} in ${event.location}`,
      }
    } catch (error) {
      console.error('Error generating SEO content:', error)
      return {
        title: `${event.name} - ${event.location}`,
        description: `Join us for ${event.name} in ${event.location}, ${event.region}`,
      }
    }
  }

  async generateTags(event: Partial<Event>): Promise<string[]> {
    const prompt = `Generate relevant tags for a ${event.eventType?.toLowerCase()} event in New Zealand.

Event details:
- Name: ${event.name}
- Location: ${event.location}, ${event.region}
- Type: ${event.eventType}
${event.distances ? `- Distances: ${event.distances.join(', ')}` : ''}

Return a JSON array of 5-10 relevant tags. Tags should include:
- Event type variations
- Distance categories
- Location/region
- Event characteristics (e.g., "trail", "charity", "beginner-friendly")

Return only a JSON array of strings.`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at generating relevant tags for sports events.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      const data = JSON.parse(content)
      return Array.isArray(data.tags) ? data.tags : []
    } catch (error) {
      console.error('Error generating tags:', error)
      return []
    }
  }
}

