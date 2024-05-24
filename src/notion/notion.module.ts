import { Global, Module } from "@nestjs/common";
import { NotionService } from "./notion.service";
import { Client } from "@notionhq/client";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: "NOTION_CLIENT",
			useFactory: (configService: ConfigService) => {
				return new Client({ auth: configService.get("NOTION_API_KEY") });
			},
			inject: [ConfigService],
		},
		NotionService,
	],
	exports: [NotionService],
})
export class NotionModule {}
