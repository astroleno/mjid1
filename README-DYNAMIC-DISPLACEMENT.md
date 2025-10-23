# 动态置换贴图功能实现

## 功能概述

实现了基于图片内容的智能动态置换贴图功能，完全替代了原来固定的 `noise.jpeg` 置换贴图。系统能够自动根据当前图片和滚动方向选择最合适的灰度图作为置换贴图。

## 实现原理

### 智能置换贴图选择逻辑
- **向下滚动**：使用下一张图片的灰度图作为置换贴图
- **向上滚动**：使用当前图片的灰度图作为置换贴图

### 动态配置系统
- 支持任意数量的图片（通过 `imageConfigs` 数组配置）
- 自动生成滚动触发器
- 智能检测滚动方向和当前图片索引

## 技术实现

### 1. 动态配置系统
```javascript
// 图片配置数组 - 支持任意数量的图片
this.imageConfigs = [
  { id: 'img01', path: './img01.jpg', greyPath: './grey01.jpg' },
  { id: 'img02', path: './img02.jpg', greyPath: './grey02.jpg' },
  // ... 更多图片配置
];

// 动态加载所有图片和灰度图
this.imageConfigs.forEach((config, index) => {
  this.textures[config.id] = this.loader.load(`${config.path}${ts}`);
  this.greyTextures[config.id] = this.loader.load(`${config.greyPath}${ts}`);
});
```

### 2. 智能置换贴图选择
```javascript
selectDisplacementTexture(currentIndex, direction) {
  let targetIndex;
  
  if (direction === 'down') {
    // 向下滚动：使用下一张图片的灰度图
    targetIndex = Math.min(currentIndex + 1, this.imageConfigs.length - 1);
  } else {
    // 向上滚动：使用当前图片的灰度图
    targetIndex = currentIndex;
  }
  
  const targetConfig = this.imageConfigs[targetIndex];
  const greyTexture = this.greyTextures[targetConfig.id];
  // 应用置换贴图...
}
```

### 3. 自动滚动触发器生成
```javascript
// 动态创建滚动触发器
this.imageConfigs.forEach((config, index) => {
  const sectionId = `#sec${String(index + 1).padStart(2, '0')}`;
  
  // 向下滚动触发器
  ScrollTrigger.create({
    trigger: sectionId,
    onEnter: () => {
      this.updateCurrentImageIndex(index);
      this.updateScrollDirection('down');
      this.selectDisplacementTexture(index, 'down');
    }
  });

  // 向上滚动触发器
  ScrollTrigger.create({
    trigger: sectionId,
    onEnterBack: () => {
      this.updateCurrentImageIndex(index);
      this.updateScrollDirection('up');
      this.selectDisplacementTexture(index, 'up');
    }
  });
});
```

## 效果预期

### 优势
1. **内容相关性**：变形会沿着下一张图片的结构进行
2. **视觉连贯性**：过渡效果更符合图片内容
3. **个性化**：每张图片都有独特的过渡效果
4. **可扩展性**：支持任意数量的图片，无需修改代码
5. **智能选择**：根据滚动方向自动选择最合适的置换贴图

### 具体表现
- **向下滚动**：使用下一张图片的灰度图，让变形"指向"即将显示的内容
- **向上滚动**：使用当前图片的灰度图，让变形"回归"当前内容的结构
- 如果灰度图在某个区域很亮，该区域会有强烈的位移效果
- 如果灰度图在某个区域很暗，该区域的位移效果会很小
- 这样就能实现"沿着图片内容结构进行变形"的效果

### 扩展性
- 添加新图片只需在 `imageConfigs` 数组中添加配置
- 系统会自动生成对应的滚动触发器
- 无需修改任何硬编码逻辑

## 文件结构

```
demo3/public/
├── grey01.jpg  # 第1张图片的灰度图
├── grey02.jpg  # 第2张图片的灰度图
├── grey03.jpg  # 第3张图片的灰度图
├── grey04.jpg  # 第4张图片的灰度图
├── grey05.jpg  # 第5张图片的灰度图
├── grey06.jpg  # 第6张图片的灰度图
├── img01.jpg   # 原始图片
├── img02.jpg
├── img03.jpg
├── img04.jpg
├── img05.jpg
├── img06.jpg
└── noise.jpeg  # 原始固定置换贴图（已不再使用）
```

## 调试信息

在浏览器控制台中可以看到置换贴图切换的日志：
```
置换贴图已切换到: [Texture对象]
```

## 注意事项

1. 确保所有灰度图文件都存在且可访问
2. 灰度图的质量直接影响置换效果
3. 如果某个灰度图加载失败，会回退到默认的置换贴图
4. 建议灰度图与原始图片保持相同的尺寸以获得最佳效果
