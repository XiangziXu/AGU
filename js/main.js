/* ============================================
   AGU 个人网站 - 公共脚本
   ============================================ */

(function () {
	'use strict';

	/** 页脚点击彩蛋：播放/暂停音乐 */
	function toggleMusic() {
		var audio = document.getElementById('music');
		if (!audio) {
			return;
		}
		if (audio.paused) {
			audio.play();
			alert('诶你是怎么发现这个彩蛋的');
			alert('呐，那好好享受这首歌吧');
			alert('听说再点一次可以停止播放呢');
		} else {
			audio.pause();
			audio.load();
		}
	}

	var footer = document.querySelector('.footer');
	if (footer) {
		footer.addEventListener('click', toggleMusic);
	}

	/** 空格键触发彩蛋 */
	document.addEventListener('keydown', function (event) {
		if (event.keyCode === 32) {
			toggleMusic();
		}
	});
})();
