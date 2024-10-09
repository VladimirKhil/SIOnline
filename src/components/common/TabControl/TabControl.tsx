import * as React from 'react';

import './TabControl.scss';

interface TabItemProps {
	id: number;
	label: string;
	title?: string;
}

export default function TabControl(props: { tabs: TabItemProps[], activeTab: number, onTabClick: (tab: number) => void }): JSX.Element {
	return (
		<div className="tabControl">
			{props.tabs.map((tab, index) => (
				<div
					key={index}
					className={`tab ${tab.id === props.activeTab ? 'active' : ''}`}
					title={tab.title}
					onClick={() => props.onTabClick(tab.id)}
				>
					{tab.label}
				</div>
			))}
		</div>
	);
}