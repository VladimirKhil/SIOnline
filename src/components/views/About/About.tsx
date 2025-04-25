import * as React from 'react';
import localization from '../../../model/resources/localization';
import Dialog from '../../common/Dialog/Dialog';
import Link from '../../common/Link/Link';
import { useAppSelector } from '../../../state/hooks';

import './About.css';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function About(): JSX.Element {
	const common = useAppSelector(state => state.common);
	const { clearUrls } = common;

	return (
		<Dialog className="helpDialog animated" title={localization.aboutTitle} onClose={() => window.history.back()}>
			<div className="helpText">
				<section>
					{localization.about.map(text => (<p key={text}>{text}</p>))}
				</section>

				{clearUrls ? null
				: <section>
					<header><h1 className="subHeader">{localization.aboutSupport}</h1></header>
					<p><Link href="https://vk.com/topic-135725718_34967839">{localization.supportInfo}</Link></p>
				</section>}

				<section>
					<header><h1 className="subHeader">{localization.aboutAuthor}</h1></header>
					<p>{localization.gameAuthor}: <Link href="https://vladimirkhil.com">{localization.authorInfo}</Link>.</p>
					<p>{localization.composer}: <Link href="https://soundcloud.com/vladislav-hoshenko">Vlad Hoshenko</Link>.</p>
					<p><Link href="https://github.com/VladimirKhil/SIOnline">{localization.sourcesInfo}</Link></p>
				</section>

				{clearUrls ? null
				: <section>
					<header><h1 className='subHeader'>{localization.donate}</h1></header>
					<p>{localization.donateComment}</p>
					<p><Link href='https://www.patreon.com/vladimirkhil'>Patreon</Link></p>
					<p><Link href='https://boosty.to/vladimirkhil'>Boosty</Link></p>
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
