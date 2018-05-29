sap.ui.controller("terumo.terumoList", {

	onInit: function() {
		var that = this;
		this.busy = new sap.m.BusyDialog();
		this.getView().setModel(oDefaultDataModel, "oDefaultDataModel");
		/*oDataModel.setCountSupported(false);*/
		oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oDataModel.oHeaders["X-CSRF-token"]="Fetch";
		var oListModel =  new sap.ui.model.json.JSONModel();
		this.getView().setModel(oListModel, "oListModel");
		var oExceptionModel =  new sap.ui.model.json.JSONModel();
		this.getView().setModel(oExceptionModel, "oExceptionModel");
		var oMaterialModel =  new sap.ui.model.json.JSONModel();
		this.getView().setModel(oMaterialModel, "oMaterialModel");
		var oEmptyBinModel =  new sap.ui.model.json.JSONModel();
		this.getView().setModel(oEmptyBinModel, "oEmptyBinModel");
		this.onExceptionLoad();
		this.onPlantVariantLoad();
		this.onStorage();
		this.getView().byId("idExceptionContent").setVisible(false);
		this.getView().byId("idContentMiddleException").setVisible(false);
		this.getView().byId("idReprocessButton").setVisible(false);
		/*var length = oDefaultDataModel.getProperty("/offlineData").length;
		var oRole = oDefaultDataModel.getProperty("/EUserType");
		if(oRole === "R"){
			this.getView().byId("idLov").setVisible(true);
			this.getView().byId("idExp").setVisible(false);
		} else {
			this.getView().byId("idLov").setVisible(true);
			this.getView().byId("idExp").setVisible(true);
		}
		if(length === 0){
			oDefaultDataModel.setProperty("/unSyncVisible",false);
		} else{
			oDefaultDataModel.setProperty("/unSyncVisible",true);
		}
		this.onExceptionLoad();

		this.onPlantVariantLoad();

		this.onStorage();
		this.getView().byId("idExceptionContent").setVisible(false);
		this.getView().byId("idContentMiddleException").setVisible(false);
		this.getView().byId("idReprocessButton").setVisible(false)*/

		var networkState = navigator.connection && navigator.connection.type;
		var states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.NONE]     = 'No network connection';

		//                    alert('Connection type: ' + states[networkState]);

		var networkType = states[networkState];
		if(networkType === "No network connection"){
			this.getView().byId("idBar").addStyleClass("inctureMDBarOfflineClass");
			//this.getView().byId("idContentMiddle").addStyleClass("contentMiddleClass");
			//this.getView().byId("idContentMiddle").addStyleClass("contentMiddleOfflineClass");
			this.getView().byId("idContentMiddleException").addStyleClass("contentMiddleClass");
			//this.getView().byId("idAdminUser").addStyleClass("iconTabBarClass");
			//this.getView().byId("idredOffline").addStyleClass("offlineBelowHeaderClass");
			var offlineVisible = oDefaultDataModel.getProperty("/offlineVisible")
			//this.getView().byId("idredOffline").setVisible(offlineVisible);
			//this.getView().byId("idPage").addStyleClass("iconTabOffline");
		} else {
			//inctureMDBarOfflineClass
			this.getView().byId("idBar").addStyleClass("inctureMDBarClass");
			//this.getView().byId("idContentMiddle").addStyleClass("contentMiddleClass");
			this.getView().byId("idContentMiddleException").addStyleClass("contentMiddleClass");
			//this.getView().byId("idAdminUser").addStyleClass("iconTabBarOfflineClass");
			//this.getView().byId("idContentMiddle").addStyleClass("contentMiddleOfflineClass");
			//this.getView().byId("idPage").addStyleClass("iconTab");

			//this.getView().byId("idredOffline").addStyleClass("offlineBelowHeaderOnlineClass");
			var offlineVisible = oDefaultDataModel.getProperty("/offlineVisible")
			//this.getView().byId("idredOffline").setVisible(offlineVisible);
		}



		this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		this.oRouter.attachRoutePatternMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "terumoList") {

				var oRole = oDefaultDataModel.getProperty("/EUserType");
				if(oRole === "R"){
					that.getView().byId("idLov").setVisible(true);
					that.getView().byId("idExp").setVisible(false);
				} else {
					that.getView().byId("idLov").setVisible(true);
					that.getView().byId("idExp").setVisible(true);
				}
				if(oDefaultDataModel.getProperty("/setPinVisible") === false){
					oDefaultDataModel.setProperty("/offlineData", []);
					var length = oDefaultDataModel.getProperty("/offlineData").length;
					if(length === 0){
						oDefaultDataModel.setProperty("/unSyncVisible",false);
					} else{
						oDefaultDataModel.setProperty("/unSyncVisible",true);
					}
				}

			}
		});
	},

	onStorage : function(){
		var that = this;
		this.busy.open();
		var ePlant = oDefaultDataModel.getProperty("/EPlant");
		oDataModel.read( "/PlantStorageSet?$filter=Werks%20eq%20%27"+ePlant+"%27",null,{}, false,
				function(oData,oResponse){ // success fx
			oDataModel.oHeaders["X-CSRF-token"]=oResponse.headers["x-csrf-token"];
			var oEmptyBinModel = that.getView().getModel("oEmptyBinModel");
			oEmptyBinModel.setData(oData);
			oDefaultDataModel.setProperty("/storage",oData.results);
			that.busy.close();
		},
		function(oError){ // error fx
			console.log("error in token fetching");
		});
	},

	onExceptionLoad : function(){
		var that = this;
		this.busy.open();
		/*SpinnerDialog.show("Please Wait..", "Loading...");*/
		var ePlant = oDefaultDataModel.getProperty("/EPlant");
		oDataModel.read( "/ErrorLogSet/?$filter=Werks%20eq%20%27"+ePlant+"%27",null,{}, true,
				function(oData,oResponse){
			oDataModel.oHeaders["X-CSRF-token"]=oResponse.headers["x-csrf-token"];
			var oExceptionModel = that.getView().getModel("oExceptionModel");
			oDefaultDataModel.setProperty("/numberExceptions",oData.results.length);
			oExceptionModel.setData(oData);
			SpinnerDialog.hide();
			that.busy.close();
		});
	},

	/****************************************On plant variants loading************************************************/
	onPlantVariantLoad : function(){
		var that = this;
		this.busy.open();
		SpinnerDialog.show("Please Wait..", "Loading...");
		var ePlant = oDefaultDataModel.getProperty("/EPlant");
		oDataModel.read( "PlantVariantSet?$filter=Werks%20eq%20%27"+ePlant+"%27",null,{}, false,
				function(oData,oResponse){ // success fx
			oDataModel.oHeaders["X-CSRF-token"]=oResponse.headers["x-csrf-token"];
			var oListModel = that.getView().getModel("oListModel");
			oListModel.setData(oData);
			oListModel.setProperty("/userName",oDataModel.sUser);
			oDefaultDataModel.setProperty("/userName",oDataModel.sUser);
			oDefaultDataModel.setProperty("/listOfVariants",oData.results);
			SpinnerDialog.hide();
			that.busy.close();
		},
		function(oError){ // error fx
			console.log("error in token fetching");
		});

	},

	/********************** To Navigate to the Scanning Page **********************************/

	/*	afterScan : function()
	{

		var that = this;
		//alert("x");
//		oDataModel.read( "/PlantStorageSet?$filter=Werks%20eq%20%27US01%27",null,{}, false,
//		function(oData,oResponse){ // success fx
//		//  console.log(oCompModel),
//		oDataModel.oHeaders["X-CSRF-token"]=oResponse.headers["x-csrf-token"];
//		//  console.log(oCompModel.oHeaders["X-CSRF-token"]);
//		var oEmptyBinModel = that.getView().getModel("oEmptyBinModel");
//		oEmptyBinModel.setData(oData);
//		that.busy.close();
//		},
//		function(oError){ // error fx
//		console.log("error in token fetching");
//		});

		if (!that.emptyBinAfterScan) {
			var oEmptyBinModel = that.getView().getModel("oEmptyBinModel");
			that.emptyBinAfterScan = sap.ui.xmlfragment("terumo.fragments.emptyBinScan", that);
		}
		that.getView().addDependent(that.emptyBinAfterScan);
		that.emptyBinAfterScan.open();
	},*/

	scan : function(){

		var that = this;
		scanner.startScanning(function(evt){
			// alert("init");
		},function(evt){
			//alert(evt.code);
			oDefaultDataModel.setProperty("/scannedMaterialNumber",evt.code);
			/*var ePlant = oDefaultDataModel.getProperty("/EPlant");
			oDataModel.read( "/PlantStorageSet?$filter=Werks%20eq%20%27"+ePlant+"%27",null,{}, false,
					function(oData,oResponse){ // success fx
				oDataModel.oHeaders["X-CSRF-token"]=oResponse.headers["x-csrf-token"];
				var oEmptyBinModel = that.getView().getModel("oEmptyBinModel");
				oEmptyBinModel.setData(oData);
				that.busy.close();
			},
			function(oError){ // error fx
				console.log("error in token fetching");
			});*/
			SpinnerDialog.show("Please Wait..");
			for(var i=0; i<matnr.length; i++){
				if(matnr[i] === evt.code){
					oDefaultDataModel.setProperty("/selectedUom",meins[i]);

				}
			}
			if (!that.emptyBinAfterScan) {
				var oEmptyBinModel = that.getView().getModel("oEmptyBinModel");
				that.getView().setModel(oDefaultDataModel,"oDefaultDataModel");
				/* oEmptyBinModel.setProperty("/oScannedMaterial",evt.code);*/
				that.emptyBinAfterScan = sap.ui.xmlfragment("terumo.fragments.emptyBin", that);
				that.getView().addDependent(that.emptyBinAfterScan);
			}
			SpinnerDialog.hide();
			if(oDefaultDataModel.getProperty("/selectedUom")){
				oDefaultDataModel.setProperty("/scanDone",true);
				oDefaultDataModel.setProperty("/scanNotDone",false);
				that.emptyBinAfterScan.open();
			}
		},0,22,100,70);
	},

	onExceptionOnline : function(){
		this.getView().byId("idLov").setVisible(true);
		this.getView().byId("idExp").setVisible(false);
	},

	onExceptionOffline : function(){
		sap.ui.getCore().byId("idLov").setVisible(true);
		sap.ui.getCore().byId("idExp").setVisible(false);
	},

	onRouteToVariantItem : function(oEvent) {
		var that = this;
		var index = oEvent.mParameters.id.split("-")[4];
		var oListModel = this.getView().getModel("oListModel");
		//var selectedIndex = oEvent.getSource().sId.split("-")[4];
		var index = oEvent.getSource().getBindingContext("oListModel").sPath.split("/")[2];
		var selectedItem = oEvent.getSource().oParent.mBindingInfos.items.binding.oList[index];
		//var oStorageTypeVisible = selectedItem.oStorageTypeVisible;
		var selectedVariant = selectedItem.VariantName;
		var selectedBatch = selectedItem.Charg;
		var selectedReasonCode = selectedItem.Grund //if grund is "" 0000
		var selectedMovementType = selectedItem.Bwart;
		var selectedStorageType = selectedItem.Lgtyp;
		var selectedStorageBin = selectedItem.Lgpla;
		var selectedPlant = selectedItem.Werks;
		var selectedStorageLocation = selectedItem.Lgort;
		var selectedCostCenter = selectedItem.Kostl;
		var selectedHeaderText = selectedItem.Bktxt;
		var selectedUom = oDefaultDataModel.getProperty("/selectedUom");
		var selectedWareHouseManaged = selectedItem.WarehouseMg;
		var reasonCodeFlag = selectedItem.BwartExcl;
		var headerTextFlag = selectedItem.BktxtExcl;



		/*if(selectedBatch === ""){
			oDefaultDataModel.setProperty("/selectedBatchVisible",true);
		} else {
			oDefaultDataModel.setProperty("/selectedBatchVisible",false);
		}*/
		if(selectedBatch === ""){
			oDefaultDataModel.setProperty("/selectedBatchEnabled",true);
		} else {
			oDefaultDataModel.setProperty("/selectedBatchEnabled",false);
		}

		if(selectedCostCenter === ""){
			oDefaultDataModel.setProperty("/selectedCostCenterVisible",true);
		} else {
			oDefaultDataModel.setProperty("/selectedCostCenterVisible",false);
		}


		/*		if(reasonCodeFlag === "X" && selectedReasonCode === "" ){
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",false);
		}else if(reasonCodeFlag !== "X" && selectedReasonCode === "0000" ){
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",true);
		} else{
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",false);
		}*/
		if(selectedReasonCode === "0000"){
			selectedReasonCode = "";
		}
		if (reasonCodeFlag !== "X" && selectedReasonCode === "0000" ) {
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",true);
		} else {
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",false);
		}

		if (headerTextFlag !== "X" && selectedHeaderText === "" ) {
			oDefaultDataModel.setProperty("/selectedHeaderTextVisible",true);
		} else {
			oDefaultDataModel.setProperty("/selectedHeaderTextVisible",false);
		}
		if(selectedStorageType && selectedWareHouseManaged === "X"){
			oDefaultDataModel.setProperty("/selectedStorageTypeVisible",false);
		}
		if(selectedStorageBin && selectedWareHouseManaged === "X"){
			oDefaultDataModel.setProperty("/selectedStorageBinVisible",false);
		}
		if(selectedStorageType === "" && selectedWareHouseManaged === "X"){
			oDefaultDataModel.setProperty("/selectedStorageTypeVisible",true);
		}
		if(selectedStorageBin === "" && selectedWareHouseManaged === "X"){
			oDefaultDataModel.setProperty("/selectedStorageBinVisible",true);
		}

		if(selectedStorageType === "" && selectedWareHouseManaged !== "X"){
			oDefaultDataModel.setProperty("/selectedStorageTypeVisible",false);
		}

		if(selectedStorageBin === "" && selectedWareHouseManaged !== "X"){
			oDefaultDataModel.setProperty("/selectedStorageBinVisible",false);
		}


		oDefaultDataModel.setProperty("/selectedVariant",selectedVariant);
		oDefaultDataModel.setProperty("/selectedBatch",selectedBatch);
		oDefaultDataModel.setProperty("/selectedReasonCode",selectedReasonCode);
		oDefaultDataModel.setProperty("/selectedMovementType",selectedMovementType);
		oDefaultDataModel.setProperty("/selectedStorageType",selectedStorageType);
		oDefaultDataModel.setProperty("/selectedStorageBin",selectedStorageBin);
		oDefaultDataModel.setProperty("/selectedPlant",selectedPlant);
		oDefaultDataModel.setProperty("/selectedStorageLocation",selectedStorageLocation);
		oDefaultDataModel.setProperty("/selectedCostCenter",selectedCostCenter);
		oDefaultDataModel.setProperty("/selectedHeaderText",selectedHeaderText);
		oDefaultDataModel.setProperty("/selectedWareHouseManaged",selectedWareHouseManaged);
		oDefaultDataModel.setProperty("/selectedUom",selectedUom);

		//this.scan();
		this.oRouter.navTo("terumoScan",{});


	},

	handleSuggest: function(oEvent) {
		var sTerm = oEvent.getParameter("suggestValue");
		var aFilters = [];
		if (sTerm) {
			var oFilter1 = new sap.ui.model.Filter("Lgtyp", sap.ui.model.FilterOperator.Contains, sTerm);
		}
		aFilters = new sap.ui.model.Filter({
			filters: [oFilter1],
			and: false
		});
		oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
	},

	storageBinSuggest : function(oEvent){
		var sTerm = oEvent.getParameter("suggestValue");
		var aFilters = [];
		if (sTerm) {
			var oFilter1 = new sap.ui.model.Filter("Lgpla", sap.ui.model.FilterOperator.Contains, sTerm);
		}
		aFilters = new sap.ui.model.Filter({
			filters: [oFilter1],
			and: false
		});
		oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
	},


	onSubstituteTabSelect : function(oEvent){
		var that = this
		var selectedReport = oEvent.getSource().getSelectedKey();
		if(selectedReport === "lov"){
			/*this.getView().setModel(oDefaultDataModel,"oDefaultDataModel")*/
			this.getView().byId("idList").setVisible(true);
			this.getView().byId("idExceptionContent").setVisible(false);
			this.getView().byId("idReprocessButton").setVisible(false);
			this.getView().byId("idContentMiddleException").setVisible(false);
			this.getView().byId("idContentMiddle").setVisible(true);
			//this.onPlantVariantLoad();
		} else if(selectedReport === "exp"){
			SpinnerDialog.show("Please Wait..", "Loading Exceptions")
			this.getView().byId("idReprocessButton").setVisible(true);
			this.selectedException = [];
			this.selectedList = [];
			this.getView().byId("idList").setVisible(false);
			this.getView().byId("idExceptionContent").setVisible(true);
			this.getView().byId("idContentMiddle").setVisible(false);
			this.getView().byId("idContentMiddleException").setVisible(true);
			this.onExceptionLoad();

		}
	},


	/***************** On Clicking LogOut in the Header this function is revoked **********/

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

	onOnlySignOut : function(){
		var that = this;
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
			   //     alert('Message: ' + status);
			    };
			    var error = function(status) {
				     //   alert('Error: ' + status);
				    };
				    window.CacheClear(success, error);
				window.cookies.clear(function() {
					//	alert("Cookies cleared!");
				});
				oDefaultDataModel.setProperty("/setPinVisible",false);
				this.oRouter.navTo("terumo",{});
				oDataModel="";
				oDefaultDataModel.setData({});
				oDefaultDataModel.refresh();

	},
	onCloseLogOut : function() {
		this.logOutpopUp.close();
	},

	/****************** On Clicking the warning icon in the Header, Navigate to Grid Page ***************/

	onBellPress : function() {
		this.oRouter.navTo("terumoGrid",{});
	},



	/********************** On clicking description link, To get detailed description ********************/
	onOpeningDescription : function(oEvent){

		var oEmptyBinModel = this.getView().getModel("oEmptyBinModel");
		if (!this.description) {
			this.description = sap.ui.xmlfragment("terumo.fragments.description", this);
		}
		this.getView().addDependent(this.description);
		this.description.open();
	},

	onOpeningDescriptionData : function(){
		//this.description.close();
		if (!this.descriptionData) {
			this.descriptionData = sap.ui.xmlfragment("terumo.fragments.descriptionData", this);
		}
		this.getView().addDependent(this.descriptionData);
		this.descriptionData.open();
	},

	onDescriptionDelete : function(){
		var that = this
		var  oExceptionModel = this.getView().getModel("oExceptionModel");
		var ExceptionBindingContext = oExceptionModel.getProperty("/bindingContext");
		var oRequestData = {
				"Werks":ExceptionBindingContext.Werks,
				"ToMovementItem":[{
					"Matnr":ExceptionBindingContext.Matnr,
					"Werks":ExceptionBindingContext.Werks,
					"Errorid":ExceptionBindingContext.ErrorId,
					"Menge":ExceptionBindingContext.Menge, // quantity
					"Lgort":ExceptionBindingContext.Lgort,
					"Charg":ExceptionBindingContext.Charg,
					"Kostl":ExceptionBindingContext.Kostl,
					"Lgtyp":ExceptionBindingContext.Lgtyp,
					"Lgpla":ExceptionBindingContext.Lgpla,
					"Bwart":ExceptionBindingContext.Bwart,
					"Grund":ExceptionBindingContext.Grund,
					"Meins":ExceptionBindingContext.Meins,
					"Bktxt":ExceptionBindingContext.Bktxt,
					"WarehouseMg":ExceptionBindingContext.WarehouseMg,
					"Action":"D"

				}]
		}
		this.getToken();
		oDataModel.create("/MovementHeaderSet",oRequestData, null,
				function(oData,oResponse) {
			console.log(oResponse);
			that.description.close();
			that.onExceptionLoad();
			sap.m.MessageToast.show("Delete Successful", {
			});
		},
		function(oEvent){
			console.log(oEvent);
		}
		);
	},

	onDescriptionClose : function(){
		this.description.close();
	},

	onDescriptionDataClose : function(){
		this.descriptionData.close();
	},

	onDescriptionDataOpen : function(oEvent){
		var oExceptionModel = this.getView().getModel("oExceptionModel");
		oExceptionModel.setProperty("/descriptionText",oEvent.getSource().getParent().getBindingContext("oExceptionModel").getObject().Ertxt);
		if (!this.descriptionData) {
			this.descriptionData = sap.ui.xmlfragment("terumo.fragments.descriptionData", this);
		}
		this.getView().addDependent(this.descriptionData);
		this.descriptionData.open();
	},



	/********************************* on selecting a grid item ******************************************/
	onClickItem: function(oEvent){
		if (oEvent.getSource().getSelected()) {
			oEvent.getSource().setSelected(false);
			var selectedIndex = oEvent.getSource().getBindingContext("oExceptionModel").sPath.split("/")[2]
			selectedIndex = parseInt(selectedIndex);
			for(var i =0;i<this.selectedException.length;i++){
				if(selectedIndex === this.selectedException[i]){
					this.selectedException.splice(i,1);
					this.selectedList.splice(i,1);
					return;
				}
			}
		} else {
			oEvent.getSource().setSelected(true);

			var selectedIndex = oEvent.getSource().getBindingContext("oExceptionModel").sPath.split("/")[2]
			selectedIndex = parseInt(selectedIndex);
			this.selectedException.push(selectedIndex);
			var selectedData = oEvent.getSource().getBindingContext("oExceptionModel").oModel.oData.results[selectedIndex];
			this.selectedList.push(selectedData);
		}
	},
	/********************************** Reprocess *************************************************************/
	onReprocess : function(){
		var that = this;
		//var selectedItems = this.getView().byId("idExceptionTable").getSelectedItems();

		var oRequestData = {
				"Werks":oDefaultDataModel.getProperty("/EPlant"),
				"ToMovementItem":[]
		}
		var obj={};
		for(var i=0;i<this.selectedList.length;i++){
			var reprocessData = this.selectedList[i];
			obj={
					"Matnr":reprocessData.Matnr,
					// materialNumber after scanning
					"Werks":reprocessData.Werks,
					"Errorid":reprocessData.ErrorId,
					"Menge": reprocessData.Menge, // quantity
					"Lgort":reprocessData.Lgort,
					"Charg":reprocessData.Charg,
					"Kostl":reprocessData.Kostl,
					"Lgtyp":reprocessData.Lgtyp,
					"Lgpla":reprocessData.Lgpla,
					"Bwart":reprocessData.Bwart,
					"Grund":reprocessData.Grund,
					"Meins":reprocessData.Meins,
					"Bktxt":reprocessData.Bktxt,
					"WarehouseMg":reprocessData.WarehouseMg,
					"Action":"R"
			}
			oRequestData.ToMovementItem.push(obj);
		}
		if(i>0){
			this.getToken();
			oDataModel.create("/MovementHeaderSet",oRequestData, null,
					function(oData,oResponse) {
				that.onExceptionLoad();
				sap.m.MessageToast.show("Reprocess Successful", {
				});
			},
			function(oEvent){
				console.log(oEvent);
			}
			);
		} else {
			sap.m.MessageToast.show("Select an item to Reprocess", {
			});
			return;
		}
	},
	/******************************** on Posting **************************************************************/
	onPost : function(oEvent){
		var that = this;

		var networkState = navigator.connection && navigator.connection.type;

		var states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.NONE]     = 'No network connection';

		//lert('Connection type: ' + states[networkState]);

		var networkType = states[networkState];

		var oVariant = oDefaultDataModel.getProperty("/selectedVariant");
		var oBatch = oDefaultDataModel.getProperty("/selectedBatch");

		if(!oBatch ||oBatch == " "){
			sap.m.MessageToast.show("Please Enter Batch",{
			});
			return;
		}

		var oQuantity = oDefaultDataModel.getProperty("/selectedQuantity");
		if(!oQuantity || oQuantity === " "){
			sap.m.MessageToast.show("Please enter quantity", {
			});
			return;
		}
		if(oQuantity<0){
			sap.m.MessageToast.show("Quantity cannot be Negative", {
			});
			return;
		}
		if(oQuantity === "0"){
			sap.m.MessageToast.show("Quantity cannot be Empty", {
			});
			return;
		}

		var oReasonCode = oDefaultDataModel.getProperty("/selectedReasonCode");
		if(oDefaultDataModel.getProperty("/selectedReasonCodeVisible")){
			if(!oReasonCode || oReasonCode === "" ){
				sap.m.MessageToast.show("Please Enter Reason code", {
				});
				return;
			}

			/*var selectedReasonCode = oDefaultDataModel.getProperty("/selectedReasonCode");
		if(selectedReasonCode == "0000"){
			if(oReasonCode == ""){
				oReasonCode = "0000";
			}//if Grund is ""  0000
		}*/
			/*
		if(!oReasonCode || oReasonCode === ""){
			sap.m.MessageToast.show("Please enter ReasonCode", {
			});
			return;
		}*/

			var oMovementType = oDefaultDataModel.getProperty("/selectedMovementType");
			if(!oMovementType ||oMovementType == ""){
				sap.m.MessageToast.show("Please Enter Movement type",{
				});
				return;
			}
			var oStorageType = oDefaultDataModel.getProperty("/selectedStorageType");
			if(!oStorageType ||oStorageType == ""){
				sap.m.MessageToast.show("Please Enter Storage Type",{
				});
				return;
			}
			var oStorageBin = oDefaultDataModel.getProperty("/selectedStorageBin");
			if(!oStorageBin ||oStorageBin == ""){
				sap.m.MessageToast.show("Please Enter Storage Bin", {
				});
				return;
			}
			var oPlant = oDefaultDataModel.getProperty("/selectedPlant");

			var oStorageLocation = oDefaultDataModel.getProperty("/selectedStorageLocation");
			var oCostCenter = oDefaultDataModel.getProperty("/selectedCostCenter");
			if(!oCostCenter ||oCostCenter == ""){
				sap.m.MessageToast.show("Please Enter Cost center", {
				});
				return;
			}

			var oHeaderText = oDefaultDataModel.getProperty("/selectedHeaderText");
			if (oDefaultDataModel.getProperty("/selectedHeaderTextVisible")) {
				if(!oHeaderText ||oHeaderText == ""){
					sap.m.MessageToast.show("Please Enter Header Text", {
					});
					return;
				}
			}

			var oWareHouseManaged = oDefaultDataModel.getProperty("/selectedWareHouseManaged");
			var oUom  = oDefaultDataModel.getProperty("/selectedUom");
			if(networkType == "No network connection"){

				offlineDb.transaction(function(transaction) {
					transaction.executeSql('CREATE TABLE IF NOT EXISTS offlineTable (id integer primary key, MaterialNumber text, Variant text, Batch text, ReasonCode text, MovementType text, StorageType text, StorageBin text, Plant text, StorageLocation text, CostCenter text, HeaderText text, WareHouseManaged text, Quantity text)', [],
							function(tx, result) {
						//alert("Table created successfully");

					},
					function(error) {

					});
				});


				offlineDb.transaction(function(transaction) {
					//                                                 alert(sqlite_matnr);
					var executeQuery = "INSERT INTO offlineTable (MaterialNumber, Variant, Batch, ReasonCode, MovementType, StorageType, StorageBin, Plant, StorageLocation, CostCenter, HeaderText, WareHouseManaged, Quantity) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
					transaction.executeSql(executeQuery, [oMaterialNumber, oVariant, oBatch, oReasonCode, oMovementType, oStorageType, oStorageBin, oPlant, oStorageLocation, oCostCenter, oHeaderText, oWareHouseManaged, oQuantity]
					, function(tx, result) {

					},
					function(error){

					});
				});



				offlineDb.transaction(function(transaction) {


					var executeQuery = "SELECT * FROM offlineTable";
					transaction.executeSql(executeQuery, [],

							function(tx, result) {

						for (i = 0; i < 1; i++){
							/*	alert("<tr><td>"+result.rows.item(i).MaterialNumber+"</td><td>"+result.rows.item(i).Variant+"</td><td>"+result.rows.item(i).Plant);*/
							var offlineItem = result.rows.item(i);
							var offlineDataEntry = oDefaultDataModel.getProperty("/offlineData");
							if (offlineDataEntry) {
								offlineDataEntry.push(offlineItem);
								oDefaultDataModel.setProperty("/offlineData", offlineDataEntry);
							} else {
								oDefaultDataModel.setProperty("/offlineData", [offlineItem]);
							}

						}
						var length = oDefaultDataModel.getProperty("/offlineData").length;

						if(length > 0){
							oDefaultDataModel.setProperty("/unSyncVisible",true);
						} else{
							oDefaultDataModel.setProperty("/unSyncVisible",true);
						}

						oDefaultDataModel.setProperty("/selectedQuantity","");
						oDefaultDataModel.setProperty("/selectedBatch","");
						oDefaultDataModel.setProperty("/selectedReasonCode","");
						oDefaultDataModel.setProperty("/selectedMovementType","");
						oDefaultDataModel.setProperty("/selectedStorageType","");
						oDefaultDataModel.setProperty("/selectedStorageBin","");
						oDefaultDataModel.setProperty("/selectedHeaderText","");
						oDefaultDataModel.setProperty("/selectedCostCenter","");
						oDefaultDataModel.setProperty("/scannedMaterialNumber","");
						oDefaultDataModel.setProperty("/selectedVariant","");

						oDefaultDataModel.setProperty("/selectedPlant","");
						oDefaultDataModel.setProperty("/selectedStorageLocation","");

						oDefaultDataModel.setProperty("/selectedWareHouseManaged","");
						oDefaultDataModel.setProperty("/selectedUom","");
						that.onEmptyBinCancel();
						sap.m.MessageToast.show("Posted Offline", {
						});

						return;
					},
					//On Error
					function(error){
						/*oDefaultDataModel.setProperty("/selectedQuantity","");
					oDefaultDataModel.setProperty("/selectedBatch","");
					oDefaultDataModel.setProperty("/selectedReasonCode","");
					oDefaultDataModel.setProperty("/selectedMovementType","");
					oDefaultDataModel.setProperty("/selectedStorageType","");
					oDefaultDataModel.setProperty("/selectedStorageBin","");
					oDefaultDataModel.setProperty("/selectedHeaderText","");
					oDefaultDataModel.setProperty("/selectedCostCenter","");
					oDefaultDataModel.setProperty("/scannedMaterialNumber","");
					oDefaultDataModel.setProperty("/selectedVariant","");
					oDefaultDataModel.setProperty("/selectedPlant","");
					oDefaultDataModel.setProperty("/selectedStorageLocation","");
					oDefaultDataModel.setProperty("/selectedWareHouseManaged","");
					oDefaultDataModel.setProperty("/selectedUom","");*/
					});
				});



			} else {

				var oRequestData = {
						"Werks":oPlant,
						"ToMovementItem":[{
							"Matnr":oDefaultDataModel.getProperty("/scannedMaterialNumber"),  // materialNumber after scanning
							"Werks":oPlant,
							"Menge":oQuantity, // quantity
							"Lgort":oStorageLocation,
							"Charg":oBatch,
							"Kostl":oCostCenter,
							"Lgtyp":oStorageType,
							"Lgpla":oStorageBin,
							"Bwart":oMovementType,
							"Grund":oReasonCode,
							"Meins":oUom,
							"Bktxt":oHeaderText,
							"WarehouseMg":oWareHouseManaged,
							"Action":"P"
						}]
				}
				SpinnerDialog.show("Please Wait..", "Material is posting..");
				oDataModel.create("/MovementHeaderSet",oRequestData, null,
						function(oData,oResponse) {
					oDefaultDataModel.setProperty("/selectedQuantity","");
					oDefaultDataModel.setProperty("/selectedBatch","");
					oDefaultDataModel.setProperty("/selectedReasonCode","");
					oDefaultDataModel.setProperty("/selectedMovementType","");
					oDefaultDataModel.setProperty("/selectedStorageType","");
					oDefaultDataModel.setProperty("/selectedStorageBin","");
					oDefaultDataModel.setProperty("/selectedHeaderText","");
					oDefaultDataModel.setProperty("/selectedCostCenter","");
					oDefaultDataModel.setProperty("/selectedVariant","");
					oDefaultDataModel.setProperty("/selectedStorageLocation","");
					oDefaultDataModel.setProperty("/selectedWareHouseManaged","");
					oDefaultDataModel.setProperty("/selectedUom","")
					that.onEmptyBinCancel();
					that.onPlantVariantLoad();
					that.onExceptionLoad();
					SpinnerDialog.hide();
					sap.m.MessageToast.show("Post Successful", {
					});
					/*that.oRouter.navTo("terumoList",{});*/
				},
				function(oEvent){
					/*oDefaultDataModel.setProperty("/selectedQuantity","");
				oDefaultDataModel.setProperty("/selectedBatch","");
				oDefaultDataModel.setProperty("/selectedReasonCode","");
				oDefaultDataModel.setProperty("/selectedMovementType","");
				oDefaultDataModel.setProperty("/selectedStorageType","");
				oDefaultDataModel.setProperty("/selectedStorageBin","");
				oDefaultDataModel.setProperty("/selectedHeaderText","");
				oDefaultDataModel.setProperty("/selectedCostCenter","");
				oDefaultDataModel.setProperty("/selectedVariant","");
				oDefaultDataModel.setProperty("/selectedStorageLocation","");
				oDefaultDataModel.setProperty("/selectedWareHouseManaged","");
				oDefaultDataModel.setProperty("/selectedUom","")*/
					sap.m.MessageToast.show("Post UnSuccessful", {
					});
				}
				);
			}
		}
	},
	onEmptyBinCancel : function(){
		oDefaultDataModel.setProperty("/selectedQuantity","");
		oDefaultDataModel.setProperty("/selectedBatch","");
		oDefaultDataModel.setProperty("/selectedReasonCode","");
		oDefaultDataModel.setProperty("/selectedMovementType","");
		oDefaultDataModel.setProperty("/selectedStorageType","");
		oDefaultDataModel.setProperty("/selectedStorageBin","");
		oDefaultDataModel.setProperty("/selectedHeaderText","");
		oDefaultDataModel.setProperty("/selectedCostCenter","");
		oDefaultDataModel.setProperty("/selectedStorageLocation","");
		oDefaultDataModel.setProperty("/selectedWareHouseManaged","");
		oDefaultDataModel.setProperty("/selectedUom","")
		this.emptyBinAfterScan.close();

	},


	onDescriptionPost : function(){
		var that = this;
		SpinnerDialog.show("Please Wait..", "Reprocessing");
		var oExceptionModel = this.getView().getModel("oExceptionModel");
		var bindingContext = oExceptionModel.getProperty("/bindingContext");
		var quantity = oExceptionModel.getProperty("/descriptionQuantity");
		if(!quantity || quantity === " "){
			sap.m.MessageToast.show("Please enter quantity", {
			});
			return;
		}
		if(quantity<0){
			sap.m.MessageToast.show("Quantity cannot be Negative", {
			});
			return;
		}
		if(quantity === "0"){
			sap.m.MessageToast.show("Quantity cannot be Empty", {
			});
			return;
		}
		var oRequestData = {
				"Werks":oDefaultDataModel.getProperty("/EPlant"),
				"ToMovementItem":[{
					"Matnr":bindingContext.Matnr,
					// materialNumber after scanning
					"Werks":bindingContext.Werks,
					"Errorid":bindingContext.ErrorId,
					"Menge": quantity, // quantity
					"Lgort":bindingContext.Lgort,
					"Charg":bindingContext.Charg,
					"Kostl":bindingContext.Kostl,
					"Lgtyp":bindingContext.Lgtyp,
					"Lgpla":bindingContext.Lgpla,
					"Bwart":bindingContext.Bwart,
					"Grund":bindingContext.Grund,
					"Meins":bindingContext.Meins,
					"Bktxt":bindingContext.Bktxt,
					"WarehouseMg":bindingContext.WarehouseMg,
					"Action":"R"
				}]
		}
		this.getToken();
		oDataModel.create("/MovementHeaderSet",oRequestData, null,
				function(oData,oResponse) {
			console.log(oResponse);
			that.description.close();
			that.onExceptionLoad();
			sap.m.MessageToast.show("Reprocess Successful", {
			});
		},function(oEvent){

		});
	},

	onSyncSignOut : function(){

		alert(oDefaultDataModel.getProperty("/offlineVisible"));
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
			     //   alert('Message: ' + status);
			    };
			    var error = function(status) {
				  //      alert('Error: ' + status);
				    };
				    window.CacheClear(success, error);
				window.cookies.clear(function() {
					//	alert("Cookies cleared!");
				});
				/*this.onSync();*/
				this.onCloseLogOut();
				this.oRouter.navTo("terumo",{});
				oDataModel="";
				oDefaultDataModel.setData({});
				oDefaultDataModel.refresh();

	},

	onSync : function(){
		var that = this;
		var syncToBeData = oDefaultDataModel.getProperty("/offlineData");
		var dataLength = syncToBeData.length;
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
			this.getToken();
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
	},

	getToken: function() {
		var sUrl = "https://fioridev.terumobct.com:8001/sap/opu/odata/sap/ZTMBCT_MATSCRP_SRV";
		var userName = oDefaultDataModel.getProperty("/userName");
		var password = oDefaultDataModel.getProperty("/pwd");
		oDataModel = new sap.ui.model.odata.ODataModel(sUrl,true,userName,password);
	},

	onDoubleTap : function(oEvent) {

		var oExceptionModel = this.getView().getModel("oExceptionModel");
		var bindingContext = oEvent.getSource().getBindingContext("oExceptionModel").getObject();
		oExceptionModel.setProperty("/bindingContext",bindingContext);
		oExceptionModel.setProperty("/descriptionMaterialNumber",bindingContext.Matnr);
		oExceptionModel.setProperty("/descriptionQuantity",bindingContext.Menge);
		if (!this.description) {
			this.description = sap.ui.xmlfragment("terumo.fragments.description", this);
		}
		this.getView().addDependent(this.description);
		this.description.open();
	},
	/******************* Closing description fragments by mouse click ************************/

	onAfterRendering: function() {
		var that = this;
		this.getView().byId("idExceptionTable").attachBrowserEvent("dblclick",
				function (oEvent){
			var bindingContext = this.getBindingContext('oExceptionModel').getObject();
			var oExceptionModel = that.getView().getModel("oExceptionModel");
			oExceptionModel.setProperty("/bindingContext",bindingContext);
			oExceptionModel.setProperty("/descriptionMaterialNumber",bindingContext.Matnr);
			oExceptionModel.setProperty("/descriptionQuantity",bindingContext.Menge);
			if (!that.description) {
				that.description = sap.ui.xmlfragment("terumo.fragments.description", that);
			}
			that.getView().addDependent(that.description);
			that.description.open();
		});
		/*	document.addEventListener("click",
				function closeDialog(oEvent){
			if(that.description){
				if(oEvent.target.id === "sap-ui-blocklayer-popup"){
					that.description.close();;
				}
			}
		});*/
		/*	document.addEventListener("click",
				function closeDialog(oEvent){
			if(that.descriptionData){
				if(oEvent.target.id === "sap-ui-blocklayer-popup"){
					that.descriptionData.close();;

				}
			}
		});*/


	}


});