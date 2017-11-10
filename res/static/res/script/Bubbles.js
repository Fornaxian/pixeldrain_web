/* Beforehand i'd like to tell you to not forget to add a width and height attribute to the canvas element, this can be styled with css for the prettyness, but to keep the responsiveness a width of 800 is nice with a height of 640 (if you want it to be a landscape styled right now, in any case a rectangle (not a squire) should be have 1 of the 2 attributes 4/5 like 80/100 or 640/800*/

/* Global variables */
var lastUpdate = Date.now();
var myInterval = setInterval(tick, 16.333333333);
var config = {
	images: {
		width: 40, /* The size the image will be scaled to, dont see this as a must, but as a nicer way because you can remove this if you also remove the 2 parameters from the render function */
		height: 60,
	},
	speed: {
		x: 5.6, /* A lil tricky because here we define the speed it travels with, but this can be either negative or postive value, so we determine possibility that on the image creation, by adding a * -1 or * 1 ;3 */
		y: 7 /* Just the speed it travels with vertically, not as tricky as the "x" value */
	}
};

/* Load in items trough ajax call (in case you keep em in a database, if not you can use it like this as well */

var img_format = '.png';  /* Use the format you desire */
var items = {
	add: function (img_source) {
		var img = new Image();
		img.src = 'img_' + this.length + img_format;

		e.direction = Math.random() < 0.5 ? 1 : -1; /* This is used to know if it's going left or right */
		e.curX = Math.random() * canvas.width();
		e.curY = canvas.height();
		this.push(img);
	}
}

items.add('your_image_path_plus_name');
/*_________*/

/* The preffered way */
var items = {};
$.ajax({
	url: 'your_api_call',
	success: function (response) {
		if (typeof {response: 1}) {
			response.forEach(function (element, index, array) {
				items.push(element);
			});

			items.forEach(function (e, i, a) {
				e.direction = Math.random() < 0.5 ? 1 : -1; /* This is used to know if it's going left or right */
				e.curX = Math.random() * canvas.width();
				e.curY = canvas.height();
			});
		}
	}
});

if (items.length === 0) {
	console.log(items);    /* In possible debug scenario that something went wrong with the add function */
	console.log('Perhaps you did something wrong with the add functionality therefor no items are being found');
}

/* Lets get the loop going */
items.forEach(function (e, i, a) { /* You should know by now that e == element, i == index, a == array
 e.start_location = Math.random() * canvas.width(); /* This will add its starter location, this could also be defined in either the image loop or the ajax call, but im lazy and i will not write this shit twice */
});

/* The simplest of simple looping skills */
function tick() {
	var now = Date.now();
	var dt = now - lastUpdate;
	lastUpdate = now;

	update(dt);
	render();
}

function update(dt) {
	/* If game loop does not work, which i guess, take a look at "http://goo.gl/f8sQRD" */
	items.forEach(function (e, i, a) {
		e.curX += config.speed.x;
		e.curY += config.speed.y;

		/* Simple reset the shitty image */
		if ((e.curX > canvas.width()) || (e.curX + config.images.width < 0)) {
			e.curX = Math.random() * canvas.width();
			e.curY = canvas.height();
		}
	});
}

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	/* Render the images based on the updated data in the function "update()" */
	items.forEach(function (e, i, a) {
		ctx.drawImage(e, e.curX + config.speed.x * e.direction, e.curY - config.speed.y, config.image.width, config.images.height); /* this can be either said in update() or in render(), i prefer render, because i allways want to do the moving after the update, which verifies the speed and such please use "http://goo.gl/2HQbFy" for more information*/
	});
	/* get fucked nooblord, just go on with yer life why are you even looking at this if you're not the dev */
}