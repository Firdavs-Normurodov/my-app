//app.js
export function app() {
  // PWA Installation
  let deferredPrompt;
  const installBanner = document.getElementById("installBanner");
  const installBtn = document.getElementById("installBtn");
  const dismissBtn = document.getElementById("dismissBtn");

  // Check if already installed
  if (window.matchMedia("(display-mode: standalone)").matches) {
    installBanner.style.display = "none";
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.classList.add("show");
  });

  installBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBanner.classList.remove("show");
    }
  });

  dismissBtn.addEventListener("click", () => {
    installBanner.classList.remove("show");
  });

  // Schedule data
  const scheduleData = {
    1: [
      // Dushanba
      ["06:00 – 06:30", "Uyg'onish, yengil badantarbiya"],
      ["06:30 – 07:30", "Matematika / Fikrlash"],
      ["07:30 – 08:30", "Nonushta + tayyorlanish"],
      ["09:00 – 13:00", "Web Practicum darsi"],
      ["13:00 – 14:00", "Tushlik + dam olish"],
      ["14:00 – 17:00", "Web Practicum uyga vazifa + chuqurroq o'rganish"],
      ["17:00 – 19:30", "C tili (asosiy blok)"],
      ["19:30 – 20:00", "Qur'on o'qish / sokin vaqt"],
      ["20:00 – 21:30", "Erkin vaqt yoki takrorlash"],
      ["21:30 – 22:00", "Tayyorlanish + sokinlik"],
    ],
    2: [
      // Seshanba
      ["06:00 – 06:30", "Uyg'onish, yengil badantarbiya"],
      ["06:30 – 08:00", "Matematika / Fikrlash"],
      ["08:00 – 09:00", "Nonushta + tayyorlanish"],
      ["09:00 – 12:00", "C tili (asosiy blok)"],
      ["13:00 – 16:00", "Web Practicum uyga vazifa / qo'shimcha bilim"],
      ["16:00 – 17:30", "Algoritmik masalalar / Leetcode"],
      ["17:30 – 19:30", "C amaliyoti yoki Web Practicum yoki Rust/Go"],
      ["19:30 – 20:00", "Qur'on o'qish / sokin vaqt"],
      ["20:00 – 21:30", "Erkin vaqt"],
    ],
    0: [
      // Yakshanba
      ["07:00 – 08:00", "Uyg'onish + Qur'on o'qish"],
      ["08:00 – 09:00", "Yengil nonushta + dam"],
      ["09:00 – 12:00", "Haftalik takrorlash + o'zini tahlil qilish"],
      ["14:00 – 16:00", "Erkin o'rganish (kitob, video, Rust/Go tanishtiruv)"],
      ["18:00 – 19:30", "Qur'on + sokinlik"],
      ["20:00 – 21:00", "Haftalik reja yozish"],
    ],
  };

  // Copy schedules for other days
  scheduleData[3] = scheduleData[1]; // Chorshanba = Dushanba
  scheduleData[4] = scheduleData[2]; // Payshanba = Seshanba
  scheduleData[5] = scheduleData[1]; // Juma = Dushanba
  scheduleData[6] = scheduleData[2]; // Shanba = Seshanba

  // Global variables
  let currentDate = new Date();
  let selectedDate = null;
  const startDate = new Date(2025, 6, 15); // July is month 6 (0-indexed)
  const today = new Date();

  // Month names in Uzbek
  const monthNames = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];

  // Initialize app
  function init() {
    generateCalendar();
    updateStats();
    setupEventListeners();
  }

  // Generate calendar
  function generateCalendar() {
    const calendarGrid = document.getElementById("calendarGrid");
    const calendarTitle = document.getElementById("calendarTitle");

    calendarTitle.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    calendarGrid.innerHTML = "";

    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    const startingDayOfWeek = firstDay.getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day other-month";
      calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";
      dayElement.textContent = day;

      const dayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day,
      );
      const dayOfWeek = dayDate.getDay();

      // Add classes for styling
      if (dayOfWeek === 0) {
        dayElement.classList.add("weekend");
      }

      if (dayDate.toDateString() === today.toDateString()) {
        dayElement.classList.add("today");
      }

      if (dayDate >= startDate) {
        dayElement.classList.add("has-schedule");
      }

      // Add click event
      dayElement.addEventListener("click", () => {
        if (dayDate >= startDate) {
          selectedDate = dayDate;
          showSchedule(dayDate);
        }
      });

      calendarGrid.appendChild(dayElement);
    }
  }

  // Show schedule modal
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
       <div class="schedule-time">
         <i class="fas fa-clock"></i>
         ${time}
       </div>
       <div class="schedule-task">${task}</div>
     `;
        scheduleContent.appendChild(item);
      });
    } else {
      scheduleContent.innerHTML = "<p>Bu kun uchun reja mavjud emas.</p>";
    }

    modal.classList.add("show");
  }

  // Get day name in Uzbek
  function getDayName(dayOfWeek) {
    const days = [
      "Yakshanba",
      "Dushanba",
      "Seshanba",
      "Chorshanba",
      "Payshanba",
      "Juma",
      "Shanba",
    ];
    return days[dayOfWeek];
  }

  // Update statistics
  function updateStats() {
    const currentDayElement = document.getElementById("currentDay");
    const completedDaysElement = document.getElementById("completedDays");
    const totalDaysElement = document.getElementById("totalDays");
    const progressPercentElement = document.getElementById("progressPercent");

    const daysSinceStart = Math.floor(
      (today - startDate) / (1000 * 60 * 60 * 24),
    );
    const completedDays = Math.max(0, daysSinceStart);
    const totalDays = 30; // Assuming 30 days program
    const progress = Math.min(
      100,
      Math.round((completedDays / totalDays) * 100),
    );

    currentDayElement.textContent = Math.max(1, daysSinceStart + 1);
    completedDaysElement.textContent = completedDays;
    totalDaysElement.textContent = totalDays;
    progressPercentElement.textContent = `${progress}%`;
  }

  // Setup event listeners
  function setupEventListeners() {
    // Modal close
    document.getElementById("closeModal").addEventListener("click", () => {
      document.getElementById("scheduleModal").classList.remove("show");
    });

    // Modal background click
    document.getElementById("scheduleModal").addEventListener("click", (e) => {
      if (e.target === document.getElementById("scheduleModal")) {
        document.getElementById("scheduleModal").classList.remove("show");
      }
    });

    // Calendar navigation
    document.getElementById("prevMonth").addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      generateCalendar();
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      generateCalendar();
    });

    // Today button
    document.getElementById("todayBtn").addEventListener("click", () => {
      currentDate = new Date();
      generateCalendar();

      // Show today's schedule if available
      if (today >= startDate) {
        showSchedule(today);
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.getElementById("scheduleModal").classList.remove("show");
      }
    });
  }

  // Service Worker registration
  if ("serviceWorker" in navigator) {
    const swCode = `
   const CACHE_NAME = 'dars-reja-v1';
   const urlsToCache = [
     '/',
     'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
   ];

   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then((cache) => cache.addAll(urlsToCache))
     );
   });

   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request)
         .then((response) => {
           if (response) {
             return response;
           }
           return fetch(event.request);
         })
     );
   });
  `;

    const blob = new Blob([swCode], { type: "text/javascript" });
    const swUrl = URL.createObjectURL(blob);

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("Service Worker registered successfully");
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  }

  // Initialize app when DOM is loaded
  document.addEventListener("DOMContentLoaded", init);

  // Add some smooth animations
  const style = document.createElement("style");
  style.textContent = `
  @keyframes pulse {
   0% { transform: scale(1); }
   50% { transform: scale(1.05); }
   100% { transform: scale(1); }
  }

  .calendar-day.today {
   animation: pulse 2s infinite;
  }

  .schedule-item {
   animation: fadeIn 0.3s ease-out;
  }

  .schedule-item:nth-child(odd) {
   animation-delay: 0.1s;
  }

  .schedule-item:nth-child(even) {
   animation-delay: 0.2s;
  }
  `;
  document.head.appendChild(style);
}
