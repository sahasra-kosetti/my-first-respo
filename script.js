// Room data (no currency symbol anywhere)
const rooms = [
  { id: 'single', title: 'Single Room', price: 7155, img: "1.jpeg", short: 'Cozy room for solo travellers' },
  { id: 'double', title: 'Double Room', price: 9450, img: "2.jpeg", short: 'Comfortable room for two' },
  { id: 'suite',  title: 'Suite',       price: 18000, img: "3.jpeg", short: 'Spacious suite with luxury amenities' }
];

// --- Helpers for robust date math ---
const MS_PER_DAY = 24 * 60 * 60 * 1000;
function ymdToMs(value) {              // Fallback for older browsers
  const [y, m, d] = value.split('-').map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
}
function getDateMs(inputEl) {
  // Prefer valueAsNumber when available; otherwise parse safely
  const n = inputEl.valueAsNumber;
  if (!Number.isNaN(n) && n !== null) return n;
  if (!inputEl.value) return NaN;
  return ymdToMs(inputEl.value);
}

// --- Page navigation ---
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("page-" + btn.dataset.page).classList.add("active");
  });
});

// --- Load rooms into dropdown (no ₹ or $; plain numbers) ---
const roomSelect = document.getElementById("room-select");
rooms.forEach(r => {
  const opt = document.createElement("option");
  opt.value = r.id;
  opt.textContent = `${r.title} (${r.price}/night)`; // plain number
  roomSelect.appendChild(opt);
});

// --- Booking form ---
const bookingForm  = document.getElementById("booking-form");
const summaryText  = document.getElementById("summary-text");
const bookingsList = document.getElementById("bookings-list");
const checkinInput  = document.getElementById("checkin");
const checkoutInput = document.getElementById("checkout");

let currentSummary = "";

// Keep checkout >= checkin by limiting the min
checkinInput.addEventListener("change", () => {
  checkoutInput.min = checkinInput.value || "";
});

document.getElementById("calc-btn").addEventListener("click", () => {
  const name    = document.getElementById("guest-name").value.trim();
  const roomId  = roomSelect.value;
  const guests  = document.getElementById("guests").value;

  // Validate presence first
  const inMs  = getDateMs(checkinInput);
  const outMs = getDateMs(checkoutInput);

  if (!name || !roomId || Number.isNaN(inMs) || Number.isNaN(outMs)) {
    summaryText.textContent = "Please fill all fields.";
    currentSummary = "";
    return;
  }

  // Nights calculation (robust to timezone quirks)
  const nights = Math.round((outMs - inMs) / MS_PER_DAY);

  if (nights <= 0) {
    summaryText.textContent = "Check-out must be after check-in.";
    currentSummary = "";
    return;
  }

  const room = rooms.find(r => r.id === roomId);
  const price = nights * room.price;

  currentSummary = `${name} booked a ${room.title} for ${nights} night(s) (${guests} guest(s)) - ${price}`;
  summaryText.textContent = currentSummary;
});

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentSummary) {
    alert("Please calculate first!");
    return;
  }

  const div = document.createElement("div");
  div.className = "card";
  div.textContent = currentSummary;
  bookingsList.appendChild(div);

  bookingForm.reset();
  summaryText.textContent = "Booking confirmed!";
  currentSummary = "";
  // Clear min so user can pick any new date
  checkoutInput.min = "";
});
