import { Inject, Injectable } from "@nestjs/common";
import { Client } from "@notionhq/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NotionService {
	constructor(
		@Inject("NOTION_CLIENT") private notionClient: Client,
		private readonly configService: ConfigService,
	) {}

	// Ищем, существует клиент или нет
	async findClient(dto: any) {
		const res = await this.notionClient.databases.query({
			database_id: this.configService.get<string>("NOTION_DB_CLIENT"),
			filter: {
				property: "tgId",
				number: {
					equals: dto.id,
				},
			},
		});
		return res.results;
	}

	// Создание нового клиента и запись на прием
	async createNewClient(dto: any, photoUrl: string) {
		const firstName = dto.first_name ? dto.first_name : dto.username;
		const lastName = dto.last_name ? dto.last_name : " ";

		const res = await this.notionClient.pages.create({
			cover: {
				type: "external",
				external: {
					url: photoUrl,
				},
			},
			parent: {
				database_id: this.configService.get<string>("NOTION_DB_CLIENT"),
			},
			properties: {
				Name: {
					type: "title",
					title: [
						{
							type: "text",
							text: {
								content: firstName + " " + lastName,
							},
						},
					],
				},

				url: {
					type: "url",
					url: `https://t.me/${dto.username}`,
				},
				tgId: {
					type: "number",
					number: dto.id,
				},
				//@ts-ignore
				// Запись: {
				// 	type: "relation",
				// 	relation: [
				// 		{
				// 			id: idRelations,
				// 		},
				// 	],
				// },
			},
		});
		return res;
	}

	async getIndividualPage(pageId: string) {
		return await this.notionClient.pages.retrieve({
			page_id: pageId,
		});
	}

	// Получаем Свободные слоты из Рабочего календаря
	async getAvailableDate() {
		const response = await this.notionClient.databases.query({
			database_id: this.configService.get<string>("NOTION_DB_WORK_TIME"),
			filter: {
				property: "Tags",
				select: {
					equals: "Свободно",
				},
			},
			sorts: [
				{
					property: "Date",
					direction: "ascending",
				},
			],
		});
		return response.results;
	}

	// Записываем клиента на определенную дату
	async createItem(id: string, dto: any) {
		const client = await this.findClient(dto);

		const response = await this.notionClient.pages.update({
			page_id: id,
			properties: {
				Клиент: {
					relation: [
						{
							id: client[0].id,
						},
					],
				},
				Tags: {
					select: {
						name: "Занято",
					},
				},
			},
		});
		return response;
	}

	// Функция для создания кнопок с датами для записи
	async getButtons() {
		const dates = await this.getAvailableDate();
		const buttons = [];

		dates.forEach((date) => {
			function padNumber(number) {
				return number < 10 ? "0" + number : number;
			}

			function getMonthName(date) {
				const months = [
					"Января",
					"Февраля",
					"Марта",
					"Апреля",
					"Мая",
					"Июня",
					"Июля",
					"Августа",
					"Сентября",
					"Октября",
					"Ноября",
					"Декабря",
				];
				return months[date.getMonth()];
			}

			// @ts-ignore
			const start = new Date(date.properties.Date.date.start);
			// @ts-ignore
			const end = new Date(date.properties.Date.date.end);
			const day = start.getDate();
			const hourStart = start.getHours();
			const minutesStart = padNumber(start.getMinutes());
			const hourEnd = end.getHours();
			const minutesEnd = padNumber(end.getMinutes());
			const month = getMonthName(start);

			buttons.push({
				id: date.id,
				value: `${day} ${month}, ${hourStart}:${minutesStart}-${hourEnd}:${minutesEnd}`,
			});
		});
		return buttons;
	}

	// Проверяем "Мои записи"
	async getMyItem(dto: any) {
		const client = await this.findClient(dto);
		const clientId = client[0].id;

		const response = await this.notionClient.databases.query({
			database_id: this.configService.get<string>("NOTION_DB_WORK_TIME"),
			filter: {
				property: "Клиент",
				relation: {
					contains: clientId,
				},
			},
			sorts: [
				{
					property: "Date",
					direction: "ascending",
				},
			],
		});
		return response.results;
	}

	// async getPageContent(pageId: string) {
	// 	return await this.notionClient.blocks.children.list({
	// 		block_id: pageId,
	// 	});
	// }

	// async getAllPages(pageId: string) {
	// 	const pages = [];
	// 	const blocks = await this.getPageContent(pageId);
	// 	console.log("blocks: ", blocks);
	// 	// @ts-ignore
	// 	// for (const block of blocks) {
	// 	// 	pages.push(block);
	// 	//
	// 	// 	if (block.has_children) {
	// 	// 		const childPages = await this.getAllPages(block.id);
	// 	// 		pages = pages.concat(childPages);
	// 	// 	}
	// 	// }
	//
	// 	//return pages;
	// }

	// async getDatabaseWithPages() {
	// 	const databaseItems = await this.getDatabase();
	// 	const dates = [];
	// 	const result = [];
	//
	// 	databaseItems.forEach((item) => {
	// 		//@ts-ignore
	// 		dates.push(item.properties.Date.date);
	// 	});
	//
	// 	dates.forEach((date) => {
	// 		const start = new Date(date.start);
	// 		const end = new Date(date.end);
	//
	// 		// const month = test.getMonth() + 1; // getMonth() возвращает месяц от 0 до 11, поэтому добавляем 1
	// 		// const day = test.getDate();
	// 		const hourStart = start.getHours();
	// 		const hourEnd = end.getHours();
	//
	// 		result.push({
	// 			value: `${hourStart}-${hourEnd}`,
	// 		});
	//
	// 		// console.log("hourStart:", hourStart);
	// 		// console.log("hourEnd:", hourEnd);
	// 		// console.log("Час:", hour);
	// 	});
	// 	return result;
	//
	// 	//console.log(dates);
	//
	// 	// for (const item of databaseItems) {
	// 	// 	// @ts-ignore
	// 	// 	//console.log(item.properties);
	// 	// 	const pageId = item.id;
	// 	// 	// const pageContent = "pup";
	// 	// 	const pageContent = await this.getAllPages(pageId);
	// 	// 	console.log(`Page ID: ${pageId}`, pageContent);
	// 	// }
	// }
}

//https://www.notion.so/nikifforov/51c3c2b3a25b430aa5c13d6ef94b674c?v=22393053308f4dd481b7f5d4a00a1706&pvs=4
