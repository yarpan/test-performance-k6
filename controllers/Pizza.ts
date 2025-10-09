import http from "k6/http";

export class Pizza {
  createPizzaReceipt(token: string) {
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

    return response;
  }
}