'use strict';

import { HashTagsClass } from "../models/hashtag.model.js";
import PostService from "./post.service.js";

class HashTagService {
    static async getHashTagByName({ name }) {
        return await HashTagsClass.getHashTagByName({ name });
    }
    static async createOrUpdateHashTag({ rmHashtags = [], post_id, user, scope = 'Normal' }) {
        const foundPost = await PostService.getPostById({ post_id, user, scope });

        if (!foundPost) return false;
        const hashTags = foundPost.post_attributes.hashtags || []

        if (rmHashtags.length !== 0)
            for (let name of rmHashtags) {
                await HashTagsClass.createOrUpdateHashTag({ name, post_id, is_removed: true });
            }

        if (hashTags.length !== 0)
            for (let name of hashTags) {
                await HashTagsClass.createOrUpdateHashTag({ name, post_id });
            }

        return true;
    }
    static async deletePostHashTags({ post_id, user, scope = 'Normal' }) {
        const foundPost = await PostService.getPostById({ post_id, user, scope });
        if (!foundPost) return false;

        const hashTags = foundPost.post_attributes.hashtags || [];
        for (let name of hashTags) {
            await HashTagsClass.deletePostHashTags({ name, post_id });
        }
        return true;
    }
}

export default HashTagService;