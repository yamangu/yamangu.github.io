const API_TOKEN = "53483a6f-b31f-4804-9110-1b3056bba767";
const HOST = "https://app.livlog.xyz/hoshimiru/";

let allConstellations = [];
let planetCarouselInterval = null;
let constellationRandomInterval = null;
let isCurrentTimeMode = true; // Default to current time

document.addEventListener('DOMContentLoaded', async () => {
    const lat = localStorage.getItem('starlog_lat');
    const lng = localStorage.getItem('starlog_lng');
    const birth = localStorage.getItem('starlog_birth');
    const locName = localStorage.getItem('starlog_location_name');

    if (!lat || !lng || !birth) {
        window.location.href = 'setting.html';
        return;
    }

    document.getElementById('location-display').textContent = locName;
    
    // Initial Load (Current Time)
    await loadData(new Date());

    // Button Event Listener
    const switchBtn = document.getElementById('timeSwitchBtn');
    switchBtn.addEventListener('click', () => {
        if (isCurrentTimeMode) {
            // Switch to Birth Time
            const birthDate = new Date(birth);
            // Set time to night time (e.g., 20:00) for better visibility if birth time is unknown, 
            // but usually birthdate string is YYYY-MM-DD. Let's assume 20:00 for "Birth Sky" to ensure stars are visible?
            // Or just use 00:00? The user just said "Birth Date". 
            // Let's use the current time's hour/min but on the birth date to keep it simple, 
            // OR just set it to a fixed night time like 21:00 to ensure stars are likely visible.
            // Let's stick to 21:00 for birth sky to make it "starry".
            birthDate.setHours(21, 0, 0);
            
            loadData(birthDate);
            switchBtn.textContent = '現在の空へ';
            isCurrentTimeMode = false;
        } else {
            // Switch to Current Time
            loadData(new Date());
            switchBtn.textContent = '生まれた日の空へ';
            isCurrentTimeMode = true;
        }
    });

    // Popup close event
    document.getElementById('popupOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'popupOverlay') closePopup();
    });
});

async function loadData(dateObj) {
    const lat = localStorage.getItem('starlog_lat');
    const lng = localStorage.getItem('starlog_lng');
    const myZodiacEn = localStorage.getItem('starlog_zodiac_en');
    const myZodiacJp = localStorage.getItem('starlog_zodiac_jp');

    // Update Time Display
    const timeDisplay = `${dateObj.getFullYear()}年${dateObj.getMonth()+1}月${dateObj.getDate()}日 ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    document.getElementById('time-display').textContent = timeDisplay;

    // Clear previous intervals
    if (planetCarouselInterval) clearInterval(planetCarouselInterval);
    if (constellationRandomInterval) clearInterval(constellationRandomInterval);

    // Show loading state
    document.getElementById('main-content').innerHTML = '<div class="glass-card" style="text-align:center;padding:20px;"><p>星を読み込んでいます...</p><div class="floating">✨</div></div>';

    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const hourStr = String(dateObj.getHours()).padStart(2, '0');
    const minStr = String(dateObj.getMinutes()).padStart(2, '0');

    const params = `?lat=${lat}&lng=${lng}&date=${dateStr}&hour=${hourStr}&min=${minStr}`;

    try {
        const [constRes, planetRes] = await Promise.all([
            fetch(`${HOST}constellation${params}`, { headers: { 'Authorization': `Bearer ${API_TOKEN}` } }),
            fetch(`${HOST}planet${params}`, { headers: { 'Authorization': `Bearer ${API_TOKEN}` } })
        ]);

        const constData = await constRes.json();
        const planetData = await planetRes.json();

        renderContent(constData.results || [], planetData.results || [], myZodiacEn, myZodiacJp);

    } catch (e) {
        console.error(e);
        document.getElementById('main-content').innerHTML = '<p>データの取得に失敗しました。</p>';
    }
}

function renderContent(constellations, planets, myZodiacEn, myZodiacJp) {
    const container = document.getElementById('main-content');
    container.innerHTML = '';

    // 1. My Zodiac Status
    const myZodiacItem = constellations.find(c => c.enName && c.enName.includes(myZodiacEn));
    
    const mySection = document.createElement('div');
    mySection.className = 'glass-card';
    
    if (myZodiacItem) {
        mySection.innerHTML = `
            <h2>あなたの星座: ${myZodiacJp}</h2>
            <div style="text-align:center;" onclick='openPopup(${JSON.stringify(myZodiacItem)})'>
                <div class="zodiac-icon floating">✨</div>
                <p>現在、空に見えています！</p>
                <p>高度: ${myZodiacItem.altitude} / 方角: ${myZodiacItem.direction}</p>
                <p style="font-size:0.8rem; color: #ddd;">タップで詳細</p>
            </div>
        `;
    } else {
        mySection.innerHTML = `
            <h2>あなたの星座: ${myZodiacJp}</h2>
            <div style="text-align:center;">
                <div class="zodiac-icon" style="opacity:0.5">☁️</div>
                <p>現在は沈んでいるか、見えにくい位置にあります。</p>
            </div>
        `;
    }
    container.appendChild(mySection);

    // 2. Planets (Carousel)
    if (planets.length > 0) {
        const planetSection = document.createElement('div');
        planetSection.className = 'glass-card';
        planetSection.innerHTML = '<h2>惑星・月・太陽</h2>';
        
        const carousel = document.createElement('div');
        carousel.className = 'carousel';
        carousel.id = 'planetCarousel';
        
        planets.forEach(p => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.onclick = () => openPopup(p);
            item.innerHTML = `
                <div style="background:rgba(255,255,255,0.1); padding:10px; border-radius:10px; text-align:center;">
                    <h3>${p.jpName}</h3>
                    <p style="font-size:0.8rem">${p.direction}</p>
                    <p style="font-size:0.8rem">Alt: ${p.altitude}</p>
                </div>
            `;
            carousel.appendChild(item);
        });
        
        planetSection.appendChild(carousel);
        container.appendChild(planetSection);

        // Auto Scroll Planets
        startPlanetCarousel();
    }

    // 3. Other Constellations (Random 4)
    // Filter out my zodiac
    allConstellations = constellations.filter(c => !c.enName || !c.enName.includes(myZodiacEn));
    
    const otherSection = document.createElement('div');
    otherSection.className = 'glass-card';
    otherSection.innerHTML = '<h2>その他の星座</h2>';
    
    const listContainer = document.createElement('div');
    listContainer.id = 'randomConstellationList';
    otherSection.appendChild(listContainer);
    
    container.appendChild(otherSection);

    if (allConstellations.length > 0) {
        updateRandomConstellations();
        startRandomConstellationsTimer();
    } else {
        listContainer.innerHTML = '<p>現在見えるその他の星座はありません。</p>';
    }
}

// --- Features ---

function startPlanetCarousel() {
    const carousel = document.getElementById('planetCarousel');
    if (!carousel) return;
    
    if (planetCarouselInterval) clearInterval(planetCarouselInterval);

    planetCarouselInterval = setInterval(() => {
        const scrollAmount = carousel.offsetWidth * 0.8 + 10; // Item width + gap
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        
        if (carousel.scrollLeft + scrollAmount >= maxScroll - 5) { // Near end
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }, 5000);
}

function updateRandomConstellations() {
    const container = document.getElementById('randomConstellationList');
    if (!container || allConstellations.length === 0) return;

    // Pick 4 random
    const shuffled = [...allConstellations].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    container.innerHTML = '';
    selected.forEach(c => {
        const row = document.createElement('div');
        row.className = 'data-row';
        row.style.cursor = 'pointer';
        row.onclick = () => openPopup(c);
        row.innerHTML = `
            <span>${c.jpName}</span>
            <span>${c.direction}</span>
        `;
        container.appendChild(row);
    });
}

function startRandomConstellationsTimer() {
    if (constellationRandomInterval) clearInterval(constellationRandomInterval);
    constellationRandomInterval = setInterval(updateRandomConstellations, 5000);
}

// --- Popup ---

function openPopup(item) {
    const overlay = document.getElementById('popupOverlay');
    const inner = document.getElementById('popupInner');

    inner.innerHTML = `
        <h3>${item.jpName} (${item.enName || ''})</h3>
        <div class="popup-content-flex">
            ${item.starImage ? `<img src="${item.starImage}" alt="${item.jpName}">` : ''}
            <div class="popup-text">
                <p><strong>高度:</strong> ${item.altitude} (${item.altitudeNum.toFixed(2)} 度)</p>
                <p><strong>方角:</strong> ${item.direction} (${item.directionNum.toFixed(2)} 度)</p>
                <p><strong>概要:</strong><br>${item.roughly || item.content || '詳細情報なし'}</p>
            </div>
        </div>
        <div style="margin-top: 10px;">
            <p><strong>神話/伝承:</strong><br>${item.origin || '情報なし'}</p>
        </div>
    `;
    overlay.style.display = 'flex';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}
