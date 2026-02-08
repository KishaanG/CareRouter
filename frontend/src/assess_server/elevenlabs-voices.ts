// Utility to list all available ElevenLabs voices
// Run this in the browser console to see all voices available with your API key

export async function listElevenLabsVoices() {
  const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

  if (!API_KEY) {
    console.error('❌ ElevenLabs API key not found in .env.local')
    return []
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('\n🎤 ELEVENLABS VOICES AVAILABLE:\n')
    console.log('='  .repeat(60))
    
    data.voices.forEach((voice: any) => {
      const labels = voice.labels ? Object.entries(voice.labels).map(([k, v]) => `${k}: ${v}`).join(', ') : ''
      console.log(`\n📢 ${voice.name}`)
      console.log(`   ID: ${voice.voice_id}`)
      console.log(`   Category: ${voice.category}`)
      console.log(`   Description: ${voice.description || 'N/A'}`)
      console.log(`   Labels: ${labels || 'N/A'}`)
      if (voice.preview_url) {
        console.log(`   Preview: ${voice.preview_url}`)
      }
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('\n💡 To use a voice, copy its ID and paste it in ChatMessage.tsx')
    console.log('   Look for: const VOICE_ID = "..." \n')
    
    return data.voices
    
  } catch (error) {
    console.error('❌ Error fetching voices:', error)
    return []
  }
}

// Call this function from the browser console:
// listElevenLabsVoices()

if (typeof window !== 'undefined') {
  (window as any).listElevenLabsVoices = listElevenLabsVoices
}

// ========================================
// POPULAR ELEVENLABS VOICES (Pre-made)
// ========================================
// 
// These voices work without any setup:
//
// 🎀 FEMALE VOICES:
// - Rachel (21m00Tcm4TlvDq8ikWAM) - Calm, friendly, professional
// - Domi (AZnzlk1XvdvUeBnXmlld) - Strong, confident
// - Bella (EXAVITQu4vr4xnSDxMaL) - Soft, warm, soothing
// - Elli (MF3mGyEYCl7XYWbV9V6O) - Young, energetic
// - Grace (oWAxZDx7w5VEj9dCyTzz) - Professional, calm
// - Emily (LcfcDJNUP1GQjkzn1xUU) - Gentle, conversational
//
// 🎤 MALE VOICES:
// - Adam (pNInz6obpgDQGcFmaJgB) - Deep, authoritative
// - Antoni (ErXwobaYiN019PkySvjV) - Well-rounded, versatile
// - Josh (TxGEqnHWrfWFTfGW9XjX) - Casual, friendly
// - Arnold (VR6AewLTigWG4xSOukaG) - Crisp, clear
//
// 🌟 MULTILINGUAL:
// - Matilda (XrExE9yKIg1WjnnlVkGX) - Warm, friendly
//
