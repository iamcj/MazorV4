// Date: 2017
// Auteur:Corjan van Uffelen
var mazorManager;
var disable=false;
var mouseLatLng;

//settings
var timeOutms = 400;
var iconTimeOutms = 20;
var cursorBallRadius = 4.5; 
var closeRadius = 70;
var panIconOffset = 57;
var zoomIconOffset = 36;
var fullPanModeRadius = 70;
var zoomFactor = 10;
var zoomLevel = 5;
var zoomChange = 2;
var maxPanDistance = 170;
var panInterval = 10;
var panStep = 0.0004;
var i=0;
var oldDirection = 400;
var oldSpeed = -1;

// Start Mazor
function init(){
  mazorManager = new MazorManager();
}

//Model class
function Mouse(){

}

	// To show mazor on first move
	Mouse.prototype.init = function(){
		document.addEventListener('mousemove', onMouseUpdateInit, false);
		if (disable) {
			document.addEventListener('click', onMouseClickDisabled, false);
			document.addEventListener('wheel', onWheel, false);
		}	
	}
		
	Mouse.prototype.clickToActivate = function(){
		document.addEventListener('click', onMouseClick, false);
		document.addEventListener('wheel', onWheel, false);
	}

	// To show mazor on first move
	function onMouseUpdateInit(e) {
		mazorManager.init(e.pageX,e.pageY);
		mazorManager.previousPosition= new Point(e.pageX, e.pageY);
		document.removeEventListener('mousemove', onMouseUpdateInit, false);
		document.addEventListener('mousemove', onMouseUpdate, false);
	}

	// For the rest of the moving
	function onMouseUpdate(e) {
		//var position = setPosition(new Point(e.pageX,e.pageY));
		if (!inButtonArea(e.pageX,e.pageY)) {
			var position= new Point(e.pageX, e.pageY);
			var oldLat = mazorManager.point2LatLng(position);
			mazorManager.mouseDifLat = oldLat.lat - mazorManager.point2LatLng(mazorManager.previousPosition).lat;
			mazorManager.mouseDifLng = mazorManager.point2LatLng(position).lng - mazorManager.point2LatLng(mazorManager.previousPosition).lng;
			if (!disable){
				mazorManager.updatePosition(position);
			}
			mazorManager.addMovement(position.calcDistance(mazorManager.previousPosition));
			mazorManager.previousPosition = position;
		} else {
			if (mazorManager.getState() != mazorManager.states.DEACTIVATED) {
				mazorManager.deActivateMazor(position);
			}
		}
	}

		// For the rest of the movingg
	function onMouseClick(e) {
		mazorManager.addClick();
		if (!inButtonArea(e.pageX,e.pageY) && mazorManager.start){
			var position = new Point(e.pageX,e.pageY);
			mazorManager.checkToActivate(position);
			document.removeEventListener('click', onMouseClick, false);
		}
	}
	
	function onMouseClickDisabled(e) {
		mazorManager.addClick();
	}
	
	function onWheel(e) {
		mazorManager.addWheel();
	}
	
	function inButtonArea(x,y){
		if (x <425 && y < 225) {
			return true;
		}
	}
	
//View Class
function Canvas(){
	this.map;
	this.setHeight();
	this.loadMaps();

}

	//set Height of Canvas
	Canvas.prototype.setHeight = function(){
		var h = window.innerHeight - 19 ;
		document.getElementById('Wrapper').setAttribute("style","height:" + h + "px");
	}

	//set Height of Canvas
	Canvas.prototype.loadMaps = function(){
		var latLng = new mapboxgl.LngLat(5.39524,52.28958);
		
		mapboxgl.accessToken = 'pk.eyJ1IjoiaWFtY2oiLCJhIjoiY2phd3Z0ajFtMG9mYTMwcGk2MjE4OGc1YyJ9.WmhfzYT1kijQRhyNfPZSVA';
		this.map = new mapboxgl.Map({
		container: 'Canvas',
		zoom: zoomLevel,
		center: latLng,
		style: 'mapbox://styles/mapbox/streets-v10'
		});
		
		this.map.scrollZoom.disable();
		this.map.dragPan.disable();
		 
		 this.map.on('mousemove', function (event) {
              mouseLatLng = event.lngLat;
			//  mouseLatLng = new google.maps.LatLng(52.28958, 5.39524);

          });
		  
		  
	}
	
	Canvas.prototype.normalMode = function(){
		this.map.setOptions({  zoomControl: true  });
		this.map.setOptions({  gestureHandling: 'auto'  });
	}
	
	Canvas.prototype.getGestureHandling = function(){
		if (disable) {
			return 'auto';
		} else {
			return 'none';
		}
	}
	
	Canvas.prototype.zoomIn = function(angle){
		if (!mazorManager.zoomAngle || mazorManager.zoomAngle <2.1 || angle > mazorManager.zoomAngle){
			mazorManager.zoomAngle = angle+1;
		}

		var zoomToAdd = 0.1;
		var zoomFactor = Math.pow(2,zoomToAdd);
		var devideFactor = 1/(1-(1/zoomFactor));
		console.log(devideFactor);
		
		if (angle < mazorManager.zoomAngle -2){
			var lat = (mazorManager.mazor.originLatLng.lat - this.getCenter().lat)/devideFactor;
			var lng = (mazorManager.mazor.originLatLng.lng - this.getCenter().lng)/devideFactor;
			var newZoom = this.map.getZoom()+zoomToAdd;
			var newCenter = new mapboxgl.LngLat( this.getCenter().lng + lng, this.getCenter().lat + lat);
			this.map.jumpTo({zoom: newZoom, center: newCenter});
			mazorManager.zoomAngle = angle;
			
		}
		
	}
	
	Canvas.prototype.zoomOut = function(angle){
	
		if (!mazorManager.zoomAngle|| mazorManager.zoomAngle >357.9 || angle < mazorManager.zoomAngle){
			mazorManager.zoomAngle = angle-1;
		}
		
		var zoomToAdd = 0.1
		var zoomFactor = Math.pow(2,zoomToAdd);
		var multiplyFactor = -1 + Math.pow(2,zoomToAdd);

		if (angle > mazorManager.zoomAngle + 2){
			var lat = (mazorManager.mazor.originLatLng.lat - this.getCenter().lat)*multiplyFactor;
			var lng = (mazorManager.mazor.originLatLng.lng - this.getCenter().lng)*multiplyFactor;
			//this.map.setZoom(this.map.getZoom()-zoomToAdd);
			//this.panLatLng( this.getCenter().lat - lat,this.getCenter().lng - lng);
			var newZoom = this.map.getZoom() -zoomToAdd;
			var newCenter = new mapboxgl.LngLat( this.getCenter().lng - lng, this.getCenter().lat - lat);
			this.map.jumpTo({zoom: newZoom, center: newCenter});
			mazorManager.zoomAngle =angle;
		}
		
	}
	
	Canvas.prototype.zoom = function(zoomLevel){
		this.map.setZoom(zoomLevel);
	}
	
	Canvas.prototype.pan = function(direction,speed){
		
		// rekening houden met zoomfactor.
		panStepX = Math.pow(2,-(this.getZoom())) * 360 * panStep;
		panStepY =  Math.pow(2,-(this.getZoom())) * 180 * panStep;
		// hoek omrekenen naar x en y met gonio
		
		direction = getRealAngle(direction);
	
		panStepX = Math.cos(rad(direction)) * panStepX;
		panStepY = Math.sin(rad(direction)) * panStepY;
		//console.log(panStepX,panStepY);
		// x en y vermenigvuldigen met speed
		panStepX = panStepX * speed;
		panStepY = panStepY * speed;
		//console.log(panStepX,panStepY);
		//console.log(speed);
		this.panLatLng( this.map.getCenter().lat + panStepY,this.map.getCenter().lng + panStepX);
	}
	
	
	
	Canvas.prototype.panLatLng = function(lat,lng){
		var newCenter = new mapboxgl.LngLat( lng, lat);
		this.map.jumpTo({center: newCenter});
	}
	
	Canvas.prototype.getCenter = function(){
		return this.map.getCenter();
	}
	
	Canvas.prototype.setCenter = function(newCenter){
		this.map.setCenter = newCenter;
	}

	Canvas.prototype.getZoom = function(){
		return this.map.getZoom();
	}
	
	
	Canvas.prototype.latLng2Point = function(latLng){
		return this.map.project(latLng);
	}

	Canvas.prototype.point2LatLng = function(point){
		  return this.map.unproject(point);
	}
	
	Canvas.prototype.panTo = function(location){
		this.map.panTo(location);
	}
	

//Controller class
function MazorManager(){
	this.closeTimer;
	this.zoomTimer;
	this.panTimer;
	this.panModeTimer;
	this.states = {DEACTIVATED:1, ACTIVATED:2, ACTIVATEDCLOSABLE:3, ZOOMACTIVATED:4,PANACTIVATED:5,FULLPANMODEACTIVATED:6};
	this.mouseLatLng;
	this.previousPosition;
	this.mouseDifLat;
	this.mouseDifLng;
	this.zoomAngle;
	this.start=true;
	this.canvas = new Canvas();
	this.mazor = new Mazor();
	this.mouse = new Mouse();
	this.mouse.init();
	this.lastPosition;
	this.taskManager = new TaskManager();
}

	MazorManager.prototype.init = function(position){
		this.mazor.init();
		this.mazor.updatePosition(position);
	}

	//temp
	function string_of_enum(enumName,value) 
{
  for (var k in enumName) if (enumName[k] == value) return k;
  return null;
}
	
	//StateManagement
	MazorManager.prototype.updatePosition = function(position){
		//console.log(string_of_enum(states,this.mazor.state));
		if(this.mazor.isDeActivated()){
			this.mouse.clickToActivate();
		} else if (this.mazor.isActivated()){
			
			//The mouse could be still on the x, on the zoom icon, on the panicon or outside the mazor.
			
			this.checkToClosable(position)

		} else if (this.mazor.isActivatedClosable()){
			clearTimeout(this.zoomTimer);	
			clearTimeout(this.panTimer);	
			clearTimeout(this.closeTimer);
			this.checkActivatedClosable(position);
		} else if (this.mazor.isZoomActivated()){

			// newApproach
			clearTimeout(this.panTimer);	
			clearTimeout(this.closeTimer);
				if (!this.checkToClose(position)){
					if (this.checkToHighlightPan(position)){
						this.checkPanActivated(position);
					} else {						
						this.setZoomInOut(position);
					}
				}
			
		} else if (this.mazor.isPanActivated()){
			this.mazor.activateFullPanMode();
			
		} else if (this.mazor.isFullPanModeActivated()){
			clearTimeout(this.closeTimer);
			clearTimeout(this.zoomTimer);
			clearInterval(this.panModeTimer);
			if (!this.cursorInPanArea(position)){
				!this.checkToClose(position)
			} 	
			this.pan(position);
		}
		this.mazor.updatePosition(position);
		
		
	}

	MazorManager.prototype.checkToActivate = function(position){
	 	this.mazor.activateMazor(position);
	}

	// this state can only be reached if the mazor is just activated.
	MazorManager.prototype.checkToClosable = function(position){
		//The mouse has to have left the center.
		if(this.mazor.origin.calcDistance(position)> cursorBallRadius && this.mazor.isActivated()){
			this.mazor.activateMazorClosable();
			return true;
		} else {
			return false;
		}
	}
	
	MazorManager.prototype.checkActivatedClosable = function(position){
		// the mazor is closeable, so we first check to close
		if (!this.checkToClose(position)) {
			// if not close then chech to highlight zoom or pan.
			if (this.checkToHighlightZoom(position)){
				// if highlight we can launch the timer to activate the zoom.
				this.checkZoomActivated(position);
			} else if (this.checkToHighlightPan(position)){
				// if highlight we can launch the timer to activate the pan.
				this.checkPanActivated(position);	
			} 
			
		} else
		{
			//the mazor is closed , start timer again in mazor.deActivateMazor
			
		}
	}
	
	MazorManager.prototype.checkToHighlightZoom = function(position){
		if(this.mazor.getZoomIconPosition().calcDistance(position) < cursorBallRadius*3){
			this.mazor.highlightZoom();
			return true;
		} else {
			this.mazor.showNormalZoom();	
			return false;
		}
	}
	
	MazorManager.prototype.checkZoomActivated = function(position){
			var t = this;
			this.zoomTimer = window.setTimeout(function(){t.mazor.activateZoom(position);},iconTimeOutms);
	}
	
	MazorManager.prototype.cursorInZoomRing= function(position){
		var dist = this.mazor.origin.calcDistance(position);
		if( dist < (zoomIconOffset + cursorBallRadius*3) && dist > (zoomIconOffset - cursorBallRadius*3)){
			return true;
		} else {
			return false;
		}
	}
	
	MazorManager.prototype.setZoomInOut = function(position){
		//check position
		var angle = this.mazor.origin.calcAngle(position); ;
		
		if (angle> this.mazor.zoomDegrees){
			//set icon
			this.mazor.showPlus();
			zoomFactor = zoomFactor + zoomChange;
			this.canvas.zoomIn(getRealAngle(this.mazor.origin.calcAngle(position)));
			
		} else {
			this.mazor.showMin();
			this.canvas.zoomOut(getRealAngle(this.mazor.origin.calcAngle(position)));
			//change zoomlevel
			zoomFactor = zoomFactor - zoomChange;
			
		}
		
		this.mazor.zoomDegrees = angle;
	}
	
	MazorManager.prototype.checkToHighlightPan = function(position){
		if(!this.checkDeActivatePan(position)){
			this.mazor.highlightPan();
			return true;
		} else {
			this.mazor.notHighlightPan();
			return false;
		}
	}
	
	MazorManager.prototype.checkPanActivated = function(position){
		this.mazor.activatePan(position);
	}
	
	MazorManager.prototype.checkDeActivatePan = function(position){
		
		if(this.mazor.origin.calcDistance(position) < panIconOffset - cursorBallRadius*0.5){
			return true;
		} else {
			return false;
		}
	}
	
	MazorManager.prototype.checkFullPanModeActivated = function(position){
		if(this.mazor.origin.calcDistance(position) > fullPanModeRadius ){
			this.lastPosition = mouseLatLng;
			this.mazor.activateFullPanMode(position);
		}
	}
	
	MazorManager.prototype.cursorInPanArea = function(position){
		var dist = this.mazor.origin.calcDistance(position);
		if( dist > (panIconOffset - cursorBallRadius*3)){
			return true;
		} else {
			return false;
		}
	}
	
	MazorManager.prototype.pan = function(position){
		var t = this;
		var direction = t.mazor.getDirection(position);
		var speed = t.mazor.getSpeed(position);
		
		// this is to move canvas to center
		this.panModeTimer = window.setInterval(function(){t.canvas.pan(direction,speed);},panInterval);
		if (this.directionCompare(oldDirection,direction,position)&& (speed < (oldSpeed -0.1 )||speed == 0 )) {
			clearInterval(this.panModeTimer);
			this.canvas.panLatLng(this.canvas.getCenter().lat - mazorManager.mouseDifLat,this.canvas.getCenter().lng - mazorManager.mouseDifLng);
		} else {
			
		}

		oldDirection = direction;
		oldSpeed = speed;
		this.taskManager.addSpeed(speed);
	}
	
	
	MazorManager.prototype.checkToClose = function(position){
		//Check if the cursor is near the center;
		if(this.mazor.origin.calcDistance(position)< cursorBallRadius){
			//wait to close
			var t = this;
			mazorManager.closeTimer = window.setTimeout(function(){t.mazor.deActivateMazor(position);},iconTimeOutms);
			return true;
		} else if(this.mazor.origin.calcDistance(position)> closeRadius){
			//return true;
		} else {
			return false;
		}
	}
	
	MazorManager.prototype.latLng2Point = function(latLng){
		return this.canvas.latLng2Point(latLng);
	}

	MazorManager.prototype.point2LatLng = function(point){
		return this.canvas.point2LatLng(point);
	}
	
	MazorManager.prototype.directionCompare = function(oldD, newD, position){
		if (this.mazor.origin.calcDistance(position) < closeRadius) {
			return true;
		} else {
			if (newD < oldD +0.5 && newD > oldD -0.5){
				return true;
			} else {
				return false;
			}
		}
	}
	
	MazorManager.prototype.addClick = function(){
		if (this.taskManager) {
			this.taskManager.addClick();
		}
	}
	
	MazorManager.prototype.getMazorLatLng = function(){
		return this.mazor.originLatLng;
	}
	
	MazorManager.prototype.addMovement = function(distance){
		if (this.taskManager) {
			this.taskManager.addMovement(distance);
		}
	}
	
	MazorManager.prototype.addWheel = function(){
		if (this.taskManager) {
			this.taskManager.addWheel();
		}
	}
	
	MazorManager.prototype.addZoom = function(zoomFactor){
		if (this.taskManager) {
			this.taskManager.addZoom(zoomFactor);
		}
	}
	
	MazorManager.prototype.success = function(){
		if (this.taskManager) {
			this.taskManager.success();
		}
	}
	
	MazorManager.prototype.ratherMouse = function(){
		if (this.taskManager) {
			this.taskManager.ratherMouse();
		}
	}
	
	MazorManager.prototype.failed = function(){
		if (this.taskManager) {
			this.taskManager.failed();
		}
	}
	
	MazorManager.prototype.change = function(){
		disable = true;
		this.start = false; 
		this.mazor.hideAll(this.mazor.origin);
		this.canvas.normalMode();
		document.addEventListener('click', onMouseClick, false);
	}
	
	MazorManager.prototype.deActivateMazor = function(position){
		this.mazor.deActivateMazor(position);
		clearInterval(this.panModeTimer);
		if (disable) {
			this.mazor.hideAll(this.mazor.origin);
		}
	}
	
	MazorManager.prototype.getState = function(){
		return this.mazor.state;
	}
	
	MazorManager.prototype.addState= function(newState){
		if (this.taskManager){
			this.taskManager.addState(newState);
		}
	}
	
	MazorManager.prototype.send= function(){
		if (this.taskManager){
			this.taskManager.send();
		}
	}

	MazorManager.prototype.panTo= function(location){
		this.canvas.panTo(location);
	}		
	
	MazorManager.prototype.zoom= function(zoomFactor){
		this.canvas.zoom(zoomFactor);
	}	
				
//Start of Mazor
function Mazor(){
	this.state;
	this.origin;
	this.originLatLng;
	this.cursorBall = new CursorBall();
	this.MazorDeActivated = new MazorDeActivated();
	this.innerCircle = new InnerCircle();
	this.outerCircle = new OuterCircle();
	this.close = new Close();
	this.panIcon = new PanIcon();
	this.zoomIcon = new ZoomIcon();
	this.panLine = new PanLine();
	this.zoomDegrees;
}

	//Only move the circels if not activated.
	Mazor.prototype.updatePosition = function(position){
		if (this.isDeActivated()){
			this.origin = position;
			this.MazorDeActivated.updatePosition(position);
		} else {
			this.cursorBall.updatePosition(position);
			this.innerCircle.rotate(this.origin.calcAngle(position)+180);
			this.outerCircle.rotate(this.origin.calcAngle(position)+180);
			this.panIcon.rotateIcon(this.origin.calcAngle(position));
			this.zoomIcon.rotateIcon(this.origin.calcAngle(position));
			if (this.isFullPanModeActivated){
				this.panLine.drawLine(this.origin,position);
			}
		}
	}

	Mazor.prototype.init = function(){
		this.setState(mazorManager.states.DEACTIVATED);
		if (!disable){
			this.MazorDeActivated.show();
		}
	}
	
	Mazor.prototype.activateMazor = function(){
		this.originLatLng = mouseLatLng;
		this.setState(mazorManager.states.ACTIVATED);
		this.MazorDeActivated.hide();
		this.cursorBall.showNormal();
		this.cursorBall.setPosition(this.origin);
		this.innerCircle.show();
		this.innerCircle.setPosition(this.origin);
		this.outerCircle.show();
		this.outerCircle.setPosition(this.origin);
		this.showBlue();
		this.close.show();
		this.close.setPosition(this.origin);
		this.zoomIcon.showNormal();
		this.zoomIcon.offset = zoomIconOffset;
		this.zoomIcon.setPosition(this.origin);
		this.zoomIcon.rotateIcon(-90);
		this.panIcon.showNormal();
		this.panIcon.offset = panIconOffset;
		this.panIcon.setPosition(this.origin);
		this.panIcon.rotateIcon(-90);		
	}
	
	Mazor.prototype.activateMazorClosable = function(){
		this.setState(mazorManager.states.ACTIVATEDCLOSABLE);
	}
	
	Mazor.prototype.activateZoom = function(position){
		mazorManager.zoomAngle = null;
		this.setState(mazorManager.states.ZOOMACTIVATED);
		this.zoomIcon.highlightZoom();		
		this.zoomIcon.showTwoWay();
		this.zoomDegrees = this.origin.calcAngle(position);
		// extra stuff for if you come from panmode
		this.panIcon.showNormal();
		this.panIcon.rotateIcon(this.origin.calcAngle(position));
		this.cursorBall.showNormal();
		this.cursorBall.updatePosition(position);
		this.showPurple();
	}
	
	Mazor.prototype.deActivateZoom = function(position){
		this.zoomIcon.showNormal();
		this.zoomIcon.rotateIcon(this.origin.calcAngle(position));
		this.showBlue();
	}
	
	Mazor.prototype.activatePan = function(position){
		this.setState(mazorManager.states.PANACTIVATED);
		//neede because you van go from zoomActivated to Panactivated without passing ACTIVATEDCLOSABLE
		this.deActivateZoom(position);
		this.panIcon.hideAll();
		this.cursorBall.showFullPanMode();
		this.showGreen();
	}
	
	Mazor.prototype.deActivatePan = function(){
		this.panIcon.showNormal();
		this.showBlue();
		this.panLine.hideAll();
		
	}
	
	Mazor.prototype.activateFullPanMode = function(position){
		this.zoomIcon.hideAll();
		this.setState(mazorManager.states.FULLPANMODEACTIVATED);		
		this.showGreen();
		this.panLine.showAll();
	}
	
	Mazor.prototype.deActivateFullPanMode = function(){
		this.panIcon.showNormal();
		this.cursorBall.showNormal();
		this.showBlue();
		this.panLine.hideAll();
	}
	
	Mazor.prototype.deActivateMazor = function(position){
		this.setState(mazorManager.states.DEACTIVATED);
		this.MazorDeActivated.show();
		this.cursorBall.hide();
		this.innerCircle.hide();
		this.outerCircle.hide();
		this.close.hide();
		this.panIcon.hideAll();
		this.panLine.hideAll();
		this.zoomIcon.hideAll();
		this.updatePosition(this.origin);
	}
	
	Mazor.prototype.highlightZoom = function(){
			this.zoomIcon.highlightZoom();
			this.notHighlightPan();
	}
	
	Mazor.prototype.notHighlightZoom = function(){
			this.zoomIcon.notHighlightZoom();
	}

	Mazor.prototype.highlightPan = function(){
		this.panIcon.highlightPan();
	}
	
	Mazor.prototype.notHighlightPan = function(){
			this.panIcon.notHighlightPan();
	}
	
	Mazor.prototype.showPurple = function(position){
		document.documentElement.style.setProperty('--MazorColor', 'var(--purple-color)');
	}
	
	Mazor.prototype.showGreen = function(position){
		document.documentElement.style.setProperty('--MazorColor', 'var(--green-color)');
	}
	
	Mazor.prototype.showBlue = function(position){
		document.documentElement.style.setProperty('--MazorColor', 'var(--blue-color)');
	}
	
	Mazor.prototype.isActivated = function(){
		return (this.state == mazorManager.states.ACTIVATED);
	}
	
	Mazor.prototype.isActivatedClosable = function(){
		return (this.state == mazorManager.states.ACTIVATEDCLOSABLE);
	}

	Mazor.prototype.isDeActivated = function(){
		return (this.state == mazorManager.states.DEACTIVATED);
	}	
	
	Mazor.prototype.isZoomActivated = function(){
		return (this.state == mazorManager.states.ZOOMACTIVATED);
	}	

	Mazor.prototype.isPanActivated = function(){
		return (this.state == mazorManager.states.PANACTIVATED);
	}	

	Mazor.prototype.isFullPanModeActivated = function(){
		return (this.state == mazorManager.states.FULLPANMODEACTIVATED);
	}	
	
	Mazor.prototype.getSpeed = function(position){
		//was 100;
		var speed = (130 - (maxPanDistance-this.origin.calcDistance(position)))/10;
		if (speed < 0){
			return 0;
		}else {
			return speed;
		}
		
	}	

	Mazor.prototype.getDirection = function(position){
		return this.origin.calcAngle(position);
	}	

	Mazor.prototype.setState = function(newState){
		this.state = newState;
		mazorManager.addState(this.state);
	}	

	Mazor.prototype.hideAll	 = function(){
		this.deActivateMazor();
		this.MazorDeActivated.hide();
	}

	Mazor.prototype.getZoomIconPosition	 = function(){
		return this.zoomIcon.getRealPosition();
	}	

	Mazor.prototype.showPlus	 = function(){
		this.zoomIcon.showPlus()
	}	
	
	Mazor.prototype.showMin = function(){
		this.zoomIcon.showMin();
	}	
	
	Mazor.prototype.showNormalZoom = function(){
		this.zoomIcon.showNormal();
	}	

	
function Element(){
	this.div;
	this.activated = false;
	this.visible = false;
	this.origin;
	this.realPosition = new Point();
}

	Element.prototype.updatePosition = function(origin){
		this.origin = origin;
		this.setPosition(origin);				
	}

	// take half of the size into account to position the element
	Element.prototype.setPosition = function(origin){
		this.origin = origin;
		var left = origin.x - (this.div.offsetWidth /2);
		var top = origin.y - (this.div.offsetHeight /2);
		this.div.style.left = left+'px';
		this.div.style.top = top+'px';
	}
	
	Element.prototype.setOrigin = function(origin){
		this.origin = origin;
	}

	Element.prototype.activate = function(){
		this.activated = true;
		this.show();
	}
	
	Element.prototype.setDiv = function(divName){
		this.div = document.getElementById(divName);
	}
	
	Element.prototype.show = function(){
		this.visible = true;
		this.div.setAttribute("style","visibility:visible");
	}
	
	Element.prototype.hide = function(){
		this.visible = false;
		this.div.setAttribute("style","visibility:hidden");
	}
	
	Element.prototype.rotate = function(deg){
			this.div.style.webkitTransform = 'rotate('+deg+'deg)'; 
			this.div.style.mozTransform    = 'rotate('+deg+'deg)'; 
			this.div.style.msTransform     = 'rotate('+deg+'deg)'; 
			this.div.style.transform       = 'rotate('+deg+'deg)'; 
		}

	Element.prototype.rotateIcon = function(deg){
			this.rotate(deg);
			this.realPosition.x = this.origin.x + Math.cos(rad(deg)) * this.offset;
			this.realPosition.y = this.origin.y + Math.sin(rad(deg)) * this.offset;
			var left = this.realPosition.x - (this.div.offsetWidth /2);
			var top = this.realPosition.y - (this.div.offsetHeight /2);
			this.div.style.left = left+'px';
			this.div.style.top = top+'px';
		}

	Element.prototype.getRealPosition = function(deg){
			return this.realPosition;
		}
		
CursorBall.prototype = new Element();
function CursorBall(){
	this.setDiv('CursorBall');	
}

	CursorBall.prototype.showFullPanMode = function(){
		document.documentElement.style.setProperty('--cursorBorder-color', 'var(--green-color)');
		document.documentElement.style.setProperty('--cursorFill-color', 'transparent');
	}
	
	CursorBall.prototype.showNormal = function(){
		this.show();
		document.documentElement.style.setProperty('--cursorBorder-color', 'var(--grey-color)');
		document.documentElement.style.setProperty('--cursorFill-color', 'var(--blue-color)');
	}

InnerCircle.prototype = new Element();
function InnerCircle(){
	this.setDiv('InnerCircle');	
}

MazorDeActivated.prototype = new Element();
function MazorDeActivated(){
	this.setDiv('MazorDeActivated');	
}

OuterCircle.prototype = new Element();
function OuterCircle(){
	this.setDiv('OuterCircle');	
}

Close.prototype = new Element();
function Close(){
	this.setDiv('Close');	
}

PanIcon.prototype = new Element();
function PanIcon(){
	this.setDiv('PanIcon');
	this.panIconImage = new PanIconImage();
}

	PanIcon.prototype.highlightPan = function(){
		document.documentElement.style.setProperty('--PanColor', 'var(--green-color)');
		document.getElementById('PanIconImage1515').setAttribute("src","PanIcon1515green.png");
	}

	PanIcon.prototype.notHighlightPan = function(){
		document.documentElement.style.setProperty('--PanColor', 'var(--blue-color)');
		document.getElementById('PanIconImage1515').setAttribute("src","PanIcon1515.png");
	}

	PanIcon.prototype.showActivePanIcon = function(){
		document.documentElement.style.setProperty('--PanColor', 'var(--green-color)');
		document.getElementById('PanIconImage1515').setAttribute("src","PanIcon1515green.png");
	}

	PanIcon.prototype.showNormal = function(){
		this.show();
		this.panIconImage.show();
		this.notHighlightPan();
	}
	
	PanIcon.prototype.hideAll = function(){
		this.hide();
		this.panIconImage.hide();
		
	}
	
PanIconImage.prototype = new Element();
function PanIconImage(){
	this.setDiv('PanIconImage');
}

ZoomIcon.prototype = new Element();
function ZoomIcon(){
	this.setDiv('MagnifyingGlass');
	this.zoomHolder = new ZoomHolder();
	this.activatedZoomImage = new ActivatedZoomImage();
}

ZoomIcon.prototype.showNormal = function(){
	this.show();
	this.zoomHolder.show();
	this.zoomHolder.showHolderOblique();
	this.activatedZoomImage.hide();
	this.notHighlightZoom();
}

ZoomIcon.prototype.hideAll = function(){
	this.hide();
	this.zoomHolder.hide();
	this.activatedZoomImage.hide();
	this.notHighlightZoom();
}

ZoomIcon.prototype.showTwoWay = function(){
	this.zoomHolder.showHolderStraight();
	this.activatedZoomImage.showTwoWay();
}

ZoomIcon.prototype.showPlus = function(){
	this.activatedZoomImage.showPlus();
}

ZoomIcon.prototype.showMin = function(){
	this.activatedZoomImage.showMin();
}

ZoomIcon.prototype.highlightZoom = function(){
	document.documentElement.style.setProperty('--ZoomColor', 'var(--purple-color)');
	document.documentElement.style.setProperty('--ZoomFillColor', 'var(--lightPurple-color)');
}

ZoomIcon.prototype.notHighlightZoom = function(){
	
	document.documentElement.style.setProperty('--ZoomColor', 'var(--blue-color)');
	document.documentElement.style.setProperty('--ZoomFillColor', 'var(--white-color)');
}


ActivatedZoomImage.prototype = new Element();
function ActivatedZoomImage(){
	this.setDiv('ActivatedZoomImage');
}

ActivatedZoomImage.prototype.showTwoWay = function(){
	this.show();
	document.getElementById('ActivatedZoomImage1515').setAttribute("src","TwoWayIcon.png");
}

ActivatedZoomImage.prototype.showPlus = function(){
	document.getElementById('ActivatedZoomImage1515').setAttribute("src","PlusIcon.png");
}

ActivatedZoomImage.prototype.showMin = function(){
	document.getElementById('ActivatedZoomImage1515').setAttribute("src","MinIcon.png");
}

ZoomHolder.prototype = new Element();
function ZoomHolder(){
	this.setDiv('ZoomHolder');
}

ZoomHolder.prototype.showHolderOblique = function(){
	this.div.className = "default Icon ZoomHolderOblique";
}

ZoomHolder.prototype.showHolderStraight = function(){
	this.div.className = "default Icon ZoomHolderStraight";
}

PanLine.prototype = new Element();
function PanLine(){
	this.setDiv('PanLine');
	this.panLineDiv = new PanLineDiv();
}

PanLine.prototype.showAll = function () {
	this.show();
	this.panLineDiv.show();
}

PanLine.prototype.hideAll = function () {
	this.hide();
	this.panLineDiv.hide();
}

PanLine.prototype.drawLine = function (origin, position) {
  var pointA = origin;
  var pointB = position;
  var angle = origin.calcAngle(position);
  var distance = origin.calcDistance(position);
  
  var a = Math.cos(rad(getRealAngle(angle)))*distance;
  var xdif = 0.5 * (distance - a);
  var ydif = (position.y - origin.y) /2;

  this.div.style.setProperty('transform', 'rotate(' + angle + 'deg)');
  this.div.style.setProperty('width', distance + 'px');
  this.panLineDiv.div.style.setProperty('width', distance - 10 + 'px');

  // Set Position
  this.div.style.setProperty('top', origin.y -10 + ydif +'px');
  this.div.style.setProperty('left', origin.x - xdif +'px');
}

PanLineDiv.prototype = new Element();
function PanLineDiv(){
	this.setDiv('PanLineDiv');
}


function Zoom(){
	this.min = 1;
	this.max = 22;
	this.origin = new Point();
}

//Helper classes and functions
function Point(px,py){
	this.x = px;
	this.y = py;
}

	//Calculate distance between the point and another points
	Point.prototype.calcDistance = function(toPoint){
		var x = Math.abs(this.x - toPoint.x);
		var y = Math.abs(this.y - toPoint.y);
		var d = Math.sqrt( x*x + y*y);
		return d;
	}
	
	//Calculate angle between the point and another points
	Point.prototype.calcAngle = function(toPoint){
		var angleDeg = Math.atan2(toPoint.y - this.y, toPoint.x - this.x) * 180 / Math.PI;
		return angleDeg;
		
	}

	//Compare to other point
	Point.prototype.compare = function(toPoint){
		if (this.x == toPoint.x && this.y == toPoint.y){
			return true;
		} else {
			return false;
		}
	}
	
function TaskButton(taskmanager){
	this.taskManager = taskmanager;
	
	this.div = document.getElementById('Task');
	this.textDiv = document.getElementById('TaskText');
}
	
	TaskButton.prototype.showStartText = function(text){
		document.documentElement.style.setProperty('--TextButtonColor', 'var(--green-color)');
		this.textDiv.innerHTML = text;
	}
	
	TaskButton.prototype.showStopText = function(text){
		document.documentElement.style.setProperty('--TextButtonColor', 'red');
		this.textDiv.innerHTML = text;
	}
	
	TaskButton.prototype.show = function(){
		$("#Task").fadeIn();
		this.div.style.setProperty('visibility','visible');
	}
	
	TaskButton.prototype.hide = function(){
		//$("#Task").fadeOut();
		this.div.style.setProperty('visibility','hidden');
	}
	
//Data Class
function TaskManager(){
	this.taskCount =0;
	this.userId = Date.now();
	this.tasks = new Set();
	this.activeTask = new Practice(this.userId,0);
	this.taskButton = new TaskButton(this);
}

	TaskManager.prototype.newTask = function(){
		this.taskCount = this.taskCount + 1;
		var taskId = this.taskCount;
		switch(this.taskCount){
			case 1: 
				var task = new Task1(this.userId,taskId);
				break;
			case 2: 
				var task = new Task2(this.userId,taskId);
				break;
			case 3: 
				var task = new Task3(this.userId,taskId);
				break;
			case 4: 
				var task = new Task4(this.userId,taskId);
				mazorManager.change();
				break;	
			case 5: 
				var task = new Task5(this.userId,taskId);
				break;
			case 6: 
				var task = new Task6(this.userId,taskId);
				break;
			case 7: 
				var task = new CloseUp(this.userId,taskId);
				break;
		}
	    
		this.tasks.add(task);
		return task;
	}

	TaskManager.prototype.send = function(){
	   Email.send("corjanLeiden@gmail.com", "corjan@gmail.com",	this.userId, this.getTaskData() + "<br><br>" + this.getStatusLog(), "smtp.gmail.com", "CorjanLeiden@gmail.com", "Uffel1Uffel1");   
	}
	
	TaskManager.prototype.getTaskData = function(){
		//assamble data, create csv format.  
		var data = "UserId;TaskNumber;StartTime;TotalTime;Clicks;Movement;Wheel;Result" + "<br>"
	
		for(let task of this.tasks){
			data = data + task.userId + ";" +task.number+ ";" +task.startTime+ ";" +task.totalTime+ ";" +task.clicks+ ";" +task.movement + ";" +task.wheel + ";" +task.result +"<br>";
		}			
		return data;
	}
	
	TaskManager.prototype.getStatusLog = function(){
	   //assamble data, create csv format.  
	   	var statusLog = "UserId;TaskNumber;Time;Status" + "<br>"
		for(let task of this.tasks){
			statusLog = statusLog +task.statusLog+ "<br>";
		}			
		return statusLog;
	}
	
	TaskManager.prototype.taskButtonClicked = function(){
		this.activeTask.stop();
		this.activeTask = this.newTask();
		this.activeTask.start();
		this.taskButton.showStopText(this.activeTask.stopText);
		this.taskButton.hide();
		var t = this;
		window.setTimeout(function(){t.taskButton.show();},400);
	}
	
	TaskManager.prototype.addState = function(state){
		this.activeTask.addState(state);
	}
	
	TaskManager.prototype.addClick = function(){
		this.activeTask.addClick();
	}
	
	TaskManager.prototype.addMovement = function(distance){
		this.activeTask.addMovement(distance);
	}
	
	TaskManager.prototype.addWheel = function(){
		this.activeTask.addWheel();
	}
	
	TaskManager.prototype.addSpeed = function(speed){
		this.activeTask.addSpeed(speed);
	}
	
	TaskManager.prototype.addZoom = function(zoomFactor){
		this.activeTask.addZoom(zoomFactor);
	}
	
	TaskManager.prototype.success = function(){
		this.activeTask.success();
		this.taskButtonClicked();
	}
	
	TaskManager.prototype.ratherMouse = function(){
		this.activeTask.ratherMouse();
		this.taskButtonClicked();
	}
	
	TaskManager.prototype.failed = function(){
		this.activeTask.failed();
		this.taskButtonClicked();
	}
	
	
	
function Task(taskUserId, taskId){
	this.userId = taskUserId;
	this.number = taskId;
	this.startTime=0;
	this.clicks=0;
	this.movement=0;
	this.totalTime=0;
	this.wheel=0;
	this.statusLog="";
	this.isDone;
	this.startText;
	this.stopText;
	this.started = false;
	this.result = "";
	this.buttons= "<div class='spacer'></div><div class='Button' onclick='mazorManager.success()'>Het is me gelukt</div><div class='spacer'></div><div class='Button' onclick='mazorManager.ratherMouse()'>Met een gewone muis was het sneller gegaan</div><div class='spacer'></div><div onclick='mazorManager.failed()' class='Button' >Het is me niet gelukt</div>"
	this.buttonsMazor= "<div class='spacer'></div><div class='Button' onclick='mazorManager.success()'>Het is me gelukt</div><div class='spacer'></div><div class='Button' onclick='mazorManager.ratherMouse()'>Met de Mazor was het sneller gegaan</div><div class='spacer'></div><div onclick='mazorManager.failed()' class='Button' >Het is me niet gelukt</div>"


}

	Task.prototype.start = function(){
		this.started = true;
	    this.startTime = Date.now();
		//todo
		mazorManager.panTo(this.location);
		mazorManager.zoom(this.zoomFactor);
	}
	
	Task.prototype.stop = function(){
		this.isDone = true;
		this.totalTime = Date.now() - this.startTime;
	}
	
	Task.prototype.addState = function(state){
	    this.statusLog = this.statusLog + this.userId + ";" + this.number+ ";" +  Date.now() + ";" + getState(state) + "<br>";
	}
	
	Task.prototype.addZoom = function(zoomLevel){
	    this.statusLog = this.statusLog + this.userId + ";" + this.number+ ";" +  Date.now() + ";z " + zoomLevel + "<br>";
	}
	
	Task.prototype.addSpeed = function(panSpeed){
	    this.statusLog = this.statusLog + this.userId + ";" + this.number+ ";" +  Date.now() + ";p " + panSpeed + "<br>";
	}
	
	Task.prototype.addClick = function(){
	    this.clicks = this.clicks + 1;
		this.statusLog = this.statusLog + this.userId + ";" + this.number+ ";" +  Date.now() + ";click<br>";
	}
	
	Task.prototype.addWheel = function(){
	    this.wheel = this.wheel + 1;
	}

	Task.prototype.addMovement = function(movement){
	    this.movement = this.movement + Math.abs(movement);
	}
	
	Task.prototype.done = function(){
	    return this.isDone;
	}
	
	Task.prototype.success = function(){
	    this.result= "success";
	}
	
	Task.prototype.ratherMouse = function(){
	    this.result= "ratherMouse";
	}
		
	Task.prototype.failed = function(){
	    this.result= "failed";
	}
	
function getState(state){
	switch( state){
		case 1:
			return "DEACTIVATED";
		case 2:
			return "ACTIVATED";
		case 3:
			return "ACTIVATEDCLOSABLE";
		case 4:
			return "ZOOMACTIVATED";
		case 5:
			return "PANACTIVATED";
		case 6:
			return "FULLPANMODEACTIVATED";
	}				
}
	
Practice.prototype = new Task();
function Practice(taskUserId, taskId){
	this.userId = taskUserId;
	this.number = taskId;
	this.startText = "Klik hier om te starten met oefenen";
	this.stopText = "<a class='Button' >Zoek bv vliegveld bij Jakarta, moskee op </a><BR><BR><a class='Button' >Bali Klik hier als je klaar bent met oefenen</a>";
}

Task1.prototype = new Task();
function Task1(taskUserId, taskId){
	this.userId = taskUserId;
	this.number = taskId;
	this.startText = "Klik hier om te starten met taak 1: <BR> zoek Amsterdam Centraal";
	this.stopText = "Taak 1: zoek Amsterdam Centraal<br>" + this.buttons;
	this.location = new mapboxgl.LngLat(5.39524,52.28958);
	this.zoomFactor = 8;
	
}

Task2.prototype = new Task();
function Task2(taskUserId, taskId){
	this.userId = taskUserId;
	this.number = taskId;
	this.startText = "Klik hier om te starten met taak 2: <BR> zoek een ziekenhuis in Leeuwarden";
	this.stopText = "Taak 2: zoek een ziekenhuis in Leeuwarden<br>" + this.buttons;
	this.location = new mapboxgl.LngLat(5.792486,53.196635);
	this.zoomFactor = 19;
	
}

Task3.prototype = new Task();
function Task3(taskUserId, taskId){
	this.userId = taskUserId;
	this.number = taskId;
	this.startText = "Klik hier om te starten met taak 3: <BR> zoek een plek om eten te kopen langs de A31";
	this.stopText = "Taak 3: zoek een plek om eten te kopen langs de A31<br>" + this.buttons;
	this.location = new mapboxgl.LngLat(7.305221,53.368559);
	this.zoomFactor = 16;
	
}

Task4.prototype = new Task();
function Task4(taskUserId, taskId){
	this.userId = taskUserId;
	this.number = taskId;
	this.startText = "Klik hier om te starten met taak 4: <BR> zoek Amsterdam Centraal";
	this.stopText = "Nu gewoon met MUIS en ZOOMEN rechtsonder <BR> Taak 4: zoek Rotterdam Centraal<br>" + this.buttonsMazor;
	this.location = new google.maps.LatLng(52.28958, 5.39524);
	this.zoomFactor = 8;
	
}

Task5.prototype = new Task();
function Task5(taskUserId, taskId){
	this.userId = taskUserId;
	this.number = taskId;
	this.startText = "Klik hier om te starten met taak 5: <BR> zoek een ziekenhuis in Leeuwarden";
	this.stopText = "Taak 5: zoek een ziekenhuis in Maastricht<br>" + this.buttonsMazor;
	this.location = new mapboxgl.LngLat(5.695795,50.849093);
	this.zoomFactor = 19;
	
}

Task6.prototype = new Task();
function Task6(taskUserId, taskId){
	this.userId = taskUserId;
	this.number = taskId;
	this.startText = "Klik hier om te starten met taak 3: <BR> zoek een plek om eten te kopen langs de A44";
	this.stopText = "Taak 6: zoek een plek om eten te kopen langs de A44<br>" + this.buttonsMazor;
	this.location = new mapboxgl.LngLat(8.676892,51.589606);
	this.zoomFactor = 16;
	
}

	
CloseUp.prototype = new Task();
function CloseUp(taskUserId, taskId){
	this.userId = taskUserId;
	this.number = taskId;
	this.startText = "Bedankt voor je medewerking! <br> Ga terug naar het formulier";
	this.stopText = "Je bent bijna klaar! <br> Ga terug naar het formulier om je mening te geven";
	this.location = new mapboxgl.LngLat(7.305221,53.368559);
	mazorManager.send();
	
}	
	

//Radians
function rad(x) {
  return x * Math.PI / 180;
}

function getRealAngle(x) {

  if ( x<0){
	  return x*-1;
  } else{
	  return 180 + (180 - x);
  }
}