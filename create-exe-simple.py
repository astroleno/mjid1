#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DistortionScroll EXE启动器生成器 - 简化版
"""

import os
import sys
import subprocess

def create_enhanced_bat():
    """创建增强版BAT文件"""
    
    bat_content = '''@echo off
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
'''
    
    with open("DistortionScroll启动器.bat", "w", encoding="utf-8") as f:
        f.write(bat_content)
    
    print("✅ 增强版BAT文件已创建：DistortionScroll启动器.bat")

def create_python_launcher():
    """创建Python启动器"""
    
    launcher_content = '''import os
import webbrowser
from pathlib import Path

def main():
    print("========================================")
    print("  DistortionScroll - 诗意变形效果")
    print("========================================")
    print()
    print("正在启动应用...")
    
    current_dir = Path(__file__).parent
    index_file = current_dir / "index.html"
    
    if not index_file.exists():
        print("❌ 错误：找不到index.html文件！")
        input("按回车键退出...")
        return
    
    try:
        webbrowser.open(f"file://{index_file.absolute()}")
        print("✅ 应用已启动！")
        print()
        print("使用说明：")
        print("- 使用鼠标滚轮浏览内容")
        print("- 按F11进入全屏模式")
        print("- 按ESC退出全屏")
        print("- 关闭浏览器窗口退出应用")
        print()
        input("按回车键关闭此窗口...")
        
    except Exception as e:
        print(f"❌ 启动失败：{e}")
        input("按回车键退出...")

if __name__ == "__main__":
    main()
'''
    
    with open("launcher.py", "w", encoding="utf-8") as f:
        f.write(launcher_content)
    
    print("✅ Python启动器已创建：launcher.py")

def install_pyinstaller():
    """安装PyInstaller"""
    try:
        import PyInstaller
        print("✅ PyInstaller已安装")
        return True
    except ImportError:
        print("📦 正在安装PyInstaller...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)
            print("✅ PyInstaller安装完成")
            return True
        except subprocess.CalledProcessError:
            print("❌ PyInstaller安装失败")
            return False

def create_exe():
    """创建EXE文件"""
    if not install_pyinstaller():
        return False
    
    print("🔨 正在打包EXE文件...")
    
    cmd = [
        "pyinstaller",
        "--onefile",
        "--windowed",
        "--name=DistortionScroll启动器",
        "launcher.py"
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print("✅ EXE文件创建成功！")
        print("📁 位置：dist/DistortionScroll启动器.exe")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 打包失败：{e}")
        return False

def main():
    print("========================================")
    print("  DistortionScroll EXE启动器生成器")
    print("========================================")
    print()
    
    # 检查dist目录
    if not os.path.exists("dist"):
        print("❌ 错误：找不到dist目录！")
        print("请先运行 'npm run build' 构建项目")
        return
    
    print("选择EXE生成方案：")
    print("1. 增强版BAT文件（简单）")
    print("2. Python启动器 + EXE（推荐）")
    print("3. 两种方案都生成")
    
    choice = input("请选择 (1/2/3): ").strip()
    
    if choice in ["1", "3"]:
        print("\n🔨 方案1：增强版BAT文件")
        create_enhanced_bat()
        print("📋 转换为EXE的方法：")
        print("1. 下载 Bat To Exe Converter")
        print("2. 选择 'DistortionScroll启动器.bat'")
        print("3. 设置图标为 dist/favicon/favicon.ico")
        print("4. 选择 'Invisible application'")
        print("5. 点击 'Compile' 生成EXE")
    
    if choice in ["2", "3"]:
        print("\n🔨 方案2：Python启动器 + EXE")
        create_python_launcher()
        if create_exe():
            print("✅ Python方案完成！")
        else:
            print("❌ Python方案失败")
    
    print("\n🎉 EXE启动器生成完成！")
    print("📋 使用说明：")
    print("1. 将EXE文件与dist目录放在同一文件夹")
    print("2. 双击EXE文件即可启动应用")
    print("3. 完全离线运行，无需安装任何软件")

if __name__ == "__main__":
    main()
