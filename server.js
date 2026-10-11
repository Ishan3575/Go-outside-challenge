/**
 * Touch Grass — AI-Powered Outdoor Challenge Platform
 * Backend Server & Multimodal Verification Runtime
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read Environment Variables
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const VISION_MODEL = 'gemini-3.8-flash';

// 2. Predefined Outdoor Challenges (4 Categories)
const serverStartTime = Date.now();
// 30-minute featured bonus duration for active demonstration
const BONUS_WINDOW_MS = 45 * 60 * 1000;

const challenges = [
  {
    id: 'ch-clean-01',
    title: 'Restore the Green Belt: Micro-Litter Cleanup',
    category: 'cleanup',
    categoryLabel: 'Clean Up Your Surroundings',
    icon: 'sparkles',
    locationName: 'Pine Valley Community Park',
    locationType: 'Public Park & Garden',
    approximateRegion: 'Westside Green Belt',
    lat: 37.7690,
    lng: -122.4467,
    difficulty: 'Easy',
    basePoints: 60,
    bonusMultiplier: 2,
    featured: true,
    bonusExpiresAt: serverStartTime + BONUS_WINDOW_MS,
    description: 'Find a public park bench, picnic area, or trail verge littered with stray wrappers or bottles. Wear protective gardening gloves, collect the litter safely, and leave the ground pristine.',
    safetyNotice: 'Safety first: Never handle glass shards, chemical containers, syringes, or unidentified hazardous waste. Use tongs or gloves.',
    instructions: [
      '1. Take a clear "Before" photograph of the area showing the discarded litter.',
      '2. Safely collect and dispose of the trash in a proper recycling or waste receptacle.',
      '3. Take an "After" photograph of the clean, restored spot from a similar angle.',
      '4. Submit both photos for AI visual verification.'
    ],
    requiredEvidence: 'Two photographs: One Before Cleanup, One After Cleanup'
  },
  {
    id: 'ch-plant-01',
    title: 'Seed of Hope: Plant a Native Wildflower or Sapling',
    category: 'planting',
    categoryLabel: 'Plant Something',
    icon: 'sprout',
    locationName: 'Heritage Community Garden & Allotments',
    locationType: 'Community Garden',
    approximateRegion: 'Midtown Commons',
    lat: 37.7739,
    lng: -122.4312,
    difficulty: 'Moderate',
    basePoints: 80,
    bonusMultiplier: 2,
    featured: true,
    bonusExpiresAt: serverStartTime + BONUS_WINDOW_MS + (15 * 60 * 1000),
    description: 'Plant a pollinator-friendly seed, potted sapling, or herb in a community garden bed, approved public greening spot, or your outdoor planter box.',
    safetyNotice: 'Ensure you have permission if planting in communal beds. Handle trowels and potting mix safely.',
    instructions: [
      '1. Prepare the soil or garden plot with water.',
      '2. Plant your seeds or sapling carefully into the soil.',
      '3. Take a photograph showing the freshly planted seedling, soil, or planting activity.',
      '4. Optional: Bookmark this challenge to submit follow-up growth photos in 14 days!'
    ],
    requiredEvidence: 'One photograph showing the planting activity, fresh sapling, or seedbed'
  },
  {
    id: 'ch-explore-01',
    title: 'The Great Canopy Walk: Photograph a Century-Old Tree',
    category: 'explore',
    categoryLabel: 'Explore and Photograph',
    icon: 'camera',
    locationName: 'Oakridge Nature Reserve & Trails',
    locationType: 'Walking Trail & Reserve',
    approximateRegion: 'North Ridge Woods',
    lat: 37.7833,
    lng: -122.4167,
    difficulty: 'Easy',
    basePoints: 50,
    bonusMultiplier: 1,
    featured: false,
    bonusExpiresAt: null,
    description: 'Walk the perimeter path of Oakridge Reserve. Locate a mature heritage tree (oak, pine, or native hardwood), look up into the canopy, and photograph its trunk and foliage.',
    safetyNotice: 'Stay on marked public footpaths to protect native root systems and fragile undergrowth.',
    instructions: [
      '1. Walk along the designated public trail.',
      '2. Locate a prominent mature heritage tree or distinctive natural landmark.',
      '3. Take an outdoor photograph showcasing the tree or landscape.',
      '4. Upload the photo to log your exploration.'
    ],
    requiredEvidence: 'One photograph of the heritage tree or scenic trail marker'
  },
  {
    id: 'ch-nature-01',
    title: 'Wild Botanical Discovery: Identify Local Ferns or Moss',
    category: 'nature',
    categoryLabel: 'Nature & Outdoor Activities',
    icon: 'tree-pine',
    locationName: 'Fern Hollow Botanical Sanctuary',
    locationType: 'Public Garden & Arboretums',
    approximateRegion: 'Creek Valley Trail',
    lat: 37.7610,
    lng: -122.4550,
    difficulty: 'Easy',
    basePoints: 45,
    bonusMultiplier: 1,
    featured: false,
    bonusExpiresAt: null,
    description: 'Spend at least 20 minutes exploring the shaded stream banks. Find and photograph native ferns, moss, or wild groundcover thriving in their natural habitat.',
    safetyNotice: 'Do not forage, pluck, or disturb wild flora. Capture beauty with your lens only.',
    instructions: [
      '1. Explore the garden or woodland path quietly.',
      '2. Spot wild ferns, lichens, or native flowering groundcover.',
      '3. Take a close-up photograph of the plant in its outdoor setting.',
      '4. Submit your photo proof to receive points.'
    ],
    requiredEvidence: 'One photograph of wild flora in a natural outdoor environment'
  }
];

// 3. User Progress & Submissions (Persistent in Server Memory)
let userState = {
  id: 'usr_local_hero',
  displayName: 'Alex Rivers',
  approximateRegion: 'Metro Bay Area, CA',
  totalPoints: 190,
  completedChallengesCount: 2,
  completedChallenges: ['ch-explore-01'],
  streakDays: 4,
  achievements: [
    { id: 'first_step', title: 'First Step', description: 'Completed your first outdoor mission', icon: 'footprints', earned: true },
    { id: 'green_thumb', title: 'Green Sprout', description: 'Participated in urban planting', icon: 'sprout', earned: false },
    { id: 'clean_guardian', title: 'Litter Liberator', description: 'Cleaned a public green space', icon: 'sparkles', earned: false },
    { id: 'golden_chaser', title: 'Golden Hour Hero', description: 'Completed a featured 2× bonus challenge', icon: 'zap', earned: true }
  ]
};

const submissions = [];

// 4. Community Leaderboard Data (Sample/Demo Baseline clearly labeled)
const leaderboardData = {
  global: [
    { rank: 1, name: 'Maya Lin', region: 'Cascadia Region, WA', points: 740, cleanups: 6, plantings: 4, badge: 'Eco Warden' },
    { rank: 2, name: 'Liam O\'Connor', region: 'Greenway District, OR', points: 610, cleanups: 5, plantings: 3, badge: 'Forest Ranger' },
    { rank: 3, name: 'Priya Sharma', region: 'Highland Parks, CA', points: 530, cleanups: 4, plantings: 3, badge: 'Trail Steward' },
    { rank: 4, name: 'Alex Rivers (You)', region: 'Metro Bay Area, CA', points: 190, cleanups: 1, plantings: 1, badge: 'Sprout Scout', isUser: true },
    { rank: 5, name: 'Jordan Hayes', region: 'Pine Ridge, CO', points: 175, cleanups: 1, plantings: 1, badge: 'Pathfinder' }
  ],
  local: [
    { rank: 1, name: 'Priya Sharma', region: 'Highland Parks (Nearby)', points: 530, cleanups: 4, plantings: 3, badge: 'Trail Steward' },
    { rank: 2, name: 'Alex Rivers (You)', region: 'Metro Bay Area (Your Region)', points: 190, cleanups: 1, plantings: 1, badge: 'Sprout Scout', isUser: true },
    { rank: 3, name: 'Carlos Mendez', region: 'Metro Bay Area (Nearby)', points: 140, cleanups: 1, plantings: 0, badge: 'Novice Planter' },
    { rank: 4, name: 'Samira Vance', region: 'Metro Bay Area (Nearby)', points: 110, cleanups: 1, plantings: 0, badge: 'Park Scout' }
  ],
  category: {
    cleanup: [
      { rank: 1, name: 'Maya Lin', region: 'Cascadia Region', actions: '6 cleanups', points: 360 },
      { rank: 2, name: 'Liam O\'Connor', region: 'Greenway District', actions: '5 cleanups', points: 300 },
      { rank: 3, name: 'Alex Rivers (You)', region: 'Metro Bay Area', actions: '1 cleanup', points: 60, isUser: true }
    ],
    planting: [
      { rank: 1, name: 'Maya Lin', region: 'Cascadia Region', actions: '4 planted', points: 320 },
      { rank: 2, name: 'Priya Sharma', region: 'Highland Parks', actions: '3 planted', points: 240 },
      { rank: 3, name: 'Liam O\'Connor', region: 'Greenway District', actions: '3 planted', points: 240 }
    ],
    nature: [
      { rank: 1, name: 'Liam O\'Connor', region: 'Greenway District', actions: '8 walks', points: 280 },
      { rank: 2, name: 'Priya Sharma', region: 'Highland Parks', actions: '5 walks', points: 210 },
      { rank: 3, name: 'Alex Rivers (You)', region: 'Metro Bay Area', actions: '2 walks', points: 90, isUser: true }
    ]
  }
};

// 5. Server-Side AI Verification with Google Gemini 3.8 Flash
async function callGeminiVision(challenge, images, notes) {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      status: 'pending_review',
      error: 'API key not configured on server',
      assessment: {
        relevant: false,
        confidence: 'Low',
        explanation: 'Server vision runtime is not configured with an API key. Your submission has been saved and queued for community review.',
        requiresReview: true,
        reasonForReview: 'AI vision model unavailable'
      }
    };
  }

  // Construct structured evaluation prompt
  const parts = [];
  
  const systemPrompt = `You are the rigorous, nature-positive AI verification engine for "Touch Grass", an outdoor environmental challenge platform.
Your task is to evaluate user-submitted photographs for the following challenge:

CHALLENGE DETAILS:
- Title: "${challenge.title}"
- Category: "${challenge.categoryLabel}"
- Description: "${challenge.description}"
- Required Evidence: "${challenge.requiredEvidence}"
- User Notes: "${notes || 'None provided'}"

EVALUATION RULES:
1. Category "Clean Up Your Surroundings" (cleanup):
   - You are provided with two images: Image 1 is "BEFORE", Image 2 is "AFTER".
   - Image 1 MUST show visible discarded litter, waste, or untidy ground.
   - Image 2 MUST show the same or matching background/scene with the litter successfully removed and collected.
   - If both photos are identical or both have litter, mark relevant: false or requiresReview: true.

2. Category "Plant Something" (planting):
   - The image MUST show planting activity: soil, gardening tools, potted sapling, fresh seedling, garden bed, or a newly planted plant.
   - A random stock picture of an adult forest tree does NOT count as planting.

3. Category "Explore and Photograph" & "Nature & Outdoor Activities" (explore / nature):
   - The image MUST appear to be an outdoor setting consistent with public parks, nature reserves, flora, trees, or walking trails.
   - Indoor selfies, computer screenshots, or non-outdoor images must be rejected.

4. Treat your assessment as an evidence-based assessment. You cannot definitively guarantee the capture time or exact GPS coordinates from pixels alone; focus on content consistency.

OUTPUT REQUIREMENT:
You MUST respond with a single valid JSON object with EXACTLY this structure (no markdown fences, no extra text):
{
  "relevant": boolean,
  "confidence": "High" | "Medium" | "Low",
  "explanation": "A concise 2-3 sentence explanation of what visual elements were detected and how they match or do not match the challenge criteria.",
  "requiresReview": boolean,
  "reasonForReview": "Short explanation if flagged for human review, otherwise empty string"
}`;

  parts.push({ text: systemPrompt });

  // Append images
  images.forEach((img, idx) => {
    let cleanBase64 = img.base64;
    let mimeType = img.mimeType || 'image/jpeg';

    if (cleanBase64.includes(';base64,')) {
      const split = cleanBase64.split(';base64,');
      const mimeMatch = split[0].match(/data:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
      cleanBase64 = split[1];
    }

    parts.push({
      text: `[IMAGE ${idx + 1} - Label: ${img.label || (idx === 0 && images.length > 1 ? 'BEFORE' : 'AFTER')}]`
    });
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64
      }
    });
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${VISION_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', response.status, errText);
      return {
        success: false,
        status: 'pending_review',
        error: `Gemini API returned ${response.status}`,
        assessment: {
          relevant: false,
          confidence: 'Low',
          explanation: `The multimodal model encountered an unexpected status (${response.status}). Your submission is safely recorded and queued for manual verification.`,
          requiresReview: true,
          reasonForReview: 'AI endpoint temporary latency or error'
        }
      };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON safely
    let parsed;
    try {
      // Clean possible markdown code fences
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Could not parse JSON directly from Gemini, using fallback parser:', rawText);
      parsed = {
        relevant: rawText.toLowerCase().includes('"relevant": true') || rawText.toLowerCase().includes('relevant'),
        confidence: 'Medium',
        explanation: rawText.slice(0, 300),
        requiresReview: false,
        reasonForReview: ''
      };
    }

    return {
      success: true,
      status: parsed.relevant ? 'verified' : 'rejected',
      assessment: parsed
    };
  } catch (netErr) {
    console.error('Network exception calling Gemini:', netErr);
    return {
      success: false,
      status: 'pending_review',
      error: netErr.message,
      assessment: {
        relevant: false,
        confidence: 'Low',
        explanation: 'Network connectivity to the model endpoint was interrupted. The submission remains pending review.',
        requiresReview: true,
        reasonForReview: 'Network timeout / unreachable host'
      }
    };
  }
}

// 6. Request Router & Server Logic
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ROUTES ---

  // Health / Status
  if (pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      platform: 'Touch Grass',
      version: '1.0.0',
      visionModel: VISION_MODEL,
      modelReady: Boolean(GEMINI_API_KEY),
      privacyPolicy: 'Server-side inference only. Precise coordinates are never logged or published.'
    }));
    return;
  }

  // Reset demo state (for easy re-testing)
  if (pathname === '/api/reset' && (req.method === 'GET' || req.method === 'POST')) {
    userState.totalPoints = 190;
    userState.completedChallengesCount = 1;
    userState.completedChallenges = ['ch-explore-01'];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'User state reset to demo initial state.', user: userState }));
    return;
  }

  // Get Challenges with Live Bonus Calculations
  if (pathname === '/api/challenges' && req.method === 'GET') {
    const now = Date.now();
    const formattedChallenges = challenges.map(c => {
      const isBonusActive = c.featured && c.bonusExpiresAt && (c.bonusExpiresAt > now);
      const remainingSeconds = isBonusActive ? Math.max(0, Math.floor((c.bonusExpiresAt - now) / 1000)) : 0;
      return {
        ...c,
        isBonusActive,
        remainingBonusSeconds: remainingSeconds,
        currentPointsValue: isBonusActive ? c.basePoints * c.bonusMultiplier : c.basePoints
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(formattedChallenges));
    return;
  }

  // Get User Profile & Progress
  if (pathname === '/api/user' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userState));
    return;
  }

  // Get Leaderboards
  if (pathname === '/api/leaderboard' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(leaderboardData));
    return;
  }

  // Submit Challenge for AI Verification (POST /api/verify)
  if (pathname === '/api/verify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Cap at 15MB
      if (body.length > 15 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { challengeId, images, notes } = payload;

        if (!challengeId || !images || !Array.isArray(images) || images.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing challengeId or images' }));
          return;
        }

        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Challenge not found' }));
          return;
        }

        // Duplicate Check: Has user already completed this challenge?
        if (userState.completedChallenges.includes(challengeId)) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'You have already completed this challenge and earned its points!',
            alreadyCompleted: true
          }));
          return;
        }

        // Server-Side Bonus Window Calculation (Do NOT trust client)
        const submissionTimestamp = Date.now();
        const isBonusActive = challenge.featured && 
                              challenge.bonusExpiresAt && 
                              (submissionTimestamp <= challenge.bonusExpiresAt);
        
        const finalPointsToAward = isBonusActive 
          ? (challenge.basePoints * challenge.bonusMultiplier) 
          : challenge.basePoints;

        // Perform Genuine Multimodal Vision Assessment via Gemini
        const aiResult = await callGeminiVision(challenge, images, notes);

        const submissionRecord = {
          submissionId: `sub_${Date.now()}`,
          challengeId,
          challengeTitle: challenge.title,
          submittedAt: new Date(submissionTimestamp).toISOString(),
          isBonusActive,
          potentialPoints: finalPointsToAward,
          status: aiResult.status,
          assessment: aiResult.assessment
        };

        // If Verified by AI: Award points and update user profile
        if (aiResult.status === 'verified') {
          userState.totalPoints += finalPointsToAward;
          userState.completedChallengesCount += 1;
          userState.completedChallenges.push(challengeId);

          // Update achievements if applicable
          if (challenge.category === 'planting') {
            const ach = userState.achievements.find(a => a.id === 'green_thumb');
            if (ach) ach.earned = true;
          }
          if (challenge.category === 'cleanup') {
            const ach = userState.achievements.find(a => a.id === 'clean_guardian');
            if (ach) ach.earned = true;
          }
          if (isBonusActive) {
            const ach = userState.achievements.find(a => a.id === 'golden_chaser');
            if (ach) ach.earned = true;
          }

          // Update local leaderboard user entry
          const localUser = leaderboardData.local.find(u => u.isUser);
          if (localUser) localUser.points = userState.totalPoints;
          const globalUser = leaderboardData.global.find(u => u.isUser);
          if (globalUser) globalUser.points = userState.totalPoints;

          submissionRecord.awardedPoints = finalPointsToAward;
        } else {
          submissionRecord.awardedPoints = 0;
        }

        submissions.push(submissionRecord);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          status: aiResult.status,
          awardedPoints: submissionRecord.awardedPoints,
          isBonusApplied: isBonusActive,
          assessment: aiResult.assessment,
          user: userState
        }));
      } catch (err) {
        console.error('Error processing verification:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error processing verification', details: err.message }));
      }
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA behavior
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Error loading asset');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🌿 Touch Grass Platform Server Running!`);
  console.log(`👉 Web Application: http://localhost:${PORT}`);
  console.log(`🤖 AI Vision Model: ${VISION_MODEL} (Google Multimodal)`);
  console.log(`🔑 Server API Key:  ${GEMINI_API_KEY ? 'Active & Configured' : 'Missing'}`);
  console.log(`========================================================\n`);
});
