export default function isWellFormedUri(uri: string): boolean {
	try {
		new URL(uri);
		return true;
	} catch (error) {
		return false;
	}
  }
  