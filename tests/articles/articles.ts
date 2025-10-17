import { check, group } from "k6";
import http from "k6/http";
import { Options } from "k6/options";
import { HTTPClient } from "../../controllers/articles/HTTPClient.ts";

const client = new HTTPClient(http);

export const options: Options = {
  cloud: {
    distribution: {
      "amazon:de:frankfurt": { loadZone: "amazon:de:frankfurt", percent: 100 },
    },
    projectID: 4105119,
    name: "Create articles for conduit",
  },
  vus: 2,
  iterations: 2,
};

export default function () {
  const token = group("login", () => {
    const loginResponse = client.login.login();
    console.log("login status:", loginResponse.status);
    console.log("login response:", loginResponse.body);
    check(loginResponse, {
      "Status 200": (loginResponse) => loginResponse.status === 200,
    });
    return loginResponse.json()!["user"]["token"];
  });

  const slug = group("create article", () => {
    const articleResponse = client.articles.createArticle(token);
    console.log("create article status:", articleResponse.status);
    console.log("create article response:", articleResponse.body);
    check(articleResponse, {
      "Status 200": (articleResponse) => articleResponse.status === 200,
    });
    return articleResponse.json()!["article"]["slug"];
  });

  group("edit article", () => {
    const editArticleResponse = client.articles.editArticle(slug, token);
    console.log("update article status:", editArticleResponse.status);
    console.log("update article response:", editArticleResponse.body);
    check(editArticleResponse, {
      "Status 200": (editArticleResponse) => editArticleResponse.status === 200,
    });
  });

  group("delete article", () => {
    const deleteArticleResponse = client.articles.deleteArticle(slug, token);
    console.log("delete article status:", deleteArticleResponse.status);
    console.log("delete article response:", deleteArticleResponse.body);
    check(deleteArticleResponse, {
      "Status 204": (deleteArticleResponse) =>
        deleteArticleResponse.status === 204,
    });
  });
}