import { check, sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

/**
 * STRESS ТЕСТУВАННЯ (Стрес-тест)
 *
 * Мета: Перевірити поведінку системи при навантаженні вище середнього
 *
 * Коли використовувати:
 * - Після успішного проходження тестів середнього навантаження
 * - Для оцінки деградації продуктивності при підвищеному навантаженні
 * - Для визначення, чи витримує система пікові навантаження
 *
 * Характеристики:
 * - Навантаження на 50-100% вище середнього (200 користувачів проти 100 у avg-load)
 * - Довший період нарощування навантаження (10 хвилин)
 * - Тривале підтримання пікового навантаження (30 хвилин)
 * - Очікується погіршення продуктивності порівняно із середнім навантаженням
 * - Перевіряється стабільність системи при стресовому навантаженні
 */
export const options: Options = {
  cloud: {
    stages: [
      { duration: "10m", target: 200 }, // повільне нарощування до стресового рівня
      { duration: "30m", target: 200 }, // підтримання стресового навантаження
      { duration: "5m", target: 0 }, // швидке зниження навантаження
    ],
    distribution: {
      "amazon:de:frankfurt": { loadZone: "amazon:de:frankfurt", percent: 100 },
    },
    projectID: 4087876,
    name: "Pizza Stress Test - Тестування підвищеного навантаження",
  },
};

export function setup() {
  const response = http.post(
    "https://quickpizza.grafana.com/api/users/token/login",
    JSON.stringify({
      username: "default",
      password: "12345678",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  // Перевіряємо готовність системи до стрес-тестування
  const authSuccess = check(response, {
    "🔐 Авторизація для стрес-тесту": (r) => r.status === 200,
    "🔐 Токен отримано": (r) => !!r.json("token"),
  });

  const json = response.json();
  const token = json!["token"];

  return { token };
}

export default function ({ token }) {
  // Створення піци під високим навантаженням
  const response = http.post(
    "https://quickpizza.grafana.com/api/pizza",
    JSON.stringify({
      maxCaloriesPerSlice: 1000,
      mustBeVegetarian: false,
      excludedIngredients: [],
      excludedTools: [],
      maxNumberOfToppings: 5,
      minNumberOfToppings: 2,
    }),
    {
      headers: {
        authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  check(response, {
    "Запит виконано при стресі": (r) => r.status === 200,
    "Час відгуку під навантаженням": (r) => r.timings.duration < 800,
    "Система не падає": (r) => r.status !== 500 && r.status !== 503,
  });

  // Невелика пауза між запитами для імітації реального навантаження
  sleep(Math.random() * 2 + 1); // випадкова затримка 1-3 секунди
}