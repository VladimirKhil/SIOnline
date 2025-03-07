export interface InfoOwner {
	info?: Info;
}

export interface Package extends InfoOwner {
	name: string;
	version: string;
	id: string;
	restriction: string;
	date: string;
	publisher: string;
	difficulty: number;
	logo?: string;
	language: string;
	tags: Tag[];
	rounds: Round[];
}

export interface Round extends InfoOwner {
	name: string;
	type: string;
	themes: Theme[];
}

export interface Theme extends InfoOwner {
	name: string;
	questions: Question[];
}

export interface Question extends InfoOwner {
	price: number;
	type?: string;
	params: QuestionParams;
	right: Right;
	wrong?: Wrong;
}

export interface Tag {
	value: string;
}

export interface Info {
	authors?: Author[];
	sources?: Source[];
	comments?: string;
}

export interface Author {
	name: string;
}

export interface Source {
	value: string;
}

export interface QuestionParams {
	question?: ContentParam;
	theme?: string;
	price?: NumberSetParam;
	selectionMode?: SelectionMode;
	answer?: ContentParam;
	answerType?: string;
	answerOptions?: AnswerOptions;
}

export interface ContentParam {
	items: ContentItem[];
}

export interface ContentItem {
	type?: ContentType;
	value: string;
	isRef?: boolean;
	placement?: 'replic' | 'background' | 'screen';
	duration?: string;
	waitForFinish?: boolean;
}

export type ContentType = 'text' | 'image' | 'audio' | 'video' | 'html';

export interface NumberSetParam {
	numberSet: NumberSet;
}

export interface NumberSet {
	minimum: number;
	maximum: number;
	step: number;
}

export type SelectionMode = 'any' | 'exceptCurrent';

export interface AnswerOptions {
	[key: string]: ContentParam;
}

export interface Right {
	answer: string[];
}

export interface Wrong {
	answer: string[];
}

export function parseXMLtoPackage(xmlDoc: Document): Package {
	const packageElement = xmlDoc.documentElement;

	const pack: Package = {
		name: packageElement.getAttribute('name') || '',
		version: packageElement.getAttribute('version') || '',
		id: packageElement.getAttribute('id') || '',
		restriction: packageElement.getAttribute('restriction') || '',
		date: packageElement.getAttribute('date') || '',
		publisher: packageElement.getAttribute('publisher') || '',
		difficulty: Number(packageElement.getAttribute('difficulty')) || 0,
		language: packageElement.getAttribute('language') || '',
		logo: packageElement.getAttribute('logo') || undefined,
		tags: parseTags(packageElement),
		info: parseInfo(packageElement),
		rounds: parseRounds(packageElement),
	};

	return pack;
}

function parseTags(packageElement: Element): Tag[] {
	const tagsElement = packageElement.getElementsByTagName('tags')[0];
	if (!tagsElement) return [];

	return Array.from(tagsElement.getElementsByTagName('tag')).map(tag => ({
		value: tag.textContent || '',
	}));
}

function parseInfo(packageElement: Element): Info {
	const infoElement = packageElement.getElementsByTagName('info')[0];
	if (!infoElement) return { authors: [], sources: [] };

	return {
		authors: parseAuthors(infoElement),
		sources: parseSources(infoElement),
		comments: infoElement.getElementsByTagName('comments')[0]?.textContent || undefined,
	};
}

function parseAuthors(element: Element): Author[] {
	const authorsElement = element.getElementsByTagName('authors')[0];
	if (!authorsElement) return [];

	return Array.from(authorsElement.getElementsByTagName('author')).map(author => ({
		name: author.textContent || '',
	}));
}

function parseRounds(packageElement: Element): Round[] {
	const roundsElement = packageElement.getElementsByTagName('rounds')[0];
	if (!roundsElement) return [];

	return Array.from(roundsElement.getElementsByTagName('round')).map(round => ({
		name: round.getAttribute('name') || '',
		type: round.getAttribute('type') || '',
		info: parseInfo(round),
		themes: parseThemes(round),
	}));
}

function parseSources(element: Element): Source[] {
	const sourcesElement = element.getElementsByTagName('sources')[0];
	if (!sourcesElement) return [];

	return Array.from(sourcesElement.getElementsByTagName('source')).map(source => ({
		value: source.textContent || '',
	}));
}

function parseThemes(roundElement: Element): Theme[] {
	const themesElement = roundElement.getElementsByTagName('themes')[0];
	if (!themesElement) return [];

	return Array.from(themesElement.getElementsByTagName('theme')).map(theme => ({
		name: theme.getAttribute('name') || '',
		info: parseInfo(theme),
		questions: parseQuestions(theme),
	}));
}

function parseQuestions(themeElement: Element): Question[] {
	const questionsElement = themeElement.getElementsByTagName('questions')[0];
	if (!questionsElement) return [];

	return Array.from(questionsElement.getElementsByTagName('question')).map(question => ({
		price: Number(question.getAttribute('price')) || 0,
		type: question.getAttribute('type') as string | undefined,
		info: parseInfo(question),
		params: parseQuestionParams(question),
		right: parseRight(question),
		wrong: parseWrong(question),
	}));
}

function parseQuestionParams(questionElement: Element): QuestionParams {
	const paramsElement = questionElement.getElementsByTagName('params')[0];
	if (!paramsElement) return {};

	const params: QuestionParams = {};

	// Parse question content
	const questionParam = paramsElement.querySelector('param[name="question"]');
	if (questionParam) {
		params.question = parseContentParam(questionParam);
	}

	// Parse theme
	const themeParam = paramsElement.querySelector('param[name="theme"]');
	if (themeParam) {
		params.theme = themeParam.textContent || undefined;
	}

	// Parse price
	const priceParam = paramsElement.querySelector('param[name="price"]');
	if (priceParam) {
		const numberSetElement = priceParam.getElementsByTagName('numberSet')[0];
		if (numberSetElement) {
			params.price = {
				numberSet: {
					minimum: Number(numberSetElement.getAttribute('minimum')) || 0,
					maximum: Number(numberSetElement.getAttribute('maximum')) || 0,
					step: Number(numberSetElement.getAttribute('step')) || 0,
				},
			};
		}
	}

	// Parse selection mode
	const selectionModeParam = paramsElement.querySelector('param[name="selectionMode"]');
	if (selectionModeParam) {
		params.selectionMode = selectionModeParam.textContent as SelectionMode || undefined;
	}

	// Parse answer content
	const answerParam = paramsElement.querySelector('param[name="answer"]');
	if (answerParam) {
		params.answer = parseContentParam(answerParam);
	}

	return params;
}

function parseContentParam(paramElement: Element): ContentParam {
	return {
		items: Array.from(paramElement.getElementsByTagName('item')).map(item => ({
			type: item.getAttribute('type') as ContentType | undefined,
			value: item.textContent || '',
			isRef: item.getAttribute('isRef') === 'True',
			placement: item.getAttribute('placement') as 'replic' | 'background' | undefined,
			duration: item.getAttribute('duration') || undefined,
			waitForFinish: item.getAttribute('waitForFinish') !== 'False',
		})),
	};
}

function parseRight(questionElement: Element): Right {
	const rightElement = questionElement.getElementsByTagName('right')[0];
	if (!rightElement) return { answer: [] };

	return {
		answer: Array.from(rightElement.getElementsByTagName('answer')).map(answer =>
			answer.textContent || ''
		),
	};
}

function parseWrong(questionElement: Element): Wrong | undefined {
	const wrongElement = questionElement.getElementsByTagName('wrong')[0];
	if (!wrongElement) return undefined;

	return {
		answer: Array.from(wrongElement.getElementsByTagName('answer')).map(answer =>
			answer.textContent || ''
		),
	};
}
