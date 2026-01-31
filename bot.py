import requests
import time
import os
from flask import Flask
from threading import Thread

app = Flask('')

@app.route('/')
def home():
    return "Hệ thống điều khiển IDX đang chạy với HF Token!", 200

def run_web():
    app.run(host='0.0.0.0', port=10000)

def keep_alive():
    # 1. Thông tin cấu hình
    HF_TOKEN = os.environ.get('HF_TOKEN') # Lấy từ Environment Variables trên Render
    HF_SPACE_URL = "https://corrymesionvn-boop.hf.space" 
    
    # 2. Thiết lập Header với Token để Hugging Face nhận diện "chủ nhân"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    
    print("🚀 Bắt đầu chu kỳ giữ luồng kèm Token...")
    while True:
        try:
            # Ping kèm Token để đảm bảo Space luôn thức
            response = requests.get(HF_SPACE_URL, headers=headers, timeout=15)
            if response.status_code == 200:
                print("✅ Xác thực thành công: Discord Bot đang Online.")
            else:
                print(f"⚠️ Cảnh báo: Space phản hồi mã {response.status_code}")
        except Exception as e:
            print(f"❌ Lỗi kết nối: {e}")
        
        # Ping mỗi 10 phút
        time.sleep(600) 

if __name__ == "__main__":
    Thread(target=run_web).start()
    keep_alive()
