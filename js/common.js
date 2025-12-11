const LOCATIONS = {
  東京: { lat: 35.6895, lng: 139.6917 },
  大阪: { lat: 34.6937, lng: 135.5023 },
  沖縄: { lat: 26.2124, lng: 127.6809 },
  北海道: { lat: 43.0618, lng: 141.3545 },
  福島: { lat: 37.7608, lng: 140.4748 },
  愛知: { lat: 35.1815, lng: 136.9066 },
  石川: { lat: 36.5613, lng: 136.6562 },
  広島: { lat: 34.3853, lng: 132.4553 },
  長崎: { lat: 32.7503, lng: 129.8779 },
};

function applyTheme() {
  const body = document.body;
  body.className = ""; // Reset

  // Check manual override
  const manualTheme = localStorage.getItem('starlog_theme_mode');
  if (manualTheme && manualTheme !== 'realtime' && manualTheme !== '') {
      body.classList.add(manualTheme);
      return;
  }

  const hour = new Date().getHours();

  if (hour >= 4 && hour < 6) {
    body.classList.add("theme-dawn");
  } else if (hour >= 6 && hour < 10) {
    body.classList.add("theme-morning");
  } else if (hour >= 10 && hour < 16) {
    body.classList.add("theme-day");
  } else if (hour >= 16 && hour < 18) {
    body.classList.add("theme-sunset");
  } else if (hour >= 18 && hour < 23) {
    body.classList.add("theme-evening");
  } else {
    body.classList.add("theme-midnight");
  }
}

// ZODIAC Logic (Moved from original index.html)
const ZODIAC_LIST = [
  {
    key: "capricorn",
    en: "Capricorn",
    jp: "山羊座",
    start: "12-22",
    end: "01-19",
  },
  {
    key: "aquarius",
    en: "Aquarius",
    jp: "水瓶座",
    start: "01-20",
    end: "02-18",
  },
  { key: "pisces", en: "Pisces", jp: "魚座", start: "02-19", end: "03-20" },
  { key: "aries", en: "Aries", jp: "牡羊座", start: "03-21", end: "04-19" },
  { key: "taurus", en: "Taurus", jp: "牡牛座", start: "04-20", end: "05-20" },
  { key: "gemini", en: "Gemini", jp: "双子座", start: "05-21", end: "06-21" },
  { key: "cancer", en: "Cancer", jp: "蟹座", start: "06-22", end: "07-22" },
  { key: "leo", en: "Leo", jp: "獅子座", start: "07-23", end: "08-22" },
  { key: "virgo", en: "Virgo", jp: "乙女座", start: "08-23", end: "09-22" },
  { key: "libra", en: "Libra", jp: "天秤座", start: "09-23", end: "10-23" },
  { key: "scorpio", en: "Scorpio", jp: "蠍座", start: "10-24", end: "11-22" },
  {
    key: "sagittarius",
    en: "Sagittarius",
    jp: "射手座",
    start: "11-23",
    end: "12-21",
  },
];

function getZodiacFromBirth(birthStr) {
  if (!birthStr) return null;
  const parts = birthStr.split("-");
  if (parts.length !== 3) return null;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return null;

  const md = (m, d) => m * 100 + d;
  const mdValue = md(month, day);

  function rangeToNum(rangeStr) {
    const [m, d] = rangeStr.split("-").map((x) => parseInt(x, 10));
    return md(m, d);
  }

  for (const z of ZODIAC_LIST) {
    const startNum = rangeToNum(z.start);
    const endNum = rangeToNum(z.end);

    if (startNum <= endNum) {
      if (mdValue >= startNum && mdValue <= endNum) return z;
    } else {
      if (mdValue >= startNum || mdValue <= endNum) return z;
    }
  }
  return null;
}

// Initialize theme on load
window.addEventListener("DOMContentLoaded", applyTheme);
