export default interface ThemeSettings {
	table: {
		textColor?: string;
		backgroundColor?: string;
		fontFamily?: string;
		isHexagonal?: boolean;
	},
	room: {
		backgroundImageKey: string | null;
	}
}