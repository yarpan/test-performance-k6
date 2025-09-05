import { Base } from "./Base.ts";
// @ts-ignore
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export class Articles extends Base {
  readonly articleData: object = {
    article: {
      author: {},
      title: randomString(8),
      description: randomString(50),
      body: randomString(15),
      tagList: ["test"],
    },
  };
  readonly updatedArticle: object = {
    title: randomString(10) + "updated",
    description: randomString(50) + "updated",
    body: randomString(25),
    tagList: ["test", "k6"],
    author: {},
  };

  createArticle(token: string) {
    const articleResponse = this.http.post(
      `${this.baseUrlAPI}/articles`,
      JSON.stringify(this.articleData),
      {
        headers: {
          ...this.headers,
          Authorization: `Token ${token}`,
        },
      }
    );
    return articleResponse;
  }

  editArticle(slug: string, token: string) {
    const editArticleResponse = this.http.put(
      `${this.baseUrlAPI}/articles/${slug}`,
      JSON.stringify({
        article: {
          ...this.updatedArticle,
          slug: slug,
        },
      }),
      {
        headers: {
          ...this.headers,
          Authorization: `Token ${token}`,
        },
      }
    );
    return editArticleResponse;
  }

  deleteArticle(slug: string, token: string) {
    const deleteArticleResponse = this.http.del(
      `${this.baseUrlAPI}/articles/${slug}`,
      null,
      {
        headers: {
          ...this.headers,
          Authorization: `Token ${token}`,
        },
      }
    );
    return deleteArticleResponse;
  }
}
