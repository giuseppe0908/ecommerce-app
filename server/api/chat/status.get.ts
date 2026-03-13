import { probeAiChatAvailability } from '../../utils/ai-chat'

export default defineEventHandler(async (event) => {
  return probeAiChatAvailability(event)
})
