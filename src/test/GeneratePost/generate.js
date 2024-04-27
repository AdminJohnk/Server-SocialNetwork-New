const MongoClient = require('mongodb').MongoClient;
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const { getPost } = require('./data.js');

const fs = require('fs');

// File path 
const jsonFilePath = './response.json';

if (!fs.existsSync(jsonFilePath)) {
    const path = [
        '/api/public/curators/7753/comments?page=',
        '/api/public/curators/14119/comments?page',
        '/api/public/curators/8553/comments?page='
    ]
    for (let i = 1; i <= 5; i++) {
        getPost(path[0], i);
        getPost(path[1], i);
        getPost(path[2], i);
    }
    console.log('File not exist');
    console.log('Please run node generate.js again');
}
else {

    // Read JSON file
    let rawdata = fs.readFileSync(jsonFilePath);

    // Access data
    // console.log(data.data.newsCards[0].comments[0].title);
    // Parse JSON file
    let data = JSON.parse(rawdata);

    const url = 'mongodb+srv://socialnetwork:IsBSBM6L1CFiiQWL@socialcluster.i599n1a.mongodb.net';
    const dbName = 'SocialProDEV';

    function wait(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });

    }
    const textToHTML = (text, tabSize = 4) => {
        const tab = ' '.repeat(tabSize);

        return (
            text
                .replace(/\r\n/g, '<br>')
                .replace(/\r/g, '<br>')
                .replace(/\n/g, '<br>')
                .replace(/\t/g, tab)
                // .replace(/ /g, '&nbsp;')
                .replace(/-/g, '&#8209;')
        );
    };
    async function generateData() {
        // start timer
        console.time('Start: ');

        const client = await MongoClient.connect(url);

        const db = client.db(dbName);

        const collection = db.collection('posts');

        const docs = [];

        const randomId = (arrayId) => {
            const index = Math.floor(Math.random() * arrayId.length);
            return arrayId[index];
        }

        const randomVisibility = () => {
            const index = Math.floor(Math.random() * 3);
            return ['public', 'friend', 'private'][index];
        }
        // "$regex": "https://loremflickr.com/640/480.*464$"


        for (let i = 0; i < data.data.newsCards.length; i++) {

            const doc = {
                type: 'Post',
                scope: 'Normal',
                post_attributes: {
                    user: new ObjectId(randomId(['657e980b2a10d31f45e4dbd5', '657e980ca4725f72485282c7', '657f06489c29b021b905b804', '657f0c95fa3b931ea1634863', '658165d38292f432bda2650b', '658bc78a5b46959077d7b7d7',])),
                    title: data.data.newsCards[i].comments[0].title ?? 'No title',
                    content: textToHTML(data.data.newsCards[i].comments[0].description),
                    link: faker.internet.url(),
                    images: data.data.newsCards[i]?.imageUrl ? [data.data.newsCards[i]?.imageUrl[0]?.imageUrl] : [],
                    like_number: 0,
                    save_number: 0,
                    share_number: 0,
                    comment_number: 0,
                    view_number: 0,
                    likes: [],
                    shares: [],
                    saves: [],
                    comments: [],
                },
                visibility: randomVisibility(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await wait(10);
            docs.push(doc);
        }

        await collection.insertMany(docs);

        client.close();

        console.log('Generated 1 million docs');


        // end timer
        console.timeEnd('Start: ');
    }

    generateData();
}