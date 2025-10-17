import http from "k6/http";

export class Auth {
  http;
  readonly url: string;
  readonly headers: object;
  readonly userData: object;

  constructor(http) {
    this.http = http;
    this.url = "https://restful-booker.herokuapp.com/auth";
    this.userData = {
      username: "admin",
      password: "password123",
    };
    this.headers = { "Content-Type": "application/json" };
  }

  getToken() {
    const response = this.http.post(this.url, JSON.stringify(this.userData), {
      headers: this.headers,
    });

    const json = response.json();
    const token = json!["token"];
    return token;
  }
}