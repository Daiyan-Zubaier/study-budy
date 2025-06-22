import os
import asyncio #run async loop
import serial_asyncio #non-blocking serial I/O library (reads from your posture sensor)
import firebase_admin #+submodules: Admin SDK to write into Firestone
from firebase_admin import credentials, firestore
from datetime import datetime, timezone #timestamp of each reading
from dotenv import load_dotenv #load env file

# loading credentials
load_dotenv() #pulls env vars from bridge/.env

cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
firebase_admin.initialize_app(cred)
db = firestore.client()

SESSION_ID = os.getenv("SESSION_ID")
COL = f"sessions/{SESSION_ID}/postureLogs"


async def main():
    reader, _ = await serial_asyncio.open_serial_connection( #opens hardware port
        url = "/https://defeat-robust-licence-frontier.trycloudflare.com/", baudrate=115200
    )
    print("connecting to serial; streaming to FireStore")

    while True:
        line = await reader.readline()

        #parse angle
        try:
            angle = float(line.decode().strip())
        except ValueError:
            continue

        status = "good" if 160 <= angle <= 180 else "bad"

        doc = {
            "timestamp": datetime.now(timezone.utc),
            "angle": angle,
            "status": status,
        }

        db.collection(COL).add(doc)
        print("doc added")

        await asyncio.sleep(0.1) #throttle to ~10Hz

if __name__ == "__main__":
    asyncio.run(main())



