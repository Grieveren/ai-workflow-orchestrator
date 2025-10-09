import type { ChatMessage, RequestData, Request, UserMode, DocType, RoutingInfo, ClaudeApiResponse, ImpactAssessment } from '../types';

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
    const errorData = await response.json().catch(() => ({}));
    console.error('API error response:', errorData);
    throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data: ClaudeApiResponse = await response.json();

  if (!data.content || !data.content[0] || !data.content[0].text) {
    console.error('Unexpected API response structure:', data);
    throw new Error('Invalid API response structure');
  }

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
   * Generate a single document (BRD, FSD, or Tech Spec)
   */
  generateSingleDocument: async (request: Request, mode: UserMode, docType: DocType): Promise<string> => {
    const modeInstructions = {
      guided: 'Keep language simple and explanations clear.',
      collaborative: 'Be professional and thorough.',
      expert: 'Be detailed and technical.'
    };

    const documentPrompts = {
      brd: `Create a concise Business Requirements Document (BRD) for this request:

Request: "${request.title}"
Priority: ${request.priority}
Owner: ${request.owner}

Include ONLY these sections (keep each section to 2-4 bullet points):
## Executive Summary
## Business Objectives
## Success Criteria

${modeInstructions[mode]} Use markdown headers (##) and bullet points. Keep it under 200 words total.
RESPOND ONLY WITH THE MARKDOWN CONTENT. NO JSON.`,

      fsd: `Create a concise Functional Specification Document (FSD) for this request:

Request: "${request.title}"
Priority: ${request.priority}

Include ONLY these sections (keep each section to 2-3 bullet points):
## Overview
## User Stories (2 stories maximum)
## Key Requirements

${modeInstructions[mode]} Use markdown headers (##) and bullet points. Keep it under 200 words total.
RESPOND ONLY WITH THE MARKDOWN CONTENT. NO JSON.`,

      techSpec: `Create a concise Technical Specification for this request:

Request: "${request.title}"
Priority: ${request.priority}

Include ONLY these sections (keep each section to 2-3 bullet points):
## Implementation Approach
## Technical Requirements
## Effort Estimate

${modeInstructions[mode]} Use markdown headers (##) and bullet points. Keep it under 150 words total.
RESPOND ONLY WITH THE MARKDOWN CONTENT. NO JSON.`
    };

    return await callClaude({
      messages: [{ role: 'user', content: documentPrompts[docType] }],
      max_tokens: 1000
    });
  },

  /**
   * Generate all three documents sequentially with progress tracking
   */
  generateDocuments: async (
    request: Request,
    mode: UserMode,
    onProgress?: (docType: DocType) => void
  ): Promise<{ brd: string; fsd: string; techSpec: string }> => {
    const docs = {
      brd: '',
      fsd: '',
      techSpec: ''
    };

    // Generate BRD
    if (onProgress) onProgress('brd');
    docs.brd = await api.generateSingleDocument(request, mode, 'brd');

    // Generate FSD
    if (onProgress) onProgress('fsd');
    docs.fsd = await api.generateSingleDocument(request, mode, 'fsd');

    // Generate Tech Spec
    if (onProgress) onProgress('techSpec');
    docs.techSpec = await api.generateSingleDocument(request, mode, 'techSpec');

    return docs;
  },

  /**
   * Generate requirement documents with streaming support
   * @param onProgress Callback to receive progressive updates
   */
  generateDocumentsStream: async (
    request: Request,
    mode: UserMode,
    onProgress: (partialText: string) => void
  ): Promise<{ brd: string; fsd: string; techSpec: string }> => {
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

    const response = await fetch('http://localhost:3001/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    try {
       
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              // Handle different event types from Claude streaming API
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                accumulatedText += parsed.delta.text;
                onProgress(accumulatedText);
              } else if (parsed.error) {
                console.error('Streaming error from API:', parsed.error);
                throw new Error(parsed.error.message || 'Streaming error');
              }
            } catch (e) {
              // Skip invalid JSON chunks but log them
              if (e instanceof SyntaxError) {
                console.warn('Failed to parse streaming chunk:', data.substring(0, 100));
              } else {
                throw e;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream reading error:', error);
      // If we have accumulated text, try to use it
      if (accumulatedText.length > 100) {
        // console.log('Attempting to parse partial response...');
      } else {
        throw error;
      }
    }

    // Parse final accumulated text
    if (!accumulatedText || accumulatedText.length < 10) {
      throw new Error('No content received from streaming API');
    }

    // console.log('Total accumulated text length:', accumulatedText.length);
    // console.log('First 100 chars:', accumulatedText.substring(0, 100));
    // console.log('Last 100 chars:', accumulatedText.substring(accumulatedText.length - 100));

    const cleanedResponse = cleanJsonResponse(accumulatedText);
    // console.log('Cleaned response length:', cleanedResponse.length);
    // console.log('Cleaned first 100:', cleanedResponse.substring(0, 100));

    try {
      const parsed = JSON.parse(cleanedResponse);
      // console.log('Successfully parsed JSON with keys:', Object.keys(parsed));
      return parsed;
    } catch (error) {
      console.error('Failed to parse final response.');
      console.error('Cleaned response (first 500 chars):', cleanedResponse.substring(0, 500));
      console.error('Parse error:', error);
      throw new Error('Failed to parse generated documents. The response may be incomplete.');
    }
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
  },

  /**
   * Validate inputs for impact scoring (security requirement)
   */
  validateScoringInputs: (
    conversation: ChatMessage[],
    requestData: RequestData
  ): void => {
    // Conversation validation
    if (!conversation || conversation.length === 0) {
      throw new Error('Conversation is required for impact scoring');
    }

    if (conversation.length > 50) {
      throw new Error('Conversation too long (max 50 messages)');
    }

    if (conversation.length < 2) {
      throw new Error('Conversation too short (min 2 messages)');
    }

    // Message content validation
    conversation.forEach((msg, idx) => {
      if (!msg.content || typeof msg.content !== 'string') {
        throw new Error(`Invalid message at index ${idx}`);
      }

      if (msg.content.length > 5000) {
        throw new Error(`Message ${idx} exceeds 5000 characters`);
      }

      if (!/^(user|assistant)$/.test(msg.role)) {
        throw new Error(`Invalid role "${msg.role}" at message ${idx}`);
      }
    });

    // RequestData validation
    if (!requestData) {
      throw new Error('RequestData is required for impact scoring');
    }

    if (requestData.title && requestData.title.length > 200) {
      throw new Error('Request title too long (max 200 chars)');
    }

    if (requestData.problem && requestData.problem.length > 5000) {
      throw new Error('Problem description too long (max 5000 chars)');
    }
  },

  /**
   * Validate parsed impact assessment structure and ranges
   */
  validateImpactAssessment: (parsed: ImpactAssessment): void => {
    // Structure validation
    if (!parsed.totalScore || !parsed.breakdown || !parsed.tier) {
      throw new Error('Invalid impact assessment structure');
    }

    // Total score range
    if (parsed.totalScore < 0 || parsed.totalScore > 100) {
      throw new Error(`Impact totalScore out of range: ${parsed.totalScore} (expected 0-100)`);
    }

    // Breakdown component ranges
    const { breakdown } = parsed;

    if (breakdown.revenueImpact < 0 || breakdown.revenueImpact > 30) {
      throw new Error(`revenueImpact out of range: ${breakdown.revenueImpact} (expected 0-30)`);
    }

    if (breakdown.userReach < 0 || breakdown.userReach > 25) {
      throw new Error(`userReach out of range: ${breakdown.userReach} (expected 0-25)`);
    }

    if (breakdown.strategicAlignment < 0 || breakdown.strategicAlignment > 20) {
      throw new Error(`strategicAlignment out of range: ${breakdown.strategicAlignment} (expected 0-20)`);
    }

    if (breakdown.urgency < 0 || breakdown.urgency > 15) {
      throw new Error(`urgency out of range: ${breakdown.urgency} (expected 0-15)`);
    }

    if (breakdown.quickWinBonus < 0 || breakdown.quickWinBonus > 10) {
      throw new Error(`quickWinBonus out of range: ${breakdown.quickWinBonus} (expected 0-10)`);
    }

    // Tier validation
    if (![1, 2, 3].includes(parsed.tier)) {
      throw new Error(`Invalid tier: ${parsed.tier} (expected 1, 2, or 3)`);
    }
  },

  /**
   * Calculate impact assessment score for a request
   */
  calculateImpactScore: async (
    conversationHistory: ChatMessage[],
    requestData: RequestData
  ): Promise<ImpactAssessment> => {
    // Security: Validate inputs before processing
    api.validateScoringInputs(conversationHistory, requestData);
    const prompt = `You are an expert RevOps analyst calculating the business impact score for a workflow request.

TASK: Analyze the conversation and request data, then assign a 0-100 impact score with breakdown.

CONVERSATION TRANSCRIPT:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

REQUEST DATA:
${JSON.stringify(requestData, null, 2)}

SCORING RUBRIC (0-100 points total):

1. REVENUE IMPACT (0-30 points)
   Analyze revenue signals from conversation:

   Direct Revenue (20-30 pts):
   - "close deals faster", "increase sales", "pricing optimization"
   - "upsell", "cross-sell", "new revenue stream"

   Revenue Protection (10-20 pts):
   - "customers churning", "retention issue", "compliance risk"
   - "contract renewal", "avoiding penalties"

   Efficiency Gains (5-15 pts):
   - "5+ hours per week" → estimate hourly rate × time saved
   - "automation", "eliminate manual work"
   - Default: 100/hr × hours saved per week × 52 weeks / 12 months

   No Revenue Impact (0-5 pts):
   - "nice to have", "cosmetic", "minor improvement"

2. USER REACH (0-25 points)
   Extract user signals from conversation:

   User Count:
   - 50+ users → 20-25 pts
   - 10-49 users → 15-20 pts
   - 2-9 users → 5-15 pts
   - 1 user → 0-5 pts

   Keywords: "team of X", "all sales reps", "entire department", "just me"

   Frequency Bonus:
   - "daily", "every morning", "constantly" → +5 pts
   - "weekly", "regularly" → +3 pts
   - "monthly" → +1 pt

   User Type Multiplier:
   - "executive", "VP", "C-level" → +5 pts
   - "manager", "lead", "senior" → +3 pts

3. STRATEGIC ALIGNMENT (0-20 points)
   Look for strategy keywords:

   Explicit Strategy (15-20 pts):
   - "OKR", "Q1 goal", "company initiative"
   - "board requested", "strategic priority"

   Competitive (10-15 pts):
   - "competitor has this", "market differentiation"
   - "customer expectation", "industry standard"

   Technical Debt (5-10 pts):
   - "blocking other work", "enables future features"
   - "platform upgrade", "scalability"

   No Strategy (0-5 pts):
   - No mention of goals or strategy

4. URGENCY/TIME SENSITIVITY (0-15 points)
   Extract deadline signals:

   Hard Deadlines (10-15 pts):
   - Dates: "by Friday", "before Q2", "next week"
   - Compliance: "regulatory", "audit", "legal requirement"

   Opportunity Windows (5-10 pts):
   - "product launch", "campaign", "seasonal"
   - "before competitor", "market timing"

   Escalation Risk (3-7 pts):
   - "executive asking", "escalated", "critical"
   - Urgency words: "urgent", "ASAP", "immediately"

   No Time Pressure (0-3 pts):
   - "when you can", "someday", "no rush"

5. QUICK WIN BONUS (0-10 points)
   Calculate: (Potential Impact / Effort) × 2

   Extract complexity from requestData.complexity or conversation:
   - "simple", "quick fix", "small change" → 1-3 days
   - "medium", "moderate" → 4-10 days
   - "complex", "big project", "major change" → >10 days

   Formula:
   - Simple (<3 days) + High Impact (>60) → 8-10 pts
   - Simple + Medium Impact (40-60) → 5-7 pts
   - Medium (4-10 days) + High Impact → 3-5 pts
   - All others → 0-2 pts

INFERENCE GUIDELINES:
- Users rarely state impact explicitly - infer from pain points
- "Spending hours on X" → calculate efficiency gains
- "Blocking work" → high urgency, high impact
- "Just me" vs "team" → user reach estimation
- Vague complexity → default to "medium" (5 days)
- Missing stakeholders → default to 5 users
- If conversation is minimal (<3 exchanges), be conservative with scores

OUTPUT FORMAT (RESPOND ONLY WITH VALID JSON):
{
  "totalScore": 72,
  "breakdown": {
    "revenueImpact": 22,
    "userReach": 18,
    "strategicAlignment": 15,
    "urgency": 12,
    "quickWinBonus": 5
  },
  "tier": 1,
  "assessedAt": "${new Date().toISOString()}",
  "assessedBy": "AI",
  "justification": "2-3 sentence summary explaining the score. Mention key factors: revenue impact type, user count, deadlines, and strategic context."
}

VALIDATION:
- totalScore MUST equal sum of breakdown (within 0.01 tolerance)
- All breakdown values must be within their max ranges
- justification must reference specific conversation details
- Be consistent: same inputs should produce same scores

NO MARKDOWN CODE BLOCKS. NO EXPLANATIONS. ONLY VALID JSON.`;

    const response = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    });

    try {
      const cleanedResponse = cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse) as ImpactAssessment;

      // Validate structure and ranges
      api.validateImpactAssessment(parsed);

      // Validation: ensure breakdown sums to totalScore
      const sum = Object.values(parsed.breakdown).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - parsed.totalScore) > 0.01) {
        console.warn(`Impact score validation failed: totalScore=${parsed.totalScore}, sum=${sum}`);
      }

      return parsed;
    } catch {
      console.error('Failed to parse impact assessment');
      throw new Error('Impact scoring failed - invalid AI response');
    }
  },

  // ===== DATABASE METHODS =====

  /**
   * Fetch all requests from the database
   */
  async getAllRequests(): Promise<Request[]> {
    const response = await fetch('http://localhost:3001/api/requests');
    if (!response.ok) {
      throw new Error(`Failed to fetch requests: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetch a single request by ID from the database
   */
  async getRequestById(id: string): Promise<Request> {
    const response = await fetch(`http://localhost:3001/api/requests/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch request: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create a new request in the database
   */
  async createRequest(request: Request): Promise<Request> {
    const response = await fetch('http://localhost:3001/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to create request: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Update an existing request in the database
   */
  async updateRequest(id: string, updates: Partial<Request>): Promise<{ success: boolean }> {
    const response = await fetch(`http://localhost:3001/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update request: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Delete a request from the database
   */
  async deleteRequest(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`http://localhost:3001/api/requests/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete request: ${response.statusText}`);
    }
    return response.json();
  }
};
