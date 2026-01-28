const http = require("http");
const fs = require("fs");
const path = require("path");

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

const ensureUsersStore = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]", "utf8");
  }
};

const readUsers = () => {
  ensureUsersStore();
  const raw = fs.readFileSync(usersFile, "utf8");
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

const writeUsers = (users) => {
  ensureUsersStore();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
};

const state = {
  focus: "travel",
  dailyLimit: 12,
  dailyUsed: 7,
  weeklyWords: 34,
  weeklyLimit: 50,
  weekProgress: 68,
  aiAccuracy: 96,
  personalTracks: 4,
  isVip: false,
  adsEnabled: true,
  lastLessonTopic: "путешествии по Берлину",
  referrals: 3,
  referralTarget: 10,
  vipRewardDays: 30,
  profile: {
    name: "Kittix",
    level: "A2",
    streak: 6,
    goals: "Разговорная речь",
    locale: "RU",
  },
  breakActive: false,
  moderationQueue: [
    { id: 1, text: "Проверить сценарий «Поездка в Мюнхен»", status: "pending" },
    { id: 2, text: "Слова недели: проверить перевод", status: "pending" },
    { id: 3, text: "Новый подкаст: «Бизнес-немецкий»", status: "pending" },
  ],
  contentLibrary: [
    { id: 101, title: "Урок A1: Приветствия", status: "published" },
    { id: 102, title: "Урок A2: В ресторане", status: "draft" },
    { id: 103, title: "Подкаст: Берлин сегодня", status: "published" },
  ],
  adPartners: [
    "Goethe-Institut · курсы A1–B2 со скидкой 15%",
    "LinguaPro · интенсивы по выходным",
    "Deutsch Club · разговорные клубы онлайн",
  ],
};

const focusLimits = {
  travel: 12,
  work: 10,
  exam: 8,
  culture: 14,
};

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const buildSummary = () => ({
  dailyLimit: state.dailyLimit,
  dailyUsed: state.dailyUsed,
  dailyProgress: Math.round((state.dailyUsed / state.dailyLimit) * 100),
  weeklyWords: state.weeklyWords,
  weeklyLimit: state.weeklyLimit,
  weeklyProgress: Math.round((state.weeklyWords / state.weeklyLimit) * 100),
  weekProgress: state.weekProgress,
  aiAccuracy: state.aiAccuracy,
  personalTracks: state.personalTracks,
  vipStatus: state.isVip ? "VIP активен" : "Free доступ",
  adsEnabled: state.adsEnabled,
  referrals: state.referrals,
  referralTarget: state.referralTarget,
  breakActive: state.breakActive,
});

const pricing = {
  vipMonthly: 9.99,
  vipQuarter: 24.99,
  vipYear: 79.99,
  adSlotWeek: 49.0,
  adSlotMonth: 179.0,
  currency: "USD",
};

const content = {
  support: {
    title: "Поддержка",
    text: "Свяжитесь с нами в Telegram: @deutschflow_support. Среднее время ответа — 5 минут.",
  },
  terms: {
    title: "Условия использования",
    text: "Используя сервис, вы принимаете правила хранения данных и AI-оценивания уроков.",
  },
  privacy: {
    title: "Политика конфиденциальности",
    text: "Мы шифруем данные и не передаём их третьим лицам без вашего согласия.",
  },
  contacts: {
    title: "Контакты",
    text: "Email: hello@deutschflow.ai · Telegram: @deutschflow_support · Хостинг: Vertel",
  },
  recommendations: {
    title: "Рекомендации DeepSeek",
    text: "Сегодня: 15 минут практики речи, 8 карточек слов и 1 диалог с ролью.",
  },
};

const learningModes = {
  dialog: {
    title: "Диалоговый тренажёр",
    text: "Сценарий: заказ в кафе. AI корректирует грамматику и темп речи.",
  },
  voice: {
    title: "DeepSpeak Voice",
    text: "Произнесите фразу — получите разбор ударений и точности.",
  },
  cards: {
    title: "Карточки слов",
    text: "Подборка 8 слов на день с интервальными повторениями.",
  },
  podcast: {
    title: "Контекстные подкасты",
    text: "AI сгенерирует подкаст и транскрипт по вашим интересам.",
  },
};

const adSlot = {
  title: "Рекламный слот",
  text: "Партнёр недели: Goethe-Institut · курсы A1–B2 со скидкой 15%.",
};

const buildLimits = () => ({
  dailyUsed: state.dailyUsed,
  dailyLimit: state.dailyLimit,
  weeklyWords: state.weeklyWords,
  weeklyLimit: state.weeklyLimit,
  breakActive: state.breakActive,
});

const generateFallbackAnswer = (prompt) =>
  `Короткий ответ по запросу «${prompt}»:\n1) Пример: Ich bin gestern nach Hause gegangen.\n2) Объяснение: Perfekt = sein/haben + Partizip II.\n3) Мини-задание: составьте 2 своих предложения.`;

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
};

const sendFile = (res, filePath) => {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
};

const parseBody = (req) =>
  new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        resolve({});
      }
    });
  });

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = requestUrl;

  if (pathname === "/api/health") {
    sendJson(res, 200, { status: "ok", uptime: process.uptime() });
    return;
  }

  if (pathname === "/api/summary") {
    sendJson(res, 200, buildSummary());
    return;
  }

  if (pathname === "/api/pricing") {
    sendJson(res, 200, pricing);
    return;
  }

  if (pathname === "/api/referral") {
    sendJson(res, 200, {
      referrals: state.referrals,
      referralTarget: state.referralTarget,
      vipRewardDays: state.vipRewardDays,
    });
    return;
  }

  if (pathname === "/api/profile") {
    sendJson(res, 200, state.profile);
    return;
  }

  if (pathname === "/api/user" && req.method === "POST") {
    const body = await parseBody(req);
    const user = body.user ?? {};
    const id = user.id ?? `guest-${Date.now()}`;
    const users = readUsers();
    const existing = users.find((item) => item.id === id);
    const nextUser = {
      id,
      first_name: user.first_name ?? "Гость",
      last_name: user.last_name ?? "",
      username: user.username ?? "",
      language_code: user.language_code ?? "ru",
      last_seen: new Date().toISOString(),
    };
    if (existing) {
      Object.assign(existing, nextUser);
    } else {
      users.push(nextUser);
    }
    writeUsers(users);
    state.profile.name = nextUser.first_name || "Гость";
    state.profile.locale = nextUser.language_code?.toUpperCase() ?? "RU";
    sendJson(res, 200, nextUser);
    return;
  }

  if (pathname === "/api/content") {
    const key = requestUrl.searchParams.get("key");
    if (key && content[key]) {
      sendJson(res, 200, content[key]);
      return;
    }
    sendJson(res, 404, { error: "Content not found" });
    return;
  }

  if (pathname === "/api/mode") {
    const key = requestUrl.searchParams.get("key");
    if (key && learningModes[key]) {
      sendJson(res, 200, learningModes[key]);
      return;
    }
    sendJson(res, 404, { error: "Mode not found" });
    return;
  }

  if (pathname === "/api/ad") {
    const partner =
      state.adPartners[Math.floor(Math.random() * state.adPartners.length)] ?? adSlot.text;
    sendJson(res, 200, { ...adSlot, text: `Партнёр недели: ${partner}.` });
    return;
  }

  if (pathname === "/api/limits") {
    sendJson(res, 200, buildLimits());
    return;
  }

  if (pathname === "/api/admin/summary") {
    sendJson(res, 200, {
      activeUsers: 812,
      retention: "38%",
      vipConversion: "7.4%",
      lessonsToday: state.dailyUsed,
      adsEnabled: state.adsEnabled,
    });
    return;
  }

  if (pathname === "/api/admin/content") {
    sendJson(res, 200, state.contentLibrary);
    return;
  }

  if (pathname === "/api/admin/moderation") {
    sendJson(res, 200, state.moderationQueue);
    return;
  }

  if (pathname === "/api/admin/action" && req.method === "POST") {
    const body = await parseBody(req);
    const action = body.action;
    if (action === "resetLimits") {
      state.dailyUsed = 0;
      state.weeklyWords = 0;
      state.breakActive = false;
      const baseLimit = focusLimits[state.focus] ?? 12;
      state.dailyLimit = state.isVip ? Math.max(baseLimit, 20) : baseLimit;
      sendJson(res, 200, {
        status: "лимиты сброшены",
        message: "Лимиты сброшены, обучение доступно без ограничений на сегодня.",
        summary: buildSummary(),
      });
      return;
    }
    if (action === "toggleAdsGlobal") {
      state.adsEnabled = !state.adsEnabled;
      sendJson(res, 200, {
        status: state.adsEnabled ? "реклама включена" : "реклама выключена",
        message: state.adsEnabled
          ? "Глобальная реклама включена. Пользователи увидят рекламные слоты."
          : "Глобальная реклама отключена. Рекламные слоты скрыты.",
        summary: buildSummary(),
      });
      return;
    }
    sendJson(res, 400, { error: "Unknown admin action" });
    return;
  }

  if (pathname === "/api/payments") {
    sendJson(res, 200, {
      title: "Платёжные статусы",
      text: "Платежи активны. Выберите удобный способ и продолжайте обучение.",
      methods: [
        "Telegram Payments: активен",
        "Apple Pay: активен",
        "Google Pay: активен",
        "Банковские карты: активны",
      ],
    });
    return;
  }

  if (pathname === "/api/ai" && req.method === "POST") {
    const body = await parseBody(req);
    const prompt = String(body.prompt ?? "").trim();
    if (!prompt) {
      sendJson(res, 400, { error: "Prompt is required" });
      return;
    }
    if (!process.env.DEEPSEEK_API_KEY) {
      sendJson(res, 200, { reply: generateFallbackAnswer(prompt), source: "fallback" });
      return;
    }
    try {
      const apiUrl =
        process.env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/v1/chat/completions";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "Ты — помощник по изучению немецкого. Отвечай кратко, с примером и мини-заданием.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 220,
        }),
      });
      if (!response.ok) {
        sendJson(res, 502, { reply: generateFallbackAnswer(prompt), source: "fallback" });
        return;
      }
      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content ?? generateFallbackAnswer(prompt);
      sendJson(res, 200, { reply, source: "deepseek" });
    } catch (error) {
      sendJson(res, 502, { reply: generateFallbackAnswer(prompt), source: "fallback" });
    }
    return;
  }

  if (pathname === "/api/lesson") {
    if (state.breakActive) {
      sendJson(res, 200, {
        title: "Перерыв активен",
        text: "Вы запланировали паузу. Лимиты временно снижены. Вернитесь завтра!",
        summary: buildSummary(),
      });
      return;
    }
    if (state.dailyUsed >= state.dailyLimit) {
      sendJson(res, 429, {
        title: "Дневной лимит",
        text: "Вы достигли дневного лимита. Завтра лимиты восстановятся.",
        summary: buildSummary(),
      });
      return;
    }
    const topics = [
      "путешествии по Берлину",
      "деловой встрече",
      "разговоре в кафе",
      "покупках в магазине",
      "обсуждении культуры",
    ];
    state.lastLessonTopic = topics[Math.floor(Math.random() * topics.length)];
    state.dailyUsed = Math.min(state.dailyUsed + 1, state.dailyLimit);
    state.weeklyWords = Math.min(state.weeklyWords + 3, state.weeklyLimit);
    sendJson(res, 200, {
      title: "Диалог с DeepSeek",
      text: `Сегодняшняя тема — разговор о ${state.lastLessonTopic}. Готовы начать?`,
      summary: buildSummary(),
    });
    return;
  }

  if (pathname === "/api/focus" && req.method === "POST") {
    const body = await parseBody(req);
    const focus = body.focus;
    if (focus && focusLimits[focus]) {
      state.focus = focus;
      state.dailyLimit = focusLimits[focus];
    }
    sendJson(res, 200, {
      message: `Фокус "${focus}" активирован. Лимит уроков: ${state.dailyLimit} в день.`,
      summary: buildSummary(),
    });
    return;
  }

  if (pathname === "/api/action" && req.method === "POST") {
    const body = await parseBody(req);
    const action = body.action;
    if (action === "toggleAds") {
      state.adsEnabled = !state.adsEnabled;
      sendJson(res, 200, {
        message: state.adsEnabled
          ? "Реклама включена. Лимиты остаются базовыми."
          : "Реклама отключена. Доступно больше фокуса на уроках.",
        summary: buildSummary(),
      });
      return;
    }
    if (action === "payVip") {
      state.isVip = true;
      state.adsEnabled = false;
      state.dailyLimit = Math.max(state.dailyLimit, 20);
      sendJson(res, 200, {
        message: "VIP активирован. Лимиты расширены, реклама отключена.",
        summary: buildSummary(),
      });
      return;
    }
    if (action === "scheduleBreak") {
      state.breakActive = true;
      state.dailyLimit = Math.max(6, Math.floor(state.dailyLimit * 0.6));
      sendJson(res, 200, {
        message: "Перерыв запланирован. Напомним, когда стоит вернуться к занятиям.",
        summary: buildSummary(),
      });
      return;
    }
    if (action === "addReferral") {
      state.referrals = Math.min(state.referrals + 1, state.referralTarget);
      const rewardReached = state.referrals >= state.referralTarget;
      if (rewardReached) {
        state.isVip = true;
        state.adsEnabled = false;
      }
      sendJson(res, 200, {
        message: rewardReached
          ? `Готово! Вы получили VIP на ${state.vipRewardDays} дней.`
          : `Приглашено друзей: ${state.referrals}/${state.referralTarget}.`,
        summary: buildSummary(),
      });
      return;
    }
    if (action === "resumeLearning") {
      state.breakActive = false;
      state.dailyLimit = Math.max(state.dailyLimit, 12);
      sendJson(res, 200, {
        message: "Перерыв завершён. Лимиты восстановлены.",
        summary: buildSummary(),
      });
      return;
    }
    sendJson(res, 400, { error: "Unknown action" });
    return;
  }

  if (pathname === "/api/admin/content" && req.method === "POST") {
    const body = await parseBody(req);
    const newItem = {
      id: Date.now(),
      title: body.title ?? "Новый сценарий",
      status: body.status ?? "draft",
    };
    state.contentLibrary.unshift(newItem);
    sendJson(res, 201, newItem);
    return;
  }

  if (pathname === "/api/admin/moderation" && req.method === "POST") {
    const body = await parseBody(req);
    const target = state.moderationQueue.find((item) => item.id === body.id);
    if (target) {
      target.status = body.status ?? "resolved";
      sendJson(res, 200, target);
      return;
    }
    sendJson(res, 404, { error: "Item not found" });
    return;
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(process.cwd(), safePath === "/" ? "index.html" : safePath);
  sendFile(res, filePath);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
