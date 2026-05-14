import { startAudioServer } from './server'

const port = Number(process.env.AUDIO_PORT) || 1421
startAudioServer(port)
console.log(`Audio server running on http://localhost:${port}`)
