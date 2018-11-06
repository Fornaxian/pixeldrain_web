var Sharebar = {
	visible: false,
	
	toggle: function(){
		if (!Toolbar.visible){
			Toolbar.toggle();
		}
		
		if(this.visible){
			$("#sharebar").animate({left: "-112"}, 600);
			$("#btnShare").removeClass("button_highlight");

			this.visible = false;
		}else{
			$("#sharebar").animate({left: "120"}, 400);
			$("#btnShare").addClass("button_highlight");

			this.visible = true;
		}
	}
};