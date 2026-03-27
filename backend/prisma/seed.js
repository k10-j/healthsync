const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const topics = [
    { id: "chronic", name: "Chronic Care", nameKn: "Indwara Zidakira" },
    { id: "mental", name: "Mental Wellness", nameKn: "Ubuzima bw'Umutwe" },
    { id: "nutrition", name: "Nutrition", nameKn: "Imirire" },
    { id: "wellness", name: "Daily Wellness", nameKn: "Ubuzima Rusange" },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { id: topic.id },
      update: { name: topic.name, nameKn: topic.nameKn },
      create: topic,
    });
  }

  const articles = [
    {
      id: "diabetes-management",
      topicId: "chronic",
      title: "Understanding Diabetes Management",
      titleKn: "Gusobanukirwa Gucunga Diyabete",
      excerpt:
        "Learn how to manage your blood sugar levels effectively through diet, exercise, and medication adherence.",
      readTime: 5,
      verified: true,
      content:
        "Diabetes management is about consistency.\n\n1) Take medications exactly as prescribed.\n2) Keep track of blood sugar readings.\n3) Choose foods that support stable energy.\n4) Stay active with safe, regular movement.\n\nIf you have questions, contact your clinician for personalized guidance.",
    },
    {
      id: "hypertension-basics",
      topicId: "chronic",
      title: "Hypertension Basics: Small Habits, Big Results",
      titleKn: "Ibyibanze By'Umuvuduko Uhamye w'Amaraso",
      excerpt:
        "Simple everyday habits can help keep blood pressure under control. Learn what to focus on most.",
      readTime: 4,
      verified: true,
      content:
        "Hypertension can be managed with daily routines.\n\n- Limit high-salt foods.\n- Take medications on time.\n- Move your body regularly.\n- Reduce stress and prioritize sleep.\n\nTalk with your healthcare provider before changing treatment.",
    },
    {
      id: "stress-anxiety-coping",
      topicId: "mental",
      title: "Coping with Stress and Anxiety",
      titleKn: "Guhangana n'Ihagarika n'Ubwoba",
      excerpt:
        "Practical techniques for managing daily stress and reducing anxiety symptoms naturally.",
      readTime: 4,
      verified: true,
      content:
        "Stress is normal. The goal is to respond in healthy ways.\n\n- Practice slow breathing for a few minutes.\n- Break tasks into smaller steps.\n- Keep a short daily routine.\n- Talk to someone you trust.\n\nIf symptoms are persistent or severe, consider professional support.",
    },
    {
      id: "sleep-for-mood",
      topicId: "mental",
      title: "Sleep for Better Mood",
      titleKn: "Kuryama Kugira Imbaraga mu Bitekerezo",
      excerpt:
        "Quality sleep supports emotional regulation. Here are easy changes that can help you sleep better.",
      readTime: 3,
      verified: true,
      content:
        "Good sleep can improve how you feel each day.\n\n- Keep a consistent bedtime.\n- Reduce screen time before sleep.\n- Create a calm sleep environment.\n- Avoid caffeine late in the day.\n\nStart with one change and build gradually.",
    },
    {
      id: "healthy-eating-budget",
      topicId: "nutrition",
      title: "Healthy Eating on a Budget",
      titleKn: "Kurya Neza ku Buntu Buke",
      excerpt:
        "Tips for maintaining a nutritious diet without breaking the bank. Includes local food suggestions.",
      readTime: 6,
      verified: true,
      content:
        "Eating well doesn't have to be expensive.\n\n- Choose affordable staples and add vegetables when possible.\n- Plan simple meals for the week.\n- Buy seasonal produce.\n- Limit sugary drinks.\n\nAim for balanced meals and adjust based on your health needs.",
    },
    {
      id: "hydration-and-health",
      topicId: "nutrition",
      title: "Hydration and Health",
      titleKn: "Kunywa Amazi no Kurushaho Ubuzima Bwiza",
      excerpt:
        "A glass of water with your medication helps absorption and keeps you refreshed throughout the day.",
      readTime: 3,
      verified: true,
      content:
        "Hydration supports overall body function.\n\n- Drink water regularly through the day.\n- Pair hydration with your medication schedule.\n- Watch for signs of dehydration.\n\nIf you have medical conditions affecting fluid intake, follow your clinician's advice.",
    },
    {
      id: "joy-of-movement",
      topicId: "wellness",
      title: "The Joy of Regular Movement",
      titleKn: "Akamaro k'Imyitozo Ngororamubiri",
      excerpt:
        "Simple, enjoyable exercises you can do at home to improve your overall health and mood.",
      readTime: 3,
      verified: true,
      content:
        "Movement can be simple and still beneficial.\n\nTry:\n- A short walk after meals.\n- Gentle stretching.\n- Light strength exercises.\n\nChoose activities you enjoy so you can stay consistent.",
    },
    {
      id: "daily-routine-selfcare",
      topicId: "wellness",
      title: "Build a Daily Self-care Routine",
      titleKn: "Kubaka Imyitwarire y'Ubwitange bwa buri munsi",
      excerpt:
        "Small daily actions help you feel more in control and support healthier habits over time.",
      readTime: 4,
      verified: true,
      content:
        "Self-care isn't one big action — it's daily habits.\n\n- Take your medication on schedule.\n- Set reminders for water and movement.\n- Spend a few minutes on breathing or journaling.\n\nConsistency matters more than perfection.",
    },
    {
      id: "asthma-living-well",
      topicId: "chronic",
      title: "Living Well with Asthma",
      titleKn: "Kubaho Neza Ufite Asima",
      excerpt:
        "Understand your asthma triggers and learn how to manage symptoms so you can stay active and breathe easier.",
      readTime: 5,
      verified: true,
      content:
        "Asthma is manageable with the right habits.\n\nKnow your triggers:\n- Dust, smoke, pollen, cold air, and strong smells can trigger symptoms.\n- Keep a simple log of when symptoms occur.\n\nDaily management:\n- Use your inhaler exactly as prescribed.\n- Keep rescue medication accessible at all times.\n- Avoid known triggers when possible.\n- Stay indoors on high-pollution days.\n\nWhen to seek help:\n- If symptoms worsen or your rescue inhaler isn't helping, contact your healthcare provider immediately.",
    },
    {
      id: "kidney-health-basics",
      topicId: "chronic",
      title: "Protecting Your Kidney Health",
      titleKn: "Kurinda Ubuzima bw'Impyiko",
      excerpt:
        "Your kidneys filter waste from your blood. Learn simple steps to keep them healthy, especially if you have diabetes or hypertension.",
      readTime: 5,
      verified: true,
      content:
        "Kidney health is closely linked to other chronic conditions.\n\nKey habits:\n- Drink enough water daily.\n- Control blood sugar and blood pressure.\n- Avoid overusing pain medications like ibuprofen.\n- Eat less salt and processed food.\n- Do not skip prescribed medications.\n\nWarning signs to watch:\n- Swollen feet or ankles.\n- Foamy or dark urine.\n- Unusual fatigue.\n\nRegular check-ups help catch problems early. Talk to your clinician about kidney function tests.",
    },
    {
      id: "grief-and-loss",
      topicId: "mental",
      title: "Understanding Grief and Loss",
      titleKn: "Gusobanukirwa Agahinda n'Uburira",
      excerpt:
        "Grief is a natural response to loss. Learn healthy ways to process your emotions and find support.",
      readTime: 4,
      verified: true,
      content:
        "Grief looks different for everyone and has no fixed timeline.\n\nCommon feelings include:\n- Sadness, anger, numbness, or guilt.\n- Difficulty concentrating or sleeping.\n- Physical symptoms like fatigue or loss of appetite.\n\nHealthy ways to cope:\n- Allow yourself to feel without judgment.\n- Talk to a trusted friend, family member, or counselor.\n- Maintain basic routines like eating and sleeping.\n- Avoid using alcohol or substances to cope.\n\nIf grief feels overwhelming or lasts a long time, professional support can help.",
    },
    {
      id: "building-resilience",
      topicId: "mental",
      title: "Building Mental Resilience",
      titleKn: "Gukomeza Imbaraga z'Umutima",
      excerpt:
        "Resilience is the ability to recover from challenges. These practical habits can help you strengthen your mental toughness.",
      readTime: 4,
      verified: true,
      content:
        "Resilience is a skill you can build over time.\n\nCore practices:\n- Reframe setbacks as learning opportunities.\n- Focus on what you can control.\n- Build a support network of people you trust.\n- Practice gratitude — note one positive thing each day.\n- Take breaks before you burn out.\n\nRemember: asking for help is a sign of strength, not weakness.\n\nIf you are struggling, speaking with a mental health professional is a valuable step.",
    },
    {
      id: "protein-and-recovery",
      topicId: "nutrition",
      title: "Protein for Healing and Recovery",
      titleKn: "Poroteyine mu Gukira no Gusubirana",
      excerpt:
        "Protein helps your body repair tissue and stay strong. Learn which affordable foods are great protein sources.",
      readTime: 4,
      verified: true,
      content:
        "Protein is essential for healing, especially after illness or surgery.\n\nAffordable protein sources:\n- Beans, lentils, and peas.\n- Eggs and dairy products.\n- Fish and lean meats.\n- Groundnuts and soy products.\n\nTips:\n- Include a protein source in every main meal.\n- Combine plant proteins (e.g., beans + grains) for a complete amino acid profile.\n- Avoid heavily processed meats.\n\nIf you have kidney disease, ask your clinician about the right protein amount for you.",
    },
    {
      id: "gut-health-basics",
      topicId: "nutrition",
      title: "Gut Health: Why It Matters",
      titleKn: "Ubuzima bw'Isuri: Impamvu Bifite Akamaro",
      excerpt:
        "A healthy gut supports digestion, immunity, and even mood. Simple food choices can make a big difference.",
      readTime: 4,
      verified: true,
      content:
        "Your gut is home to trillions of bacteria that affect your whole body.\n\nFoods that support gut health:\n- Fermented foods like yogurt and fermented porridge.\n- High-fiber foods: vegetables, fruits, whole grains, legumes.\n- Plenty of water.\n\nFoods to limit:\n- Highly processed snacks and sugary drinks.\n- Excess alcohol.\n\nSigns of poor gut health:\n- Frequent bloating, constipation, or diarrhea.\n- Low energy or frequent illness.\n\nSmall consistent changes to your diet can improve gut health over weeks.",
    },
    {
      id: "better-posture-less-pain",
      topicId: "wellness",
      title: "Better Posture, Less Pain",
      titleKn: "Imiterere Myiza y'Umubiri, Kubabara Guke",
      excerpt:
        "Poor posture contributes to back, neck, and shoulder pain. These simple adjustments can help you feel better every day.",
      readTime: 3,
      verified: true,
      content:
        "Good posture reduces strain on your muscles and joints.\n\nQuick tips:\n- Sit with your back supported and feet flat on the floor.\n- Keep screens at eye level to avoid neck strain.\n- Take a short standing or walking break every 30–60 minutes.\n- Strengthen your core with gentle exercises.\n\nWhen standing:\n- Distribute weight evenly on both feet.\n- Avoid locking your knees.\n\nIf you have chronic pain, consult a physiotherapist for personalized guidance.",
    },
    {
      id: "social-connection-health",
      topicId: "wellness",
      title: "The Health Power of Social Connection",
      titleKn: "Imbaraga z'Ubuzima zo Guturana n'Abandi",
      excerpt:
        "Strong social ties are linked to longer life, better immunity, and improved mental health. Here's how to nurture them.",
      readTime: 3,
      verified: true,
      content:
        "Loneliness can affect physical health as much as smoking or inactivity.\n\nWays to stay connected:\n- Schedule regular time with friends or family, even briefly.\n- Join a community group, faith community, or health support group.\n- Volunteer — helping others boosts your own wellbeing.\n- Check in on neighbors or friends who may be isolated.\n\nDigital connection counts too, but in-person interaction has the strongest benefits.\n\nIf you feel persistently lonely, talking to a counselor can help.",
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: {
        topicId: article.topicId,
        title: article.title,
        titleKn: article.titleKn,
        excerpt: article.excerpt,
        readTime: article.readTime,
        verified: article.verified,
        content: article.content,
      },
      create: article,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

