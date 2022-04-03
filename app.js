import 'dotenv/config';
import { Appsignal } from "@appsignal/nodejs";

console.log(process.APPSIGNAL_PUSH_API_KEY);
const appsignal = new Appsignal({
    // active: process.env.NODE_ENV !== "development",
    active: true,
    name: process.env.APPSIGNAL_APP_NAME,
    pushApiKey: process.APPSIGNAL_PUSH_API_KEY
});

  
import express from 'express';
import { expressMiddleware } from "@appsignal/express";
import { getRedisClient } from './cacheClient.js';
import { fetchNews } from './newsClient.js';

const app = express();


const router = express.Router();

router.get('/news', async (req, res) => {
    try {
        const cacheClient = await getRedisClient();

        const key = `news${req.query.page}`;
        const newsInCache = await cacheClient.get(key);

        if (newsInCache) return res.send({ success: true, data: JSON.parse(newsInCache) });
        const newsFromApi = await fetchNews(req.query.page);

        // Add data from direct api to cache set time to live to 30minutes
        await cacheClient.set(key, JSON.stringify(newsFromApi), 'EX', 1800);

        return res.send({ success: true, data: newsFromApi })
    } catch(error) {
        res.status(400).send(error);
    }
});

app.use('/', router);

/**
 * Add tracing client
 */
app.use(expressMiddleware(appsignal));

app.listen(process.env.PORT, () => {
    console.log('Proxy server running, on port ' + process.env.PORT);
});