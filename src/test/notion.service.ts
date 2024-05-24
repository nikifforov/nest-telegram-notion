// import { Injectable } from "@nestjs/common";
// import { NotionService } from "nestjs-test";
//
// @Injectable()
// export class MyService {
// 	constructor(private readonly test: NotionService) {}
//
// 	async getDatabasesList() {
// 		return await this.test.databases.retrieve({
// 			database_id: "",
// 		});
// 	}
//
// 	async createNewClient(dto: any) {
// 		const res = await this.test.pages.create({
// 			// @ts-ignore
// 			cover: {
// 				type: "external",
// 				external: {
// 					url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg",
// 				},
// 			},
// 			parent: {
// 				database_id: "",
// 			},
// 			properties: {
// 				Name: {
// 					type: "title",
// 					title: [
// 						{
// 							type: "text",
// 							text: {
// 								content: dto.first_name + " " + dto.last_name,
// 							},
// 							plain_text: dto.first_name,
// 						},
// 					],
// 				},
// 				url: {
// 					type: "url",
// 					url: `https://t.me/${dto.username}`,
// 				},
// 				tgId: {
// 					type: "number",
// 					number: dto.id,
// 				},
// 				// Date: {
// 				// 	type: "date",
// 				// 	date: {
// 				// 		start: new Date().toISOString(),
// 				// 		end: new Date().toISOString(),
// 				// 	},
// 				// },
// 			},
// 		});
// 		console.log(res);
// 	}
//
// 	async getIndividualPage(pageId: string) {
// 		return await this.test.pages.retrieve({
// 			page_id: pageId,
// 		});
// 	}
//
// 	async getDatabase() {
// 		const response = await this.test.databases.query({
// 			database_id: "",
// 		});
//
// 		return response.results;
// 	}
//
// 	async getPageContent(pageId: string) {
// 		return await this.test.blocks.children.list({
// 			block_id: pageId,
// 		});
// 	}
//
// 	async getAllPages(pageId: string) {
// 		let pages = [];
// 		const blocks = await this.getPageContent(pageId);
// 		console.log("blocks: ", blocks);
// 		// @ts-ignore
// 		for (const block of blocks) {
// 			pages.push(block);
//
// 			if (block.has_children) {
// 				const childPages = await this.getAllPages(block.id);
// 				pages = pages.concat(childPages);
// 			}
// 		}
//
// 		return pages;
// 	}
//
// 	async getDatabaseWithPages() {
// 		const databaseItems = await this.getDatabase();
// 		// @ts-ignore
// 		for (const item of databaseItems) {
// 			// @ts-ignore
// 			console.log(item.properties);
// 			const pageId = item.id;
// 			const pageContent = "pup";
// 			//const pageContent = await this.getAllPages(pageId);
// 			console.log(`Page ID: ${pageId}`, pageContent);
// 		}
// 	}
// }
//
// // https://www.notion.so/nikifforov/d6ac37b1befc45c1b690e90f0c867145?v=326665529a4d494384f39b29a0d11370
// // https://www.notion.so/nikifforov/d6ac37b1befc45c1b690e90f0c867145?v=326665529a4d494384f39b29a0d11370&p=c232e576140141aaa87a638c17490344&pm=s
// // https://www.notion.so/nikifforov/c232e576140141aaa87a638c17490344
//
// // Календарь БД
// // https://www.notion.so/nikifforov/51c3c2b3a25b430aa5c13d6ef94b674c?v=8c9e09cf579942b1ab06afa75f18403c&pvs=12
// // https://www.notion.so/nikifforov/22316a2122e948a191384d0fc0e2ae3f?pvs=4
