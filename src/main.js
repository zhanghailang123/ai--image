console.log('Script loaded successfully');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    // 测试按钮是否存在
    [1, 2, 3].forEach(id => {
        const button = document.getElementById(`generateButton${id}`);
        console.log(`Button ${id} exists:`, !!button);
    });

    // 添加事件监听器
    [1, 2, 3].forEach(id => {
        const button = document.getElementById(`generateButton${id}`);
        button.addEventListener('click', async () => {
            console.log(`Button ${id} clicked`);
            const prompt = document.getElementById(`promptInput${id}`).value;
            console.log(`Prompt ${id}:`, prompt);
            
            try {
                const statusElement = document.getElementById('status');
                statusElement.textContent = 'Starting image generation...';
                
                // 测试 API 调用
                const picUrls = await getPicLinkUrls(prompt);
                console.log('Received URLs:', picUrls);
                
                // 直接使用已经获取到的 URLs
                const imageUrls = await downloadImages(picUrls);
                
                // 创建容器并显示图片
                const promptContainer = document.createElement('div');
                promptContainer.id = `promptContainer${id}`;
                promptContainer.style.marginBottom = '20px';

                imageUrls.forEach((imageUrl, index) => {
                    const imgElement = document.createElement('img');
                    imgElement.src = imageUrl;
                    imgElement.classList.add('small-image');
                    imgElement.setAttribute('data-index', index);
                    promptContainer.appendChild(imgElement);
                });

                const generatedImagesContainer = document.getElementById('generatedImagesContainer');
                generatedImagesContainer.appendChild(promptContainer);

                // 添加下载按钮
                const downloadButton = document.createElement('button');
                downloadButton.textContent = `Download All Images for Prompt ${id}`;
                downloadButton.classList.add('download-button');
                downloadButton.onclick = () => {
                    imageUrls.forEach((imageUrl, index) => {
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `prompt${id}-image-${index + 1}.png`;
                        link.click();
                    });
                };
                promptContainer.appendChild(downloadButton);

                statusElement.textContent = `Images generated successfully for Prompt ${id}!`;
            } catch (error) {
                console.error('Generation Error:', error);
                document.getElementById('status').textContent = 'Error: ' + error.message;
            }
        });
    });
});

async function getPicLinkUrls(prompt) {
    console.log('Getting pic URLs for prompt:', prompt);
    const recordUuid = await API.createPics(prompt);
    console.log('Received UUID:', recordUuid);
    
    let picState = 'generating';
    let response;
    
    while (picState !== 'success') {
        console.log('Checking status...');
        response = await API.checkPicStatus(recordUuid);
        
        if (response.data && response.data.data) {
            picState = response.data.data.picState;
            console.log('Current state:', picState);
        } else {
            throw new Error('Unexpected response structure: ' + JSON.stringify(response.data));
        }
        
        if (picState !== 'success') {
            console.log('Waiting 5 seconds...');
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