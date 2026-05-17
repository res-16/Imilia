module.exports.config = {
 name: "يومي",
 aliases: ["يومي", "استلام"],
 version: "1.0",
 author: "MOHAMMAD AKASH",
 countDown: 5,
 role: 0,
 shortDescription: "استلام المكافأة اليومية",
 category: "economy"
};

module.exports.onStart = async function ({ api, event, usersData }) {
 const { senderID, threadID, messageID } = event;

 const cooldown = 24 * 60 * 60 * 1000; // 24 ساعة
 const reward = Math.floor(Math.random() * 5000) + 1000;

 const userData = await usersData.get(senderID);

 if (!userData.data)
 userData.data = {};

 const lastClaim = userData.data.lastDaily || 0;
 const now = Date.now();

 // التحقق من الانتظار
 if (now - lastClaim < cooldown) {
 const remaining = cooldown - (now - lastClaim);

 const hours = Math.floor(remaining / (1000 * 60 * 60));
 const minutes = Math.floor(
 (remaining % (1000 * 60 * 60)) / (1000 * 60)
 );

 return api.sendMessage(
 `⏳ | لقد استلمت مكافأتك اليومية بالفعل!

🕒 يمكنك العودة بعد:
${hours} ساعة و ${minutes} دقيقة`,
 threadID,
 messageID
 );
 }

 // إضافة المال
 const currentMoney = userData.data.money || 0;
 const newBalance = currentMoney + reward;

 await usersData.set(senderID, {
 data: {
 ...userData.data,
 money: newBalance,
 lastDaily: now
 }
 });

 // رسالة النجاح
 api.sendMessage(
`🎁 | تم استلام المكافأة اليومية بنجاح!

💵 المكافأة: ${reward}$

🏦 رصيدك الحالي: ${newBalance}$`,
 threadID,
 messageID
 );
};
