#!/bin/bash

# DistortionScroll 离线包制作脚本
# 作者：DistortionScroll Team
# 日期：2025年10月24日

echo "========================================"
echo "  DistortionScroll 离线包制作工具"
echo "========================================"
echo

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo "❌ 错误：找不到dist目录！"
    echo "请先运行 'npm run build' 构建项目"
    exit 1
fi

# 创建离线包目录
PACKAGE_NAME="DistortionScroll-Offline-$(date +%Y%m%d)"
echo "📦 创建离线包：$PACKAGE_NAME"

# 清理旧的离线包
if [ -d "$PACKAGE_NAME" ]; then
    rm -rf "$PACKAGE_NAME"
fi

# 创建离线包目录
mkdir -p "$PACKAGE_NAME"

# 复制dist目录内容
echo "📋 复制文件..."
cp -r dist/* "$PACKAGE_NAME/"

# 创建Windows启动脚本
echo "🖥️  创建Windows启动脚本..."
cat > "$PACKAGE_NAME/启动应用.bat" << 'EOF'
@echo off
chcp 65001 >nul
title DistortionScroll - 诗意变形效果

echo.
echo ========================================
echo    DistortionScroll - 诗意变形效果
echo ========================================
echo.
echo 正在启动应用...
echo.

REM 检查index.html是否存在
if not exist "index.html" (
    echo 错误：找不到index.html文件！
    echo 请确保所有文件都已正确解压。
    pause
    exit /b 1
)

REM 启动默认浏览器打开应用
start "" "index.html"

echo 应用已启动！
echo.
echo 使用说明：
echo - 使用鼠标滚轮浏览内容
echo - 按F11进入全屏模式
echo - 按ESC退出全屏
echo - 关闭浏览器窗口退出应用
echo.
echo 按任意键关闭此窗口...
pause >nul
EOF

# 创建Mac/Linux启动脚本
echo "🐧 创建Mac/Linux启动脚本..."
cat > "$PACKAGE_NAME/启动应用.sh" << 'EOF'
#!/bin/bash
echo "========================================"
echo "  DistortionScroll - 诗意变形效果"
echo "========================================"
echo
echo "正在启动应用..."

# 检查index.html是否存在
if [ ! -f "index.html" ]; then
    echo "❌ 错误：找不到index.html文件！"
    echo "请确保所有文件都已正确解压。"
    exit 1
fi

# 尝试使用默认浏览器打开
if command -v xdg-open > /dev/null; then
    xdg-open "index.html"
elif command -v open > /dev/null; then
    open "index.html"
else
    echo "请手动在浏览器中打开 index.html"
fi

echo "✅ 应用已启动！"
EOF

chmod +x "$PACKAGE_NAME/启动应用.sh"

# 创建详细使用说明
echo "📖 创建使用说明..."
cat > "$PACKAGE_NAME/README.txt" << 'EOF'
DistortionScroll - 诗意变形效果离线版
=====================================

🎯 项目介绍
这是一个基于Three.js的滚动变形效果项目，使用动态置换贴图技术实现图片内容的智能变形效果。
项目结合了诗意文字与视觉艺术，创造沉浸式的浏览体验。

🚀 快速开始
Windows用户：
- 双击 "启动应用.bat" 启动应用

Mac/Linux用户：
- 双击 "启动应用.sh" 启动应用
- 或者直接双击 "index.html" 在浏览器中打开

🎮 操作说明
- 鼠标滚轮：浏览不同章节
- F11键：进入/退出全屏模式
- ESC键：退出全屏
- 方向键：也可以用来浏览

✨ 功能特性
- 动态置换贴图：根据图片内容智能选择置换贴图
- 滚动触发变形：基于滚动位置和方向触发不同的变形效果
- 诗意内容展示：六个章节展示不同的诗意场景
- 视频叠加播放：进入section时自动播放对应视频
- 响应式设计：适配不同屏幕尺寸

📱 系统要求
- Windows 7/8/10/11 / macOS 10.14+ / Linux
- 现代浏览器（Chrome、Firefox、Edge、Safari）
- 支持WebGL的显卡
- 建议分辨率：1920x1080或更高

🔧 故障排除
如果遇到问题：
1. 确保使用现代浏览器（Chrome推荐）
2. 检查显卡驱动是否最新
3. 尝试刷新页面（F5）
4. 按F12查看控制台是否有错误信息

📞 技术支持
如果仍有问题，请检查：
- 浏览器是否支持WebGL
- 是否启用了JavaScript
- 网络连接是否正常（虽然可以离线使用，但某些功能可能需要网络）

🎨 诗意内容
项目包含六句诗意文字：
1. 是薄雾轻拥岸线的清晨，湿润着咸风与微光
2. 是晨曦浸透岛屿的轮廓，海面溢出第一抹金黄
3. 是船影缓缓枕着暮色，衔去不言的归航
4. 是云被晚霞揉进柔粉的梦里，赤阳也逃进远洋
5. 是椰林上的星河闪烁，人声渐远，只剩浪花回响
6. 是银河铺开的夜，万物都安静得恰当

---
制作时间：2025年10月24日
版本：v1.0.0
技术栈：Three.js + WebGL + GSAP
EOF

# 创建ZIP包
echo "📦 创建ZIP压缩包..."
if command -v zip > /dev/null; then
    zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME"
    echo "✅ ZIP包已创建：${PACKAGE_NAME}.zip"
else
    echo "⚠️  警告：未找到zip命令，请手动压缩 $PACKAGE_NAME 目录"
fi

# 显示文件大小
echo
echo "📊 文件统计："
du -sh "$PACKAGE_NAME"
if [ -f "${PACKAGE_NAME}.zip" ]; then
    du -sh "${PACKAGE_NAME}.zip"
fi

echo
echo "🎉 离线包制作完成！"
echo "📁 离线包目录：$PACKAGE_NAME"
if [ -f "${PACKAGE_NAME}.zip" ]; then
    echo "📦 ZIP文件：${PACKAGE_NAME}.zip"
fi
echo
echo "📋 分发说明："
echo "1. 将ZIP文件发送给Windows朋友"
echo "2. 解压到任意目录"
echo "3. 双击'启动应用.bat'即可运行"
echo "4. 完全离线，无需网络连接"
echo
echo "✨ 享受诗意变形效果吧！"
