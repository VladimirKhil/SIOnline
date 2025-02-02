export default function getVisiblePageNumbers(pageIndex: number, pageCount: number): (number | string)[] {
	const visiblePages: (number | string)[] = [];
	const siblingsCount = 2; // Number of siblings to show around the current page

	if (pageCount <= siblingsCount * 2 + 2) {
		return Array.from({ length: pageCount }, (_, i) => i);
	}

	const startPage = Math.max(0, pageIndex - siblingsCount);
	const endPage = Math.min(pageCount - 1, pageIndex + siblingsCount);

	visiblePages.push(0, 1, 2);

	if (startPage > 3) {
		visiblePages.push('...');
	}

	for (let i = startPage; i <= endPage; i++) {
		if (i > 2 && i < pageCount - 3) {
			visiblePages.push(i);
		}
	}

	if (endPage < pageCount - 4) {
		visiblePages.push('...');
	}

	visiblePages.push(pageCount - 3, pageCount - 2, pageCount - 1);

	return visiblePages;
}