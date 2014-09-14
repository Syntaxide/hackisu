function BackEnd() {
	var root = "http://localhost:3000";
	this.GetUrlForTrack = function(id, cb) {
		var x = new XMLHttpRequest();
		x.open('GET', root + "/app/tracks/" + id, true);
		x.onreadystatechange = function() {
			if(x.readyState == 4) {
				console.log('received ajax response');
				cb(x.response);
			} else {
				console.log('odd state change from ajax : ');
			}
		};
		x.send();
	}
}