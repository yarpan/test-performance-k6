import { check, sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

/**
 * BREAKPOINT ТЕСТУВАННЯ (Тест граничних можливостей)
 *
 * Мета: Визначити максимальні можливості системи та точку її "поломки"
 *
 * Коли використовувати:
 * - Для визначення абсолютних меж системи
 * - При плануванні масштабування інфраструктури
 * - Після значних змін у коді або архітектурі
 * - Для оптимізації вузьких місць
 *
 * Характеристики:
 * - Поступове зростання навантаження до нереальних рівнів
 * - Тест зупиняється при досягненні критичних помилок
 * - Навантаження може досягати тисяч користувачів
 * - Призначений для виявлення точки "поломки" системи
 * - НЕ запускайте в продакшені з увімкненим автоскейлінгом!
 *
 * Також називається:
 * - Capacity Testing (тестування місткості)
 * - Point Load Testing (тестування граничного навантаження)
 * - Limit Testing (тестування обмежень)
 */
export const options: Options = {
  // Увага! Цей тест може призвести до crash'у системи
  cloud: {
    stages: [
      { duration: "5m", target: 100 }, // базовий рівень
      { duration: "5m", target: 200 }, // подвоєння
      { duration: "5m", target: 400 }, // ще подвоєння
      { duration: "5m", target: 800 }, // екстремальний рівень
      { duration: "5m", target: 1200 }, // критичний рівень
      { duration: "5m", target: 1600 }, // граничний рівень
      { duration: "5m", target: 2000 }, // точка поломки
      { duration: "2m", target: 0 }, // аварійне зниження
    ],
    distribution: {
      "amazon:de:frankfurt": { loadZone: "amazon:de:frankfurt", percent: 100 },
    },
    projectID: 4087876,
    name: "Pizza Breakpoint Test - Пошук меж системи",
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
      timeout: "45s",
    }
  );

  const json = response.json();
  const token = json!["token"];

  return {
    token,
  };
}

export default function (data) {
  const { token } = data;
  const response = http.post(
    "https://quickpizza.grafana.com/api/pizza",
    JSON.stringify({
      maxCaloriesPerSlice: Math.floor(Math.random() * 1000) + 300,
      mustBeVegetarian: Math.random() > 0.8,
      excludedIngredients: [],
      excludedTools: [],
      maxNumberOfToppings: Math.floor(Math.random() * 10) + 1,
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
      timeout: "30s", // великий timeout для граничних умов
    }
  );

  check(response, {
    "Система ще працює": (r) => r.status > 0 && r.status < 600,
    "Не повний crash": (r) => r.status !== 0,
    "Сервер відповідає": (r) => r.timings.duration < 30000,
    "З'єднання можливе": (r) => r.timings.connecting < 10000,
    "Немає критичних помилок": (r) =>
      r.status !== 500 &&
      r.status !== 502 &&
      r.status !== 503 &&
      r.status !== 504,
  });

  // Агресивна поведінка - мінімальні затримки для максимального навантаження
  sleep(Math.random() * 0.3); // 0-300ms
}