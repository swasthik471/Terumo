sap.ui.controller("terumo.terumo", {

	onInit: function() {
		var that = this;
		this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		routeData = this.oRouter;
		this.busy = new sap.m.BusyDialog();
		oDefaultDataModel = new sap.ui.model.json.JSONModel();
		sap.ui.getCore().setModel(oDefaultDataModel,"oDefaultDataModel");
		oDefaultDataModel.setProperty("/routeData",routeData);
		oDefaultDataModel.setProperty("/offlineData", []);
		this.oRouter.attachRoutePatternMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "terumo") {

			}
		});
		var oMaterialModel =  new sap.ui.model.json.JSONModel();
		this.getView().setModel(oMaterialModel, "oMaterialModel");
		var oModel =  new sap.ui.model.json.JSONModel();
		this.getView().setModel(oModel, "oModel");
		this.getView().byId("idSetMPin").setVisible(false);
		this.getView().byId("idFinalLogin").setVisible(false);
	},

	onUserType : function(){
		var that = this;
		var sUserName = oDataModel.sUser;
		oDataModel.read( "/user_typeSet('"+sUserName+"')",null,{}, true,
				function(oData,oResponse){ // success fx
			oDataModel.oHeaders["X-CSRF-token"]=oResponse.headers["x-csrf-token"];
			that.getView().byId("idSetPin1").setValue("");
			that.getView().byId("idSetPin2").setValue("");
			that.getView().byId("idSetPin3").setValue("");
			that.getView().byId("idSetPin4").setValue("");
			that.getView().byId("idSetPin5").setValue("");
			var oModel = that.getView().getModel("oModel");
			oModel.setData(oData);
			var sPlant = oModel.getProperty("/EPlant");
			var sRole = oModel.getProperty("/EUserType");
			oDefaultDataModel.setProperty("/EPlant",sPlant);
			oDefaultDataModel.setProperty("/EUserType",sRole);
			that.onMaterialSetLoad();
			that.busy.close();
		},
		function(oError){ // error fx
			console.log("error in token fetching");
		});
	},

	/********************* On Clicking Login Button after User Name and Password is entered ********************/

	onLogin : function(oEvent) {
		var that = this;

		var oModel = this.getView().getModel("oModel");
		var userName = oModel.getProperty("/inputName");
		var password = oModel.getProperty("/inputPassword");
		if(!userName || userName === ""){
			sap.m.MessageToast.show("User Name cannot be empty", {
			});
			return;
		}
		if(!password || password === ""){
			sap.m.MessageToast.show("Password cannot be empty", {
			});
			return;
		}
		this.busy.open();
		var sUrl = "https://fioridev.terumobct.com:8001/sap/opu/odata/sap/ZTMBCT_MATSCRP_SRV";

		oDataModel = new sap.ui.model.odata.ODataModel(sUrl,true,userName,password);
		oDataModel.setProperty("/userName",userName);
		oDefaultDataModel.setProperty("/userName",userName);
		oDefaultDataModel.setProperty("/pwd",password);
		sap.ui.getCore().setModel(oDataModel, "oDataModel");
		oDataModel.setCountSupported(false);

		this.onUserType();
		SpinnerDialog.show("Please Wait..", "Logging in..");
		oDataModel.attachMetadataLoaded(null,function(oEvent){
			that.busy.close();
			parentApp.setModel(oDataModel);
			that.getView().byId("idSetMPin").setVisible(true);
			that.getView().byId("idLogin").setVisible(false);
			that.getView().byId("idFinalLogin").setVisible(false);
			SpinnerDialog.hide();
            return;
		},null);
		oDataModel.attachMetadataFailed(null,function(oEvent){
			SpinnerDialog.hide();
			sap.m.MessageToast.show("Login Authentication Failed", {
			});
			that.getView().byId("idUserName").setValue("");
			that.getView().byId("idPassword").setValue("");
			that.busy.close();
			return;
		},null);
	},

	getToken: function() {
		var sUrl = "https://fioridev.terumobct.com:8001/sap/opu/odata/sap/ZTMBCT_MATSCRP_SRV";
		var userName = oDefaultDataModel.getProperty("/userName");
		var password = oDefaultDataModel.getProperty("/pwd");
		oDataModel = new sap.ui.model.odata.ODataModel(sUrl,true,userName,password);
	},

	onMaterialSetLoad : function(){
		var that = this;
		var ePlant = oDefaultDataModel.getProperty("/EPlant");
		oDataModel.read("/PlantMaterialSet?$filter=Werks%20eq%20%27"+ePlant+"%27",null,{}, true,
				function(oData,oResponse){ // success fx
			//  console.log(oCompModel),
			oDataModel.oHeaders["X-CSRF-token"]=oResponse.headers["x-csrf-token"];
			//  console.log(oCompModel.oHeaders["X-CSRF-token"]);
			var oMaterialModel = that.getView().getModel("oMaterialModel");
			oMaterialModel.setData(oData);
			matnr =[];
			meins =[];
			myDB.transaction(function(transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS material_list (id integer primary key, matnr text, meins text)', [],
						function(tx, result) {
//					//   alert("Table created successfully");
				},
				function(error) {
					//alert("Error occurred while creating the table.");
				});
			});
            for(var i=0; i<oMaterialModel.getData().results.length;i++){
				let maetrialId = oMaterialModel.getData().results[i].Matnr;
				let maetrialMeins = oMaterialModel.getData().results[i].Meins;
				matnr.push(maetrialId);
				meins.push(maetrialMeins);
				// Storing material list in local DB
//				let sqlite_matnr = matnr[i];
//				let sqlite_meins = meins[i];
                myDB.transaction(function(transaction) {
//					alert(sqlite_matnr);
					var executeQuery = "INSERT INTO material_list (matnr, meins) VALUES (?,?)";
					transaction.executeSql(executeQuery, [maetrialId, maetrialMeins]
					, function(tx, result) {
//						//  alert('Inserted');
					},
					function(error){
						// alert('Error occurred');
					});
				});

			}
            /*myDB.transaction(function(transaction) {

                   let matnum = "1109";

                    var executeQuery = "SELECT * FROM material_list where matnr=?";
                    transaction.executeSql(executeQuery, [matnum],
                    //On Success
                    function(tx, result) {
                  //  alert('found successfully');
                    for (i = 0; i < 1; i++){
                    //alert("<tr><td>"+result.rows.item(i).matnr+"</td><td>"+result.rows.item(i).meins+"</td><td>");
                    }
                    },
                    //On Error
                    function(error){
                    //alert('Something went Wrong');
                    });
                    });*/
			that.busy.close();
		},
		function(oError){ // error fx
			console.log("error in token fetching");
		});
	},

	/*********************** On Clicking Confirm Button after Setting MPIN *************************************/

	onSettingMPIN  : function(){
		var oModel = this.getView().getModel("oModel");
		var pin1 =  oModel.getProperty("/pin1");
		var pinC1 = oModel.getProperty("/pinC1");
		var pin2 =  oModel.getProperty("/pin2");
		var pinC2 = oModel.getProperty("/pinC2");
		var pin3 =  oModel.getProperty("/pin3");
		var pinC3 = oModel.getProperty("/pinC3");
		var pin4 =  oModel.getProperty("/pin4");
		var pinC4 = oModel.getProperty("/pinC4");
		var pin5 =  oModel.getProperty("/pin5");
		var pinC5 = oModel.getProperty("/pinC5");
		this.getView().byId("idEnterPin1").setValue("");
		this.getView().byId("idEnterPin2").setValue("");
		this.getView().byId("idEnterPin3").setValue("");
		this.getView().byId("idEnterPin4").setValue("");
		this.getView().byId("idEnterPin5").setValue("");
		this.getView().byId("idConfiPin1").setValue("");
		this.getView().byId("idConfiPin2").setValue("");
		this.getView().byId("idConfiPin3").setValue("");
		this.getView().byId("idConfiPin4").setValue("");
		this.getView().byId("idConfiPin5").setValue("");

		if(pin1 !== pinC1 || pin2 !== pinC2 || pin3 !== pinC3 || pin4 !== pinC4 || pin5 !== pinC5){
			sap.m.MessageToast.show("Pin Mismatch", {
			});
			return;
		}
		if(pin1 === " " || pin2 === " " || pin3 === " " || pin4 === " " || pin5 === " "){
			sap.m.MessageToast.show("Invalid Pin", {

			});
			return;
		}
		if(!pin1 || !pin2|| !pin3||! pin4 ||! pin5){
			sap.m.MessageToast.show("Invalid Pin.", {

			});
			return;
		}
		if(pinC1 === " " || pinC2 === " " || pinC3 === " " || pinC4 === " " || pinC5 === " "){
			sap.m.MessageToast.show("Invalid Pin", {
			});
		}
		if(!pinC1 || !pinC2|| !pinC3||! pinC4 ||! pinC5){
			sap.m.MessageToast.show("Invalid Pin", {

			});
			return;
		}


		myPin.transaction(function(transaction) {
			transaction.executeSql('CREATE TABLE IF NOT EXISTS phonegap_pro (pin_1 text, pin_2 text, pin_3 text, pin_4 text, pin_5 text)', [],
					function(tx, result) {
//				alert("Table created successfully");
			},
			function(error) {
//				alert("Error occurred while creating the table.");
			});
		});


		myPin.transaction(function(transaction) {
			var executeQuery = "INSERT INTO phonegap_pro (pin_1, pin_2, pin_3, pin_4, pin_5) VALUES (?,?,?,?,?)";
			transaction.executeSql(executeQuery, [pinC1,pinC2,pinC3,pinC4,pinC5]
			, function(tx, result) {
//				alert('Inserted');
			},
			function(error){
//				alert('Error occurred');
			});
		});
		myPin.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM phonegap_pro', [], function (tx, results) {
				var len = results.rows.length, i;
//				alert('transaction got executed');
				for (i = 0; i < 1; i++){
//					alert('transaction came inside loop');
//					alert(results.rows.item(i).pin_1+"<td>"+results.rows.item(i).pin_2+"<td>"+results.rows.item(i).pin_3+"<td>"+results.rows.item(i).pin_4+"<td>"+results.rows.item(i).pin_5);
					v_pin1 = results.rows.item(i).pin_1;
					v_pin2 = results.rows.item(i).pin_2;
					v_pin3 = results.rows.item(i).pin_3;
					v_pin4 = results.rows.item(i).pin_4;
					v_pin5 = results.rows.item(i).pin_5;
				}
			}, null);
		});
        this.getView().byId("idSetMPin").setVisible(false);
		this.getView().byId("idLogin").setVisible(false);
		this.getView().byId("idFinalLogin").setVisible(true)
	},


	onForgotPin : function(){

	    myPin.transaction(function(transaction) {
         var executeQuery = "DROP TABLE IF EXISTS phonegap_pro";
         transaction.executeSql(executeQuery, [],
         function(tx, result) {
        /* alert('Table deleted successfully.');*/
         },
         function(error){
         /*alert('Error occurred while droping the table.');*/
         }
         );
         });

             var success = function(status) {
                /* alert('Message: ' + status);*/
             };
             var error = function(status) {
                /* alert('Error: ' + status);*/
             };
             window.CacheClear(success, error);


		this.getView().byId("idSetPin1").setValue("");
		this.getView().byId("idSetPin2").setValue("");
		this.getView().byId("idSetPin3").setValue("");
		this.getView().byId("idSetPin4").setValue("");
		this.getView().byId("idSetPin5").setValue("");
		this.getView().byId("idSetMPin").setVisible(false);
		this.getView().byId("idFinalLogin").setVisible(false);
		this.getView().byId("idLogin").setVisible(true);
	},
	/******************* Once the MPIN is validated for Login, Navigate to the List Page ***********************/

	onValidatingMPIN : function(){
		var that = this;
		var oModel = this.getView().getModel("oModel");

		/*var pinC1 = oModel.getProperty("/pinC1");
		var pinC2 = oModel.getProperty("/pinC2");
		var pinC3 = oModel.getProperty("/pinC3");
		var pinC4 = oModel.getProperty("/pinC4");
		var pinC5 = oModel.getProperty("/pinC5");*/
		var setPin1 =  oModel.getProperty("/setPin1");
		var setPin2 = oModel.getProperty("/setPin2");
		var setPin3 =  oModel.getProperty("/setPin3");
		var setPin4 = oModel.getProperty("/setPin4");
		var setPin5 =  oModel.getProperty("/setPin5");
//		alert(v_pin1+v_pin2+v_pin3+v_pin4+v_pin5);
//		alert(setPin1+setPin2+setPin3+setPin4+setPin5);
		if(setPin1 === " " || setPin2 === " " || setPin3 === " " || setPin4 === " " || setPin5 === " "){
			sap.m.MessageToast.show("Invalid Pin", {

			});
			return;
		}
		if(!setPin1 || !setPin2|| !setPin3||! setPin4 ||! setPin5){
			sap.m.MessageToast.show("Invalid Pin.", {

			});
			return;
		}
		oDataModel.setCountSupported(false);
		oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oDataModel.oHeaders["X-CSRF-token"]="Fetch";
		var sUserName = oDataModel.sUser;
		that.getView().byId("idSetPin1").setValue("");
		that.getView().byId("idSetPin2").setValue("");
		that.getView().byId("idSetPin3").setValue("");
		that.getView().byId("idSetPin4").setValue("");
		that.getView().byId("idSetPin5").setValue("");

		if(v_pin1 === setPin1 && v_pin2 === setPin2 && v_pin3 === setPin3 && v_pin4 === setPin4 && v_pin5 === setPin5){
			that.oRouter.navTo("terumoList",{});
		}
		else{
			sap.m.MessageToast.show("Not a valid Pin", {
			});

			return;
		}
		//this.oRouter.navTo("terumoList",{});

	},

	/************************* on switching to next input while entering MPin *******************************/

	/*onMoveNextInput : function(oEvent){
		this.getView().byId("id1").attachBrowserEvent("keydown keyup keypress",{

		});
		 $(this).next().focus();
		 $("input").trigger(e);
		//var index = $('.ui-dform-text').index(this) + 1;

		var whichInput = oEvent.oSource.sId.split("-")[2][10];
		if(whichInput === "1"){
			this.getView().byId("idEnterPin2").focus();
		}else if(whichInput === "2"){
			this.getView().byId("idEnterPin3").focus();
		}else if(whichInput === "3"){
			this.getView().byId("idEnterPin4").focus();
		}else if(whichInput === "4"){
			this.getView().byId("idEnterPin5").focus();
		$('__xmlview0--id1-inner').eq(__input2).focus();
	} else if(whichInput=="5"){
		this.getView().byId("idConfiPin1").focus();
	}
	},

	onSetNextInput : function(oEvent){
		var whichInput = oEvent.oSource.sId.split("-")[2][8];
		if(whichInput === "1"){
			this.getView().byId("idSetPin2").focus();
		}else if(whichInput === "2"){
			this.getView().byId("idSetPin3").focus();
		}else if(whichInput === "3"){
			this.getView().byId("idSetPin4").focus();
		}else if(whichInput === "4"){
			this.getView().byId("idSetPin5").focus();
		$('__xmlview0--id1-inner').eq(__input2).focus();
	}
	},

	onMoveNextConfirmInput : function(oEvent){
		var whichInput = oEvent.oSource.sId.split("-")[2][10];
		if(whichInput === "1"){
			this.getView().byId("idConfiPin2").focus();
		}else if(whichInput === "2"){
			this.getView().byId("idConfiPin3").focus();
		}else if(whichInput === "3"){
			this.getView().byId("idConfiPin4").focus();
		}else if(whichInput === "4"){
			this.getView().byId("idConfiPin5").focus();
		$('__xmlview0--id1-inner').eq(__input2).focus();
	}
	},*/

	onMoveNext : function(oEvent){
		if(oEvent.mParameters.value && oEvent.mParameters.value !== ""){
			var oInput;
			var id = oEvent.getSource().sId.split("-")[2];    //stores the id of the current input after splitting
			var regexStr = id.match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+|)/g);
			if(regexStr[0].match("Enter")){
				oInput = regexStr[1];
			} 	else if(regexStr[0].match("Confi")){
				oInput = regexStr[1];
			} else {
				oInput = regexStr[1];
			}
			var asciiCode = oInput.charCodeAt(0)+1;
			if(oInput === "1"){
				this.getView().byId(regexStr[0].concat(String.fromCharCode(asciiCode))).focus();
				/*this.getView().byId("idEnterPin2").focus();      alternate to this*/
				return;
			}else if(oInput === "2"){
				this.getView().byId(regexStr[0].concat(String.fromCharCode(asciiCode))).focus();
				return;
			}else if(oInput === "3"){
				this.getView().byId(regexStr[0].concat(String.fromCharCode(asciiCode))).focus();
				return;
			}else if(oInput === "4"){
				this.getView().byId(regexStr[0].concat(String.fromCharCode(asciiCode))).focus();
				return;
			}
		}
	}

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf terumbto.wasteManagement
	 */
//	onBeforeRendering: function() {

//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf terumbto.wasteManagement
	 */
//	onAfterRendering: function() {

//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf terumbto.wasteManagement
	 */
//	onExit: function() {

//	}
});