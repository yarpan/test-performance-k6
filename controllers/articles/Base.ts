import http from "k6/http";

export abstract class Base {
  http;
  readonly baseUrlAPI: string;
  readonly headers: object;

  constructor(http) {
    this.http = http;
    this.baseUrlAPI = "https://conduit-api.learnwebdriverio.com/api";
    this.headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9,uk;q=0.8",
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
      Host: "conduit-api.learnwebdriverio.com",
      Origin: "https://demo.learnwebdriverio.com",
      Referer: "https://demo.learnwebdriverio.com/",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "sec-ch-ua":
        '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    };
  }
}
