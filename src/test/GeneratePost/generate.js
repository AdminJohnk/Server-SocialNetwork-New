const MongoClient = require('mongodb').MongoClient;
const faker = require('@faker-js/faker');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const url = 'mongodb+srv://socialnetwork:IsBSBM6L1CFiiQWL@socialcluster.i599n1a.mongodb.net';
const dbName = 'SocialProDEV';

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

}

async function generateData() {

    const client = await MongoClient.connect(url);

    const db = client.db(dbName);

    const collection = db.collection('posts');

    const docs = [];

    const randomId = (arrayId) => {
        const index = Math.floor(Math.random() * arrayId.length);
        return arrayId[index];
    }

    for (let i = 0; i < 900; i++) {

        const doc = {
            type: 'Post',
            scope: 'Normal',
            post_attributes: {
                user: new ObjectId(randomId(['64fac9b2545bc6a41973744c', '64fc1215bb5536f522ca979d', '650ac1e3f3563200db3b434b', '65143a4b4d4280e1868fb6de', '6550b230f0b007cd763e90ab'])),
                title: faker.allFakers.en.lorem.sentence(5),
                content: faker.allFakers.en.lorem.sentences(5),
                link: faker.allFakers.en.internet.url(),
                images: [faker.allFakers.en.image.url()],
                like_number: 0,
                save_number: 0,
                share_number: 0,
                comment_number: 0,
                view_number: 0,
                likes: [],
                shares: [],
                saves: [],
                comments: [],
                views: []
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await wait(10);
        docs.push(doc);
    }

    await collection.insertMany(docs);

    client.close();

    console.log('Generated 1 million docs');
}

generateData();