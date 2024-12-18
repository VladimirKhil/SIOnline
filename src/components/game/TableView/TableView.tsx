import * as React from 'react';
import PersonInfo from '../../../model/PersonInfo';

import './TableView.css';

interface TableViewProps {
	person: PersonInfo;
	isSelected: boolean;

	selectTable: () => void;
}

export default function TableView(props: TableViewProps): JSX.Element {
	return (
		<li
			className={`tableItem ${props.isSelected ? 'active ' : ''}`}
			onClick={() => props.selectTable()}
		>
			<span className='tableName'>
				{props.person.name}
			</span>
		</li>
	);
}
