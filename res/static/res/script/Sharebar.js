/* 
 * Time for a more Java-like approach.
 *  - Fornax
 *  
 *  Feel free to use this of course
 */

/* global Toolbar */

var Sharebar = {
	visible: false,
	
	toggle: function(){
		if (!Toolbar.visible){
			Toolbar.toggle();
		}
		
		if(this.visible){
			$("#sharebar").animate({left: "-102"}, 600);

			this.visible = false;
		}else{
			$("#sharebar").animate({left: "120"}, 400);

			this.visible = true;
		}
	}
};