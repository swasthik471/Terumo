jQuery.sap.declare("terumo.util.formatter");

terumo.util.formatter = { 

		fnReasonCode : function(oValue) {
			if(oValue && oValue === "0000") {
				return "";
			} else {
				return oValue;
			}
		},
		fnHeaderColor : function(oValue){
		    this.removeStyleClass("inctureMDBarOfflineClass");
		    this.removeStyleClass("inctureMDBarClass");
		    if (oValue === true) {
		    this.addStyleClass("inctureMDBarOfflineClass");
		    } else {
		    this.addStyleClass("inctureMDBarClass");
		    }
        return true;
		},
		fnUnSyncVisible : function(sValue) {
            if (sValue >0) {
            return true;
            } else {
            return false;
            }
      }
};