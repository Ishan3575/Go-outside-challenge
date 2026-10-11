# 🌿 Go-outside-challenge (TerraQuest) — Touch Grass with Open-Weight AI

> **Hecktober Challenge:** *Touch Grass (Week 1)*  
> **Core AI:** Google Gemma (Open-Weight Model)  
> **Targeted Prizes:** Best Use of Gemma ($200), Best Use of SerpApi ($100), Best Use of ElevenLabs ($100), Best Use of Render ($200)

A gamified outdoor exploration and environmental action web application where users receive real-world challenges (cleanup litter, botanical discovery, trail hikes), verify completion via open-weight AI (Gemma/PaliGemma), and climb local neighborhood and global leaderboards.

---

## 🎯 Executive Summary
**TerraQuest** turns the real world into an adventure RPG. Unlike conventional apps that trap users in front of screens, TerraQuest follows the **"Minimal Screen Time" philosophy**:
1. Check the app for **30 seconds** to get your quest.
2. Put your phone in your pocket and listen to the **hands-free voice narration** (powered by ElevenLabs).
3. Spend **1 to 2 hours** outdoors exploring or cleaning up.
4. Upload photos for automated **open-weight AI verification** (Gemma) to earn points and climb the neighborhood leaderboard.

---

## 🏆 How It Wins the "Touch Grass" Theme
- **Screen is the Shortest Step:** Minimal UI time; maximum real-world engagement.
- **2x Golden Hour Multipliers:** Timed countdowns incentivize leaving your desk immediately.
- **Tangible Eco-Impact:** Every quest cleans public spaces or promotes urban greenery.

---

## 💡 "Why Open Innovation Matters" (Pitch Essay)
1. **Neighborhood Privacy:** Photos contain user faces, home surroundings, and precise GPS coordinates. Proprietary cloud APIs harvest or scrape this telemetry. Using open-weight models (**Google Gemma / PaliGemma**) allows inference to run locally or on private community servers with zero external tracking.
2. **Zero Recurring API Costs:** Community volunteer groups, schools, and local non-profits have zero budget for expensive per-token cloud APIs. Open-source AI democratizes automated ecological verification for everyone.
3. **Domain Specialization:** Open-weight models can be prompted or fine-tuned specifically for local ecological tasks (identifying invasive weeds, quantifying trash removal) without vendor lock-in.

---

## 🛠️ Architecture & Sponsor Integrations

```
                       [ User Opens TerraQuest ]
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
[ 1. Location & SerpApi ]                     [ 2. ElevenLabs Voice ]
Finds real local parks & trails               Reads quest aloud: "Walk to 
near the user's neighborhood                  Pine Park & clear the litter!"
          │                                               │
          └───────────────────────┬───────────────────────┘
                                  ▼
                     [ 3. The Quest & Timer ]
               Before & After Trash Cleanup (2x Points)
                                  │
                                  ▼
               [ 4. Open AI Verification (Gemma) ]
           Inspects pixels & EXIF data to confirm:
           - Real photo timestamp (not from Google)
           - Photo 1: Trash present
           - Photo 2: Cleaned up!
                                  │
                                  ▼
              [ 5. Points & Community Leaderboard ]
               Earns "Eco-Karma" & Neighborhood Rank
```

---

## 🚀 Quick Start & Demo
Run the local server in your terminal:
```bash
python3 server.py
```
Then open your browser at **`http://localhost:8000`** (or open `index.html` directly).

---

## 📁 Repository Structure
- `TerraQuest_Hackathon_Plan.pdf`: High-resolution 3-page masterplan PDF for judges and organizers.
- `PROJECT_PLAN.md`: Full documentation and pitch write-up.
- `index.html`: The main interactive web application with Leaflet maps and camera verification studio.
- `app.js`: State management, Leaflet map logic, ElevenLabs audio, and Gemma AI verification pipeline.
- `styles.css`: Custom animations, glassmorphic UI, and nature styling.
- `server.py`: Lightweight Python backend with `/api/verify` and static file serving.
