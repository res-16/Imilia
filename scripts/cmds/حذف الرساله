module.exports = {
	config: {
		name: "حذف الرساله",
		version: "1.0",
		author: "ChatGPT",
		countDown: 5,
		role: 0,
		shortDescription: "حذف رسالة",
		longDescription: "يحذف الرسالة اللي ترد عليها",
		category: "utility",
		guide: "{pn} قم بالرد على رسالة البوت"
	},

	onStart: async function ({ api, event }) {
		if (!event.messageReply)
			return api.sendMessage("❌ لازم ترد على رسالة البوت", event.threadID);

		if (event.messageReply.senderID != api.getCurrentUserID())
			return api.sendMessage("❌ لازم ترد على رسالة أرسلها البوت", event.threadID);

		api.unsendMessage(event.messageReply.messageID);
	}
};
