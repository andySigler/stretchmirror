////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

function Link(which1,which2,restingDist,stiff,tearSensitivity,drawMe){
	this.restingDistance = restingDist;
	this.stiffness = stiff;
	this.tearSensitivity = tearSensitivity;

	this.p1 = which1;
	this.p2 = which2;

	this.drawThis = drawMe;
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

Link.prototype.draw = function(){
	if(this.drawThis || true){
		context.beginPath();
		context.moveTo(this.p1.x,this.p1.y);
		context.lineTo(this.p2.x,this.p2.y);
		context.stroke();
	}
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

Link.prototype.solve = function(){

    // calculate the distance between the two PointMass
    var diffX = this.p1.x - this.p2.x;
    var diffY = this.p1.y - this.p2.y;
    var diffZ = this.p1.z - this.p2.z;
    var temp = Math.sqrt(diffX * diffX + diffY * diffY);
    d = Math.sqrt(temp * temp + diffZ * diffZ);
    
    // find the difference, or the ratio of how far along the restingDistance the actual distance is.
    var difference = (this.restingDistance - d) / d;
    
    // Inverse the mass quantities
    var im1 = 1 / this.p1.mass;
    var im2 = 1 / this.p2.mass;
    var scalarP1 = (im1 / (im1 + im2)) * this.stiffness;
    var scalarP2 = this.stiffness - scalarP1;

    if(this.p1.frozen){
        scalarP1 = 0;
        scalarP2 = this.stiffness - scalarP1;
    }
    if(this.p2.frozen){
        scalarP2 = 0;
    }


    if(scalarP2+scalarP1!==0){
        // Push/pull based on mass
        // heavier objects will be pushed/pulled less than attached light objects
        this.p1.x += diffX * scalarP1 * difference;
        this.p1.y += diffY * scalarP1 * difference;
        this.p1.z += diffZ * scalarP1 * difference;
        
        this.p2.x -= diffX * scalarP2 * difference;
        this.p2.y -= diffY * scalarP2 * difference;
        this.p2.z -= diffZ * scalarP2 * difference;
    }
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////