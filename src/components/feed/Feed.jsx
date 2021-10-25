import React, { useEffect, useRef, useState } from 'react';
import StreamPlayer from './stream-player';

const Feed = (props) => {
	const { IVSPlayer } = window;
	const { isPlayerSupported } = IVSPlayer;

	const { streams } = props;

	const [activeStreamId, setActiveStreamId] = useState();
	const [loading, setLoading] = useState(false);
	const [visibleVideos, setVisibleVideos] = useState([]);

	const player = useRef(null);

	useEffect(() => {
		const { ENDED, PLAYING, READY } = IVSPlayer.PlayerState;
		const { ERROR } = IVSPlayer.PlayerEventType;

		if (!isPlayerSupported) {
			console.warn('The current browser does not support the Amazon IVS player.');

			return;
		}

		const onStateChange = () => {
			const newState = player.current.getState();

			console.log(`Player State - ${newState}`);

			setLoading(newState !== PLAYING);
		};

		const onError = (err) => {
			console.warn('Player Event - ERROR:', err);
		};

		player.current = IVSPlayer.create();

		player.current.addEventListener(READY, onStateChange);
		player.current.addEventListener(PLAYING, onStateChange);
		player.current.addEventListener(ENDED, onStateChange);
		player.current.addEventListener(ERROR, onError);

		return () => {
			player.current.removeEventListener(READY, onStateChange);
			player.current.removeEventListener(PLAYING, onStateChange);
			player.current.removeEventListener(ENDED, onStateChange);
			player.current.removeEventListener(ERROR, onError);
		};
	}, [IVSPlayer, isPlayerSupported]);

	const setStream = (id, visible) => {
		const index = visibleVideos.indexOf(id);

		if (index > -1 && visible) return;

		let videos = [...visibleVideos];

		if (visible) {
			videos.push(id);
		} else {
			videos.splice(index, 1);
		}

		setLoading(true);
		setVisibleVideos(videos);
		setActiveStreamId(videos[videos.length - 1]);
	};

	if (!isPlayerSupported) {
		return null;
	}

	return (
		<>
			{streams.map((stream) => (
				<StreamPlayer
					key={stream.id}
					active={stream.id === activeStreamId}
					loading={stream.id === activeStreamId && loading}
					player={player.current}
					streamData={stream}
					setStream={setStream}
				/>
			))}
		</>
	);
};

export default Feed;
