-- Research Knowledge Graph Schema
-- SQLite schema for storing research sessions, findings, and graph relationships

-- Research sessions
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    topic TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    depth_remaining INTEGER DEFAULT 2,
    branches INTEGER DEFAULT 5,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused'))
);

-- Findings (nodes in the knowledge graph)
CREATE TABLE IF NOT EXISTS findings (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    source_url TEXT,
    relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 10),
    finding_type TEXT NOT NULL CHECK (finding_type IN ('fact', 'lead', 'question', 'theme', 'contradiction')),
    branch_name TEXT NOT NULL,
    depth_level INTEGER DEFAULT 0,
    explored BOOLEAN DEFAULT FALSE,  -- For leads: has this been followed?
    merged_into INTEGER REFERENCES findings(id),  -- If merged, points to surviving finding
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationships between findings (edges in the knowledge graph)
CREATE TABLE IF NOT EXISTS relationships (
    id INTEGER PRIMARY KEY,
    from_finding_id INTEGER NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    to_finding_id INTEGER NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('supports', 'contradicts', 'elaborates', 'related_to')),
    confidence REAL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1.0),  -- How certain is this relationship?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_finding_id, to_finding_id, relationship_type)  -- Prevent duplicate edges
);

-- Merge history (audit trail for graph operations)
CREATE TABLE IF NOT EXISTS merge_log (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    surviving_finding_id INTEGER NOT NULL REFERENCES findings(id),
    merged_finding_id INTEGER NOT NULL,  -- Not FK because the finding is deleted
    merged_content TEXT NOT NULL,  -- Preserve what was merged
    merged_source_url TEXT,
    reason TEXT,  -- Why were these merged?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Explored URLs (avoid re-fetching)
CREATE TABLE IF NOT EXISTS explored_urls (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fetched', 'failed', 'skipped')),
    fetch_error TEXT,  -- Store error message if failed
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, url)
);

-- Search queries executed (track what we've searched)
CREATE TABLE IF NOT EXISTS search_queries (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    branch_name TEXT,
    depth_level INTEGER DEFAULT 0,
    result_count INTEGER,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entities (for cross-session knowledge graph)
CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'company', 'concept', 'technology', 'place', 'event', 'treatment', 'mechanism')),
    canonical_name TEXT,  -- Normalized name for deduplication
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, entity_type)
);

-- Link findings to entities (many-to-many)
CREATE TABLE IF NOT EXISTS finding_entities (
    finding_id INTEGER NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    mention_type TEXT DEFAULT 'mention' CHECK (mention_type IN ('mention', 'primary_subject', 'evidence_for', 'evidence_against')),
    PRIMARY KEY (finding_id, entity_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_findings_session ON findings(session_id);
CREATE INDEX IF NOT EXISTS idx_findings_relevance ON findings(session_id, relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_findings_type ON findings(session_id, finding_type);
CREATE INDEX IF NOT EXISTS idx_findings_branch ON findings(session_id, branch_name);
CREATE INDEX IF NOT EXISTS idx_findings_unexplored_leads ON findings(session_id, finding_type, explored)
    WHERE finding_type = 'lead' AND explored = FALSE;
CREATE INDEX IF NOT EXISTS idx_explored_urls_session ON explored_urls(session_id);
CREATE INDEX IF NOT EXISTS idx_explored_urls_status ON explored_urls(session_id, status);
CREATE INDEX IF NOT EXISTS idx_search_queries_session ON search_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_topic ON sessions(topic);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_relationships_from ON relationships(from_finding_id);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON relationships(to_finding_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Session summary with counts
CREATE VIEW IF NOT EXISTS v_session_summary AS
SELECT
    s.id,
    s.topic,
    s.status,
    s.depth_remaining,
    s.branches,
    s.created_at,
    s.updated_at,
    COUNT(DISTINCT f.id) as finding_count,
    COUNT(DISTINCT CASE WHEN f.relevance_score >= 7 THEN f.id END) as high_relevance_count,
    COUNT(DISTINCT CASE WHEN f.finding_type = 'fact' THEN f.id END) as fact_count,
    COUNT(DISTINCT CASE WHEN f.finding_type = 'lead' THEN f.id END) as lead_count,
    COUNT(DISTINCT CASE WHEN f.finding_type = 'lead' AND f.explored = FALSE THEN f.id END) as unexplored_lead_count,
    COUNT(DISTINCT CASE WHEN f.finding_type = 'question' THEN f.id END) as question_count,
    COUNT(DISTINCT CASE WHEN f.finding_type = 'contradiction' THEN f.id END) as contradiction_count,
    COUNT(DISTINCT eu.url) as urls_explored,
    COUNT(DISTINCT sq.query) as queries_executed
FROM sessions s
LEFT JOIN findings f ON f.session_id = s.id AND f.merged_into IS NULL
LEFT JOIN explored_urls eu ON eu.session_id = s.id
LEFT JOIN search_queries sq ON sq.session_id = s.id
GROUP BY s.id;

-- High relevance findings (score >= 7)
CREATE VIEW IF NOT EXISTS v_high_relevance_findings AS
SELECT
    f.*,
    s.topic as session_topic
FROM findings f
JOIN sessions s ON s.id = f.session_id
WHERE f.relevance_score >= 7 AND f.merged_into IS NULL
ORDER BY f.relevance_score DESC;

-- Unexplored leads ready to be followed
CREATE VIEW IF NOT EXISTS v_unexplored_leads AS
SELECT
    f.id,
    f.session_id,
    f.content,
    f.branch_name,
    f.relevance_score,
    f.depth_level,
    s.topic,
    s.depth_remaining
FROM findings f
JOIN sessions s ON s.id = f.session_id
WHERE f.finding_type = 'lead'
  AND f.explored = FALSE
  AND f.merged_into IS NULL
  AND f.relevance_score >= 7
  AND s.depth_remaining > 0
ORDER BY f.relevance_score DESC;

-- Findings with their relationship counts (for identifying theme centers)
CREATE VIEW IF NOT EXISTS v_finding_connectivity AS
SELECT
    f.id,
    f.session_id,
    f.content,
    f.branch_name,
    f.finding_type,
    f.relevance_score,
    COUNT(DISTINCT r_out.id) as outgoing_relationships,
    COUNT(DISTINCT r_in.id) as incoming_relationships,
    COUNT(DISTINCT r_out.id) + COUNT(DISTINCT r_in.id) as total_connections,
    COUNT(DISTINCT CASE WHEN r_in.relationship_type = 'supports' THEN r_in.id END) as support_count,
    COUNT(DISTINCT CASE WHEN r_out.relationship_type = 'contradicts' OR r_in.relationship_type = 'contradicts' THEN COALESCE(r_out.id, r_in.id) END) as contradiction_count
FROM findings f
LEFT JOIN relationships r_out ON f.id = r_out.from_finding_id
LEFT JOIN relationships r_in ON f.id = r_in.to_finding_id
WHERE f.merged_into IS NULL
GROUP BY f.id;

-- Isolated findings (no relationships - candidates for connection)
CREATE VIEW IF NOT EXISTS v_isolated_findings AS
SELECT f.*
FROM findings f
WHERE f.merged_into IS NULL
  AND f.finding_type IN ('fact', 'theme')
  AND f.id NOT IN (SELECT from_finding_id FROM relationships)
  AND f.id NOT IN (SELECT to_finding_id FROM relationships);

-- Weakly supported claims (high relevance but few supporting relationships)
CREATE VIEW IF NOT EXISTS v_weakly_supported AS
SELECT
    f.id,
    f.session_id,
    f.content,
    f.source_url,
    f.relevance_score,
    f.branch_name,
    COUNT(r.id) as support_count
FROM findings f
LEFT JOIN relationships r ON r.to_finding_id = f.id AND r.relationship_type = 'supports'
WHERE f.relevance_score >= 8
  AND f.finding_type = 'fact'
  AND f.merged_into IS NULL
GROUP BY f.id
HAVING support_count < 2;

-- Entity usage across sessions
CREATE VIEW IF NOT EXISTS v_entity_usage AS
SELECT
    e.id,
    e.name,
    e.entity_type,
    COUNT(DISTINCT fe.finding_id) as finding_count,
    COUNT(DISTINCT f.session_id) as session_count,
    GROUP_CONCAT(DISTINCT s.topic) as topics
FROM entities e
JOIN finding_entities fe ON e.id = fe.entity_id
JOIN findings f ON fe.finding_id = f.id
JOIN sessions s ON f.session_id = s.id
GROUP BY e.id
ORDER BY finding_count DESC;

-- Contradiction pairs with context
CREATE VIEW IF NOT EXISTS v_contradictions AS
SELECT
    r.id as relationship_id,
    f1.id as finding1_id,
    f1.content as finding1_content,
    f1.source_url as finding1_source,
    f2.id as finding2_id,
    f2.content as finding2_content,
    f2.source_url as finding2_source,
    f1.session_id,
    f1.branch_name
FROM relationships r
JOIN findings f1 ON r.from_finding_id = f1.id
JOIN findings f2 ON r.to_finding_id = f2.id
WHERE r.relationship_type = 'contradicts';

-- ============================================================================
-- HELPER QUERIES (not views, but useful patterns documented here)
-- ============================================================================

-- Find similar findings for potential merge (run in application):
-- SELECT f1.id, f2.id, f1.content, f2.content
-- FROM findings f1
-- JOIN findings f2 ON f1.session_id = f2.session_id
--   AND f1.branch_name = f2.branch_name
--   AND f1.finding_type = f2.finding_type
--   AND f1.id < f2.id
-- WHERE f1.session_id = ? AND f1.merged_into IS NULL AND f2.merged_into IS NULL;

-- Get full graph for a session (findings + relationships):
-- SELECT
--   f.id, f.content, f.finding_type, f.relevance_score,
--   r.relationship_type, r.to_finding_id
-- FROM findings f
-- LEFT JOIN relationships r ON f.id = r.from_finding_id
-- WHERE f.session_id = ? AND f.merged_into IS NULL
-- ORDER BY f.id;

-- Traverse from a finding to all connected findings:
-- WITH RECURSIVE connected AS (
--   SELECT id, content, 0 as depth FROM findings WHERE id = ?
--   UNION ALL
--   SELECT f.id, f.content, c.depth + 1
--   FROM findings f
--   JOIN relationships r ON (r.from_finding_id = f.id OR r.to_finding_id = f.id)
--   JOIN connected c ON (r.from_finding_id = c.id OR r.to_finding_id = c.id)
--   WHERE f.id != c.id AND c.depth < 3
-- )
-- SELECT DISTINCT * FROM connected;
