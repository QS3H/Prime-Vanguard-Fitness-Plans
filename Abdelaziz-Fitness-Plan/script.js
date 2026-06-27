// ===== MEMBER CONFIG =====
const memberConfig = {
    name: 'Abdelazzez',
    programDuration: 'Age 23 | Bio-Age 31 | VFI 14.9 → Target: Under 9 | Body Recomposition',
    startingWeight: 0,
    fourWeekTargetMin: 0,
    fourWeekTargetMax: 0,
    longTermTarget: 0,
    skeletalMuscle: 28.6,
    bodyFat: 27.7,
    bmr: 1775,
    dailyCalories: 2200,
    dailyProtein: 175,
    dailyCarbs: 180,
    dailyFats: 65,
    waterGoal: 4
};

// ===== UTILITIES =====
function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

function getWeekStartKey() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
}

function safeLocalStorageSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error('localStorage error:', error);
        showToast('Storage error. Data may not persist.');
        return false;
    }
}

function safeLocalStorageGetItem(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    } catch (error) {
        console.error('localStorage error:', error);
        return defaultValue;
    }
}

function safeLocalStorageRemoveItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('localStorage error:', error);
        return false;
    }
}

function parseJSON(value, fallback) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

let shoppingDefaults = [];
let modalPreviousFocus = null;

// ===== READING PROGRESS BAR =====
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    document.getElementById('progressBar').style.width = scrolled + '%';

    const backToTop = document.getElementById('backToTop');
    if (winScroll > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }

    updateActiveNav();
});

// ===== SMOOTH SCROLL =====
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ACTIVE NAV LINK =====
function updateActiveNav() {
    const sections = ['analysis', 'training', 'workouts', 'nutrition', 'tracking'];
    const scrollPos = window.scrollY + 100;

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const link = document.querySelector(`.nav-links a[data-section="${sectionId}"]`);

        if (section && link) {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;

            if (scrollPos >= top && scrollPos < bottom) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.nav-toggle');
    const isActive = menu.classList.toggle('active');

    toggle.setAttribute('aria-expanded', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
}

// ===== SCROLL REVEAL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            if (entry.target.querySelector('.stat-value[data-target]')) {
                entry.target.querySelectorAll('.stat-value[data-target]').forEach(animateCounter);
            }
        }
    });
}, { threshold: 0.1 });

// ===== ANIMATED COUNTERS =====
function animateCounter(element) {
    if (element.dataset.animated) return;
    element.dataset.animated = 'true';

    const target = parseFloat(element.dataset.target);
    const suffix = element.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        element.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ===== EXERCISE TRACKER =====
function toggleExercise(checkElement, event) {
    if (event) event.stopPropagation();

    const exerciseItem = checkElement.closest('.exercise-item');
    if (!exerciseItem) return;

    exerciseItem.classList.toggle('completed');

    const isCompleted = exerciseItem.classList.contains('completed');
    exerciseItem.setAttribute('aria-pressed', isCompleted);

    const workoutList = exerciseItem.closest('.exercise-list');
    const workoutId = workoutList ? workoutList.id : '';

    if (workoutId === 'workoutA') {
        updateWorkoutAProgress();
        saveWorkoutAProgress();
    } else if (workoutId === 'workoutB') {
        updateWorkoutBProgress();
        saveWorkoutBProgress();
    }

    if (isCompleted) {
        showToast('Exercise completed!');
    }
}

function handleExerciseItemClick(item, event) {
    if (event.target.closest('input, [contenteditable="true"], button, .weight-input-container')) {
        return;
    }
    const checkElement = item.querySelector('.exercise-check');
    if (checkElement) {
        toggleExercise(checkElement, event);
    }
}

function saveWorkoutProgress(workoutKey, barId, textId) {
    const listId = workoutKey === 'A' ? 'workoutA' : 'workoutB';
    const exercises = document.querySelectorAll(`#${listId} .exercise-item`);
    const completedIds = [];
    exercises.forEach((ex, idx) => {
        if (ex.classList.contains('completed')) {
            completedIds.push(idx);
        }
    });

    const data = {
        week: getWeekStartKey(),
        completed: completedIds
    };

    safeLocalStorageSetItem(`pv_workout_${workoutKey.toLowerCase()}_progress`, JSON.stringify(data));
    showAutoSave();
}

function loadWorkoutProgress(workoutKey, updateFn) {
    const listId = workoutKey === 'A' ? 'workoutA' : 'workoutB';
    const saved = safeLocalStorageGetItem(`pv_workout_${workoutKey.toLowerCase()}_progress`);
    if (!saved) return;

    const progressData = parseJSON(saved, null);
    const weekStart = getWeekStartKey();

    let completedIds = [];
    if (Array.isArray(progressData)) {
        completedIds = progressData;
    } else if (progressData && progressData.week === weekStart) {
        completedIds = progressData.completed || [];
    }

    const exercises = document.querySelectorAll(`#${listId} .exercise-item`);
    completedIds.forEach(idx => {
        if (exercises[idx]) {
            exercises[idx].classList.add('completed');
            exercises[idx].setAttribute('aria-pressed', 'true');
        }
    });
    updateFn();
}

function resetWorkoutList(workoutKey, listId, updateFn, label) {
    document.querySelectorAll(`#${listId} .exercise-item`).forEach(ex => {
        ex.classList.remove('completed');
        ex.setAttribute('aria-pressed', 'false');
    });
    safeLocalStorageRemoveItem(`pv_workout_${workoutKey.toLowerCase()}_progress`);
    updateFn();
    showToast(`${label} progress reset`);
}

function updateWorkoutAProgress() {
    const exercises = document.querySelectorAll('#workoutA .exercise-item');
    const completed = document.querySelectorAll('#workoutA .exercise-item.completed');
    const progress = exercises.length ? (completed.length / exercises.length) * 100 : 0;

    document.getElementById('workoutProgressBar').style.width = progress + '%';
    document.getElementById('workoutProgressText').textContent = `${completed.length}/${exercises.length} exercises`;
}

function saveWorkoutAProgress() {
    saveWorkoutProgress('A');
}

function loadWorkoutAProgress() {
    loadWorkoutProgress('A', updateWorkoutAProgress);
}

function resetWorkoutProgress() {
    resetWorkoutList('A', 'workoutA', updateWorkoutAProgress, 'Workout A');
}

function updateWorkoutBProgress() {
    const exercises = document.querySelectorAll('#workoutB .exercise-item');
    const completed = document.querySelectorAll('#workoutB .exercise-item.completed');
    const progress = exercises.length ? (completed.length / exercises.length) * 100 : 0;

    document.getElementById('workoutBProgressBar').style.width = progress + '%';
    document.getElementById('workoutBProgressText').textContent = `${completed.length}/${exercises.length} exercises`;
}

function saveWorkoutBProgress() {
    saveWorkoutProgress('B');
}

function loadWorkoutBProgress() {
    loadWorkoutProgress('B', updateWorkoutBProgress);
}

function resetWorkoutBProgress() {
    resetWorkoutList('B', 'workoutB', updateWorkoutBProgress, 'Workout B');
}

// ===== WATER TRACKER =====
let waterCount = 0;
const WATER_GOAL = memberConfig.waterGoal;

function loadWaterData() {
    const saved = safeLocalStorageGetItem('pv_water_count');
    const today = getTodayKey();

    if (!saved) {
        return { date: today, count: 0 };
    }

    const parsed = parseJSON(saved, null);
    if (parsed && typeof parsed === 'object' && 'date' in parsed) {
        return parsed.date === today ? parsed : { date: today, count: 0 };
    }

    const legacyCount = parseInt(saved, 10);
    return { date: today, count: Number.isNaN(legacyCount) ? 0 : legacyCount };
}

function saveWaterData() {
    safeLocalStorageSetItem('pv_water_count', JSON.stringify({ date: getTodayKey(), count: waterCount }));
}

function initWaterTracker() {
    const container = document.getElementById('waterGlasses');
    container.innerHTML = '';

    const waterData = loadWaterData();
    waterCount = waterData.count;

    for (let i = 0; i < WATER_GOAL; i++) {
        const glass = document.createElement('div');
        glass.className = 'water-glass' + (i < waterCount ? ' filled' : '');
        glass.setAttribute('role', 'button');
        glass.setAttribute('tabindex', '0');
        glass.setAttribute('aria-label', `Bottle ${i + 1} of ${WATER_GOAL}`);
        glass.setAttribute('aria-pressed', i < waterCount ? 'true' : 'false');
        glass.addEventListener('click', () => toggleWater(i));
        glass.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleWater(i);
            }
        });
        container.appendChild(glass);
    }

    updateWaterDisplay();
}

function toggleWater(index) {
    if (index < waterCount) {
        waterCount = index;
    } else {
        waterCount = index + 1;
    }

    saveWaterData();

    document.querySelectorAll('.water-glass').forEach((glass, idx) => {
        const filled = idx < waterCount;
        glass.classList.toggle('filled', filled);
        glass.setAttribute('aria-pressed', filled ? 'true' : 'false');
    });

    updateWaterDisplay();

    if (waterCount === WATER_GOAL) {
        showToast('Daily hydration goal reached!');
    }
}

function updateWaterDisplay() {
    document.getElementById('waterCount').textContent = `${waterCount} / ${WATER_GOAL} bottles`;
}

function resetWater() {
    waterCount = 0;
    saveWaterData();
    initWaterTracker();
    showToast('Water tracker reset');
}

// ===== WEIGHT TRACKING =====
function logWeight() {
    const weightInput = document.getElementById('weightInput');
    const validationMsg = document.getElementById('weightInputValidation');
    const dateInput = document.getElementById('weightDate');
    const weight = parseFloat(weightInput.value);
    const date = dateInput.value || getTodayKey();

    if (!weightInput.value) {
        weightInput.classList.add('input-error');
        weightInput.classList.remove('input-success');
        validationMsg.textContent = 'Please enter a weight';
        validationMsg.classList.add('error');
        validationMsg.classList.remove('success');
        return;
    }

    if (weight <= 0) {
        weightInput.classList.add('input-error');
        weightInput.classList.remove('input-success');
        validationMsg.textContent = 'Weight must be greater than 0';
        validationMsg.classList.add('error');
        validationMsg.classList.remove('success');
        return;
    }

    if (weight > 300) {
        weightInput.classList.add('input-error');
        weightInput.classList.remove('input-success');
        validationMsg.textContent = 'Weight seems too high (max 300kg)';
        validationMsg.classList.add('error');
        validationMsg.classList.remove('success');
        return;
    }

    weightInput.classList.remove('input-error');
    weightInput.classList.add('input-success');
    validationMsg.textContent = 'Valid weight entered';
    validationMsg.classList.remove('error');
    validationMsg.classList.add('success');

    let weightHistory = parseJSON(safeLocalStorageGetItem('pv_weight_history', '[]'), []);

    const existingIndex = weightHistory.findIndex(entry => entry.date === date);
    if (existingIndex >= 0) {
        weightHistory[existingIndex].weight = weight;
        showToast('Weight updated for this date');
    } else {
        weightHistory.push({ date, weight });
        showToast('Weight logged successfully!');
    }

    weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (weightHistory.length > 8) {
        weightHistory = weightHistory.slice(-8);
    }

    safeLocalStorageSetItem('pv_weight_history', JSON.stringify(weightHistory));
    showAutoSave();

    weightInput.value = '';
    dateInput.value = getTodayKey();
    weightInput.classList.remove('input-success');
    validationMsg.textContent = '';
    validationMsg.classList.remove('success');

    updateWeightDisplay();
    drawWeightChart();
}

function updateWeightDisplay() {
    const weightHistory = parseJSON(safeLocalStorageGetItem('pv_weight_history', '[]'), []);

    document.getElementById('startingWeight').textContent = memberConfig.startingWeight > 0
        ? memberConfig.startingWeight.toFixed(1) + ' kg'
        : '— kg';

    if (weightHistory.length > 0) {
        const latestWeight = weightHistory[weightHistory.length - 1].weight;
        document.getElementById('currentWeight').textContent = latestWeight.toFixed(1) + ' kg';
    } else {
        document.getElementById('currentWeight').textContent = memberConfig.startingWeight > 0
            ? memberConfig.startingWeight.toFixed(1) + ' kg'
            : '— kg';
    }
}

function drawWeightChart() {
    const canvas = document.getElementById('weightChart');
    const emptyState = document.getElementById('weightChartEmptyState');
    const ctx = canvas.getContext('2d');
    const weightHistory = parseJSON(safeLocalStorageGetItem('pv_weight_history', '[]'), []);

    if (weightHistory.length === 0) {
        canvas.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    canvas.style.display = 'block';
    emptyState.style.display = 'none';

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    const data = weightHistory;
    const weights = data.map(d => d.weight);
    const chartFloor = memberConfig.longTermTarget > 0 ? memberConfig.longTermTarget : Math.min(...weights);
    const minWeight = Math.min(...weights, chartFloor) - 2;
    const maxWeight = Math.max(...weights, memberConfig.startingWeight > 0 ? memberConfig.startingWeight : Math.max(...weights)) + 2;
    const weightRange = maxWeight - minWeight;

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
        const y = padding + (height - 2 * padding) * (i / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        const weightLabel = (maxWeight - (weightRange * i / 5)).toFixed(1);
        ctx.fillStyle = '#64748B';
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(weightLabel + ' kg', padding - 5, y + 4);
    }

    if (memberConfig.longTermTarget > 0) {
        const targetY = padding + (height - 2 * padding) * ((maxWeight - memberConfig.longTermTarget) / weightRange);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, targetY);
        ctx.lineTo(width - padding, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('Long-term: ' + memberConfig.longTermTarget + ' kg', width - padding, targetY - 5);
    }

    if (data.length > 1) {
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * (index / (data.length - 1));
            const y = padding + (height - 2 * padding) * ((maxWeight - point.weight) / weightRange);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        data.forEach((point, index) => {
            const x = padding + (width - 2 * padding) * (index / (data.length - 1));
            const y = padding + (height - 2 * padding) * ((maxWeight - point.weight) / weightRange);

            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#D4AF37';
            ctx.fill();
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#64748B';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            const dateObj = new Date(point.date);
            const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            ctx.fillText(dateLabel, x, height - padding + 15);
        });
    } else if (data.length === 1) {
        const x = width / 2;
        const y = padding + (height - 2 * padding) * ((maxWeight - data[0].weight) / weightRange);

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#D4AF37';
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Weight Progress Over Time', width / 2, 20);
}

function clearWeightHistory() {
    if (confirm('Are you sure you want to clear all weight history?')) {
        safeLocalStorageRemoveItem('pv_weight_history');
        updateWeightDisplay();
        drawWeightChart();
        showToast('Weight history cleared');
    }
}

// ===== MEAL TRACKER =====
function toggleMeal(checkbox) {
    const mealCard = checkbox.closest('.meal-card');
    if (checkbox.checked) {
        mealCard.classList.add('completed');
        showToast('Meal completed!');
    } else {
        mealCard.classList.remove('completed');
    }

    updateMealProgress();
    saveMealProgress();
}

function updateMealProgress() {
    const meals = document.querySelectorAll('.meal-checkbox');
    const completed = document.querySelectorAll('.meal-checkbox:checked');
    const progress = meals.length ? (completed.length / meals.length) * 100 : 0;

    document.getElementById('mealProgressBar').style.width = progress + '%';
    document.getElementById('mealProgressText').textContent = `${completed.length}/${meals.length} meals`;
}

function saveMealProgress() {
    const meals = document.querySelectorAll('.meal-checkbox');
    const completedMeals = [];
    meals.forEach((meal, idx) => {
        if (meal.checked) {
            completedMeals.push(idx);
        }
    });

    const mealData = {
        date: getTodayKey(),
        completed: completedMeals
    };

    safeLocalStorageSetItem('pv_meal_progress', JSON.stringify(mealData));
    showAutoSave();
}

function loadMealProgress() {
    const saved = safeLocalStorageGetItem('pv_meal_progress');
    if (!saved) return;

    const mealData = parseJSON(saved, null);
    if (mealData && mealData.date === getTodayKey()) {
        const meals = document.querySelectorAll('.meal-checkbox');
        mealData.completed.forEach(idx => {
            if (meals[idx]) {
                meals[idx].checked = true;
                meals[idx].closest('.meal-card').classList.add('completed');
            }
        });
        updateMealProgress();
    }
}

function resetMealProgress() {
    document.querySelectorAll('.meal-checkbox').forEach(meal => {
        meal.checked = false;
        meal.closest('.meal-card').classList.remove('completed');
    });
    safeLocalStorageRemoveItem('pv_meal_progress');
    updateMealProgress();
    showToast('Meal progress reset');
}

// ===== EXERCISE WEIGHT LOGGING =====
function saveExerciseWeight(input) {
    const workout = input.dataset.workout;
    const exercise = input.dataset.exercise;
    const weight = parseFloat(input.value);

    if (!weight || weight <= 0) {
        input.value = '';
        return;
    }

    let weightData = parseJSON(safeLocalStorageGetItem('pv_exercise_weights', '{}'), {});

    if (!weightData[workout]) {
        weightData[workout] = {};
    }

    const today = getTodayKey();
    const previousData = weightData[workout][exercise] || { weight: 0, date: '', history: [] };

    if (previousData.weight !== weight || previousData.date !== today) {
        if (!previousData.history) previousData.history = [];
        previousData.history.push({
            weight: previousData.weight,
            date: previousData.date
        });
        if (previousData.history.length > 5) {
            previousData.history = previousData.history.slice(-5);
        }
    }

    weightData[workout][exercise] = {
        weight: weight,
        date: today,
        history: previousData.history
    };

    safeLocalStorageSetItem('pv_exercise_weights', JSON.stringify(weightData));
    showAutoSave();
    updateWeightIndicator(workout, exercise, weight, previousData.weight);
}

function loadExerciseWeights() {
    const weightData = parseJSON(safeLocalStorageGetItem('pv_exercise_weights', '{}'), {});
    const today = getTodayKey();

    document.querySelectorAll('.weight-input:not([data-no-weight])').forEach(input => {
        const workout = input.dataset.workout;
        const exercise = input.dataset.exercise;

        if (weightData[workout] && weightData[workout][exercise]) {
            const data = weightData[workout][exercise];
            if (data.date === today) {
                input.value = data.weight;
                if (data.history && data.history.length > 0) {
                    const lastWeight = data.history[data.history.length - 1].weight;
                    updateWeightIndicator(workout, exercise, data.weight, lastWeight);
                }
            }
        }
    });
}

function updateWeightIndicator(workout, exercise, currentWeight, previousWeight) {
    const indicator = document.getElementById(`weightIndicator-${workout}-${exercise}`);
    if (!indicator || !previousWeight) return;

    indicator.classList.add('show');
    indicator.classList.remove('increase', 'decrease', 'same');

    if (currentWeight > previousWeight) {
        indicator.classList.add('increase');
        indicator.innerHTML = `↑ +${(currentWeight - previousWeight).toFixed(1)}kg`;
    } else if (currentWeight < previousWeight) {
        indicator.classList.add('decrease');
        indicator.innerHTML = `↓ ${(currentWeight - previousWeight).toFixed(1)}kg`;
    } else {
        indicator.classList.add('same');
        indicator.innerHTML = '→ Same';
    }
}

// ===== EXERCISE NAME EDITING =====
function saveExerciseName(element) {
    const workout = element.dataset.workout;
    const exercise = element.dataset.exercise;
    const newName = element.textContent.trim();

    let editedNames = parseJSON(safeLocalStorageGetItem('pv_exercise_names_edited', '{}'), {});

    if (!editedNames[workout]) {
        editedNames[workout] = {};
    }

    editedNames[workout][exercise] = newName;
    safeLocalStorageSetItem('pv_exercise_names_edited', JSON.stringify(editedNames));
    showAutoSave();
}

function loadExerciseNames() {
    const editedNames = parseJSON(safeLocalStorageGetItem('pv_exercise_names_edited', '{}'), {});

    document.querySelectorAll('.exercise-name[contenteditable="true"]').forEach(element => {
        const workout = element.dataset.workout;
        const exercise = element.dataset.exercise;

        if (editedNames[workout] && editedNames[workout][exercise]) {
            element.textContent = editedNames[workout][exercise];
        }
    });
}

// ===== MEAL ITEM EDITING =====
function saveMealItem(element) {
    const meal = element.dataset.meal;
    const item = element.dataset.item;
    const newText = element.textContent.trim();

    let editedItems = parseJSON(safeLocalStorageGetItem('pv_meal_items_edited', '{}'), {});

    if (!editedItems[meal]) {
        editedItems[meal] = {};
    }

    editedItems[meal][item] = newText;
    safeLocalStorageSetItem('pv_meal_items_edited', JSON.stringify(editedItems));
    showAutoSave();
}

function loadMealItems() {
    const editedItems = parseJSON(safeLocalStorageGetItem('pv_meal_items_edited', '{}'), {});

    document.querySelectorAll('.meal-items li[contenteditable="true"]').forEach(element => {
        const meal = element.dataset.meal;
        const item = element.dataset.item;

        if (editedItems[meal] && editedItems[meal][item]) {
            element.textContent = editedItems[meal][item];
        }
    });
}

// ===== SHOPPING LIST =====
function captureShoppingDefaults() {
    return Array.from(document.querySelectorAll('.shopping-item-text')).map(span => span.textContent.trim());
}

function migrateShoppingTextKeys() {
    const savedTexts = parseJSON(safeLocalStorageGetItem('pv_shopping_list_texts', '{}'), {});
    if (savedTexts['14'] && !savedTexts['1']) {
        savedTexts['1'] = savedTexts['14'];
        delete savedTexts['14'];
        safeLocalStorageSetItem('pv_shopping_list_texts', JSON.stringify(savedTexts));
    }
}

function toggleShoppingItem(li) {
    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        li.classList.add('checked');
    } else {
        li.classList.remove('checked');
    }

    saveShoppingList();
}

function saveShoppingList() {
    const items = document.querySelectorAll('.shopping-list li');
    const checkedItems = [];

    items.forEach((item, index) => {
        if (item.querySelector('input[type="checkbox"]').checked) {
            checkedItems.push(index);
        }
    });

    safeLocalStorageSetItem('pv_shopping_list', JSON.stringify(checkedItems));
    showAutoSave();
}

function loadShoppingList() {
    const saved = safeLocalStorageGetItem('pv_shopping_list');
    if (saved) {
        const checkedItems = parseJSON(saved, []);
        const items = document.querySelectorAll('.shopping-list li');

        checkedItems.forEach(index => {
            if (items[index]) {
                items[index].querySelector('input[type="checkbox"]').checked = true;
                items[index].classList.add('checked');
            }
        });
    }

    loadShoppingListText();
}

function resetShoppingList() {
    if (confirm('Reset shopping list for new week?')) {
        document.querySelectorAll('.shopping-list li').forEach(item => {
            item.querySelector('input[type="checkbox"]').checked = false;
            item.classList.remove('checked');
        });
        safeLocalStorageRemoveItem('pv_shopping_list');
        safeLocalStorageRemoveItem('pv_shopping_list_texts');

        document.querySelectorAll('.shopping-item-text').forEach((span, index) => {
            if (shoppingDefaults[index]) {
                span.textContent = shoppingDefaults[index];
            }
        });

        showToast('Shopping list reset');
    }
}

function saveShoppingItemText(span) {
    const index = span.getAttribute('data-index');
    const text = span.textContent.trim();

    let savedTexts = parseJSON(safeLocalStorageGetItem('pv_shopping_list_texts', '{}'), {});
    savedTexts[index] = text;
    safeLocalStorageSetItem('pv_shopping_list_texts', JSON.stringify(savedTexts));
    showAutoSave();
}

function saveShoppingListText() {
    const textSpans = document.querySelectorAll('.shopping-item-text');
    const savedTexts = {};

    textSpans.forEach(span => {
        const index = span.getAttribute('data-index');
        savedTexts[index] = span.textContent.trim();
    });

    safeLocalStorageSetItem('pv_shopping_list_texts', JSON.stringify(savedTexts));
}

function loadShoppingListText() {
    const savedTexts = parseJSON(safeLocalStorageGetItem('pv_shopping_list_texts', '{}'), {});
    const textSpans = document.querySelectorAll('.shopping-item-text');

    textSpans.forEach(span => {
        const index = span.getAttribute('data-index');
        if (savedTexts[index]) {
            span.textContent = savedTexts[index];
        }
    });
}

function copyShoppingList() {
    const items = document.querySelectorAll('.shopping-list li');
    let text = 'Prime Vanguard Shopping List\n\n';

    items.forEach(item => {
        const textSpan = item.querySelector('.shopping-item-text');
        const textContent = textSpan ? textSpan.textContent.trim() : item.textContent.trim();
        const checkbox = item.querySelector('input[type="checkbox"]');
        const prefix = checkbox.checked ? '[x] ' : '[ ] ';
        text += prefix + textContent + '\n';
    });

    navigator.clipboard.writeText(text).then(() => {
        showToast('Shopping list copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy list');
    });
}

// ===== SIGNATURE =====
function saveSignature() {
    const signature = document.getElementById('signatureInput').value;
    const date = document.getElementById('dateInput').value;

    safeLocalStorageSetItem('pv_signature', JSON.stringify({ signature, date }));
    showAutoSave();
}

function loadSignature() {
    const saved = safeLocalStorageGetItem('pv_signature');
    if (!saved) return;

    const signatureData = parseJSON(saved, {});

    if (signatureData.signature) {
        document.getElementById('signatureInput').value = signatureData.signature;
    }

    if (signatureData.date) {
        document.getElementById('dateInput').value = signatureData.date;
    }
}

// ===== REST TIMER =====
let timerInterval = null;
let timerSeconds = 90;
let timerTotal = 90;
let timerRunning = false;
let timerSoundEnabled = true;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playBeep() {
    if (!timerSoundEnabled) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function openRestTimer(seconds) {
    timerSeconds = seconds;
    timerTotal = seconds;
    modalPreviousFocus = document.activeElement;

    const modal = document.getElementById('restTimerModal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    updateTimerDisplay();
    startTimer();

    const closeBtn = modal.querySelector('[data-action="close-timer"]');
    if (closeBtn) closeBtn.focus();
}

function closeRestTimer() {
    const modal = document.getElementById('restTimerModal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    stopTimer();

    if (modalPreviousFocus && typeof modalPreviousFocus.focus === 'function') {
        modalPreviousFocus.focus();
    }
}

function handleModalBackdropClick(event) {
    if (event.target.id === 'restTimerModal') {
        closeRestTimer();
    }
}

function startTimer() {
    stopTimer();
    timerRunning = true;
    document.getElementById('timerToggleBtn').textContent = 'Pause';

    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();

        if (timerSeconds <= 0) {
            stopTimer();
            playBeep();
            showToast('Rest complete! Next set!');
            document.getElementById('timerToggleBtn').textContent = 'Done';
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerRunning = false;
}

function toggleTimer() {
    if (timerRunning) {
        stopTimer();
        document.getElementById('timerToggleBtn').textContent = 'Resume';
    } else if (timerSeconds > 0) {
        startTimer();
    }
}

function adjustTimer(seconds) {
    timerSeconds = Math.max(0, timerSeconds + seconds);
    updateTimerDisplay();
}

function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = timerSeconds;
    const progress = timerTotal > 0 ? (timerSeconds / timerTotal) * 100 : 0;
    document.getElementById('timerProgressFill').style.width = progress + '%';
}

function toggleTimerSound() {
    timerSoundEnabled = !timerSoundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    btn.textContent = timerSoundEnabled ? 'Sound On' : 'Sound Off';
}

// ===== CHECK-IN FORM =====
function getCheckInFields() {
    const data = {};
    document.querySelectorAll('.progress-table input[data-field]').forEach(input => {
        data[input.dataset.field] = input.value;
    });
    return data;
}

function saveCheckIn() {
    const data = getCheckInFields();
    const weekKey = getWeekStartKey();

    let history = parseJSON(safeLocalStorageGetItem('pv_checkin_history', '{}'), {});
    history[weekKey] = {
        ...data,
        savedAt: new Date().toISOString()
    };

    // Keep only the last 8 weeks of history to prevent storage issues
    const entries = Object.entries(history).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    if (entries.length > 8) {
        const trimmedHistory = {};
        entries.slice(0, 8).forEach(([key, value]) => {
            trimmedHistory[key] = value;
        });
        history = trimmedHistory;
    }

    safeLocalStorageSetItem('pv_checkin_history', JSON.stringify(history));
    safeLocalStorageSetItem('pv_checkin', JSON.stringify(data));
    renderCheckInHistory();
    showToast('Check-in saved successfully!');
}

function loadCheckIn() {
    const weekKey = getWeekStartKey();
    const history = parseJSON(safeLocalStorageGetItem('pv_checkin_history', '{}'), {});
    const data = history[weekKey] || parseJSON(safeLocalStorageGetItem('pv_checkin', '{}'), {});

    document.querySelectorAll('.progress-table input[data-field]').forEach(input => {
        input.value = data[input.dataset.field] || '';
    });

    renderCheckInHistory();
}

function renderCheckInHistory() {
    const container = document.getElementById('checkInHistory');
    if (!container) return;

    const history = parseJSON(safeLocalStorageGetItem('pv_checkin_history', '{}'), {});
    const entries = Object.entries(history).sort((a, b) => new Date(b[0]) - new Date(a[0]));

    if (entries.length === 0) {
        container.innerHTML = '<p class="info-box">No previous check-ins yet.</p>';
        return;
    }

    container.innerHTML = entries.map(([week, data]) => {
        const win = data.win ? `Win: ${data.win}` : 'No win recorded';
        const weight = data.weight ? `Weight: ${data.weight} kg` : 'Weight not logged';
        return `<div class="checkin-history-item"><strong>Week of ${week}</strong><br>${weight} · ${win}</div>`;
    }).join('');
}

function clearCheckIn() {
    if (confirm('Are you sure you want to clear all answers for this week?')) {
        const weekKey = getWeekStartKey();
        let history = parseJSON(safeLocalStorageGetItem('pv_checkin_history', '{}'), {});
        delete history[weekKey];
        safeLocalStorageSetItem('pv_checkin_history', JSON.stringify(history));
        safeLocalStorageRemoveItem('pv_checkin');

        document.querySelectorAll('.progress-table input[data-field]').forEach(input => {
            input.value = '';
        });
        renderCheckInHistory();
        showToast('Check-in cleared');
    }
}

function clearOldData() {
    if (confirm('This will clear old check-in history (older than 8 weeks) and exercise weight history to free up storage space. Continue?')) {
        // Clear old check-in history (keep only last 4 weeks)
        let history = parseJSON(safeLocalStorageGetItem('pv_checkin_history', '{}'), {});
        const entries = Object.entries(history).sort((a, b) => new Date(b[0]) - new Date(a[0]));
        const trimmedHistory = {};
        entries.slice(0, 4).forEach(([key, value]) => {
            trimmedHistory[key] = value;
        });
        safeLocalStorageSetItem('pv_checkin_history', JSON.stringify(trimmedHistory));

        // Clear exercise weight history (keep only current weights)
        let weightData = parseJSON(safeLocalStorageGetItem('pv_exercise_weights', '{}'), {});
        Object.keys(weightData).forEach(workout => {
            Object.keys(weightData[workout]).forEach(exercise => {
                if (weightData[workout][exercise].history) {
                    weightData[workout][exercise].history = [];
                }
            });
        });
        safeLocalStorageSetItem('pv_exercise_weights', JSON.stringify(weightData));

        renderCheckInHistory();
        showToast('Old data cleared. Storage freed.');
    }
}

// ===== DATA SYNC & EXPORT =====
function collectAllProgressData() {
    return {
        exportedAt: new Date().toISOString(),
        member: memberConfig.name,
        workoutA: safeLocalStorageGetItem('pv_workout_a_progress'),
        workoutB: safeLocalStorageGetItem('pv_workout_b_progress'),
        water: safeLocalStorageGetItem('pv_water_count'),
        meals: safeLocalStorageGetItem('pv_meal_progress'),
        weightHistory: safeLocalStorageGetItem('pv_weight_history'),
        exerciseWeights: safeLocalStorageGetItem('pv_exercise_weights'),
        exerciseNames: safeLocalStorageGetItem('pv_exercise_names_edited'),
        mealItems: safeLocalStorageGetItem('pv_meal_items_edited'),
        shoppingList: safeLocalStorageGetItem('pv_shopping_list'),
        shoppingTexts: safeLocalStorageGetItem('pv_shopping_list_texts'),
        checkInHistory: safeLocalStorageGetItem('pv_checkin_history'),
        signature: safeLocalStorageGetItem('pv_signature')
    };
}

function saveAllData() {
    try {
        saveWorkoutAProgress();
        saveWorkoutBProgress();
        saveWaterData();
        saveMealProgress();

        document.querySelectorAll('.weight-input:not([data-no-weight])').forEach(input => {
            if (input.value) {
                saveExerciseWeight(input);
            }
        });

        saveShoppingList();
        saveShoppingListText();
        saveSignature();
        saveCheckIn();

        const timeString = new Date().toLocaleTimeString();
        showToast(`Progress synced at ${timeString}`);
    } catch (error) {
        console.error('Error saving data:', error);
        if (error.name === 'QuotaExceededError') {
            showToast('Storage full. Clear old data or export progress to free space.');
        } else {
            showToast('Error saving data. Check console for details.');
        }
    }
}

function exportProgressData() {
    const data = collectAllProgressData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prime-vanguard-progress-${getTodayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Progress exported as JSON');
}

function importProgressData(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            const keys = {
                workoutA: 'pv_workout_a_progress',
                workoutB: 'pv_workout_b_progress',
                water: 'pv_water_count',
                meals: 'pv_meal_progress',
                weightHistory: 'pv_weight_history',
                exerciseWeights: 'pv_exercise_weights',
                exerciseNames: 'pv_exercise_names_edited',
                mealItems: 'pv_meal_items_edited',
                shoppingList: 'pv_shopping_list',
                shoppingTexts: 'pv_shopping_list_texts',
                checkInHistory: 'pv_checkin_history',
                signature: 'pv_signature'
            };

            Object.entries(keys).forEach(([dataKey, storageKey]) => {
                if (data[dataKey]) {
                    safeLocalStorageSetItem(storageKey, data[dataKey]);
                }
            });

            initializeAppState();
            showToast('Progress imported successfully');
        } catch (error) {
            showToast('Invalid progress file');
        }
    };
    reader.readAsText(file);
}

// ===== TOAST NOTIFICATION =====
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== AUTO-SAVE INDICATOR =====
function showAutoSave() {
    const indicator = document.getElementById('autoSaveIndicator');
    indicator.classList.add('show');

    setTimeout(() => {
        indicator.classList.remove('show');
    }, 1500);
}

// ===== SHARE =====
function sharePlan() {
    const isFileProtocol = window.location.protocol === 'file:';

    if (isFileProtocol) {
        exportProgressData();
        showToast('Opened locally — progress exported instead of sharing URL');
        return;
    }

    if (navigator.share) {
        navigator.share({
            title: 'Prime Vanguard - 4-Week Fitness Plan',
            text: 'Check out my Prime Vanguard fitness transformation plan!',
            url: window.location.href
        }).catch(() => {
            copyToClipboard();
        });
    } else {
        copyToClipboard();
    }
}

function copyToClipboard() {
    if (window.location.protocol === 'file:') {
        exportProgressData();
        return;
    }

    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Link copied to clipboard!');
    }).catch(() => {
        showToast('Share this page with your brothers!');
    });
}

// ===== EVENT DELEGATION =====
function setupEventDelegation() {
    document.body.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;

        const action = actionEl.dataset.action;
        switch (action) {
            case 'scroll-cover':
                scrollToSection('cover');
                break;
            case 'scroll-analysis':
                scrollToSection('analysis');
                break;
            case 'toggle-mobile-menu':
                toggleMobileMenu();
                break;
            case 'print':
                window.print();
                break;
            case 'sync':
                saveAllData();
                break;
            case 'export':
                exportProgressData();
                break;
            case 'scroll-top':
                scrollToTop();
                break;
            case 'open-timer':
                openRestTimer(90);
                break;
            case 'share':
                sharePlan();
                break;
            case 'close-timer':
                closeRestTimer();
                break;
            default:
                break;
        }
    });

    document.querySelectorAll('.exercise-item').forEach(item => {
        item.addEventListener('click', (e) => handleExerciseItemClick(item, e));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleExerciseItemClick(item, e);
            }
        });
    });

    const importInput = document.getElementById('importProgressInput');
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                importProgressData(e.target.files[0]);
                e.target.value = '';
            }
        });
    }

    document.querySelector('.nav-logo')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToSection('cover');
        }
    });

    document.querySelectorAll('.mobile-menu a[data-action="toggle-mobile-menu"]').forEach(link => {
        link.addEventListener('click', () => {
            const menu = document.getElementById('mobileMenu');
            if (menu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    const modal = document.getElementById('restTimerModal');
    if (modal) {
        modal.addEventListener('click', handleModalBackdropClick);
    }
}

// ===== MEMBER UI =====
function applyMemberConfig() {
    const nameEl = document.querySelector('.member-name');
    if (nameEl) nameEl.textContent = memberConfig.name;

    const durationEl = document.querySelector('.program-duration');
    if (durationEl) {
        durationEl.textContent = memberConfig.programDuration || `Starting Weight: ${memberConfig.startingWeight.toFixed(1)} kg | 4-Week Target: ${memberConfig.fourWeekTargetMin}-${memberConfig.fourWeekTargetMax} kg | Long-Term: ${memberConfig.longTermTarget} kg`;
    }

    const commitment = document.querySelector('.commitment-text-name');
    if (commitment) {
        commitment.textContent = memberConfig.name;
    }

    const longTermTargetEl = document.getElementById('longTermTarget');
    if (longTermTargetEl) {
        longTermTargetEl.textContent = memberConfig.longTermTarget > 0
            ? memberConfig.longTermTarget.toFixed(1) + ' kg'
            : '35%+';
    }

    const fourWeekTargetEl = document.getElementById('fourWeekTarget');
    if (fourWeekTargetEl) {
        fourWeekTargetEl.textContent = memberConfig.fourWeekTargetMin > 0
            ? `${memberConfig.fourWeekTargetMin}-${memberConfig.fourWeekTargetMax} kg`
            : 'Under 9';
    }
}

function initializeAppState() {
    loadWorkoutAProgress();
    loadWorkoutBProgress();
    initWaterTracker();
    loadCheckIn();
    loadMealProgress();
    loadExerciseWeights();
    loadShoppingList();
    loadExerciseNames();
    loadMealItems();
    loadSignature();
    updateWorkoutAProgress();
    updateWorkoutBProgress();
    updateWeightDisplay();
    drawWeightChart();

    const weightDate = document.getElementById('weightDate');
    if (weightDate) {
        weightDate.value = getTodayKey();
    }
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('restTimerModal');
        if (modal.classList.contains('active')) {
            closeRestTimer();
            return;
        }

        const menu = document.getElementById('mobileMenu');
        if (menu.classList.contains('active')) {
            toggleMobileMenu();
        }
    }
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    applyMemberConfig();
    migrateShoppingTextKeys();
    shoppingDefaults = captureShoppingDefaults();

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    const weightInput = document.getElementById('weightInput');
    if (weightInput) {
        weightInput.addEventListener('input', function () {
            const validationMsg = document.getElementById('weightInputValidation');
            const value = parseFloat(this.value);

            this.classList.remove('input-error', 'input-success');
            validationMsg.textContent = '';
            validationMsg.classList.remove('error', 'success');

            if (this.value && (value <= 0 || value > 300)) {
                this.classList.add('input-error');
                validationMsg.textContent = value <= 0 ? 'Weight must be greater than 0' : 'Weight seems too high (max 300kg)';
                validationMsg.classList.add('error');
            }
        });
    }

    document.querySelectorAll('.progress-table input[data-field]').forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(input.saveTimeout);
            input.saveTimeout = setTimeout(saveCheckIn, 1000);
        });
    });

    setupEventDelegation();

    const oldProgress = safeLocalStorageGetItem('pv_workout_progress');
    if (oldProgress && !safeLocalStorageGetItem('pv_workout_a_progress')) {
        safeLocalStorageSetItem('pv_workout_a_progress', oldProgress);
        safeLocalStorageRemoveItem('pv_workout_progress');
    }

    initializeAppState();

    window.addEventListener('resize', () => {
        drawWeightChart();
    });
});
