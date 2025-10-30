import os
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
