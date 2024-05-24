import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	// constructor(private readonly configService: ConfigService) {}

	getHello(): string {
		return "Hello World!";
	}

	// async getUserProfilePhotos(userId: string) {
	// 	const url = `https://api.telegram.org/bot${this.configService.get("TELEGRAM_TOKEN")}/getUserProfilePhotos?user_id=${userId}`;
	// 	try {
	// 		const response = await axios.get(url);
	// 		return response.data.result.photos;
	// 	} catch (error) {
	// 		console.log("Error fetching user profile photos");
	// 		// throw new HttpException(
	// 		// 	"Error fetching user profile photos",
	// 		// 	HttpStatus.INTERNAL_SERVER_ERROR,
	// 		// );
	// 	}
	// }
	//
	// async getFile(fileId: string) {
	// 	const url = `https://api.telegram.org/bot${this.configService.get("TELEGRAM_TOKEN")}/getFile?file_id=${fileId}`;
	// 	try {
	// 		const response = await axios.get(url);
	// 		return response.data.result.file_path;
	// 	} catch (error) {
	// 		console.log("Error fetching file path");
	// 		//throw new HttpException("Error fetching file path", HttpStatus.INTERNAL_SERVER_ERROR);
	// 	}
	// }
	//
	// async getUserAvatarUrl(userId: string): Promise<string> {
	// 	const photos = await this.getUserProfilePhotos(userId);
	// 	if (photos.length === 0) {
	// 		console.log("No profile photos found.");
	// 		//throw new HttpException("No profile photos found.", HttpStatus.NOT_FOUND);
	// 	}
	//
	// 	try {
	// 		const photoSize = photos[0].pop(); // Берем самую большую версию фотографии
	// 		const fileId = photoSize.file_id;
	// 		const filePath = await this.getFile(fileId);
	//
	// 		return `https://api.telegram.org/file/bot${this.configService.get("TELEGRAM_TOKEN")}/${filePath}`;
	// 	} catch (e) {
	// 		return "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg";
	// 	}
	// }
}
