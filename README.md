Inspiration
We wanted to build something that actually felt like a real study partner — not just an AI that spits out flashcards, but one that chats with you, checks in on your well-being, and helps you stay focused. Studying alone can feel isolating, and we wanted to recreate the experience of having someone beside you: encouraging you, quizzing you, and reminding you to sit up straight.

What it does
How we built it
StudyBuddy is your AI-powered study companion. It can:

💬 Chat with you like a study buddy

🧠 Auto-generate flashcards from PDFs

📝 Create quizzes based on uploaded content

📈 Track your progress

🪑 Use real-time posture detection to remind you to sit upright

🚰 Prompt you to take breaks and drink water — just like a real friend would

It’s like having a friend that keeps you sharp, healthy, and on task.

Challenges we ran into
Getting real-time posture data from the ESP32 into Firebase

Cleaning and formatting Gemini’s AI output into usable JSON

Making multiple study modes feel cohesive in one interface

Dealing with CORS bugs and deployment issues

Juggling a lot of features in a short hackathon window

Accomplishments that we're proud of
Built a full-stack app with AI, hardware, and real-time syncing

Integrated posture tracking using a custom ESP32 setup

Created a polished, animated UI that feels fun to use

Managed to tie together multiple services (Firebase, FastAPI, Gemini) smoothly

What we learned
How to engineer better prompts for LLMs

How to sync hardware data into cloud databases in real time

Full-stack coordination under time pressure

How to build a product that’s technically complex but user-friendly

What's next for StudyBuddy
We want to:

Add voice-based interaction so you can talk to your study buddy

Implement smarter tracking and personalized study feedback

Expand posture detection to support wearable sensors

Deploy it as a mobile-first app for studying on the go
