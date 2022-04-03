import NewsAPI from "newsapi";
const newsapi = new NewsAPI(`${process.env.NEWS_API_KEY}`);

console.log(newsapi);

export const fetchNews = async (page) => {
  try {
    const result = await newsapi.v2.everything({
      q: "bitcoin",
      sources: "bbc-news,the-verge",
      domains: "bbc.co.uk, techcrunch.com",
      language: "en",
      sortBy: "relevancy",
      page,
    });

    console.log(result);
    return result;
  } catch (error) {
      console.log(error);
    throw new Error(error);
  }
};
