import React from 'react';

interface CollectionEditorProps<T> {
	label: string;
	items: T[];
	isEditMode: boolean;
	className: string;
	getValue: (item: T) => string;
	onItemChange: (index: number, value: string) => void;
	onAddItem: () => void;
	onRemoveItem: (index: number) => void;
	placeholder?: string;
	inputType?: 'input' | 'textarea';
}

function CollectionEditor<T>({
	label,
	items,
	isEditMode,
	className,
	getValue,
	onItemChange,
	onAddItem,
	onRemoveItem,
	placeholder = '',
	inputType = 'input'
}: CollectionEditorProps<T>): React.ReactElement | null {
	if (items.length === 0 && !isEditMode) {
		return null;
	}

	return (
		<>
			<label className='header'>{label}</label>

			{items.map((item, index) => (
				<div key={index} className={`${className}-container`}>
					{inputType === 'textarea' ? (
						<textarea
							aria-label={label}
							className={className}
							value={getValue(item)}
							readOnly={!isEditMode}
							placeholder={placeholder}
							onChange={(e) => isEditMode && onItemChange(index, e.target.value)}
						/>
					) : (
						<input
							aria-label={label}
							className={className}
							value={getValue(item)}
							readOnly={!isEditMode}
							placeholder={placeholder}
							onChange={(e) => isEditMode && onItemChange(index, e.target.value)}
						/>
					)}
					{isEditMode && (
						<button
							type='button'
							className={`${className}-remove`}
							onClick={() => onRemoveItem(index)}
							aria-label={`Remove ${label}`}
						>
							×
						</button>
					)}
				</div>
			))}

			{isEditMode && (
				<button
					type='button'
					className={`${className}-add`}
					onClick={onAddItem}
					aria-label={`Add ${label}`}
				>
					+
				</button>
			)}
		</>
	);
}

export default CollectionEditor;