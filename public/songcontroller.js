function SongController() {
				var readHead = {
					loaded: false,
					playing: false,
					forward: true,
					songPosition: 0,
					lastStarted: 0};
				var soundSrc = {playbackRate: {value: 1}};
				var sndObj = {};
				var duration = 0;
				var start_immediately = false;
				var context = new AudioContext();
				var gainNode = {gain: {value: 0}};
				var gain = 1;
				var playing_in_reverse = false;
				var playbackRate = 1;
				var self = this;
				
				var buildBuffers = function(data) {					
					console.log('decoding...');
					context.decodeAudioData(data, function(buffer) {
								duration = buffer.duration;
								sndObj.forward = buffer;
								sndObj.reversed = cloneAndReverse(context, buffer);
								readHead.loaded = true;
								if(start_immediately)
									self.playSound(false);
							});
				};
				this.loadSoundFromFile = function(file) {
					console.log("loading file: " + file);
					window.AudioContext = window.AudioContext || window.webkitAudioContext;
					var fr = new FileReader();
					
					fr.onload = function(event) {
						console.log("input loaded "+fr.result);
						buildBuffers(fr.result);
					};
					fr.readAsArrayBuffer(file);
				};
				
				this.loadSoundFromUrl = function(url) {
					var x = new XMLHttpRequest();
					x.open('GET', url, true);
					x.responseType = 'arraybuffer';
					x.onreadystatechange = function() {
						if(x.readyState == 4) {
							console.log('received ajax response');
							buildBuffers(x.response);
						} else {
							console.log('odd state change from ajax : ');
						}
					};
					x.send();
				};
				
				this.playSound = function(loop) {
					if(!readHead.loaded) {
						start_immediately = true;
						return;
					}
					if(readHead.playing)
						this.stopAndUpdateHead();
					console.log("playing");
					
					soundSrc = context.createBufferSource();
					soundSrc.buffer = playing_in_reverse ? sndObj.reversed : sndObj.forward;
					
					gainNode = context.createGain();
					gainNode.gain.value = gain;
					soundSrc.playbackRate.value = playbackRate;
					soundSrc.loop = loop;
					soundSrc.connect(gainNode);
					gainNode.connect(context.destination);
					
					if(playing_in_reverse)
						soundSrc.start(0, duration-(readHead.songPosition));
					else
						soundSrc.start(0, readHead.songPosition);
					readHead.playing = true;
					readHead.forward = !playing_in_reverse;
					readHead.lastStarted = new Date().getTime();
				};
				
				this.stopAndUpdateHead = function() {
					if(!readHead.playing)
						return;
					soundSrc.stop();
					readHead.playing = false;
					
					var now = new Date().getTime();
					var delta = (now - (readHead.lastStarted))*playbackRate;
					delta /= 1000;
					if(!readHead.forward)
						delta *= -1;
					readHead.songPosition += delta;
					if(readHead.songPosition < 0)
						readHead.songPosition = 0;
					else if(readHead.songPosition > duration)
						readHead.songPosition = duration;
					console.log("position now at: " + readHead.songPosition);
				};
				
				this.setGain = function(g) {
					gain = g;
					gainNode.gain.value = g;
				};
				
				this.setSpeed = function(s) {
					if(s < 0) {
						playing_in_reverse = true;
						s = Math.abs(s);
					} else {
						playing_in_reverse = false;
					}
					playbackRate = s;
					soundSrc.playbackRate.value = s;
					this.stopAndUpdateHead();
					this.playSound(false);
				};
			}
						function cloneAndReverse(context, audiobuffer) {
				var output = context.createBuffer(
					audiobuffer.numberOfChannels,
					audiobuffer.length,
					audiobuffer.sampleRate);
				for(var i=0;i<audiobuffer.numberOfChannels;i++) {
					output.getChannelData(i).set(audiobuffer.getChannelData(i));
					Array.prototype.reverse.call(output.getChannelData(i));
				}
				return output;
			}		