// ====== CONFIG ======
const apiKey = "0789833384a94818966195551251109"; // ✅ Your key is now here

// ====== DOM ======
const locationInput = document.getElementById("locationInput");
const searchBtn = document.getElementById("searchBtn");
const detectBtn = document.getElementById("detectBtn");
const unitToggle = document.getElementById("unitToggle");
const unitLabel = document.getElementById("unitLabel");

const statusDiv = document.getElementById("status");
const card = document.getElementById("card");
const placeEl = document.getElementById("place");
const localtimeEl = document.getElementById("localtime");
const conditionIcon = document.getElementById("conditionIcon");
const conditionText = document.getElementById("conditionText");
const tempValueEl = document.getElementById("tempValue");
const tempUnitEl = document.getElementById("tempUnit");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const visEl = document.getElementById("vis");
const aqiUsEl = document.getElementById("aqi_us");
const pm25El = document.getElementById("pm2_5");
const pm10El = document.getElementById("pm10");
const aqiDescEl = document.getElementById("aqi_desc");

// ====== State ======
let useCelsius = true;
unitToggle.checked = true;
unitLabel.textContent = "°C";

// Toggle units
unitToggle.addEventListener("change", () => {
  useCelsius = unitToggle.checked;
  unitLabel.textContent = useCelsius ? "°C" : "°F";
  const currentPlace = placeEl.dataset.q;
  if (currentPlace) fetchWeatherByQuery(currentPlace);
});

// Search
searchBtn.addEventListener("click", () => {
  const q = locationInput.value.trim();
  if (!q) {
    showStatus("Please enter a city.", true);
    return;
  }
  fetchWeatherByQuery(q);
});

// Detect location
detectBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showStatus("Geolocation not supported.", true);
    return;
  }
  showStatus("Detecting location…");
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showStatus("Location access denied. Search manually.", true)
  );
});

// ====== Helpers ======
function showStatus(msg, isError = false) {
  statusDiv.textContent = msg;
  statusDiv.style.color = isError ? "red" : "";
}
function showCard() { card.classList.remove("hidden"); }
function hideCard() { card.classList.add("hidden"); }

function buildUrl(q) {
  return `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(q)}&aqi=yes`;
}

async function fetchWeatherByQuery(q) {
  showStatus("Loading…"); hideCard();
  try {
    const res = await fetch(buildUrl(q));
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    renderWeather(data);
  } catch (err) { showStatus(err.message, true); }
}

async function fetchWeatherByCoords(lat, lon) {
  showStatus("Loading…"); hideCard();
  try {
    const res = await fetch(buildUrl(`${lat},${lon}`));
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    renderWeather(data);
  } catch (err) { showStatus(err.message, true); }
}

function renderWeather(data) {
  const loc = `${data.location.name}, ${data.location.country}`;
  placeEl.textContent = loc;
  placeEl.dataset.q = data.location.name;
  localtimeEl.textContent = "Local time: " + data.location.localtime;

  conditionIcon.src = "https:" + data.current.condition.icon;
  conditionText.textContent = data.current.condition.text;

  const tempC = data.current.temp_c;
  const tempF = data.current.temp_f;
  const feelsC = data.current.feelslike_c;
  const feelsF = data.current.feelslike_f;

  if (useCelsius) {
    tempValueEl.textContent = Math.round(tempC);
    tempUnitEl.textContent = "°C";
    feelsLikeEl.textContent = Math.round(feelsC);
  } else {
    tempValueEl.textContent = Math.round(tempF);
    tempUnitEl.textContent = "°F";
    feelsLikeEl.textContent = Math.round(feelsF);
  }

  humidityEl.textContent = data.current.humidity;
  windEl.textContent = data.current.wind_kph;
  pressureEl.textContent = data.current.pressure_mb;
  visEl.textContent = data.current.vis_km;

  const air = data.current.air_quality || {};
  aqiUsEl.textContent = air["us-epa-index"] ?? "N/A";
  pm25El.textContent = air["pm2_5"] ? Math.round(air["pm2_5"]) : "N/A";
  pm10El.textContent = air["pm10"] ? Math.round(air["pm10"]) : "N/A";
  aqiDescEl.textContent = interpretAqi(air["us-epa-index"]);

  showStatus(""); showCard();
}

function interpretAqi(i) {
  if (i == null) return "";
  if (i <= 1) return "Good";
  if (i === 2) return "Moderate";
  if (i === 3) return "Unhealthy for sensitive groups";
  if (i === 4) return "Unhealthy";
  if (i === 5) return "Very Unhealthy";
  return "";
}
