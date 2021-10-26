import React, { useEffect, useState } from 'react';
import { hexToRgb } from '../utils';

import './Placeholder.css';

import useStream from '../../../contexts/Stream/useStream';

const Placeholder = ({ loading }) => {
	const [gradientBg, setGradientBg] = useState('');
	const { activeStream } = useStream();
	const { userAvatar, userColors, userName } = activeStream?.metadata || {};

	const getRgba = (rgb, alpha) => {
		const [r, g, b] = rgb;
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	};

	useEffect(() => {
		if (userColors) {
			const rgb = hexToRgb(userColors.primary);
			setGradientBg(
				`linear-gradient(0deg, ${getRgba(rgb, 1)} 50%, ${getRgba(rgb, 0.9)} 100%), 
      linear-gradient(90deg, ${getRgba(rgb, 0.9)} 0%, ${getRgba(rgb, 0.6)} 100%), 
      linear-gradient(180deg, ${getRgba(rgb, 0.6)} 0%, ${getRgba(rgb, 0.3)} 100%), 
      linear-gradient(360deg, ${getRgba(rgb, 0.3)} 0%, ${getRgba(rgb, 0)} 100%)`
			);
		}
	}, [userColors]);

	return (
		loading &&
		activeStream && (
			<div className="placeholder">
				<div className="placeholder-content">
					<div
						className="placeholder-spinner"
						style={{ background: userColors.secondary }}
					>
						<div
							className="placeholder-gradient"
							style={{ backgroundImage: gradientBg }}
						/>
					</div>
					<img
						className="placeholder-avatar"
						src={userAvatar}
						alt={`${userName} avatar`}
					/>
				</div>
			</div>
		)
	);
};

export default Placeholder;
