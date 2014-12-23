////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

function PointMass(xPos,yPos,zPos){
	this.x = xPos ? xPos : 0;
	this.y = yPos ? yPos : 0;
	this.z = zPos ? zPos : 0;
	this.lastX = this.x;
	this.lastY = this.y;
	this.lastZ = this.z;

	this.accX = 0;
	this.accY = 0;
	this.accZ = 0;

	this.mass = 1;

	this.velocityDampening = .9;

	this.links = [];

	this.grabbed = false;

	this.grabX = 0;
	this.grabY = 0;
	this.grabZ = 0;

	this.frozenX = 0;
	this.frozenY = 0;
	this.frozenZ = 0;

	this.frozen = false;

	this.pinned = false;
	this.pinX, this.pinY, this.pinZ;

	this.color = 'rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')';
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.draw = function(){
	var len = this.links.length;
	if(len>0){
		for(var i=0;i<len;i++){
			this.links[i].draw();
		}
	}
	else{
		// context.arc(this.x, this.y, 3, 0, 2 * Math.PI, false);
		// context.stroke();
		// context.fill();
	}
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.updateInteractions = function(){
	if(!this.grabbed){
		var distanceSquared = distPointToSegmentSquared(mouse.prevX,mouse.prevY,mouse.x,mouse.y,this.x,this.y);
	    if (distanceSquared < mouse.influenceSize) { // remember mouseInfluenceSize was squared in setup()
	      // To change the velocity of our PointMass, we subtract that change from the lastPosition.
	      // When the physics gets integrated (see updatePhysics()), the change is calculated
	      // Here, the velocity is set equal to the cursor's velocity
	      this.lastX = this.x - (mouse.x-mouse.prevX)*mouse.influenceScalar;
	      this.lastY = this.y - (mouse.y-mouse.prevY)*mouse.influenceScalar;
	    }
	}
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.updatePhysics = function(timeStep){
	// add gravity
	//this.applyForce(0,this.mass*gravity);

	if(!this.frozen){

		var velX = this.x - this.lastX;
	    var velY = this.y - this.lastY;
	    var velZ = this.z - this.lastZ;
	    
	    // dampen velocity
	    velX *= this.velocityDampening;
	    velY *= this.velocityDampening;
	    velZ *= this.velocityDampening;

	    var timeStepSq = timeStep * timeStep;
	    
	    // calculate the next position using Verlet Integration
	    var nextX = this.x + velX + 0.5 * this.accX * timeStepSq;
	    var nextY = this.y + velY + 0.5 * this.accY * timeStepSq;
	    var nextZ = this.z + velZ + 0.5 * this.accZ * timeStepSq;

		if(this.grabbed){
			nextX = mouse.x;
			nextY = mouse.y;
			nextZ = this.grabZ; // push it forward when grabbed
		}
	    
	    // reset variables
	    this.lastX = this.x;
	    this.lastY = this.y;
	    this.lastZ = this.z;
	    
	    this.x = nextX;
	    this.y = nextY;
	    this.z = nextZ;
	    
	    this.accX = 0;
	    this.accY = 0;
	    this.accZ = 0;
	}
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.solveConstraints = function(){
	// the links make sure PointMasses connected to this one
	// are at a set distance away
	var len = this.links.length;
	for(var i=0;i<len;i++){
		this.links[i].solve();
	}

	// keep it on the screen
	// if(this.x<0){
	// 	this.x *= -1;
	// }
	// else if(this.x>=theWidth){
	// 	this.x = 2*(theWidth-1)-this.x;
	// }
	// if(this.y<0){
	// 	this.y *= -1;
	// }
	// else if(this.y>=theHeight){
	// 	this.y = 2*(theHeight-1)-this.y;
	// }
	if(this.z<-100){
		this.z = -100;
	}
	else if(this.z>=100){
		this.z = 2*(100-1)-this.y;
	}

	// keep it still if it's pinned down
	if(this.pinned && !this.grabbed){
		if(!this.frozen){
			this.x = this.pinX;
			this.y = this.pinY;
			this.z = this.pinZ;
		}
		else{
			this.x = this.frozenX;
			this.y = this.frozenY;
			this.z = this.frozenZ;
		}
	}
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.attachTo = function(p,restingDist,stiff,tearSensitivity,drawLink){
	if(tearSensitivity===true || tearSensitivity===false){
		drawLink = tearSensitivity;
		tearSensitivity = 30;
	}
	else if(tearSensitivity===undefined){
		tearSensitivity = 30;
	}
	if(drawLink===undefined){
		drawLink = true;
	}

	var tempLink = new Link(this,p,restingDist,stiff,tearSensitivity,drawLink);
	this.links.push(tempLink);
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.removeLink = function(link){
	var length  = this.links.length;
	for(var i=0;i<length;i++){
		if(this.links[i]===link){
			this.links.splice(i,1);
			break;
		}
	}
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.applyForce = function(xf,yf,zf){
	// acceleration = force / mass
	this.accX += xf/this.mass;
	this.accY += yf/this.mass;
	this.accZ += zf/this.mass;
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.pinTo = function(px,py,pz){
	this.pinned = true;
	this.mass = 10;
	this.pinX = px;
	this.pinY = py;
	this.pinZ = pz;
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.grab = function(grabCounter){
	this.grabbed = true;
	this.frozen = false;
	this.mass = 2000;
	this.grabX = this.x-mouse.x;
	this.grabY = this.y-mouse.y;
	this.grabZ = grabCounter;
	if(this.grabZ>=100){
		this.grabZ = 99;
	}
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

PointMass.prototype.letGo = function(shouldPin){
	this.mass = 1;
	this.grabbed = false;
	this.frozen = true;
	this.frozenX = this.x;
	this.frozenY = this.y;
	this.frozenZ = this.z;

	if(shouldPin){
		this.pinned = true;
	}
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

// Using http://www.codeguru.com/forum/showpost.php?p=1913101&postcount=16
// We use this to have consistent interaction
// so if the cursor is moving fast, it won't interact only in spots where the applet registers it at
function distPointToSegmentSquared(lineX1,lineY1,lineX2,lineY2,pointX,pointY){
	var vx = lineX1 - pointX;
	var vy = lineY1 - pointY;
	var ux = lineX2 - lineX1;
	var uy = lineY2 - lineY1;

	var len = ux*ux + uy*uy;
	var det = (-vx*ux) + (-vy*uy);
	if( det<0 || det>len ){
		ux = lineX2 - pointX;
		uy = lineY2 - pointY;
		return Math.min( (vx*vx)+(vy*vy) , (ux*ux)+(uy*uy) );
	}

	det = ux*vy - uy*vx;
	return (det*det) / len;
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////