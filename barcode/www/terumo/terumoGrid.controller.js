sap.ui.controller("terumo.terumoGrid", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf terumo.terumoGrid
	 */
	onInit : function(){
		this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		var that = this;
		this.oRouter.attachRoutePatternMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "terumoGrid") {
				that.getView().setModel(oDefaultDataModel,"oDefaultDataModel");
				if(oDefaultDataModel.getProperty("/setPinVisible") === false){
                            oDefaultDataModel.setProperty("/offlineData", []);
                			}
				var length = oDefaultDataModel.getProperty("/offlineData").length;
               // alert(length);
				if(length === 0){
					oDefaultDataModel.setProperty("/unSyncVisible",false);
				} else{
					oDefaultDataModel.setProperty("/unSyncVisible",true);
				}
			}

		});
	},


	/********************************On Clicking LogOut in the Header *****************************************/

	onLogOut : function(oEvent){
		var that = this;
        		var len = oDefaultDataModel.getProperty("/offlineData").length;
        	//	alert(len);
        		/*if(len >0){
        			oDefaultDataModel.setProperty("/syncMeSignOut",true);
        			oDefaultDataModel.setProperty("/onlySignOut",false);
        		} else {
        			oDefaultDataModel.setProperty("/syncMeSignOut",false);
        			oDefaultDataModel.setProperty("/onlySignOut",true);
        		}*/

        		if(len>0){
        		this.getView().setModel(oDefaultDataModel,"oDefaultDataModel");
                		var offlineVisible = oDefaultDataModel.getProperty("/offlineVisible");
                		if (!this.logOutpopUp) {
                			this.logOutpopUp = sap.ui.xmlfragment("terumo.fragments.logOut", this);
                		}
                		this.getView().addDependent(this.logOutpopUp);
                		this.logOutpopUp.open();
        		} else {
        		this.onOnlySignOut();
                }
	},

	onCloseLogOut : function() {
		this.logOutpopUp.close();
	},

onOnlySignOut : function(){

   // alert(oDefaultDataModel.getProperty("/offlineVisible"));
                    if(oDefaultDataModel.getProperty("/offlineVisible") === true){
                      sap.m.MessageToast.show("No Network Connection", {
                                				});
                                				return;
                    }
	myPin.transaction(function(transaction) {
    			var executeQuery = "DROP TABLE IF EXISTS phonegap_pro";
    			transaction.executeSql(executeQuery, [],
    					function(tx, result) {
    				//alert('Table deleted successfully.');
    			},
    			function(error){
    			//	alert('Error occurred while droping the table.');
    			}
    			);
    		});
    		    var success = function(status) {
    			       // alert('Message: ' + status);
    			    };
    			    var error = function(status) {
    				    //    alert('Error: ' + status);
    				    };
    				    window.CacheClear(success, error);
    				window.cookies.clear(function() {
    					//alert("Cookies cleared!");
    				});
    				oDataModel="";
    				oDefaultDataModel.setData({});
    				oDefaultDataModel.refresh();
    				this.oRouter.navTo("terumo",{});
	},
	/********************************** on Clicking Home Icon to navigate ot list page ***********************/

	onHomeNavigation : function(){
		this.oRouter.navTo("terumoList",{});
	},

	onSyncSignOut : function(){
	//alert(oDefaultDataModel.getProperty("/offlineVisible"));
                    if(oDefaultDataModel.getProperty("/offlineVisible") === true){
                      sap.m.MessageToast.show("No Network Connection", {
                                				});
                                				return;
                    }
		myPin.transaction(function(transaction) {
			var executeQuery = "DROP TABLE IF EXISTS phonegap_pro";
			transaction.executeSql(executeQuery, [],
					function(tx, result) {
				//alert('Table deleted successfully.');
			},
			function(error){
				//alert('Error occurred while droping the table.');
			}
			);
		});
		    var success = function(status) {
			     //   alert('Message: ' + status);
			    };
			    var error = function(status) {
				    //    alert('Error: ' + status);
				    };
				    window.CacheClear(success, error);
				window.cookies.clear(function() {
					//alert("Cookies cleared!");
				});
				/*this.onSync();*/
				this.onCloseLogOut();
				oDataModel="";
				oDefaultDataModel.setData({});
				oDefaultDataModel.refresh();
                this.oRouter.navTo("terumo",{});

	},

	onSync : function(){
		var that = this;
		var syncToBeData = oDefaultDataModel.getProperty("/offlineData");
		var dataLength = syncToBeData.length;
		oDefaultDataModel.setProperty("/offlineDataLength",dataLength);
		if (dataLength > 0) {
			var oRequestData = {
					"Werks":syncToBeData.Werks,
					"ToMovementItem":[]
			}
			var obj={};
			for(var i=0;i<syncToBeData.length;i++){
				var reprocessData = syncToBeData[i];
				obj={
						"Matnr":reprocessData.MaterialNumber,
						// materialNumber after scanning
						"Werks":reprocessData.Plant,
						//"Errorid":syncToBeData.ErrorId,
						"Menge": reprocessData.Quantity, // quantity
						"Lgort":reprocessData.StorageLocation,
						"Charg":reprocessData.Batch,
						"Kostl":reprocessData.CostCenter,
						"Lgtyp":reprocessData.StorageType,
						"Lgpla":reprocessData.StorageBin,
						"Bwart":reprocessData.MovementType,
						"Grund":reprocessData.ReasonCode,
						"Meins":oDefaultDataModel.getProperty("/uom"),
						"Bktxt":reprocessData.HeaderText,
						"WarehouseMg":reprocessData.WareHouseManaged,
						"Action":"P"
				}
				oRequestData.ToMovementItem.push(obj);
			}
			oDataModel.create("/MovementHeaderSet",oRequestData, null,
					function(oData,oResponse) {
				oDefaultDataModel.setProperty("/offlineData", [])
				sap.m.MessageToast.show("Sync Successful", {
				});
			},
			function(oEvent){
				console.log(oEvent);
			}
			);
		}
	}
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf terumo.terumoGrid
	 */
//	onBeforeRendering: function() {

//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf terumo.terumoGrid
	 */
//	onAfterRendering: function() {

//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf terumo.terumoGrid
	 */
//	onExit: function() {

//	}

});