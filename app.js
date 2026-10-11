/**
 * Touch Grass — Client-Side Application Logic
 * Interactive Leaflet Map, Challenge System, Live Bonus Countdown & AI Verification Studio
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Application State
  const state = {
    challenges: [],
    activeCategory: 'all',
    currentLocation: { lat: 37.7749, lng: -122.4194, name: 'Metro Bay Area (Active Demo)' },
    user: {
      totalPoints: 190,
      completedChallenges: ['ch-explore-01'],
      completedChallengesCount: 1,
      achievements: []
    },
    activeModalChallenge: null,
    slot1Base64: null,
    slot2Base64: null,
    isSubmitting: false,
    activeLeaderboardView: 'global',
    leaderboardData: null
  };

  // Pre-configured Demo Coordinates
  const demoLocations = {
    san_francisco: { lat: 37.7749, lng: -122.4194, name: 'Metro Bay Area (Active Demo)' },
    central_park: { lat: 40.785091, lng: -73.968285, name: 'Central Park, New York' },
    hyde_park: { lat: 51.507268, lng: -0.165730, name: 'Hyde Park, London' }
  };

  // 2. Leaflet Map Initialization
  let map, markers = [];

  function initMap(lat, lng) {
    if (map) {
      map.remove();
    }

    map = L.map('leaflet-map', {
      zoomControl: true,
      attributionControl: true
    }).setView([lat, lng], 13);

    // Free OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Approximate User Area Marker (Privacy-safe: no exact home pin)
    const userAreaIcon = L.divIcon({
      className: 'touch-grass-marker',
      html: '<div style="background:#15803d; width:16px; height:16px; border-radius:50%; border:3px solid #ffffff;"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker([lat, lng], { icon: userAreaIcon })
      .addTo(map)
      .bindPopup('<b>Approximate Region</b><br><span style="font-size:11px; color:#6b7280;">Your exact home location is protected.</span>');

    renderMapMarkers();
  }

  function renderMapMarkers() {
    if (!map) return;
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    state.challenges.forEach(challenge => {
      let markerColorClass = 'marker-explore';
      let iconEmoji = '📸';

      if (challenge.category === 'cleanup') {
        markerColorClass = 'marker-cleanup';
        iconEmoji = '🧹';
      } else if (challenge.category === 'planting') {
        markerColorClass = 'marker-planting';
        iconEmoji = '🌱';
      } else if (challenge.category === 'nature') {
        markerColorClass = 'marker-nature';
        iconEmoji = '🌲';
      }

      const customIcon = L.divIcon({
        className: `touch-grass-marker ${markerColorClass}`,
        html: `<div style="font-size:14px; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">${iconEmoji}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([challenge.lat, challenge.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-size:12px; line-height:1.4; padding:4px;">
          <div style="font-weight:800; color:#14532d; font-size:13px; margin-bottom:2px;">${challenge.title}</div>
          <div style="color:#6b7280; font-size:11px; margin-bottom:4px;">📍 ${challenge.locationName}</div>
          <div style="color:#d97706; font-weight:700; font-size:11px; margin-bottom:6px;">
            ${challenge.isBonusActive ? '⚡ 2× Bonus Active: ' + challenge.currentPointsValue + ' pts' : '⭐ ' + challenge.basePoints + ' pts'}
          </div>
          <button onclick="window.openSubmitModal('${challenge.id}')" style="background:#16a34a; color:white; border:none; padding:4px 10px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px; width:100%;">
            View & Submit Challenge
          </button>
        </div>
      `);
      markers.push(marker);
    });
  }

  // 3. Geolocation Handling
  document.getElementById('btn-browser-location').addEventListener('click', () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          state.currentLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: `${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°W`
          };
          initMap(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          alert('Location access denied or unavailable. Using demo region.');
          initMap(state.currentLocation.lat, state.currentLocation.lng);
        },
        { timeout: 6000 }
      );
    } else {
      alert('Browser geolocation not supported. Using demo location.');
    }
  });

  document.getElementById('select-demo-location').addEventListener('change', (e) => {
    const loc = demoLocations[e.target.value] || demoLocations.san_francisco;
    state.currentLocation = loc;
    initMap(loc.lat, loc.lng);
  });

  // 4. Fetch Challenges from Server
  async function loadChallenges() {
    try {
      const res = await fetch('/api/challenges');
      if (res.ok) {
        state.challenges = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch challenges from /api/challenges, using fallback data:', e);
    }
    renderChallengesGrid();
    renderMapMarkers();
  }

  // 5. Render Challenges Grid
  const challengesGrid = document.getElementById('challenges-grid');

  function renderChallengesGrid() {
    challengesGrid.innerHTML = '';

    const filtered = state.challenges.filter(c => {
      if (state.activeCategory === 'all') return true;
      return c.category === state.activeCategory;
    });

    if (filtered.length === 0) {
      challengesGrid.innerHTML = `
        <div class="col-span-2 text-center py-12 text-slate-400 text-xs">
          No challenges found in this category.
        </div>
      `;
      return;
    }

    filtered.forEach(challenge => {
      const isCompleted = state.user.completedChallenges.includes(challenge.id);
      const card = document.createElement('div');
      
      card.className = `rounded-3xl bg-white border transition-all p-6 space-y-4 shadow-xs relative overflow-hidden flex flex-col justify-between ${
        challenge.isBonusActive ? 'border-amber-300 ring-1 ring-amber-300/60 animate-bonus-glow' : 'border-cream-300 hover:border-forest-300'
      }`;

      // Category Icon & Badge
      let badgeColor = 'bg-forest-50 text-forest-700 border-forest-200';
      if (challenge.category === 'cleanup') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      if (challenge.category === 'planting') badgeColor = 'bg-teal-50 text-teal-800 border-teal-200';
      if (challenge.category === 'explore') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
      if (challenge.category === 'nature') badgeColor = 'bg-sky-50 text-sky-800 border-sky-200';

      card.innerHTML = `
        <div class="space-y-3">
          <!-- Top Row: Category Badge & Points -->
          <div class="flex items-start justify-between gap-2">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeColor}">
              ${challenge.categoryLabel}
            </span>

            <!-- Points Display -->
            <div class="text-right">
              ${challenge.isBonusActive ? `
                <div class="flex items-center gap-1 text-xs font-black text-amber-600">
                  <span>⚡ 2× Bonus:</span>
                  <span class="text-base text-amber-700">${challenge.currentPointsValue} pts</span>
                </div>
                <div class="text-[10px] font-bold text-amber-700 font-mono" id="timer-${challenge.id}">
                  Ends in ${formatSeconds(challenge.remainingBonusSeconds)}
                </div>
              ` : `
                <div class="text-sm font-extrabold text-forest-800">
                  ⭐ ${challenge.basePoints} pts
                </div>
                <div class="text-[10px] text-slate-400 font-medium">Standard Reward</div>
              `}
            </div>
          </div>

          <!-- Title & Location -->
          <div>
            <h3 class="text-lg font-black text-slate-900 tracking-tight leading-snug">
              ${challenge.title}
            </h3>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-forest-600"></i>
              <span>${challenge.locationName} &bull; <strong class="text-slate-600">${challenge.approximateRegion}</strong></span>
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs text-slate-600 leading-relaxed">
            ${challenge.description}
          </p>

          <!-- Instructions Preview -->
          <div class="p-3 rounded-2xl bg-cream-50 border border-cream-200 text-[11px] text-slate-600 space-y-1">
            <div class="font-bold text-slate-800 flex items-center gap-1">
              <i data-lucide="check-circle-2" class="w-3 h-3 text-forest-600"></i> Evidence Required:
            </div>
            <div>${challenge.requiredEvidence}</div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="pt-4 border-t border-cream-200 flex items-center justify-between gap-3 mt-2">
          <div class="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
            <span class="px-2 py-0.5 rounded bg-cream-100 text-slate-600">${challenge.difficulty}</span>
          </div>

          ${isCompleted ? `
            <span class="px-4 py-2 rounded-xl bg-forest-100 text-forest-800 font-bold text-xs flex items-center gap-1.5">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Completed
            </span>
          ` : `
            <button onclick="window.openSubmitModal('${challenge.id}')" class="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors">
              <i data-lucide="camera" class="w-3.5 h-3.5"></i>
              <span>Submit Proof</span>
            </button>
          `}
        </div>
      `;

      challengesGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  // Helper: Format Seconds to MM:SS
  function formatSeconds(sec) {
    if (!sec || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // 6. Live Timer Countdown Engine
  setInterval(() => {
    let needsReRender = false;
    state.challenges.forEach(c => {
      if (c.isBonusActive && c.remainingBonusSeconds > 0) {
        c.remainingBonusSeconds--;
        const timerEl = document.getElementById(`timer-${c.id}`);
        if (timerEl) {
          timerEl.textContent = `Ends in ${formatSeconds(c.remainingBonusSeconds)}`;
        }
        if (c.remainingBonusSeconds === 0) {
          c.isBonusActive = false;
          needsReRender = true;
        }
      }
    });
    if (needsReRender) {
      renderChallengesGrid();
    }
  }, 1000);

  // 7. Category Filter Tab Clicks
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-tab').forEach(t => {
        t.className = 'filter-tab px-3 py-1.5 rounded-xl text-slate-600 hover:text-forest-800 transition-colors';
      });
      tab.className = 'filter-tab px-3 py-1.5 rounded-xl bg-white text-forest-900 shadow-xs font-bold';
      state.activeCategory = tab.getAttribute('data-cat');
      renderChallengesGrid();
    });
  });

  // 8. Open Submission & AI Verification Modal
  window.openSubmitModal = function(challengeId) {
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    state.activeModalChallenge = challenge;
    state.slot1Base64 = null;
    state.slot2Base64 = null;

    document.getElementById('modal-challenge-title').textContent = challenge.title;
    document.getElementById('modal-challenge-desc').textContent = `${challenge.locationName} • ${challenge.categoryLabel}`;

    // Safety text
    const safetyNotice = challenge.safetyNotice || 'Please follow all local safety guidelines.';
    document.getElementById('modal-safety-text').textContent = safetyNotice;

    // Reset upload UI
    resetSlot1();
    resetSlot2();

    const slot2Wrapper = document.getElementById('slot-2-wrapper');
    const slot1Label = document.getElementById('slot-1-label');

    if (challenge.category === 'cleanup') {
      slot2Wrapper.classList.remove('hidden');
      slot1Label.textContent = 'Photo 1: BEFORE Cleanup (Shows litter/waste)';
    } else {
      slot2Wrapper.classList.add('hidden');
      slot1Label.textContent = 'Photo: Required Challenge Proof';
    }

    // Hide previous result
    const resultBox = document.getElementById('ai-result-box');
    resultBox.classList.add('hidden');
    resultBox.innerHTML = '';

    document.getElementById('submit-modal').classList.remove('hidden');
  };

  // Modal Close Handlers
  function closeModal() {
    document.getElementById('submit-modal').classList.add('hidden');
  }
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);

  // Photo Slot Resets
  function resetSlot1() {
    state.slot1Base64 = null;
    document.getElementById('slot-1-preview').classList.add('hidden');
    document.getElementById('slot-1-empty').classList.remove('hidden');
    document.getElementById('input-slot-1').value = '';
  }

  function resetSlot2() {
    state.slot2Base64 = null;
    document.getElementById('slot-2-preview').classList.add('hidden');
    document.getElementById('slot-2-empty').classList.remove('hidden');
    document.getElementById('input-slot-2').value = '';
  }

  document.getElementById('btn-clear-slot-1').addEventListener('click', resetSlot1);
  document.getElementById('btn-clear-slot-2').addEventListener('click', resetSlot2);

  // File Upload Handlers
  function handleFileInput(input, isSlot1) {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (isSlot1) {
        state.slot1Base64 = dataUrl;
        document.getElementById('slot-1-img').src = dataUrl;
        document.getElementById('slot-1-preview').classList.remove('hidden');
        document.getElementById('slot-1-empty').classList.add('hidden');
      } else {
        state.slot2Base64 = dataUrl;
        document.getElementById('slot-2-img').src = dataUrl;
        document.getElementById('slot-2-preview').classList.remove('hidden');
        document.getElementById('slot-2-empty').classList.add('hidden');
      }
    };
    reader.readAsDataURL(file);
  }

  document.getElementById('input-slot-1').addEventListener('change', (e) => handleFileInput(e.target, true));
  document.getElementById('input-slot-2').addEventListener('change', (e) => handleFileInput(e.target, false));

  // 9. 1-Click Demo Photo Generator (Canvas-Based Realistic Images)
  document.getElementById('btn-load-demo-photos').addEventListener('click', () => {
    const challenge = state.activeModalChallenge;
    if (!challenge) return;

    if (challenge.category === 'cleanup') {
      // Photo 1: Grassy park with plastic bottles & food trash
      const c1 = document.createElement('canvas');
      c1.width = 400; c1.height = 300;
      const ctx1 = c1.getContext('2d');
      // Park grass
      ctx1.fillStyle = '#2f5e27';
      ctx1.fillRect(0, 0, 400, 300);
      // Bench
      ctx1.fillStyle = '#854d0e';
      ctx1.fillRect(60, 100, 280, 24);
      ctx1.fillRect(80, 124, 20, 60);
      ctx1.fillRect(300, 124, 20, 60);
      // Discarded plastic bottle (blue)
      ctx1.fillStyle = '#38bdf8';
      ctx1.fillRect(130, 170, 35, 14);
      // Crushed soda can (red)
      ctx1.fillStyle = '#ef4444';
      ctx1.fillRect(210, 190, 22, 28);
      // Snack wrapper (yellow)
      ctx1.fillStyle = '#eab308';
      ctx1.fillRect(170, 210, 30, 18);
      // Watermark
      ctx1.fillStyle = 'rgba(255,255,255,0.7)';
      ctx1.font = '12px sans-serif';
      ctx1.fillText('BEFORE CLEANUP: Litter visible on park verge', 14, 285);
      const dataUrl1 = c1.toDataURL('image/jpeg');

      // Photo 2: Same bench, completely cleaned
      const c2 = document.createElement('canvas');
      c2.width = 400; c2.height = 300;
      const ctx2 = c2.getContext('2d');
      ctx2.fillStyle = '#2f5e27';
      ctx2.fillRect(0, 0, 400, 300);
      ctx2.fillStyle = '#854d0e';
      ctx2.fillRect(60, 100, 280, 24);
      ctx2.fillRect(80, 124, 20, 60);
      ctx2.fillRect(300, 124, 20, 60);
      // Tied recycling bag sitting neatly
      ctx2.fillStyle = '#166534';
      ctx2.beginPath();
      ctx2.arc(260, 210, 24, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.fillStyle = '#4ade80';
      ctx2.fillRect(254, 180, 12, 10);
      // Watermark
      ctx2.fillStyle = 'rgba(255,255,255,0.7)';
      ctx2.font = '12px sans-serif';
      ctx2.fillText('AFTER CLEANUP: Pristine lawn + collected waste', 14, 285);
      const dataUrl2 = c2.toDataURL('image/jpeg');

      state.slot1Base64 = dataUrl1;
      document.getElementById('slot-1-img').src = dataUrl1;
      document.getElementById('slot-1-preview').classList.remove('hidden');
      document.getElementById('slot-1-empty').classList.add('hidden');

      state.slot2Base64 = dataUrl2;
      document.getElementById('slot-2-img').src = dataUrl2;
      document.getElementById('slot-2-preview').classList.remove('hidden');
      document.getElementById('slot-2-empty').classList.add('hidden');

    } else if (challenge.category === 'planting') {
      // Photo: Seedling planted in fertile potting soil
      const c = document.createElement('canvas');
      c.width = 400; c.height = 300;
      const ctx = c.getContext('2d');
      // Dark soil bed
      ctx.fillStyle = '#3f2b18';
      ctx.fillRect(0, 0, 400, 300);
      // Terra cotta pot rim
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(80, 220, 240, 80);
      // Green stem & fresh young leaves
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(200, 220);
      ctx.lineTo(200, 140);
      ctx.stroke();
      // Leaves
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(180, 140, 24, 12, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(220, 140, 24, 12, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      // Garden trowel
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(290, 120, 12, 90);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '12px sans-serif';
      ctx.fillText('PLANTING EVIDENCE: Fresh sapling & soil', 14, 285);
      const dataUrl = c.toDataURL('image/jpeg');

      state.slot1Base64 = dataUrl;
      document.getElementById('slot-1-img').src = dataUrl;
      document.getElementById('slot-1-preview').classList.remove('hidden');
      document.getElementById('slot-1-empty').classList.add('hidden');

    } else {
      // Photo: Outdoor park tree & sunny trail
      const c = document.createElement('canvas');
      c.width = 400; c.height = 300;
      const ctx = c.getContext('2d');
      // Sky
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, 400, 140);
      // Mountain trail
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 140, 400, 160);
      // Large oak trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(160, 60, 80, 240);
      // Foliage canopy
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(200, 70, 90, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '12px sans-serif';
      ctx.fillText('OUTDOOR EXPLORATION: Heritage tree canopy', 14, 285);
      const dataUrl = c.toDataURL('image/jpeg');

      state.slot1Base64 = dataUrl;
      document.getElementById('slot-1-img').src = dataUrl;
      document.getElementById('slot-1-preview').classList.remove('hidden');
      document.getElementById('slot-1-empty').classList.add('hidden');
    }
  });

  // 10. Submit for AI Verification (Real Call to Server-Side /api/verify)
  const btnSubmit = document.getElementById('btn-submit-verification');
  const btnSubmitText = document.getElementById('btn-submit-text');
  const resultBox = document.getElementById('ai-result-box');

  btnSubmit.addEventListener('click', async () => {
    if (state.isSubmitting) return;

    const challenge = state.activeModalChallenge;
    if (!challenge) return;

    // Validation
    if (!state.slot1Base64) {
      alert('Please upload or load the required photograph first.');
      return;
    }
    if (challenge.category === 'cleanup' && !state.slot2Base64) {
      alert('Cleanup challenges require both Before and After photographs.');
      return;
    }

    state.isSubmitting = true;
    btnSubmit.disabled = true;
    btnSubmitText.textContent = 'Evaluating with Gemini 3.8 Flash...';

    resultBox.classList.remove('hidden');
    resultBox.className = 'p-4 rounded-2xl border border-cream-300 bg-cream-50 text-xs space-y-2';
    resultBox.innerHTML = `
      <div class="flex items-center gap-2 text-forest-800 font-bold">
        <span class="w-3 h-3 rounded-full bg-forest-600 animate-ping"></span>
        <span>Calling server-side multimodal vision model...</span>
      </div>
      <p class="text-[11px] text-slate-500">Inspecting visual elements, soil, litter removal, or flora consistency.</p>
    `;

    // Prepare images payload
    const images = [
      { label: 'BEFORE', base64: state.slot1Base64 }
    ];
    if (state.slot2Base64) {
      images.push({ label: 'AFTER', base64: state.slot2Base64 });
    }

    const notes = document.getElementById('submission-notes').value;

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          images,
          notes
        })
      });

      const data = await response.json();

      if (data.error && data.alreadyCompleted) {
        resultBox.className = 'p-4 rounded-2xl border border-amber-300 bg-amber-50 text-xs space-y-1 text-amber-900';
        resultBox.innerHTML = `
          <div class="font-bold flex items-center gap-1.5">
            <i data-lucide="info" class="w-4 h-4 text-amber-700"></i> Already Completed
          </div>
          <p>${data.error}</p>
        `;
        return;
      }

      if (data.status === 'verified') {
        // Successful Verification
        resultBox.className = 'p-4 rounded-2xl border border-forest-300 bg-forest-50 text-xs space-y-2 text-forest-950';
        resultBox.innerHTML = `
          <div class="flex items-center justify-between">
            <div class="font-black text-forest-900 text-sm flex items-center gap-1.5">
              <span>✅ Challenge Verified!</span>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-forest-200 text-forest-900 font-extrabold text-[10px]">
              Confidence: ${data.assessment.confidence}
            </span>
          </div>
          <p class="text-slate-700 text-xs leading-relaxed">
            ${data.assessment.explanation}
          </p>
          <div class="pt-2 border-t border-forest-200 flex items-center justify-between text-xs font-bold text-forest-800">
            <span>Points Awarded:</span>
            <span class="text-sm font-black text-forest-900">+${data.awardedPoints} pts ${data.isBonusApplied ? '(2× Bonus Window Applied!)' : ''}</span>
          </div>
        `;

        // Trigger Confetti Celebration
        if (window.confetti) {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 }
          });
        }

        // Update local user state
        if (data.user) {
          state.user = data.user;
          updateDashboard();
        }

        renderChallengesGrid();
        loadLeaderboard();

      } else {
        // Pending Review or Rejected
        resultBox.className = 'p-4 rounded-2xl border border-amber-300 bg-amber-50 text-xs space-y-2 text-amber-950';
        resultBox.innerHTML = `
          <div class="font-black text-amber-900 text-sm flex items-center gap-1.5">
            <span>⏳ Submission Flagged for Community Review</span>
          </div>
          <p class="text-slate-700 text-xs leading-relaxed">
            ${data.assessment?.explanation || 'Visual evidence was inconclusive.'}
          </p>
          <div class="text-[11px] text-amber-800 italic">
            ${data.assessment?.reasonForReview || 'A community steward will review your submission shortly.'}
          </div>
        `;
      }
    } catch (err) {
      console.error('Error submitting verification:', err);
      resultBox.className = 'p-4 rounded-2xl border border-rose-200 bg-rose-50 text-xs text-rose-900 space-y-1';
      resultBox.innerHTML = `
        <div class="font-bold">Verification Service Exception</div>
        <p>Could not connect to the verification API route. Please verify that the server is running.</p>
      `;
    } finally {
      state.isSubmitting = false;
      btnSubmit.disabled = false;
      btnSubmitText.textContent = 'Submit for AI Assessment';
      if (window.lucide) lucide.createIcons();
    }
  });

  // 11. Fetch User Stats & Dashboard Progress
  async function loadUserStats() {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        state.user = await res.json();
        updateDashboard();
      }
    } catch (e) {
      console.warn('Could not load user stats:', e);
    }
  }

  function updateDashboard() {
    document.getElementById('header-user-points').textContent = state.user.totalPoints.toLocaleString();
    document.getElementById('dashboard-total-points').textContent = state.user.totalPoints.toLocaleString();
    document.getElementById('dashboard-completed-count').textContent = state.user.completedChallengesCount;
    document.getElementById('dashboard-streak').textContent = state.user.streakDays || 4;

    // Render Achievements
    const container = document.getElementById('achievements-container');
    if (container && state.user.achievements) {
      container.innerHTML = '';
      state.user.achievements.forEach(ach => {
        const badgeEl = document.createElement('div');
        badgeEl.className = `p-3 rounded-2xl border flex items-center gap-2.5 ${
          ach.earned ? 'bg-forest-50 border-forest-200 text-forest-950' : 'bg-cream-100 border-cream-300 text-slate-400 opacity-60'
        }`;
        badgeEl.innerHTML = `
          <div class="w-8 h-8 rounded-xl ${ach.earned ? 'bg-forest-600 text-white' : 'bg-slate-300 text-slate-500'} flex items-center justify-center font-bold text-xs">
            ${ach.earned ? '✓' : '🔒'}
          </div>
          <div>
            <div class="font-bold text-xs">${ach.title}</div>
            <div class="text-[10px] ${ach.earned ? 'text-forest-700' : 'text-slate-400'}">${ach.description}</div>
          </div>
        `;
        container.appendChild(badgeEl);
      });
    }
  }

  // 12. Leaderboard Management
  async function loadLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        state.leaderboardData = await res.json();
        renderLeaderboard();
      }
    } catch (e) {
      console.warn('Could not load leaderboard data:', e);
    }
  }

  const leadTbody = document.getElementById('leaderboard-tbody');

  function renderLeaderboard() {
    if (!state.leaderboardData) return;
    leadTbody.innerHTML = '';

    let list = [];
    if (state.activeLeaderboardView === 'global') {
      list = state.leaderboardData.global;
    } else if (state.activeLeaderboardView === 'local') {
      list = state.leaderboardData.local;
    } else if (state.activeLeaderboardView === 'category') {
      list = state.leaderboardData.category.cleanup;
    }

    list.forEach(item => {
      const tr = document.createElement('tr');
      tr.className = item.isUser
        ? 'bg-forest-50/80 font-bold text-forest-950'
        : 'hover:bg-cream-50 transition-colors text-slate-700';

      tr.innerHTML = `
        <td class="py-3 px-4">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
            item.rank === 1 ? 'bg-amber-400 text-slate-950' :
            item.rank === 2 ? 'bg-slate-300 text-slate-900' :
            item.rank === 3 ? 'bg-amber-700 text-white' :
            'bg-cream-200 text-slate-600'
          }">
            ${item.rank}
          </span>
        </td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2">
            <span>${item.name}</span>
            ${item.badge ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-cream-200 text-slate-600 font-semibold">${item.badge}</span>` : ''}
          </div>
        </td>
        <td class="py-3 px-4 text-slate-500 font-medium">
          ${item.region}
        </td>
        <td class="py-3 px-4 text-right font-black text-forest-800">
          ${item.points} pts
        </td>
      `;

      leadTbody.appendChild(tr);
    });
  }

  // Leaderboard Tab Switches
  const tabLeadGlobal = document.getElementById('tab-lead-global');
  const tabLeadLocal = document.getElementById('tab-lead-local');
  const tabLeadCategory = document.getElementById('tab-lead-category');

  tabLeadGlobal.addEventListener('click', () => {
    state.activeLeaderboardView = 'global';
    tabLeadGlobal.className = 'px-3.5 py-1.5 rounded-lg bg-white text-forest-900 shadow-xs font-bold';
    tabLeadLocal.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-forest-900 transition-colors';
    tabLeadCategory.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-forest-900 transition-colors';
    renderLeaderboard();
  });

  tabLeadLocal.addEventListener('click', () => {
    state.activeLeaderboardView = 'local';
    tabLeadLocal.className = 'px-3.5 py-1.5 rounded-lg bg-white text-forest-900 shadow-xs font-bold';
    tabLeadGlobal.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-forest-900 transition-colors';
    tabLeadCategory.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-forest-900 transition-colors';
    renderLeaderboard();
  });

  tabLeadCategory.addEventListener('click', () => {
    state.activeLeaderboardView = 'category';
    tabLeadCategory.className = 'px-3.5 py-1.5 rounded-lg bg-white text-forest-900 shadow-xs font-bold';
    tabLeadGlobal.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-forest-900 transition-colors';
    tabLeadLocal.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-forest-900 transition-colors';
    renderLeaderboard();
  });

  // 13. Model Info Modal
  const modelModal = document.getElementById('model-info-modal');
  document.getElementById('btn-open-model-info').addEventListener('click', () => modelModal.classList.remove('hidden'));
  document.getElementById('btn-close-model-info').addEventListener('click', () => modelModal.classList.add('hidden'));
  document.getElementById('btn-dismiss-model-info').addEventListener('click', () => modelModal.classList.add('hidden'));
  modelModal.addEventListener('click', (e) => {
    if (e.target === modelModal) modelModal.classList.add('hidden');
  });

  // Initial App Boot
  initMap(state.currentLocation.lat, state.currentLocation.lng);
  loadChallenges();
  loadUserStats();
  loadLeaderboard();
});
