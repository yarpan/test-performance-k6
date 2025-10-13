import { check } from "k6";
import { Options } from "k6/options";
import { Users } from "../../controllers/Users.ts";
import { Pizza } from "../../controllers/Pizza.ts";

export const options: Options = {
  vus: 1,
  duration: "1s",
  //   iterations: 150,
};

export function setup() {
  const users = new Users();
  const tokens = users.getToken();

  return { tokens };
}

export default function ({ tokens }) {
  const pizza = new Pizza();
  const response = pizza.createPizzaReceipt(tokens);

  check(response, {
    "Status-code": (response) => response.status === 200,
    "Request-duration": (response) => response.timings.duration < 300,
  });
}

export function teardown({ token }) {
  console.log(`This is my token: ${token}`);
}