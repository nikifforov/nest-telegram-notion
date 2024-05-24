import { Markup } from "telegraf";

export function actionsButtons() {
	return Markup.keyboard(
		[
			Markup.button.callback("📝 Записаться", "first"),
			Markup.button.callback("✅ Мои записи", "second"),
			Markup.button.callback("❌ Отменить записать", "third"),
		],
		{
			columns: 1,
		},
	);
}

export function actionsButtonsOrder(data: any) {
	const arr = [];
	data.forEach((item) => {
		arr.push(Markup.button.callback(`${item.value}`, "seconf"));
	});

	return Markup.keyboard(arr, {
		columns: 3,
	});
}
