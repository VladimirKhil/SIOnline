import * as React from 'react';
import localization from '../model/resources/localization';
import Dialog from './common/Dialog';

import './About.css';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function About(): JSX.Element {
	return (
		<Dialog className="helpDialog" title={localization.aboutTitle} onClose={() => window.history.back()}>
			<div className="helpText">
				<section>
					{localization.about.map(text => (<p key={text}>{text}</p>))}
				</section>

				<section>
					<header><h1 className="subHeader">{localization.aboutSupport}</h1></header>
					<p><a href="https://vk.com/topic-135725718_34967839">{localization.supportInfo}</a></p>
				</section>

				<section>
					<header><h1 className="subHeader">{localization.aboutAuthor}</h1></header>
					<p>{localization.gameAuthor}: <a href="https://vladimirkhil.com">{localization.authorInfo}</a>.</p>
					<p>{localization.designer}: {localization.designerInfo}.</p>
					<p>{localization.composer}: <a href="https://soundcloud.com/vladislav-hoshenko">Vlad Hoshenko</a>.</p>
					<p><a href="https://github.com/VladimirKhil/SIOnline">{localization.sourcesInfo}</a></p>
				</section>

				<section>
					<header><h1 className='subHeader'>{localization.donate}</h1></header>
					<p><a href='https://www.patreon.com/vladimirkhil'>Patreon</a></p>
					<p><a href='https://boosty.to/vladimirkhil'>Boosty</a></p>
				</section>

				<section>
					<header><h1 className='subHeader'>{localization.license}</h1></header>
					<p>{localization.licenseInfo}</p>
					<p>{localization.noWarranty}</p>
					<p>{localization.usedComponents}</p>

					<ul className="components">
						<li><a href="https://github.com/facebook/react/blob/master/LICENSE">React, React DOM (MIT)</a></li>
						<li><a href="https://github.com/reduxjs/redux/blob/master/LICENSE.md">Redux (MIT)</a></li>
						<li><a href="https://github.com/reduxjs/react-redux/blob/master/LICENSE.md">React-Redux (MIT)</a></li>
						<li><a href="https://github.com/reduxjs/redux-thunk/blob/master/LICENSE.md">Redux-Thunk (MIT)</a></li>
						<li><a href="https://github.com/ReactTraining/react-router/blob/master/LICENSE">React Router DOM (MIT)</a></li>
						<li><a href="https://github.com/stefanpenner/es6-promise/blob/master/LICENSE">ES6 Promise (MIT)</a></li>
						<li><a href="https://github.com/srijs/rusha/blob/master/LICENSE">Rusha (MIT)</a></li>

						<li>
							<a href="https://github.com/dotnet/aspnetcore/blob/master/LICENSE.txt">
								Microsoft SignalR, Microsoft SignalR MessagePack (Apache 2.0)
							</a>
						</li>

						<li><a href="https://github.com/richtr/NoSleep.js/blob/master/LICENSE">NoSleep.JS (MIT)</a></li>
					</ul>
				</section>
			</div>
		</Dialog>
	);
}
