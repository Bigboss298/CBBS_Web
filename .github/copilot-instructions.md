🌐 FRONTEND (REACT + TYPESCRIPT + ZUSTAND)
________________________________________
🎨 UI/UX DESIGN GUIDELINES
Copilot MUST follow these design rules:
•	Modern, clean, professional UI
•	Minimalistic layout (no clutter)
•	Color theme:
o	Primary: Blue
o	Secondary: Light Blue
o	Background: White
•	Use soft shadows, rounded corners (rounded-xl / rounded-2xl)
•	Consistent spacing (padding ≥ p-4)
•	Responsive design
•	Clear hierarchy (titles, sections, cards)
________________________________________
🚨 FRONTEND STRICT RULES
Copilot MUST:
•	NEVER call APIs inside pages
•	ALL API calls must be inside Zustand stores
•	Pages ONLY:
o	read state
o	call store actions
Copilot MUST NOT:
•	Use useEffect for API calls in pages
•	Mix API logic into components
•	Bypass Zustand
________________________________________
🧾 FRONTEND MASTER PROMPT
You are helping me build a modern React + TypeScript app using Zustand and TailwindCSS.

Design Requirements:
- Clean, professional UI
- Blue and white theme
- Responsive
- Card-based layout

Architecture Rules:
- NO API calls in pages
- ALL API calls inside Zustand stores

Generate UI and state logic accordingly.
________________________________________
🧠 FRONTEND ARCHITECTURE
/store
  authStore.ts
  documentStore.ts

/pages
  Login.tsx
  Dashboard.tsx
  Upload.tsx

/components
  DocumentList.tsx
  FileUpload.tsx
  DashboardLayout.tsx
________________________________________
🧑‍💻 DASHBOARD DESIGN PER ROLE
________________________________________
🎓 STUDENT DASHBOARD
Features:
•	Upload document
•	View own documents
•	Download documents
UI Layout:
•	Top: Header (User name + logout)
•	Main:
o	Upload button (primary blue button)
o	Document list (card grid or table)
Display:
•	Group documents by DocumentType
Example Structure:
•	Admission Letters
•	BioData
•	Results
Each group:
•	Card section with files inside
________________________________________
🧑‍🏫 LEVEL ADVISER (LA) DASHBOARD
Access:
•	All students in assigned level
UI Layout:
•	Filter: Level (pre-selected based on AssignedLevelId)
•	Main content grouped by DocumentType
Structure:
•	Document Type → List of student documents
Example:
•	Admission Letters
o	Student A
o	Student B
•	Results
o	Student C
Each item:
•	Student name
•	Matric number
•	Download button
________________________________________
🧑‍💼 HOD DASHBOARD
Access:
•	All students in department
UI Layout:
•	Group by Level → then DocumentType
Structure:
•	Level (100, 200, etc)
o	Document Type
	Student Documents
Example:
•	100 Level
o	Admission Letters
o	Results
•	200 Level
o	BioData
________________________________________
🏛️ DEAN / FACULTY OFFICER DASHBOARD
Access:
•	Entire faculty
UI Layout:
•	Multi-level grouping:
Structure:
•	Department
o	Level
	Document Type
	Documents
Example:
•	Computer Science
o	100 Level
	Admission Letters
o	200 Level
	Results
________________________________________
🧩 COMPONENT GUIDELINES
Copilot MUST:
•	Create reusable components:
o	DocumentCard
o	SectionGroup
o	FileUpload
•	Use props for data
•	Keep components presentational (no API logic)
________________________________________
🛑 FRONTEND ANTI-HALLUCINATION RULES
Copilot MUST:
•	Use Axios ONLY
•	Use centralized Axios instance
•	Attach JWT via interceptor
•	Not invent hooks or APIs
•	Not assume backend response shape
If unsure:
Ask for API response structure
________________________________________
⚡ FINAL INSTRUCTION
If Copilot deviates from rules, immediately correct it using:
•	"Follow architecture strictly"
•	"Do not call API in page"
•	"Use Zustand store"
________________________________________
🚀 GOAL
Build a clean, scalable, role-based dashboard system with:
•	Clear UI hierarchy
•	Strict state management
•	Professional design
________________________________________
This guide MUST be followed strictly. No shortcuts.
If Copilot deviates from rules, immediately correct it using:
•	"Follow architecture strictly"
•	"Move logic to service layer"
•	"Do not call API in page"
________________________________________
🚀 GOAL
Produce clean, maintainable, production-ready code that strictly follows:
•	Backend layering
•	Frontend state management discipline
•	Security best practices
________________________________________
This guide MUST be followed strictly. No shortcuts.

