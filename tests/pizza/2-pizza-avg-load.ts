import { check, sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

/**
 * AVERAGE LOAD ТЕСТУВАННЯ (Тест середнього навантаження)
 *
 * Мета: Оцінити роботу системи під типовим щоденним навантаженням
 *
 * Коли використовувати:
 * - Після успішного проходження smoke-тестів
 * - Для перевірки відповідності системи продуктивним стандартам
 * - При тестуванні змін у коді або інфраструктурі
 * - Як базовий тест перед стрес-тестуванням
 *
 * Характеристики:
 * - Імітує типову кількість одночасних користувачів (100 VUs)
 * - Поступове нарощування навантаження (ramp-up 5-15% від загального часу)
 * - Тривале підтримання середнього навантаження (основна частина тесту)
 * - Період зниження навантаження (ramp-down)
 * - Збір базових метрик продуктивності
 */
export const options: Options = {
  cloud: {
    stages: [
      { duration: "5m", target: 100 }, // поступове нарощування до середнього рівня
      { duration: "30m", target: 100 }, // підтримання типового навантаження
      { duration: "5m", target: 0 }, // плавне зниження навантаження
    ],
    distribution: {
      "amazon:de:frankfurt": { loadZone: "amazon:de:frankfurt", percent: 100 },
    },
    projectID: 4087876,
    name: "Pizza Average Load Test - Тестування середнього навантаження",
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

  check(response, {
    "Авторизація для avg-load тесту": (r) => r.status === 200,
    "Токен отримано": (r) => !!r.json("token"),
  });

  const json = response.json();
  const token = json!["token"];

  return { token };
}

export default function ({ token }) {
  const response = http.post(
    "https://quickpizza.grafana.com/api/pizza",
    JSON.stringify({
      maxCaloriesPerSlice: 1000,
      mustBeVegetarian: false,
      excludedIngredients: [],
      excludedTools: [],
      maxNumberOfToppings: 5,
      minNumberOfToppings: 2,
      customName: `Average Load Pizza ${Math.random()
        .toString(36)
        .substr(2, 6)}`,
    }),
    {
      headers: {
        authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  check(response, {
    "Статус-код 200": (r) => r.status === 200,
    "Час відгуку < 300мс": (r) => r.timings.duration < 300,
  });

  // Імітація паузи користувача
  sleep(Math.random() * 2 + 1); // 1-3 секунди
}