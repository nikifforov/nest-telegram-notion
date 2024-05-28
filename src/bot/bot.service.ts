import { Action, Ctx, InjectBot, Start, Update } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { ConfigService } from "@nestjs/config";
import { NotionService } from "../notion/notion.service";
import axios from "axios";

@Update()
export class BotService {
	constructor(
		@InjectBot("") private readonly bot: Telegraf<Context>,
		private readonly notionService: NotionService,
		private readonly configService: ConfigService,
	) {}

	async getUserProfilePhotos(userId: string) {
		const url = `https://api.telegram.org/bot${this.configService.get("TELEGRAM_TOKEN")}/getUserProfilePhotos?user_id=${userId}`;
		try {
			const response = await axios.get(url);
			return response.data.result.photos;
		} catch (error) {
			console.log("Error fetching user profile photos");
			// throw new HttpException(
			// 	"Error fetching user profile photos",
			// 	HttpStatus.INTERNAL_SERVER_ERROR,
			// );
		}
	}

	async getFile(fileId: string) {
		const url = `https://api.telegram.org/bot${this.configService.get("TELEGRAM_TOKEN")}/getFile?file_id=${fileId}`;
		try {
			const response = await axios.get(url);
			return response.data.result.file_path;
		} catch (error) {
			console.log("Error fetching file path");
			//throw new HttpException("Error fetching file path", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async getUserAvatarUrl(userId: string): Promise<string> {
		const photos = await this.getUserProfilePhotos(userId);
		if (photos.length === 0) {
			console.log("No profile photos found.");
			//throw new HttpException("No profile photos found.", HttpStatus.NOT_FOUND);
		}

		try {
			const photoSize = photos[0].pop(); // Берем самую большую версию фотографии
			const fileId = photoSize.file_id;
			const filePath = await this.getFile(fileId);

			return `https://api.telegram.org/file/bot${this.configService.get("TELEGRAM_TOKEN")}/${filePath}`;
		} catch (e) {
			return "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg";
		}
	}

	@Start()
	async onStart(@Ctx() ctx: Context) {
		const res = await this.notionService.findClient(ctx.from);
		const hideBtn = res.length === 0;

		await ctx.replyWithHTML(
			`Привет👋 <b>${ctx.from.first_name}</b>, выберите действие:`,
			Markup.inlineKeyboard(
				[
					Markup.button.callback("📝 Записаться", "book"),
					Markup.button.callback("✅ Мои записи", "my_records", hideBtn),
					Markup.button.callback("❌ Отменить записать", "cancel", hideBtn),
				],
				{
					columns: 2,
				},
			),
		);
	}

	@Action("book")
	async onBook(@Ctx() ctx: Context) {
		const client = await this.notionService.findClient(ctx.from);
		const isClient = client.length === 0;

		if (isClient) {
			const photoUrl = await this.getUserAvatarUrl(`${ctx.from.id}`);
			await this.notionService.createNewClient(ctx.from, photoUrl);
		}

		const buttons = await this.notionService.getButtons();

		await ctx.reply(
			"Свободные даты для записи:",
			Markup.inlineKeyboard(
				[
					...buttons.map((button: { id: string; value: string }) =>
						Markup.button.callback(button.value, `book_${button.id}_${button.value}`),
					),
					Markup.button.callback("Назад", "back_to_start"),
				],
				{
					columns: 2,
				},
			),
		);
	}

	@Action(/book_.+/)
	async onButtonAction(@Ctx() ctx: Context) {
		// @ts-ignore
		const data = ctx.match[0].split("_");
		const id = data[1];
		const value = data.slice(2).join("_");

		await this.notionService.createItem(id, ctx.from);
		await ctx.answerCbQuery(); // Оповещает пользователя о нажатии кнопки
		await ctx.replyWithHTML(`✅ <b>${ctx.from.first_name}</b> вы записаны на: ${value}`);

		const buttons = await this.notionService.getButtons();

		await ctx.reply(
			"Свободные даты для записи:",
			Markup.inlineKeyboard(
				[
					...buttons.map((button: { id: string; value: string }) =>
						Markup.button.callback(button.value, `book_${button.id}_${button.value}`),
					),
					Markup.button.callback("Назад", "back_to_start"),
				],
				{
					columns: 2,
				},
			),
		);

		// отправляем уведомление владельцу бота о записи
		await this.bot.telegram.sendMessage(
			this.configService.get("ADMIN_CHAT_ID"),
			`${ctx.from.first_name} записался на ${value}`,
		);
	}

	@Action("back_to_start")
	async onBack(@Ctx() ctx: Context) {
		await this.onStart(ctx);
	}

	@Action("my_records")
	async onMyRecords(@Ctx() ctx: Context) {
		// Логика для получения записей пользователя
		const myItems = await this.notionService.returnMyItem(ctx.from);
		if (myItems.length > 0) {
			await ctx.replyWithHTML(
				`<b>Ваши записи:</b>` +
					`${myItems.map((item: { id: string; value: string }) => {
						return "\n" + `✅ ${item.value}`;
					})}`,
				Markup.inlineKeyboard([Markup.button.callback("Назад", "back_to_start")]),
			);
		} else {
			await ctx.replyWithHTML(`<b>${ctx.from.first_name}</b>, у вас нет записей`);
			await this.onStart(ctx);
		}
	}

	@Action("cancel")
	async onCancel(@Ctx() ctx: Context) {
		// Логика для отмены записи
		const myItems = await this.notionService.returnMyItem(ctx.from);
		if (myItems.length > 0) {
			await ctx.replyWithHTML(
				`<b>Ваши записи:</b>`,
				Markup.inlineKeyboard(
					[
						...myItems.map((item: { id: string; value: string }) =>
							Markup.button.callback(item.value, `cnl_${item.id}_${item.value}`),
						),
						Markup.button.callback("Назад", "back_to_start"),
					],
					{
						columns: 2,
					},
				),
			);
		} else {
			await ctx.replyWithHTML(`<b>${ctx.from.first_name}</b>, у вас нет записей`);
			await this.onStart(ctx);
		}
	}

	@Action(/cnl_.+/)
	async onCancelAction(@Ctx() ctx: Context) {
		// @ts-ignore
		const data = ctx.match[0].split("_");
		const id = data[1];
		const value = data.slice(2).join("_");

		await this.notionService.deleteItem(id);
		await ctx.answerCbQuery(); // Оповещает пользователя о нажатии кнопки
		await ctx.replyWithHTML(`✅ <b>${ctx.from.first_name}</b> вы отменили запись на: ${value}`);

		// отправляем уведомление владельцу бота об отмене записи
		await this.bot.telegram.sendMessage(
			this.configService.get("ADMIN_CHAT_ID"),
			`${ctx.from.first_name} отменил запись на ${value}`,
		);

		const myItems = await this.notionService.returnMyItem(ctx.from);
		if (myItems.length > 0) {
			await ctx.replyWithHTML(
				`<b>Ваши записи:</b>`,
				Markup.inlineKeyboard(
					[
						...myItems.map((item: { id: string; value: string }) =>
							Markup.button.callback(item.value, `cnl_${item.id}_${item.value}`),
						),
						Markup.button.callback("Назад", "back_to_start"),
					],
					{
						columns: 2,
					},
				),
			);
		} else {
			await ctx.replyWithHTML(`<b>${ctx.from.first_name}</b>, у вас нет записей`);
			await this.onStart(ctx);
		}
	}
}
