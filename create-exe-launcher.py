#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DistortionScroll EXE启动器生成器
将BAT文件封装成EXE文件，提供更好的用户体验
"""

import os
import sys
import subprocess
import zipfile
from pathlib import Path

def create_exe_launcher():
    """创建EXE启动器"""
    
    # 检查是否安装了pyinstaller
    try:
        import PyInstaller
    except ImportError:
        print("❌ 未找到PyInstaller，正在安装...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)
        print("✅ PyInstaller安装完成")
    
    # 创建启动器Python脚本
    launcher_script = '''
import os
import sys
import subprocess
import webbrowser
from pathlib import Path

def main():
    """DistortionScroll启动器"""
    print("========================================")
    print("  DistortionScroll - 诗意变形效果")
    print("========================================")
    print()
    print("正在启动应用...")
    
    # 获取当前脚本所在目录
    current_dir = Path(__file__).parent
    
    # 检查index.html是否存在
    index_file = current_dir / "index.html"
    if not index_file.exists():
        print("❌ 错误：找不到index.html文件！")
        print("请确保所有文件都已正确解压。")
        input("按回车键退出...")
        return
    
    try:
        # 启动默认浏览器打开应用
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
    
    # 写入启动器脚本
    with open("launcher.py", "w", encoding="utf-8") as f:
        f.write(launcher_script)
    
    print("📝 启动器脚本已创建")
    
    # 使用PyInstaller打包成EXE
    print("🔨 正在打包EXE文件...")
    
    cmd = [
        "pyinstaller",
        "--onefile",  # 打包成单个文件
        "--windowed",  # 无控制台窗口
        "--name=DistortionScroll启动器",
        "--icon=dist/favicon/favicon.ico" if os.path.exists("dist/favicon/favicon.ico") else "",
        "launcher.py"
    ]
    
    # 移除空的icon参数
    cmd = [arg for arg in cmd if arg]
    
    try:
        subprocess.run(cmd, check=True)
        print("✅ EXE文件创建成功！")
        print("📁 位置：dist/DistortionScroll启动器.exe")
        
        # 清理临时文件
        os.remove("launcher.py")
        if os.path.exists("launcher.spec"):
            os.remove("launcher.spec")
        if os.path.exists("build"):
            import shutil
            shutil.rmtree("build")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ 打包失败：{e}")
        return False

def create_simple_exe():
    """创建简单的EXE启动器（使用批处理转EXE工具）"""
    
    # 创建增强版的BAT文件
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
    
    print("📝 增强版BAT文件已创建：DistortionScroll启动器.bat")
    print()
    print("🔧 转换为EXE的方法：")
    print("1. 下载 Bat To Exe Converter: https://bat-to-exe-converter.en.softonic.com/")
    print("2. 打开软件，选择 'DistortionScroll启动器.bat'")
    print("3. 设置图标为 dist/favicon/favicon.ico")
    print("4. 选择 'Invisible application' 隐藏控制台")
    print("5. 点击 'Compile' 生成EXE文件")
    print()
    print("或者使用在线工具：")
    print("- https://www.battoexeconverter.com/")
    print("- https://www.advancedinstaller.com/")

def main():
    """主函数"""
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
    print("1. Python + PyInstaller（推荐，功能强大）")
    print("2. BAT转EXE工具（简单易用）")
    print("3. 两种方案都生成")
    
    choice = input("请选择 (1/2/3): ").strip()
    
    if choice in ["1", "3"]:
        print("\n🔨 方案1：Python + PyInstaller")
        if create_exe_launcher():
            print("✅ Python方案完成！")
        else:
            print("❌ Python方案失败")
    
    if choice in ["2", "3"]:
        print("\n🔨 方案2：BAT转EXE工具")
        create_simple_exe()
        print("✅ BAT方案完成！")
    
    print("\n🎉 EXE启动器生成完成！")
    print("📋 使用说明：")
    print("1. 将EXE文件与dist目录放在同一文件夹")
    print("2. 双击EXE文件即可启动应用")
    print("3. 完全离线运行，无需安装任何软件")

if __name__ == "__main__":
    main()
'''
