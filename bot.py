import requests
import time
import os
from flask import Flask
from threading import Thread

# --- CẤU HÌNH ---
# Thay 'user-name/space-name' bằng đúng link Space của bạn
HF_URL = "https://corrymesion-asdadasdasdasd.hf.space/wake" 
# Token này bạn sẽ nạp vào Environment Variables trên Render
HF_TOKEN = os.getenv("HF_TOKEN") 
WAKE_PASS = "1234576"

# 1. TẠO WEB SERVER GIẢ (Để Render không báo lỗi "Port 10000 not bound")
app = Flask('')

@app.route('/')
def home():
    return "Bot is running and watching IDX...", 200

def run_web():
    # Render yêu cầu chạy ở cổng 10000
    app.run(host='0.0.0.0', port=10000)

# 2. HÀM GỬI TÍN HIỆU ĐẾN HUGGING FACE
def wake_up_space():
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "X-Pass": WAKE_PASS
    }
    try:
        print(f"[{time.strftime('%H:%M:%S')}] Đang gõ cửa Hugging Face...")
        response = requests.post(HF_URL, headers=headers, timeout=60)
        
        if response.status_code == 200:
            print(f"✅ Thành công: {response.text}")
        else:
            print(f"⚠️ Thất bại: Mã lỗi {response.status_code}")
            
    except Exception as e:
        print(f"🔥 Lỗi kết nối: {e}")

# 3. CHƯƠNG TRÌNH CHÍNH
if __name__ == "__main__":
    # Chạy Web Server ở luồng phụ (background)
    Thread(target=run_web).start()
    
    # Chạy vòng lặp đánh thức ở luồng chính
    print("🚀 Bot đã bắt đầu chu kỳ đánh thức 25 phút/lần.")
    while True:
        wake_up_space()
        # Nghỉ 25 phút (1500 giây)
        time.sleep(1500)
