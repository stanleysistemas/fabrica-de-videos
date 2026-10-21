async function run() {
  const res = await fetch('http://localhost:3001/api/news/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class',
      themeFocus: 'weapons',
      targetDurationMinutes: 1,
      brollChannel: '@stanleyalvesbr'
    })
  });
  const data = await res.json();
  console.log('Plano 1 Min:', data.plan?.title);
  console.log('Duração Total (s):', data.plan?.totalDurationSeconds);
  console.log('Total Cenas:', data.plan?.scenes?.length);
  data.plan?.scenes?.forEach((s: any, i: number) => {
    console.log(`  [Cena ${i+1}] ${s.heading} (${s.durationInSeconds}s) -> Layout: ${s.layoutMode} -> Img: ${s.associatedImageUrl?.slice(0, 50)}...`);
  });
}
run();
