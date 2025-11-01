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
	isQualityMarked: boolean;
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
	placement: string;
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

export const RoundTypes = {
	Standard: 'standart',
	Final: 'final',
};

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



