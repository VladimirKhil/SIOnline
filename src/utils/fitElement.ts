const TEXT_MARGIN = 3;

const fitCache: { [key: string]: number } = {};

export default function fitElement(element: HTMLElement, maxFont: number) {
	const content = element.firstElementChild;

	if (!content) {
		return;
	}

	let font = maxFont;
	const boxHeight = element.clientHeight;
	const boxWidth = element.clientWidth;
	let innerHeight = 0;
	let innerWidth = 0;

	let extraHeight = 0;
	const style = window.getComputedStyle(element);

	if (style.paddingTop) {
		extraHeight += parseInt(style.paddingTop, 10);
	}

	if (style.paddingBottom) {
		extraHeight += parseInt(style.paddingBottom, 10);
	}

	const cacheKey = `${window.innerWidth} ${content.innerHTML} ${boxHeight + extraHeight} ${boxWidth + extraHeight}`;
	const cacheValue = fitCache[cacheKey];

	if (cacheValue) {
		element.style.fontSize = `${cacheValue}px`;
		return;
	}

	do {
		element.style.fontSize = `${font}px`;
		innerHeight = content.clientHeight + extraHeight;
		innerWidth = content.clientWidth + extraHeight;
		font--;
	} while ((innerHeight + TEXT_MARGIN > boxHeight || innerWidth > boxWidth + 1) && font > 0);

	if (content.innerHTML.length < 15) {
		fitCache[cacheKey] = font;
	}
}