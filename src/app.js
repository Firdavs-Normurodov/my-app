//app.js
export function app() {
  // --- DOM ELEMENTS ---
  const loginContainer = document.getElementById("loginContainer");
  const mainContent = document.getElementById("mainContent");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const installBanner = document.getElementById("installBanner");
  const installBtn = document.getElementById("installBtn");
  const dismissBtn = document.getElementById("dismissBtn");

  // --- PWA State ---
  let deferredPrompt;

  // --- GLOBAL APP STATE ---
  let currentDate = new Date();
  let selectedDate = null;
  const startDate = new Date(2025, 6, 15); // July is month 6 (0-indexed)
  const today = new Date();
  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];
  const scheduleData = {
    1: [ // Dushanba
      ["06:00 – 06:30", "Uyg'onish, yengil badantarbiya"],
      ["06:30 – 07:30", "Nonushta + tayyorlanish"],
      ["07:40 – 08:50", "Najotga borish aftobus"],
      ["09:00 – 13:00", "Web Practicum darsi"],
      ["13:00 – 14:00", "Tushlik + dam olish"],
      ["14:00 – 17:00", "Web Practicum uyga vazifa + chuqurroq o'rganish"],
      ["17:00 – 19:30", "C tili (asosiy blok)"],
      ["19:30 – 20:00", "Qur'on o'qish / sokin vaqt"],
      ["20:00 – 21:30", "Erkin vaqt yoki takrorlash"],
      ["21:30 – 22:00", "Tayyorlanish + sokinlik"],
    ],
    2: [ // Seshanba
      ["06:00 – 06:30", "Uyg'onish, yengil badantarbiya"],
      ["07:00 – 08:30", "Matematika / Fikrlash"],
      ["08:30 – 09:00", "Nonushta + tayyorlanish"],
      ["09:00 – 12:00", "C tili (asosiy blok)"],
      ["12:00 – 13:00", "Biroz dam va ovqatlanish"],
      ["13:00 – 16:00", "Web Practicum uyga vazifa / qo'shimcha bilim"],
      ["16:00 – 17:30", "Algoritmik masalalar / Leetcode"],
      ["17:30 – 19:30", "amaliy loyiha yoki darslik"],
      ["19:30 – 20:00", "sokin vaqt"],
      ["20:00 – 21:30", "Erkin vaqt"],
    ],
    0: [ // Yakshanba
      ["07:00 – 08:00", "Uyg'onish + Qur'on o'qish"],
      ["08:00 – 09:00", "Yengil nonushta + dam"],
      ["09:00 – 12:00", "Haftalik takrorlash + o'zini tahlil qilish"],
      ["14:00 – 16:00", "Erkin o'rganish (kitob, video, Rust/Go tanishtiruv)"],
      ["18:00 – 19:30", "Qur'on + sokinlik"],
      ["20:00 – 21:00", "Haftalik reja yozish"],
    ],
  };
  scheduleData[3] = scheduleData[1]; // Chorshanba = Dushanba
  scheduleData[4] = scheduleData[2]; // Payshanba = Seshanba
  scheduleData[5] = scheduleData[1]; // Juma = Dushanba
  scheduleData[6] = scheduleData[2]; // Shanba = Seshanba


  // --- LOGIN LOGIC ---
  function handleLogin() {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      showMainContent();
      return;
    }
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;
      if (username === "firdavs007" && password === "123456") {
        sessionStorage.setItem("isLoggedIn", "true");
        showMainContent();
      } else {
        loginError.textContent = "Login yoki parol noto'g'ri!";
        setTimeout(() => { loginError.textContent = ""; }, 3000);
      }
    });
  }

  function showMainContent() {
    loginContainer.style.display = "none";
    mainContent.style.display = "block";
    init();
  }


  // --- PWA LOGIC ---
  function setupPWA() {
    // Service Worker Registration
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker: Registered"))
          .catch((err) => console.log(`Service Worker: Error: ${err}`));
      });
    }

    // Installation Prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (window.matchMedia("(display-mode: standalone)").matches) {
         installBanner.style.display = "none";
      } else {
         installBanner.classList.add("show");
      }
    });

    installBtn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        installBanner.classList.remove("show");
      }
    });

    dismissBtn.addEventListener("click", () => {
      installBanner.classList.remove("show");
    });
  }


  // --- MAIN APP LOGIC ---
  function init() {
    if (sessionStorage.getItem("isLoggedIn") !== "true") return;

    generateCalendar();
    updateStats();
    setupEventListeners();
    setupPWA(); // Setup PWA features after login

    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      .calendar-day.today { animation: pulse 2s infinite; }
      .schedule-item { animation: fadeIn 0.3s ease-out; }
      .schedule-item:nth-child(odd) { animation-delay: 0.1s; }
      .schedule-item:nth-child(even) { animation-delay: 0.2s; }
    `;
    document.head.appendChild(style);
  }

  function generateCalendar() {
    const calendarGrid = document.getElementById("calendarGrid");
    const calendarTitle = document.getElementById("calendarTitle");
    calendarTitle.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    calendarGrid.innerHTML = "";
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day other-month";
      calendarGrid.appendChild(emptyDay);
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";
      dayElement.textContent = day;
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayOfWeek = dayDate.getDay();
      if (dayOfWeek === 0) dayElement.classList.add("weekend");
      if (dayDate.toDateString() === today.toDateString()) dayElement.classList.add("today");
      if (dayDate >= startDate) dayElement.classList.add("has-schedule");
      dayElement.addEventListener("click", () => {
        if (dayDate >= startDate) {
          selectedDate = dayDate;
          showSchedule(dayDate);
        }
      });
      calendarGrid.appendChild(dayElement);
    }
  }

  function showSchedule(date) {
    const modal = document.getElementById("scheduleModal");
    const modalTitle = document.getElementById("modalTitle");
    const scheduleContent = document.getElementById("scheduleContent");
    const dayOfWeek = date.getDay();
    const schedule = scheduleData[dayOfWeek];
    modalTitle.textContent = `${date.toLocaleDateString("uz-UZ")} - ${getDayName(dayOfWeek)}`;
    scheduleContent.innerHTML = "";
    if (schedule) {
      schedule.forEach(([time, task]) => {
        const item = document.createElement("div");
        item.className = "schedule-item";
        item.innerHTML = `
          <div class="schedule-time"><i class="fas fa-clock"></i> ${time}</div>
          <div class="schedule-task">${task}</div>
        `;
        scheduleContent.appendChild(item);
      });
    } else {
      scheduleContent.innerHTML = "<p>Bu kun uchun reja mavjud emas.</p>";
    }
    modal.classList.add("show");
  }

  function getDayName(dayOfWeek) {
    const days = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
    return days[dayOfWeek];
  }

  function updateStats() {
    const currentDayElement = document.getElementById("currentDay");
    const completedDaysElement = document.getElementById("completedDays");
    const totalDaysElement = document.getElementById("totalDays");
    const progressPercentElement = document.getElementById("progressPercent");
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const completedDays = Math.max(0, daysSinceStart);
    const totalDays = 30;
    const progress = Math.min(100, Math.round((completedDays / totalDays) * 100));
    currentDayElement.textContent = Math.max(1, daysSinceStart + 1);
    completedDaysElement.textContent = completedDays;
    totalDaysElement.textContent = totalDays;
    progressPercentElement.textContent = `${progress}%`;
  }

  function setupEventListeners() {
    document.getElementById("closeModal").addEventListener("click", () => {
      document.getElementById("scheduleModal").classList.remove("show");
    });
    document.getElementById("scheduleModal").addEventListener("click", (e) => {
      if (e.target === document.getElementById("scheduleModal")) {
        document.getElementById("scheduleModal").classList.remove("show");
      }
    });
    document.getElementById("prevMonth").addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      generateCalendar();
    });
    document.getElementById("nextMonth").addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      generateCalendar();
    });
    document.getElementById("todayBtn").addEventListener("click", () => {
      currentDate = new Date();
      generateCalendar();
      if (today >= startDate) showSchedule(today);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.getElementById("scheduleModal").classList.remove("show");
      }
    });
  }

  // --- INITIALIZE LOGIN ---
  handleLogin();
}