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
