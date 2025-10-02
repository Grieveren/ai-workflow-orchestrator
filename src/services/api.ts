import type { ChatMessage, RequestData, Request, UserMode, DocType, RoutingInfo, ClaudeApiResponse } from '../types';

const API_URL = 'http://localhost:3001/api/chat';
const MODEL = 'claude-sonnet-4-5-20250929';

interface ApiRequest {
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
}

/**
 * Core function to call Claude API via backend proxy
 */
async function callClaude(request: ApiRequest): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: request.max_tokens || 2000,
      messages: request.messages
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ClaudeApiResponse = await response.json();
  return data.content[0].text;
}

/**
 * Parse bullet points from AI response
 */
function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  return lines
    .filter(line => line.trim().startsWith('•'))
    .map(line => line.trim().substring(1).trim());
}

/**
 * Remove bullet points from text
 */
function removeBulletPoints(text: string): string {
  const lines = text.split('\n');
  return lines
    .filter(line => !line.trim().startsWith('•'))
    .join('\n')
    .trim();
}

/**
 * Clean JSON response (remove markdown code blocks)
 */
function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

export const api = {
  /**
   * Start initial intake conversation with user
   */
  startIntakeConversation: async (initialMessage: string): Promise<{ message: string; options: string[] }> => {
    const prompt = `You are a helpful AI intake assistant for the RevOps team. Your ONLY job is to collect requirement information from business users. You do NOT give advice, suggest solutions, troubleshoot, or tell them what to do.

User's initial request: "${initialMessage}"

CRITICAL RULES - READ CAREFULLY:
1. NEVER suggest solutions, workarounds, or tell them who to contact
2. NEVER troubleshoot or diagnose problems
3. NEVER give advice on what they should do
4. ONLY ask questions to gather information
5. Ask ONE question at a time with 2-4 ANSWER CHOICES (not questions)
6. Keep responses short and friendly
7. Your goal: collect enough detail so the RevOps team knows exactly what to work on

IMPORTANT: When you provide examples with "•", these MUST be potential ANSWERS the user can select, NOT more questions.

Information to collect (one at a time):
1. PROBLEM: What's not working or what's the pain point? (be specific)
2. IMPACT: How is this affecting work? (time wasted, work blocked, errors, etc.)
3. SYSTEMS: What tools/systems are involved?
4. URGENCY: How urgent is this? (critical/high/medium/low)
5. SCOPE: Is this affecting just you or multiple people?

After collecting all info, say: "Got it! I have everything the RevOps team needs. Click Submit to send this request."

Start by asking your FIRST question with helpful ANSWER examples using "•".

BAD EXAMPLE (DO NOT DO THIS):
"How is this impacting your work?
• How much time are you spending? [WRONG - this is a question]
• What delays are you seeing? [WRONG - this is a question]"

GOOD EXAMPLE (DO THIS):
"How is this impacting your work?
• Spending 5+ hours per week on manual workarounds [RIGHT - this is an answer]
• Sales follow-up delayed by 24-48 hours [RIGHT - this is an answer]
• Missing out on 10-20 leads per week [RIGHT - this is an answer]
• Work is completely blocked [RIGHT - this is an answer]"`;

    const aiResponse = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000
    });

    const options = extractBulletPoints(aiResponse);
    const message = removeBulletPoints(aiResponse);

    return { message, options };
  },

  /**
   * Continue multi-turn conversation
   */
  continueConversation: async (conversationHistory: ChatMessage[]): Promise<{ message: string; options: string[]; isComplete: boolean }> => {
    const systemPrompt = `SYSTEM INSTRUCTIONS - FOLLOW STRICTLY:
You are an intake bot collecting requirements for RevOps. You NEVER give advice, suggest solutions, or troubleshoot.

FORBIDDEN ACTIONS:
- DO NOT suggest solutions ("You should..." "Try..." "I recommend...")
- DO NOT give advice ("Contact X" "Reference Y")
- DO NOT troubleshoot ("Have you tried..." "Check if...")
- DO NOT explain technical things

CRITICAL: When providing bullet point options with "•", these MUST be ANSWERS the user can choose, NOT questions.

BAD (questions as options):
• How much time is this taking? [WRONG]
• What's the impact? [WRONG]

GOOD (answers as options):
• Taking 5+ hours per week [RIGHT]
• Blocking all work [RIGHT]
• Affecting 20+ people [RIGHT]

ONLY ALLOWED ACTIONS:
- Ask the next requirement question
- Provide 2-4 ANSWER CHOICES as bullet points
- Acknowledge their answer briefly
- Move to next question

Questions to ask (one at a time):
1. What specifically is the problem/need?
2. How is this impacting work? (provide impact statements as options, not questions)
3. What systems/tools are involved?
4. How urgent is this? (critical/high/medium/low)
5. Is this affecting just you or multiple people?

When all questions answered, say: "Got it! I have everything needed. Click Submit below."

Current conversation:
${conversationHistory.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n')}

User's latest message: ${conversationHistory[conversationHistory.length - 1].content}

Your response (ask next question with 2-4 selectable ANSWER options using "•"):`;

    const aiResponse = await callClaude({
      messages: [{ role: 'user', content: systemPrompt }],
      max_tokens: 2000
    });

    const options = extractBulletPoints(aiResponse);
    const message = removeBulletPoints(aiResponse);
    const isComplete = aiResponse.includes('COMPLETE') || conversationHistory.length >= 10;

    return { message, options, isComplete };
  },

  /**
   * Extract structured data from conversation
   */
  extractRequestData: async (conversationHistory: ChatMessage[]): Promise<RequestData> => {
    const prompt = `Based on this conversation, extract structured data:

${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Create a JSON summary with:
{
  "title": "Short descriptive title of the request",
  "problem": "What pain point they're experiencing",
  "success": "What success looks like",
  "systems": ["List of systems involved"],
  "urgency": "high/medium/low",
  "stakeholders": ["People who need to be involved"]
}

RESPOND ONLY WITH VALID JSON. NO OTHER TEXT.`;

    const response = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    });

    const cleanedResponse = cleanJsonResponse(response);
    return JSON.parse(cleanedResponse);
  },

  /**
   * Route request to appropriate team member
   */
  routeRequest: async (requestData: RequestData): Promise<RoutingInfo> => {
    const prompt = `Route this request to the best team member:

Request: ${JSON.stringify(requestData, null, 2)}

Team members:
- Sarah Chen (Data Analyst): Reports, dashboards, data analysis
- Mike Torres (Salesforce Admin): Automation, workflows, field changes
- Jennifer Kim (RevOps Manager): Process changes, strategic projects
- Alex Rivera (Systems Specialist): Integrations, technical configurations

Respond ONLY with valid JSON:
{
  "owner": "Full name",
  "type": "report/automation/analysis/configuration",
  "complexity": "simple/medium/complex",
  "timeline": "X days",
  "priority": "High/Medium/Low"
}

NO OTHER TEXT.`;

    const response = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    });

    const cleanedResponse = cleanJsonResponse(response);
    return JSON.parse(cleanedResponse);
  },

  /**
   * Generate requirement documents (BRD, FSD, Tech Spec)
   */
  generateDocuments: async (request: Request, mode: UserMode): Promise<{ brd: string; fsd: string; techSpec: string }> => {
    const modeInstructions = {
      guided: 'You are a patient teacher helping a junior Product Owner. Keep explanations clear and concise.',
      collaborative: 'You are helping an experienced Product Owner. Be professional and thorough.',
      expert: 'You are helping a senior Product Owner. Be detailed and technical.'
    };

    const prompt = `${modeInstructions[mode]}

Generate three requirement documents for this request:

Request: "${request.title}"
Priority: ${request.priority}
Owner: ${request.owner}

Create professional requirement documents with these sections:

BUSINESS REQUIREMENTS DOCUMENT (BRD):
- Executive Summary
- Business Objectives
- Current State & Pain Points
- Desired Future State
- Stakeholders
- Scope
- Success Criteria

FUNCTIONAL SPECIFICATION DOCUMENT (FSD):
- Overview
- User Stories (2-3 stories)
- Functional Requirements
- Data Requirements
- Business Rules

TECHNICAL SPECIFICATION:
- Technical Overview
- Implementation Approach
- Technical Requirements
- Configuration Changes
- Effort Estimate

Output as JSON:
{
  "brd": "markdown content",
  "fsd": "markdown content",
  "techSpec": "markdown content"
}

Keep each document concise but complete. Use markdown headers (##) and bullet points.
RESPOND ONLY WITH VALID JSON.`;

    const response = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000
    });

    const cleanedResponse = cleanJsonResponse(response);
    return JSON.parse(cleanedResponse);
  },

  /**
   * Refine/update a specific document based on feedback
   */
  refineDocument: async (currentDoc: string, docType: DocType, feedback: string): Promise<string> => {
    const docNames: Record<DocType, string> = {
      brd: 'Business Requirements Document',
      fsd: 'Functional Specification Document',
      techSpec: 'Technical Specification'
    };

    const prompt = `You are helping refine a ${docNames[docType]}.

Current document content:
${currentDoc}

User's refinement request: ${feedback}

Update the document based on their feedback. Respond with the COMPLETE updated document in markdown format.
Include all sections, not just the changed parts.`;

    return await callClaude({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000
    });
  }
};
