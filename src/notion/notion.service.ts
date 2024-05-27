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

		return await this.notionClient.pages.create({
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
			},
		});
	}

	// Получаем Свободные слоты из Рабочего календаря
	async getAvailableDate() {
		const toDay = new Date();
		const toDayIso = toDay.toISOString();

		const response = await this.notionClient.databases.query({
			database_id: this.configService.get<string>("NOTION_DB_WORK_TIME"),
			filter: {
				and: [
					{
						property: "Tags",
						select: {
							equals: "Свободно",
						},
					},
					{
						property: "Date",
						date: {
							on_or_after: toDayIso,
						},
					},
				],
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

		return await this.notionClient.pages.update({
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

	// Возвращаем "Мои записи" уже отредактированными
	async returnMyItem(dto: any) {
		const items = await this.getMyItem(dto);
		const myItems = [];

		items.forEach((item) => {
			function padNumber(number) {
				return number < 10 ? "0" + number : number;
			}

			function getMonthName(item) {
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
				return months[item.getMonth()];
			}

			// @ts-ignore
			const start = new Date(item.properties.Date.date.start);
			// @ts-ignore
			const end = new Date(item.properties.Date.date.end);
			const day = start.getDate();
			const hourStart = start.getHours();
			const minutesStart = padNumber(start.getMinutes());
			const hourEnd = end.getHours();
			const minutesEnd = padNumber(end.getMinutes());
			const month = getMonthName(start);

			myItems.push({
				id: item.id,
				value: `${day} ${month}, ${hourStart}:${minutesStart}-${hourEnd}:${minutesEnd}`,
			});
		});

		return myItems;
	}

	// Удаляем запись
	async deleteItem(id: string) {
		return await this.notionClient.pages.update({
			page_id: id,
			properties: {
				Клиент: {
					relation: [],
				},
				Tags: {
					select: {
						name: "Свободно",
					},
				},
			},
		});
	}
}
