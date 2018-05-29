jQuery.sap.declare('Terumo.Component');
sap.ui.core.UIComponent.extend('Terumo.Component', {
	metadata : {
		// Defines the name and version of the Application
		name : "Demonstarion of Component.js",
		includes:["./css/style.css","./util/formatter.js","./util/iScrooll.js"],
		version : "1.0",
		// Includes array of strings containing path to CSS or JavaScript resources for the Application
		models : {
			
		},
	
routing : {
	config : {
		viewType : "XML",
		viewPath : "Terumo.terumo",//folder path
		targetAggregation : "pages",
		clearTarget : false
	},
	routes : [ {
		pattern : "",
		name : "terumo",
		view : "terumo",
		targetControl : "appId",
		subroutes : [ {
			pattern : "terumoList",
			name : "terumoList",
			view : "terumoList",
			subroutes : [ {
				pattern : "terumoScan",
				name : "terumoScan",
				view : "terumoScan",
					subroutes : [ {
						pattern : "terumoList",
						name : "terumoList",
						view : "terumoList",
					}
					]
			} ]
		},
		
		{
			pattern : "terumoGrid",
			name : "terumoGrid",
			view : "terumoGrid"
		}
		
		
		]
	} ]
}

		
	},

	// Initialization of the component
	init : function() {
		jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
		

		// Used to instantiate the root control
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		// Monkey patch the router
		var router = this.getRouter();
		
		// Initializing the router
		this.routeHandler = new sap.m.routing.RouteMatchedHandler(router);
		router.initialize();
	},
	
	 //Routes are destroyed when we close the application
	destroy : function() {
		if (this.routeHandler) {
			this.routeHandler.destroy();
		}

		sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
	},

	// The UI component needs to return something for the user to see: here we
	// will return App.view
	createContent : function() {
		var oView = sap.ui.view({
			id : "appId",
			viewName : "terumo.App",
			type : "XML",
		});
		parentApp = oView;
		return oView;
	}
})