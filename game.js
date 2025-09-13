// Init map
const map = L.map('map').setView([23.8103, 90.4125], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Game state
let pollution = 50;
let happiness = 50;
let population = 0;
let energy = 20;
let currentAction = "tree";

// HUD elements
const pollutionEl = document.getElementById("pollution");
const happinessEl = document.getElementById("happiness");
const populationEl = document.getElementById("population");
const energyEl = document.getElementById("energy");

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Function to update HUD with pop effect
function updateHUDStat(el, value) {
  el.textContent = `${el.id.charAt(0).toUpperCase() + el.id.slice(1)}: ${value}`;
  
  // Add dramatic pop and color change
  el.classList.add('scale-125', 'text-yellow-400', 'transition-transform', 'duration-300', 'ease-out');
  
  // Remove pop after animation
  setTimeout(() => {
    el.classList.remove('scale-125', 'text-yellow-400');
  }, 300);
}

// Update all HUD stats
function updateHUD() {
  updateHUDStat(pollutionEl, pollution);
  updateHUDStat(happinessEl, happiness);
  updateHUDStat(populationEl, population);
  updateHUDStat(energyEl, energy);
}

// Sprites
const treeIcon = L.icon({ iconUrl: './images/tree.png', iconSize: [120, 120] });
const parkIcon = L.icon({ iconUrl: './images/park.png', iconSize: [150, 150] });
const carIcon = L.icon({ iconUrl: './images/car.png', iconSize: [120, 120] });
const solarpanelIcon = L.icon({ iconUrl: './images/solar-panel.png', iconSize: [120, 120] });
const buildingIcon = L.icon({ iconUrl: './images/building.png', iconSize: [150, 150] });

// Place item
function placeItem(action, latlng) {
  if (energy <= 0) return alert("No more energy! Reset to play again.");

  let marker;
  switch(action) {
    case "tree":
      marker = L.marker(latlng, { icon: treeIcon }).addTo(map);
      marker.bindPopup("🌳 Tree planted!");
      pollution -= 5;
      happiness += 2;
      break;
    case "park":
      marker = L.marker(latlng, { icon: parkIcon }).addTo(map);
      marker.bindPopup("🏞️ Park built!");
      pollution -= 10;
      happiness += 10;
      break;
    case "building":
      marker = L.marker(latlng, { icon: buildingIcon }).addTo(map).bindPopup("🏢 Building added!");
      pollution += 5;
      happiness -= 2;
      population += 50;
      break;
    case "car":
      marker = L.marker(latlng, { icon: carIcon }).addTo(map);
      marker.bindPopup("🚗 Car added!");
      pollution += 10;
      happiness -= 3;
      break;
    case "solar":
      marker = L.marker(latlng, { icon: solarpanelIcon }).addTo(map);
      marker.bindPopup("☀️ Solar panel installed!");
      pollution -= 3;
      happiness += 1;
      break;
  }

  energy -= 1;
  pollution = clamp(pollution, 0, 100);
  happiness = clamp(happiness, 0, 100);

  updateHUD();
  checkGameState();
}

// Check game state
function checkGameState() {
  if (pollution <= 0) {
    alert("🎉 You created a pollution-free city!");
    map.off("click");
  }
  if (happiness <= 0) {
    alert("💀 Citizens are unhappy! Game over.");
    map.off("click");
  }
  if (energy <= 0) {
    alert("⚡ You ran out of energy!");
    map.off("click");
  }
}

// Map click to place item
map.on("click", (e) => placeItem(currentAction, e.latlng));

// Tool buttons
document.querySelectorAll(".btn-group button").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if (action) currentAction = action;
  });
});

// Reset button
document.getElementById("resetBtn").addEventListener("click", () => {
  pollution = 50;
  happiness = 50;
  population = 0;
  energy = 20;
  updateHUD();

  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer); // remove placed items
    }
  });

  map.on("click", (e) => placeItem(currentAction, e.latlng));
});

updateHUD();
