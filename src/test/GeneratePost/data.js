const https = require('https');
const fs = require('fs');

const jsonFilePath = './response.json';

function getPost(path, page) {
    const options = {
        hostname: 'gateway.careerly.vn',
        path: path + page,
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    };
    const req = https.request(options, res => {
        console.log(`Status Code: ${res.statusCode}`);

        if (!fs.existsSync(jsonFilePath)) {
            const file = fs.createWriteStream('response.json');

            res.pipe(file);

            res.on('data', d => {
                // process.stdout.write(d);
            });

            res.on('end', () => {
                // parse response data
                file.close();
            });

        } else {
            let newdata = '';
            res.on('data', d => {
                // process.stdout.write(d);
                newdata += d;
            });

            res.on('end', () => {
                // parse response data
                try {
                    newdata = JSON.parse(newdata);
                    fs.readFile(jsonFilePath, (err, data) => {

                        if (err) throw err;

                        // Parse JSON file
                        let json = JSON.parse(data);

                        // Add new data
                        json.data.newsCards = json.data.newsCards.concat(newdata.data.newsCards);

                        // Write updated JSON back to file
                        fs.writeFile(jsonFilePath, JSON.stringify(json, null, 2), err => {
                            if (err) throw err;
                            console.log('File written!');
                        });

                    });
                } catch (error) {
                    console.log(error);
                }

            });
        }
    });



    req.on('error', error => {
        console.error(error);
    });

    req.end();
}

module.exports = {
    getPost
}