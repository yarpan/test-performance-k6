import { check } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

// vus (virtual users) — кількість одночасних "віртуальних користувачів", які імітують навантаження на систему.
// duration — тривалість тесту
// iterations — загальна кількість ітерацій (запитів), які буде виконано під час тесту.

// Налаштування тесту: 2 віртуальних користувача, тривалість 5 секунд
export const options: Options = {
  cloud: {
    distribution: {
      "amazon:de:frankfurt": { loadZone: "amazon:de:frankfurt", percent: 100 },
    },
    projectID: 4087876,
    name: "get pizza receipt",
  },
  vus: 1,
  duration: "30s",
  // iterations: 150, // можна використовувати для фіксованої кількості запитів
};

// Функція setup виконується один раз перед стартом тесту.
export function setup() {
  const response = http.post(
    "https://quickpizza.grafana.com/api/users/token/login",
    JSON.stringify({
      username: "default",
      password: "12345678",
    })
  );

  const json = response.json();
  const token = json!["token"];

  return { token };
}

// Основна функція виконується кожним віртуальним користувачем.
// Вона надсилає запит на створення піци та перевіряє статус відповіді.
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
      customName: "",
    }),
    {
      headers: {
        authorization: `Token ${token}`,
      },
    }
  );

  check(response, {
    "Status-code": (response) => response.status === 200,
    "Request-duration": (response) => response.timings.duration < 300,
  });
}