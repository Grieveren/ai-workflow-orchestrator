import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

const app = express();
const PORT = 3001;

// Initialize SQLite database
const dbPath = process.env.NODE_ENV === 'test' ? './workflow.test.db' : './workflow.db';
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
initializeDatabase();

// Restrict CORS to frontend origin only
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        ...req.body
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Streaming endpoint for document generation
app.post('/api/chat/stream', async (req, res) => {
  try {
    // Set up Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        stream: true,  // Enable streaming
        ...req.body
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      res.write(`data: ${JSON.stringify({ error: true, message: errorData })}\n\n`);
      res.end();
      return;
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream completed successfully');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            // Forward the SSE event to the client
            try {
              res.write(`data: ${data}\n\n`);
            } catch (writeError) {
              console.error('Error writing to response:', writeError.message);
              break;
            }

            // Check for stream end
            if (data === '[DONE]') {
              res.end();
              return;
            }
          }
        }
      }
    } catch (readError) {
      console.error('Error reading stream:', readError.message);
      // Don't throw - try to end gracefully
    }

    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    try {
      res.write(`data: ${JSON.stringify({ error: true, message: error.message })}\n\n`);
    } catch {
      // Response already closed
    }
    res.end();
  }
});

// ===== DATABASE SCHEMA =====

function initializeDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      owner TEXT NOT NULL,
      submitted_by TEXT NOT NULL,
      priority TEXT NOT NULL,
      clarity_score INTEGER,
      days_open INTEGER NOT NULL,
      stage TEXT NOT NULL,
      last_update TEXT NOT NULL,
      complexity TEXT,
      timeline TEXT,
      ai_alert TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS impact_assessments (
      request_id TEXT PRIMARY KEY,
      total_score INTEGER NOT NULL,
      revenue_impact INTEGER NOT NULL,
      user_reach INTEGER NOT NULL,
      strategic_alignment INTEGER NOT NULL,
      urgency INTEGER NOT NULL,
      quick_win_bonus INTEGER NOT NULL,
      tier INTEGER NOT NULL,
      assessed_at TEXT NOT NULL,
      assessed_by TEXT NOT NULL,
      justification TEXT NOT NULL,
      dependencies TEXT,
      risks TEXT,
      customer_commitment INTEGER DEFAULT 0,
      competitive_intel TEXT,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      approved INTEGER DEFAULT 0,
      approved_by TEXT,
      approved_at TEXT,
      generated_at TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      action TEXT NOT NULL,
      user TEXT NOT NULL,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_owner ON requests(owner);
    CREATE INDEX IF NOT EXISTS idx_requests_stage ON requests(stage);
    CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
    CREATE INDEX IF NOT EXISTS idx_documents_request ON documents(request_id);
    CREATE INDEX IF NOT EXISTS idx_activities_request ON activities(request_id);
  `);

  // Seed initial data if database is empty
  seedDatabase();
}

function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) as count FROM requests').get();

  if (count.count === 0) {
    console.log('Seeding database with initial mock data...');

    const insertRequest = db.prepare(`
      INSERT INTO requests (
        id, title, status, owner, submitted_by, priority, clarity_score,
        days_open, stage, last_update, complexity, timeline, ai_alert, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertActivity = db.prepare(`
      INSERT INTO activities (request_id, timestamp, action, user)
      VALUES (?, ?, ?, ?)
    `);

    const seedData = db.transaction(() => {
      // Request 1
      insertRequest.run(
        'REQ-001', 'Lead conversion report by region', 'In Progress', 'Sarah Chen',
        'Jessica Martinez', 'High', 9, 3, 'In Progress', '2 hours ago', 'medium',
        null, null, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      );
      insertActivity.run('REQ-001', '3 days ago', 'Request submitted', 'Jessica Martinez');
      insertActivity.run('REQ-001', '3 days ago', 'Auto-routed to Sarah Chen', 'AI Agent');
      insertActivity.run('REQ-001', '2 days ago', 'Requirements generated', 'Sarah Chen');
      insertActivity.run('REQ-001', '2 days ago', 'Approved and sent to dev', 'Sarah Chen');
      insertActivity.run('REQ-001', '2 hours ago', 'Status updated: 60% complete', 'Sarah Chen');

      // Request 2
      insertRequest.run(
        'REQ-002', 'Salesforce automation for renewals', 'Ready for Dev', 'Mike Torres',
        'Tom Wilson', 'Medium', 6, 1, 'Ready for Dev', '1 day ago', 'simple',
        null, null, new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      );
      insertActivity.run('REQ-002', '1 day ago', 'Request submitted', 'Tom Wilson');
      insertActivity.run('REQ-002', '1 day ago', 'Auto-routed to Mike Torres', 'AI Agent');
      insertActivity.run('REQ-002', '1 day ago', 'Requirements generated', 'Mike Torres');

      // Request 3
      insertRequest.run(
        'REQ-003', 'Customer health score dashboard', 'Scoping', 'Alex Rivera',
        'Mark Stevens', 'High', 8, 5, 'Scoping', '3 days ago', 'complex',
        null, 'No activity for 3 days - may be stalled', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      );
      insertActivity.run('REQ-003', '5 days ago', 'Request submitted', 'Mark Stevens');
      insertActivity.run('REQ-003', '5 days ago', 'Assigned to Alex Rivera (Product Owner) for review', 'AI Agent');
      insertActivity.run('REQ-003', '3 days ago', 'AI reminder sent: No activity for 48 hours', 'AI Agent');
    });

    seedData();
    console.log('Database seeded successfully');
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Transform impact assessment database row to application format
 */
function transformImpactAssessment(row) {
  if (row.total_score === null) return undefined;

  return {
    totalScore: row.total_score,
    breakdown: {
      revenueImpact: row.revenue_impact,
      userReach: row.user_reach,
      strategicAlignment: row.strategic_alignment,
      urgency: row.urgency,
      quickWinBonus: row.quick_win_bonus,
    },
    tier: row.tier,
    assessedAt: row.assessed_at,
    assessedBy: row.assessed_by,
    justification: row.justification,
    dependencies: row.dependencies ? row.dependencies.split('\n') : undefined,
    risks: row.risks ? row.risks.split('\n') : undefined,
    customerCommitment: row.customer_commitment === 1,
    competitiveIntel: row.competitive_intel || undefined,
  };
}

/**
 * Transform request database row to application format
 */
function transformRequest(row, activities, impactAssessment) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    owner: row.owner,
    submittedBy: row.submitted_by,
    priority: row.priority,
    clarityScore: row.clarity_score,
    daysOpen: row.days_open,
    stage: row.stage,
    lastUpdate: row.last_update,
    complexity: row.complexity,
    timeline: row.timeline,
    aiAlert: row.ai_alert,
    createdAt: row.created_at,
    activity: activities || [],
    impactAssessment,
  };
}

/**
 * Insert activities for a request
 */
function insertActivities(db, requestId, activities) {
  if (!activities || activities.length === 0) return;

  const stmt = db.prepare(`
    INSERT INTO activities (request_id, timestamp, action, user)
    VALUES (?, ?, ?, ?)
  `);

  for (const act of activities) {
    stmt.run(requestId, act.timestamp, act.action, act.user);
  }
}

// ===== REST API ENDPOINTS =====

// Get all requests
app.get('/api/requests', (req, res) => {
  try {
    // Fetch all requests with impact assessments
    const requests = db.prepare(`
      SELECT r.*,
             ia.total_score, ia.tier, ia.revenue_impact, ia.user_reach,
             ia.strategic_alignment, ia.urgency, ia.quick_win_bonus,
             ia.assessed_at, ia.assessed_by, ia.justification,
             ia.dependencies, ia.risks, ia.customer_commitment, ia.competitive_intel
      FROM requests r
      LEFT JOIN impact_assessments ia ON r.id = ia.request_id
      ORDER BY r.created_at DESC
    `).all();

    // Fetch ALL activities at once (fixes N+1 query problem)
    const allActivities = db.prepare(
      'SELECT * FROM activities ORDER BY request_id, id ASC'
    ).all();

    // Group activities by request_id
    const activitiesByRequest = allActivities.reduce((acc, activity) => {
      if (!acc[activity.request_id]) acc[activity.request_id] = [];
      acc[activity.request_id].push(activity);
      return acc;
    }, {});

    // Transform to application format
    const result = requests.map(row => {
      const activities = activitiesByRequest[row.id] || [];
      const impactAssessment = transformImpactAssessment(row);
      return transformRequest(row, activities, impactAssessment);
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single request by ID
app.get('/api/requests/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT r.*,
             ia.total_score, ia.tier, ia.revenue_impact, ia.user_reach,
             ia.strategic_alignment, ia.urgency, ia.quick_win_bonus,
             ia.assessed_at, ia.assessed_by, ia.justification,
             ia.dependencies, ia.risks, ia.customer_commitment, ia.competitive_intel
      FROM requests r
      LEFT JOIN impact_assessments ia ON r.id = ia.request_id
      WHERE r.id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const activities = db.prepare(
      'SELECT * FROM activities WHERE request_id = ? ORDER BY id ASC'
    ).all(req.params.id);

    const impactAssessment = transformImpactAssessment(row);
    const result = transformRequest(row, activities, impactAssessment);

    res.json(result);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new request
app.post('/api/requests', (req, res) => {
  try {
    const {
      id, title, status, owner, submittedBy, priority, clarityScore,
      daysOpen, stage, lastUpdate, complexity, timeline, aiAlert, createdAt,
      activity, impactAssessment
    } = req.body;

    const insert = db.transaction(() => {
      // Insert request
      db.prepare(`
        INSERT INTO requests (
          id, title, status, owner, submitted_by, priority, clarity_score,
          days_open, stage, last_update, complexity, timeline, ai_alert, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, title, status, owner, submittedBy, priority, clarityScore,
        daysOpen, stage, lastUpdate, complexity, timeline, aiAlert, createdAt
      );

      // Insert activities using helper
      insertActivities(db, id, activity);

      // Insert impact assessment if provided
      if (impactAssessment) {
        db.prepare(`
          INSERT INTO impact_assessments (
            request_id, total_score, revenue_impact, user_reach,
            strategic_alignment, urgency, quick_win_bonus, tier,
            assessed_at, assessed_by, justification, dependencies,
            risks, customer_commitment, competitive_intel
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          impactAssessment.totalScore,
          impactAssessment.breakdown.revenueImpact,
          impactAssessment.breakdown.userReach,
          impactAssessment.breakdown.strategicAlignment,
          impactAssessment.breakdown.urgency,
          impactAssessment.breakdown.quickWinBonus,
          impactAssessment.tier,
          impactAssessment.assessedAt,
          impactAssessment.assessedBy,
          impactAssessment.justification,
          impactAssessment.dependencies ? impactAssessment.dependencies.join('\n') : null,
          impactAssessment.risks ? impactAssessment.risks.join('\n') : null,
          impactAssessment.customerCommitment ? 1 : 0,
          impactAssessment.competitiveIntel || null
        );
      }
    });

    insert();
    res.status(201).json(req.body);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update request
app.patch('/api/requests/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Wrap all database operations in a transaction for atomicity
    const updateRequest = db.transaction(() => {
      // Build dynamic UPDATE query
      const fields = [];
      const values = [];

      const fieldMap = {
        title: 'title',
        status: 'status',
        owner: 'owner',
        submittedBy: 'submitted_by',
        priority: 'priority',
        clarityScore: 'clarity_score',
        daysOpen: 'days_open',
        stage: 'stage',
        lastUpdate: 'last_update',
        complexity: 'complexity',
        timeline: 'timeline',
        aiAlert: 'ai_alert',
      };

      for (const [key, dbColumn] of Object.entries(fieldMap)) {
        if (updates[key] !== undefined) {
          fields.push(`${dbColumn} = ?`);
          values.push(updates[key]);
        }
      }

      if (fields.length > 0) {
        values.push(id);
        db.prepare(`UPDATE requests SET ${fields.join(', ')} WHERE id = ?`).run(...values);
      }

      // Handle impact assessment update
      if (updates.impactAssessment) {
        const ia = updates.impactAssessment;
        db.prepare(`
          INSERT OR REPLACE INTO impact_assessments (
            request_id, total_score, revenue_impact, user_reach,
            strategic_alignment, urgency, quick_win_bonus, tier,
            assessed_at, assessed_by, justification, dependencies,
            risks, customer_commitment, competitive_intel
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          ia.totalScore,
          ia.breakdown.revenueImpact,
          ia.breakdown.userReach,
          ia.breakdown.strategicAlignment,
          ia.breakdown.urgency,
          ia.breakdown.quickWinBonus,
          ia.tier,
          ia.assessedAt,
          ia.assessedBy,
          ia.justification,
          ia.dependencies ? ia.dependencies.join('\n') : null,
          ia.risks ? ia.risks.join('\n') : null,
          ia.customerCommitment ? 1 : 0,
          ia.competitiveIntel || null
        );
      }

      // Insert activities using helper function
      insertActivities(db, id, updates.activity);
    });

    // Execute transaction
    updateRequest();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete request
app.delete('/api/requests/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM requests WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to reset database (test environment only)
if (process.env.NODE_ENV === 'test') {
  app.post('/api/test/reset', (req, res) => {
    try {
      db.exec('DELETE FROM activities');
      db.exec('DELETE FROM documents');
      db.exec('DELETE FROM impact_assessments');
      db.exec('DELETE FROM requests');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

app.listen(PORT, () => {
  console.log(`API proxy server running on http://localhost:${PORT}`);
  console.log(`Database: ${dbPath}`);
});
