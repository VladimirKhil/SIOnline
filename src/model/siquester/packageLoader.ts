import {
	Package,
	Round,
	Theme,
	Question,
	Tag,
	Info,
	Author,
	Source,
	QuestionParams,
	ContentParam,
	ContentItem,
	ContentType,
	SelectionMode,
	Right,
	Wrong,
	NumberSet,
	QuestionTypes,
	AtomTypes,
	QuestionTypeParams,
	StepParameterValues
} from './package';

function getDirectChildByTagName(element: Element, tagName: string): Element | null {
	return Array.from(element.children).find(child => child.tagName === tagName) || null;
}

function getDirectChildrenByTagName(element: Element, tagName: string): Element[] {
	return Array.from(element.children).filter(child => child.tagName === tagName);
}

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
		isQualityMarked: false,
	};

	return pack;
}

function parseTags(packageElement: Element): Tag[] {
	const [tagsElement] = Array.from(packageElement.children).filter(child => child.tagName === 'tags');
	if (!tagsElement) return [];

	return getDirectChildrenByTagName(tagsElement, 'tag').map(tag => ({
		value: tag.textContent || '',
	}));
}

function parseInfo(packageElement: Element): Info {
	const infoElement = Array.from(packageElement.children).find(child => child.tagName === 'info');
	if (!infoElement) return { authors: [], sources: [] };

	return {
		authors: parseAuthors(infoElement),
		sources: parseSources(infoElement),
		comments: getDirectChildByTagName(infoElement, 'comments')?.textContent || undefined,
	};
}

function parseAuthors(element: Element): Author[] {
	const authorsElement = getDirectChildByTagName(element, 'authors');
	if (!authorsElement) return [];

	return getDirectChildrenByTagName(authorsElement, 'author').map(author => ({
		name: author.textContent || '',
	}));
}

function parseRounds(packageElement: Element, version: string): Round[] {
	const roundsElement = getDirectChildByTagName(packageElement, 'rounds');
	if (!roundsElement) return [];

	return getDirectChildrenByTagName(roundsElement, 'round').map(round => ({
		name: round.getAttribute('name') || '',
		type: round.getAttribute('type') || '',
		info: parseInfo(round),
		themes: parseThemes(round, version),
	}));
}

function parseSources(element: Element): Source[] {
	const sourcesElement = getDirectChildByTagName(element, 'sources');
	if (!sourcesElement) return [];

	return getDirectChildrenByTagName(sourcesElement, 'source').map(source => ({
		value: source.textContent || '',
	}));
}

function parseThemes(roundElement: Element, version: string): Theme[] {
	const themesElement = getDirectChildByTagName(roundElement, 'themes');
	if (!themesElement) return [];

	return getDirectChildrenByTagName(themesElement, 'theme').map(theme => ({
		name: theme.getAttribute('name') || '',
		info: parseInfo(theme),
		questions: parseQuestions(theme, version),
	}));
}

function parseQuestions(themeElement: Element, version: string): Question[] {
	const questionsElement = getDirectChildByTagName(themeElement, 'questions');
	if (!questionsElement) return [];

	return getDirectChildrenByTagName(questionsElement, 'question').map(question => {
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
	const typeElement = getDirectChildByTagName(question, 'type');
	let typeName = QuestionTypes.Default;
	const typeParams: Map<string, string> = new Map();

	if (typeElement) {
		typeName = typeElement.getAttribute('name') || QuestionTypes.Default;

		// Parse type parameters
		getDirectChildrenByTagName(typeElement, 'param').forEach(param => {
		const name = param.getAttribute('name') || '';
		const value = param.textContent || '';
		if (name) {
			typeParams.set(name, value);
		}
		});
	}

	// Parse atoms from scenario
	const scenarioElement = getDirectChildByTagName(question, 'scenario');

	const atoms: Array<{
		type?: string,
		text: string,
		time: number
	}> = [];

	if (scenarioElement) {
		getDirectChildrenByTagName(scenarioElement, 'atom').forEach(atom => {
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

function parseContentParam(paramElement: Element): ContentParam {
	return {
		items: getDirectChildrenByTagName(paramElement, 'item').map(item => ({
			type: item.getAttribute('type') as ContentType ?? 'text',
			value: item.textContent || '',
			isRef: item.getAttribute('isRef')?.toLowerCase() === 'true', // Default to false
			placement: item.getAttribute('placement') as 'replic' | 'background' | 'screen' ?? 'screen',
			duration: item.getAttribute('duration') || undefined,
			waitForFinish: item.getAttribute('waitForFinish')?.toLowerCase() !== 'false', // Default to true
		})),
	};
}

function parseUnknownParam(paramElement: Element): unknown {
	const type = paramElement.getAttribute('type');

	// If it has a type attribute, try to preserve structure based on known patterns
	switch (type) {
		case 'content': {
			// Try to parse as content parameter
			return parseContentParam(paramElement);
		}

		case 'numberSet': {
			// Try to parse as number set
			const numberSetElement = getDirectChildByTagName(paramElement, 'numberSet');
			if (numberSetElement) {
				return {
					numberSet: {
						minimum: Number(numberSetElement.getAttribute('minimum')) || 0,
						maximum: Number(numberSetElement.getAttribute('maximum')) || 0,
						step: Number(numberSetElement.getAttribute('step')) || 0,
					}
				};
			}
			// Fallback to text content
			return paramElement.textContent || '';
		}

		case 'group': {
			// Parse as group with nested parameters
			const result: Record<string, unknown> = {};
			getDirectChildrenByTagName(paramElement, 'param').forEach(childParam => {
				const childName = childParam.getAttribute('name') || '';
				if (childName) {
					result[childName] = parseUnknownParam(childParam);
				}
			});
			return result;
		}

		default: {
			// For simple parameters or unknown types, store as text
			// But also preserve all attributes for complete fidelity
			const result: Record<string, unknown> = {
				_textContent: paramElement.textContent || '',
			};

			// Store all attributes
			const attributes: Record<string, string> = {};
			for (let i = 0; i < paramElement.attributes.length; i += 1) {
				const attr = paramElement.attributes[i];
				if (attr.name !== 'name') { // Don't store the 'name' attribute since it's used as the key
					attributes[attr.name] = attr.value;
				}
			}

			if (Object.keys(attributes).length > 0) {
				result._attributes = attributes;
			}

			// Store child elements if any
			const childElements = Array.from(paramElement.children);
			if (childElements.length > 0) {
				result._children = childElements.map(child => ({
					tagName: child.tagName,
					textContent: child.textContent || '',
					attributes: Array.from(child.attributes).reduce((acc, attr) => {
						acc[attr.name] = attr.value;
						return acc;
					}, {} as Record<string, string>)
				}));
			}

			// If it's just simple text content with no attributes or children, return just the text
			if (!result._attributes && !result._children && result._textContent) {
				return result._textContent;
			}

			return result;
		}
	}
}

function parseQuestionParams(questionElement: Element): QuestionParams {
	const paramsElement = getDirectChildByTagName(questionElement, 'params');
	if (!paramsElement) return {};

	const params: QuestionParams = {};

	// Parse all param elements
	const allParams = getDirectChildrenByTagName(paramsElement, 'param');

	for (const paramElement of allParams) {
		const paramName = paramElement.getAttribute('name');
		if (!paramName) continue;

		// Handle known parameters with specific parsing logic
		switch (paramName) {
			case 'question': {
				params.question = parseContentParam(paramElement);
				break;
			}

			case 'theme': {
				params.theme = paramElement.textContent || undefined;
				break;
			}

			case 'price': {
				const numberSetElement = getDirectChildByTagName(paramElement, 'numberSet');
				if (numberSetElement) {
					params.price = {
						numberSet: {
							minimum: Number(numberSetElement.getAttribute('minimum')) || 0,
							maximum: Number(numberSetElement.getAttribute('maximum')) || 0,
							step: Number(numberSetElement.getAttribute('step')) || 0,
						},
					};
				}
				break;
			}

			case 'selectionMode': {
				params.selectionMode = paramElement.textContent as SelectionMode || undefined;
				break;
			}

			case 'answer': {
				params.answer = parseContentParam(paramElement);
				break;
			}

			case 'answerType': {
				params.answerType = paramElement.textContent || undefined;
				break;
			}

			case 'answerOptions': {
				params.answerOptions = {};
				getDirectChildrenByTagName(paramElement, 'param').forEach(option => {
					const key = option.getAttribute('name') || '';
					if (params.answerOptions) {
						params.answerOptions[key] = parseContentParam(option);
					}
				});
				break;
			}

			default: {
				// Handle unknown parameters - preserve their structure
				params[paramName] = parseUnknownParam(paramElement);
				break;
			}
		}
	}

	return params;
}

function parseRight(questionElement: Element): Right {
	const rightElement = getDirectChildByTagName(questionElement, 'right');
	if (!rightElement) return { answer: [] };

	return {
		answer: getDirectChildrenByTagName(rightElement, 'answer').map(answer => answer.textContent || ''),
	};
}

function parseWrong(questionElement: Element): Wrong | undefined {
	const wrongElement = getDirectChildByTagName(questionElement, 'wrong');
	if (!wrongElement) return undefined;

	return {
		answer: getDirectChildrenByTagName(wrongElement, 'answer').map(answer => answer.textContent || ''),
	};
}

function getStepValue(minimum: number, maximum: number, stepString: string): number {
	if (stepString && stepString.length > 0) {
		return parseInt(stepString, 10);
	}

	return maximum - minimum; // Default step if not specified
}

function dateFromSeconds(time: number): string | undefined {
	const date = new Date();
	date.setSeconds(time);
	return date.toISOString().substr(11, 8);
}

function formatDuration(time: number): string | undefined {
	return time > 0 ? dateFromSeconds(time) : undefined;
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