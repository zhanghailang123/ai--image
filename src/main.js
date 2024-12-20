// 这里是插件的主要逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 文本框自适应高度
    const textareas = ['promptInput1', 'promptInput2', 'promptInput3'].map(id => 
        document.getElementById(id)
    );
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });

    async function getPicLinkUrls(prompt) {
        const recordUuid = await API.createPics(prompt);
        let picState = 'generating';

        let response;
        while (picState !== 'success') {
            response = await API.checkPicStatus(recordUuid);
            if (response.data && response.data.data) {
                picState = response.data.data.picState;
            } else {
                throw new Error('Unexpected response structure: ' + JSON.stringify(response.data));
            }
            if (picState !== 'success') {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        return JSON.parse(response.data.data.picUrl).map(item => item.picUrl);
    }

    async function downloadImages(urls) {
        return Promise.all(urls.map(async url => {
            const response = await axios.get(url, {responseType: 'blob'});
            return URL.createObjectURL(response.data);
        }));
    }

    async function generateImages(prompt, promptId) {
        // ... 原generateImages函数代码 ...
    }

    // 添加事件监听器
    [1, 2, 3].forEach(id => {
        document.getElementById(`generateButton${id}`).addEventListener('click', () => {
            const prompt = document.getElementById(`promptInput${id}`).value;
            generateImages(prompt, id);
        });
    });
}); 