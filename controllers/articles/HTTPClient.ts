import http from "k6/http";
import { Login } from "./Login.ts";
import { Articles } from "./Articles.ts";

export class HTTPClient {
  login: Login;
  articles: Articles;
  constructor(http) {
    this.login = new Login(http);
    this.articles = new Articles(http);
  }
}
