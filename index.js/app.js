
import { questionBank } from "./questions.js";

const classes = [5, 6, 7, 8, 9, 10, 11];

const subjects = [
  { name: "Matematika", icon: "📐" },
  { name: "Ona tili", icon: "📖" },
  { name: "Adabiyot", icon: "📚" },
  { name: "Ingliz tili", icon: "🌍" },
  { name: "Fizika", icon: "⚛️" },
  { name: "Kimyo", icon: "🧪" },
  { name: "Biologiya", icon: "🧬" },
  { name: "Tarix", icon: "🏛️" },
  { name: "Geografiya", icon: "🌐" },
  { name: "Informatika", icon: "💻" }
];

let selectedClass = null;
let selectedSubject = null;
let selectedType = null;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswer = null;

function showPage(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "history") showHistory();
}

function renderClasses() {
  document.getElementById("classGrid").innerHTML =
    classes.map(number => `
      <div class="card class-card" data-class="${number}">
        <h3>${number}-sinf</h3>
        <p>Fanlarni ko‘rish</p>
      </div>
    `).join("");

  document.querySelectorAll("[data-class]").forEach(card => {
    card.addEventListener("click", () => {
      selectClass(Number(card.dataset.class));
    });
  });
}

function selectClass(number) {
  selectedClass = number;
  document.getElementById("subjectHeading").textContent =
    number + "-sinf fanlari";

  renderSubjects();
  showPage("subjects");
}

function renderSubjects() {
  const grid = document.getElementById("subjectGrid");

  grid.innerHTML = subjects.map((subject, index) => `
    <div class="card subject-card" data-subject-index="${index}">
      <span class="subject-icon">${subject.icon}</span>
      <h3>${subject.name}</h3>
      <p>BSB / CHSB</p>
    </div>
  `).join("");

  document.querySelectorAll("[data-subject-index]").forEach(card => {
    card.addEventListener("click", () => {
      const subject = subjects[Number(card.dataset.subjectIndex)];
      selectSubject(subject.name);
    });
  });
}

function selectSubject(subject) {
  selectedSubject = subject;

  document.getElementById("examHeading").textContent =
    `${selectedClass}-sinf ${subject} — nazorat turini tanlang`;

  showPage("examSection");
}

function startExam(type) {
  selectedType = type;

  const questions =
    questionBank[selectedClass]?.[selectedSubject]?.[type];

  if (!questions || questions.length === 0) {
    alert("Bu fan uchun savollar hali qo‘shilmagan.");
    return;
  }

  currentQuestions = questions;
  currentIndex = 0;
  score = 0;
  selectedAnswer = null;

  document.getElementById("testTitle").textContent =
    `${selectedClass}-sinf | ${selectedSubject} | ${type}`;

  showPage("testSection");
  showQuestion();
}

function showQuestion() {
  const question = currentQuestions[currentIndex];

  selectedAnswer = null;

  document.getElementById("questionCounter").textContent =
    `Savol ${currentIndex + 1} / ${currentQuestions.length}`;

  document.getElementById("progressBar").style.width =
    `${((currentIndex + 1) / currentQuestions.length) * 100}%`;

  document.getElementById("questionText").textContent =
    question.question;

  const options = document.getElementById("options");
  options.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent =
      `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", () => selectAnswer(index));
    options.appendChild(button);
  });

  document.getElementById("nextButton").textContent =
    currentIndex === currentQuestions.length - 1
      ? "Testni yakunlash"
      : "Keyingi savol";
}

function selectAnswer(index) {
  selectedAnswer = index;

  document.querySelectorAll(".option").forEach((button, i) => {
    button.classList.toggle("selected", i === index);
  });
}

function nextQuestion() {
  if (selectedAnswer === null) {
    alert("Avval javob variantini tanlang!");
    return;
  }

  if (selectedAnswer === currentQuestions[currentIndex].answer) {
    score++;
  }

  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    finishExam();
  }
}

function finishExam() {
  const total = currentQuestions.length;
  const percent = Math.round((score / total) * 100);

  document.getElementById("resultScore").textContent =
    `${score} / ${total}`;

  document.getElementById("resultPercent").textContent =
    `Natija: ${percent}%`;

  document.getElementById("resultMessage").textContent =
    percent >= 80 ? "Ajoyib natija!" :
    percent >= 60 ? "Yaxshi natija!" :
    "Yana mashq qilish tavsiya etiladi.";

  const history = JSON.parse(
    localStorage.getItem("edutestResults") || "[]"
  );

  history.unshift({
    class: selectedClass,
    subject: selectedSubject,
    type: selectedType,
    score,
    total,
    percent,
    date: new Date().toLocaleString("uz-UZ")
  });

  localStorage.setItem("edutestResults", JSON.stringify(history));
  showPage("resultSection");
}

function showHistory() {
  const history = JSON.parse(
    localStorage.getItem("edutestResults") || "[]"
  );

  const list = document.getElementById("historyList");

  if (history.length === 0) {
    list.innerHTML = '<p class="empty">Hozircha natijalar mavjud emas.</p>';
    return;
  }

  list.innerHTML = history.map(item => `
    <div class="history-item">
      <strong>${item.class}-sinf — ${item.subject}</strong><br>
      Nazorat: ${item.type}<br>
      Natija: ${item.score}/${item.total} (${item.percent}%)<br>
      ${item.date}
    </div>
  `).join("");
}

function clearHistory() {
  if (confirm("Barcha natijalarni o‘chirmoqchimisiz?")) {
    localStorage.removeItem("edutestResults");
    showHistory();
  }
}

function confirmExit() {
  if (confirm("Testdan chiqmoqchimisiz? Natija saqlanmaydi.")) {
    showPage("subjects");
  }
}

// HTML tugmalariga funksiyalarni ulash
Object.assign(window, {
  showPage,
  startExam,
  nextQuestion,
  clearHistory,
  confirmExit
});

renderClasses();
