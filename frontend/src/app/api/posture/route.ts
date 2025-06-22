// frontend/app/api/posture/route.ts
export async function GET() {
    const res = await fetch("https://competitions-expensive-dim-vacuum.trycloudflare.com/posture", {
      method: "GET",
      headers: {
        "User-Agent": "Node.js",
      },
    });
  
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  }
  