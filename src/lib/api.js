console.log('API module loaded');

const API = {
    userAgents: [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    ],

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    },

    // 添加缓存机制
    cache: new Map(),

    async createPics(prompt, options = {}) {
        // 检查缓存
        const cacheKey = JSON.stringify({ prompt, options });
        if (this.cache.has(cacheKey)) {
            console.log('Using cached result');
            return this.cache.get(cacheKey);
        }

        console.log('Creating pics with prompt:', prompt);
        try {
            const headers = {
                'User-Agent': this.getRandomUserAgent(),
                'referer': 'https://stablediffusion3.net/',
                'Uniqueid': uuidv4()
            };
            const url = "https://stablediffusion3net.erweima.ai/api/v1/generate/create";
            
            // 合并默认选项和用户选项
            const payload = {
                prompt,
                negativePrompt: options.negativePrompt || "blurry, distorted, ugly, bad anatomy, text, watermark, signature, extra limbs, disfigured",
                model: options.model || "flux",
                size: options.size || "4:3",
                batchSize: options.batchSize || "2",
                imageUrl: ""
            };

            const response = await axios.post(url, payload, {headers});
            console.log('API Response:', response.data);

            // 存入缓存
            this.cache.set(cacheKey, response.data.data.recordUuid);
            return response.data.data.recordUuid;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async checkPicStatus(recordUuid) {
        console.log('Checking status for UUID:', recordUuid);
        try {
            const url = "https://stablediffusion3net.erweima.ai/api/v1/generate/record-detail";
            const params = {"recordUuid": recordUuid};
            const response = await axios.get(url, {params});
            console.log('Status Response:', response.data);
            return response;
        } catch (error) {
            console.error('Status Check Error:', error);
            throw error;
        }
    }
}; 