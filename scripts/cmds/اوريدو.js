module.exports = {
  config: {
    name: "اوريدو",
    version: "1.0",
    author: "GPT",
    role: 0,
    shortDescription: "سحب اوريدو",
    longDescription: "فحص رقم اوريدو وربح عشوائي",
    category: "fun",
    guide: "{pn} 05XXXXXXXX"
  },

  onStart: async function ({ args, message }) {

    if (!args[0]) {
      return message.reply("📱 يرجى كتابة رقم هاتفك");
    }

    const phone = args[0];

    // تحقق من الرقم
    const regex = /^05\d{8}$/;

    if (!regex.test(phone)) {
      return message.reply("❌ الرقم غير صحيح\nيجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
    }

    // توليد نسبة عشوائية
    const random = Math.random() * 100;

    let reward = "";

    if (random < 5) {
      reward = "🎉 مبروك ربحت 150 ميغا";
    }
    else if (random < 15) {
      reward = "🎉 مبروك ربحت 100 ميغا";
    }
    else if (random < 35) {
      reward = "🎉 مبروك ربحت 50 ميغا";
    }
    else {
      reward = "😢 للأسف لم تربح شيء";
    }

    return message.reply(
      `📞 الرقم: ${phone}\n\n${reward}`
    );
  }
};
