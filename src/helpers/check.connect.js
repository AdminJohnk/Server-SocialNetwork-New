'use strict';
const mongoose = require('mongoose');
const os = require('os');
const process = require('process');

// count Connect
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections: ${numConnection}`);
}

// check over load (Thông báo khi Server quá tải Connect)
const checkOverLoad = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;

        // Giả sử 1 core chịu tối đa 5 connect. Nếu vượt quá thì thông báo
        const maxConnection = numCores * 5;
        if (numConnection > maxConnection) {
            console.log('Connect overload detected!')
        }
        
        console.log('---------------------------------');
        console.log(`Number of connections: ${numConnection}`);
        console.log(`Memory usage: ${Number(memoryUsage)/(1024**2)} MB`);

    }, 5000); // Theo dõi mỗi 5s
}

module.exports = {
    countConnect, checkOverLoad,
}