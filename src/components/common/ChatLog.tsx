import * as React from 'react';
import ChatMessage from '../../model/ChatMessage';
import MessageLevel from '../../model/enums/MessageLevel';
import hasUserMentioned from '../../utils/MentionHelpers';

import './ChatLog.css';

interface ChatLogProps {
	messages: ChatMessage[];
	className: string;
	user: string;
	message: string;
	onNicknameClick: (nickname: string) => void;
}

const userMessageSpanClass = (message: ChatMessage, user: string): string => hasUserMentioned(message.text, user)
	? `${MessageLevel[message.level].toLowerCase()} mentioned`
	: `${MessageLevel[message.level].toLowerCase()}`;

export default class ChatLog extends React.Component<ChatLogProps> {
	private readonly myRef: React.RefObject<HTMLDivElement>;

	constructor(props: ChatLogProps) {
		super(props);

		this.myRef = React.createRef<HTMLDivElement>();
	}

	componentDidUpdate(): void {
		if (this.myRef.current) {
			this.myRef.current.scrollTop = this.myRef.current.scrollHeight;
		}
	}

	render(): JSX.Element {
		return (
			<div ref={this.myRef} className={`chatLog ${this.props.className}`}>
				{this.props.messages.map((message, index) => message.sender
					? <span
							key={index} className={userMessageSpanClass(message, this.props.user)}
						>
						<b
							className={'nickname'}
							onClick={() => this.props.onNicknameClick(message.sender)}>
							{`${message.sender}: `}
						</b>
						{message.text.split(' ').map(
							(word) => word === `@${this.props.user}` ? <strong className={'mentionedNickname'}>{`${word} `}</strong> : `${word} `
						)}
						</span>
					: <span key={index} className={MessageLevel[message.level].toLowerCase()}>{message.text}</span>)}
			</div>
		);
	}
}
