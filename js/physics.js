////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

function Physics(){
	var d = new Date();
	this.currentTime = d.getTime();
	this.previousTime = this.currentTime;

	this.fixedDeltaTime = 16; // milliseconds
	this.fixedDeltaTimeSeconds = this.fixedDeltaTime/1000;

	this.leftOverDeltaTime = 0;
	this.constraintAccuracy = 3; // how many times we loop over
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////

Physics.prototype.update = function(){
	var d = new Date();
	this.currentTime = d.getTime();
	var deltaTimeMS = this.currentTime - this.previousTime;

	this.previousTime = this.currentTime;

	//break up the elapsed time into managable chunks
	var timeStepAmt = Math.floor((deltaTimeMS+this.leftOverDeltaTime)/this.fixedDeltaTime);
	timeStepAmt = Math.min(timeStepAmt,5); // limit it to prevent freezing

	// store leftover time for the next frame
	this.leftOverDeltaTime = Math.floor(deltaTimeMS - (timeStepAmt*this.fixedDeltaTime));

	mouse.influenceScalar = 1 / timeStepAmt;

	var totalPointMasses = pointMasses.length;

	for(var iterations=0;iterations<timeStepAmt;iterations++){
		// solve the constraints multiple times, for accuracy
		for(var x=0;x<this.constraintAccuracy;x++){
			for(var i=0;i<totalPointMasses;i++){
				pointMasses[i].solveConstraints();
			}
		}

		//update each points position
		for(var n=0;n<totalPointMasses;n++){
			//pointMasses[n].updateInteractions();
			pointMasses[n].updatePhysics(this.fixedDeltaTimeSeconds);
		}
	}
}

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////