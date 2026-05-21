const axios = require("axios");

module.exports = {
  config: {
    name: "manga",
    aliases: ["مانجا", "man", "ani-manga"],
    version: "1.0",
    author: "nexo_here",
    countDown: 0,
    role: 0,
    description: "البحث عن معلومات المانجا باستخدام AniList API",
    category: "anime",
    guide: {
      en: "{pn} [اسم المانجا] — جلب معلومات مانجا من AniList"
    }
  },

  onStart: async function ({ api, event, args }) {

    // أخذ اسم المانجا من الرسالة
    const query = args.join(" ");

    // إذا لم يكتب المستخدم اسم مانجا
    if (!query)
      return api.sendMessage(
        "🔍 | الرجاء كتابة اسم المانجا.",
        event.threadID
      );

    // استعلام GraphQL لجلب معلومات المانجا
    const anilistQuery = `
      query ($search: String) {
        Media(search: $search, type: MANGA) {
          title {
            romaji
            english
            native
          }
          description(asHtml: false)
          status
          chapters
          volumes
          averageScore
          genres
          siteUrl
          coverImage {
            large
          }
        }
      }
    `;

    // المتغير المرسل للاستعلام
    const variables = {
      search: query
    };

    try {

      // إرسال الطلب إلى AniList API
      const res = await axios.post(
        "https://graphql.anilist.co",
        {
          query: anilistQuery,
          variables: variables
        }
      );

      // تخزين بيانات المانجا
      const manga = res.data.data.Media;

      // اختيار أفضل عنوان متوفر
      const title =
        manga.title.english ||
        manga.title.romaji ||
        manga.title.native;

      // تنظيف الوصف من أكواد HTML وتقصيره
      const desc =
        manga.description
          ?.replace(/<br>/g, "\n")
          .replace(/<\/?[^>]+(>|$)/g, "")
          .substring(0, 300) ||
        "لا يوجد وصف.";

      // تكوين الرسالة
      const msg =
`📖 ${title}

📌 الحالة: ${manga.status}
📚 الفصول: ${manga.chapters || "?"}
📘 المجلدات: ${manga.volumes || "?"}
⭐ التقييم: ${manga.averageScore || "?"}/100
🎭 التصنيفات: ${manga.genres.join(", ")}

📝 الوصف:
${desc}...

🔗 ${manga.siteUrl}`;

      // رابط صورة الغلاف
      const cover = manga.coverImage.large;

      // تحميل الصورة
      const img = (
        await axios.get(cover, {
          responseType: "arraybuffer"
        })
      ).data;

      // إنشاء ملف للصورة
      const imgPath = __dirname + "/manga.jpg";

      // استدعاء fs
      const fs = require("fs");

      // حفظ الصورة
      fs.writeFileSync(
        imgPath,
        Buffer.from(img, "utf-8")
      );

      // إرسال الرسالة مع الصورة
      api.sendMessage(
        {
          body: msg,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,

        // حذف الصورة بعد الإرسال
        () => fs.unlinkSync(imgPath)
      );

    } catch (e) {

      // طباعة الخطأ في الكونسول
      console.error(e);

      // رسالة الخطأ للمستخدم
      api.sendMessage(
        "❌ | تعذر جلب معلومات المانجا، تأكد من الاسم وحاول مرة أخرى.",
        event.threadID
      );
    }
  }
};
