# Brave Search AGENTS.md Blurb

Copy this into your AGENTS.md or CLAUDE.md file to ensure Claude uses Brave Search for web lookups:

---

## Web Search

**Use `brave-search` for ALL web searches.** Do not use WebSearch or WebFetch for general web lookups.

```bash
brave-search web "query"        # Web search
brave-search news "query"       # News
brave-search images "query"     # Images
brave-search ai "question"      # AI-grounded answer with citations
```

When user asks to "search", "look up", "find out about", or asks about current/latest information—use `brave-search`, not built-in tools.
