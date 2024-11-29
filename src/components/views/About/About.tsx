import * as React from 'react';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import Link from '../../common/Link/Link';
import State from '../../../state/State';
import { connect } from 'react-redux';

import './About.css';

interface AboutProps {
	clearUrls?: boolean;
}

const mapStateToProps = (state: State) => ({
	clearUrls: state.common.clearUrls,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function About(props: AboutProps): JSX.Element {
	return (
		<Dialog className="helpDialog" title={localization.aboutTitle} onClose={() => window.history.back()}>
			<div className="helpText">
				<section>
					{localization.about.map(text => (<p key={text}>{text}</p>))}
				</section>

				{props.clearUrls ? null
				: <section>
					<header><h1 className="subHeader">{localization.aboutSupport}</h1></header>
					<p><a href="https://vk.com/topic-135725718_34967839">{localization.supportInfo}</a></p>
				</section>}

				<section>
					<header><h1 className="subHeader">{localization.aboutAuthor}</h1></header>
					<p>{localization.gameAuthor}: <Link href="https://vladimirkhil.com">{localization.authorInfo}</Link>.</p>
					<p>{localization.composer}: <Link href="https://soundcloud.com/vladislav-hoshenko">Vlad Hoshenko</Link>.</p>
					<p><Link href="https://github.com/VladimirKhil/SIOnline">{localization.sourcesInfo}</Link></p>
				</section>

				{props.clearUrls ? null
				: <section>
					<header><h1 className='subHeader'>{localization.donate}</h1></header>
					<p>{localization.donateComment}</p>
					<p><a href='https://www.patreon.com/vladimirkhil'>Patreon</a></p>
					<p><a href='https://boosty.to/vladimirkhil'>Boosty</a></p>
				</section>}

				<section>
					<header><h1 className='subHeader'>{localization.license}</h1></header>
					<p>{localization.licenseInfo}</p>
					<p>{localization.noWarranty}</p>
					<p>{localization.usedComponents}</p>

					<ul className="components">
						<li><Link href="https://github.com/facebook/react/blob/master/LICENSE">React, React DOM (MIT)</Link></li>
						<li><Link href="https://github.com/reduxjs/redux/blob/master/LICENSE.md">Redux (MIT)</Link></li>
						<li><Link href="https://github.com/reduxjs/react-redux/blob/master/LICENSE.md">React-Redux (MIT)</Link></li>
						<li><Link href="https://github.com/reduxjs/redux-thunk/blob/master/LICENSE.md">Redux-Thunk (MIT)</Link></li>
						<li><Link href="https://github.com/stefanpenner/es6-promise/blob/master/LICENSE">ES6 Promise (MIT)</Link></li>
						<li><Link href="https://github.com/srijs/rusha/blob/master/LICENSE">Rusha (MIT)</Link></li>

						<li>
							<Link href="https://github.com/dotnet/aspnetcore/blob/master/LICENSE.txt">
								Microsoft SignalR, Microsoft SignalR MessagePack (Apache 2.0)
							</Link>
						</li>

						<li><Link href="https://github.com/richtr/NoSleep.js/blob/master/LICENSE">NoSleep.JS (MIT)</Link></li>
						<li><Link href="https://www.flaticon.com/free-icons/girl" title="girl icons">Girl icons created by Famo - Flaticon</Link></li>
						<li><Link href="https://www.flaticon.com/free-icons/man" title="man icons">Man icons created by Famo - Flaticon</Link></li>
					</ul>
				</section>
			</div>
		</Dialog>
	);
}

export default connect(mapStateToProps)(About);
