import { ensureDir, pathExists } from 'fs-extra';
import * as path from 'node:path';
import ProgressBar from 'progress';
import sharp from 'sharp';
import { DIR_IMAGES, IMAGE_RESOLUTION_LIST } from '../config';
import { createSourceImageFileInfo } from '../image';

// Sourced from: https://awards.unsplash.com/2022/
const PICTURE_URLS = [
	'https://images.unsplash.com/photo-1650756697432-98d1a1448cab',
	'https://images.unsplash.com/photo-1667842439048-8467075e8dc0',
	'https://images.unsplash.com/photo-1669153618409-d30d63a73dac',
	'https://images.unsplash.com/photo-1642060880454-fcc688d948f5',
	'https://images.unsplash.com/photo-1666362755385-1856fca1a330',
	'https://images.unsplash.com/photo-1655570313279-a50124d29924',
	'https://images.unsplash.com/photo-1648566777018-31e5201f9ced',
	'https://images.unsplash.com/photo-1659615147760-3ed6c42f3dbf',
	'https://images.unsplash.com/photo-1655068867332-83374a86990c',
	'https://images.unsplash.com/photo-1667308018501-75a3e41f824f',
	'https://images.unsplash.com/photo-1661541471551-5d31299e4f31',
	'https://images.unsplash.com/photo-1662577207661-b5fa1fc3d144',
	'https://images.unsplash.com/photo-1669140936835-1b2a71f91219',
	'https://images.unsplash.com/photo-1667226845024-00a1a23042bc',
	'https://images.unsplash.com/photo-1666845577438-8dc64b8fa202',
	'https://images.unsplash.com/photo-1649168389356-30a7b1ed201a',
	'https://images.unsplash.com/photo-1643129610218-1b86ecbc3fd1',
	'https://images.unsplash.com/photo-1663404783770-d50088bbabf9',
	'https://images.unsplash.com/photo-1669472386738-06ad234905ac',
	'https://images.unsplash.com/photo-1669628745118-c919752d9c5a',
	'https://images.unsplash.com/photo-1603210185246-b1662978ea37',
	'https://images.unsplash.com/photo-1668361920298-e3ebb0798819',
	'https://images.unsplash.com/photo-1669542872972-cb8d1b6d99f0',
	'https://images.unsplash.com/photo-1650556699586-cb0fae9fc6b9',
	'https://images.unsplash.com/photo-1655664333735-5bb94237842e',
	'https://images.unsplash.com/photo-1659303388062-d29a2729bce1',
	'https://images.unsplash.com/photo-1656306197349-1014d08eeab2',
	'https://images.unsplash.com/photo-1662731543182-61752d93a413',
	'https://images.unsplash.com/photo-1646684611577-a8c1fd8ad53f',
	'https://images.unsplash.com/photo-1647862889460-efe378620f77',
	'https://images.unsplash.com/photo-1656681270637-b19524efa860',
	'https://images.unsplash.com/photo-1664214073996-f9b856081c22',
	'https://images.unsplash.com/photo-1663988130825-e3bb2ad02a82',
	'https://images.unsplash.com/photo-1665706678773-728b9c9de239',
	'https://images.unsplash.com/photo-1658834117178-c2088dbbac7e',
	'https://images.unsplash.com/photo-1658275904184-f410629909c1',
	'https://images.unsplash.com/photo-1656611756205-72ec80b8c98b',
	'https://images.unsplash.com/photo-1641128208275-3bab75f6de61',
	'https://images.unsplash.com/photo-1658232190602-be6cd5b976f1',
	'https://images.unsplash.com/photo-1653059959899-70ab4e464401',
	'https://images.unsplash.com/photo-1669205011193-7fa3326f5d9c',
	'https://images.unsplash.com/photo-1667374026094-56bb3b0f6f55',
	'https://images.unsplash.com/photo-1667235300634-feaa4e34f950',
	'https://images.unsplash.com/photo-1667337395744-7d6d829438e0',
	'https://images.unsplash.com/photo-1664961903143-69acb4086fef',
	'https://images.unsplash.com/photo-1642790303498-74b2e7183eea',
	'https://images.unsplash.com/photo-1667248252765-146cc6d09f49',
	'https://images.unsplash.com/photo-1648159284509-75b6743e4e9b',
	'https://images.unsplash.com/photo-1637917972588-9925c58e5a25',
	'https://images.unsplash.com/photo-1668979028056-2d6a47a29b6d',
	'https://images.unsplash.com/photo-1642302664715-000ce3ce7958',
	'https://images.unsplash.com/photo-1639332793139-32eed37bdc99',
	'https://images.unsplash.com/photo-1643581278970-413ac3900826',
	'https://images.unsplash.com/photo-1668035188870-9bba52206be9',
	'https://images.unsplash.com/photo-1669119524451-684a8ae6014c',
	'https://images.unsplash.com/photo-1643988603854-5eb5e1a992a8',
	'https://images.unsplash.com/photo-1664913161359-6d502b997f92',
	'https://images.unsplash.com/photo-1649971132318-dbec1ea849f1',
	'https://images.unsplash.com/photo-1668603366041-e944cdd7390c',
	'https://images.unsplash.com/photo-1651303780707-a30a86b27478',
	'https://images.unsplash.com/photo-1654159454129-1c455da00346',
	'https://images.unsplash.com/photo-1662125208190-b21030e953ee',
	'https://images.unsplash.com/photo-1662554060049-936aeea1dc43',
	'https://images.unsplash.com/photo-1658228941474-e1cfbdf52dd5',
	'https://images.unsplash.com/photo-1667561420697-741941f7e4b6',
	'https://images.unsplash.com/photo-1667487147031-476e357b2fc5',
	'https://images.unsplash.com/photo-1648400613766-0b06a9c03cb7',
	'https://images.unsplash.com/photo-1650144079998-d5d3816b1e21',
	'https://images.unsplash.com/photo-1667165749399-e778cc1e79f7',
	'https://images.unsplash.com/photo-1667926964370-840afdde03e1',
	'https://images.unsplash.com/photo-1658836019286-2b2d869434b4',
	'https://images.unsplash.com/photo-1662577207603-b37e19471763',
	'https://images.unsplash.com/photo-1652834683398-e82493e73d43',
	'https://images.unsplash.com/photo-1666694890422-ffeb0eb38a08',
	'https://images.unsplash.com/photo-1657313666513-70770d329ef4',
	'https://images.unsplash.com/photo-1669824188425-322cd55e41c7',
	'https://images.unsplash.com/photo-1662522195455-956b870bad32',
	'https://images.unsplash.com/photo-1667645336865-154f91594cfb',
	'https://images.unsplash.com/photo-1668742526344-fcd0b916da99',
	'https://images.unsplash.com/photo-1637678646251-5366d5586014',
	'https://images.unsplash.com/photo-1668595473727-7c00beaf98bb',
	'https://images.unsplash.com/photo-1667354200380-b06f60f5c920',
	'https://images.unsplash.com/photo-1666091863721-54331a5db52d',
	'https://images.unsplash.com/photo-1654945127986-eead644df12f',
	'https://images.unsplash.com/photo-1663856542282-bf5647286f63',
	'https://images.unsplash.com/photo-1662719012928-4017f17d5b3c',
	'https://images.unsplash.com/photo-1645130323028-e4d403c2d71e',
	'https://images.unsplash.com/photo-1668194645738-ef8dbb426086',
	'https://images.unsplash.com/photo-1663682482501-aee441158064',
	'https://images.unsplash.com/photo-1668437688106-a90d166e9b38',
	'https://images.unsplash.com/photo-1658458053585-e4f431bf4398',
	'https://images.unsplash.com/photo-1668707147566-e3352182991b',
	'https://images.unsplash.com/photo-1669719467752-71ee6d76332b',
	'https://images.unsplash.com/photo-1666055642230-1595470b98fd',
	'https://images.unsplash.com/photo-1660330120426-0f83806543cf',
	'https://images.unsplash.com/photo-1638829300060-14fe80da865f',
	'https://images.unsplash.com/photo-1668503714926-2b80a246de00',
	'https://images.unsplash.com/photo-1668420899266-27476b9e8d35',
	'https://images.unsplash.com/photo-1669666914284-921cffa9eef5',
	'https://images.unsplash.com/photo-1669053938181-fdbed6339056',
	'https://images.unsplash.com/photo-1668127904249-27bbcec80b3d',
	'https://images.unsplash.com/photo-1669648319513-16d4ea9c1253',
	'https://images.unsplash.com/photo-1642034410877-22875908ddda',
	'https://images.unsplash.com/photo-1666712605273-e44e6def694d',
	'https://images.unsplash.com/photo-1669389969250-92642d4c8798',
	'https://images.unsplash.com/photo-1666558614730-9077dcfe1108',
	'https://images.unsplash.com/photo-1665846589489-5856db428a85',
	'https://images.unsplash.com/photo-1667132712564-35726e32178d',
	'https://images.unsplash.com/photo-1666840507896-c6c3a91a4f40',
	'https://images.unsplash.com/photo-1660050186491-cbd9d8e02d2d',
	'https://images.unsplash.com/photo-1666091863721-54331a5db52d',
	'https://images.unsplash.com/photo-1647862889460-efe378620f77',
	'https://images.unsplash.com/photo-1659386689728-43212a226de0',
	'https://images.unsplash.com/photo-1653299373605-f3c6a11d0da1',
	'https://images.unsplash.com/photo-1662453673649-607fbdc2578c',
	'https://images.unsplash.com/photo-1654962900838-bd872b71dfa3',
	'https://images.unsplash.com/photo-1662304996989-a81a2c7c798d',
	'https://images.unsplash.com/photo-1654427091273-650a43d94423',
];

const IMAGE_URL_PARAMETERS = new URLSearchParams([
	['auto', 'format'],
	['fit', 'crop'],
	['ixid', 'MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8'],
	['q', '100'],
	['w', IMAGE_RESOLUTION_LIST.reduce((m, [w]) => Math.max(m, w), 0).toString()],
]);

await ensureDir(DIR_IMAGES);

const bar = new ProgressBar(':bar :percent :etas', {
	total: PICTURE_URLS.length,
});

for (const [index, pictureUrl] of PICTURE_URLS.entries()) {
	const pictureUrlWithParams = new URL(
		`?${IMAGE_URL_PARAMETERS.toString()}`,
		pictureUrl
	);
	const response = await fetch(pictureUrlWithParams);

	if (!response.ok) {
		bar.interrupt(`Unable to fetch ${pictureUrl}`);
		continue;
	}

	const body = await response.arrayBuffer();
	const image = sharp(body).png({
		quality: 100,
	});

	for (const resolution of IMAGE_RESOLUTION_LIST) {
		const imageSourceFile = createSourceImageFileInfo({
			fileSize: 0,
			format: 'png',
			name: index.toString(),
			resolution,
		});

		const imageSourceFilePath = path.resolve(
			DIR_IMAGES,
			imageSourceFile.fileName
		);

		if (await pathExists(imageSourceFilePath)) {
			continue;
		}

		await image
			.resize({
				height: imageSourceFile.resolution[1],
				width: imageSourceFile.resolution[0],
			})
			.toFile(imageSourceFilePath);
	}

	bar.tick();
}
