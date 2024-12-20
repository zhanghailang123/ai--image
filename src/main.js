console.log('Script loaded successfully');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // 移除加载状态
    document.body.classList.remove('loading');
    
    // 预加载一些可能用到的资源
    const preloadImages = () => {
        const images = ['assets/images/icon2.png'];
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    };
    
    // 延迟非关键操作
    setTimeout(() => {
        preloadImages();
    }, 1000);

    const button = document.getElementById('generateButton');
    const promptInput = document.getElementById('promptInput');

    button.addEventListener('click', async () => {
        console.log('Generate button clicked');
        const prompt = promptInput.value;
        console.log('Prompt:', prompt);
        
        try {
            const statusElement = document.getElementById('status');
            statusElement.textContent = 'Starting image generation...';
            
            // 创建并显示进度条
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressContainer.appendChild(progressBar);
            statusElement.after(progressContainer);

            // 更新进度的函数
            let progress = 0;
            const updateProgress = () => {
                if (progress < 90) { // 最多到90%，留下10%给最终加载
                    progress += Math.random() * 15;
                    progressBar.style.width = `${Math.min(progress, 90)}%`;
                }
            };

            // 定期更新进度
            const progressInterval = setInterval(updateProgress, 1000);
            
            // 获取用户设置的参数
            const options = {
                model: document.getElementById('modelSelect').value,
                size: document.getElementById('sizeSelect').value,
                batchSize: document.getElementById('batchSize').value,
                negativePrompt: document.getElementById('negativePrompt').value
            };

            const picUrls = await getPicLinkUrls(prompt, options);
            console.log('Received URLs:', picUrls);
            
            // 获取到URLs后，进度条到95%
            progress = 95;
            progressBar.style.width = '95%';
            
            const imageUrls = await downloadImages(picUrls);
            
            // 下载完成，进度条到100%
            progressBar.style.width = '100%';
            
            // 等待进度条动画完成后移除
            setTimeout(() => {
                progressContainer.remove();
            }, 500);

            // 清除进度条更新定时器
            clearInterval(progressInterval);
            
            // 创建容器并显示图片
            const promptContainer = document.createElement('div');
            promptContainer.id = 'promptContainer';
            promptContainer.style.marginBottom = '20px';

            imageUrls.forEach((imageUrl, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.classList.add('small-image');
                imgElement.setAttribute('data-index', index);
                promptContainer.appendChild(imgElement);
            });

            const generatedImagesContainer = document.getElementById('generatedImagesContainer');
            generatedImagesContainer.innerHTML = '';
            generatedImagesContainer.appendChild(promptContainer);

            // 添加下载按钮
            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Download All Images';
            downloadButton.classList.add('download-button');
            downloadButton.onclick = () => {
                imageUrls.forEach((imageUrl, index) => {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = `image-${index + 1}.png`;
                    link.click();
                });
            };
            promptContainer.appendChild(downloadButton);

            statusElement.textContent = 'Images generated successfully!';
        } catch (error) {
            console.error('Generation Error:', error);
            document.getElementById('status').textContent = 'Error: ' + error.message;
            // 出错时移除进度条
            const progressContainer = document.querySelector('.progress-container');
            if (progressContainer) {
                progressContainer.remove();
            }
        }
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

// 添加性能监控
const reportPerformance = () => {
    if (window.performance) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
};

window.addEventListener('load', reportPerformance);