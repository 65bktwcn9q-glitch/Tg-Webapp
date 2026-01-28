const app = document.querySelector(".app");
const themeToggle = document.getElementById("theme-toggle");
const sheet = document.getElementById("sheet");
const sheetTitle = document.getElementById("sheet-title");
const sheetText = document.getElementById("sheet-text");
const paymentsList = document.getElementById("payments-list");
const adSlot = document.getElementById("ad-slot");
const dailyLimit = document.getElementById("daily-limit");
const dailyCount = document.getElementById("daily-count");
const weeklyCount = document.getElementById("weekly-count");
const dailyProgress = document.getElementById("daily-progress");
const weeklyProgress = document.getElementById("weekly-progress");
const weekProgress = document.getElementById("week-progress");
const aiAccuracy = document.getElementById("ai-accuracy");
const personalTracks = document.getElementById("personal-tracks");
const vipStatus = document.getElementById("vip-status");
const adsStatus = document.getElementById("ads-status");
const adsLine = document.getElementById("ads-line");
const toggleAdsButton = document.getElementById("toggle-ads");
const referralCount = document.getElementById("referral-count");
const referralProgress = document.getElementById("referral-progress");
const referralReward = document.getElementById("referral-reward");
const vipPricing = document.getElementById("vip-pricing");
const adPricing = document.getElementById("ad-pricing");
const profileName = document.getElementById("profile-name");
const profileLevel = document.getElementById("profile-level");
const profileGoal = document.getElementById("profile-goal");
const profileLocale = document.getElementById("profile-locale");
const profileStreak = document.getElementById("profile-streak");
const streakProgress = document.getElementById("streak-progress");
const startLessonButton = document.getElementById("start-lesson");
const vipCard = document.querySelector(".card.highlight");
const resumeLearningButton = document.getElementById("resume-learning");
const breakStatus = document.getElementById("break-status");
const aiPrompt = document.getElementById("ai-prompt");
const aiResponse = document.getElementById("ai-response");
const checkoutPlans = document.getElementById("checkout-plans");
const checkoutStatus = document.getElementById("checkout-status");
const checkoutStartButton = document.getElementById("checkout-start");

const sheetContent = {
  lesson: {
    title: "Диалог с DeepSeek",
    text: "Новая сессия подготовлена: тема — разговор в аэропорту. Готовы?",
  },
  vip: {
    title: "VIP доступ",
    text: "VIP увеличивает лимиты, отключает рекламу и добавляет продвинутую аналитику.",
  },
  support: {
    title: "Поддержка",
    text: "Напишите нам в Telegram: @deutschflow_support или оставьте запрос.",
  },
  terms: {
    title: "Условия",
    text: "Используя сервис, вы соглашаетесь с правилами, описывающими AI-оценку и хранение данных.",
  },
  break: {
    title: "Перерыв",
    text: "AI снизит нагрузку и напомнит, когда вернуться к занятиям.",
  },
  payments: {
    title: "Платёжные статусы",
    text: "Платежи доступны через Telegram Payments. Интеграции активны.",
  },
};

const api = {
  summary: "/api/summary",
  focus: "/api/focus",
  payments: "/api/payments",
  lesson: "/api/lesson",
  action: "/api/action",
  pricing: "/api/pricing",
  referral: "/api/referral",
  profile: "/api/profile",
  content: "/api/content",
  mode: "/api/mode",
  ad: "/api/ad",
  limits: "/api/limits",
  adminSummary: "/api/admin/summary",
  adminContent: "/api/admin/content",
  adminModeration: "/api/admin/moderation",
  ai: "/api/ai",
};

const openSheet = (key) => {
  const content = sheetContent[key];
  if (!content) return;
  sheetTitle.textContent = content.title;
  sheetText.textContent = content.text;
  sheet.classList.add("open");
};

const showSheet = (title, text) => {
  sheetTitle.textContent = title;
  sheetText.textContent = text;
  sheet.classList.add("open");
};

const closeSheet = () => sheet.classList.remove("open");

const fetchJson = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("API error:", error);
    return null;
  }
};

const setProgress = (element, value) => {
  if (!element || typeof value !== "number") return;
  const safeValue = Math.max(0, Math.min(100, value));
  element.style.width = `${safeValue}%`;
};

const updateSummary = (summary) => {
  if (!summary) return;
  if (typeof summary.dailyLimit === "number") {
    dailyLimit.textContent = String(summary.dailyLimit);
  }
  if (dailyCount) {
    dailyCount.textContent = `Сегодня: ${summary.dailyUsed}/${summary.dailyLimit}`;
  }
  if (weeklyCount) {
    weeklyCount.textContent = `Неделя: ${summary.weeklyWords}/${summary.weeklyLimit}`;
  }
  setProgress(dailyProgress, summary.dailyProgress);
  setProgress(weeklyProgress, summary.weeklyProgress);
  setProgress(weekProgress, summary.weekProgress);
  if (aiAccuracy && summary.aiAccuracy) {
    aiAccuracy.textContent = `${summary.aiAccuracy}%`;
  }
  if (personalTracks && summary.personalTracks) {
    personalTracks.textContent = String(summary.personalTracks);
  }
  if (vipStatus && summary.vipStatus) {
    vipStatus.textContent = summary.vipStatus;
  }
  if (adsStatus && typeof summary.adsEnabled === "boolean") {
    adsStatus.textContent = summary.adsEnabled ? "Реклама: вкл." : "Реклама: выкл.";
  }
  if (adsLine && typeof summary.adsEnabled === "boolean") {
    adsLine.textContent = summary.adsEnabled ? "Реклама включена" : "Реклама отключена";
  }
  if (toggleAdsButton && typeof summary.adsEnabled === "boolean") {
    toggleAdsButton.textContent = summary.adsEnabled ? "Скрыть рекламу" : "Показать рекламу";
  }
  if (startLessonButton) {
    const reachedLimit = summary.dailyUsed >= summary.dailyLimit;
    startLessonButton.disabled = reachedLimit;
    startLessonButton.textContent = reachedLimit ? "Лимит на сегодня" : "Начать урок";
  }
  if (breakStatus && typeof summary.breakActive === "boolean") {
    breakStatus.textContent = summary.breakActive ? "Перерыв активен" : "Перерыв не активен";
  }
  if (resumeLearningButton && typeof summary.breakActive === "boolean") {
    resumeLearningButton.disabled = !summary.breakActive;
  }
  if (vipCard) {
    vipCard.classList.toggle("vip-active", summary.vipStatus === "VIP активен");
  }
  if (referralCount && typeof summary.referrals === "number") {
    referralCount.textContent = `Друзья: ${summary.referrals}/${summary.referralTarget}`;
    const progressValue = Math.round((summary.referrals / summary.referralTarget) * 100);
    setProgress(referralProgress, progressValue);
  }
};

const loadPricing = () => {
  fetchJson(api.pricing).then((response) => {
    if (!response) return;
    if (vipPricing) {
      vipPricing.innerHTML = "";
      [
        `VIP месяц — ${response.vipMonthly} ${response.currency}`,
        `VIP 3 месяца — ${response.vipQuarter} ${response.currency}`,
        `VIP год — ${response.vipYear} ${response.currency}`,
      ].forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        vipPricing.appendChild(li);
      });
    }
    if (adPricing) {
      adPricing.innerHTML = "";
      [
        `Рекламный слот (неделя) — ${response.adSlotWeek} ${response.currency}`,
        `Рекламный слот (месяц) — ${response.adSlotMonth} ${response.currency}`,
      ].forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        adPricing.appendChild(li);
      });
    }
    if (checkoutPlans) {
      checkoutPlans.innerHTML = "";
      [
        { id: "month", label: `VIP месяц — ${response.vipMonthly} ${response.currency}` },
        { id: "quarter", label: `VIP 3 месяца — ${response.vipQuarter} ${response.currency}` },
        { id: "year", label: `VIP год — ${response.vipYear} ${response.currency}` },
      ].forEach((plan) => {
        const li = document.createElement("li");
        li.textContent = plan.label;
        li.dataset.plan = plan.id;
        checkoutPlans.appendChild(li);
      });
    }
  });
};

const loadReferral = () => {
  fetchJson(api.referral).then((response) => {
    if (!response) return;
    if (referralCount && referralProgress) {
      referralCount.textContent = `Друзья: ${response.referrals}/${response.referralTarget}`;
      const progressValue = Math.round(
        (response.referrals / response.referralTarget) * 100
      );
      setProgress(referralProgress, progressValue);
    }
    if (referralReward) {
      referralReward.textContent = `Награда: VIP ${response.vipRewardDays} дней`;
    }
  });
};

const loadProfile = () => {
  fetchJson(api.profile).then((response) => {
    if (!response) return;
    if (profileName) {
      profileName.textContent = response.name;
    }
    if (profileLevel) {
      profileLevel.textContent = `Уровень: ${response.level}`;
    }
    if (profileGoal) {
      profileGoal.textContent = `Цель: ${response.goals}`;
    }
    if (profileLocale) {
      profileLocale.textContent = `Язык: ${response.locale}`;
    }
    if (profileStreak && streakProgress) {
      profileStreak.textContent = `Стрик: ${response.streak} дней`;
      setProgress(streakProgress, Math.min(response.streak * 10, 100));
    }
  });
};

const loadLimits = () => {
  fetchJson(api.limits).then((response) => {
    if (!response) return;
    if (startLessonButton) {
      const reachedLimit = response.dailyUsed >= response.dailyLimit || response.breakActive;
      startLessonButton.disabled = reachedLimit;
      if (response.breakActive) {
        startLessonButton.textContent = "Пауза активна";
      } else {
        startLessonButton.textContent = reachedLimit ? "Лимит на сегодня" : "Начать урок";
      }
    }
    if (breakStatus) {
      breakStatus.textContent = response.breakActive ? "Перерыв активен" : "Перерыв не активен";
    }
    if (resumeLearningButton) {
      resumeLearningButton.disabled = !response.breakActive;
    }
  });
};

const updateTheme = () => {
  const theme = app.dataset.theme === "dark" ? "light" : "dark";
  app.dataset.theme = theme;
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.setHeaderColor(theme === "dark" ? "#0b0d1a" : "#f1f2ff");
  }
};

themeToggle.addEventListener("click", updateTheme);

sheet.addEventListener("click", (event) => {
  if (event.target === sheet) {
    closeSheet();
  }
});

document.getElementById("close-sheet").addEventListener("click", closeSheet);

document.getElementById("confirm-sheet").addEventListener("click", closeSheet);

const focusChips = document.querySelectorAll(".chip");
focusChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    focusChips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    const focus = chip.dataset.focus;
    fetchJson(api.focus, {
      method: "POST",
      body: JSON.stringify({ focus }),
    }).then((response) => {
      if (response?.summary) {
        updateSummary(response.summary);
      } else {
        const mapping = {
          travel: 12,
          work: 10,
          exam: 8,
          culture: 14,
        };
        const limit = mapping[focus] ?? 12;
        dailyLimit.textContent = String(limit);
      }
      if (response?.message) {
        sheetTitle.textContent = "Фокус обновлён";
        sheetText.textContent = response.message;
        sheet.classList.add("open");
      }
    });
  });
});

document.getElementById("start-lesson").addEventListener("click", () => {
  fetchJson(api.lesson).then((response) => {
    if (response?.summary) {
      updateSummary(response.summary);
    }
    if (response?.title && response?.text) {
      sheetTitle.textContent = response.title;
      sheetText.textContent = response.text;
      sheet.classList.add("open");
    } else {
      openSheet("lesson");
    }
  });
});

document.getElementById("open-vip").addEventListener("click", () => {
  fetchJson(api.pricing).then((response) => {
    if (response) {
      sheetTitle.textContent = "VIP планы";
      sheetText.textContent = `Месяц — ${response.vipMonthly} ${response.currency}, 3 месяца — ${response.vipQuarter} ${response.currency}, год — ${response.vipYear} ${response.currency}.`;
      sheet.classList.add("open");
    } else {
      openSheet("vip");
    }
  });
});

document.getElementById("open-support").addEventListener("click", () => {
  fetchJson(`${api.content}?key=support`).then((response) => {
    if (response?.title && response?.text) {
      showSheet(response.title, response.text);
    } else {
      openSheet("support");
    }
  });
});

document.getElementById("open-terms").addEventListener("click", () => {
  fetchJson(`${api.content}?key=terms`).then((response) => {
    if (response?.title && response?.text) {
      showSheet(response.title, response.text);
    } else {
      openSheet("terms");
    }
  });
});

document.getElementById("read-terms").addEventListener("click", () => {
  fetchJson(`${api.content}?key=terms`).then((response) => {
    if (response?.title && response?.text) {
      showSheet(response.title, response.text);
    } else {
      openSheet("terms");
    }
  });
});

document.getElementById("schedule-break").addEventListener("click", () => {
  fetchJson(api.action, {
    method: "POST",
    body: JSON.stringify({ action: "scheduleBreak" }),
  }).then((response) => {
    if (response?.summary) {
      updateSummary(response.summary);
    }
    if (response?.message) {
      showSheet("Перерыв", response.message);
    } else {
      openSheet("break");
    }
  });
});

document.getElementById("resume-learning").addEventListener("click", () => {
  fetchJson(api.action, {
    method: "POST",
    body: JSON.stringify({ action: "resumeLearning" }),
  }).then((response) => {
    if (response?.summary) {
      updateSummary(response.summary);
    }
    if (response?.message) {
      showSheet("Возвращение", response.message);
    } else {
      showSheet("Возвращение", "Вы вернулись к занятиям, лимиты восстановлены.");
    }
  });
});

document.getElementById("ask-ai").addEventListener("click", () => {
  if (!aiPrompt || !aiResponse) return;
  const prompt = aiPrompt.value.trim();
  if (!prompt) {
    aiResponse.textContent = "Введите вопрос, чтобы получить ответ от AI.";
    return;
  }
  aiResponse.textContent = "DeepSeek думает...";
  fetchJson(api.ai, {
    method: "POST",
    body: JSON.stringify({ prompt }),
  }).then((response) => {
    if (response?.reply) {
      aiResponse.textContent = response.reply;
    } else {
      aiResponse.textContent = "Не удалось получить ответ. Попробуйте позже.";
    }
  });
});

const markCheckoutSelection = (selectedId) => {
  if (!checkoutPlans) return;
  Array.from(checkoutPlans.children).forEach((item) => {
    item.classList.toggle("active", item.dataset.plan === selectedId);
  });
  if (checkoutStartButton) {
    checkoutStartButton.disabled = !selectedId;
  }
};

if (checkoutPlans) {
  checkoutPlans.addEventListener("click", (event) => {
    const target = event.target.closest("li");
    if (!target) return;
    markCheckoutSelection(target.dataset.plan);
    if (checkoutStatus) {
      checkoutStatus.textContent = `Выбран тариф: ${target.textContent}`;
    }
  });
}

if (checkoutStartButton) {
  checkoutStartButton.disabled = true;
}

document.getElementById("checkout-start").addEventListener("click", () => {
  if (!checkoutStatus) return;
  checkoutStatus.textContent = "Платёж в обработке...";
  fetchJson(api.action, {
    method: "POST",
    body: JSON.stringify({ action: "payVip" }),
  }).then((response) => {
    if (response?.summary) {
      updateSummary(response.summary);
    }
    if (response?.message) {
      checkoutStatus.textContent = response.message;
    } else {
      checkoutStatus.textContent = "Ошибка оплаты. Попробуйте позже.";
    }
  });
});

document.getElementById("checkout-reset").addEventListener("click", () => {
  if (checkoutStatus) {
    checkoutStatus.textContent = "Ожидание выбора тарифа.";
  }
  markCheckoutSelection(null);
});

document.getElementById("contact-support").addEventListener("click", () => {
  fetchJson(`${api.content}?key=contacts`).then((response) => {
    if (response?.title && response?.text) {
      sheetTitle.textContent = response.title;
      sheetText.textContent = response.text;
      sheet.classList.add("open");
    } else {
      openSheet("support");
    }
  });
});

document.getElementById("toggle-ads").addEventListener("click", () => {
  fetchJson(api.action, {
    method: "POST",
    body: JSON.stringify({ action: "toggleAds" }),
  }).then((response) => {
    if (response?.summary) {
      updateSummary(response.summary);
    }
    fetchJson(api.ad).then((adResponse) => {
      if (adResponse?.text) {
        adSlot.textContent = adResponse.text;
      }
    });
    adSlot.classList.toggle("active");
    if (response?.message) {
      sheetTitle.textContent = "Реклама";
      sheetText.textContent = response.message;
      sheet.classList.add("open");
    }
  });
});

document.getElementById("invite-friend").addEventListener("click", () => {
  fetchJson(api.action, {
    method: "POST",
    body: JSON.stringify({ action: "addReferral" }),
  }).then((response) => {
    if (response?.summary) {
      updateSummary(response.summary);
    }
    if (response?.message) {
      sheetTitle.textContent = "Реферальная система";
      sheetText.textContent = response.message;
      sheet.classList.add("open");
    }
  });
});

document.getElementById("open-reco").addEventListener("click", () => {
  fetchJson(`${api.content}?key=recommendations`).then((response) => {
    if (response?.title && response?.text) {
      showSheet(response.title, response.text);
    } else {
      showSheet(
        "Рекомендации DeepSeek",
        "Сегодня: 15 минут практики речи, 8 карточек слов и 1 диалог с ролью."
      );
    }
  });
});

document.getElementById("open-payments").addEventListener("click", () => {
  paymentsList.innerHTML = "";
  fetchJson(api.payments).then((response) => {
    const items =
      response?.methods ??
      [
        "Telegram Payments: активен",
        "Apple Pay: активен",
        "Google Pay: активен",
        "Банковские карты: активны",
      ];
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      paymentsList.appendChild(li);
    });
    if (response?.title && response?.text) {
      showSheet(response.title, response.text);
    } else {
      showSheet(
        "Платёжные статусы",
        "Платежи активны. Выберите способ, подтвердите сумму и получите VIP мгновенно."
      );
    }
  });
});

document.getElementById("pay-vip").addEventListener("click", () => {
  fetchJson(api.action, {
    method: "POST",
    body: JSON.stringify({ action: "payVip" }),
  }).then((response) => {
    if (response?.summary) {
      updateSummary(response.summary);
    }
    if (response?.message) {
      showSheet("VIP доступ", response.message);
    } else {
      openSheet("vip");
    }
  });
});

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;
    fetchJson(`${api.mode}?key=${mode}`).then((response) => {
      if (response?.title && response?.text) {
        sheetTitle.textContent = response.title;
        sheetText.textContent = response.text;
        sheet.classList.add("open");
      } else {
        sheetTitle.textContent = "Режим обучения";
        sheetText.textContent = `Вы выбрали режим: ${mode}. DeepSeek подготовит персональную сессию.`;
        sheet.classList.add("open");
      }
    });
  });
});

document.getElementById("open-privacy").addEventListener("click", () => {
  fetchJson(`${api.content}?key=privacy`).then((response) => {
    if (response?.title && response?.text) {
      showSheet(response.title, response.text);
    } else {
      showSheet(
        "Политика конфиденциальности",
        "Мы используем данные только для персонализации обучения и не передаём их третьим лицам."
      );
    }
  });
});

document.getElementById("open-contacts").addEventListener("click", () => {
  fetchJson(`${api.content}?key=contacts`).then((response) => {
    if (response?.title && response?.text) {
      showSheet(response.title, response.text);
    } else {
      showSheet(
        "Контакты",
        "Email: hello@deutschflow.ai · Telegram: @deutschflow_support · Хостинг: Vertel."
      );
    }
  });
});

document.getElementById("open-security").addEventListener("click", () => {
  fetchJson(`${api.content}?key=privacy`).then((response) => {
    if (response?.title && response?.text) {
      showSheet(response.title, response.text);
    } else {
      showSheet(
        "Безопасность",
        "Данные шифруются, доступы логируются. Вы можете удалить профиль в любой момент."
      );
    }
  });
});

document.getElementById("open-content-admin").addEventListener("click", () => {
  fetchJson(api.adminContent).then((response) => {
    if (!response) {
      showSheet("Контент", "Список контента временно недоступен. Попробуйте позже.");
      return;
    }
    showSheet(
      "Контент",
      response.map((item) => `• ${item.title} (${item.status})`).join("\n")
    );
  });
});

document.getElementById("open-analytics").addEventListener("click", () => {
  fetchJson(api.adminSummary).then((response) => {
    if (!response) {
      showSheet(
        "Аналитика",
        "Retention: 0%\nVIP конверсия: 0%\nАктивные пользователи: 0\nУроков сегодня: 0"
      );
      return;
    }
    showSheet(
      "Аналитика",
      `Retention: ${response.retention}\nVIP конверсия: ${response.vipConversion}\nАктивные пользователи: ${response.activeUsers}\nУроков сегодня: ${response.lessonsToday}`
    );
  });
});

document.getElementById("open-moderation").addEventListener("click", () => {
  fetchJson(api.adminModeration).then((response) => {
    if (!response) {
      showSheet("Модерация", "Очередь пуста. Нет запросов на проверку.");
      return;
    }
    showSheet(
      "Модерация",
      response.map((item) => `• ${item.text} (${item.status})`).join("\n")
    );
  });
});

const telegram = window.Telegram?.WebApp;
if (telegram) {
  telegram.ready();
  telegram.expand();
  telegram.setHeaderColor(app.dataset.theme === "dark" ? "#0b0d1a" : "#f1f2ff");
}

const telegramUser = telegram?.initDataUnsafe?.user;
fetchJson("/api/user", {
  method: "POST",
  body: JSON.stringify({ user: telegramUser ?? { first_name: "Гость" } }),
});

fetchJson(api.summary).then(updateSummary);
loadPricing();
loadReferral();
loadProfile();
loadLimits();

const navButtons = document.querySelectorAll(".bottom-nav__item");
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    navButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

const updateActiveNav = (sectionId) => {
  navButtons.forEach((item) => {
    item.classList.toggle("active", item.dataset.target === sectionId);
  });
};

const trackedSections = Array.from(navButtons)
  .map((button) => document.getElementById(button.dataset.target))
  .filter(Boolean);

if (trackedSections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) {
        updateActiveNav(visible.target.id);
      }
    },
    { rootMargin: "-30% 0px -50% 0px", threshold: [0.1, 0.4, 0.6] }
  );
  trackedSections.forEach((section) => observer.observe(section));
}
