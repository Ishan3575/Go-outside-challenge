*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

## What I Built

**WanderWild: Adventures & Exploration** is an aesthetic, gamified outdoor exploration and environmental platform that turns local nature into a real-life adventure RPG.

Instead of keeping users trapped in front of screens, WanderWild is built around the **"Minimal Screen Time" philosophy**:
1. Open the app for **30 seconds** to discover nearby green spaces and pick an outdoor adventure challenge.
2. Put your phone away and spend **1 to 2 hours** outside exploring nature trails, planting saplings, or cleaning littered spots.
3. Snap photo evidence and upload it for **multimodal AI visual assessment** to earn points, unlock adventure badges, and climb community leaderboards.

### The Four Adventure Tracks:
- 🧹 **Clean Up Your Surroundings:** Safely clean public trails or park benches. Requires dual **Before & After** photographs showing waste removal (with strict safety advisories against hazardous items).
- 🌱 **Plant Something:** Plant wildflower seeds, community saplings, or garden herbs and document the freshly potted seedling.
- 📸 **Explore and Photograph:** Visit local nature reserves and document heritage trees and scenic lookouts.
- 🌲 **Nature & Outdoor Activities:** Go on quiet woodland walks and identify native ferns, moss, or wild flora.

---

## Demo

- 🎥 **Video Walkthrough (Google Drive):** [Watch the Video Demo Here](https://drive.google.com/drive/folders/1YzxPgqleaiqgVUCLa0RMNYvXy9b02mwK?usp=drive_link)
- 💻 **Live Code Repository:** [github.com/Ishan3575/Go-outside-challenge](https://github.com/Ishan3575/Go-outside-challenge)
- 🚀 **Local Quickstart:** Run `node server.js` and visit `http://localhost:3000`

> 🎙️ **Note on Audio & Accessibility:** The demo video features synthesized AI voiceover narration and gentle ambient background music. This was intentionally created to ensure crystal-clear acoustic clarity so the video can be easily transcribed, indexed, and evaluated by judges and accessibility screen-readers.

<details>
<summary><strong>📝 Click to expand the Full Video Narration Transcript</strong></summary>

- **0:00 – 0:25:** *"Welcome to WanderWild, an AI-powered outdoor adventure and exploration platform built for the Hacktoberfest Touch Grass challenge. WanderWild is designed to get people off their screens and into nature."*
- **0:25 – 0:45:** *"Here on the dashboard, adventurers can choose from four real-world challenge tracks: cleaning up litter, planting seedlings, nature walks, and trail exploration. Featured challenges offer limited-time double bonus points calculated directly on the server."*
- **0:45 – 1:15:** *"Let's submit a challenge. In the evidence studio, users upload photo proof. Our server-side multimodal vision model, powered by Google Gemini, analyzes the image, checking for soil, seedlings, or cleaned litter, and returns a verified assessment with points awarded."*
- **1:15 – 1:40:** *"The platform also integrates an interactive Leaflet and OpenStreetMap explorer to reveal nearby parks and public trails. To protect user privacy, exact home coordinates are never exposed—only approximate regional areas are shown on community leaderboards."*
- **1:40 – 2:49:** *"With community leaderboards, milestone badges, and server-side verification, WanderWild makes taking care of nature fun and rewarding. Step away from the screen, head outside, and touch grass!"*

</details>

---

## Code

{% github Ishan3575/Go-outside-challenge %}

You can explore the full open-source codebase on GitHub:
👉 **[Ishan3575/Go-outside-challenge](https://github.com/Ishan3575/Go-outside-challenge)**

---

## How I Built It

- **Aesthetic Frontend & UX:** Clean, responsive design built with HTML5, Tailwind CSS, Lucide Icons, and Canvas Confetti. Styled with an earthy, botanical palette (forest green, fresh mint, warm cream, and earthy tones).
- **Mapping & Geolocation:** Integrated **Leaflet.js** with **OpenStreetMap** tile layers. Provides automatic browser geolocation alongside manual region selectors, with a strict privacy guarantee that never displays or logs exact home coordinates.
- **Backend & REST APIs:** Built with a lightweight, zero-dependency Node.js server (`server.js`) handling `/api/challenges`, `/api/verify`, `/api/leaderboard`, and `/api/user`.
- **Multimodal AI Verification:** Powered server-side by Google's multimodal vision model (**Gemini 3.8 Flash**, compatible with open-weight vision pipelines like PaliGemma). 
  - For cleanups, the vision model inspects the *Before* photo for debris and verifies that the *After* photo displays the same scenery completely cleaned.
  - For botany and planting, it checks for active soil, pots, seedlings, and wild flora.
- **Server-Side Scoring Integrity:** Bonus points and multiplier calculations are performed exclusively on the server based on submission timestamps, preventing client-side score manipulation.

---

## Why Does Open Innovation Matter?

1. **Neighborhood Privacy:** Environmental challenges happen in local parks, residential trails, and community gardens. Sending high-resolution photos and location data to proprietary closed clouds risks personal tracking and geolocation profiling. Open-weight models and self-hosted AI allow communities to run verification on private nodes or local machines without external tracking.
2. **Zero Recurring Costs for Grassroots Groups:** Schools, non-profit volunteer cleanups, and local environmental clubs cannot afford monthly per-token API bills. Open models democratize automated ecological verification for anyone, anywhere.
3. **Specialized Ecological Adaptation:** Open-weight vision models can be adapted or prompted specifically for local flora classification, regional invasive weed detection, and municipal litter benchmarks without vendor lock-in.
4. **Honest, Evidence-Based Assessment:** Rather than treating AI as unquestionable truth, our architecture treats model outputs as structured evidence assessments. If an image is ambiguous or the model is unreachable, the system gracefully places the submission into a pending review queue rather than making false claims.

---

## Roadmap & Future Enhancements (What’s Coming Next)

Due to hackathon time constraints, this initial MVP focused on perfecting the core loop: map discovery, 4 challenge types, 2x timed bonuses, and multimodal AI verification. 

Here are the exciting features planned for the next release:

1. **📖 "Adventure Chronicler" (Storytelling Bonus):**
   - Users who write an extended personal journal entry or story about their outdoor adventure will be awarded extra bonus points for creative community storytelling.
2. **🛡️ Community Whistleblower Bounty & Anti-Abuse System:**
   - **Bounty Points:** If a community member reports someone attempting to game the system with fake/staged images, or maliciously littering an area just to clean it for points ("eco-fraud"), the reporter receives bonus points for protecting community integrity.
   - **Zero Tolerance Penalty:** Accounts caught deliberately staging trash or submitting fraudulent evidence will receive an instant score reset to zero and a permanent platform ban.
3. **🤝 "Wander Together" (Local Outdoor Buddy Finder):**
   - An opt-in social feature where users can share contact handles to find verified outdoor buddies near them. The platform will suggest nearby peers so adventurers can team up for group trail hikes and joint park restoration missions.

---

## Prize Categories

- **Touch Grass (Main Challenge Track):** Minimal screen time, real-world community action, and nature engagement.
- **Best Use of Gemma / Google Multimodal AI:** Utilizing server-side multimodal vision models to perform authentic visual verification on environmental and botanical challenge submissions.

<!-- Thanks for participating in Hacktoberfest 2026! -->
