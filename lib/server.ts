import * as http from "http";
import * as https from "https";
import * as url from "url";

const port = 3000;

const server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
    const options = {
        hostname: 'browserleaks.com',
        path: request.url,
        method: request.method
    };

    const proxy = http.request(options, function (res: http.IncomingMessage) {
        if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
            const parsedUrl = url.parse(res.headers.location);

            if (parsedUrl.protocol === 'https:') {
                https.get(res.headers.location, function (res: http.IncomingMessage) {
                    res.pipe(response, {end: true});
                });
            } else {
                http.get(res.headers.location, function (res: http.IncomingMessage) {
                    res.pipe(response, {end: true});
                });
            }

            return;
        }

        res.pipe(response, {
            end: true
        });
    });

    request.pipe(proxy, {
        end: true
    });
});

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
});