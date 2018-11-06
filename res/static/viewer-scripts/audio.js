/* global ListNavigator */

$("#audioPlayer").bind("ended", function(){
	ListNavigator.nextItem();
});