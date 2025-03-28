import React from 'react';
import { useAppDispatch } from '../../../state/hooks';
import localization from '../../../model/resources/localization';
import { connect } from 'react-redux';
import onlineActionCreators from '../../../state/online/onlineActionCreators';
import { AppDispatch } from '../../../state/store';

import './RandomGameButton.scss'; 

interface RandomGameButtonProps {
	anyonePlay: (appDispatch: AppDispatch) => void;
}

const mapDispatchToProps = (dispatch: any) => ({
	anyonePlay: (appDispatch: AppDispatch) => {
		dispatch(onlineActionCreators.createNewAutoGame(appDispatch));
	},
});

const RandomGameButton: React.FC<RandomGameButtonProps> = (props: RandomGameButtonProps) => {
	const appDispatch = useAppDispatch();

	return <button
		className='standard randomGameButton'
		type="button"
		title={localization.anyonePlay}
		onClick={() => props.anyonePlay(appDispatch)}
	>
		<svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" clipRule="evenodd" d="M6.9694 3.33515C3.69666 5.03672 1.03808 6.44753 1.06145 6.47027C1.08481 6.493 3.77248 7.8957 7.03415 9.58738C12.512 12.4286 12.9757 12.6589 13.1135 12.6066C13.3022 12.535 24.8811 6.52654 24.9386 6.47043C24.9818 6.42813 13.1586 0.265651 13.0043 0.250012C12.9578 0.245283 10.2421 1.63363 6.9694 3.33515ZM13.0047 3.06993C14.204 3.49477 14.5729 4.1355 14.3099 5.3373C14.2679 5.52944 14.2326 5.81277 14.2316 5.96691C14.2292 6.32263 14.3696 6.49348 14.9727 6.86899C15.2101 7.01678 15.4045 7.1498 15.4046 7.16458C15.4049 7.19693 14.395 7.84411 14.2673 7.89334C14.2106 7.91527 14.0158 7.83266 13.7373 7.66858C12.7353 7.07805 12.5796 6.74602 12.7759 5.61849C12.8472 5.20891 12.8673 4.95019 12.8379 4.81922C12.7435 4.39846 12.1712 4.04746 11.5795 4.04746C11.0736 4.04746 10.4288 4.32139 10.0147 4.71216C9.77121 4.94202 9.68513 5.1262 9.68513 5.41754C9.68513 5.63622 9.71277 5.69411 9.92754 5.92488L10.17 6.18537L9.64781 6.56749C9.3606 6.77768 9.08525 6.9496 9.0359 6.9496C8.89004 6.9496 8.41864 6.54051 8.26926 6.28432C8.1026 5.99851 8.04769 5.6072 8.13073 5.2977C8.38635 4.3452 9.93182 3.22917 11.3451 2.97647C11.7895 2.89703 12.6539 2.94567 13.0047 3.06993ZM0.502199 13.9457L0.515779 20.7268L6.53066 24.2381L12.5455 27.7495L12.5591 20.5905C12.5666 16.653 12.5542 13.4128 12.5315 13.3901C12.4766 13.3349 0.580579 7.16474 0.528931 7.16463C0.506797 7.16463 0.494767 10.2161 0.502199 13.9457ZM19.4693 10.2585C16.1906 11.9596 13.4898 13.3694 13.4676 13.3914C13.4455 13.4134 13.4334 16.6531 13.4409 20.5907L13.4545 27.75L18.2129 24.9725C20.83 23.4449 23.5367 21.8656 24.2278 21.4628L25.4842 20.7306L25.4978 13.9476C25.5052 10.2169 25.4932 7.16479 25.4711 7.16511C25.4489 7.16538 22.7481 8.55739 19.4693 10.2585ZM16.9225 7.88361C17.1339 7.97239 17.3307 8.20844 17.3307 8.37311C17.3307 8.55578 17.1139 8.83573 16.8763 8.95987C16.7293 9.03673 16.537 9.07693 16.2614 9.08854C15.7836 9.10869 15.5434 9.00593 15.3831 8.71287C15.2811 8.52617 15.2811 8.52256 15.3884 8.31485C15.546 8.00948 15.9475 7.8095 16.4029 7.8095C16.5916 7.8095 16.8254 7.84282 16.9225 7.88361ZM6.33556 12.2888C7.80143 12.8191 8.93421 13.8961 9.36856 15.1723C9.45801 15.4351 9.48875 15.6548 9.49271 16.0591C9.49757 16.5543 9.48538 16.6218 9.33761 16.919C9.14443 17.3073 8.82738 17.5655 8.31058 17.7554C7.74962 17.9614 7.32051 18.1955 7.20144 18.3603C7.10734 18.4907 7.08959 18.6092 7.07446 19.2068C7.06211 19.6933 7.03805 19.9011 6.99426 19.8995C6.95983 19.8984 6.64294 19.7472 6.29007 19.5637L5.64848 19.23L5.64885 18.4507C5.64917 17.7504 5.6612 17.6488 5.76733 17.4487C5.93553 17.1316 6.26857 16.8676 6.73853 16.6787C7.75839 16.2689 7.92649 16.1218 7.96354 15.6068C8.00834 14.9847 7.70829 14.4036 7.11616 13.9654C6.52804 13.5302 5.81845 13.3515 5.46135 13.5485C5.2461 13.6674 5.05993 13.9644 5.01202 14.2655C4.99379 14.38 4.95829 14.4737 4.93316 14.4737C4.90803 14.4737 4.60151 14.3552 4.25212 14.2104L3.61678 13.947L3.62315 13.5401C3.63368 12.8622 3.96501 12.346 4.52372 12.1371C4.68016 12.0785 4.88665 12.0621 5.27422 12.0773C5.71879 12.0948 5.89763 12.1304 6.33556 12.2888ZM21.6759 12.2083C21.9604 12.3491 22.203 12.6572 22.2968 12.9968C22.3952 13.3531 22.37 14.042 22.2435 14.4546C22.0392 15.1209 21.8178 15.4753 20.9201 16.5721C20.5946 16.9698 20.2504 17.4492 20.155 17.6373C19.9928 17.9575 19.9803 18.0222 19.9596 18.6479L19.9374 19.3163L19.3032 19.6359C18.9544 19.8117 18.6446 19.9555 18.6147 19.9555C18.5425 19.9555 18.5453 18.6091 18.6182 18.2895C18.7508 17.708 19.0998 17.1485 20.1096 15.8979C20.6455 15.2343 20.8219 14.8874 20.8501 14.4414C20.8971 13.7002 20.5611 13.3814 19.8705 13.5118C19.1878 13.6408 18.4746 14.17 18.1881 14.76C18.0996 14.9425 17.9968 15.2481 17.9596 15.4391L17.8921 15.7865L17.304 16.0396C16.6139 16.3367 16.5287 16.3511 16.5287 16.1713C16.5287 15.9425 16.6762 15.2624 16.7943 14.9462C17.2501 13.7267 18.7209 12.4993 20.1644 12.1338C20.6241 12.0174 21.3637 12.0539 21.6759 12.2083ZM6.48083 20.6568C6.71907 20.778 7.03703 21.127 7.14429 21.3851C7.23994 21.6151 7.25041 21.9919 7.16637 22.1774C7.1337 22.2494 7.04837 22.3352 6.97672 22.368C6.37978 22.6414 5.51957 21.907 5.51599 21.1209C5.51455 20.7987 5.58282 20.6663 5.79973 20.5706C5.99066 20.4864 6.1972 20.5125 6.48083 20.6568ZM19.8694 20.6001C20.0567 20.6716 20.1853 20.9848 20.1413 21.2616C20.0477 21.8499 19.4568 22.4277 18.9487 22.4277C18.6772 22.4277 18.5224 22.3088 18.4522 22.0464C18.3291 21.587 18.6973 20.9176 19.2147 20.6601C19.4647 20.5358 19.6554 20.5182 19.8694 20.6001Z" fill="white"/>
		</svg>
	</button>;
};

export default connect(null, mapDispatchToProps)(RandomGameButton);