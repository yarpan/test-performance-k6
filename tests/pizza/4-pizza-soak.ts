import { check, sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

/**
 * SOAK ТЕСТУВАННЯ (Тест на витривалість)
 *
 * Мета: Перевірити стабільність системи при тривалому навантаженні
 *
 * Коли використовувати:
 * - Після успішного проходження smoke, avg-load та stress тестів
 * - Для виявлення проблем, що проявляються лише через тривалий час
 * - Для перевірки стабільності продакшен-системи
 *
 * Характеристики:
 * - Середнє навантаження (100 користувачів, як в avg-load тесті)
 * - Дуже тривалий період тестування (8-72 години, тут 4 години для демонстрації)
 * - Виявляє витік пам'яті, накопичення даних, деградацію продуктивності
 * - Перевіряє довготривалу стабільність і доступність системи
 *
 * Проблеми, які виявляє soak-тест:
 * - Витік пам'яті (memory leaks)
 * - Деградація часу відгуку з часом
 * - Накопичення тимчасових файлів/даних
 * - Вичерпання ресурсів сховища
 * - Проблеми з connection pooling
 */
export const options: Options = {
  cloud: {
    stages: [
      { duration: "10m", target: 100 }, // нарощування до середнього рівня
      { duration: "4h", target: 100 }, // тривале підтримання навантаження (можна збільшити до 24-72г)
      { duration: "10m", target: 0 }, // плавне зниження
    ],
    distribution: {
      "amazon:de:frankfurt": { loadZone: "amazon:de:frankfurt", percent: 100 },
    },
    projectID: 4087876,
    name: "Pizza Soak Test - Тест витривалості системи",
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

  const json = response.json();
  const token = json!["token"];

  return {
    token,
  };
}

export default function ({ token }) {
  const response = http.post(
    "https://quickpizza.grafana.com/api/pizza",
    JSON.stringify({
      maxCaloriesPerSlice: Math.floor(Math.random() * 1000) + 500, // варіативні параметри
      mustBeVegetarian: Math.random() > 0.7, // 30% вегетаріанських
      excludedIngredients: [],
      excludedTools: [],
      maxNumberOfToppings: Math.floor(Math.random() * 8) + 3,
      minNumberOfToppings: 2,
    }),
    {
      headers: {
        authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const soakResults = check(response, {
    "Стабільна робота": (r) => r.status === 200,
    "Час відгуку стабільний": (r) => r.timings.duration < 500,
    "Без деградації з'єднання": (r) => r.timings.connecting < 50,
    "Стабільний час очікування": (r) => r.timings.waiting < 400,
    "Відсутні помилки сервера": (r) => r.status < 500,
  });
}

// Teardown - аналіз результатів тривалого тесту
export function teardown(data) {}