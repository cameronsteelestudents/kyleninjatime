// PARALLAX

var playerSpeed = 50;
var maxSpeed = 200;
var lives = 3;
var coins = 0;
var facing = 0;

var grapplingReady = true;
var grapplingHooked = false;

var currentMouseX = 0;
var currentMouseY = 0;

var shurikens = [];

window.addEventListener('load', function() {
	initialize();
});

var grapplingHook;
var player;
function initialize() {
	player = new DamageableObject(0, 0, 'ninja', 50, 50);
	player.img.src = 'images/ninja0.png';

	grapplingHook = new GameObject(player.position.x, player.position.y, 20, 20);
	grapplingHook.img.src = 'images/grapplingHook.png';
	grapplingHook.active = false;
	grapplingHook.collisionCallbacks.push(function(gameObject, side) {
		if(gameObject.static) {
			// grapplingHook.kinematic = true;
			grapplingHook.velocity = new Vector2D(0, 0);
			grapplingHooked = true;
		}

		if(gameObject == player) {
			if(grapplingHooked) {
				grapplingHook.active = false;
				grapplingReady = true;
				grapplingHooked = false;
			}
		}
	});

	var boulder = new DamageableObject(450, 0, 'boulder', 250, 25);
	// var boulder = new DamageableObject(499, 0, 25, 25, 'boulder');

	var wolf = new Enemy(500, -200, 'wolf');

	var spike = new Obstacle(300, 0, 'spike');

	window.addEventListener('mousemove', function(event) {
		currentMouseX = event.clientX + player.position.x - (screenWidth / 2);
		currentMouseY = -event.clientY + player.position.y + (screenHeight / 2);
	});

	keyHoldCallbacks['A'].push(function() {
		if(player.velocity.x > -maxSpeed) {
			player.velocity.x += -playerSpeed;
		}

		facing = -1;
	});

	keyHoldCallbacks['D'].push(function() {
		if(player.velocity.x < maxSpeed) {
			player.velocity.x += playerSpeed;
		}

		facing = 1;
	});

	keyDownCallbacks['W'].push(function() {
		if(player.grounded) {
			player.position.y += 5;
			player.velocity.y = 300;
		}
	});

	keyDownCallbacks['Q'].push(function() {
		if(grapplingReady) {
			grapplingHook.position = new Vector2D(player.position.x, player.position.y);
			grapplingHook.active = true;
			var mousePosition = new Vector2D(currentMouseX, currentMouseY);
			var differenceVector = mousePosition.subtract(grapplingHook.position);
			differenceVector = differenceVector.normalize();
			differenceVector = differenceVector.scale(300);
			grapplingHook.velocity = differenceVector;
			grapplingReady = false;
		}

	});

	keyHoldCallbacks['E'].push(function() {
		if(grapplingHooked) {
			var differenceVector = grapplingHook.position.subtract(player.position);
			differenceVector = differenceVector.normalize();
			differenceVector = differenceVector.scale(10);
			player.velocity = player.velocity.add(differenceVector);
			// player.velocity = differenceVector;
		}
	});

	keyDownCallbacks['SPACEBAR'].push(function() {
		var shuriken = new GameObject(player.position.x, player.position.y,  25, 25);
		shuriken.img.src = 'images/shuriken.png';
		// shuriken.

		var mousePosition = new Vector2D(currentMouseX, currentMouseY);
		var differenceVector = mousePosition.subtract(player.position);
		differenceVector = differenceVector.normalize();
		differenceVector = differenceVector.scale(300);
		shuriken.velocity = shuriken.velocity.add(player.velocity);
		shuriken.velocity = shuriken.velocity.add(differenceVector);
		shuriken.friction = 1;
		shuriken.tags.push('shuriken');
		shuriken.tags.push('active');

		shuriken.collisionCallbacks.push(function(gameObject, side) {
			if(shuriken.tags.indexOf('active') != -1) {
				if(gameObject != player) {
					if(gameObject.tags.indexOf('damageable') != -1) {
						gameObject.changeHealth(-10);
						shuriken.velocity = new Vector2D(0, 0);
						shuriken.kinematic = true;
						shuriken.positioning = 'relative';
						shuriken.parent = gameObject;

						var differenceVector = shuriken.position.subtract(gameObject.position);
						shuriken.position = differenceVector;
					}

					if(gameObject.tags.indexOf('shuriken') == -1) {
						shuriken.tags.splice(shuriken.tags.indexOf('active'), 1);
					}
				}

			}
		});

		shuriken.drawCenter = 'center';
		shurikens.push(shuriken);
	});

	// player.collisionCallbacks.push(function(collider) {
	// 	if(collider.static) {
	// 		player.velocity.y = 0;
	// 	}
	// });

	// var test = new GameObject(10, -100, 10, 10);
	// test.fillColor = 'red';

	// var test = new GameObject(100, -150, 10, 10);
	// test.fillColor = 'red';

	// var ground = new GameObject(0, -400, 1000, 10);
	// ground.fillColor = 'black';
	// ground.static = true;
}

generateLevel(10000, 'normal', 'mountainous');

function generateLevel(levelSize, difficulty, type) {
	var mappedLength = 0;
	var lastY = -600;

	var maxYDiff = 20;

	if(type == 'mountainous') {
		maxYDiff = 100;
	}

	while(mappedLength < levelSize) {
		var randomWidth = Math.floor(Math.random() * 500);
		var newY = lastY + ((Math.random() * maxYDiff) - (maxYDiff/2));
		var ground = new GameObject(mappedLength, newY, randomWidth, 25);
		lastY = newY;

		if(Math.random() > 0.5) {
			new Obstacle(levelSize * Math.random(), 500, 'spike');
		} else {
			new Enemy(levelSize * Math.random(), 500, 'wolf');
		}

		mappedLength += randomWidth;
		// var ground = new GameObject(mappedLength, -300 - (Math.random() * 100), randomWidth, 25);
		ground.fillColor = 'black';
		ground.static = true;
	}

	var objectCount = 20;
	while(objectCount > 0) {

		objectCount--;
	}
}

function gameUpdate() {
	ctx.font = '30px Arial';
	ctx.fillStyle = 'red';
	ctx.fillText('lives: ' + lives, 10, 30);

	worldOffset = player.position.add(new Vector2D(-screenWidth / 2, screenHeight / 2));

	if(player.position.y <= -1000) {
		loseLife();
	}

	for (var shurikenIndex = 0; shurikenIndex < shurikens.length; shurikenIndex++) {
		var shuriken = shurikens[shurikenIndex];

		if(shuriken.tags.indexOf('active') != -1) {
			shuriken.rotation += 0.1;
		}
	};

	for (var objectIndex = 0; objectIndex < gameObjects.length; objectIndex++) {
		var gameObject = gameObjects[objectIndex];
		if(gameObject.tags.indexOf('enemy') != -1) {
			gameObject.think();
		}
	};
}

function Enemy(x, y, type) {
	DamageableObject.call(this, x, y, 'boulder', 50, 50);

	var me = this;

	me.speed = 200;

	var visionRadius = 300;

	me.tags.push('enemy');

	var xDirection = 0;

	me.think = function() {
		if(type == 'wolf') {
			if(me.grounded) {
				var differenceVector = me.position.subtract(player.position);
				var distance = differenceVector.magnitude();

				// if(distance < visionRadius && playerNinjaStealthIsNotActive) {
				if(distance < visionRadius) {
					if(player.position.x < me.position.x) {
						xDirection = -1;
					} else if(player.position.x > me.position.x) {
						xDirection = 1;
					} else {
						xDirection = 0;
					}

					me.velocity.x = xDirection * me.speed;

					for (var gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
						/// point of optimization
						var gameObject = gameObjects[gameObjectIndex];
						if(gameObject.tags.indexOf('spike') != -1) {
							var differenceVector = gameObject.position.subtract(me.position);
							if(xDirection < 0 && differenceVector.x < 0 || xDirection > 0 && differenceVector.x > 0) {
								// jump over
								if(differenceVector.magnitude() < 100) {
									me.velocity.y = 240;
								}
							}
						}
					};
				} else {
					// idle activity
				}
			}
		}
	}

	me.collisionCallbacks.push(function(collider, side) {
		if(collider == player) {
			player.changeHealth(-10);

			var differenceVector = player.position.subtract(me.position);
			differenceVector = differenceVector.normalize();
			differenceVector = differenceVector.scale(500);
			player.position.y += 5;
			player.velocity = player.velocity.add(differenceVector);

			if(player.health <= 0) {
				loseLife();
			}

			if(side == 'top') {
				me.remove();
			} else {
			}
		}
	});
}

function Obstacle(x, y, type) {

	var w = 10;
	var h = 10;
	if(type == 'spike') {
		w = 20;
		h = 50;
	}

	Entity.call(this, x, y, w, h);

	var me = this;


	if(type == 'spike') {
		me.tags.push('spike');
		me.img.src = 'images/spike.png';
		me.collisionCallbacks.push(function(gameObject, side) {
			if(gameObject.tags.indexOf('damageable') != -1) {
				gameObject.changeHealth(-1);
				var differenceVector = gameObject.position.subtract(me.position);
				differenceVector = differenceVector.normalize();
				differenceVector = differenceVector.scale(200);
				differenceVector.y += 10;
				gameObject.grounded = null;
				gameObject.velocity = gameObject.velocity.add(differenceVector);
			}
		});
	}
}

function DamageableObject(x, y, type, w, h) {
	var me = this;

	if(!w) {
		switch(type) {
			case 'superman': {
				w = 50;
			} break;


		}
	}

	if(!h) {
		switch(type) {
			case 'superman': {
				h = 50;
			} break;

			
		}
	}

	GameObject.call(this, x, y, w, h);

	me.tags.push('damageable');

	me.health = 100;
	me.maxHealth = 100;

	me.healthbar = new GameObject(0, 20, w, 10);
	me.healthbar.fillColor = 'green';
	me.healthbar.positioning = 'relative';
	me.healthbar.parent = me;
	// me.healthbar.static = true;

	me.setHealth = function(value) {
		me.health = value;
		var decimal = me.health / me.maxHealth;
		me.healthbar.w = me.w * decimal;
	}

	me.changeHealth = function(amount) {
		me.health += amount;
		var decimal = me.health / me.maxHealth;
		me.healthbar.w = me.w * decimal;

		if(me.health <= 0) {
			if(me != player) {
				me.remove();
			}

			if(me.tags.indexOf('enemy') != -1) {
				if(Math.random() > 0) {
					var coin = new GameObject(me.position.x, me.position.y, 15, 15);
					coin.fillColor = 'yellow';
					coin.collisionCallbacks.push(function(gameObject) {
						if(gameObject == player) {
							coins++;
							coin.remove();
						}
					})
				}
			}
		}
	}
}

function GameObject(x, y, w, h, parent, collisionGroupID) {
	Entity.call(this, x, y, w, h, parent, collisionGroupID);

	var me = this;

	me.collisionCallbacks.push(function(collider) {
		if(collider.static) {
			me.velocity.y = 0;
		}
	});
}

function loseLife() {
	lives--;
	player.position = new Vector2D(0, 0);
	player.velocity = new Vector2D(0, 0);

	if(lives == 0) {
		console.log('test');
		player.remove();
	} else {
		player.setHealth(player.maxHealth);
	}
}

updateHooks.push(gameUpdate);
