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
