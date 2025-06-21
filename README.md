git clone … study-buddy
cd study-buddy

# 1 Bridge (writes to Firestore)
cd bridge
source .venv/bin/activate       # or activate however you prefer
pip install -r requirements.txt
python serial_to_firestore.py    # (or add MOCK_SERIAL=1 to .env to fake data)

# 2 Frontend (reads from Firestore)
cd ../frontend
cp .env.local.example .env.local
# ← paste in your six NEXT_PUBLIC_… values here
npm install
npm run dev
