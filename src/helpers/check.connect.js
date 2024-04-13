'use strict';

import { connections } from 'mongoose';
import { cpus, totalmem } from 'os';
import { memoryUsage as _memoryUsage } from 'process';

// count Connect
const countConnect = () => {
  const numConnection = connections.length;
  console.log(`Number of connections: ${numConnection}`);
};

// check over load (Thông báo khi Server quá tải Connect)
const checkOverLoad = () => {
  setInterval(() => {
    const numConnection = connections.length;
    const numCores = cpus().length;
    const memoryUsage = _memoryUsage().rss;
    const memoryTotal = totalmem();

    // Giả sử 1 core chịu tối đa 5 connect. Nếu vượt quá thì thông báo
    const maxConnection = numCores * 5;
    if (numConnection > maxConnection) {
      console.log('Connect overload detected!');
    }

    console.log('---------------------------------');
    console.log(`Number of connections: ${numConnection}`);
    console.log(`Memory usage: ${Number(memoryUsage) / 1024 ** 2}/${Number(memoryTotal) / 1024 ** 2} MB`);
  }, 5000); // Theo dõi mỗi 5s
};

export { countConnect, checkOverLoad };
