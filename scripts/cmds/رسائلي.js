module.exports = {
	config: {
		name: "رسائلي",
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 0,

		description: {
			vi: "عرض عدد رسائل جميع الأعضاء أو رسائلك (منذ دخول البوت للمجموعة)",
			en: "عرض عدد رسائل جميع الأعضاء أو رسائلك (منذ دخول البوت للمجموعة)"
		},

		category: "box chat",

		guide: {
			ar:
				"   {pn}: لعرض عدد رسائلك"
				+ "\n   {pn} @tag: لعرض عدد رسائل الشخص المحدد"
				+ "\n   {pn} all: لعرض عدد رسائل جميع الأعضاء",

			ar:
				"   {pn}: لعرض عدد رسائلك"
				+ "\n   {pn} @tag: لعرض عدد رسائل الشخص المحدد"
				+ "\n   {pn} all: لعرض عدد رسائل جميع الأعضاء"
		}
	},

	langs: {
		ar: {
			count: "عدد رسائل الأعضاء:",
			endMessage: "الأشخاص غير الموجودين بالقائمة لم يرسلوا أي رسالة.",
			page: "الصفحة [%1/%2]",
			reply: "قم بالرد على الرسالة برقم الصفحة لعرض المزيد",
			result: "%1 ترتيبه %2 بعدد %3 رسالة",
			yourResult: "ترتيبك %1 وقد أرسلت %2 رسالة في هذه المجموعة",
			invalidPage: "رقم الصفحة غير صالح"
		},

		ar: {
			count: "عدد رسائل الأعضاء:",
			endMessage: "الأشخاص غير الموجودين بالقائمة لم يرسلوا أي رسالة.",
			page: "الصفحة [%1/%2]",
			reply: "قم بالرد على الرسالة برقم الصفحة لعرض المزيد",
			result: "%1 ترتيبه %2 بعدد %3 رسالة",
			yourResult: "ترتيبك %1 وقد أرسلت %2 رسالة في هذه المجموعة",
			invalidPage: "رقم الصفحة غير صالح"
		}
	},

	onStart: async function ({
		args,
		threadsData,
		message,
		event,
		api,
		commandName,
		getLang
	}) {

		const { threadID, senderID } = event;

		const threadData = await threadsData.get(threadID);
		const { members } = threadData;

		const usersInGroup =
			(await api.getThreadInfo(threadID)).participantIDs;

		let arraySort = [];

		// تجهيز بيانات الأعضاء
		for (const user of members) {

			if (!usersInGroup.includes(user.userID))
				continue;

			const charac = "️️️️️️️️️️️️️️️️️";

			arraySort.push({
				name: user.name.includes(charac)
					? `Uid: ${user.userID}`
					: user.name,

				count: user.count,
				uid: user.userID
			});
		}

		// ترتيب الأعضاء حسب عدد الرسائل
		let stt = 1;

		arraySort.sort((a, b) => b.count - a.count);

		arraySort.map(item => item.stt = stt++);

		// إذا كتب أمر إضافي
		if (args[0]) {

			// عرض الجميع
			if (args[0].toLowerCase() == "all") {

				let msg = getLang("count");

				const endMessage = getLang("endMessage");

				for (const item of arraySort) {

					if (item.count > 0)
						msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
				}

				// تقسيم الصفحات إذا كانت الرسالة طويلة
				if ((msg + endMessage).length > 19999) {

					msg = "";

					let page = parseInt(args[1]);

					if (isNaN(page))
						page = 1;

					const splitPage =
						global.utils.splitPage(arraySort, 50);

					arraySort = splitPage.allPage[page - 1];

					for (const item of arraySort) {

						if (item.count > 0)
							msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
					}

					msg += getLang("page", page, splitPage.totalPage)
						+ `\n${getLang("reply")}`
						+ `\n\n${endMessage}`;

					return message.reply(msg, (err, info) => {

						if (err)
							return message.err(err);

						global.GoatBot.onReply.set(info.messageID, {
							commandName,
							messageID: info.messageID,
							splitPage,
							author: senderID
						});
					});
				}

				message.reply(msg);
			}

			// عرض شخص محدد عبر التاغ
			else if (event.mentions) {

				let msg = "";

				for (const id in event.mentions) {

					const findUser =
						arraySort.find(item => item.uid == id);

					msg += `\n${getLang(
						"result",
						findUser.name,
						findUser.stt,
						findUser.count
					)}`;
				}

				message.reply(msg);
			}
		}

		// عرض ترتيبك الشخصي
		else {

			const findUser =
				arraySort.find(item => item.uid == senderID);

			return message.reply(
				getLang(
					"yourResult",
					findUser.stt,
					findUser.count
				)
			);
		}
	},

	// الرد للتنقل بين الصفحات
	onReply: ({
		message,
		event,
		Reply,
		commandName,
		getLang
	}) => {

		const { senderID, body } = event;

		const { author, splitPage } = Reply;

		if (author != senderID)
			return;

		const page = parseInt(body);

		if (
			isNaN(page) ||
			page < 1 ||
			page > splitPage.totalPage
		) {
			return message.reply(getLang("invalidPage"));
		}

		let msg = getLang("count");

		const endMessage = getLang("endMessage");

		const arraySort = splitPage.allPage[page - 1];

		for (const item of arraySort) {

			if (item.count > 0)
				msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
		}

		msg += getLang("page", page, splitPage.totalPage)
			+ "\n" + getLang("reply")
			+ "\n\n" + endMessage;

		message.reply(msg, (err, info) => {

			if (err)
				return message.err(err);

			message.unsend(Reply.messageID);

			global.GoatBot.onReply.set(info.messageID, {
				commandName,
				messageID: info.messageID,
				splitPage,
				author: senderID
			});
		});
	},

	// عداد الرسائل
	onChat: async ({ usersData, threadsData, event }) => {

		const { senderID, threadID } = event;

		const members =
			await threadsData.get(threadID, "members");

		const findMember =
			members.find(user => user.userID == senderID);

		// إذا العضو جديد
		if (!findMember) {

			members.push({
				userID: senderID,
				name: await usersData.getName(senderID),
				nickname: null,
				inGroup: true,
				count: 1
			});
		}

		// زيادة عدد الرسائل
		else {
			findMember.count += 1;
		}

		await threadsData.set(
			threadID,
			members,
			"members"
		);
	}
};
