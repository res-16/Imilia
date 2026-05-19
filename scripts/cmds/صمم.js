const axios = require("axios");

module.exports = {
  config: {
    name: "صمم",
    version: "1.2",
    author: "JARiF@Cock",
    countDown: 5,
    role: 0,

    longDescription: {
      vi: "",
      en: "إنشاء عدة صور بالذكاء الاصطناعي من نص."
    },

    category: "AI-IMAGE",

    guide: {
      vi: "",
      en: "مثال: {pn} بنت كيوت | 4 (سيتم إنشاء 4 صور)"
    }
  },

  onStart: async function ({ api, args, message, event }) {

    try {

      // دمج النص كامل
      const text = args.join(" ");

      // التحقق من وجود وصف
      if (!text) {
        return message.reply("⚠️ يرجى كتابة وصف للصورة.");
      }

      let prompt, quantity;

      // إذا المستخدم حدد العدد باستخدام |
      if (text.includes("|")) {

        [prompt, quantity] = text
          .split("|")
          .map(str => str.trim());

        quantity = parseInt(quantity);

        // التحقق من صحة العدد
        if (isNaN(quantity) || quantity < 1 || quantity > 10) {
          return message.reply("⚠️ يجب أن يكون العدد بين 1 و 10.");
        }

      } else {

        // العدد الافتراضي
        prompt = text;
        quantity = 4;
      }

      // إضافة ردة فعل انتظار
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // رسالة الانتظار
      const waitingMessage = await message.reply(
        `✅ | جاري إنشاء ${quantity} صورة...`
      );

      const imageUrls = [];

      // نسبة أبعاد الصور
      const ratio = "1:1";

      // إنشاء الصور
      for (let i = 0; i < quantity; i++) {

        const res = await axios.get(
          "https://www.ai4chat.co/api/image/generate",
          {
            params: {
              prompt,
              aspect_ratio: ratio
            }
          }
        );

        // حفظ رابط الصورة
        if (res.data?.image_link) {
          imageUrls.push(res.data.image_link);
        }
      }

      // تحويل الصور إلى stream
      const imageStreams = await Promise.all(
        imageUrls.map(url =>
          global.utils.getStreamFromURL(url)
        )
      );

      // إرسال الصور
      await message.reply({
        attachment: imageStreams
      });

      // ردة فعل نجاح
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // حذف رسالة الانتظار
      await api.unsendMessage(waitingMessage.messageID);

    } catch (error) {

      console.error(
        "خطأ في إنشاء الصور:",
        error.message || error
      );

      message.reply("❌ فشل في إنشاء الصور.");
    }
  }
};
