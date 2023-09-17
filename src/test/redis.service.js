'use strict';
const redis = require('redis');
const { promisify } = require('util');
const { redisClient } = require('../redis/init.redis');
const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);
const delAsynckey = promisify(redisClient.del).bind(redisClient);

class RedisService {
  // static acquireLock = async (productId, quantity, cartId) => {
  //   const key = `lock_v2023_${productId}`;
  //   const retryTimes = 10;
  //   const expireTime = 3000; // 3 seconds tam lock
  //   for (let i = 0; i < retryTimes.length; i++) {
  //     // Đặt khóa --> 1: thành công, 0: thất bại
  //     const result = await setnxAsync(key, expireTime);
  //     console.log(`result:::`, result);
  //     if (result === 1) {
  //       // Có quyền thực hiện các thay đổi trên tài nguyên productId
  //       const isReversation = await InventoryRepo.reservationInventory({
  //         productId,
  //         quantity,
  //         cartId
  //       });
  //       if (isReversation.modifiedCount) {
  //         await pexpire(key, expireTime);
  //         return key;
  //       }
  //       // Nếu cập nhật thất bại
  //       return null;
  //     } else {
  //       await new Promise(resolve => setTimeout(resolve, 50));
  //     }
  //   }
  // };
  // static releaseLock = async keyLock => {
  //   return await delAsynckey(keyLock);
  // };
}

module.exports = RedisService;
