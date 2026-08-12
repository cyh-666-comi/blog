// 图片压缩：最大 1200px，质量 0.7
// 压缩失败时返回原文件，保证手机端兼容
export function compressImage(file) {
  return new Promise((resolve) => {
    // HEIC 格式不支持 Canvas 处理，直接返回原文件
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      return resolve(file);
    }
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            if (width === 0 || height === 0) return resolve(file);

            const max = 1200;
            if (width > max || height > max) {
              if (width > height) { height *= max / width; width = max; }
              else { width *= max / height; height = max; }
            }
            canvas.width = Math.round(width);
            canvas.height = Math.round(height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            if (canvas.toBlob) {
              canvas.toBlob((blob) => {
                if (blob && blob.size > 0) {
                  resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                } else {
                  resolve(file);
                }
              }, 'image/jpeg', 0.7);
            } else {
              // iOS Safari 低版本不支持 toBlob，用 dataURL 替代
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              resolve(file); // 回退原文件
            }
          } catch { resolve(file); }
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    } catch {
      resolve(file);
    }
  });
}
