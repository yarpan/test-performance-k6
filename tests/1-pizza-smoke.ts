import { check } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

/**
 * SMOKE ТЕСТУВАННЯ (Димовий тест)
 *
 * Мета: Перевірити базову функціональність системи з мінімальним навантаженням
 *
 * Коли використовувати:
 * - Щоразу при створенні або оновленні тестового скрипта
 * - При оновленні коду додатка
 * - Як перший крок перед запуском інших типів тестів
 *
 * Характеристики:
 * - Мінімальна кількість віртуальних користувачів (2-5 VUs)
 * - Коротка тривалість (30 секунд - 3 хвилини)
 * - Перевіряє відсутність базових помилок
 * - Збирає базові показники продуктивності
 */
export const options: Options = {
  cloud: {
    stages: [
      { duration: "30s", target: 3 }, // швидко досягаємо 3 користувачів
      { duration: "1m", target: 3 }, // підтримуємо мінімальне навантаження
      { duration: "30s", target: 0 }, // плавно завершуємо
    ],
    distribution: {
      "amazon:de:frankfurt": { loadZone: "amazon:de:frankfurt", percent: 100 },
    },
    projectID: 4087876,
    name: "Pizza Smoke Test - Базова перевірка функціональності",
  },
  vus: 3, // мінімальна кількість користувачів
  duration: "2m", // коротка тривалість для швидкої перевірки
  thresholds: {
    // Пороги для smoke тесту більш лояльні
    http_req_duration: ["p(95)<500"], // 95% запитів повинні бути швидше 500мс
    http_req_failed: ["rate<0.1"], // менше 10% помилок
  },
};

// Функція setup виконується один раз перед стартом тесту
// Отримуємо токен авторизації для всіх користувачів
export function setup() {
  console.log("🔧 Налаштування smoke тесту - отримання токена авторизації");

  const response = http.post(
    "https://quickpizza.grafana.com/api/users/token/login",
    JSON.stringify({
      username: "default",
      password: "12345678",
    })
  );

  // Перевіряємо успішність авторизації в setup
  check(response, {
    "Авторизація успішна": (r) => r.status === 200,
    "Отримано токен": (r) => r.json("token") !== undefined,
  });

  const json = response.json();
  const token = json!["token"];

  return { token };
}

// Основна функція smoke тесту - мінімальна перевірка функціональності
export default function ({ token }) {
  // Тестуємо основний функціонал створення піци
  const response = http.post(
    "https://quickpizza.grafana.com/api/pizza",
    JSON.stringify({
      maxCaloriesPerSlice: 1000,
      mustBeVegetarian: false,
      excludedIngredients: [],
      excludedTools: [],
      maxNumberOfToppings: 5,
      minNumberOfToppings: 2,
      customName: "Smoke Test Pizza", // позначаємо тестові дані
    }),
    {
      headers: {
        authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  // Базові перевірки для smoke тесту
  check(response, {
    "Статус відповіді 200": (r) => r.status === 200,
    "Час відгуку < 300мс": (r) => r.timings.duration < 300,
    "Отримано дані піци": (r) => {
      const body = r.json();
      return !!(body && typeof body === "object");
    },
  });

  // В smoke тесті не додаємо затримки - тестуємо базову швидкодію
}

// Функція teardown виконується після завершення тесту
export function teardown() {
  console.log("🧹 Smoke тест завершено - базова функціональність перевірена");
}