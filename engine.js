// polish stuff:
// drifting, we need friction
// hitting objects transfers velocity

// save player states so if they can rejoin

// powerup ideas:
// - off-road wheels

// shop
// - $$$
// - cars
	// - modify cars
	// - car parts
	// - colors

// turn direction
// increase acceleration
// drifting

var updateHooks = [];

var ctx;
var screenWidth;
var screenHeight;

var engineGravity = true;

var worldOffset = new Vector2D(0, 0);

var currentCollisionGroupID = 0;

window.addEventListener('load', function() {
	var gameCanvas = document.getElementById('game');
	ctx = gameCanvas.getContext('2d');
	screenWidth = document.body.offsetWidth;
	screenHeight = document.body.offsetHeight;
	gameCanvas.width = screenWidth;
	gameCanvas.height = screenHeight;
	ctx.width = screenWidth;
	ctx.height = screenHeight;
	ctx.fillStyle = "green";
	requestUpdate();
	// update();
});


// ctx.clearRect(10, 10, 50, 50);

// var playerAccelerating = true;
// var player1.car.velocity.x = 0;

// var player1.car.velocity = new Vector2D(0, 0);

// var player1.car.velocity.y = 0;

var animationFrameTimer = 0;

// var targetVelocity = new Vector2D(0, 0);

// var playerX = 50;
// var playerY = -80;
// var player1.car.invincible = false;
// var playerInventory = [];

var gameObjects = [];
var colliders = [];
var checkedCollisions = [];

var remotePlayers = [];

// function Obstacle(x, y, type) {
// 		this.gameObject = new GameObject(x, y, type, this);
// 		this.active = true;
// 		this.visible = true;
// 		this.disappearTimer = false;
// 		this.passedObstacle = false;

// 		obstacles.push(this);
// }

// function PowerUp(x, y, type) {
// 		var me = this;
// 		me.gameObject = new GameObject(x, y, type);
// 		me.active = true;
// 		me.type = type;

// 		powerups.push(me);

// 		me.remove = function() {
// 				var index = powerups.indexOf(me);
// 				powerups.splice(index, 1);
// 				var index = gameObjects.indexOf(me.gameObject);
// 				gameObjects.splice(index, 1);

// 				// me.gameObject.remove();
// 		}
// }


var currentObjectIndex = 0;

function Entity(x, y, w, h, parent, collisionGroupID) {
	var me = this;

	me.index = currentObjectIndex;
	currentObjectIndex += 1;

	me.parent = parent;

	me.collisionGroupID = collisionGroupID;

	// me.x = x;
	// me.y = y;
	me.w = w;
	me.h = h;
	// me.type = type;
	me.fillColor = 'black';

	me.text = false;
	me.position = new Vector2D(x, y);
	me.fixedPosition = false;
	me.positioning = 'default';

	me.grounded = null;
	me.static = false;
	me.kinematic = false;
	me.friction = 0.1;
	me.rotation = 0;
	me.velocity = new Vector2D(0, 0);
	me.acceleration = new Vector2D(0, 0);
	me.speedModifier = 1;

	me.tags = [];
	
	me.active = true;
	me.visible = true;
	me.drawCenter = 'center';

	me.collisionCallbacks = [];

	me.isCollider = true;

	me.opacity = 1;
	// me.animationFrame = 0;

	me.img = document.createElement("img");

	gameObjects.push(this);

	me.enableCollider = function() { // replace with something more complex later
		me.isCollider = true;
		colliders.push(me);
	}

	me.enableCollider();

	me.applyForce = function(vector, deltaTime) {
		me.velocity.add(vector.scale(deltaTime));
	}

	me.applyImpulse = function(directionVector) {
		me.velocity = me.velocity.add(directionVector);
	}

	me.draw = function() {
		if(!me.visible) {
			return false;
		}

		ctx.globalAlpha = me.opacity;

		var drawX = me.position.x;
		var drawY = me.position.y;

		if(me.positioning == 'relative') {
			drawX += me.parent.position.x;

			if(!me.parent.visible) {
				return false;
			}

			if(me.parent.fixedPosition) {
				drawX = 0;
			}

			drawY += me.parent.position.y;

			drawX -= worldOffset.x;
			drawY -= worldOffset.y;
		} else {
			if(me.fixedPosition) {
				drawX = 0;
			} else {
				drawX -= worldOffset.x;
				drawY -= worldOffset.y;
			}
		}

		// ctx.fillStyle = ;
		// ctx.fillRect(drawX, me.y, me.w, me.h);

		ctx.save();

		ctx.translate(0, 0);

		// var healthDecimal = (me.health / me.maxHealth);
		// var maxHealthBarWidth = 120;

		ctx.restore();

		ctx.save();

		var translationX = drawX;
		var translationY = -drawY;
		var drawWidth = me.w;
		var drawHeight = me.h;
		var drawImage = me.img;

		// if(me.type == 'rocket' && me.health <= 0) {
		// 	translationX += explosionRadius;
		// 	translationY += explosionRadius;
		// 	drawWidth += explosionRadius * 2;
		// 	drawHeight += explosionRadius * 2;
		// 	drawImage = rocketExplosionImage;
		// }

		var xOffset = 0;
		var yOffset = 0;

		ctx.translate(translationX, translationY);

		if(me.drawCenter == 'center') {
			// xOffset = -me.w * 0.5;
			// yOffset = -me.h * 0.5;

			ctx.translate(me.w / 2, me.h / 2);
			ctx.rotate(me.rotation);
			ctx.translate(-me.w / 2, -me.h / 2);
		} else {
			ctx.rotate(me.rotation);
		}


		if(me.img.src) {
			ctx.drawImage(drawImage, 0, 0, drawWidth, drawHeight);
		} else if(me.fillColor) {
			ctx.fillStyle = me.fillColor;
			ctx.fillRect(0, 0, drawWidth, drawHeight);
		}

		// ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
		// ctx.fillRect(0, 0, drawWidth, drawHeight);

		if(me.text) {
			ctx.fillText(me.text, 0, 0);
		}

		ctx.restore();

		ctx.globalAlpha = 1;
	}

	me.remove = function() {
		gameObjects.splice(gameObjects.indexOf(me), 1);

		if(me.isCollider) {
			colliders.splice(colliders.indexOf(me), 1);
		}
	}
}

function Vector2D(x, y) {
	var me = this;
	me.x = x;
	me.y = y;

	me.add = function(vector) {
		var xSum = me.x + vector.x;
		var ySum = me.y + vector.y;
		return new Vector2D(xSum, ySum);
	}

	me.subtract = function(vector) {
		var xDifference = me.x - vector.x;
		var yDifference = me.y - vector.y;
		return new Vector2D(xDifference, yDifference);
	}

	me.multiply = function(vector) {
		var xProduct = me.x * vector.x;
		var yProduct = me.y * vector.y;
		return new Vector2D(xProduct, yProduct);
	}

	me.divide = function(vector) {
		var xQuotient = me.x / vector.x;
		var yQuotient = me.y / vector.y;
		return new Vector2D(xQuotient, yQuotient);

	}

	// me.scale = function(integer) {
	// 	return new Vector2D(me.x * integer, me.y * integer);
	// }

	me.magnitude = function() {
		return Math.sqrt(me.x * me.x + me.y * me.y);
	}

	me.normalize = function() {
		if (me.x == 0 && me.y == 0) {
			return new Vector2D(0, 0);
		}

		var magnitude = me.magnitude();
		var returnVector = new Vector2D(me.x / magnitude, me.y / magnitude);

		// var returnVector = new Vector2D(me.x, me.y);
		// var minimum = Math.min.apply(Math, [returnVector.x, returnVector.y]);
		// returnVector.x -= minimum;
		// returnVector.y -= minimum;
		// var maximum = Math.max.apply(Math, [me.x, me.y])
		// returnVector.x /= maximum - minimum;
		// returnVector.y /= maximum - minimum;

		return returnVector;

		// if(me.x > me.y) {
		//   return me.scale(1/me.x);
		// } else if(me.x < me.y) {
		//   return me.scale(1/me.y);
		// } else if(me.x == 0) {
		//   return new Vector2D(0, 0);
		// } else {
		//   return new Vector2D(1, 1);
		// }


	}

	me.scale = function(xInteger, yInteger) {
		if (!yInteger) {
			yInteger = xInteger;
		}

		var xScaled = me.x * xInteger;
		var yScaled = me.y * yInteger;
		return new Vector2D(xScaled, yScaled);
	}
}

function checkCollision(gameObjectA, gameObjectB, objectAPadding) {
	if(!objectAPadding) objectAPadding = 0;

	var baseXA = gameObjectA.position.x;
	var baseYA = gameObjectA.position.y;
	var baseXB = gameObjectB.position.x;
	var baseYB = gameObjectB.position.y;

	var targetObject = gameObjectA;
	while(targetObject.parent != null) {
		baseXA += targetObject.parent.position.x;
		baseYA += targetObject.parent.position.y;
		targetObject = targetObject.parent;
	}

	var targetObject = gameObjectB;
	while(targetObject.parent != null) {
		baseXB += targetObject.parent.position.x;
		baseYB += targetObject.parent.position.y;
		targetObject = targetObject.parent;
	}

	var leftXA = baseXA - objectAPadding;
	var rightXA = baseXA + gameObjectA.w + objectAPadding;
	var topYA = baseYA + objectAPadding;
	var bottomYA = baseYA - gameObjectA.h - objectAPadding;

	var leftXB = baseXB;
	var rightXB = baseXB + gameObjectB.w;
	var topYB = baseYB;
	var bottomYB = baseYB - gameObjectB.h;

	if (
		bottomYA < topYB &&
		rightXA > leftXB &&
		topYA > bottomYB &&
		leftXA < rightXB
	) {
		var distanceToLeft = leftXB - rightXA;
		var distanceToRight = leftXA - rightXB;
		var distanceToTop = topYB - bottomYA;
		var distanceToBottom = bottomYB - topYA;

		var xSide;
		var shortestX;
		var ySide;
		var shortestY;

		if (distanceToRight < distanceToLeft) {
			xSide = 'right';
			shortestX = distanceToRight;
		} else {
			xSide = 'left';
			shortestX = distanceToLeft;
		}

		if (distanceToTop < distanceToBottom) {
			ySide = 'top';
			shortestY = distanceToTop;
		} else {
			ySide = 'bottom';
			shortestY = distanceToBottom;
		}

		if (shortestX < shortestY) {
			return xSide;
		} else {
			return ySide;
		}

	} else {
		return false;
	}
}

var keyCodes = {
	87: 'W',
	// 'w': 87,
	83: 'S',
	// 's': 83,
	65: 'A',
	68: 'D',
	69: 'E',
	32: 'SPACEBAR',
	81: 'Q',
	80: 'P'
};

var keyDownCallbacks = {
};

var keyUpCallbacks = {
};

var keyHoldCallbacks = {
};

var heldKeys = [];

for(var codeIndex in keyCodes) {
	var value = keyCodes[codeIndex];
	keyDownCallbacks[value] = [];
	keyUpCallbacks[value] = [];
	keyHoldCallbacks[value] = [];
}

window.addEventListener('keydown', getKeyDown);
function getKeyDown(event) {
	var character = keyCodes[event.keyCode];

	if(keyCodes[event.keyCode] == null) {
		return false;
	}

	if(heldKeys.indexOf(character) == -1) {
		heldKeys.push(character);
	}

	for (var callbackIndex = 0; callbackIndex < keyDownCallbacks[character].length; callbackIndex++) {
		var callback = keyDownCallbacks[character][callbackIndex];
		callback();
	}
}

window.addEventListener('keyup', getKeyUp);
function getKeyUp(event) {
	var character = keyCodes[event.keyCode];

	heldKeys.splice(heldKeys.indexOf(character), 1);

	if(keyCodes[event.keyCode] == null) {
		return false;
	}

	for (var callbackIndex = 0; callbackIndex < keyUpCallbacks[character].length; callbackIndex++) {
		var callback = keyUpCallbacks[character][callbackIndex];
		callback();
	}
}

var updating = false;

function requestUpdate() {
	if (!updating) {
		updating = true;
		window.requestAnimationFrame(engineTick);
	} else {

	}

	setTimeout(requestUpdate, 0); /// optimize
}

var lastUpdateMS = 0;

function engineTick(milliseconds) {
	var msElapsed = milliseconds - lastUpdateMS;
	var deltaTime = msElapsed / 1000;

	// updateServer();

	ctx.clearRect(0, 0, screenWidth, screenHeight);

	for (var hookIndex = 0; hookIndex < updateHooks.length; hookIndex++) {
		var eachFunction = updateHooks[hookIndex];
		eachFunction(deltaTime);
	};

	for (var keyIndex = 0; keyIndex < heldKeys.length; keyIndex++) {
		var heldKey = heldKeys[keyIndex];
		for (var callbackIndex = 0; callbackIndex < keyHoldCallbacks[heldKey].length; callbackIndex++) {
			var keyHoldCallback = keyHoldCallbacks[heldKey][callbackIndex];
			keyHoldCallback();
		};
	};

	// document.body.style.backgroundPosition = -1 * player1.car.position.x + 'px' + ' 0';

	for (var gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
		var currentObject = gameObjects[gameObjectIndex];

		var positionChange = currentObject.velocity.scale(deltaTime);
		currentObject.position = currentObject.position.add(positionChange);

		if(!currentObject.active) continue;

		if(engineGravity == true) {
			if(currentObject.static == false && currentObject.kinematic == false && currentObject.grounded == null) {
				currentObject.velocity.y -= 5;
			}
		}

		if (currentObject.friction > 0 && currentObject.grounded != null) {
			currentObject.velocity = currentObject.velocity.scale(1 - currentObject.friction);
			if(currentObject.velocity.magnitude() < 0.2) {
				currentObject.velocity.x = 0;
				currentObject.velocity.y = 0;
			}
			// currentObject.position = currentObject.position.add(currentObject.velocity.scale(deltaTime));
		}

		var hittingStatic = false;

		if (currentObject.isCollider) {
			// if(currentObject.type == 'rocketLauncher' && !test) {
			// 	console.log('rere');
			// 	test = true;
			// }

			for (var colliderIndex = 0; colliderIndex < colliders.length; colliderIndex++) {
				var collider = colliders[colliderIndex];

				if (collider == currentObject || (
						currentObject.collisionGroupID != null
						&& currentObject.collisionGroupID == collider.collisionGroupID)
				) {
					continue;
				}

				// if(collider.index == currentObject.index) {
				// 	continue;
				// }

				// have we checked this collision yet?
				// checkedCollisions

				var collisionCheckString = currentObject.index + '-' + collider.index;
				if(checkedCollisions.indexOf(collisionCheckString) != -1) {
					continue;
				}

				var check = checkCollision(currentObject, collider);
				checkedCollisions.push(collisionCheckString);

				if (check) {
					if(collider.static) {
						currentObject.grounded = collider;
						hittingStatic = true;
						currentObject.position.y = collider.position.y + currentObject.h;
					}

					/// make sure side is opposite for collider:
					for(var callbackIndex = collider.collisionCallbacks.length - 1; callbackIndex >= 0; callbackIndex--) {
						collider.collisionCallbacks[callbackIndex](currentObject, check);
					}

					for(var callbackIndex = currentObject.collisionCallbacks.length - 1; callbackIndex >= 0; callbackIndex--) {
						currentObject.collisionCallbacks[callbackIndex](collider, check);
					}
				}
			};
		}

		if(!hittingStatic) {
			if(currentObject.grounded != null) {
				var feetPosition = currentObject.position.subtract(new Vector2D(0, currentObject.h));
				var differenceVector = currentObject.grounded.position.subtract(feetPosition);
				if(differenceVector.magnitude() > 1) {
					currentObject.grounded = null;
				}
			}
		}

		currentObject.draw();

		if (animationFrameTimer > 10) {
			animationFrameTimer = 0;
		}

		checkedCollisions = [];
		lastUpdateMS = milliseconds;
		updating = false;
	}
}