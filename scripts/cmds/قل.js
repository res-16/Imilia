const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "قل",
    version: "2.0.0",
    author: "MOHAMMAD AKASH",
    countDown: 5,
    role: 0,

    shortDescription: "تحويل النص إلى صوت",

    longDescription:
      "يقوم بتحويل أي نص إلى صوت باستخدام Google Translate وإرساله كملف صوتي.",

    category: "media",

    guide: {
      en: "{p}say <النص>"
    }
  },

  onStart: async function ({ api, event, args }) {

    try {

      // أخذ النص من الرسالة أو من الرد
      const text =
        args.join(" ") ||
        (event.messageReply?.body ?? null);

      // إذا لم يكتب المستخدم أي نص
      if (!text)
        return api.sendMessage(
          "❌ | الرجاء كتابة نص لتحويله إلى صوت.",
          event.threadID,
          event.messageID
        );

      // مسار حفظ الملف الصوتي
      const filePath = path.join(
        __dirname,
        "cache",
        `${event.senderID}.mp3`
      );

      // رابط Google TTS
      const url =
        `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=bn&client=tw-ob`;

      // تحميل ملف MP3
      const response = await axios.get(url, {
        responseType: "arraybuffer"
      });

      // حفظ الملف
      fs.writeFileSync(
        filePath,
        Buffer.from(response.data, "utf-8")
      );

      // إرسال الملف الصوتي
      await api.sendMessage(
        {
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,

        // حذف الملف بعد الإرسال
        () => {
          fs.unlinkSync(filePath);
        }
      );

    } catch (error) {

      // طباعة الخطأ في الكونسول
      console.error("Say command error:", error);

      // رسالة الخطأ للمستخدم
      api.sendMessage(
        "❌ | حدث خطأ، حاول مرة أخرى لاحقاً.",
        event.threadID
      );
    }
  }
};
