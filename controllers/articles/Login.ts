import { Base } from "./Base.ts";

export class Login extends Base {
  readonly userData: object = {
    user: { email: __ENV.EMAIL, password: __ENV.PASSWORD },
  };

  login() {
    const response = this.http.post(
      `${this.baseUrlAPI}/users/login`,
      JSON.stringify(this.userData),
      {
        headers: this.headers,
      }
    );
    return response;
  }
}
