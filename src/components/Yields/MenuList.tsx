import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

export const MenuList = (props) => {
	const { options, children, maxHeight, getValue } = props;
	const [value] = getValue();
	const selectedIndex = options.findIndex((option) => option.value === value?.value);
	const listRef = useRef(null);

	const rowVirtualizer = useVirtualizer({
		count: children.length,
		getScrollElement: () => listRef.current,
		estimateSize: () => 35,
		overscan: 5
	});

	useEffect(() => {
		if (selectedIndex > -1) {
			rowVirtualizer.scrollToIndex(selectedIndex);
		}
	}, [selectedIndex, rowVirtualizer]);

	return (
		<div
			ref={listRef}
			style={{
				height: Math.min(maxHeight, children.length * 35),
				overflow: 'auto',
				scrollbarWidth: 'none',
				msOverflowStyle: 'none',
				zIndex: 1000
			}}
		>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					width: '100%',
					position: 'relative'
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow: any) => (
					<div
						key={virtualRow.index}
						ref={virtualRow.measureRef}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: `${virtualRow.size}px`,
							transform: `translateY(${virtualRow.start}px)`
						}}
					>
						{children[virtualRow.index]}
					</div>
				))}
			</div>
		</div>
	);
};
