module.exports.config = {
 name: "quranquiz",
 aliases: ["قرآن", "quiz"],
 version: "1.0",
 author: "MOHAMMAD AKASH + modified",
 countDown: 5,
 role: 0,
 shortDescription: "أسئلة عن القرآن الكريم",
 category: "game"
};

const questions = [
 {
 q: "كم عدد سور القرآن الكريم؟",
 a: "114"
 },
 {
 q: "ما هي أطول سورة في القرآن؟",
 a: "البقرة"
 },
 {
 q: "ما هي أقصر سورة في القرآن؟",
 a: "الكوثر"
 },
 {
 q: "في أي شهر نزل القرآن؟",
 a: "رمضان"
 },
 {
 q: "كم عدد أجزاء القرآن؟",
 a: "30"
 }
];

module.exports.onStart = async function ({ api, event }) {
 const q = questions[Math.floor(Math.random() * questions.length)];

 return api.sendMessage(
 `📖 | سؤال ديني:

❓ ${q.q}

✍️ اكتب الإجابة في رسالة واحدة`,
 event.threadID,
 (err, info) => {
 global.client.handleReply.push({
 name: "quranquiz",
 messageID: info.messageID,
 author: event.senderID,
 answer: q.a
 });
 }
 );
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
 const userAnswer = event.body.trim();

 if (userAnswer === handleReply.answer) {
 return api.sendMessage(
 "✅ صحيح يا بطل! إجابة ممتازة 🔥",
 event.threadID,
 event.messageID
 );
 } else {
 return api.sendMessage(
 "❌ خطأ، حاول مرة ثانية وتعلّم أكثر 🤍",
 event.threadID,
 event.messageID
 );
 }
};
