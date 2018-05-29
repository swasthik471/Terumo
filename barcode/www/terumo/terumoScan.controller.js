sap.ui.controller("terumo.terumoScan", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf terumo.terumoScan
	 */

	onInit : function(){
		var that = this;
		this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		this.oRouter.attachRoutePatternMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "terumoScan") {
			}
		});
		this.busy = new sap.m.BusyDialog();
		this.getView().setModel(oDefaultDataModel,"oDefaultDataModel")
		var oEmptyBinModel =  new sap.ui.model.json.JSONModel();
		this.getView().setModel(oEmptyBinModel, "oEmptyBinModel");
		var oModel =  new sap.ui.model.json.JSONModel();
		this.getView().setModel(oModel, "oModel");
	},

	/******************************* On Clicking Grid Icon in the Header  *************************************/

	onClickingGridIcon : function(oEvent)  {
		var oModel = this.getView().getModel("oModel");
		if (!this._oPopover) {
			this.getView().setModel(oDefaultDataModel,"oDefaultDataModel");
			this._oPopover = sap.ui.xmlfragment("terumo.fragments.listViewPopOver", this);
			this.getView().addDependent(this._oPopover);
		}
		this._oPopover.openBy(oEvent.getSource());
	},

	onScanning : function(){
		var that = this;
		this.getView().byId("idSubmitButton").setVisible(false);
		cordova.plugins.barcodeScanner.scan(
				function (result) {
//					alert("We got a barcode\n" +
//					"Result: " + result.text + "\n" +
//					"Format: " + result.format + "\n" +
//					"Cancelled: " + result.cancelled);

					var res = result.text;
					for(var i=0; i<matnr.length; i++){
						if(matnr[i] === res){
							oDefaultDataModel.setProperty("/selectedUom",meins[i]);
						}
					}
					oDefaultDataModel.setProperty("/scannedMaterialNumber",res);
					if(oDefaultDataModel.getProperty("/scannedMaterialNumber")){
						if (!that.emptyBinSubmit) {
							that.getView().setModel(oDefaultDataModel,"oDefaultDataModel");
							//var oEmptyBinModel = that.getView().getModel("oEmptyBinModel");
							that.emptyBinSubmit = sap.ui.xmlfragment("terumo.fragments.emptyBin", that);
							that.getView().addDependent(that.emptyBinSubmit);
						}
						that.emptyBinSubmit.open();
					}
				},
				function (error) {
					alert("Scanning failed: " + error);
				},
				{
					preferFrontCamera : false, // iOS and Android
					showFlipCameraButton : false, // iOS and Android
					showTorchButton : true, // iOS and Android
					torchOn: false, // Android, launch with the torch switched on (if available)
					saveHistory: true, // Android, save scan history (default false)
					prompt : "Place a barcode inside the scan area", // Android
					resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
					formats : "QR_CODE,PDF_417,CODE_128", // default: all but PDF_417 and RSS_EXPANDED
					orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
					disableAnimations : true, // iOS
					disableSuccessBeep: false // iOS and Android
				});

	},

	/******************************** On Clicking LogOut in Header this function is revoked *******************/

	onLogOut : function(oEvent){
		var that = this;
		var len = oDefaultDataModel.getProperty("/offlineData").length;
		if(len !== ""){
			if (!this.logOutpopUp) {
				this.logOutpopUp = sap.ui.xmlfragment("terumo.fragments.logOut", this);
			}
			this.getView().addDependent(this.logOutpopUp);
			this.logOutpopUp.open();
		} else {
			sap.m.MessageToast.show("LogOut Successful", {
			});
			return;
		}
		document.addEventListener("click",
				function closeDialog(oEvent){
			if(oEvent.target.id === "sap-ui-blocklayer-popup"){
				that.onCloseLogOut();
			}
		});
	},

	onCloseLogOut : function() {
		this.logOutpopUp.close();
	},
	onSyncSignOut : function(){
		this.onCloseLogOut();
	},


	/****************************  Opening side Panel On Clicking Menu Icon in the Header *********************/

	/*onOpenPopOver : function(oEvent){
    var oModel =  new sap.ui.model.json.JSONModel();
    this.getView().setModel(oModel, "oModel");
    oModel.loadData("json/template.json", null, false);
    if (!this.terumoPopOver) {
    this.terumoPopOver = sap.ui.xmlfragment("terumo.fragments.popOver", this);
    this.getView().addDependent(this.terumoPopOver);
    }

    this.terumoPopOver.openBy(oEvent.getSource());
    },*/

	/****************************** On Entering Material Number LiveChange *********************************/

	onMaterialNumber : function(oEvent){
		var oModel = this.getView().getModel("oModel");
		var value = oEvent.getSource().getValue();
		oModel.setProperty("/value",value);
		var length  = value.length;
		if(length>0) {
			this.getView().byId("idSubmitButton").setVisible(true);
		} else {
			this.getView().byId("idSubmitButton").setVisible(false);
		}
	},

	onEmptyBinScanCancel : function(){
		oDefaultDataModel.setProperty("/selectedQuantity","");
		oDefaultDataModel.setProperty("/selectedBatch","");
		oDefaultDataModel.setProperty("/selectedReasonCode","");
		oDefaultDataModel.setProperty("/selectedMovementType","");
		oDefaultDataModel.setProperty("/selectedStorageType","");
		oDefaultDataModel.setProperty("/selectedStorageBin","");
		oDefaultDataModel.setProperty("/selectedHeaderText","");
		oDefaultDataModel.setProperty("/selectedCostCenter","");
		this.emptyBinSubmit.close();
	},


	onMaterialNumberSubmit : function(){
		var that = this;
		var oModel = this.getView().getModel("oModel");
		var matNum = oModel.getProperty("/value");
		this.getView().byId("idSubmitButton").setVisible(false);
		for(var i=0; i<matnr.length; i++){
			if(matnr[i] === matNum){
				oDefaultDataModel.setProperty("/selectedUom",meins[i]);
				oDefaultDataModel.setProperty("/scannedMaterialNumber",matNum);
				this.getView().byId("idMaterialNumber").setValue("");
				//				mwbScanner.closeScanner();
				var ePlant = oDefaultDataModel.getProperty("/EPlant");
				if (!that.emptyBinSubmit) {
					this.getView().setModel("oDefaultDataModel",oDefaultDataModel);
					//var oEmptyBinModel = that.getView().getModel("oEmptyBinModel");
					that.emptyBinSubmit = sap.ui.xmlfragment("terumo.fragments.emptyBin", that);
					that.getView().addDependent(that.emptyBinSubmit);
				}
				/*oDefaultDataModel.setProperty("/scanDone",false);
				oDefaultDataModel.setProperty("/scanNotDone",true);*/
				that.emptyBinSubmit.open();
				return;
			}
			else if(i == ((matnr.length) -1)){
				//				mwbScanner.closeScanner();
				if (!that.emptyBinInvalid) {
					//var oEmptyBinModel = that.getView().getModel("oEmptyBinModel");
					that.emptyBinInvalid = sap.ui.xmlfragment("terumo.fragments.invalid", that);
					that.getView().addDependent(that.emptyBinInvalid);
				}
				that.emptyBinInvalid.open()
			}
		}
	},

	onExceptionLoad : function(){
		var that = this
		var ePlant = oDefaultDataModel.getProperty("/EPlant");
		oDataModel.read( "/ErrorLogSet/?$filter=Werks%20eq%20%27"+ePlant+"%27",null,{}, true,
				function(oData,oResponse){
			oDataModel.oHeaders["X-CSRF-token"]=oResponse.headers["x-csrf-token"];
			/*oDefaultDataModel.setProperty("/numberExceptions",oData.results.length);*/
			var oExceptionModel = that.getView().getModel("oExceptionModel");
			oExceptionModel.setData(oData);
			that.busy.close();
		});
	},

	onEmptyBinCancel : function(){
		this.getView().byId("idMaterialNumber").setValue("");
		this.emptyBinSubmit.close();
	},

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

		var oMaterialNumber = oDefaultDataModel.getProperty("/scannedMaterialNumber")
		var oVariant = oDefaultDataModel.getProperty("/selectedVariant");
		var oBatch = oDefaultDataModel.getProperty("/selectedBatch");
		if(oDefaultDataModel.setProperty("/selectedBatchVisible",true)){
		/*if(!oBatch ||oBatch == ""){
			sap.m.MessageToast.show("Please enter batch", {
            			});
		}*/
		}
		var oQuantity = oDefaultDataModel.getProperty("/selectedQuantity");
		if(!oQuantity || oQuantity === " "){
			sap.m.MessageToast.show("Please enter quantity", {
			});
			return;
		}
		if(oQuantity < 0){
			sap.m.MessageToast.show("Quantity cannot be Negative", {
			});
			return;
		}
		if(oQuantity === "0"){
			sap.m.MessageToast.show("Quantity cannot be Empty", {
			});
			return;
		}
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
		var oReasonCode = oDefaultDataModel.getProperty("/selectedReasonCode");
		if(oDefaultDataModel.getProperty("/selectedReasonCodeVisible")){
		if(!oReasonCode || oReasonCode === "" ){
        			sap.m.MessageToast.show("Please Enter Reason code", {
        			});
        			return;
		}
		}
		/*	if(oReasonCode == ""){
				oReasonCode = "0000";
			}
		} else if(!oReasonCode || oReasonCode === "" ){
			sap.m.MessageToast.show("Please Enter Reason code", {
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

		var oWareHouseManaged = oDefaultDataModel.getProperty("/selectedWareHouseManaged");
		var oUom = oDefaultDataModel.getProperty("/selectedUom");


		if(networkType == "No network connection"){

			offlineDb.transaction(function(transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS offlineTable (id integer primary key, MaterialNumber text, Variant text, Batch text, ReasonCode text, MovementType text, StorageType text, StorageBin text, Plant text, StorageLocation text, CostCenter text, HeaderText text, WareHouseManaged text, Quantity text, Uom text)', [],
						function(tx, result) {
					//alert("Table created successfully");

				},
				function(error) {

				});
			});


			offlineDb.transaction(function(transaction) {
				//                                                 alert(sqlite_matnr);
				var executeQuery = "INSERT INTO offlineTable (MaterialNumber, Variant, Batch, ReasonCode, MovementType, StorageType, StorageBin, Plant, StorageLocation, CostCenter, HeaderText, WareHouseManaged, Quantity, Uom) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
				transaction.executeSql(executeQuery, [oMaterialNumber, oVariant, oBatch, oReasonCode, oMovementType, oStorageType, oStorageBin, oPlant, oStorageLocation, oCostCenter, oHeaderText, oWareHouseManaged, oQuantity, oUom]
				, function(tx, result) {

				},
				function(error){

				});
			});



			offlineDb.transaction(function(transaction) {


				var executeQuery = "SELECT * FROM offlineTable";
				transaction.executeSql(executeQuery, [],

						function(tx, result) {



					for (i = 0; i < 1 ; i++){
//						alert("<tr><td>"+result.rows.item(i).MaterialNumber+"</td><td>"+result.rows.item(i).Variant+"</td><td>"+result.rows.item(i).Uom);
						var offlineItem = result.rows.item(i);
						// oDefaultDataModel.setProperty("/offlineLength",offlineItem.length);
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
					that.onEmptyBinScanCancel();
					sap.m.MessageToast.show("Posted Offline", {
					});

					offlineDb.transaction(function(transaction) {
						 var executeQuery = "DROP TABLE IF EXISTS offlineTable";
						 transaction.executeSql(executeQuery, [],
								 function(tx, result) {
//							alert('Table deleted successfully.');
						},
						 function(error){
//							alert('Error occurred while droping the table.');
						}
						 );
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
					oDefaultDataModel.setProperty("/scannedMaterialNumber","");*/
				});
			});



		}

		else{


			var oRequestData = {
					"Werks":oPlant,
					"ToMovementItem":[{
						"Matnr":oMaterialNumber,  // materialNumber after scanning
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
			/*SpinnerDialog.show("Please Wait..", "Material is posting..");*/
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
				oDefaultDataModel.setProperty("/scannedMaterialNumber","");
				that.getView().byId("idMaterialNumber").setValue("");
				that.onEmptyBinScanCancel();
				that.onExceptionLoad();
				sap.m.MessageToast.show("Post Successful", {
				});
				/*SpinnerDialog.hide();*/
				//that.oRouter.navTo("terumoList",{});
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
				oDefaultDataModel.setProperty("/scannedMaterialNumber","");
				that.getView().byId("idMaterialNumber").setValue("");*/
				sap.m.MessageToast.show("Post Unsuccessful", {
				})
				SpinnerDialog.hide();
			}
			);
		}

	},


	onOk : function(){
		this.getView().byId("idMaterialNumber").setValue("");
		this.emptyBinInvalid.close();
	},

	onRouteToVariantItemPopOver : function(oEvent){
		var bindingContext = oEvent.oSource.oBindingContexts.oDefaultDataModel;
		var index = bindingContext.sPath.split("/")[2];
		var selectedItem = bindingContext.oModel.oData.listOfVariants[index];
		oDefaultDataModel.setProperty("/selectedVariant",selectedVariant);
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
		if(selectedBatch === ""){
			oDefaultDataModel.setProperty("/selectedBatchVisible",true);
		} else {
			oDefaultDataModel.setProperty("/selectedBatchVisible",false);
		}
		if(selectedCostCenter === ""){
			oDefaultDataModel.setProperty("/selectedCostCenterVisible",true);
		} else {
			oDefaultDataModel.setProperty("/selectedCostCenterVisible",false);
		}
		if(reasonCodeFlag === "X" && selectedReasonCode === "" ){
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",false);
		}else if(reasonCodeFlag !== "X" && selectedReasonCode === "0000" ){
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",true);
		} else {
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",false);
		}
		if(headerTextFlag === "X" && selectedHeaderText === "" ){
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",false);
		}else if(headerTextFlag !== "X" && selectedHeaderText === "" ){
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",true);
		} else {
			oDefaultDataModel.setProperty("/selectedReasonCodeVisible",false);
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


//		this.scan();
		this._oPopover.close();
	},

	scan : function(){
		scanner.startScanning(function(evt){
			// alert("init");
		},function(evt){
			oDefaultDataModel.setProperty("/scannedMaterialNumber",evt.code);
		},0,22,100,70);
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

	/*********************** On Clicking Bell Icon in the Header to navigate to list page *********************/

	onBellPress : function(){
		this.oRouter.navTo("terumoGrid",{});
	},

	/*********************** On Clicking Back Icon navigate to list page  *************************************/

	onBackPress : function(){
//		scanner.closeScanner();
		this.oRouter.navTo("terumoList",{});
	},

	/*********************************** On Selecting an item in the side panel *****************************************************/

	onSelectingPanelItem : function(oEvent) {
		var headerText = oEvent.getSource().oParent.mProperties.headerText;
		this.terumoPopOver.close();
	},


	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf terumo.terumoScan
	 */
	/*onAfterRendering: function(oEvent){
    this.getView().byId("idHbox").attachBrowserEvent("click",
    function(oEvent) {
    });
    },*/
	/***********************************************************************************************************************************/
	/******* To open & close(++cancel button) Scanned fragment by click in the browser area other than the fragment *****************/
	onAfterRendering: function() {
		var that = this;
		//		this.getView().byId("idScanIntegration").attachBrowserEvent("mousedown",
		//		function(oEvent) {
		//		var oModel = that.getView().getModel("oModel");
		//		if (!that.emptyBin) {
		//		that.emptyBin = sap.ui.xmlfragment("terumo.fragments.emptyBin", that);
		//		that.getView().addDependent(that.emptyBin);
		//		}
		//		that.emptyBin.open();
		//		});
		/*		document.addEventListener("click",
				function closeDialog(oEvent){
		 *//*	if(oEvent.target.id === "__button8-content"){
				oDefaultDataModel.setProperty("/selectedQuantity","");
				oDefaultDataModel.setProperty("/selectedBatch","");
				oDefaultDataModel.setProperty("/selectedReasonCode","");
				oDefaultDataModel.setProperty("/selectedMovementType","");
				oDefaultDataModel.setProperty("/selectedStorageType","");
				oDefaultDataModel.setProperty("/selectedStorageBin","");
				oDefaultDataModel.setProperty("/selectedHeaderText","");
				oDefaultDataModel.setProperty("/selectedCostCenter","");
				oDefaultDataModel.setProperty("/scannedMaterialNumber","");
				that.emptyBinSubmit.close();
			}*//*
		});*/
		/*document.addEventListener("click",
				function closeDialog(oEvent){
			if(oEvent.target.id === "sap-ui-blocklayer-popup"){
				that.emptyBinSubmit.close();
			}
		});*/
		/*that.getView().byId("idGrid").addEventListener('contextmenu', function(e) {
      console.log('right click!');
      return false
    })*/
	},
	onSyncSignOut : function(){
		this.onCloseLogOut();
		this.onSync();
	},
	onSync : function(){
		var that = this;
		var syncToBeData = oDefaultDataModel.getProperty("/offlineData");
		var dataLength = syncToBeData.length;
		oDefaultDataModel.setProperty("/offlineDataLength",dataLength);
		var oRequestData = {
				"Werks":syncToBeData.Werks,
				"ToMovementItem":[]
		}
		var obj={};
		if (dataLength > 0) {
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
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf terumo.terumoScan
	 */
	//	onExit: function() {

	//	}

});

