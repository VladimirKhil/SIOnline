import { Package, Round, Theme, Question, Info, ContentParam, ContentPlacements, StepParameterTypes } from './package';

function serializeInfo(xmlDoc: Document, info: Info): Element | null {
	const hasAuthors = info.authors && info.authors.length > 0;
	const hasSources = info.sources && info.sources.length > 0;
	const hasComments = info.comments && info.comments.trim() !== '';

	if (!hasAuthors && !hasSources && !hasComments) {
		// No info to serialize
		return null;
	}

	const infoElement = xmlDoc.createElement('info');

	// Add authors
	if (info.authors && info.authors.length > 0) {
		const authorsElement = xmlDoc.createElement('authors');
		info.authors.forEach(author => {
			const authorElement = xmlDoc.createElement('author');
			authorElement.textContent = author.name;
			authorsElement.appendChild(authorElement);
		});
		infoElement.appendChild(authorsElement);
	}

	// Add sources
	if (info.sources && info.sources.length > 0) {
		const sourcesElement = xmlDoc.createElement('sources');
		info.sources.forEach(source => {
			const sourceElement = xmlDoc.createElement('source');
			sourceElement.textContent = source.value;
			sourcesElement.appendChild(sourceElement);
		});
		infoElement.appendChild(sourcesElement);
	}

	// Add comments
	if (info.comments && info.comments.trim() !== '') {
		const commentsElement = xmlDoc.createElement('comments');
		commentsElement.textContent = info.comments;
		infoElement.appendChild(commentsElement);
	}

	return infoElement;
}

function serializeContentParam(xmlDoc: Document, paramElement: Element, contentParam: ContentParam): void {
	contentParam.items.forEach(item => {
		const itemElement = xmlDoc.createElement('item');

		if (item.type && item.type !== 'text') {
			itemElement.setAttribute('type', item.type);
		}

		if (item.isRef) {
			itemElement.setAttribute('isRef', 'True');
		}

		if (item.placement && item.placement !== ContentPlacements.Screen) {
			itemElement.setAttribute('placement', item.placement);
		}

		if (item.duration !== undefined) {
			itemElement.setAttribute('duration', item.duration);
		}

		if (!item.waitForFinish) {
			itemElement.setAttribute('waitForFinish', 'False');
		}

		itemElement.textContent = item.value;
		paramElement.appendChild(itemElement);
	});
}

function serializeUnknownParam(xmlDoc: Document, paramName: string, paramValue: unknown): Element | null {
	if (paramValue === undefined || paramValue === null) {
		return null;
	}

	const paramElement = xmlDoc.createElement('param');
	paramElement.setAttribute('name', paramName);

	// Handle different types of unknown parameters
	if (typeof paramValue === 'string') {
		// Simple string parameter
		paramElement.textContent = paramValue;
	} else if (typeof paramValue === 'object' && paramValue !== null) {
		// Check if it looks like a content parameter
		if ('items' in paramValue && Array.isArray((paramValue as Record<string, unknown>).items)) {
			// Serialize as content parameter
			paramElement.setAttribute('type', StepParameterTypes.Content);
			serializeContentParam(xmlDoc, paramElement, paramValue as ContentParam);
		} else if ('numberSet' in paramValue && typeof (paramValue as Record<string, unknown>).numberSet === 'object') {
			// Serialize as number set parameter
			paramElement.setAttribute('type', StepParameterTypes.NumberSet);
			const { numberSet } = paramValue as Record<string, Record<string, unknown>>;
			const numberSetElement = xmlDoc.createElement('numberSet');
			numberSetElement.setAttribute('minimum', numberSet.minimum?.toString() || '0');
			numberSetElement.setAttribute('maximum', numberSet.maximum?.toString() || '0');
			numberSetElement.setAttribute('step', numberSet.step?.toString() || '0');
			paramElement.appendChild(numberSetElement);
		} else if ('_textContent' in paramValue) {
			// Handle preserved structure with attributes and children
			const preserved = paramValue as Record<string, unknown>;
			
			// Set text content
			if (preserved._textContent && typeof preserved._textContent === 'string') {
				paramElement.textContent = preserved._textContent;
			}
			
			// Restore attributes
			if (preserved._attributes && typeof preserved._attributes === 'object' && preserved._attributes !== null) {
				const attributes = preserved._attributes as Record<string, string>;
				Object.keys(attributes).forEach(attrName => {
					paramElement.setAttribute(attrName, attributes[attrName]);
				});
			}
			
			// Restore child elements
			if (preserved._children && Array.isArray(preserved._children)) {
				const children = preserved._children as Array<{
					tagName: string;
					textContent?: string;
					attributes?: Record<string, string>;
				}>;
				children.forEach(child => {
					const childElement = xmlDoc.createElement(child.tagName);
					if (child.textContent) {
						childElement.textContent = child.textContent;
					}
					if (child.attributes && typeof child.attributes === 'object') {
						Object.keys(child.attributes).forEach(attrName => {
							if (child.attributes) {
								childElement.setAttribute(attrName, child.attributes[attrName]);
							}
						});
					}
					paramElement.appendChild(childElement);
				});
			}
		} else {
			// Handle as group parameter with nested parameters
			paramElement.setAttribute('type', StepParameterTypes.Group);
			Object.keys(paramValue as Record<string, unknown>).forEach(key => {
				const nestedValue = (paramValue as Record<string, unknown>)[key];
				const nestedParam = serializeUnknownParam(xmlDoc, key, nestedValue);
				if (nestedParam) {
					paramElement.appendChild(nestedParam);
				}
			});
		}
	} else {
		// For other primitive types, convert to string
		paramElement.textContent = String(paramValue);
	}

	return paramElement;
}

function serializeQuestion(xmlDoc: Document, question: Question): Element {
	const questionElement = xmlDoc.createElement('question');

	questionElement.setAttribute('price', question.price.toString());

	if (question.type) {
		questionElement.setAttribute('type', question.type);
	}

	// Add info
	if (question.info) {
		const infoElement = serializeInfo(xmlDoc, question.info);

		if (infoElement) {
			questionElement.appendChild(infoElement);
		}
	}

	// Add params
	if (question.params) {
		const paramsElement = xmlDoc.createElement('params');

		// Add theme param
		if (question.params.theme) {
			const paramElement = xmlDoc.createElement('param');
			paramElement.setAttribute('name', 'theme');
			paramElement.textContent = question.params.theme;
			paramsElement.appendChild(paramElement);
		}

		// Add price param
		if (question.params.price?.numberSet) {
			const paramElement = xmlDoc.createElement('param');
			paramElement.setAttribute('name', 'price');
			paramElement.setAttribute('type', StepParameterTypes.NumberSet);

			const numberSetElement = xmlDoc.createElement('numberSet');
			numberSetElement.setAttribute('minimum', question.params.price.numberSet.minimum.toString());
			numberSetElement.setAttribute('maximum', question.params.price.numberSet.maximum.toString());
			numberSetElement.setAttribute('step', question.params.price.numberSet.step.toString());

			paramElement.appendChild(numberSetElement);
			paramsElement.appendChild(paramElement);
		}

		// Add selection mode param
		if (question.params.selectionMode) {
			const paramElement = xmlDoc.createElement('param');
			paramElement.setAttribute('name', 'selectionMode');
			paramElement.textContent = question.params.selectionMode;
			paramsElement.appendChild(paramElement);
		}

		// Add question content
		if (question.params.question) {
			const paramElement = xmlDoc.createElement('param');
			paramElement.setAttribute('name', 'question');
			paramElement.setAttribute('type', StepParameterTypes.Content);
			serializeContentParam(xmlDoc, paramElement, question.params.question);
			paramsElement.appendChild(paramElement);
		}

		// Add answer type
		if (question.params.answerType) {
			const paramElement = xmlDoc.createElement('param');
			paramElement.setAttribute('name', 'answerType');
			paramElement.textContent = question.params.answerType;
			paramsElement.appendChild(paramElement);

			if (question.params.answerType === 'select') {
				// Add answer options
				if (question.params.answerOptions) {
					const answerOptionsParamElement = xmlDoc.createElement('param');
					answerOptionsParamElement.setAttribute('name', 'answerOptions');
					answerOptionsParamElement.setAttribute('type', StepParameterTypes.Group);

					Object.keys(question.params.answerOptions).forEach(key => {
						const options = question.params.answerOptions;
						if (options) {
							const option = options[key] as ContentParam;
							const optionParamElement = xmlDoc.createElement('param');
							optionParamElement.setAttribute('name', key);
							optionParamElement.setAttribute('type', StepParameterTypes.Content);
							serializeContentParam(xmlDoc, optionParamElement, option);
							answerOptionsParamElement.appendChild(optionParamElement);
						}
					});

					paramsElement.appendChild(answerOptionsParamElement);
				}
			}
		}

		// Add answer deviation
		if (question.params.answerDeviation) {
			const paramElement = xmlDoc.createElement('param');
			paramElement.setAttribute('name', 'answerDeviation');
			paramElement.textContent = question.params.answerDeviation;
			paramsElement.appendChild(paramElement);
		}

		// Add answer duration
		if (question.params.answerDuration) {
			const paramElement = xmlDoc.createElement('param');
			paramElement.setAttribute('name', 'answerDuration');
			paramElement.textContent = question.params.answerDuration;
			paramsElement.appendChild(paramElement);
		}

		// Add answer content
		if (question.params.answer) {
			const paramElement = xmlDoc.createElement('param');
			paramElement.setAttribute('name', 'answer');
			paramElement.setAttribute('type', StepParameterTypes.Content);
			serializeContentParam(xmlDoc, paramElement, question.params.answer);
			paramsElement.appendChild(paramElement);
		}

		// Add unknown parameters
		const knownParams = new Set([
			'question', 'theme', 'price', 'selectionMode',
			'answer', 'answerType', 'answerDeviation',
			'answerDuration', 'answerOptions',
		]);
		Object.keys(question.params).forEach(paramName => {
			if (!knownParams.has(paramName)) {
				const paramValue = question.params[paramName];
				const paramElement = serializeUnknownParam(xmlDoc, paramName, paramValue);
				if (paramElement) {
					paramsElement.appendChild(paramElement);
				}
			}
		});

		questionElement.appendChild(paramsElement);
	}

	// Add right answers
	if (question.right) {
		const rightElement = xmlDoc.createElement('right');
		question.right.answer.forEach(answer => {
			const answerElement = xmlDoc.createElement('answer');
			answerElement.textContent = answer;
			rightElement.appendChild(answerElement);
		});
		questionElement.appendChild(rightElement);
	}

	// Add wrong answers
	if (question.wrong) {
		const wrongElement = xmlDoc.createElement('wrong');
		question.wrong.answer.forEach(answer => {
			const answerElement = xmlDoc.createElement('answer');
			answerElement.textContent = answer;
			wrongElement.appendChild(answerElement);
		});
		questionElement.appendChild(wrongElement);
	}

	return questionElement;
}

function serializeTheme(xmlDoc: Document, theme: Theme): Element {
	const themeElement = xmlDoc.createElement('theme');
	themeElement.setAttribute('name', theme.name);

	// Add info
	if (theme.info) {
		const infoElement = serializeInfo(xmlDoc, theme.info);

		if (infoElement) {
			themeElement.appendChild(infoElement);
		}
	}

	// Add questions
	const questionsElement = xmlDoc.createElement('questions');
	theme.questions.forEach(question => {
		const questionElement = serializeQuestion(xmlDoc, question);
		questionsElement.appendChild(questionElement);
	});
	themeElement.appendChild(questionsElement);

	return themeElement;
}

function serializeRound(xmlDoc: Document, round: Round): Element {
	const roundElement = xmlDoc.createElement('round');
	roundElement.setAttribute('name', round.name);

	if (round.type) {
		roundElement.setAttribute('type', round.type);
	}

	// Add info
	if (round.info) {
		const infoElement = serializeInfo(xmlDoc, round.info);

		if (infoElement) {
			roundElement.appendChild(infoElement);
		}
	}

	// Add themes
	const themesElement = xmlDoc.createElement('themes');
	round.themes.forEach(theme => {
		const themeElement = serializeTheme(xmlDoc, theme);
		themesElement.appendChild(themeElement);
	});
	roundElement.appendChild(themesElement);

	return roundElement;
}

/**
 * Serializes a Package object to XML string
 */
export function serializePackageToXML(pack: Package): string {
	const xmlDoc = document.implementation.createDocument(null, 'package');
	const packageElement = xmlDoc.documentElement;

	// Set package attributes
	packageElement.setAttribute('name', pack.name);
	packageElement.setAttribute('version', pack.version || '5');
	packageElement.setAttribute('id', pack.id);

	if (pack.restriction) {
		packageElement.setAttribute('restriction', pack.restriction);
	}

	packageElement.setAttribute('date', pack.date);

	if (pack.publisher) {
		packageElement.setAttribute('publisher', pack.publisher || '');
	}

	if (pack.contactUri) {
		packageElement.setAttribute('contactUri', pack.contactUri);
	}

	packageElement.setAttribute('difficulty', pack.difficulty?.toString() || '5');

	if (pack.logo) {
		packageElement.setAttribute('logo', pack.logo);
	}

	if (pack.language) {
		packageElement.setAttribute('language', pack.language);
	}

	// Set xmlns attribute
	packageElement.setAttribute('xmlns', 'https://github.com/VladimirKhil/SI/blob/master/assets/siq_5.xsd');

	// Add tags
	if (pack.tags && pack.tags.length > 0) {
		const tagsElement = xmlDoc.createElement('tags');
		pack.tags.forEach(tag => {
			const tagElement = xmlDoc.createElement('tag');
			tagElement.textContent = tag.value;
			tagsElement.appendChild(tagElement);
		});
		packageElement.appendChild(tagsElement);
	}

	// Add info
	if (pack.info) {
		const infoElement = serializeInfo(xmlDoc, pack.info);

		if (infoElement) {
			packageElement.appendChild(infoElement);
		}
	}

	// Add rounds
	const roundsElement = xmlDoc.createElement('rounds');
	pack.rounds.forEach(round => {
		const roundElement = serializeRound(xmlDoc, round);
		roundsElement.appendChild(roundElement);
	});
	packageElement.appendChild(roundsElement);

	// Convert to string
	const serializer = new XMLSerializer();
	let xmlString = serializer.serializeToString(xmlDoc);

	// Add XML declaration
	xmlString = '<?xml version="1.0" encoding="utf-8"?>\n' + xmlString;

	return xmlString;
}
