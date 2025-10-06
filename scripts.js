let timer;
let lastDuration = 0;
let isPaused = false;
let timeLeft = 0;
let setsCompleted = 0;
let totalRestTime = 0;
let currentWeek = 1;
let currentSession = 1;
let workoutData = {};

const programData = {
  1: {
    1: [
      { name: "Développé couché haltères ou barre", sets: 4, reps: "10-12" },
      { name: "Développé militaire assis", sets: 3, reps: "10" },
      { name: "Élévations latérales + oiseau (superset)", sets: 3, reps: "15" },
      { name: "Dips poulie ou banc", sets: 3, reps: "12" },
      { name: "Extension triceps à la corde", sets: 3, reps: "15" },
    ],
    2: [
      { name: "Squat ou Hack squat barre guidée", sets: 4, reps: "10" },
      { name: "Fentes marchées haltères", sets: 3, reps: "12" },
      { name: "Leg curl machine", sets: 3, reps: "12" },
      { name: "Mollets debout", sets: 4, reps: "15" },
      { name: "Gainage dynamique ou planche lestée", sets: 3, reps: "40s" },
    ],
    3: [
      {
        name: "Tractions pronation ou tirage vertical",
        sets: 4,
        reps: "10-12",
      },
      { name: "Rowing unilatéral haltère", sets: 3, reps: "12/bras" },
      { name: "Curl incliné + marteau (superset)", sets: 3, reps: "10/10" },
      { name: "Crunch avec disque ou poulie", sets: 3, reps: "15" },
      { name: "Roue abdos (contrôlée)", sets: 3, reps: "max" },
    ],
  },
};

programData[2] = JSON.parse(JSON.stringify(programData[1]));
programData[3] = JSON.parse(JSON.stringify(programData[1]));
programData[4] = JSON.parse(JSON.stringify(programData[1]));

// Navigation
function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));

  document.getElementById(pageId).classList.add("active");
  event.target.classList.add("active");

  const menu = document.querySelector(".nav-menu");
  const burger = document.querySelector(".burger");
  const overlay = document.querySelector(".menu-overlay");
  menu.classList.remove("active");
  burger.classList.remove("active");
  overlay.classList.remove("active");
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  const menu = document.querySelector(".nav-menu");
  const burger = document.querySelector(".burger");
  const overlay = document.querySelector(".menu-overlay");
  menu.classList.toggle("active");
  burger.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("menu-open");
}

// Calcul 1RM
function calculate() {
  const oneRM = parseFloat(document.getElementById("oneRM").value);
  if (oneRM) {
    document.getElementById("p60").textContent = (oneRM * 0.6).toFixed(1);
    document.getElementById("p65").textContent = (oneRM * 0.65).toFixed(1);
    document.getElementById("p70").textContent = (oneRM * 0.7).toFixed(1);
    document.getElementById("p75").textContent = (oneRM * 0.75).toFixed(1);
    document.getElementById("p80").textContent = (oneRM * 0.8).toFixed(1);
    document.getElementById("p85").textContent = (oneRM * 0.85).toFixed(1);
    document.getElementById("p90").textContent = (oneRM * 0.9).toFixed(1);
    document.getElementById("p95").textContent = (oneRM * 0.95).toFixed(1);
  }
}

// Timer
function startTimer(seconds) {
  clearInterval(timer);
  isPaused = false;
  document.getElementById("pauseText").textContent = "Pause";
  lastDuration = seconds;
  timeLeft = seconds;
  updateDisplay(timeLeft);

  timer = setInterval(function () {
    if (!isPaused) {
      timeLeft--;
      updateDisplay(timeLeft);

      const display = document.getElementById("countdown");
      if (timeLeft <= 5 && timeLeft > 0) {
        display.className = "warning";
        if (navigator.vibrate) navigator.vibrate(100);
      } else if (timeLeft <= 0) {
        clearInterval(timer);
        display.className = "finished";
        display.textContent = "TERMINÉ !";
        document.getElementById("beep").play();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

        setsCompleted++;
        totalRestTime += lastDuration;
        updateStats();
        addToHistory(lastDuration);

        setTimeout(function () {
          display.className = "";
          updateDisplay(0);
        }, 3000);
      } else {
        display.className = "";
      }
    }
  }, 1000);
}

function startCustomTimer() {
  const customTime = parseInt(document.getElementById("customTime").value);
  if (customTime && customTime > 0) {
    startTimer(customTime);
  }
}

function togglePause() {
  isPaused = !isPaused;
  document.getElementById("pauseText").textContent = isPaused
    ? "Reprendre"
    : "Pause";
}

function stopTimer() {
  clearInterval(timer);
  isPaused = false;
  document.getElementById("pauseText").textContent = "Pause";
  document.getElementById("countdown").className = "";
  updateDisplay(0);
}

function repeatTimer() {
  if (lastDuration > 0) {
    startTimer(lastDuration);
  }
}

function updateDisplay(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  document.getElementById("countdown").textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function updateStats() {
  document.getElementById("setsCompleted").textContent = setsCompleted;
  const mins = Math.floor(totalRestTime / 60);
  const secs = totalRestTime % 60;
  document.getElementById("totalRestTime").textContent =
    mins > 0 ? mins + "m " + secs + "s" : secs + "s";
}

function addToHistory(duration) {
  const historyDiv = document.getElementById("history");
  const time = new Date().toLocaleTimeString("fr-FR");
  const item = document.createElement("div");
  item.className = "history-item";
  item.textContent = time + " - Repos de " + duration + "s complété";
  historyDiv.insertBefore(item, historyDiv.firstChild);

  if (historyDiv.children.length > 10) {
    historyDiv.removeChild(historyDiv.lastChild);
  }
}

// Carnet d'entraînement
function selectWeek(week) {
  currentWeek = week;
  document
    .querySelectorAll(".week-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
  renderWorkout();
}

function selectSession(session) {
  currentSession = session;
  document
    .querySelectorAll(".session-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
  renderWorkout();
  loadNotes();
}

function renderWorkout() {
  const exercises = programData[currentWeek][currentSession];
  const content = document.getElementById("workoutContent");
  let html = "";

  exercises.forEach(function (exercise, exIndex) {
    html += '<div class="exercise-block">';
    html += '<div class="exercise-header">';
    html += '<div class="exercise-name">' + exercise.name + "</div>";
    html +=
      '<div class="exercise-details">' +
      exercise.sets +
      " × " +
      exercise.reps +
      "</div>";
    html += "</div>";
    html += '<div class="sets-container">';

    for (let i = 0; i < exercise.sets; i++) {
      const key = currentWeek + "-" + currentSession + "-" + exIndex + "-" + i;
      const saved = workoutData[key] || {
        weight: "",
        reps: "",
        checked: false,
      };

      html += '<div class="set-row">';
      html += '<div class="set-number">Série ' + (i + 1) + "</div>";
      html += '<div class="input-with-unit">';
      html +=
        '<input type="number" class="set-input" placeholder="Poids" value="' +
        saved.weight +
        '" onchange="saveSetData(\'' +
        key +
        "', 'weight', this.value)\">";
      html += '<span class="unit-label">kg</span>';
      html += "</div>";
      html += '<div class="input-with-unit">';
      html +=
        '<input type="number" class="set-input" placeholder="Reps" value="' +
        saved.reps +
        '" onchange="saveSetData(\'' +
        key +
        "', 'reps', this.value)\">";
      html += '<span class="unit-label">reps</span>';
      html += "</div>";
      html +=
        '<button class="check-btn ' +
        (saved.checked ? "checked" : "") +
        '" onclick="toggleCheck(\'' +
        key +
        "')\">✓</button>";
      html += "</div>";
    }

    html += "</div>";
    html += "</div>";
  });

  content.innerHTML = html;
  updateWorkoutStats();
}

function saveSetData(key, field, value) {
  if (!workoutData[key]) {
    workoutData[key] = { weight: "", reps: "", checked: false };
  }
  workoutData[key][field] = value;
  localStorage.setItem("workoutData", JSON.stringify(workoutData));
  updateWorkoutStats();
}

function toggleCheck(key) {
  if (!workoutData[key]) {
    workoutData[key] = { weight: "", reps: "", checked: false };
  }
  workoutData[key].checked = !workoutData[key].checked;
  localStorage.setItem("workoutData", JSON.stringify(workoutData));
  renderWorkout();
}

function updateWorkoutStats() {
  let totalVolume = 0;
  const completedSessions = new Set();

  for (let key in workoutData) {
    if (workoutData[key].checked) {
      const weight = parseFloat(workoutData[key].weight) || 0;
      const reps = parseFloat(workoutData[key].reps) || 0;
      totalVolume += weight * reps;

      const parts = key.split("-");
      const sessionKey = parts[0] + "-" + parts[1];
      completedSessions.add(sessionKey);
    }
  }

  let currentWeekSessions = 0;
  for (let i = 1; i <= 3; i++) {
    const sessionKey = currentWeek + "-" + i;
    if (completedSessions.has(sessionKey)) {
      currentWeekSessions++;
    }
  }

  document.getElementById("totalSessions").textContent = completedSessions.size;
  document.getElementById("weekSessions").textContent =
    currentWeekSessions + "/3";
  document.getElementById("totalVolume").textContent = totalVolume.toFixed(0);

  const maxSessions = 12;
  const progression = ((completedSessions.size / maxSessions) * 100).toFixed(0);
  document.getElementById("progression").textContent = progression + "%";
}

function saveWorkout() {
  localStorage.setItem("workoutData", JSON.stringify(workoutData));
  alert("✅ Séance sauvegardée avec succès !");
}

function resetWorkout() {
  if (confirm("⚠️ Êtes-vous sûr de vouloir réinitialiser cette séance ?")) {
    for (let key in workoutData) {
      const parts = key.split("-");
      if (
        parseInt(parts[0]) === currentWeek &&
        parseInt(parts[1]) === currentSession
      ) {
        delete workoutData[key];
      }
    }
    localStorage.setItem("workoutData", JSON.stringify(workoutData));
    renderWorkout();
  }
}

function exportWorkout() {
  let exportText =
    "CYCLE VOLUME - Semaine " +
    currentWeek +
    " - Séance " +
    currentSession +
    "\n";
  exportText += "=".repeat(50) + "\n\n";

  const exercises = programData[currentWeek][currentSession];
  exercises.forEach(function (exercise, exIndex) {
    exportText +=
      exercise.name + " (" + exercise.sets + "×" + exercise.reps + ")\n";

    for (let i = 0; i < exercise.sets; i++) {
      const key = currentWeek + "-" + currentSession + "-" + exIndex + "-" + i;
      const saved = workoutData[key] || {
        weight: "-",
        reps: "-",
        checked: false,
      };
      const status = saved.checked ? "✓" : "○";
      exportText +=
        "  Série " +
        (i + 1) +
        ": " +
        saved.weight +
        "kg × " +
        saved.reps +
        " reps " +
        status +
        "\n";
    }
    exportText += "\n";
  });

  const notes = document.getElementById("sessionNotes").value;
  if (notes) {
    exportText += "NOTES:\n" + notes + "\n";
  }

  const blob = new Blob([exportText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "seance_semaine" + currentWeek + "_" + currentSession + ".txt";
  a.click();
}

function saveNotes() {
  const notes = document.getElementById("sessionNotes").value;
  const key = "notes-" + currentWeek + "-" + currentSession;
  localStorage.setItem(key, notes);
  alert("📝 Notes sauvegardées !");
}

function loadNotes() {
  const key = "notes-" + currentWeek + "-" + currentSession;
  const notes = localStorage.getItem(key) || "";
  document.getElementById("sessionNotes").value = notes;
}

window.onload = function () {
  const saved = localStorage.getItem("workoutData");
  if (saved) {
    workoutData = JSON.parse(saved);
  }
  renderWorkout();
  loadNotes();
};
