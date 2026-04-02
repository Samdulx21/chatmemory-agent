export interface QuickAction {
  id: number
  text: string
  action: string
}

export interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
  messageType?: "text" | "card"
  productData?: ProductData[]
}

export interface ProductData {
  product_id: number
  name: string
  permalink: string
  image_src: string
  color: string
  grape_varieties: string
  region: string
  vintage: number
  alcohol_content: number
  winery: string
  price?: string
}


export interface WelcomeMessage {
  id: number
  welcome: string
  text: string
  description: string
  sender: "bot" | "user"
  timestamp: Date
}

export interface EduChatConfig {
  apiKey: string
  webhookUrl: string
  videoUrl?: string
  position?: "bottom-right" | "bottom-left"
  primaryColor?: string
  autoOpen?: boolean
  welcomeMessage?: Partial<WelcomeMessage>
  quickActions?: QuickAction[]
}