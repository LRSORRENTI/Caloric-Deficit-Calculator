const form = document.querySelector('#calculator-form');
const result = document.querySelector('#result');
const resultText = document.querySelector('#result-text');
const resultDetail = document.querySelector('#result-detail');
const genderInput = document.querySelector('#gender');
const dropdown = document.querySelector('[data-dropdown]');
const dropdownToggle = document.querySelector('[data-dropdown-toggle]');
const dropdownMenu = document.querySelector('.dropdown-menu');
const dropdownLabel = document.querySelector('[data-dropdown-label]');
const dropdownItems = document.querySelectorAll('.dropdown-item');
const choiceButtons = document.querySelectorAll('.choice-button');
const steppers = document.querySelectorAll('.stepper');

const activityMultipliers = {
  low: 1.2,
  medium: 1.55,
  high: 1.725,
};

choiceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    choiceButtons.forEach((btn) => btn.setAttribute('aria-pressed', 'false'));
    button.setAttribute('aria-pressed', 'true');
    genderInput.value = button.dataset.value;
  });
});

const lbsToKg = (lbs) => lbs / 2.20462;

const mifflinStJeor = ({ weightKg, heightCm, age, gender }) => {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const closeDropdown = () => {
  if (!dropdownMenu) return;
  dropdownMenu.classList.remove('is-open');
  dropdownToggle.setAttribute('aria-expanded', 'false');
};

const openDropdown = () => {
  if (!dropdownMenu) return;
  dropdownMenu.classList.add('is-open');
  dropdownToggle.setAttribute('aria-expanded', 'true');
};

if (dropdown) {
  dropdownToggle.addEventListener('click', () => {
    if (dropdownMenu.classList.contains('is-open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  dropdownItems.forEach((item) => {
    item.addEventListener('click', () => {
      genderInput.focus();
      dropdownLabel.textContent = item.textContent;
      document.querySelector('#activity').value = item.dataset.value;
      closeDropdown();
    });
  });

  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) {
      closeDropdown();
    }
  });
}

steppers.forEach((stepper) => {
  const input = stepper.querySelector('input[type="number"]');
  if (!input) return;

  stepper.addEventListener('click', (event) => {
    const button = event.target.closest('.stepper-btn');
    if (!button) return;

    const baseStep = input.step ? Number(input.step) : 1;
    const delta = Number(button.dataset.step) * baseStep;
    const min = input.min === '' ? -Infinity : Number(input.min);
    const max = input.max === '' ? Infinity : Number(input.max);
    const current = input.value === '' ? 0 : Number(input.value);
    const next = Math.min(max, Math.max(min, current + delta));

    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const age = Number(document.querySelector('#age').value);
  const heightCm = Number(document.querySelector('#height').value);
  const weightLbs = Number(document.querySelector('#weight').value);
  const goalWeightLbs = Number(document.querySelector('#goal-weight').value);
  const days = Number(document.querySelector('#days').value);
  const activity = document.querySelector('#activity').value;
  const gender = genderInput.value;

  if (!age || !heightCm || !weightLbs || !goalWeightLbs || !days) {
    return;
  }

  const weightKg = lbsToKg(weightLbs);
  const goalWeightKg = lbsToKg(goalWeightLbs);

  const bmr = mifflinStJeor({ weightKg, heightCm, age, gender });
  const tdee = bmr * activityMultipliers[activity];

  const totalLossKg = clamp(weightKg - goalWeightKg, 0, 1000);
  const totalLossLbs = totalLossKg * 2.20462;

  if (totalLossKg === 0) {
    result.classList.remove('hidden');
    resultText.textContent = 'Your goal weight is at or above your current weight.';
    resultDetail.textContent = 'Update the goal weight to calculate a deficit-based plan.';
    return;
  }

  const totalDeficit = totalLossKg * 7700; // kcal per kg
  const dailyDeficit = totalDeficit / days;
  const recommendedCalories = Math.max(tdee - dailyDeficit, 1200);

  result.classList.remove('hidden');
  resultText.textContent = `Aim for a maximum of ${Math.round(recommendedCalories)} calories per day.`;
  resultDetail.textContent = `That is a ${Math.round(dailyDeficit)} calorie daily deficit to lose about ${Math.round(totalLossLbs)} lbs in ${days} days.`;
});
