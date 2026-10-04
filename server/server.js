import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

const app = express()
const port = process.env.PORT || 3001
const positiveWords = ['love', 'lovely', 'best', 'happy', 'joy', 'joyful', 'good', 'great', 'amazing', 'beautiful', 'fun', 'excited', 'grateful', 'smile', 'win', 'winning', 'perfect', 'wonderful', 'glad', 'enjoy']
const negativeWords = ['sad', 'bad', 'worst', 'hate', 'angry', 'awful', 'terrible', 'boring', 'tired', 'lonely', '失望', 'fail', 'failed', 'stress', 'stressed', 'broken', 'miss', 'cry', 'disappointed']

app.use(cors())
app.use(express.json())

const analysisSchema = new mongoose.Schema({
  caption: { type: String, required: true, maxlength: 500 },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], required: true },
  score: { type: Number, required: true },
  confidence: { type: Number, required: true },
  positiveWords: [String],
  negativeWords: [String],
  explanation: { type: String, required: true },
}, { timestamps: true })
const Analysis = mongoose.model('Analysis', analysisSchema)

function analyzeCaption(caption) {
  const words = caption.toLowerCase().match(/[a-z']+/g) || []
  const positiveMatches = [...new Set(words.filter((word) => positiveWords.includes(word)))]
  const negativeMatches = [...new Set(words.filter((word) => negativeWords.includes(word)))]
  const score = positiveMatches.length - negativeMatches.length
  const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
  const signalCount = positiveMatches.length + negativeMatches.length
  const confidence = signalCount === 0 ? 35 : Math.min(96, 52 + signalCount * 12 + Math.abs(score) * 5)
  const explanation = sentiment === 'positive'
    ? `This caption feels positive because words like ${positiveMatches.join(', ')} point to happiness, warmth, or delight.`
    : sentiment === 'negative'
      ? `This caption feels negative because words like ${negativeMatches.join(', ')} point to frustration, sadness, or difficulty.`
      : 'This caption feels neutral. It does not contain enough strong positive or negative signals to lean either way.'
  return { caption: caption.trim(), sentiment, score, confidence, positiveWords: positiveMatches, negativeWords: negativeMatches, explanation }
}

function serialize(item) {
  return { ...item.toObject(), _id: item._id.toString() }
}

app.get('/api/analyses', async (_request, response) => {
  return response.json((await Analysis.find().sort({ createdAt: -1 }).limit(5)).map(serialize))
})

app.post('/api/analyze', async (request, response) => {
  const caption = typeof request.body.caption === 'string' ? request.body.caption : ''
  if (!caption.trim()) return response.status(400).json({ message: 'Caption is required.' })
  const result = analyzeCaption(caption)
  return response.status(201).json(serialize(await Analysis.create(result)))
})

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required. Add it to .env before starting the API.')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')
  app.listen(port, () => console.log(`API running at http://localhost:${port}`))
}

start().catch((error) => {
  console.error(`MongoDB connection failed: ${error.message}`)
  process.exit(1)
})
