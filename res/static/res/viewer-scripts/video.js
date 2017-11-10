/* global ListNavigator */

$("#videoPlayer").bind("ended", function(){
	ListNavigator.nextItem();
});