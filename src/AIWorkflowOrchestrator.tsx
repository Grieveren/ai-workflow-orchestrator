import React, { useState } from 'react';
import { Send, Bot, CheckCircle, Clock, AlertCircle, Users, Lightbulb, ArrowRight } from 'lucide-react';

export default function AIWorkflowOrchestrator() {
  const [activeTab, setActiveTab] = useState('submit');
  const [view, setView] = useState('requester'); // 'requester' or 'dev'
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestData, setRequestData] = useState({});
  const [showExamples, setShowExamples] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userMode, setUserMode] = useState(null);
  const [generatedDocs, setGeneratedDocs] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState('brd');
  const [docChatMessages, setDocChatMessages] = useState([]);
  const [docUserInput, setDocUserInput] = useState('');
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [requests, setRequests] = useState([
    {
      id: 'REQ-001',
      title: 'Lead conversion report by region',
      status: 'In Progress',
      owner: 'Sarah Chen',
      priority: 'High',
      clarityScore: 9,
      daysOpen: 3,
      stage: 'In Progress',
      lastUpdate: '2 hours ago',
      activity: [
        { timestamp: '3 days ago', action: 'Request submitted', user: 'Jessica Martinez' },
        { timestamp: '3 days ago', action: 'Auto-routed to Sarah Chen', user: 'AI Agent' },
        { timestamp: '2 days ago', action: 'Requirements generated', user: 'Sarah Chen' },
        { timestamp: '2 days ago', action: 'Approved and sent to dev', user: 'Sarah Chen' },
        { timestamp: '2 hours ago', action: 'Status updated: 60% complete', user: 'Sarah Chen' }
      ]
    },
    {
      id: 'REQ-002',
      title: 'Salesforce automation for renewals',
      status: 'Ready for Dev',
      owner: 'Mike Torres',
      priority: 'Medium',
      clarityScore: 6,
      daysOpen: 1,
      stage: 'Ready for Dev',
      lastUpdate: '1 day ago',
      activity: [
        { timestamp: '1 day ago', action: 'Request submitted', user: 'Tom Wilson' },
        { timestamp: '1 day ago', action: 'Auto-routed to Mike Torres', user: 'AI Agent' },
        { timestamp: '1 day ago', action: 'Requirements generated', user: 'Mike Torres' }
      ]
    },
    {
      id: 'REQ-003',
      title: 'Customer health score dashboard',
      status: 'Scoping',
      owner: 'Jennifer Kim',
      priority: 'High',
      clarityScore: 8,
      daysOpen: 5,
      stage: 'Scoping',
      lastUpdate: '3 days ago',
      activity: [
        { timestamp: '5 days ago', action: 'Request submitted', user: 'Mark Stevens' },
        { timestamp: '5 days ago', action: 'Auto-routed to Jennifer Kim', user: 'AI Agent' },
        { timestamp: '3 days ago', action: 'AI reminder sent: No activity for 48 hours', user: 'AI Agent' }
      ],
      aiAlert: 'No activity for 3 days - may be stalled'
    }
  ]);

  const exampleRequests = [
    "We're spending hours every week manually copying data between systems",
    "I need a report to see which marketing campaigns are actually working",
    "Our renewal process is completely manual and things are falling through the cracks",
    "The sales team can't see which leads to prioritize"
  ];

  const startConversation = async (initialMessage = null) => {
    const firstMessage = initialMessage || userInput;
    if (!firstMessage.trim()) return;

    const userMessage = { role: 'user', content: firstMessage };
    setChatMessages([userMessage]);
    setUserInput('');
    setIsProcessing(true);
    setShowExamples(false);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `You are a helpful AI intake assistant for the RevOps team. Your ONLY job is to collect requirement information from business users. You do NOT give advice, suggest solutions, troubleshoot, or tell them what to do.

User's initial request: "${firstMessage}"

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
• Work is completely blocked [RIGHT - this is an answer]"`
            }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.content[0].text;

      const lines = aiResponse.split('\n');
      const options = lines
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.trim().substring(1).trim());
      
      const messageWithoutOptions = lines
        .filter(line => !line.trim().startsWith('•'))
        .join('\n')
        .trim();

      setCurrentOptions(options);
      setChatMessages([userMessage, { role: 'assistant', content: messageWithoutOptions }]);
      setShowOtherInput(false);
    } catch (error) {
      console.error('AI clarification error:', error);
      setChatMessages([userMessage, { 
        role: 'assistant', 
        content: 'I encountered an error. Please try again or rephrase your request.' 
      }]);
    }

    setIsProcessing(false);
  };

  const continueConversation = async (customInput = null) => {
    const messageText = customInput || userInput;
    if (!messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setUserInput('');
    setIsProcessing(true);

    try {
      const conversationHistory = updatedMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const messagesWithSystem = [
        {
          role: "user",
          content: `SYSTEM INSTRUCTIONS - FOLLOW STRICTLY:
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

Your response (ask next question with 2-4 selectable ANSWER options using "•"):`
        }
      ];

      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 2000,
          messages: messagesWithSystem
        })
      });

      const data = await response.json();
      const aiResponse = data.content[0].text;

      const lines = aiResponse.split('\n');
      const options = lines
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.trim().substring(1).trim());
      
      const messageWithoutOptions = lines
        .filter(line => !line.trim().startsWith('•'))
        .join('\n')
        .trim();

      setCurrentOptions(options);

      if (aiResponse.includes('COMPLETE') || updatedMessages.length >= 10) {
        try {
          const summaryResponse = await fetch("http://localhost:3001/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-5-20250929",
              max_tokens: 1000,
              messages: [
                {
                  role: "user",
                  content: `Based on this conversation, extract structured data:

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

RESPOND ONLY WITH VALID JSON. NO OTHER TEXT.`
                }
              ]
            })
          });

          const summaryData = await summaryResponse.json();
          let summaryText = summaryData.content[0].text.trim();
          summaryText = summaryText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const extracted = JSON.parse(summaryText);
          setRequestData(extracted);

          setChatMessages([...updatedMessages, { 
            role: 'assistant', 
            content: `Perfect! I have everything I need. Here's what I understand:\n\n**What you need:** ${extracted.title}\n\n**The problem:** ${extracted.problem}\n\n**Success looks like:** ${extracted.success}\n\n**Systems involved:** ${extracted.systems.join(', ')}\n\n**Urgency:** ${extracted.urgency}\n\nClick "Submit Request" below and I'll route this to the right person on your team!` 
          }]);
          setCurrentOptions([]);
        } catch (e) {
          setChatMessages([...updatedMessages, { 
            role: 'assistant', 
            content: aiResponse + '\n\nI think I have enough information now! Click "Submit Request" to continue.' 
          }]);
          setCurrentOptions([]);
        }
      } else {
        setChatMessages([...updatedMessages, { role: 'assistant', content: messageWithoutOptions }]);
      }
      setShowOtherInput(false);
    } catch (error) {
      console.error('AI conversation error:', error);
      setChatMessages([...updatedMessages, { 
        role: 'assistant', 
        content: 'I had trouble processing that. Could you rephrase your answer?' 
      }]);
    }

    setIsProcessing(false);
  };

  const handleOptionClick = (option) => {
    continueConversation(option);
  };

  const submitRequest = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Route this request to the best team member:

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

NO OTHER TEXT.`
            }
          ]
        })
      });

      const data = await response.json();
      let routingInfo = data.content[0].text.trim();
      routingInfo = routingInfo.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const routing = JSON.parse(routingInfo);

      const newRequest = {
        id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
        title: requestData.title || 'New Request',
        status: 'Scoping',
        owner: routing.owner,
        priority: routing.priority,
        clarityScore: 9,
        daysOpen: 0,
        stage: 'Scoping',
        timeline: routing.timeline
      };

      setRequests([newRequest, ...requests]);
      setActiveTab('dashboard');
      setChatMessages([]);
      setRequestData({});
    } catch (error) {
      console.error('Routing error:', error);
      alert('Routing failed. Please try again.');
    }

    setIsProcessing(false);
  };

  const resetChat = () => {
    setChatMessages([]);
    setRequestData({});
    setUserInput('');
    setShowExamples(false);
    setShowOtherInput(false);
    setCurrentOptions([]);
  };

  const generateRequirements = async () => {
    console.log('generateRequirements called');
    setIsProcessing(true);
    setIsGenerating(true);

    try {
      const modeInstructions = {
        guided: `You are a patient teacher helping a junior Product Owner. Keep explanations clear and concise.`,
        collaborative: `You are helping an experienced Product Owner. Be professional and thorough.`,
        expert: `You are helping a senior Product Owner. Be detailed and technical.`
      };

      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `${modeInstructions[userMode]}

Generate three requirement documents for this request:

Request: "${selectedRequest.title}"
Priority: ${selectedRequest.priority}
Owner: ${selectedRequest.owner}

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
RESPOND ONLY WITH VALID JSON.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let docsText = data.content[0].text.trim();
      
      docsText = docsText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const docs = JSON.parse(docsText);
      
      console.log('Documents generated successfully');
      setGeneratedDocs(docs);
      setIsGenerating(false);
    } catch (error) {
      console.error('Requirements generation error:', error);
      alert('Failed to generate requirements. Please try again.');
      setGeneratedDocs(null);
      setUserMode(null);
      setIsGenerating(false);
    }

    setIsProcessing(false);
  };

  const refineDocument = async () => {
    if (!docUserInput.trim()) return;

    const userMessage = { role: 'user', content: docUserInput };
    const updatedMessages = [...docChatMessages, userMessage];
    setDocChatMessages(updatedMessages);
    setDocUserInput('');
    setIsProcessing(true);

    try {
      const docNames = {
        brd: 'Business Requirements Document',
        fsd: 'Functional Specification Document',
        techSpec: 'Technical Specification'
      };

      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 3000,
          messages: [
            {
              role: "user",
              content: `You are helping refine a ${docNames[activeDocTab]}.

Current document content:
${generatedDocs[activeDocTab]}

User's refinement request: ${docUserInput}

Update the document based on their feedback. Respond with the COMPLETE updated document in markdown format.
Include all sections, not just the changed parts.`
            }
          ]
        })
      });

      const data = await response.json();
      const updatedDoc = data.content[0].text.trim();

      setGeneratedDocs({
        ...generatedDocs,
        [activeDocTab]: updatedDoc
      });

      setDocChatMessages([...updatedMessages, { 
        role: 'assistant', 
        content: 'I\'ve updated the document based on your feedback. Review the changes above.' 
      }]);
    } catch (error) {
      console.error('Document refinement error:', error);
      setDocChatMessages([...updatedMessages, { 
        role: 'assistant', 
        content: 'I had trouble updating the document. Please try again.' 
      }]);
    }

    setIsProcessing(false);
  };

  const viewRequestDetail = (request) => {
    console.log('viewRequestDetail called for:', request.id);
    console.log('Before reset - isGenerating:', isGenerating, 'generatedDocs:', generatedDocs);
    setSelectedRequest(request);
    setUserMode(null);
    setGeneratedDocs(null);
    setIsGenerating(false);
    setActiveDocTab('brd');
    setDocChatMessages([]);
    setDocUserInput('');
    setActiveTab('detail');
    console.log('After reset - should be: isGenerating: false, generatedDocs: null');
  };

  const closeRequestDetail = () => {
    setSelectedRequest(null);
    setUserMode(null);
    setGeneratedDocs(null);
    setIsGenerating(false);
    setActiveDocTab('brd');
    setDocChatMessages([]);
    setDocUserInput('');
    setIsEditingDoc(false);
    setActiveTab('dashboard');
  };

  const updateRequestStage = (requestId, newStage, note) => {
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        const activity = [...(req.activity || []), {
          timestamp: 'Just now',
          action: note,
          user: view === 'dev' ? req.owner : 'Product Owner'
        }];
        return {
          ...req,
          stage: newStage,
          lastUpdate: 'Just now',
          activity,
          aiAlert: null
        };
      }
      return req;
    }));
  };

  const handleSendReminder = () => {
    alert('In production, AI would send a reminder message');
  };

  const handleDismissAlert = () => {
    setRequests(requests.map(r => 
      r.id === selectedRequest.id ? {...r, aiAlert: null} : r
    ));
  };

  const handleExportDocument = () => {
    const docNames = {
      brd: 'Business Requirements Document',
      fsd: 'Functional Specification Document',
      techSpec: 'Technical Specification'
    };
    const blob = new Blob([generatedDocs[activeDocTab]], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = selectedRequest.id + '-' + docNames[activeDocTab] + '.md';
    a.download = fileName;
    a.click();
  };

  const handleExportAll = () => {
    const header = '# ' + selectedRequest.id + ' - Complete Requirements Package\n\n';
    const brdSection = '## Business Requirements Document\n\n' + generatedDocs.brd + '\n\n';
    const fsdSection = '## Functional Specification Document\n\n' + generatedDocs.fsd + '\n\n';
    const techSection = '## Technical Specification\n\n' + generatedDocs.techSpec;
    const allDocs = header + brdSection + fsdSection + techSection;
    const blob = new Blob([allDocs], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = selectedRequest.id + '-Complete-Requirements.md';
    a.download = fileName;
    a.click();
  };

  const handleApproveForDev = () => {
    alert('In production, this would move the request to Ready for Dev status and notify the dev team');
  };

  const handleAcceptWork = () => {
    updateRequestStage(selectedRequest.id, 'In Progress', 'Dev accepted and started work');
    alert('Status changed to In Progress');
  };

  const handleRejectWork = () => {
    const reason = prompt('Why are you rejecting this request?');
    if (reason) {
      updateRequestStage(selectedRequest.id, 'Scoping', 'Dev rejected: ' + reason);
      alert('Request sent back for clarification');
    }
  };

  const handleAddUpdate = () => {
    const update = prompt('Enter status update');
    if (update) {
      updateRequestStage(selectedRequest.id, 'In Progress', update);
    }
  };

  const handleMarkComplete = () => {
    updateRequestStage(selectedRequest.id, 'Review', 'Work completed - ready for review');
    alert('Request moved to Review stage');
  };

  const handleApprove = () => {
    updateRequestStage(selectedRequest.id, 'Completed', 'Review approved - request completed');
    alert('Request marked as complete');
  };

  const handleRequestChanges = () => {
    const feedback = prompt('What needs to be changed?');
    if (feedback) {
      updateRequestStage(selectedRequest.id, 'In Progress', 'Feedback: ' + feedback);
      alert('Feedback sent to dev');
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      'Intake': 'bg-gray-100 text-gray-700',
      'Scoping': 'bg-yellow-100 text-yellow-700',
      'Ready for Dev': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-purple-100 text-purple-700',
      'Review': 'bg-orange-100 text-orange-700',
      'Completed': 'bg-green-100 text-green-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  const renderModeSelector = () => {
    console.log('Rendering mode selector');
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Generate Requirements Documents
            </h3>
            <p className="text-gray-600">
              AI will create BRD, FSD, and Technical Spec based on the request details
            </p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              How would you like me to assist you?
            </label>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 ${
                userMode === 'guided' ? 'border-blue-500 bg-blue-50' : ''
              }`}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="guided"
                  checked={userMode === 'guided'}
                  onChange={(e) => setUserMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">🎓 Guided Mode</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Perfect if: You're new to writing specs or want to learn best practices. I'll explain concepts and guide you step-by-step.
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 ${
                userMode === 'collaborative' ? 'border-blue-500 bg-blue-50' : ''
              }`}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="collaborative"
                  checked={userMode === 'collaborative'}
                  onChange={(e) => setUserMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">🤝 Collaborative Mode</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Perfect if: You've done this before and want AI to draft for you to review. I'll generate complete documents with key decisions explained.
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 ${
                userMode === 'expert' ? 'border-blue-500 bg-blue-50' : ''
              }`}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="expert"
                  checked={userMode === 'expert'}
                  onChange={(e) => setUserMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">⚡ Expert Mode</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Perfect if: You're experienced and want maximum speed. I'll generate detailed technical specs with minimal explanation.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={generateRequirements}
            disabled={!userMode || isProcessing}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition shadow-md"
          >
            {isProcessing ? 'Generating Documents...' : 'Generate Requirements Documents'}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            💡 This will take about 30 seconds. You can refine the documents with AI after generation.
          </p>
        </div>
      </div>
    );
  };

  const renderGenerating = () => {
    console.log('Rendering generating screen');
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="animate-pulse">
          <div className="text-gray-600 mb-2">Generating requirements documents...</div>
          <div className="text-sm text-gray-500">This may take 30-60 seconds</div>
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    console.log('Rendering documents');
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 px-6 py-3">
            <button
              onClick={() => setActiveDocTab('brd')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeDocTab === 'brd'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 BRD
            </button>
            <button
              onClick={() => setActiveDocTab('fsd')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeDocTab === 'fsd'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ⚙️ FSD
            </button>
            <button
              onClick={() => setActiveDocTab('techSpec')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeDocTab === 'techSpec'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🔧 Tech Spec
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <textarea
              value={generatedDocs[activeDocTab]}
              onChange={(e) => {
                setGeneratedDocs({
                  ...generatedDocs,
                  [activeDocTab]: e.target.value
                });
              }}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm text-gray-800 focus:outline-none focus:border-purple-400 resize-none"
              placeholder="Document content..."
            />
            <p className="text-xs text-gray-500 mt-2">
              ✏️ Edit directly in the text area above, or use AI to make larger changes below
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-800 mb-2">Refine with AI</h4>
            <p className="text-sm text-gray-600 mb-4">
              Ask AI to make bigger changes, add sections, or restructure the document
            </p>
            
            {docChatMessages.length > 0 && (
              <div className="mb-4 space-y-2 max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3">
                {docChatMessages.map((msg, idx) => (
                  <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-gray-700' : 'text-purple-600'}`}>
                    <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={docUserInput}
                onChange={(e) => setDocUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && refineDocument()}
                placeholder="e.g. Add a risk analysis section or Expand the technical approach"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400"
                disabled={isProcessing}
              />
              <button
                onClick={refineDocument}
                disabled={isProcessing || !docUserInput.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
              >
                {isProcessing ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleExportDocument}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
            >
              Export Document
            </button>
            <button
              onClick={handleExportAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Export All Docs
            </button>
            <button
              onClick={handleApproveForDev}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition ml-auto"
            >
              Approve and Send to Dev Team
            </button>
          </div>
        </div>
      </div>
    );
  };

  console.log('Main render - isGenerating:', isGenerating, 'generatedDocs:', generatedDocs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <Bot className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Request Assistant</h1>
          <p className="text-gray-600">Tell me what you need, and I'll help you get things done</p>
        </div>

        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={() => {
              setActiveTab('submit');
              setSelectedRequest(null);
            }}
            className={`px-6 py-2.5 rounded-xl font-medium transition shadow-sm ${
              activeTab === 'submit'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            New Request
          </button>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedRequest(null);
            }}
            className={`px-6 py-2.5 rounded-xl font-medium transition shadow-sm ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dashboard ({requests.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('kanban');
              setSelectedRequest(null);
            }}
            className={`px-6 py-2.5 rounded-xl font-medium transition shadow-sm ${
              activeTab === 'kanban'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Kanban Board
          </button>
          
          <div className="ml-auto flex items-center gap-2 bg-white rounded-xl px-1 py-1 shadow-sm">
            <button
              onClick={() => setView('requester')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'requester'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Requester View
            </button>
            <button
              onClick={() => setView('dev')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'dev'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Dev View
            </button>
          </div>
        </div>

        {activeTab === 'submit' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="text-white" size={24} />
                  <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
                </div>
                {chatMessages.length > 0 && (
                  <button
                    onClick={resetChat}
                    className="text-white/80 hover:text-white text-sm transition"
                  >
                    Start Over
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-6 mb-4 min-h-[450px] max-h-[450px] overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center mt-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
                      <Bot className="text-purple-600" size={40} />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                      Hi! I'm here to help
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Just describe what you need in plain English. I'll ask you a few questions to make sure we get it right.
                    </p>

                    {!showExamples ? (
                      <button
                        onClick={() => setShowExamples(true)}
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition"
                      >
                        <Lightbulb size={18} />
                        Show me some examples
                      </button>
                    ) : (
                      <div className="mt-6 text-left max-w-lg mx-auto">
                        <p className="text-sm font-medium text-gray-700 mb-3">Try one of these:</p>
                        <div className="space-y-2">
                          {exampleRequests.map((example, idx) => (
                            <button
                              key={idx}
                              onClick={() => startConversation(example)}
                              className="w-full text-left px-4 py-3 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg transition text-sm text-gray-700 hover:text-purple-700"
                            >
                              "{example}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`mb-6 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-start gap-3 max-w-[85%]">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Bot className="text-white" size={16} />
                            </div>
                            <div className="flex-1 bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        )}
                        {msg.role === 'user' && (
                          <div className="inline-block max-w-[85%] bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                            {msg.content}
                          </div>
                        )}
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="text-left mb-6">
                        <div className="flex items-start gap-3 max-w-[85%]">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <Bot className="text-white" size={16} />
                          </div>
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                              <span className="text-sm">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {chatMessages.length === 0 ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isProcessing && startConversation()}
                    placeholder="Describe what you need... (e.g. I need a report on sales by region)"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition text-left"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={() => startConversation()}
                    disabled={isProcessing || !userInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition shadow-md flex items-center gap-2"
                  >
                    <Send size={18} />
                    Start
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentOptions.length > 0 && !showOtherInput && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600 mb-2">Select an option:</p>
                      {currentOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(option)}
                          disabled={isProcessing}
                          className="w-full text-left px-4 py-3 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg transition text-gray-700 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {option}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowOtherInput(true)}
                        disabled={isProcessing}
                        className="w-full text-left px-4 py-3 bg-white hover:bg-purple-50 border-2 border-dashed border-gray-300 hover:border-purple-300 rounded-lg transition text-gray-500 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Other (type your own answer)
                      </button>
                    </div>
                  )}

                  {(showOtherInput || currentOptions.length === 0) && (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isProcessing && continueConversation()}
                        placeholder="Type your answer..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition"
                        disabled={isProcessing}
                        autoFocus
                      />
                      <button
                        onClick={() => continueConversation()}
                        disabled={isProcessing || !userInput.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition shadow-md flex items-center gap-2"
                      >
                        <ArrowRight size={18} />
                        Send
                      </button>
                    </div>
                  )}

                  {Object.keys(requestData).length > 0 && (
                    <button
                      onClick={submitRequest}
                      disabled={isProcessing}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-medium transition shadow-md"
                    >
                      {isProcessing ? 'Submitting...' : '✓ Submit Request'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Active</p>
                    <p className="text-3xl font-bold text-gray-800">{requests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {requests.filter(r => r.status === 'In Progress').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Avg Clarity</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {(requests.reduce((sum, r) => sum + r.clarityScore, 0) / requests.length).toFixed(1)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">AI Routed</p>
                    <p className="text-3xl font-bold text-gray-800">100%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Open</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                      <tr 
                        key={req.id} 
                        className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => viewRequestDetail(req)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{req.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{req.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            req.stage === 'Development' ? 'bg-blue-100 text-blue-700' :
                            req.stage === 'Clarification' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {req.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            {req.owner === 'AI Agent' ? 
                              <Bot size={16} className="text-purple-500" /> : 
                              <Users size={16} className="text-gray-400" />
                            }
                            {req.owner}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            req.priority === 'High' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{req.daysOpen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Workflow Board</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">1 needs attention</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {['Scoping', 'Ready for Dev', 'In Progress', 'Review', 'Completed'].map(stage => (
                <div key={stage} className="bg-gray-50 rounded-xl p-4 min-h-[500px]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-700">{stage}</h4>
                    <span className="text-sm text-gray-500">
                      {requests.filter(r => r.stage === stage).length}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {requests
                      .filter(r => r.stage === stage)
                      .map(req => (
                        <div
                          key={req.id}
                          onClick={() => viewRequestDetail(req)}
                          className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition cursor-pointer"
                        >
                          {req.aiAlert && (
                            <div className="flex items-center gap-1 mb-2 text-xs text-red-600">
                              <AlertCircle size={12} />
                              <span>AI Alert</span>
                            </div>
                          )}
                          <div className="font-medium text-sm text-gray-800 mb-2">{req.id}</div>
                          <div className="text-sm text-gray-600 mb-3 line-clamp-2">{req.title}</div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              req.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {req.priority}
                            </span>
                            <span className="text-gray-500">{req.lastUpdate}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'detail' && selectedRequest && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">{selectedRequest.id}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(selectedRequest.stage)}`}>
                      {selectedRequest.stage}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRequest.priority === 'High' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedRequest.priority}
                    </span>
                  </div>
                  <h3 className="text-xl text-gray-700 mb-2">{selectedRequest.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Owner: {selectedRequest.owner}</span>
                    <span>•</span>
                    <span>Opened {selectedRequest.daysOpen} days ago</span>
                    <span>•</span>
                    <span>Last update: {selectedRequest.lastUpdate}</span>
                  </div>
                  
                  {selectedRequest.aiAlert && (
                    <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-800">AI Alert</div>
                        <div className="text-sm text-red-700">{selectedRequest.aiAlert}</div>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => {
                              alert('In production, AI would send: "Hi Jennifer, REQ-003 hasn\'t been updated in 3 days. Do you need help or should we reprioritize?"');
                            }}
                            className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Send Reminder
                          </button>
                          <button
                            onClick={() => {
                              setRequests(requests.map(r => 
                                r.id === selectedRequest.id ? {...r, aiAlert: null} : r
                              ));
                            }}
                            className="text-xs px-3 py-1 bg-white text-red-700 border border-red-300 rounded hover:bg-red-50"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={closeRequestDetail}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {view === 'dev' && selectedRequest.stage === 'Ready for Dev' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-2">This request is ready for you to start</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        updateRequestStage(selectedRequest.id, 'In Progress', 'Dev accepted and started work');
                        alert('You accepted the request. Status changed to "In Progress"');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Accept & Start Work
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Why are you rejecting this request?');
                        if (reason) {
                          updateRequestStage(selectedRequest.id, 'Scoping', `Dev rejected: ${reason}`);
                          alert('Request sent back to Product Owner for clarification');
                        }
                      }}
                      className="px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50"
                    >
                      Reject / Need Clarification
                    </button>
                  </div>
                </div>
              )}

              {view === 'dev' && selectedRequest.stage === 'In Progress' && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="font-medium text-purple-900 mb-3">Update Progress</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const update = prompt('Status update (e.g., "70% complete - testing phase")');
                        if (update) {
                          updateRequestStage(selectedRequest.id, 'In Progress', update);
                        }
                      }}
                      className="px-4 py-2 bg-white text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50"
                    >
                      Add Status Update
                    </button>
                    <button
                      onClick={() => {
                        updateRequestStage(selectedRequest.id, 'Review', 'Dev completed work - ready for review');
                        alert('Request moved to Review stage. Product Owner will be notified.');
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Mark Complete → Send for Review
                    </button>
                  </div>
                </div>
              )}

              {view === 'requester' && selectedRequest.stage === 'Review' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-900 mb-3">Ready for your review</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        updateRequestStage(selectedRequest.id, 'Completed', 'Review approved - request completed');
                        alert('Request marked as complete! 🎉');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve & Close
                    </button>
                    <button
                      onClick={() => {
                        const feedback = prompt('What needs to be changed?');
                        if (feedback) {
                          updateRequestStage(selectedRequest.id, 'In Progress', `Feedback from review: ${feedback}`);
                          alert('Feedback sent to dev. Status changed back to "In Progress"');
                        }
                      }}
                      className="px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50"
                    >
                      Request Changes
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Activity Timeline</h4>
                <div className="space-y-3">
                  {(selectedRequest.activity || []).map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">{item.action}</div>
                        <div className="text-xs text-gray-500">{item.user} • {item.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedRequest.stage === 'Scoping' && view === 'requester' && (
              isGenerating ? renderGenerating() : generatedDocs ? renderDocuments() : renderModeSelector()
            )}
            
            {selectedRequest.stage !== 'Scoping' && generatedDocs && renderDocuments()}
          </div>
        )}
      </div>
    </div>
  );
}