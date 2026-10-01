'use client'

import type { ActivityId } from '@/lib/activities'
import { HallucinationGame } from './hallucination-game'
import { AiDataClassifier } from './ai-data-classifier'
import { PasswordGame } from './password-game'
import { PhishingGame } from './phishing-game'
import { TrafficGame } from './traffic-game'
import { WorryPoll } from './worry-poll'

export function ActivityRenderer({ activity }: { activity: ActivityId }) {
  switch (activity) {
    case 'worry':
      return <WorryPoll />
    case 'password':
      return <PasswordGame />
    case 'phishing':
      return <PhishingGame />
    case 'hallucination':
      return <HallucinationGame />
    case 'traffic':
      return <TrafficGame />
    case 'ai-data':
      return <AiDataClassifier />
  }
}
