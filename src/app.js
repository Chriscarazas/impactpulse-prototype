const drawer = document.querySelector("[data-drawer]");
const openDrawerButtons = document.querySelectorAll("[data-open-drawer]");
const closeDrawerButton = document.querySelector("[data-close-drawer]");
const sroiOutput = document.querySelector("[data-sroi-output]");
const confidenceOutput = document.querySelector("[data-confidence-output]");
const assumptionInputs = document.querySelectorAll("[data-assumption-input]");
let lastFocusedElement = null;

function openDrawer() {
  lastFocusedElement = document.activeElement;
  drawer?.setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");
  closeDrawerButton?.focus();
}

function closeDrawer() {
  drawer?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  lastFocusedElement?.focus();
}

openDrawerButtons.forEach((button) => {
  button.addEventListener("click", openDrawer);
});

closeDrawerButton?.addEventListener("click", closeDrawer);

drawer?.addEventListener("click", (event) => {
  if (event.target === drawer) {
    closeDrawer();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && drawer?.getAttribute("aria-hidden") === "false") {
    closeDrawer();
  }
});

function updateScenario() {
  const values = Array.from(assumptionInputs).map((input) => Number(input.value));
  const deadweight = values[0] ?? 24;
  const attribution = values[1] ?? 18;
  const duration = values[2] ?? 6;
  const sroi = Math.max(1.6, 4.7 - deadweight * 0.025 - attribution * 0.018 + duration * 0.12);
  const confidence = Math.max(48, Math.min(82, 74 - Math.abs(duration - 6) * 2 - Math.max(0, attribution - 18) * 0.6));

  if (sroiOutput) {
    sroiOutput.textContent = `${sroi.toFixed(1)}x`;
  }

  if (confidenceOutput) {
    confidenceOutput.textContent = `${Math.round(confidence)}%`;
  }
}

assumptionInputs.forEach((input) => {
  input.addEventListener("input", updateScenario);
});

updateScenario();

