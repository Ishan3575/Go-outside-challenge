# 🌿 WanderWild — Adventures & Exploration Platform

> **Hackathon Theme:** Touch Grass &bull; **Core AI:** Multimodal Vision Model (Google Gemini 3.8 Flash) &bull; **Mapping:** Leaflet & OpenStreetMap

**WanderWild: Adventures & Exploration** is an aesthetic, gamified web platform that encourages people to spend more time outdoors, explore green spaces, care for nature, and perform positive community actions.

By combining real-world exploration, environmental stewardship, community participation, and server-side multimodal AI verification, WanderWild turns outdoor activities into engaging adventure quests where users earn points, climb leaderboards, and create tangible ecological impact.

---

## 🌟 Key Features

### 1. Distinctive Nature-Inspired UX
- Fresh, outdoorsy visual identity using a nature palette: forest green, fresh mint, warm cream, and earthy neutrals.
- Mobile-responsive, touch-friendly cards, tactile badges, and map-centered discovery.
- **Minimal Screen Time Philosophy**: Screen time is strictly the shortest part of the experience (30 seconds to pick a mission, hours in nature, 30 seconds to upload proof).

### 2. Location-Based Exploration & Privacy Safeguards
- Interactive map powered by **Leaflet** and **OpenStreetMap**.
- Discover nearby public parks, community gardens, walking trails, and cleanup spots.
- **Privacy First**: Exact residential coordinates are never logged or publicly exposed. Only approximate regional areas are shown on community leaderboards.
- Works via browser location or manual selection (with demo fallbacks).

### 3. Four Outdoor Challenge Categories
1. **🧹 Clean Up Your Surroundings**:
   - Identify a littered public park verge or trail.
   - Upload a **Before** photograph.
   - Safely clean up (with prominent safety notices: wear gloves, avoid hazardous/sharp waste).
   - Upload an **After** photograph showing the restored, clean ground.
2. **🌱 Plant Something**:
   - Plant a seed, sapling, or pollinator plant in a garden bed or container.
   - Upload photograph showing the planting activity or seedling.
   - Optional follow-up milestone for documenting plant growth.
3. **📸 Explore and Photograph**:
   - Visit a public outdoor reserve or scenic trail.
   - Photograph a prominent landmark, heritage tree, or landscape.
4. **🌲 Nature & Outdoor Activities**:
   - Complete a nature walk and photograph wild flora, ferns, or wildlife.

### 4. Challenge Timing & Server-Side 2× Bonus Points
- Challenges are available at all times, with select missions featuring a limited-time bonus window.
- Completing a featured challenge during its active period awards **2× points** (e.g., 60 pts base &rarr; 120 pts awarded).
- **Server-Side Scoring**: The backend calculates the final score using challenge rules and verified submission timestamps (never trusting client-side calculations).

### 5. Genuine Multimodal AI Photo Verification
- Evaluates submitted photos using **Google Gemini 3.8 Flash** via a secure server-side API route (`/api/verify`).
- API keys reside strictly on the server and are never exposed to the frontend.
- Returns a structured assessment:
  ```json
  {
    "relevant": true,
    "confidence": "High",
    "explanation": "Before photo shows discarded plastic bottles on the grass. After photo shows the same park bench with all litter removed and a tied waste bag.",
    "requiresReview": false,
    "reasonForReview": ""
  }
  ```
- **Evidence-Based & Honest**: Treats AI output as an assessment rather than unquestionable proof. Ambiguous or unavailable results gracefully enter a pending review state.

### 6. Community Leaderboards & Progress
- **Global Leaderboard**: Cross-community rankings.
- **Local Leaderboard**: Regional rankings within approximate zones (e.g., Metro Bay Area).
- **Category Leaderboard**: Highlights top planters, litter cleaners, and nature explorers.
- User badges: *First Step*, *Green Sprout*, *Litter Liberator*, and *Golden Hour Hero*.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ or v24+ recommended)

### 1. Clone & Configure
```bash
git clone https://github.com/Ishan3575/Go-outside-challenge.git
cd Go-outside-challenge
```

Create a `.env` file in the root directory (or use `.env.example`):
```bash
cp .env.example .env
```
Ensure your Gemini API key is configured in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 2. Start the Server
```bash
node server.js
```

### 3. Open in Browser
Navigate to **`http://localhost:3000`** in any web browser.

---

## 🛠️ Architecture

```
                       [ User Opens Touch Grass ]
                                   │
          ┌────────────────────────┴────────────────────────┐
          ▼                                                 ▼
[ Location & Leaflet Map ]                        [ Challenge Selector ]
Selects nearby public park                         Picks Cleanup, Planting,
or enters region manually                          or Nature Walk mission
          │                                                 │
          └────────────────────────┬────────────────────────┘
                                   ▼
                      [ Outdoors: Touch Grass ]
               1 to 2 hours in nature taking action
                                   │
                                   ▼
                  [ Server-Side Verification API ]
                       (POST /api/verify)
                                   │
          ┌────────────────────────┴────────────────────────┐
          ▼                                                 ▼
[ Multimodal Vision Model ]                       [ Server-Side Scoring ]
- Checks visual relevance                         - Validates bonus window
- Evaluates Before/After cleanup                  - Calculates 2x multiplier
- Explains reasoning                              - Prevents duplicate awards
                                   │
                                   ▼
               [ Leaderboards & Real-World Impact ]
```

---

## 🔒 Open Innovation & Privacy Declaration

- **Model Choice**: Google Gemini 3.8 Flash multimodal vision model (`gemini-3.8-flash`).
- **Inference Location**: Processed through server-side authenticated requests with zero client-side credential exposure.
- **Privacy Handling**: No residential coordinates or home addresses are stored or displayed publicly. Approximate regions are used exclusively for community leaderboards.
- **Transparent Evaluation**: Disputed or low-confidence submissions remain in pending review for community steward verification.

---

## 📄 License
MIT License &copy; 2026 Ishan3575
