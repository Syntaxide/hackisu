$(function() {
	var canvas = $("#overlay")[0];
	var display = $("#display");
	var display2= $("#display2");
	var display3 = $("#display3");
	var display4 = $("#display4");
	canvas.width = $(window).width();
	canvas.height = $(window).height();
	var context = canvas.getContext("2d");
	var yScaler = 4;
	var xScaler = 7.5;
	var rThreshold = .010;
	var rMax = 1500;
	var rVal = rThreshold * rMax;
	context.translate(canvas.width/2,canvas.height/2);
	var discRadius = 700;
	var fps =60;
	var timeout = 1000/fps;
	var left = new turnTable("cover1",-58,0,true, 0);
	var right = new turnTable("cover2",58,0,false,0);
		
	var controller = new Leap.Controller();
	controller.on('connect', function(){
		setInterval(function(){
			var frame = controller.frame();
			onFrame(frame);
	}, timeout)});
	controller.connect();
	
	function onFrame(frame) {
		//console.log(frame);
		if(frame && frame.valid) {
			clearCanvas();
			//left.handleFrame(frame);
			//right.handleFrame(frame);
			var entities = frame.hands;
			var leftStop = false;
			var rightStop= false;
			//var width = left.turntable.width()/2;
			for (var index in entities) {
				context.fillStyle="#FF0000";
				var entity = entities[index];
				var position = entity.palmPosition;
				var radius = Math.max(rMax/Math.abs(position[1]), 15);
				var x = xScaler*position[0]-radius/2;
				var y = yScaler*position[2]-radius/2;
				var xAbs = x+canvas.width/2;
				var yAbs = y+canvas.height/2;
				var obj =$(document.elementFromPoint(xAbs,yAbs));
				var isLeft = position[0]<0?true:false;
				var isCover = obj.hasClass("cover") || obj.hasClass("cover_overlay");
				
				if(isLeft) {
					display.text("x:"+position[0]+", y:"+position[2]);
				}
					//display2.text("x2:"+(x+canvas.width/2)+", y2:"+(y+canvas.height/2));
				else{
					display3.text("x:"+position[0]+", y:"+position[2]);
					//display4.text("x2:"+(x+canvas.width/2)+", y2:"+(y+canvas.height/2));
				}
				if(radius>rVal) {
					context.fillStyle="#00FF00";	
					
					//var isDisc = obj.hasClass("disc") || obj.hasClass("disc_overlay");					
					if(isLeft) {
						if(isCover) {
							if(!left.getCoverStatus() && !left.getDragStatus()){
								left.setCoverDown(true);
							}
						}
						else {
							left.handleFrame(entity,frame);
							leftStop=true;
						}
					}
					else {
						if(isCover) {
							if(!right.getCoverStatus() && !right.getDragStatus()){
								right.setCoverDown(true);
							}
						}
						else {
							right.handleFrame(entity,frame);
							rightStop=true;
						}
					}
				}
				else if (isCover) {
					if(left.getCoverStatus()) {
						left.setCoverDown(false);
						console.log("left menu");
					}
					else if(right.getCoverStatus()){
						right.setCoverDown(false);
						console.log("right menu");
					}
				}
				
				context.beginPath();
				context.arc(x,y,radius,0,2*Math.PI);
				context.fill();
			}
			if(!leftStop) {
				left.rotateDisc();
			}
			if(!rightStop) {
				right.rotateDisc();
			}
		}
	}
	
	function turnTable(id, xOrigin, yOrigin, isLeft, xOffset, menuID) {
		var self = this;
		self.turnTable = $("#"+id);
		self.menu = $("#menuID");
		self.rotation = 0;
		self.xOrigin = xOrigin;
		self.yOrigin = yOrigin;
		self.xOffset = xOffset;
		self.origin = [xOrigin, 0, yOrigin];
		self.origTransform = self.turnTable.css("transform");
		self.oldID = null;
		self.oldPos = null;
		self.isLeft=isLeft;
		self.step = 360/60/3;
		self.stop = false;
		self.coverDown = false;
		self.isDrag=false;
		self.setDrag = function(isDrag) {
			self.isDrag = isDrag;
		}
		self.getDragStatus = function() {
			return self.isDrag;
		}
		self.setCoverDown = function(isDown) {
			self.coverDown = isDown;
		}
		self.getCoverStatus = function() {
			return self.coverDown;
		}
		
		//self.cover  = self.turnTable.find(".cover");
		self.setCover = function(newCover) {};
		
		self.handleFrame = function(entity, frame) {	
			var pressed =false;
			var position = entity.palmPosition;
			if(self.oldID && entity.id == self.oldID) {
				var oldAngle  = getAngle(self.oldPos, self.origin);
				var newAngle  = getAngle(position, self.origin);
				//display2.text("old:"+oldAngle +", new:"+newAngle + "diff:"+newAngle-oldAngle);		
				//display2.text(newAngle-oldAngle);												
				self.oldPos = position;
				
				//display2.text((angle*180)/Math.PI);
				//console.log(oldPos);
				//console.log(position);
				//stop=true;
				if(self.rotation>=360) {
					rotation = 0;
				}
				if(self.rotation<0) {
					rotation = 360;
				}
				self.rotation+=(oldAngle-newAngle)*2;
				self.turnTable.css("transform", "rotateZ("+self.rotation+"deg)");
				self.isDrag=true;
			}
			else if(!frame.hand(self.oldID).valid){
				self.oldID = entity.id;
				self.oldPos = position;
				self.isDrag=false;
			}
		}
		
		self.rotateDisc = function() {
			self.isDrag=false;
			self.oldID = null;
			self.oldPos = null;
			if(self.rotation>=360) {
				self.rotation = 0;
			}
			self.turnTable.css("transform", "rotateZ("+self.rotation+"deg)");
			self.rotation+=self.step;
		};
		
		self.showMenu =function() {
		};
		
		self.hideMenu = function() {
		};
		
		return {handleFrame:self.handleFrame, rotateDisc:self.rotateDisc, origin:self.origin, turntable: self.turnTable, 
				setCoverDown:self.setCoverDown,getCoverStatus:self.getCoverStatus, setDrag:self.setDrag, getDragStatus:self.getDragStatus,
				showMenu:self.showMenu,hideMenu:self.hideMenu};
	}
	
	function isInBox(x, y, box) {
		var offset = box.offset();
		var width = box.width();
		var height = box.height();
		if(x>=offset.left && x<=offset.left+width && y>=offset.top && y<=offset.top+height) {
			return true;
		}
		return false;
	}
	
	function getAngle(oldPts, newPts) {
		var theta = Math.atan2(newPts[2]-oldPts[2],oldPts[0]-newPts[0]);
		return (theta*180)/Math.PI;
	}
	
	function getMagnitude(x, y, originX, originY) {
		return Math.sqrt(Math.pow(x-originX,2) + Math.pow(y-originY,2));
	}
	
	function clearCanvas() {
		context.clearRect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height);
	}
});