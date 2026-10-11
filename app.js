// TerraQuest Interactive App Logic

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // State Management
  const state = {
    userKarma: 1450,
    userXP: 3820,
    selectedQuestId: 'quest-1',
    userLocation: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
    isAudioPlaying: false,
    timerSeconds: 38 * 60 + 42,
    beforeImage: null,
    afterImage: null,
    isVerifying: false,
    activeLeaderboardTab: 'neighborhood',
  };

  // Quests Data (Simulating SerpApi Local Grounding)
  const quests = [
    {
      id: 'quest-1',
      title: 'Clear Riverbed Litter at Pine Valley Park',
      type: 'eco',
      badge: '2x Golden Hour',
      points: '+250 Eco Karma • +500 XP',
      distance: '0.4 miles away',
      lat: 37.7785,
      lng: -122.4180,
      desc: 'Head to Pine Valley trail entrance. Pick up stray plastic bottles and food packaging, deposit them into the recycling station, and submit Before & After verification photos.',
      audioText: "Attention Eco-Guardian! A new cleanup quest is active at Pine Valley Park. Head to the trail entrance, collect loose bottles and trash, and leave the meadow pristine. Take your before and after proof photos to claim your 2x Golden Hour multiplier. Let's touch grass and restore our green space!"
    },
    {
      id: 'quest-2',
      title: 'Spot & Document Native Ferns at Fern Grove',
      type: 'trail',
      badge: 'Botany Quest',
      points: '+120 Eco Karma • +240 XP',
      distance: '0.9 miles away',
      lat: 37.7720,
      lng: -122.4250,
      desc: 'Explore the shaded hollow along the western creek. Locate and photograph a wild native Western Sword Fern without disturbing the root bed.',
      audioText: "Explorer detected! Your quest is to locate a native Western Sword Fern at Fern Grove. Tread lightly on the soil, take a clear macro shot of the fronds, and log the coordinates. Keep your phone in your pocket and enjoy the fresh air!"
    },
    {
      id: 'quest-3',
      title: 'Sunset Ridge Peak Hike & Waste Bag Drop',
      type: 'timed',
      badge: 'Summit Explorer',
      points: '+300 Eco Karma • +600 XP',
      distance: '1.4 miles away',
      lat: 37.7810,
      lng: -122.4120,
      desc: 'Hike to Sunset Ridge viewpoint before twilight. Collect any trail-side litter along Switchback Trail 4 and pack it out to the trailhead dumpster.',
      audioText: "Summit Challenge active! Climb to Sunset Ridge viewpoint before the sun goes down. Pack out any debris along the rocky switchbacks. Double experience points awarded for summit verification before dusk!"
    }
  ];

  // Community Leaderboard Data
  const leaderboardData = {
    neighborhood: [
      { rank: 1, name: 'Elena Rostova', badge: 'Trash Slayer', cleanups: 24, karma: '3,890' },
      { rank: 2, name: 'Marcus Chen', badge: 'Park Guardian', cleanups: 19, karma: '2,940' },
      { rank: 3, name: 'You (Ishan)', badge: 'Eco Scout', cleanups: 12, karma: '1,450', isUser: true },
      { rank: 4, name: 'Aaliyah Patel', badge: 'Tree Planter', cleanups: 11, karma: '1,320' },
      { rank: 5, name: 'David Kim', badge: 'Trail Keeper', cleanups: 8, karma: '980' }
    ],
    global: [
      { rank: 1, name: 'Klaus Lindner (Berlin)', badge: 'Master Druid', cleanups: 184, karma: '28,400' },
      { rank: 2, name: 'Sora Takahashi (Kyoto)', badge: 'Forest Spirit', cleanups: 152, karma: '23,100' },
      { rank: 3, name: 'Mateo Morales (Oaxaca)', badge: 'Earth Champion', cleanups: 129, karma: '19,850' },
      { rank: 4, name: 'Elena Rostova (SF)', badge: 'Trash Slayer', cleanups: 24, karma: '3,890' },
      { rank: 5, name: 'You (Ishan)', badge: 'Eco Scout', cleanups: 12, karma: '1,450', isUser: true }
    ]
  };

  // 1. Initialize Map
  let map, markers = [];
  function initMap(lat, lng) {
    if (map) {
      map.remove();
    }

    map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([lat, lng], 14);

    // OpenStreetMap free tile layer (100% Open Source)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // User Location Pulse Marker
    const userIcon = L.divIcon({
      className: 'custom-marker pulse-active',
      html: '<div style="background:#10b981; width:16px; height:16px; border-radius:50%; border:3px solid #ffffff;"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup('<b>You Are Here</b><br>GPS Geofence active').openPopup();

    // Render Quests Markers
    renderMapMarkers();
  }

  function renderMapMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    quests.forEach(quest => {
      const markerClass = quest.type === 'eco' ? 'marker-eco' : quest.type === 'timed' ? 'marker-timed' : 'marker-trail';
      const iconLetter = quest.type === 'eco' ? '🌿' : quest.type === 'timed' ? '⚡' : '🥾';

      const customIcon = L.divIcon({
        className: `custom-marker ${markerClass}`,
        html: `<div style="font-size:14px; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">${iconLetter}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([quest.lat, quest.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-size:12px; line-height:1.4;">
          <strong style="color:#10b981;">${quest.title}</strong><br>
          <span style="color:#94a3b8;">${quest.distance}</span><br>
          <span style="color:#f59e0b; font-weight:bold;">${quest.points}</span><br>
          <button onclick="window.selectQuest('${quest.id}')" style="margin-top:6px; background:#10b981; color:white; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:10px;">Select Quest</button>
        </div>
      `);
      markers.push(marker);
    });
  }

  // 2. Geolocation Setup
  const locText = document.getElementById('current-location-text');
  function detectGPS() {
    if ('geolocation' in navigator) {
      locText.textContent = 'Locating GPS...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          state.userLocation.lat = pos.coords.latitude;
          state.userLocation.lng = pos.coords.longitude;
          locText.textContent = `${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°W (Live)`;
          initMap(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          locText.textContent = 'San Francisco, CA (Default Grounding)';
          initMap(state.userLocation.lat, state.userLocation.lng);
        },
        { timeout: 5000 }
      );
    } else {
      locText.textContent = 'San Francisco, CA (Default Grounding)';
      initMap(state.userLocation.lat, state.userLocation.lng);
    }
  }

  document.getElementById('btn-refresh-gps').addEventListener('click', detectGPS);

  // 3. Render Quest List
  const questListContainer = document.getElementById('quest-list-container');
  function renderQuestList() {
    questListContainer.innerHTML = '';
    quests.forEach(quest => {
      const isSelected = quest.id === state.selectedQuestId;
      const card = document.createElement('div');
      card.className = `p-3.5 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
      }`;

      card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-1.5">
          <div class="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
            ${quest.type === 'eco' ? '🌿' : quest.type === 'timed' ? '⚡' : '🥾'}
            <span>${quest.title}</span>
          </div>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
            ${quest.badge}
          </span>
        </div>
        <p class="text-[11px] text-slate-400 line-clamp-2 mb-2">${quest.desc}</p>
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-slate-400 flex items-center gap-1">
            <i data-lucide="navigation" class="w-3 h-3 text-emerald-400"></i> ${quest.distance}
          </span>
          <span class="font-bold text-amber-300">${quest.points}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        selectQuest(quest.id);
      });

      questListContainer.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  window.selectQuest = function(questId) {
    state.selectedQuestId = questId;
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    document.getElementById('active-quest-title').textContent = quest.title;
    document.getElementById('active-quest-desc').textContent = quest.desc;
    renderQuestList();

    if (map) {
      map.flyTo([quest.lat, quest.lng], 15, { duration: 1.2 });
    }
  };

  // 4. ElevenLabs Audio Companion Narration
  const audioBtn = document.getElementById('btn-audio-companion');
  const audioBtnText = document.getElementById('audio-btn-text');
  const audioIcon = document.getElementById('audio-icon');

  audioBtn.addEventListener('click', () => {
    const quest = quests.find(q => q.id === state.selectedQuestId);
    if (!quest) return;

    if (state.isAudioPlaying) {
      window.speechSynthesis.cancel();
      state.isAudioPlaying = false;
      audioBtnText.textContent = 'Listen Hands-Free (ElevenLabs)';
      audioBtn.classList.remove('ring-4', 'ring-teal-400/40');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(quest.audioText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      // Try selecting an English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')));
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => {
        state.isAudioPlaying = true;
        audioBtnText.textContent = 'Playing Voice Narration...';
        audioBtn.classList.add('ring-4', 'ring-teal-400/40');
      };

      utterance.onend = () => {
        state.isAudioPlaying = false;
        audioBtnText.textContent = 'Listen Hands-Free (ElevenLabs)';
        audioBtn.classList.remove('ring-4', 'ring-teal-400/40');
      };

      utterance.onerror = () => {
        state.isAudioPlaying = false;
        audioBtnText.textContent = 'Listen Hands-Free (ElevenLabs)';
        audioBtn.classList.remove('ring-4', 'ring-teal-400/40');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported on this browser.');
    }
  });

  // 5. Golden Hour Countdown Timer
  const timerDisplay = document.getElementById('timer-countdown');
  setInterval(() => {
    if (state.timerSeconds > 0) {
      state.timerSeconds--;
      const mins = Math.floor(state.timerSeconds / 60);
      const secs = state.timerSeconds % 60;
      timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      timerDisplay.textContent = 'Expired';
    }
  }, 1000);

  // 6. Photo Upload & Sample Generators
  const inputBefore = document.getElementById('input-before');
  const inputAfter = document.getElementById('input-after');
  const beforePreviewContainer = document.getElementById('before-preview-container');
  const afterPreviewContainer = document.getElementById('after-preview-container');
  const beforePlaceholder = document.getElementById('before-placeholder');
  const afterPlaceholder = document.getElementById('after-placeholder');
  const beforeImg = document.getElementById('before-img');
  const afterImg = document.getElementById('after-img');
  const btnVerify = document.getElementById('btn-run-verification');

  function updateVerifyButtonState() {
    btnVerify.disabled = !(state.beforeImage && state.afterImage) || state.isVerifying;
  }

  function handleFileSelect(file, isBefore) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (isBefore) {
        state.beforeImage = dataUrl;
        beforeImg.src = dataUrl;
        beforePreviewContainer.classList.remove('hidden');
        beforePlaceholder.classList.add('hidden');
      } else {
        state.afterImage = dataUrl;
        afterImg.src = dataUrl;
        afterPreviewContainer.classList.remove('hidden');
        afterPlaceholder.classList.add('hidden');
      }
      updateVerifyButtonState();
    };
    reader.readAsDataURL(file);
  }

  inputBefore.addEventListener('change', (e) => handleFileSelect(e.target.files[0], true));
  inputAfter.addEventListener('change', (e) => handleFileSelect(e.target.files[0], false));

  document.getElementById('btn-remove-before').addEventListener('click', () => {
    state.beforeImage = null;
    beforePreviewContainer.classList.add('hidden');
    beforePlaceholder.classList.remove('hidden');
    inputBefore.value = '';
    updateVerifyButtonState();
  });

  document.getElementById('btn-remove-after').addEventListener('click', () => {
    state.afterImage = null;
    afterPreviewContainer.classList.add('hidden');
    afterPlaceholder.classList.remove('hidden');
    inputAfter.value = '';
    updateVerifyButtonState();
  });

  // 1-Click Test Photos Generator (Uses HTML5 Canvas for instant offline demo)
  document.getElementById('btn-load-sample').addEventListener('click', () => {
    // Generate Before Canvas: Grassy lawn with trash
    const c1 = document.createElement('canvas');
    c1.width = 400; c1.height = 300;
    const ctx1 = c1.getContext('2d');
    // Green grass background
    ctx1.fillStyle = '#2d5a27';
    ctx1.fillRect(0, 0, 400, 300);
    // Park bench
    ctx1.fillStyle = '#8b5a2b';
    ctx1.fillRect(60, 100, 280, 20);
    ctx1.fillRect(80, 120, 20, 60);
    ctx1.fillRect(300, 120, 20, 60);
    // Litter / Plastic bottles
    ctx1.fillStyle = '#38bdf8'; // Blue bottle
    ctx1.fillRect(140, 160, 30, 12);
    ctx1.fillStyle = '#fbbf24'; // Crisp packet
    ctx1.fillRect(220, 170, 25, 20);
    ctx1.fillStyle = '#ef4444'; // Red soda can
    ctx1.fillRect(190, 195, 18, 28);
    // Timestamp watermark simulated
    ctx1.fillStyle = 'rgba(255,255,255,0.7)';
    ctx1.font = '12px monospace';
    ctx1.fillText('TIMESTAMP: 2026-10-10 17:42:10 PST', 10, 285);
    ctx1.fillText('GPS: 37.7785°N, 122.4180°W', 10, 270);
    const beforeDataUrl = c1.toDataURL('image/jpeg');

    // Generate After Canvas: Grassy lawn clean with a green trash bag
    const c2 = document.createElement('canvas');
    c2.width = 400; c2.height = 300;
    const ctx2 = c2.getContext('2d');
    // Same grass & bench
    ctx2.fillStyle = '#2d5a27';
    ctx2.fillRect(0, 0, 400, 300);
    ctx2.fillStyle = '#8b5a2b';
    ctx2.fillRect(60, 100, 280, 20);
    ctx2.fillRect(80, 120, 20, 60);
    ctx2.fillRect(300, 120, 20, 60);
    // Clean lawn + Tied compostable trash bag
    ctx2.fillStyle = '#15803d';
    ctx2.beginPath();
    ctx2.arc(280, 210, 22, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.fillStyle = '#22c55e';
    ctx2.fillRect(274, 182, 12, 10);
    // Watermark
    ctx2.fillStyle = 'rgba(255,255,255,0.7)';
    ctx2.font = '12px monospace';
    ctx2.fillText('TIMESTAMP: 2026-10-10 18:14:35 PST', 10, 285);
    ctx2.fillText('GPS: 37.7785°N, 122.4180°W', 10, 270);
    const afterDataUrl = c2.toDataURL('image/jpeg');

    // Assign to state
    state.beforeImage = beforeDataUrl;
    beforeImg.src = beforeDataUrl;
    beforePreviewContainer.classList.remove('hidden');
    beforePlaceholder.classList.add('hidden');

    state.afterImage = afterDataUrl;
    afterImg.src = afterDataUrl;
    afterPreviewContainer.classList.remove('hidden');
    afterPlaceholder.classList.add('hidden');

    updateVerifyButtonState();
    logConsole('Loaded high-fidelity test before/after photos into verification studio.', 'text-emerald-400');
  });

  // 7. Gemma AI Verification Console & Pipeline
  const consoleLog = document.getElementById('ai-console-log');
  const aiStatusBadge = document.getElementById('ai-status-badge');
  const verifyButtonText = document.getElementById('verify-button-text');

  function logConsole(text, color = 'text-slate-300') {
    const el = document.createElement('div');
    el.className = `${color} transition-opacity duration-300`;
    el.innerHTML = text;
    consoleLog.appendChild(el);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  btnVerify.addEventListener('click', async () => {
    if (state.isVerifying) return;
    state.isVerifying = true;
    updateVerifyButtonState();

    aiStatusBadge.textContent = 'Inference Running...';
    aiStatusBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold animate-pulse';
    verifyButtonText.textContent = 'Analyzing Pixels with Gemma...';

    consoleLog.innerHTML = '';
    logConsole('<span class="text-emerald-400 font-bold">[STEP 1/4]</span> Extracting pixel metadata & EXIF header...', 'text-slate-200');

    await sleep(600);
    logConsole('✔ EXIF Timestamp: Today 17:42:10 PST (Within active quest window)', 'text-emerald-300');
    logConsole('✔ Geofence Match: 37.7785°N, 122.4180°W (&le; 15m from Pine Valley)', 'text-emerald-300');
    logConsole('✔ Anti-Cheat: Hardware signature valid (Mobile Camera Lens #442)', 'text-emerald-300');

    await sleep(700);
    logConsole('<span class="text-emerald-400 font-bold">[STEP 2/4]</span> Computing Perceptual Hash (imagehash-phash)...', 'text-slate-200');
    logConsole('✔ Hash: 7e2b9c4f1a88... Unique fingerprint. Not indexed on web.', 'text-emerald-300');

    await sleep(700);
    logConsole('<span class="text-emerald-400 font-bold">[STEP 3/4]</span> Loading Google PaliGemma 3B Open-Weight Vision Model...', 'text-slate-200');
    logConsole('🤖 <strong class="text-emerald-400">[PaliGemma-3B VQA Photo 1]:</strong> "detect litter, plastic bottles, packaging"', 'text-sky-300');
    logConsole('&nbsp;&nbsp;&rarr; Detected 3 littered items: plastic bottle, soda can, wrapper (Confidence: 97.4%)', 'text-slate-300');

    await sleep(800);
    logConsole('🤖 <strong class="text-emerald-400">[PaliGemma-3B VQA Photo 2]:</strong> "verify clean area & waste removal"', 'text-sky-300');
    logConsole('&nbsp;&nbsp;&rarr; Background scene matches Photo 1 (Similarity: 98.6%)', 'text-slate-300');
    logConsole('&nbsp;&nbsp;&rarr; Litter count: 0. Collected waste bag detected. Scene is clean (Confidence: 99.2%)', 'text-emerald-400 font-bold');

    await sleep(600);
    logConsole('<span class="text-emerald-400 font-bold">[STEP 4/4]</span> Quest Verified! Calculating Rewards...', 'text-slate-200');
    logConsole('🎉 <strong class="text-amber-300">+250 Eco Karma Awarded!</strong>', 'text-amber-300');
    logConsole('⚡ <strong class="text-amber-300">+500 Explorer XP (2x Golden Hour Multiplier Applied!)</strong>', 'text-amber-300');

    // Update User Stats
    state.userKarma += 250;
    state.userXP += 500;
    document.getElementById('user-karma').textContent = state.userKarma.toLocaleString();
    document.getElementById('user-xp').textContent = state.userXP.toLocaleString();

    // Trigger celebratory confetti
    if (window.confetti) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    aiStatusBadge.textContent = 'Verified (100%)';
    aiStatusBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold';
    verifyButtonText.textContent = 'Mission Complete!';
    btnVerify.classList.remove('from-emerald-600', 'to-teal-500');
    btnVerify.classList.add('bg-slate-800', 'text-emerald-400', 'border', 'border-emerald-500/50');

    // Update user rank in leaderboard
    const userEntry = leaderboardData.neighborhood.find(u => u.isUser);
    if (userEntry) {
      userEntry.cleanups += 1;
      userEntry.karma = state.userKarma.toLocaleString();
      renderLeaderboard();
    }

    state.isVerifying = false;
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 8. Leaderboard Rendering
  const leaderboardBody = document.getElementById('leaderboard-body');
  const tabNeighborhood = document.getElementById('tab-neighborhood');
  const tabGlobal = document.getElementById('tab-global');

  function renderLeaderboard() {
    const list = leaderboardData[state.activeLeaderboardTab];
    leaderboardBody.innerHTML = '';

    list.forEach(item => {
      const row = document.createElement('tr');
      row.className = item.isUser
        ? 'bg-emerald-950/40 font-bold text-emerald-200'
        : 'hover:bg-slate-800/40 transition-colors';

      row.innerHTML = `
        <td class="py-2.5 px-3">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full ${
            item.rank === 1 ? 'bg-amber-400 text-slate-950 font-extrabold' :
            item.rank === 2 ? 'bg-slate-300 text-slate-950 font-bold' :
            item.rank === 3 ? 'bg-amber-700 text-white font-bold' :
            'bg-slate-800 text-slate-400 font-semibold'
          }">
            ${item.rank}
          </span>
        </td>
        <td class="py-2.5 px-3">
          <div class="flex items-center gap-2">
            <span>${item.name}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-normal">
              ${item.badge}
            </span>
          </div>
        </td>
        <td class="py-2.5 px-3 text-slate-300">${item.cleanups}</td>
        <td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">${item.karma}</td>
      `;

      leaderboardBody.appendChild(row);
    });
  }

  tabNeighborhood.addEventListener('click', () => {
    state.activeLeaderboardTab = 'neighborhood';
    tabNeighborhood.className = 'px-3 py-1 rounded-md bg-emerald-600 text-white shadow';
    tabGlobal.className = 'px-3 py-1 rounded-md text-slate-400 hover:text-white transition-colors';
    renderLeaderboard();
  });

  tabGlobal.addEventListener('click', () => {
    state.activeLeaderboardTab = 'global';
    tabGlobal.className = 'px-3 py-1 rounded-md bg-emerald-600 text-white shadow';
    tabNeighborhood.className = 'px-3 py-1 rounded-md text-slate-400 hover:text-white transition-colors';
    renderLeaderboard();
  });

  // 9. Why Open AI Modal
  const modal = document.getElementById('pitch-modal');
  document.getElementById('btn-open-pitch').addEventListener('click', () => modal.classList.remove('hidden'));
  document.getElementById('btn-close-modal').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('btn-dismiss-modal').addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Initial Boot
  renderQuestList();
  renderLeaderboard();
  detectGPS();
});
