import { check, sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

/**
 * SPIKE ТЕСТУВАННЯ (Спайк-тест)
 *
 * Мета: Перевірити поведінку системи при раптових сплесках навантаження
 *
 * Коли використовувати:
 * - Для систем, що можуть зіткнутися з різкими стрибками трафіку
 * - Перед очікуваними подіями (розпродажі, запуск продукту, рекламні кампанії)
 * - Для тестування автоматичного масштабування
 *
 * Характеристики:
 * - Різке зростання навантаження з мінімальним ramp-up
 * - Екстремально високий рівень навантаження (500 користувачів)
 * - Короткий або відсутній період пікового навантаження
 * - Може включати інші процеси, ніж у звичайних тестах
 * - Помилки очікувані та нормальні
 *
 * Реальні сценарії spike-навантаження:
 * - Продаж квитків на популярні концерти
 * - Запуск нових продуктів (PlayStation, iPhone)
 * - Рекламні кампанії під час Супербоулу
 * - Black Friday розпродажі
 * - Дедлайни подачі декларацій
 */
export const options: Options = {
  cloud: {
    stages: [
      { duration: "2m", target: 10 }, // мінімальний базовий рівень
      { duration: "1m", target: 500 }, // різкий сплеск до екстремального рівня
      { duration: "3m", target: 500 }, // короткий період пікового навантаження
      { duration: "1m", target: 10 }, // різке падіння
      { duration: "2m", target: 0 }, // повне завершення
    ],
    distribution: {
      "amazon:de:frankfurt": { loadZone: "amazon:de:frankfurt", percent: 100 },
    },
    projectID: 4087876,
    name: "Pizza Spike Test - Тестування раптових сплесків навантаження",
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
      timeout: "30s", // збільшений timeout для spike умов
    }
  );

  const json = response.json();
  const token = json!["token"];

  return { token };
}

export default function ({ token }) {
  const response = http.post(
    "https://quickpizza.grafana.com/api/pizza",
    JSON.stringify({
      maxCaloriesPerSlice: 800 + Math.floor(Math.random() * 400), // варіативність
      mustBeVegetarian: Math.random() > 0.8,
      excludedIngredients: [],
      excludedTools: [],
      maxNumberOfToppings: Math.floor(Math.random() * 6) + 2,
      minNumberOfToppings: 1,
    }),
    {
      headers: token
        ? {
            authorization: `Token ${token}`,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          },
      timeout: "15s", // збільшений timeout
    }
  );

  check(response, {
    "Система відповідає": (r) => r.status > 0, // будь-яка відповідь краща за timeout
    "Не критична помилка": (r) =>
      r.status !== 500 && r.status !== 502 && r.status !== 503,
    "Розумний час відповіді": (r) => r.timings.duration < 5000, // до 5 секунд
    "З'єднання встановлено": (r) => r.timings.connecting < 1000,
  });
}