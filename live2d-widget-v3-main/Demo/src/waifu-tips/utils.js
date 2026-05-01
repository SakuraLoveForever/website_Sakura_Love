// 随机切换
function randomSelection(obj) {
    return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
}

/**
 * 下载图片
 * @param blob 图片二进制数据
 */
function downloadBlobToPng(blob) {
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url
    a.download = "live2d.png";
    a.click();
    URL.revokeObjectURL(url);
}

export { randomSelection, downloadBlobToPng };
