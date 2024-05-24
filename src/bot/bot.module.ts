import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { TelegrafModule } from "nestjs-telegraf";
import * as LocalSession from "telegraf-session-local";
import { ConfigModule, ConfigService } from "@nestjs/config";

const sessions = new LocalSession({ database: "session_db.json" });

@Module({
	imports: [
		// TelegrafModule.forRoot({
		// 	middlewares: [sessions.middleware()],
		// 	token: configService.get<string>("TELEGRAM_TOKEN"),
		// }),
		TelegrafModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				migrationsDir: [sessions.middleware()],
				token: configService.get<string>("TELEGRAM_TOKEN"),
			}),
			inject: [ConfigService],
		}),
	],
	providers: [BotService],
})
export class BotModule {}
