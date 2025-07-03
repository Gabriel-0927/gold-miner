window.onload = function() {
    // --- DOM 元素獲取 ---
    const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');
    const coinsEl = document.getElementById('coins'); const diamondsEl = document.getElementById('diamonds'); const timeEl = document.getElementById('time');
    const openShopBtn = document.getElementById('openShopBtn'); const openUpgradesBtn = document.getElementById('openUpgradesBtn'); const openBackpackBtn = document.getElementById('openBackpackBtn');
    const closeModalBtn = document.getElementById('closeModalBtn'); const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title'); const modalNav = document.getElementById('modal-nav'); const navClawsBtn = document.getElementById('nav-claws'); const navItemsBtn = document.getElementById('nav-items');
    const modalItemsContainer = document.getElementById('modal-items-container');
    const weatherStatusEl = document.getElementById('weather-status'); const weatherIconEl = document.getElementById('weather-icon'); const weatherNameEl = document.getElementById('weather-name'); const weatherTimeEl = document.getElementById('weather-time');
    const effectsStatusEl = document.getElementById('effects-status');
    const depthValueEl = document.getElementById('depth-value');
    const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn'); // 全螢幕按鈕

    // --- 資料庫 ---
    const CLAW_TYPES = [
        { id: 'standard', name: '標準鉤爪', description: '速度與力量的平衡之作。', cost: 0, properties: { speed: 5, weightBonus: 0, magneticRange: 0, rockDrillChance: 0, alchemyChance: 0 } },
        { id: 'fast', name: '快速鉤爪', description: '拉回速度極快，但力量較小。', cost: 1500, properties: { speed: 8, weightBonus: -1, magneticRange: 0, rockDrillChance: 0, alchemyChance: 0 } },
        { id: 'heavy', name: '強力鉤爪', description: '力量強大，但基礎速度稍慢。', cost: 2500, properties: { speed: 4, weightBonus: 3, magneticRange: 0, rockDrillChance: 0, alchemyChance: 0 } },
        { id: 'magnetic', name: '磁力鉤爪', description: '可小範圍吸附金屬礦物與寶箱。', cost: 4000, properties: { speed: 4.5, weightBonus: 1, magneticRange: 25, rockDrillChance: 0, alchemyChance: 0 } },
        { id: 'drill', name: '鑽頭鉤爪', description: '有25%機率直接鑽碎抓到的小石頭。', cost: 4500, properties: { speed: 5, weightBonus: 1, magneticRange: 0, rockDrillChance: 0.25, alchemyChance: 0 } },
        { id: 'alchemy', name: '煉金鉤爪', description: '有15%機率將抓到的石頭變成黃金。', cost: 6000, properties: { speed: 5, weightBonus: 0, magneticRange: 0, rockDrillChance: 0, alchemyChance: 0.15 } }
    ];
    const UPGRADE_TYPES = [ { id: 'goldBoost', name: '淘金熱', description: '永久增加所有來源獲得的金幣數量。', maxLevel: 50, costFormula: (level) => 100 + level * 150, getEffectText: (level) => `效果: +${level * 2}% 金幣`, currency: 'coin' }, { id: 'rarityBoost', name: '地質勘探', description: '增加稀有礦物（黃金、鑽石）的出現機率。', maxLevel: 20, costFormula: (level) => 300 + level * 250, getEffectText: (level) => `效果: 稀有度提升`, currency: 'coin' }, { id: 'mineDepth', name: '礦坑深化', description: '使用鑽石增加開採深度，提升稀有礦物出現率與礦物總量。', maxLevel: 10, costFormula: (level) => 1 + level, getEffectText: (level) => `目前深度: ${level * 10} 公尺`, currency: 'diamond' } ];
    const WEATHER_TYPES = [ { id: 'sunshine', name: '陽光普照', icon: '☀️', duration: 20, effect: { goldValueMultiplier: 1.5 }, description: '所有黃金價值提升50%！' }, { id: 'rainy', name: '下雨', icon: '🌧️', duration: 15, effect: { clawSpeedMultiplier: 1.3 }, description: '地面濕滑，爪子移動速度加快！' }, { id: 'windy', name: '大風', icon: '💨', duration: 25, effect: { swingSpeedMultiplier: 1.8 }, description: '鉤爪擺動得更快了！' }, { id: 'diamond_rush', name: '鑽石雨', icon: '💎', duration: 10, effect: { diamondChanceBonus: 0.15 }, description: '地底深處的鑽石浮現了！' } ];
    const CONSUMABLE_TYPES = { 'goldPotion': { name: '金錢藥水', icon: '💰', description: '在30秒內，獲得的所有金幣翻倍。', cost: 750, effect: { type: 'goldMultiplier', value: 2, duration: 30 } }, 'speedPotion': { name: '速度藥水', icon: '⚡️', description: '在20秒內，鉤爪的移動速度大幅提升。', cost: 500, effect: { type: 'clawSpeedMultiplier', value: 1.5, duration: 20 } }, 'autoClawPotion': { name: '自動鉤爪', icon: '🤖', description: '自動進行3次精準抓取，專門瞄準高價值物品。', cost: 1000, effect: { type: 'autoClaw', value: 3 } }, 'timePotion': { name: '時間藥水', icon: '⏰', description: '立即為本回合增加15秒的時間。', cost: 600, effect: { type: 'addTime', value: 15 } }, 'sceneRefreshBomb': { name: '場景刷新彈', icon: '🔄', description: '立即清除並重新生成場上的所有礦物。', cost: 800, effect: { type: 'refreshScene' } } };
    const DOG_UPGRADE = { id: 'passiveIncomeDog', name: '忠實的夥伴', maxLevel: 100, incomePerLevel: 1, costFormula: (level) => 50 + Math.floor(Math.pow(level, 1.8) * 50), getEffectText: (level) => `被動收入: +${level * 1} 金幣/秒` };
    const DOG_POSITION = { x: canvas.width - 60, y: 100 };
    const DOG_EMOJI_SIZE = 40;
    const DOG_CLICK_AREA = { x: DOG_POSITION.x - DOG_EMOJI_SIZE / 2, y: DOG_POSITION.y - DOG_EMOJI_SIZE / 2, width: DOG_EMOJI_SIZE, height: DOG_EMOJI_SIZE };

    // --- 存檔系統 ---
    const SAVE_KEY = 'goldMinerSaveData';
    let playerProgress = { coins: 0, diamonds: 0, ownedClaws: ['standard'], equippedClaw: 'standard', goldBoostLevel: 0, rarityBoostLevel: 0, mineDepthLevel: 0, dogLevel: 0, items: {} };

    // --- 遊戲狀態 ---
    let timeLeft = 60; let isGamePaused = false; let items = []; let animations = [];
    let currentWeather = null; let weatherTimer = 0;
    let activeEffects = [];
    let claw = { x: canvas.width / 2, y: 70, angle: Math.PI * 0.25, length: 20, swingSpeed: 0.02, state: 'swinging', target: null, speed: 5, weightBonus: 0, magneticRange: 0, rockDrillChance: 0, alchemyChance: 0 };
    let autoClawGrabsLeft = 0; let autoClawTarget = null;
    const EXPLOSION_RADIUS = 80; const ANIMATION_DURATION = 30;
    
    // --- 輔助函式 ---
    function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(playerProgress)); } catch (e) { console.error('無法儲存遊戲進度:', e); } }
    function loadGame() { try { const savedData = localStorage.getItem(SAVE_KEY); if (savedData) { const loadedProgress = JSON.parse(savedData); playerProgress = { ...playerProgress, ...loadedProgress }; } } catch (e) { console.error('無法載入遊戲進度:', e); } }
    function openModal(type) { isGamePaused = true; modalNav.style.display = 'none'; if (type === 'shop') { modalTitle.textContent = '商店'; modalNav.style.display = 'flex'; navClawsBtn.classList.add('active'); navItemsBtn.classList.remove('active'); renderClawShop(); } else if (type === 'upgrades') { modalTitle.textContent = '永久升級'; renderUpgradeShop(); } else if (type === 'backpack') { modalTitle.textContent = '我的背包'; renderBackpack(); } else if (type === 'dogUpgrade') { modalTitle.textContent = '升級夥伴'; renderDogUpgradeModal(); } modal.classList.remove('hidden'); }
    function closeModal() { isGamePaused = false; modal.classList.add('hidden'); }
    function renderClawShop() { modalItemsContainer.innerHTML = ''; CLAW_TYPES.forEach(clawType => { const itemDiv = document.createElement('div'); itemDiv.className = 'shop-item'; const owned = playerProgress.ownedClaws.includes(clawType.id); const equipped = playerProgress.equippedClaw === clawType.id; let buttonHtml = ''; if (equipped) { buttonHtml = `<button class="equipped-btn" disabled>已裝備</button>`; } else if (owned) { buttonHtml = `<button class="equip-btn" data-claw-id="${clawType.id}">裝備</button>`; } else { buttonHtml = `<button class="buy-btn" data-claw-id="${clawType.id}" ${playerProgress.coins < clawType.cost ? 'disabled' : ''}>購買</button>`; } itemDiv.innerHTML = `<h3>${clawType.name}</h3><p>${clawType.description}</p><div class="price">${clawType.cost > 0 ? `💰 ${clawType.cost}` : '免費'}</div>${buttonHtml}`; modalItemsContainer.appendChild(itemDiv); }); }
    function renderUpgradeShop() { modalItemsContainer.innerHTML = ''; UPGRADE_TYPES.forEach(upgrade => { const itemDiv = document.createElement('div'); itemDiv.className = 'shop-item shop-item-upgrade'; const level = playerProgress[upgrade.id + 'Level']; const cost = upgrade.costFormula(level); let canAfford = false; let currencySymbol = '💰'; if (upgrade.currency === 'diamond') { canAfford = playerProgress.diamonds >= cost; currencySymbol = '💎'; } else { canAfford = playerProgress.coins >= cost; } const isMaxLevel = level >= upgrade.maxLevel; let buttonHtml = ''; if (isMaxLevel) { buttonHtml = `<button class="equipped-btn" disabled>已達最高等級</button>`; } else { buttonHtml = `<button class="buy-btn" data-upgrade-id="${upgrade.id}" ${canAfford ? '' : 'disabled'}>升級</button>`; } itemDiv.innerHTML = `<h3>${upgrade.name}</h3><div class="level">等級: ${level} / ${upgrade.maxLevel}</div><p>${upgrade.description}<br><b>${upgrade.getEffectText(level)}</b></p><div class="price">${isMaxLevel ? '---' : `${currencySymbol} ${cost}`}</div>${buttonHtml}`; modalItemsContainer.appendChild(itemDiv); }); }
    function renderDogUpgradeModal() { modalItemsContainer.innerHTML = ''; const itemDiv = document.createElement('div'); itemDiv.className = 'shop-item shop-item-upgrade'; const level = playerProgress.dogLevel; const cost = DOG_UPGRADE.costFormula(level); const canAfford = playerProgress.coins >= cost; const isMaxLevel = level >= DOG_UPGRADE.maxLevel; let buttonHtml = ''; if (isMaxLevel) { buttonHtml = `<button class="equipped-btn" disabled>已達最高等級</button>`; } else { buttonHtml = `<button class="buy-btn" data-upgrade-id="dog" ${canAfford ? '' : 'disabled'}>升級</button>`; } itemDiv.innerHTML = `<h3>🐶 ${DOG_UPGRADE.name}</h3><div class="level">等級: ${level} / ${DOG_UPGRADE.maxLevel}</div><p>忠誠的夥伴會為您持續帶來收入。<br><b>${DOG_UPGRADE.getEffectText(level)}</b></p><div class="price">${isMaxLevel ? '---' : `💰 ${cost}`}</div>${buttonHtml}`; modalItemsContainer.appendChild(itemDiv); }
    function renderConsumableShop() { modalItemsContainer.innerHTML = ''; Object.keys(CONSUMABLE_TYPES).forEach(itemId => { const item = CONSUMABLE_TYPES[itemId]; const itemDiv = document.createElement('div'); itemDiv.className = 'shop-item'; const canAfford = playerProgress.coins >= item.cost; itemDiv.innerHTML = `<h3>${item.icon} ${item.name}</h3><p>${item.description}</p><div class="price">💰 ${item.cost}</div><button class="buy-btn" data-item-id="${itemId}" ${canAfford ? '' : 'disabled'}>購買</button>`; modalItemsContainer.appendChild(itemDiv); }); }
    function renderBackpack() { modalItemsContainer.innerHTML = ''; const playerItems = playerProgress.items; let hasItems = false; Object.keys(playerItems).forEach(itemId => { const count = playerItems[itemId]; if (count > 0) { hasItems = true; const itemData = CONSUMABLE_TYPES[itemId]; const itemDiv = document.createElement('div'); itemDiv.className = 'shop-item'; itemDiv.innerHTML = `<h3>${itemData.icon} ${itemData.name}</h3><p>數量: ${count}</p><button class="use-btn" data-item-id="${itemId}">使用</button>`; modalItemsContainer.appendChild(itemDiv); } }); if (!hasItems) { modalItemsContainer.innerHTML = '<p>背包是空的！</p>'; } }
    function calculateGainedValue(baseValue, itemType = null) { let multiplier = 1; if (currentWeather && currentWeather.effect.goldValueMultiplier && ['gold', 'ruby', 'emerald'].includes(itemType)) { multiplier *= currentWeather.effect.goldValueMultiplier; } activeEffects.forEach(effect => { if (effect.type === 'goldMultiplier') { multiplier *= effect.value; } }); const boost = 1 + playerProgress.goldBoostLevel * 0.02; return Math.round(baseValue * boost * multiplier); }
    function buyClaw(clawId) { const clawType = CLAW_TYPES.find(c => c.id === clawId); if (!clawType || playerProgress.coins < clawType.cost) return; playerProgress.coins -= clawType.cost; playerProgress.ownedClaws.push(clawId); updateCurrencyUI(); saveGame(); renderClawShop(); }
    function buyUpgrade(upgradeId) { const upgrade = UPGRADE_TYPES.find(u => u.id === upgradeId); if (!upgrade) return; const levelKey = upgrade.id + 'Level'; const currentLevel = playerProgress[levelKey]; if (currentLevel >= upgrade.maxLevel) return; const cost = upgrade.costFormula(currentLevel); if (upgrade.currency === 'diamond') { if (playerProgress.diamonds < cost) return; playerProgress.diamonds -= cost; } else { if (playerProgress.coins < cost) return; playerProgress.coins -= cost; } playerProgress[levelKey]++; updateCurrencyUI(); updateDepthUI(); saveGame(); renderUpgradeShop(); }
    function buyDogUpgrade() { const level = playerProgress.dogLevel; if (level >= DOG_UPGRADE.maxLevel) return; const cost = DOG_UPGRADE.costFormula(level); if (playerProgress.coins < cost) return; playerProgress.coins -= cost; playerProgress.dogLevel++; updateCurrencyUI(); saveGame(); renderDogUpgradeModal(); }
    function buyConsumable(itemId) { const item = CONSUMABLE_TYPES[itemId]; if (!item || playerProgress.coins < item.cost) return; playerProgress.coins -= item.cost; playerProgress.items[itemId] = (playerProgress.items[itemId] || 0) + 1; updateCurrencyUI(); saveGame(); renderConsumableShop(); }
    function useConsumable(itemId) { if (!playerProgress.items[itemId] || playerProgress.items[itemId] <= 0) return; playerProgress.items[itemId]--; const effectData = CONSUMABLE_TYPES[itemId].effect; if (effectData.type === 'addTime') { timeLeft += effectData.value; timeEl.innerText = timeLeft; createValueTextAnimation(canvas.width / 2, 120, `+${effectData.value}秒!`); } else if (effectData.type === 'autoClaw') { autoClawGrabsLeft += effectData.value; } else if (effectData.type === 'refreshScene') { refreshItemsOnField(); createValueTextAnimation(canvas.width / 2, 120, '場景已刷新!'); } else { const existingEffect = activeEffects.find(e => e.type === effectData.type); if (existingEffect) { existingEffect.timeLeft += effectData.duration; } else { activeEffects.push({ ...effectData, timeLeft: effectData.duration }); } } saveGame(); closeModal(); updateEffectsUI(); }
    function equipClaw(clawId) { playerProgress.equippedClaw = clawId; applyEquippedClaw(); saveGame(); renderClawShop(); }
    function applyEquippedClaw() { const equippedClawData = CLAW_TYPES.find(c => c.id === playerProgress.equippedClaw); if (equippedClawData) { Object.assign(claw, equippedClawData.properties); } }
    function updateDepthUI() { if (depthValueEl) { depthValueEl.textContent = playerProgress.mineDepthLevel * 10; } }
    function updateCurrencyUI() { coinsEl.innerText = playerProgress.coins; diamondsEl.innerText = playerProgress.diamonds; }
    function triggerExplosion(explosionX, explosionY) { createExplosionAnimation(explosionX, explosionY, EXPLOSION_RADIUS); for (let i = items.length - 1; i >= 0; i--) { const item = items[i]; const distance = Math.sqrt(Math.pow(explosionX - item.x, 2) + Math.pow(explosionY - item.y, 2)); if (distance < EXPLOSION_RADIUS) { if (item.value && item.currency === 'coin') { playerProgress.coins += calculateGainedValue(item.value, item.type); } else if (item.value && item.currency === 'diamond') { playerProgress.diamonds += item.value; } items.splice(i, 1); } } updateCurrencyUI(); saveGame(); if (claw.state === 'extending') { claw.state = 'retracting'; claw.target = null; } }
    function refreshItemsOnField() { items = []; animations = []; claw.target = null; claw.state = 'swinging'; claw.length = 20; generateItems(); }
    function generateItems() { items = []; const depthLevel = playerProgress.mineDepthLevel; const itemCount = Math.floor(Math.random() * 5) + 8 + depthLevel; const totalRarityLevel = playerProgress.rarityBoostLevel + (depthLevel * 2); let emeraldChance = (depthLevel >= 10) ? totalRarityLevel * 0.004 : 0; let rubyChance = (depthLevel >= 5) ? totalRarityLevel * 0.006 : 0; let diamondChance = totalRarityLevel * 0.005; if (currentWeather && currentWeather.effect.diamondChanceBonus) { diamondChance += currentWeather.effect.diamondChanceBonus; } const bombChance = 0.1; const dynamiteChance = 0.1; const chestChance = 0.05; const goldChanceInRocks = 0.4 + totalRarityLevel * 0.01; for (let i = 0; i < itemCount; i++) { const randomType = Math.random(); let item; const x = Math.random() * (canvas.width - 80) + 40; const y = Math.random() * (canvas.height - 300) + 150; if (randomType < emeraldChance) { item = { type: 'emerald', size: 18, value: 1200, currency: 'coin', weight: 4 }; } else if (randomType < emeraldChance + rubyChance) { item = { type: 'ruby', size: 16, value: 600, currency: 'coin', weight: 3 }; } else if (randomType < emeraldChance + rubyChance + diamondChance) { item = { type: 'diamond', size: 15, value: 1, currency: 'diamond', weight: 3 }; } else if (randomType < emeraldChance + rubyChance + diamondChance + bombChance) { item = { type: 'bomb', size: 20, weight: 1 }; } else if (randomType < emeraldChance + rubyChance + diamondChance + bombChance + dynamiteChance) { item = { type: 'dynamite', size: 25, weight: 1 }; } else if (randomType < emeraldChance + rubyChance + diamondChance + bombChance + dynamiteChance + chestChance) { item = { type: 'chest', size: 30, weight: 4 }; } else { const isGold = Math.random() < goldChanceInRocks; const size = Math.random() * 20 + 15; item = { type: isGold ? 'gold' : 'rock', size: size, value: isGold ? Math.round(size * 5) : Math.round(size * 0.5), currency: 'coin', weight: isGold ? Math.round(size / 10) : Math.round(size / 5) }; } item.x = x; item.y = y; items.push(item); } }

    function resetScene() {
        timeLeft = 60;
        timeEl.innerText = timeLeft;
        claw.state = 'swinging';
        claw.target = null;
        claw.length = 20;
        items = [];
        animations = [];
        stopWeather();
        autoClawTarget = null;
        updateEffectsUI();
        generateItems();
    }

    // --- 全螢幕處理函式 (修正版) ---
    function toggleFullscreen() {
        const gameWrapper = document.querySelector('.game-wrapper');

        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (gameWrapper.requestFullscreen) {
                gameWrapper.requestFullscreen();
            } else if (gameWrapper.webkitRequestFullscreen) {
                gameWrapper.webkitRequestFullscreen();
            } else if (gameWrapper.msRequestFullscreen) {
                gameWrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    function handleFullscreenChange() {
        const gameWrapper = document.querySelector('.game-wrapper');
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            gameWrapper.classList.add('fullscreen-mode');
            toggleFullscreenBtn.textContent = '離開全螢幕';
        } else {
            gameWrapper.classList.remove('fullscreen-mode');
            toggleFullscreenBtn.textContent = '全螢幕';
        }
    }

    // --- 事件監聽 ---
    openShopBtn.addEventListener('click', () => openModal('shop'));
    openUpgradesBtn.addEventListener('click', () => openModal('upgrades'));
    openBackpackBtn.addEventListener('click', () => openModal('backpack'));
    closeModalBtn.addEventListener('click', closeModal);
    modalNav.addEventListener('click', e => { if (e.target.id === 'nav-claws') { navClawsBtn.classList.add('active'); navItemsBtn.classList.remove('active'); renderClawShop(); } else if (e.target.id === 'nav-items') { navItemsBtn.classList.add('active'); navClawsBtn.classList.remove('active'); renderConsumableShop(); } });
    modalItemsContainer.addEventListener('click', e => { const targetButton = e.target.closest('button'); if (!targetButton) return; const clawId = targetButton.dataset.clawId; const upgradeId = targetButton.dataset.upgradeId; const itemId = targetButton.dataset.itemId; if (targetButton.classList.contains('buy-btn')) { if (clawId) { buyClaw(clawId); } else if (upgradeId === 'dog') { buyDogUpgrade(); } else if (upgradeId) { buyUpgrade(upgradeId); } else if (itemId) { buyConsumable(itemId); } } else if (targetButton.classList.contains('equip-btn') && clawId) { equipClaw(clawId); } else if (targetButton.classList.contains('use-btn') && itemId) { useConsumable(itemId); } });
    window.addEventListener('keydown', function(e) { if (isGamePaused || autoClawGrabsLeft > 0) return; if ((e.code === 'Space' || e.code === 'ArrowDown') && claw.state === 'swinging') { claw.state = 'extending'; } });
    window.addEventListener('beforeunload', saveGame);
    
    // --- 手機觸控與滑鼠點擊座標轉換 ---
    function getCanvasCoordinates(event) {
        const rect = canvas.getBoundingClientRect();
        let eventX, eventY;

        if (event.touches && event.touches.length > 0) {
            eventX = event.touches[0].clientX;
            eventY = event.touches[0].clientY;
        } else {
            eventX = event.clientX;
            eventY = event.clientY;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const canvasX = (eventX - rect.left) * scaleX;
        const canvasY = (eventY - rect.top) * scaleY;
        return { x: canvasX, y: canvasY };
    }

    function handleCanvasInteraction(event) {
        if (isGamePaused) return;
        event.preventDefault();

        const { x: clickX, y: clickY } = getCanvasCoordinates(event);

        if (clickX >= DOG_CLICK_AREA.x && clickX <= DOG_CLICK_AREA.x + DOG_CLICK_AREA.width &&
            clickY >= DOG_CLICK_AREA.y && clickY <= DOG_CLICK_AREA.y + DOG_CLICK_AREA.height) {
            openModal('dogUpgrade');
            return;
        }

        if (autoClawGrabsLeft <= 0 && claw.state === 'swinging') {
            claw.state = 'extending';
        }
    }

    canvas.addEventListener('click', handleCanvasInteraction);
    canvas.addEventListener('touchstart', handleCanvasInteraction);

    // --- 全螢幕事件監聽 ---
    toggleFullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    
    // --- 動畫與繪圖 ---
    function createValueTextAnimation(x, y, text) { animations.push({ type: 'valueText', x: x, y: y, text: text, life: 60, duration: 60, vy: -1 }); }
    function createExplosionAnimation(x, y, radius) { animations.push({ type: 'explosion', x: x, y: y, maxRadius: radius, currentRadius: 0, life: ANIMATION_DURATION, duration: ANIMATION_DURATION }); }
    function drawDog() { const x = DOG_POSITION.x; const y = DOG_POSITION.y; ctx.font = `${DOG_EMOJI_SIZE}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🐕', x, y); if (playerProgress.dogLevel > 0) { ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillStyle = 'gold'; ctx.strokeStyle = 'black'; ctx.lineWidth = 2; const text = `+${playerProgress.dogLevel * DOG_UPGRADE.incomePerLevel}💰/s`; const textY = y - DOG_EMOJI_SIZE / 2 - 10; ctx.strokeText(text, x, textY); ctx.fillText(text, x, textY); } }
    function draw() { ctx.clearRect(0, 0, canvas.width, canvas.height); const skyGradient = ctx.createLinearGradient(0, 0, 0, 150); skyGradient.addColorStop(0, '#87CEEB'); skyGradient.addColorStop(1, '#B0E0E6'); ctx.fillStyle = skyGradient; ctx.fillRect(0, 0, canvas.width, 100); const depthLevel = playerProgress.mineDepthLevel; const maxDepthLevel = UPGRADE_TYPES.find(u => u.id === 'mineDepth').maxLevel; const progress = Math.min(depthLevel / maxDepthLevel, 1); const startR = 210, startG = 180, startB = 140; const endR = 107, endG = 79, endB = 56; const r = Math.round(startR + (endR - startR) * progress); const g = Math.round(startG + (endG - startG) * progress); const b = Math.round(startB + (endB - startB) * progress); ctx.fillStyle = `rgb(${r}, ${g}, ${b})`; ctx.fillRect(0, 100, canvas.width, canvas.height - 100); drawDog(); ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; for (let i = 0; i < 50; i++) { ctx.beginPath(); ctx.arc(Math.random() * canvas.width, 100 + Math.random() * (canvas.height - 100), Math.random() * 3, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = '#8B4513'; ctx.fillRect(canvas.width / 2 - 25, 70, 50, 30); items.forEach(item => drawItem(item.x, item.y, item)); const endX = claw.x + Math.cos(claw.angle) * claw.length; const endY = claw.y + Math.sin(claw.angle) * claw.length; ctx.strokeStyle = '#3D2314'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(claw.x, claw.y); ctx.lineTo(endX, endY); ctx.stroke(); ctx.fillStyle = '#3D2314'; ctx.beginPath(); ctx.arc(endX, endY, 10, 0, Math.PI * 2); ctx.fill(); if (claw.target) { drawItem(claw.target.x, claw.target.y, claw.target); } animations.forEach(anim => { ctx.save(); if (anim.type === 'explosion') { ctx.fillStyle = `rgba(255, 165, 0, ${anim.life / anim.duration})`; ctx.beginPath(); ctx.arc(anim.x, anim.y, anim.currentRadius, 0, Math.PI * 2); ctx.fill(); } else if (anim.type === 'valueText') { ctx.font = 'bold 20px "Press Start 2P"'; ctx.fillStyle = `rgba(255, 215, 0, ${anim.life / anim.duration})`; ctx.strokeStyle = `rgba(0, 0, 0, ${anim.life / anim.duration})`; ctx.textAlign = 'center'; ctx.lineWidth = 2; ctx.strokeText(anim.text, anim.x, anim.y); ctx.fillText(anim.text, anim.x, anim.y); } ctx.restore(); }); }
    function drawItem(x, y, item) { if (item.type === 'chest') { ctx.fillStyle = '#8B4513'; ctx.fillRect(x - item.size / 2, y - item.size / 2, item.size, item.size); ctx.fillStyle = '#DAA520'; ctx.fillRect(x - item.size / 2 - 2, y - item.size * 0.1, item.size + 4, 5); ctx.beginPath(); ctx.arc(x, y + 2, 4, 0, Math.PI * 2); ctx.fill(); } else if (item.type === 'diamond') { ctx.fillStyle = '#B9F2FF'; ctx.strokeStyle = '#82E0F2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - item.size); ctx.lineTo(x + item.size * 0.8, y - item.size * 0.2); ctx.lineTo(x + item.size * 0.5, y + item.size * 0.8); ctx.lineTo(x - item.size * 0.5, y + item.size * 0.8); ctx.lineTo(x - item.size * 0.8, y - item.size * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke(); } else if (item.type === 'ruby') { ctx.fillStyle = '#E0115F'; ctx.strokeStyle = '#9B111E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - item.size * 0.8); ctx.lineTo(x + item.size, y); ctx.lineTo(x, y + item.size * 0.8); ctx.lineTo(x - item.size, y); ctx.closePath(); ctx.fill(); ctx.stroke(); } else if (item.type === 'emerald') { ctx.fillStyle = '#50C878'; ctx.strokeStyle = '#009B77'; ctx.lineWidth = 2; ctx.fillRect(x - item.size * 0.6, y - item.size * 0.6, item.size * 1.2, item.size * 1.2); ctx.strokeRect(x - item.size * 0.6, y - item.size * 0.6, item.size * 1.2, item.size * 1.2); } else if (item.type === 'bomb') { ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(x, y, item.size, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#666'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, item.size * 0.8, 0, Math.PI * 2); ctx.stroke(); } else if (item.type === 'dynamite') { ctx.fillStyle = 'red'; ctx.fillRect(x - item.size / 2, y - item.size, item.size, item.size * 2); ctx.fillStyle = 'black'; ctx.font = '12px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('TNT', x, y + 4); } else { ctx.fillStyle = item.type === 'gold' ? 'gold' : 'grey'; ctx.beginPath(); ctx.arc(x, y, item.size, 0, Math.PI * 2); ctx.fill(); } }
    
    // --- 天氣與效果系統 ---
    function startWeather(weather) { currentWeather = weather; weatherTimer = weather.duration; weatherStatusEl.classList.remove('hidden'); weatherIconEl.textContent = weather.icon; weatherNameEl.textContent = weather.name; weatherTimeEl.textContent = weatherTimer; createValueTextAnimation(canvas.width / 2, 80, weather.description); if (weather.id === 'diamond_rush') { refreshItemsOnField(); } }
    function stopWeather() { currentWeather = null; weatherTimer = 0; weatherStatusEl.classList.add('hidden'); }
    function handleWeatherTick() { if (isGamePaused) return; if (currentWeather) { weatherTimer--; weatherTimeEl.textContent = weatherTimer; if (weatherTimer <= 0) { stopWeather(); } } else { if (Math.random() < 0.1) { const randomWeather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)]; startWeather(randomWeather); } } }
    function updateEffectsUI() { effectsStatusEl.innerHTML = ''; if (autoClawGrabsLeft > 0) { const effectDiv = document.createElement('div'); effectDiv.className = 'effect-item'; const itemData = CONSUMABLE_TYPES['autoClawPotion']; effectDiv.innerHTML = `<span>${itemData.icon}</span> <span>${itemData.name} (剩餘 ${autoClawGrabsLeft} 次)</span>`; effectsStatusEl.appendChild(effectDiv); } activeEffects.forEach(effect => { const itemData = Object.values(CONSUMABLE_TYPES).find(i => i.effect.type === effect.type); if (itemData) { const effectDiv = document.createElement('div'); effectDiv.className = 'effect-item'; effectDiv.innerHTML = `<span>${itemData.icon}</span> <span>${itemData.name} (${effect.timeLeft}s)</span>`; effectsStatusEl.appendChild(effectDiv); } }); }
    function updateActiveEffects() { if (activeEffects.length === 0) return; for (let i = activeEffects.length - 1; i >= 0; i--) { activeEffects[i].timeLeft--; if (activeEffects[i].timeLeft <= 0) { activeEffects.splice(i, 1); } } updateEffectsUI(); }
    
    function getTargetPriority(item) { switch (item.type) { case 'chest': return 5000; case 'emerald': return 4000; case 'ruby': return 3000; case 'diamond': return 2000; case 'gold': return item.value; default: return 0; } }

    // --- 核心更新函式 ---
    function update() {
        if (isGamePaused) return;
        for (let i = animations.length - 1; i >= 0; i--) { const anim = animations[i]; anim.life--; if (anim.type === 'explosion') { anim.currentRadius = anim.maxRadius * (1 - (anim.life / anim.duration)); } else if (anim.type === 'valueText') { anim.y += anim.vy; } if (anim.life <= 0) { animations.splice(i, 1); } }
        if (claw.state === 'paralyzed') return;
        
        let currentSwingSpeed = claw.swingSpeed; if (currentWeather && currentWeather.effect.swingSpeedMultiplier) { currentSwingSpeed *= currentWeather.effect.swingSpeedMultiplier; }
        let currentClawSpeed = claw.speed;
        if (currentWeather && currentWeather.effect.clawSpeedMultiplier) { currentClawSpeed *= currentWeather.effect.clawSpeedMultiplier; }
        activeEffects.forEach(effect => { if (effect.type === 'clawSpeedMultiplier') { currentClawSpeed *= effect.value; } });

        if (claw.state === 'swinging') { 
            claw.angle += currentSwingSpeed;
            if (claw.angle > Math.PI * 0.95 || claw.angle < Math.PI * 0.05) { claw.swingSpeed *= -1; }
            if (autoClawGrabsLeft > 0) {
                if (!autoClawTarget) { const goodItems = items.filter(item => getTargetPriority(item) > 0); if (goodItems.length > 0) { goodItems.sort((a, b) => getTargetPriority(b) - getTargetPriority(a)); autoClawTarget = goodItems[0]; } }
                if (autoClawTarget) { const targetAngle = Math.atan2(autoClawTarget.y - claw.y, autoClawTarget.x - claw.x); const angleDifference = Math.abs(claw.angle - targetAngle); if (angleDifference < 0.05) { claw.state = 'extending'; } }
            }
        }
        else if (claw.state === 'extending') {
            claw.length += currentClawSpeed;
            const endX = claw.x + Math.cos(claw.angle) * claw.length;
            const endY = claw.y + Math.sin(claw.angle) * claw.length;

            let grabbedItem = null;
            if (claw.magneticRange > 0) {
                for (let i = items.length - 1; i >= 0; i--) { const item = items[i]; if (['gold', 'chest'].includes(item.type)) { const distance = Math.sqrt(Math.pow(endX - item.x, 2) + Math.pow(endY - item.y, 2)); if (distance < claw.magneticRange) { grabbedItem = items.splice(i, 1)[0]; break; } } }
            }

            if (!grabbedItem) {
                for (let i = items.length - 1; i >= 0; i--) { const item = items[i]; const distance = Math.sqrt(Math.pow(endX - item.x, 2) + Math.pow(endY - item.y, 2)); if (distance < item.size) { grabbedItem = items.splice(i, 1)[0]; break; } }
            }
            
            if(grabbedItem) {
                if (grabbedItem.type === 'dynamite') {
                    triggerExplosion(grabbedItem.x, grabbedItem.y);
                    return; 
                }
                
                claw.state = 'retracting';
                if (claw.alchemyChance > 0 && grabbedItem.type === 'rock' && Math.random() < claw.alchemyChance) {
                    grabbedItem.type = 'gold';
                    grabbedItem.value = Math.round(grabbedItem.value * 10);
                    createValueTextAnimation(grabbedItem.x, grabbedItem.y, '煉金成功!');
                }
                if (claw.rockDrillChance > 0 && grabbedItem.type === 'rock' && grabbedItem.size < 25 && Math.random() < claw.rockDrillChance) {
                    createValueTextAnimation(grabbedItem.x, grabbedItem.y, '鑽碎了!');
                    claw.target = null;
                } else {
                    claw.target = grabbedItem;
                }
            } else if (endX < 0 || endX > canvas.width || endY > canvas.height) {
                claw.state = 'retracting';
                claw.target = null;
            }
        }
        else if (claw.state === 'retracting') { let retractSpeed = currentClawSpeed; if (claw.target) { const effectiveWeight = Math.max(0, (claw.target.weight || 1) - claw.weightBonus); retractSpeed = Math.max(1, currentClawSpeed - effectiveWeight); claw.target.x = claw.x + Math.cos(claw.angle) * claw.length; claw.target.y = claw.y + Math.sin(claw.angle) * claw.length; } claw.length -= retractSpeed; if (claw.length <= 20) {
            claw.length = 20;
            if (claw.target) {
                if (claw.target.type === 'bomb') { createExplosionAnimation(claw.x, claw.y, 60); claw.state = 'paralyzed'; const paralysisTime = 3000; setTimeout(() => { claw.state = 'swinging'; }, paralysisTime); }
                else if (claw.target.type === 'chest') { const roll = Math.random(); if (roll < 0.7) { const randomGold = Math.floor(Math.random() * 401) + 100; const finalGold = calculateGainedValue(randomGold); playerProgress.coins += finalGold; createValueTextAnimation(claw.x, claw.y - 20, `+${finalGold}💰`); } else if (roll < 0.85) { const randomDiamonds = Math.floor(Math.random() * 3) + 1; playerProgress.diamonds += randomDiamonds; createValueTextAnimation(claw.x, claw.y - 20, `+${randomDiamonds}💎`); } else { const potionKeys = Object.keys(CONSUMABLE_TYPES); const randomPotionId = potionKeys[Math.floor(Math.random() * potionKeys.length)]; playerProgress.items[randomPotionId] = (playerProgress.items[randomPotionId] || 0) + 1; const potionInfo = CONSUMABLE_TYPES[randomPotionId]; createValueTextAnimation(claw.x, claw.y - 20, `獲得 ${potionInfo.name}!`); } updateCurrencyUI(); saveGame(); claw.state = 'swinging'; }
                else { if (claw.target.currency === 'diamond') { playerProgress.diamonds += claw.target.value; createValueTextAnimation(claw.x, claw.y - 20, `+${claw.target.value}💎`); } else { const gainedCoins = calculateGainedValue(claw.target.value, claw.target.type); playerProgress.coins += gainedCoins; createValueTextAnimation(claw.x, claw.y - 20, `+${gainedCoins}💰`); } updateCurrencyUI(); saveGame(); claw.state = 'swinging'; }
                claw.target = null;
            } else { claw.state = 'swinging'; }
            if (autoClawGrabsLeft > 0) { autoClawGrabsLeft--; autoClawTarget = null; updateEffectsUI(); }
        }}
    }

    // --- 遊戲主迴圈與計時器 ---
    function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
    const mainTimer = setInterval(() => { if (isGamePaused) return; if (timeLeft > 0) { timeLeft--; timeEl.innerText = timeLeft; if (playerProgress.dogLevel > 0) { const income = playerProgress.dogLevel * DOG_UPGRADE.incomePerLevel; playerProgress.coins += income; updateCurrencyUI(); createValueTextAnimation(DOG_POSITION.x, DOG_POSITION.y - DOG_EMOJI_SIZE / 2, `+${income}`); } } else { resetScene(); } updateActiveEffects(); }, 1000);
    const weatherTicker = setInterval(handleWeatherTick, 1000);

    // --- 遊戲初始化 ---
    function init() {
        loadGame();
        applyEquippedClaw();
        updateCurrencyUI();
        updateDepthUI();
        resetScene();
        gameLoop();
    }
    init();
};