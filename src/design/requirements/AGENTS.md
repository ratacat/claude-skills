These files describe requirements for different types, game objects and pieces of code. This is the primary source of truth for how this game should work. These documents will need to be reviewed and updated as you develop the game. Don't update or change them without my direction permission, or unless ask you to. But if you notice that there is an implied change or a discrepancy in how we are talking about something propose a change.

Each file should be all lowercase, and prefer brief single word names.

Requirements should have the following sections, in this order. Always include a **Terminology and Definitions** section near the top to lock vocabulary before listing requirements.
- Goal (optional, concise)
- Terminology and Definitions
- Requirements (number them)
- Scope
- Not in Scope (list out specific edges to delineate the design space)
- Specific Types
- Related Systems or Coded
- Future Work (specifically don't code for this at the moment, but keep an eye on working towards it)
- Execution Flow (use D2 diagrams)

Language - This is the primary design specification for components, be very cautious and precise with your language. We want to avoid fluff, keep it exact. This is a technical document. Do not use any relative language around the current state of anything. We must be concrete.


### D2 Diagrams
D2 is a declarative diagram language where you describe shapes and connections as text. Shapes are created by writing a key name (e.g., server, my_db). Set a display label with a colon: db: PostgreSQL. Change shape type with .shape: — valid types are rectangle (default), square, page, parallelogram, document, cylinder, queue, package, step, callout, stored_data, person, diamond, oval, circle, hexagon, cloud, text, code, class, sql_table, image. Example: database.shape: cylinder. Connections use arrows between shape keys: -> (forward), <- (backward), <-> (bidirectional), -- (line, no arrow). Label connections with a colon: client -> server: HTTP request. Chain connections: a -> b -> c. Repeated connections create multiple edges, not overrides. Containers nest shapes using curly braces: cloud: { api; db } or dot notation: cloud.api. Reference children in connections: user -> cloud.api. Styling uses dot properties: shape.style.fill: "#ff0000", shape.style.stroke: blue, shape.style.stroke-dash: 3 (dashed), shape.style.multiple: true (stacked copies). Layout direction is set globally: direction: right or direction: down. Comments use #. Semicolons allow multiple declarations per line: a; b; c. Keys are case-insensitive. Always reference shapes by key, not label.