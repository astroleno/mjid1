# DistortionScroll 离线查看方案

## 🎯 方案概述

由于网络环境限制，我们提供两种离线查看方案：

### 方案1：静态文件包（推荐）
**优点：**
- ✅ 无需安装任何软件
- ✅ 文件体积小（约50MB）
- ✅ 兼容性最好
- ✅ 支持所有现代浏览器

**使用方法：**
1. 将整个项目文件夹打包成ZIP
2. Windows朋友解压后双击 `dist/index.html` 即可在浏览器中打开
3. 所有资源都是相对路径，完全离线可用

### 方案2：Electron桌面应用（高级）
**优点：**
- ✅ 真正的exe文件
- ✅ 全屏沉浸式体验
- ✅ 无需浏览器
- ✅ 接近原生应用体验

**使用方法：**
1. 安装Node.js环境
2. 运行 `npm install` 安装依赖
3. 运行 `npm run dist` 构建exe文件

## 📦 静态文件包制作步骤

### 第一步：准备文件
```bash
# 确保dist目录是最新的
npm run build

# 创建离线包目录
mkdir -p offline-package
cp -r dist/* offline-package/
```

### 第二步：创建启动脚本
创建 `start.bat` (Windows批处理文件)：
```batch
@echo off
echo 正在启动 DistortionScroll...
start "" "index.html"
echo 应用已启动！
pause
```

### 第三步：打包分发
```bash
# 创建ZIP包
zip -r DistortionScroll-Offline.zip offline-package/
```

## 🚀 用户体验优化

### 全屏体验
在 `dist/index.html` 中添加全屏提示：
```html
<script>
// 检测是否支持全屏
if (document.documentElement.requestFullscreen) {
  // 添加全屏提示
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F11') {
      e.preventDefault();
      document.documentElement.requestFullscreen();
    }
  });
}
</script>
```

### 离线缓存
添加Service Worker支持离线缓存：
```javascript
// sw.js
const CACHE_NAME = 'distortion-scroll-v1';
const urlsToCache = [
  './',
  './index.html',
  './assets/',
  './fonts/',
  './webm/'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});
```

## 📋 分发清单

### 静态文件包内容
- `index.html` - 主页面
- `assets/` - 编译后的JS/CSS文件
- `fonts/` - 字体文件
- `webm/` - 视频文件
- `img*.jpg` - 图片资源
- `start.bat` - Windows启动脚本
- `README.txt` - 使用说明

### 文件大小估算
- 字体文件：~50KB
- 视频文件：~20MB
- 图片文件：~15MB
- JS/CSS：~2MB
- **总计：约37MB**

## 🎨 使用说明

### Windows用户
1. 解压ZIP文件到任意目录
2. 双击 `start.bat` 启动应用
3. 按F11进入全屏模式
4. 使用鼠标滚轮或方向键浏览

### 功能特性
- **滚动变形**：鼠标滚轮触发图片变形效果
- **诗意文字**：六个章节展示不同诗意场景
- **视频播放**：自动播放对应视频内容
- **响应式设计**：适配不同屏幕尺寸

## 🔧 技术细节

### 浏览器兼容性
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### 性能优化
- 字体子集化（34KB）
- 视频压缩（WebM格式）
- 图片优化
- 资源预加载

## 📞 技术支持

如果遇到问题：
1. 确保使用现代浏览器
2. 检查文件完整性
3. 尝试刷新页面
4. 按F12查看控制台错误

---

**制作时间：** 2025年10月24日  
**版本：** v1.0.0  
**作者：** DistortionScroll Team
