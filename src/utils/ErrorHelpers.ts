export default function getErrorMessage(e: unknown): string {
	return e instanceof Error ? e.message : (e as Record<string, unknown>).toString();
}
