# AI Document Assistant - Feature Specification

**Priority**: HIGH (Core UX differentiator)
**Complexity**: MAJOR (2-4 week implementation)
**Dependencies**: OpenAI API, OCR service, Vector DB for templates

---

## Vision

Transform BZR Portal from **form-based SaaS** to **AI-first conversational document assistant** where:
- Users chat with AI to create documents (text OR image input)
- AI guides them through data collection
- AI-generated documents become shared templates after validation
- Landing page AI acts as sales assistant + live demo

---

## User Stories

### US-AI-1: Landing Page Sales Assistant
**As a** potential customer visiting the website
**I want to** chat with an AI that explains BZR regulations and shows me how the system works
**So that** I understand the value before signing up

**Acceptance Criteria**:
- AI chat widget on landing page (always visible)
- AI answers questions about:
  - Serbian BZR regulations (Zakon 101/2005, Pravilnik 5/2018)
  - Product features & pricing
  - Document types we support
- AI can give **live demo** by creating sample document during conversation
- AI captures lead data (email, company name) naturally in conversation
- Conversation history saved for sales follow-up

### US-AI-2: Conversational Document Creation (Text Input)
**As a** BZR officer
**I want to** create documents by chatting with AI instead of filling forms
**So that** I can work faster and get help understanding requirements

**Acceptance Criteria**:
- User types: "Треба ми Акт о процени ризика за радно место аутомеханичар"
- AI asks clarifying questions:
  - "Колико запослених имате на овом радном месту?"
  - "Који су главни ризици? (могу да помогнем да их идентификујем)"
  - "Да ли имате средства за личну заштиту?"
- AI validates data (PIB checksum, JMBG, etc.) during conversation
- AI generates document and shows preview
- User can ask: "Додај још један ризик: хемијске опасности"
- AI updates document in real-time

### US-AI-3: Image/OCR Document Creation
**As a** BZR officer
**I want to** upload a photo of Obrazac 6 or other government form
**So that** AI extracts data automatically instead of manual typing

**Acceptance Criteria**:
- User uploads image (phone camera photo OK)
- AI performs OCR (Serbian Cyrillic support)
- AI extracts:
  - Company name, PIB, address
  - Position names
  - Hazard types
  - Any structured data
- AI shows extracted data: "Нашао сам ове податке. Да ли је тачно?"
- User confirms or corrects via chat
- AI generates document

### US-AI-4: Template Library & Knowledge Base
**As a** system administrator
**I want to** review AI-generated documents before making them public templates
**So that** quality and legal compliance are maintained

**Acceptance Criteria**:
- When AI generates new document type → status: "Pending Approval"
- Admin dashboard shows pending templates
- Admin can:
  - Approve → becomes public template
  - Reject → request improvements
  - Edit → fix issues and approve
- Approved templates appear in knowledge base
- All users can see: "Овај документ је веома сличан [Шаблон X]. Користити шаблон?"

### US-AI-5: Contextual Help During Form Filling
**As a** user filling traditional forms
**I want to** ask AI for help when confused
**So that** I don't make mistakes

**Acceptance Criteria**:
- AI chat widget available on all pages
- User can ask: "Шта је E×P×F формула?"
- AI explains in Serbian Cyrillic
- AI can pre-fill form fields: "Попуни податке за типично производно предузеће"
- AI provides examples for each field

---

## Technical Architecture

### Components

#### 1. AI Orchestration Service
**File**: `backend/src/services/ai/orchestrator.service.ts`

```typescript
class AIOrchestrator {
  // Route user message to appropriate agent
  async handleMessage(
    userId: string,
    message: string,
    context: ConversationContext
  ): Promise<AIResponse>

  // Detect user intent
  async detectIntent(message: string): Intent
  // CREATE_DOCUMENT | SALES_INQUIRY | HELP_REQUEST | TEMPLATE_SEARCH

  // Maintain conversation state
  async getConversationState(userId: string): ConversationState
}
```

#### 2. Sales Agent
**File**: `backend/src/services/ai/sales-agent.service.ts`

```typescript
class SalesAgent {
  // Answer questions about product/regulations
  async answerQuestion(question: string): Promise<string>

  // Give live demo by creating sample document
  async createDemoDocument(userInput: string): Promise<Document>

  // Capture lead data naturally
  async extractLeadData(conversation: Message[]): LeadData
}
```

#### 3. Document Creation Agent
**File**: `backend/src/services/ai/document-agent.service.ts`

```typescript
class DocumentAgent {
  // Guide user through document creation
  async gatherDocumentData(
    documentType: string,
    conversation: Message[]
  ): Promise<DocumentData>

  // Ask clarifying questions
  async generateQuestions(
    documentType: string,
    currentData: Partial<DocumentData>
  ): Promise<string[]>

  // Validate data during conversation
  async validateInput(field: string, value: string): Promise<ValidationResult>

  // Generate document from conversational data
  async generateDocument(data: DocumentData): Promise<Buffer>
}
```

#### 4. OCR Service
**File**: `backend/src/services/ai/ocr.service.ts`

```typescript
class OCRService {
  // Extract text from image (Serbian Cyrillic)
  async extractText(imageBuffer: Buffer): Promise<string>

  // Parse structured data from government forms
  async parseObrazac6(text: string): Promise<Obrazac6Data>

  // Detect form type from image
  async detectFormType(imageBuffer: Buffer): Promise<FormType>
}

// Provider options:
// - Azure AI Document Intelligence (best for Serbian)
// - Google Cloud Vision API (good multilingual)
// - Tesseract (free, self-hosted, needs training for Cyrillic)
```

#### 5. Template Library Service
**File**: `backend/src/services/ai/template-library.service.ts`

```typescript
class TemplateLibrary {
  // Save AI-generated document as template candidate
  async createTemplateCandidate(
    document: Document,
    metadata: TemplateMetadata
  ): Promise<Template>

  // Admin approval workflow
  async approveTemplate(templateId: number): Promise<void>
  async rejectTemplate(templateId: number, reason: string): Promise<void>

  // Search templates by similarity
  async findSimilarTemplates(documentData: Partial<DocumentData>): Promise<Template[]>

  // Apply template to new document
  async applyTemplate(templateId: number, userData: UserData): Promise<Document>
}
```

#### 6. Vector Database for Semantic Search
**File**: `backend/src/lib/vector-store.ts`

```typescript
// Use Supabase pgvector extension
class VectorStore {
  // Embed document for similarity search
  async embedDocument(document: Document): Promise<number[]>

  // Find similar documents
  async similaritySearch(query: string, limit: number): Promise<Document[]>
}
```

---

## Database Schema Extensions

### conversations
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id TEXT NOT NULL,
  mode TEXT NOT NULL, -- 'sales' | 'document_creation' | 'help'
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  lead_data JSONB, -- Captured from sales conversations
  document_id INTEGER REFERENCES documents(id), -- If conversation created document
  metadata JSONB
);
```

### conversation_messages
```sql
CREATE TABLE conversation_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  role TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  attachments JSONB, -- Image URLs if user uploaded files
  created_at TIMESTAMP DEFAULT NOW()
);
```

### document_templates
```sql
CREATE TABLE document_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL, -- 'akt_procena_rizika' | 'obrazac_6' | etc.
  template_data JSONB NOT NULL, -- Mustache template structure
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  embedding VECTOR(1536), -- For similarity search (pgvector)
  metadata JSONB
);
```

---

## AI Provider Integration

### Recommended: OpenAI GPT-4
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Document creation agent with function calling
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    {
      role: 'system',
      content: `Ти си стручњак за безбедност и здравље на раду у Србији.
      Помажеш корисницима да креирају документе за процену ризика.
      Користиш српски ћирилицу. Познајеш Закон 101/2005 и Правилник 5/2018.`
    },
    { role: 'user', content: userMessage }
  ],
  functions: [
    {
      name: 'create_risk_assessment_document',
      description: 'Create Akt o proceni rizika document',
      parameters: documentDataSchema
    },
    {
      name: 'validate_pib',
      description: 'Validate Serbian PIB tax ID',
      parameters: { type: 'object', properties: { pib: { type: 'string' } } }
    }
  ],
  temperature: 0.7,
});
```

### Alternative: Anthropic Claude (Better for long documents)
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  system: 'Ти си асистент за БЗР документацију...',
  messages: [
    { role: 'user', content: userMessage }
  ]
});
```

---

## OCR Integration

### Option A: Azure AI Document Intelligence (Recommended)
- Best support for Serbian Cyrillic
- Pre-trained models for government forms
- $1.50 per 1000 pages

```typescript
import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';

const client = new DocumentAnalysisClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY)
);

const poller = await client.beginAnalyzeDocument(
  'prebuilt-document', // Or custom trained model
  imageBuffer
);

const result = await poller.pollUntilDone();
```

### Option B: Google Cloud Vision (Good alternative)
```typescript
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();

const [result] = await client.documentTextDetection({
  image: { content: imageBuffer.toString('base64') },
  imageContext: { languageHints: ['sr'] }
});
```

### Option C: Tesseract (Free, self-hosted)
```bash
# Requires training data for Serbian Cyrillic
npm install tesseract.js

import Tesseract from 'tesseract.js';

const { data: { text } } = await Tesseract.recognize(
  imageBuffer,
  'srp', // Serbian language
  { logger: info => console.log(info) }
);
```

---

## Frontend Components

### Landing Page Chat Widget
**File**: `frontend/src/components/ai/LandingChatWidget.tsx`

```tsx
interface ChatWidgetProps {
  mode: 'sales' | 'demo';
}

export function LandingChatWidget({ mode }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="ai-chat-bubble">
          💬 Питајте ме о БЗР документацији
        </button>
      )}

      {isOpen && (
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          onUploadImage={handleImageUpload}
          placeholder="Упишите питање или отпремите слику..."
        />
      )}
    </div>
  );
}
```

### Authenticated Document Creation Chat
**File**: `frontend/src/components/ai/DocumentCreationChat.tsx`

```tsx
export function DocumentCreationChat() {
  const [conversation, setConversation] = useState<Conversation>();
  const [currentDocument, setCurrentDocument] = useState<Document>();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="chat-panel">
        <ChatWindow
          conversation={conversation}
          onSendMessage={handleMessage}
          onUploadImage={handleImageUpload}
        />
      </div>

      <div className="document-preview">
        {currentDocument && (
          <DocumentPreview
            document={currentDocument}
            onEdit={(field, value) => handleEditField(field, value)}
          />
        )}
      </div>
    </div>
  );
}
```

---

## Cost Estimation

### AI API Costs (Monthly for 100 users)
- **GPT-4 Turbo**: ~$0.01/1K input tokens, ~$0.03/1K output tokens
  - Avg conversation: 5K tokens → $0.20 per document
  - 100 users × 10 docs/month = 1000 docs = **$200/month**

- **Claude 3.5 Sonnet**: ~$0.003/1K input, ~$0.015/1K output
  - Same usage → **$90/month**

### OCR Costs
- **Azure**: $1.50/1000 pages
  - 100 users × 5 images/month = 500 images = **$0.75/month**

### Vector Database
- **Supabase pgvector**: Free up to 500MB, then $0.125/GB
  - Embeddings storage: ~5MB → **Free**

**Total AI Cost Estimate**: $90-200/month for 100 active users

---

## Implementation Phases

### Phase 1: Landing Page Sales Agent (Week 1)
- [ ] Setup OpenAI/Claude integration
- [ ] Create sales agent prompt engineering
- [ ] Build chat widget UI
- [ ] Implement conversation storage
- [ ] Lead capture system

### Phase 2: Document Creation Agent (Week 2)
- [ ] Document creation conversational flow
- [ ] Function calling for document generation
- [ ] Real-time document preview
- [ ] Data validation during chat

### Phase 3: OCR Integration (Week 3)
- [ ] Setup Azure/Google OCR
- [ ] Image upload handling
- [ ] Obrazac 6 parser
- [ ] OCR error correction via AI

### Phase 4: Template Library (Week 4)
- [ ] Template approval workflow
- [ ] Vector embeddings for similarity search
- [ ] Template application system
- [ ] Admin dashboard

---

## Questions for You

1. **AI Provider**: OpenAI GPT-4 (faster, more expensive) or Claude 3.5 (better for long docs, cheaper)?

2. **OCR Provider**: Azure (best Serbian support, paid) or Tesseract (free, requires training)?

3. **Hybrid or AI-only**: Keep traditional forms as backup, or go all-in on conversational UI?

4. **When to implement**: Now (pivot from MVP fixes) or after MVP is stable?

5. **Budget**: Are you OK with $90-200/month AI costs for 100 users?

Let me know your answers and I'll start implementing!
