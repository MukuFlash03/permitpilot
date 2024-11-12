import { Heading } from '@/components/heading'
import SimpleChatInterface from '@/components/simple-chat-interface'

export default async function Home() {
  return (
    <div className="container mx-auto p-4">
      <SimpleChatInterface />
    </div>
  )
}