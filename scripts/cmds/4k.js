const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* المطور: MahMUD
* رجاءً لا تحذف الحقوق
*/

module.exports = {
  config: {
    name: "4k",
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "AI",
    description: "تحسين جودة الصور أو ترميمها باستخدام ذكاء اصطناعي 4K.",
    guide: {
      en: "{pn} [رابط الصورة] أو قم بالرد على صورة"
    }
  },

  onStart: async function ({ message, event, args }) {

    // التحقق من عدم تغيير اسم المطور
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);

    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "غير مسموح لك بتغيير اسم المطور.",
        event.threadID,
        event.messageID
      );
    }

    const startTime = Date.now();
    let imgUrl;

    // إذا المستخدم رد على صورة
    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      imgUrl = event.messageReply.attachments[0].url;
    }

    // إذا وضع رابط صورة
    else if (args[0]) {
      imgUrl = args.join(" ");
    }

    // إذا ما أرسل صورة أو رابط
    if (!imgUrl) {
      return message.reply("يرجى الرد على صورة أو إرسال رابط صورة.");
    }

    // رسالة الانتظار
    const waitMsg = await message.reply("⏳ جاري تحسين الصورة إلى 4K... انتظر قليلاً");

    message.reaction("😘", event.messageID);

    try {

      // رابط API
      const apiUrl = `${await mahmud()}/api/hd?imgUrl=${encodeURIComponent(imgUrl)}`;

      // جلب الصورة المحسنة
      const res = await axios.get(apiUrl, {
        responseType: "stream"
      });

      // حذف رسالة الانتظار
      if (waitMsg?.messageID) {
        message.unsend(waitMsg.messageID);
      }

      message.reaction("✅", event.messageID);

      // حساب وقت المعالجة
      const processTime = ((Date.now() - startTime) / 1000).toFixed(2);

      // إرسال الصورة
      message.reply({
        body: `✅ تم تحسين الصورة بنجاح إلى جودة 4K\n⏱️ الوقت: ${processTime} ثانية`,
        attachment: res.data
      });

    } catch (error) {

      // حذف رسالة الانتظار
      if (waitMsg?.messageID) {
        message.unsend(waitMsg.messageID);
      }

      message.reaction("❎", event.messageID);

      // رسالة الخطأ
      message.reply("حدث خطأ أثناء معالجة الصورة، تواصل مع المطور.");
    }
  }
};
