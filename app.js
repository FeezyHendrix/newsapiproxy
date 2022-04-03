import { appsignal } from './appsignal.js';

// console.log(appsignal);
import 'dotenv/config';
import express from 'express';
import { expressMiddleware } from "@appsignal/express";
import { getRedisClient } from './cacheClient.js';
import { fetchNews } from './newsClient.js';

const app = express();


const router = express.Router();

router.get('/news', async (req, res) => {
    try {

        if(!req.query.page) return res.status(500).send({ error: 'Invalid params '});
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