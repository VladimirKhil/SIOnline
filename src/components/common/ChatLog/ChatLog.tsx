import * as React from 'react';
import ChatMessage from '../../../model/ChatMessage';
import MessageLevel from '../../../model/enums/MessageLevel';
import hasUserMentioned from '../../../utils/MentionHelpers';

import './ChatLog.css';

interface ChatLogProps {
	messages: ChatMessage[];
	className: string;
	user: string;
	message: string;
	onNicknameClick: (nickname: string) => void;
	scrollPosition?: number;
	onScrollPositionChanged?: (position: number) => void;
}

const userMessageSpanClass = (message: ChatMessage, user: string): string => hasUserMentioned(message.text, user)
	? `${MessageLevel[message.level].toLowerCase()} mentioned`
	: `${MessageLevel[message.level].toLowerCase()}`;

export default class ChatLog extends React.Component<ChatLogProps> {
	private readonly myRef: React.RefObject<HTMLDivElement>;

	private isUserScrolled = false;

	constructor(props: ChatLogProps) {
		super(props);

		this.myRef = React.createRef<HTMLDivElement>();
	}

	componentDidMount(): void {
		// Restore scroll position on mount
		if (this.myRef.current && this.props.scrollPosition) {
			this.myRef.current.scrollTop = this.props.scrollPosition;
		}
	}

	componentDidUpdate(prevProps: ChatLogProps): void {
		if (this.myRef.current) {
			// If new messages were added and user hasn't manually scrolled, auto-scroll to bottom
			if (this.props.messages.length > prevProps.messages.length && !this.isUserScrolled) {
				this.myRef.current.scrollTop = this.myRef.current.scrollHeight;
			} else if (this.props.scrollPosition !== undefined && this.props.scrollPosition !== prevProps.scrollPosition) {
				// If this is a component recreation, restore the scroll position
				this.myRef.current.scrollTop = this.props.scrollPosition;
			}
		}
	}

	private onScroll = (): void => {
		if (this.myRef.current && this.props.onScrollPositionChanged) {
			const { scrollTop, scrollHeight, clientHeight } = this.myRef.current;

			// Check if user manually scrolled up from the bottom
			this.isUserScrolled = scrollTop < scrollHeight - clientHeight - 10; // 10px tolerance

			// Save scroll position
			this.props.onScrollPositionChanged(scrollTop);
		}
	};

	render(): JSX.Element {
		return (
			<div
				ref={this.myRef}
				className={`chatLog ${this.props.className}`}
				onScroll={this.onScroll}
			>
				{this.props.messages.map((message, index) => message.sender
					? <div
							key={index} className={`chatItem ${userMessageSpanClass(message, this.props.user)}`}
						>
						<div
							className='nickname'
							onClick={() => this.props.onNicknameClick(message.sender)}>
							{message.sender}
						</div>

						<div className='chatBody'>
							{message.text.split(' ').map((word, wordIndex) => word === `@${this.props.user}`
								? <strong key={wordIndex} className={'mentionedNickname'}>{`${word} `}</strong>
								: <span key={wordIndex}>{word} </span>)}
						</div>
					</div>
					: <span key={index} className={MessageLevel[message.level].toLowerCase()}>{message.text}</span>)}
			</div>
		);
	}
}
