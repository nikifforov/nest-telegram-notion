// import { Ctx, Hears, InjectBot, Start, Update } from "nestjs-telegraf";
// import { Context, Telegraf } from "telegraf";
// import { AppService } from "./app.service";
// import { actionsButtonsOrder } from "./app.buttons";
// // import { MyService } from "./test/test.service";
// import { NotionService } from "./notion/notion.service";
// import { ConfigService } from "@nestjs/config";
// import { Logger } from "@nestjs/common";
//
// const testButtonsData = [
// 	{
// 		value: "10-12",
// 	},
// 	{
// 		value: "12-14",
// 	},
// 	{
// 		value: "14-16",
// 	},
// ];
//
// let testButtons = [
// 	{
// 		value: "10-12",
// 	},
// ];
//
// @Update()
// export class AppUpdate {
// 	constructor(
// 		@InjectBot("") private readonly bot: Telegraf<Context>,
// 		private readonly appService: AppService,
// 		private readonly notionService: NotionService,
// 		private readonly configService: ConfigService,
// 	) {}
//
// 	@Start()
// 	async start(@Ctx() ctx: Context) {
// 		await ctx.reply("Hi friend! 😎");
//
// 		const buttonData = await this.notionService.getButtonData();
//
// 		const keyboard = buttonData.map((button) => button.label);
//
// 		await ctx.reply("Что ты хочешь от меня?", {
// 			reply_markup: {
// 				keyboard: [keyboard],
// 				one_time_keyboard: true, // клавиатура исчезнет после нажатия кнопки
// 				resize_keyboard: true, // автоматически подгоняет клавиатуру под размер экрана
// 			},
// 		});
// 		//await ctx.reply("Что ты хочешь от меня?", actionsButtons());
// 		//const test2 = await this.test.getDatabaseWithPages();
// 		//const test = await this.test.getDatabasesList();
// 		// @ts-ignore
// 		testButtons = await this.notionService.getDatabaseWithPages();
// 		Logger.log(testButtons);
// 		//Logger.log(await this.notionService.getDatabaseWithPages());
// 	}
//
// 	@Hears("📝 Записаться")
// 	async first(@Ctx() ctx: Context) {
// 		await ctx.reply("Молодец 1", actionsButtonsOrder(testButtons));
// 		//console.log(ctx.from);
// 		// await this.test.createNewClient(ctx.from).then((res) => {
// 		// 	console.log(res);
// 		// 	ctx.reply(res.id);
// 		// });
// 	}
//
// 	@Hears("✅ Мои записи")
// 	async second(@Ctx() ctx: Context) {
// 		await ctx.reply("Молодец 2");
// 		const test2 = await this.notionService.getIndividualPage("");
// 		Logger.log(test2);
// 	}
//
// 	@Hears("❌ Отменить записать")
// 	async third(@Ctx() ctx: Context) {
// 		await ctx.reply("Молодец 3");
// 	}
//
// 	// @Hears(testButtonsData[0].value)
// 	// async up(@Ctx() ctx: Context) {
// 	// 	const photoUrl = await this.appService.getUserAvatarUrl(`${ctx.from.id}`);
// 	// 	await this.notionService.createNewClient(ctx.from, photoUrl);
// 	// 	await ctx.reply(`Отлично, Вы записаны на: ${testButtonsData[0].value}`);
// 	// }
//
// 	@Hears(testButtons[0].value)
// 	async up(@Ctx() ctx: Context) {
// 		const photoUrl = await this.appService.getUserAvatarUrl(`${ctx.from.id}`);
// 		await this.notionService.createNewClient(ctx.from, photoUrl);
// 		await ctx.reply(`Отлично, Вы записаны на: ${testButtons[0].value}`);
// 	}
// }
