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
	contactUri?: string;
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
	[key: string]: any;
}

export interface ContentParam {
	items: ContentItem[];
}

export interface ContentItem {
	type: ContentType;
	value: string;
	isRef: boolean;
	placement: 'replic' | 'background' | 'screen';
	duration?: string;
	waitForFinish?: boolean;
}

export type ContentType = 'text' | 'image' | 'audio' | 'video' | 'html';

export interface NumberSetParam {
	numberSet: NumberSet | null;
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

export const QuestionTypes = {
	Default: '',
	Simple: 'simple',
	Auction: 'auction',
	Cat: 'cat',
	BagCat: 'bagcat',
	Sponsored: 'sponsored',
	Secret: 'secret',
	SecretNoQuestion: 'secretNoQuestion',
	SecretPublicPrice: 'secretPublicPrice',
	Stake: 'stake',
	NoRisk: 'noRisk',
	StakeAll: 'stakeAll',
	ForAll: 'forAll'
};

export const ContentTypes = {
	Text: 'text',
	Image: 'image',
	Audio: 'audio',
	AudioNew: 'audio',
	Video: 'video',
	Html: 'html'
};

export const AtomTypes = {
	Text: '',
	Oral: 'say',
	Audio: 'voice',
	Image: 'image',
	Video: 'video',
	Html: 'html',
	Marker: 'marker'
};

export const ContentPlacements = {
	Screen: 'screen',
	Replic: 'replic',
	Background: 'background'
};

export const QuestionParameterNames = {
	Question: 'question',
	Answer: 'answer',
	Theme: 'theme',
	Price: 'price',
	SelectionMode: 'selectionMode'
};

export const StepParameterTypes = {
	Simple: 'simple',
	Content: 'content',
	NumberSet: 'numberSet',
	Group: 'group'
};

export const StepParameterValues = {
	SetAnswererSelect_Any: 'any',
	SetAnswererSelect_ExceptCurrent: 'exceptCurrent'
};

export const QuestionTypeParams = {
	Cat_Theme: 'theme',
	Cat_Cost: 'cost',
	BagCat_Knows: 'knows',
	BagCat_Knows_Value_Before: 'before',
	BagCat_Knows_Value_After: 'after',
	BagCat_Knows_Value_Never: 'never',
	BagCat_Self: 'self',
	BagCat_Self_Value_True: 'true',
	BagCat_Self_Value_False: 'false'
};

export function parseXMLtoPackage(xmlDoc: Document): Package {
	const packageElement = xmlDoc.documentElement;
	const version = packageElement.getAttribute('version') || '';

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
		contactUri: packageElement.getAttribute('contactUri') || undefined,
		tags: parseTags(packageElement),
		info: parseInfo(packageElement),
		rounds: parseRounds(packageElement, version),
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

function parseRounds(packageElement: Element, version: string): Round[] {
	const roundsElement = packageElement.getElementsByTagName('rounds')[0];
	if (!roundsElement) return [];

	return Array.from(roundsElement.getElementsByTagName('round')).map(round => ({
		name: round.getAttribute('name') || '',
		type: round.getAttribute('type') || '',
		info: parseInfo(round),
		themes: parseThemes(round, version),
	}));
}

function parseSources(element: Element): Source[] {
	const sourcesElement = element.getElementsByTagName('sources')[0];
	if (!sourcesElement) return [];

	return Array.from(sourcesElement.getElementsByTagName('source')).map(source => ({
		value: source.textContent || '',
	}));
}

function parseThemes(roundElement: Element, version: string): Theme[] {
	const themesElement = roundElement.getElementsByTagName('themes')[0];
	if (!themesElement) return [];

	return Array.from(themesElement.getElementsByTagName('theme')).map(theme => ({
		name: theme.getAttribute('name') || '',
		info: parseInfo(theme),
		questions: parseQuestions(theme, version),
	}));
}

function parseQuestions(themeElement: Element, version: string): Question[] {
	const questionsElement = themeElement.getElementsByTagName('questions')[0];
	if (!questionsElement) return [];

	return Array.from(questionsElement.getElementsByTagName('question')).map(question => {
		// Parse common properties
		const price = Number(question.getAttribute('price')) || 0;
		const info = parseInfo(question);

		if (version === '4') {
			// Parse v4 format and upgrade to v5
			return parseAndUpgradeV4Question(question, price, info);
		} else {
			// Parse v5 format directly
			return {
				price: price,
				type: question.getAttribute('type') as string | undefined,
				info: info,
				params: parseQuestionParams(question),
				right: parseRight(question),
				wrong: parseWrong(question),
			};
		}
	});
}

function parseAndUpgradeV4Question(question: Element, price: number, info: Info): Question {
	// Initial question object with common properties
	const result: Question = {
		price: price,
		info: info,
		params: {},
		right: parseRight(question),
		wrong: parseWrong(question),
	};

	// Parse v4 specific elements: type and scenario
	const typeElement = question.getElementsByTagName('type')[0];
	let typeName = QuestionTypes.Default;
	const typeParams: Map<string, string> = new Map();

	if (typeElement) {
		typeName = typeElement.getAttribute('name') || QuestionTypes.Default;

		// Parse type parameters
		Array.from(typeElement.getElementsByTagName('param')).forEach(param => {
		const name = param.getAttribute('name') || '';
		const value = param.textContent || '';
		if (name) {
			typeParams.set(name, value);
		}
		});
	}

	// Parse atoms from scenario
	const scenarioElement = question.getElementsByTagName('scenario')[0];

	const atoms: Array<{
		type?: string,
		text: string,
		time: number
	}> = [];

	if (scenarioElement) {
		Array.from(scenarioElement.getElementsByTagName('atom')).forEach(atom => {
			const type = atom.getAttribute('type') || '';
			const timeStr = atom.getAttribute('time');
			let time: number = 0;

			if (timeStr) {
				time = parseInt(timeStr);

				if (isNaN(time)) {
					time = 0;
				}
			}

			atoms.push({
				type: type,
				text: atom.textContent || '',
				time: time
			});
		});
	}

	// Apply upgrade logic similar to C# Upgrade() method
	upgradeV4Question(result, typeName, typeParams, atoms);

	return result;
}

function upgradeV4Question(
	question: Question,
	typeName: string,
	typeParams: Map<string, string>,
	atoms: Array<{ type?: string, text: string, time: number }>
): void {
	// Skip upgrade for invalid question
	const InvalidPrice = -1;

	if (question.price === InvalidPrice) {
		question.type = QuestionTypes.Default;
		return;
	}

	// Upgrade question type based on C# logic
	switch (typeName) {
		case QuestionTypes.Auction:
			question.type = QuestionTypes.Stake;
			break;

		case QuestionTypes.Sponsored:
			question.type = QuestionTypes.NoRisk;
			break;

		case QuestionTypes.BagCat:
		case QuestionTypes.Cat:
		{
			const theme = typeParams.get(QuestionTypeParams.Cat_Theme) || '';
			const price = typeParams.get(QuestionTypeParams.Cat_Cost) || '';

			const knows = typeName === QuestionTypes.BagCat
				? typeParams.get(QuestionTypeParams.BagCat_Knows) || QuestionTypeParams.BagCat_Knows_Value_After
				: QuestionTypeParams.BagCat_Knows_Value_After;

			const canGiveSelf = typeName === QuestionTypes.BagCat
				? typeParams.get(QuestionTypeParams.BagCat_Self) || QuestionTypeParams.BagCat_Self_Value_False
				: QuestionTypeParams.BagCat_Self_Value_False;

			const selectAnswererMode = canGiveSelf === QuestionTypeParams.BagCat_Self_Value_True
				? StepParameterValues.SetAnswererSelect_Any
				: StepParameterValues.SetAnswererSelect_ExceptCurrent;

			// Parse numberSet from price string
			const numberSet = parseNumberSetFromString(price);

			if (knows === QuestionTypeParams.BagCat_Knows_Value_Never) {
				// Clear atoms for secretNoQuestion
				atoms = [];
				question.type = QuestionTypes.SecretNoQuestion;

				question.params.price = {
					numberSet: numberSet
				};

				question.params.selectionMode = selectAnswererMode as SelectionMode;
			} else {
				// Set proper type based on knows value
				question.type = knows === QuestionTypeParams.BagCat_Knows_Value_Before
					? QuestionTypes.SecretPublicPrice
					: QuestionTypes.Secret;

				question.params.theme = theme;

				question.params.price = {
					numberSet: numberSet
				};

				question.params.selectionMode = selectAnswererMode as SelectionMode;
			}
		}
		break;

		case QuestionTypes.Simple:
			question.type = QuestionTypes.Default;
			break;

		default:
			question.type = typeName;

			// Copy parameters if any
			typeParams.forEach((value, key) => {
				if (!question.params[key]) {
					question.params[key] = value;
				}
			});

			break;
	}

	// Convert atoms to content items
	const content: ContentItem[] = [];
	let useMarker = false;
	const answerContent: ContentItem[] = [];

	for (const atom of atoms) {
		if (atom.type === AtomTypes.Marker) {
			if (!useMarker) {
				useMarker = true;
			}

			continue;
		}

		const contentItem: ContentItem = {
			type: getContentType(atom.type),
			value: atom.text,
			duration: atom.time !== -1 ? formatDuration(atom.time) : undefined,
			placement: getPlacement(atom.type),
			waitForFinish: atom.time !== -1,
			isRef: atom.text.startsWith('@')
		};

		if (useMarker) {
			answerContent.push(contentItem);
		} else {
			content.push(contentItem);
		}
	}

	// Add content to params
	if (content.length > 0) {
		question.params.question = {
			items: content
		};
	}

	// Add answer content if exists
	if (useMarker && answerContent.length > 0) {
		question.params.answer = {
			items: answerContent
		};
	}
}

function getContentType(type?: string): ContentType {
	if (!type) {
		return 'text';
	}

	switch (type) {
		case AtomTypes.Oral:
			return 'text';
		case AtomTypes.Audio:
			return 'audio';
		case AtomTypes.Image:
			return 'image';
		case AtomTypes.Video:
			return 'video';
		case AtomTypes.Html:
			return 'html';
		default:
			return 'text';
	}
}

function getPlacement(type?: string): 'replic' | 'background' | 'screen' {
	if (!type) {
		return 'screen';
	}

	switch (type) {
		case AtomTypes.Oral:
			return 'replic';
		case AtomTypes.Audio:
			return 'background';
		default:
			return 'screen';
	}
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

	const answerTypeParam = paramsElement.querySelector('param[name="answerType"]');

	if (answerTypeParam) {
		params.answerType = answerTypeParam.textContent || undefined;
	}

	const answerOptionsParam = paramsElement.querySelector('param[name="answerOptions"]');

	if (answerOptionsParam) {
		params.answerOptions = {};

		Array.from(answerOptionsParam.getElementsByTagName('param')).forEach(option => {
			const key = option.getAttribute('name') || '';
			params.answerOptions![key] = parseContentParam(option);
		});
	}

	return params;
}

function parseContentParam(paramElement: Element): ContentParam {
	return {
		items: Array.from(paramElement.getElementsByTagName('item')).map(item => ({
			type: item.getAttribute('type') as ContentType ?? 'text',
			value: item.textContent || '',
			isRef: item.getAttribute('isRef') === 'True',
			placement: item.getAttribute('placement') as 'replic' | 'background' | 'screen' ?? 'screen',
			duration: item.getAttribute('duration') || undefined,
			waitForFinish: item.getAttribute('waitForFinish') !== 'False',
		})),
	};
}

function parseRight(questionElement: Element): Right {
	const rightElement = questionElement.getElementsByTagName('right')[0];
	if (!rightElement) return { answer: [] };

	return {
		answer: Array.from(rightElement.getElementsByTagName('answer')).map(answer => answer.textContent || ''),
	};
}

function parseWrong(questionElement: Element): Wrong | undefined {
	const wrongElement = questionElement.getElementsByTagName('wrong')[0];
	if (!wrongElement) return undefined;

	return {
		answer: Array.from(wrongElement.getElementsByTagName('answer')).map(answer => answer.textContent || ''),
	};
}

function parseNumberSetFromString(price: string): NumberSet | null {
	// Try parsing as a single number
	const singleNumber = parseInt(price);

	if (!isNaN(singleNumber)) {
		return {
			minimum: singleNumber,
			maximum: singleNumber,
			step: 0
		};
	}

	const numberSetRegex = /\[(\d+);(\d+)\](\/(\d+))?/;
	const match = numberSetRegex.exec(price);

	if (!match) {
		return null;
	}

	const minimum = parseInt(match[1]);
	const maximum = parseInt(match[2]);
	const stepString = match[4] || '';

	return {
		minimum,
		maximum,
		step: getStepValue(minimum, maximum, stepString)
	};
}

function getStepValue(minimum: number, maximum: number, stepString: string): number {
	if (stepString && stepString.length > 0) {
		return parseInt(stepString, 10);
	}

	return maximum - minimum; // Default step if not specified
}

function formatDuration(time: number): string | undefined {
	return time > 0 ? dateFromSeconds(time) : undefined;
}

function dateFromSeconds(time: number): string | undefined {
	const date = new Date();
	date.setSeconds(time);
	return date.toISOString().substr(11, 8);
}

