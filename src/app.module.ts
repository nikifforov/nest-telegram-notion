import { Module } from "@nestjs/common";
// import { NotionModule } from "nestjs-notion";
// import { MyService } from "./test/test.service";
import { NotionModule } from "./notion/notion.module";
import { ConfigModule } from "@nestjs/config";
import { BotModule } from "./bot/bot.module";
import { AppService } from "./app.service";

// const sessions = new LocalSession({ database: "session_db.json" });

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), BotModule, NotionModule],
	providers: [AppService],
	// providers: [AppUpdate, AppService],
})
export class AppModule {}
