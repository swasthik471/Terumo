/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/model/TreeBinding','sap/ui/model/odata/CountMode','sap/ui/model/ChangeReason','sap/ui/model/Filter','sap/ui/model/Sorter','sap/ui/model/odata/ODataUtils','sap/ui/model/TreeBindingUtils','sap/ui/model/odata/OperationMode','sap/ui/model/SorterProcessor','sap/ui/model/FilterProcessor','sap/ui/model/FilterType'],function(q,T,C,a,F,S,O,b,c,d,e,f){"use strict";var g=T.extend("sap.ui.model.odata.v2.ODataTreeBinding",{constructor:function(m,p,o,A,P,s){T.apply(this,arguments);this.mParameters=this.mParameters||P||{};this.sGroupId;this.sRefreshGroupId;this.oFinalLengths={};this.oLengths={};this.oKeys={};this.bNeedsUpdate=false;this._bRootMissing=false;this.aSorters=s||[];this.sFilterParams="";if(A instanceof F){A=[A];}this.aApplicationFilters=A;this.mRequestHandles={};this.oRootContext=null;this.iNumberOfExpandedLevels=(P&&P.numberOfExpandedLevels)||0;this.iRootLevel=(P&&P.rootLevel)||0;this.sCountMode=(P&&P.countMode)||this.oModel.sDefaultCountMode;if(this.sCountMode==C.None){q.log.fatal("To use an ODataTreeBinding at least one CountMode must be supported by the service!");}if(P){this.sBatchGroupId=P.groupId||P.batchGroupId;}this.bInitial=true;this._mLoadedSections={};this._iPageSize=0;this.sOperationMode=(P&&P.operationMode)||this.oModel.sDefaultOperationMode;this.bClientOperation=false;switch(this.sOperationMode){case c.Server:this.bClientOperation=false;break;case c.Client:this.bClientOperation=true;break;case c.Auto:this.bClientOperation=false;break;}this.iThreshold=(P&&P.threshold)||0;this.bThresholdRejected=false;this.iTotalCollectionCount=null;this.bUseServersideApplicationFilters=(P&&P.useServersideApplicationFilters)||false;this.oAllKeys=null;this.oAllLengths=null;this.oAllFinalLengths=null;}});g.DRILLSTATES={Collapsed:"collapsed",Expanded:"expanded",Leaf:"leaf"};g.prototype._getNodeFilterParams=function(p){var P=p.isRoot?this.oTreeProperties["hierarchy-node-for"]:this.oTreeProperties["hierarchy-parent-node-for"];var E=this._getEntityType();return O._createFilterParams([new F(P,"EQ",p.id)],this.oModel.oMetadata,E);};g.prototype._getLevelFilterParams=function(o,l){var E=this._getEntityType();return O._createFilterParams([new F(this.oTreeProperties["hierarchy-level-for"],o,l)],this.oModel.oMetadata,E);};g.prototype._loadSingleRootNodeByNavigationProperties=function(n,r){var t=this,G;if(this.mRequestHandles[r]){this.mRequestHandles[r].abort();}G=this.sRefreshGroupId?this.sRefreshGroupId:this.sGroupId;this.mRequestHandles[r]=this.oModel.read(n,{context:this.oContext,groupId:G,success:function(D){var N=t._getNavPath(t.getPath());if(D){var E=D;var k=t.oModel._getKey(E);var o=t.oModel.getContext('/'+k);t.oRootContext=o;t._processODataObject(o.getObject(),n,N);}else{t._bRootMissing=true;}t.bNeedsUpdate=true;delete t.mRequestHandles[r];t.fireDataReceived({data:D});},error:function(E){if(E&&E.statusCode!=0&&E.statusText!="abort"){t.bNeedsUpdate=true;t._bRootMissing=true;delete t.mRequestHandles[r];t.fireDataReceived();}}});};g.prototype.getRootContexts=function(s,l,t){var n=null,r={numberOfExpandedLevels:this.iNumberOfExpandedLevels},R=[];if(this.isInitial()){return R;}s=s||0;l=l||this.oModel.sizeLimit;t=t||0;var h=""+n+"-"+s+"-"+this._iPageSize+"-"+t;if(this.bHasTreeAnnotations){this.bDisplayRootNode=true;R=this._getContextsForNodeId(null,s,l,t);}else{n=this.oModel.resolve(this.getPath(),this.getContext());var i=this.oModel.isList(this.sPath,this.getContext());if(i){this.bDisplayRootNode=true;}if(this.bDisplayRootNode&&!i){if(this.oRootContext){return[this.oRootContext];}else if(this._bRootMissing){return[];}else{this._loadSingleRootNodeByNavigationProperties(n,h);}}else{r.navPath=this._getNavPath(this.getPath());if(!this.bDisplayRootNode){n+="/"+r.navPath;}R=this._getContextsForNodeId(n,s,l,t,r);}}return R;};g.prototype.getNodeContexts=function(o,s,l,t){var n,r={};if(this.isInitial()){return[];}if(this.bHasTreeAnnotations){n=this.oModel.getKey(o);r.level=parseInt(o.getProperty(this.oTreeProperties["hierarchy-level-for"]),10)+1;}else{var N=this._getNavPath(o.getPath());if(!N){return[];}n=this.oModel.resolve(N,o);r.navPath=this.oNavigationPaths[N];}return this._getContextsForNodeId(n,s,l,t,r);};g.prototype.hasChildren=function(o){if(this.bHasTreeAnnotations){if(!o){return false;}var D=o.getProperty(this.oTreeProperties["hierarchy-drill-state-for"]);var n=this.oModel.getKey(o);var l=this.oLengths[n];if(l===0&&this.oFinalLengths[n]){return false;}if(D==="expanded"||D==="collapsed"){return true;}else if(D==="leaf"){return false;}else{q.sap.log.warning("The entity '"+o.getPath()+"' has not specified Drilldown State property value.");if(D===undefined||D===""){return true;}return false;}}else{if(!o){return this.oLengths[this.getPath()]>0;}var l=this.oLengths[o.getPath()+"/"+this._getNavPath(o.getPath())];return l!==0;}};g.prototype.getChildCount=function(o){if(this.bHasTreeAnnotations){var h;if(!o){h=null;}else{h=this.oModel.getKey(o);}return this.oLengths[h];}else{if(!o){if(!this.bDisplayRootNode){return this.oLengths[this.getPath()+"/"+this._getNavPath(this.getPath())];}else{return this.oLengths[this.getPath()];}}return this.oLengths[o.getPath()+"/"+this._getNavPath(o.getPath())];}};g.prototype._getContextsForNodeId=function(n,s,l,t,r){var h=[],k;if(this.sOperationMode==c.Auto){if(this.iTotalCollectionCount==null){if(!this.bCollectionCountRequested){this._getCountForCollection();this.bCollectionCountRequested=true;}return[];}}s=s||0;l=l||this.oModel.iSizeLimit;t=t||0;if(this.sOperationMode==c.Auto){if(this.iThreshold>=0){t=Math.max(this.iThreshold,t);}}if(!this._mLoadedSections[n]){this._mLoadedSections[n]=[];}if(this.oFinalLengths[n]&&this.oLengths[n]<s+l){l=Math.max(this.oLengths[n]-s,0);}var j=this;var m=function(s){for(var i=0;i<j._mLoadedSections[n].length;i++){var D=j._mLoadedSections[n][i];if(s>=D.startIndex&&s<D.startIndex+D.length){return true;}}};var M=[];var i=Math.max((s-t-this._iPageSize),0);if(this.oKeys[n]){var o=s+l+(t);if(this.oLengths[n]){o=Math.min(o,this.oLengths[n]);}for(i;i<o;i++){k=this.oKeys[n][i];if(!k){if(!this.bClientOperation&&!m(i)){M=b.mergeSections(M,{startIndex:i,length:1});}}if(i>=s&&i<s+l){if(k){h.push(this.oModel.getContext('/'+k));}else{h.push(undefined);}}}var B=Math.max((s-t-this._iPageSize),0);var E=s+l+(t);var p=M[0]&&M[0].startIndex===B&&M[0].startIndex+M[0].length===E;if(M.length>0&&!p){i=Math.max((M[0].startIndex-t-this._iPageSize),0);var u=M[0].startIndex;for(i;i<u;i++){var k=this.oKeys[n][i];if(!k){if(!m(i)){M=b.mergeSections(M,{startIndex:i,length:1});}}}i=M[M.length-1].startIndex+M[M.length-1].length;var v=i+t+this._iPageSize;if(this.oLengths[n]){v=Math.min(v,this.oLengths[n]);}for(i;i<v;i++){var k=this.oKeys[n][i];if(!k){if(!m(i)){M=b.mergeSections(M,{startIndex:i,length:1});}}}}}else{if(!m(s)){var L=s-i;M=b.mergeSections(M,{startIndex:i,length:l+L+t});}}if(this.oModel.getServiceMetadata()){if(M.length>0){var P=[];var w="";if(this.bHasTreeAnnotations){if(this.sOperationMode=="Server"||this.bUseServersideApplicationFilters){w=this.getFilterParams();}if(n){w=w?"%20and%20"+w:"";var N=this.oModel.getContext("/"+n);var x=N.getProperty(this.oTreeProperties["hierarchy-node-for"]);var y=this._getNodeFilterParams({id:x});P.push("$filter="+y+w);}else if(n==null){var z="";if(!this.bClientOperation||this.iRootLevel>0){var A=this.bClientOperation?"GE":"EQ";z=this._getLevelFilterParams(A,this.iRootLevel);}if(z||w){if(w&&z){w="%20and%20"+w;}P.push("$filter="+z+w);}}}else{w=this.getFilterParams();if(w){P.push("$filter="+w);}}if(this.sCustomParams){P.push(this.sCustomParams);}if(!this.bClientOperation){for(i=0;i<M.length;i++){var R=M[i];this._mLoadedSections[n]=b.mergeSections(this._mLoadedSections[n],{startIndex:R.startIndex,length:R.length});this._loadSubNodes(n,R.startIndex,R.length,0,P,r,R);}}else{if(!this.oAllKeys&&!this.mRequestHandles[g.REQUEST_KEY_CLIENT]){this._loadCompleteTreeWithAnnotations(P);}}}}return h;};g.prototype._getCountForCollection=function(){if(!this.bHasTreeAnnotations||this.sOperationMode!=c.Auto){q.sap.log.error("The Count for the collection can only be retrieved with Hierarchy Annotations and in OperationMode.Auto.");return;}var p=[];function _(D){var j=D.__count?parseInt(D.__count,10):parseInt(D,10);this.iTotalCollectionCount=j;if(this.sOperationMode==c.Auto){if(this.iTotalCollectionCount<=this.iThreshold){this.bClientOperation=true;this.bThresholdRejected=false;}else{this.bClientOperation=false;this.bThresholdRejected=true;}this._fireChange({reason:a.Change});}}function h(E){if(E&&E.statusCode===0&&E.statusText==="abort"){return;}var j="Request for $count failed: "+E.message;if(E.response){j+=", "+E.response.statusCode+", "+E.response.statusText+", "+E.response.body;}q.sap.log.warning(j);}var A=this.oModel.resolve(this.getPath(),this.getContext());var l="";if(this.iRootLevel>0){l=this._getLevelFilterParams("GE",this.getRootLevel());}var s="";if(this.bUseServersideApplicationFilters){var s=this.getFilterParams();}if(l||s){if(s&&l){s="%20and%20"+s;}p.push("$filter="+l+s);}var i="";if(this.sCountMode==C.Request||this.sCountMode==C.Both){i="/$count";}else if(this.sCountMode==C.Inline){p.push("$top=0");p.push("$inlinecount=allpages");}if(A){this.oModel.read(A+i,{urlParameters:p,success:_.bind(this),error:h.bind(this),groupId:this.sRefreshGroupId?this.sRefreshGroupId:this.sGroupId});}};g.prototype._getCountForNodeId=function(n,s,l,t,p){var h=this,G;var P=[];function _(D){h.oFinalLengths[n]=true;h.oLengths[n]=parseInt(D,10);}function i(E){if(E&&E.statusCode===0&&E.statusText==="abort"){return;}var m="Request for $count failed: "+E.message;if(E.response){m+=", "+E.response.statusCode+", "+E.response.statusText+", "+E.response.body;}q.sap.log.warning(m);}var A;var j=this.getFilterParams()||"";var N="";if(this.bHasTreeAnnotations){var o=this.oModel.getContext("/"+n);var H=o.getProperty(this.oTreeProperties["hierarchy-node-for"]);A=this.oModel.resolve(this.getPath(),this.getContext());if(n!=null){N=this._getNodeFilterParams({id:H});}else{N=this._getLevelFilterParams("EQ",this.getRootLevel());}}else{A=n;}if(N||j){var k="";if(N&&j){k="%20and%20";}j="$filter="+j+k+N;P.push(j);}if(A){G=this.sRefreshGroupId?this.sRefreshGroupId:this.sGroupId;this.oModel.read(A+"/$count",{urlParameters:P,success:_,error:i,sorters:this.aSorters,groupId:G});}};g.prototype._loadSubNodes=function(n,s,l,t,p,P,r){var h=this,G,I=false;if((s||l)&&!this.bClientOperation){p.push("$skip="+s+"&$top="+(l+t));}if(!this.oFinalLengths[n]){if(this.sCountMode==C.Inline||this.sCountMode==C.Both){p.push("$inlinecount=allpages");I=true;}else if(this.sCountMode==C.Request){h._getCountForNodeId(n);}}var R=""+n+"-"+s+"-"+this._iPageSize+"-"+t;function j(D){if(D){h.oKeys[n]=h.oKeys[n]||[];if(I&&D.__count>=0){h.oLengths[n]=parseInt(D.__count,10);h.oFinalLengths[n]=true;}}if(q.isArray(D.results)&&D.results.length>0){if(h.bHasTreeAnnotations){var L={};for(var i=0;i<D.results.length;i++){var o=D.results[i];if(i==0){L[n]=s;}else if(L[n]==undefined){L[n]=0;}h.oKeys[n][L[n]]=h.oModel._getKey(o);L[n]++;}}else{for(var i=0;i<D.results.length;i++){var o=D.results[i];var k=h.oModel._getKey(o);h._processODataObject(o,"/"+k,P.navPath);h.oKeys[n][i+s]=k;}}}else if(D&&!q.isArray(D.results)){h.oKeys[null]=h.oModel._getKey(D);if(!h.bHasTreeAnnotations){h._processODataObject(D,n,P.navPath);}}h.oRequestHandle=null;delete h.mRequestHandles[R];h.bNeedsUpdate=true;h.fireDataReceived({data:D});}function E(o){if(o&&o.statusCode===0&&o.statusText==="abort"){return;}h.oRequestHandle=null;delete h.mRequestHandles[R];h.fireDataReceived();if(r){var L=[];for(var i=0;i<h._mLoadedSections[n].length;i++){var k=h._mLoadedSections[n][i];if(r.startIndex>=k.startIndex&&r.startIndex+r.length<=k.startIndex+k.length){if(r.startIndex!==k.startIndex&&r.length!==k.length){L=b.mergeSections(L,{startIndex:k.startIndex,length:r.startIndex-k.startIndex});L=b.mergeSections(L,{startIndex:r.startIndex+r.length,length:(k.startIndex+k.length)-(r.startIndex+r.length)});}}else{L.push(k);}}h._mLoadedSections[n]=L;}}if(n!==undefined){this.fireDataRequested();var A;if(this.bHasTreeAnnotations){A=this.oModel.resolve(this.getPath(),this.getContext());}else{A=n;}if(this.mRequestHandles[R]){this.mRequestHandles[R].abort();}G=this.sRefreshGroupId?this.sRefreshGroupId:this.sGroupId;this.mRequestHandles[R]=this.oModel.read(A,{urlParameters:p,success:j,error:E,sorters:this.aSorters,groupId:G});}};g.REQUEST_KEY_CLIENT="_OPERATIONMODE_CLIENT_TREE_LOADING";g.prototype._loadCompleteTreeWithAnnotations=function(u){var t=this;var r=g.REQUEST_KEY_CLIENT;var s=function(D){if(D.results&&D.results.length>0){var p={};var o;for(var k=0;k<D.results.length;k++){o=D.results[k];var h=o[t.oTreeProperties["hierarchy-node-for"]];if(p[h]){q.sap.log.warning("ODataTreeBinding - Duplicate data entry for key: "+h+"!");}p[h]=t.oModel._getKey(o);}for(var i=0;i<D.results.length;i++){o=D.results[i];var P=o[t.oTreeProperties["hierarchy-parent-node-for"]];var j=p[P];if(parseInt(o[t.oTreeProperties["hierarchy-level-for"]],10)===t.iRootLevel){j="null";}t.oKeys[j]=t.oKeys[j]||[];var K=t.oModel._getKey(o);t.oKeys[j].push(K);t.oLengths[j]=t.oLengths[j]||0;t.oLengths[j]++;t.oFinalLengths[j]=true;t._mLoadedSections[j]=t._mLoadedSections[j]||[];t._mLoadedSections[j][0]=t._mLoadedSections[j][0]||{startIndex:0,length:0};t._mLoadedSections[j][0].length++;}}else{t.oKeys["null"]=[];t.oLengths["null"]=0;t.oFinalLengths["null"]=true;}t.oAllKeys=q.extend(true,{},t.oKeys);t.oAllLengths=q.extend(true,{},t.oLengths);t.oAllFinalLengths=q.extend(true,{},t.oFinalLengths);delete t.mRequestHandles[r];t.bNeedsUpdate=true;if((t.aApplicationFilters&&t.aApplicationFilters.length>0)||(t.aFilters&&t.aFilters.length>0)){t._applyFilter();}if(t.aSorters&&t.aSorters.length>0){t._applySort();}t.fireDataReceived({data:D});};var E=function(o){delete t.mRequestHandles[r];var A=o.statusCode==0;if(!A){t.oKeys={};t.oLengths={};t.oFinalLengths={};t.oAllKeys={};t.oAllLengths={};t.oAllFinalLengths={};t._fireChange({reason:a.Change});}t.fireDataReceived();};this.fireDataRequested();if(this.mRequestHandles[r]){this.mRequestHandles[r].abort();}this.mRequestHandles[r]=this.oModel.read(this.getPath(),{context:this.oContext,urlParameters:u,success:s,error:E,sorters:this.aSorters});};g.prototype.resetData=function(o){if(o){var p=o.getPath();delete this.oKeys[p];delete this.oLengths[p];delete this.oFinalLengths[p];delete this._mLoadedSections[p];}else{this.oKeys={};this.bClientOperation=false;switch(this.sOperationMode){case c.Server:this.bClientOperation=false;break;case c.Client:this.bClientOperation=true;break;case c.Auto:this.bClientOperation=false;break;}this.bThresholdRejected=false;this.iTotalCollectionCount=null;this.bCollectionCountRequested=false;this.oAllKeys=null;this.oAllLengths=null;this.oAllFinalLengths=null;this.oLengths={};this.oFinalLengths={};this.oRootContext=null;this._bRootMissing=false;q.each(this.mRequestHandles,function(r,R){if(R){R.abort();}});this.mRequestHandles={};this._mLoadedSections={};this._iPageSize=0;this.sFilterParams="";}};g.prototype.refresh=function(h,G){if(typeof h==="string"){G=h;}this.sRefreshGroup=G;this._refresh(h);this.sRefreshGroup=undefined;};g.prototype._refresh=function(h,m,E){var j=false;if(!h){if(E){var r=this.oModel.resolve(this.sPath,this.oContext);if(r){if(r.indexOf("?")!==-1){r=r.split("?")[0];}var o=this.oModel.oMetadata._getEntityTypeByPath(r);if(o&&(o.entityType in E)){j=true;}}}if(m&&!j){q.each(this.oKeys,function(i,n){q.each(n,function(i,k){if(k in m){j=true;return false;}});if(j){return false;}});}if(!m&&!E){j=true;}}if(h||j){this.resetData();this.bNeedsUpdate=false;this.bRefresh=true;this._fireRefresh({reason:a.Refresh});}};g.prototype.filter=function(h,s,r){var i=false;s=s||f.Control;if(s==f.Control&&(!this.bClientOperation||this.sOperationMode==c.Server)){q.sap.log.warning("Filtering with ControlFilters is ONLY possible if the ODataTreeBinding is running in OperationMode.Client or "+"OperationMode.Auto, in case the given threshold is lower than the total number of tree nodes.");return;}if(!h){h=[];}if(h instanceof F){h=[h];}if(s===f.Control){this.aFilters=h;}else{this.aApplicationFilters=h;}if(!this.bInitial){if(this.bClientOperation&&(s===f.Control||(s===f.Application&&!this.bUseServersideApplicationFilters))){if(this.oAllKeys){this.oKeys=q.extend(true,{},this.oAllKeys);this.oLengths=q.extend(true,{},this.oAllLengths);this.oFinalLengths=q.extend(true,{},this.oAllFinalLengths);this._applyFilter();this._applySort();this._fireChange({reason:a.Filter});}else{this.sChangeReason=a.Filter;}}else{this.resetData();q.each(this.mRequestHandles,function(R,o){if(o){o.abort();}});this.sChangeReason=a.Filter;this._fireRefresh({reason:this.sChangeReason});}i=true;}if(r){return i;}else{return this;}};g.prototype._applyFilter=function(){var t=this;var A=this.aApplicationFilters||[];var h=this.aFilters||[];if(!this.bUseServersideApplicationFilters){h=h.concat(A);}var i=function(k){var j=e.apply([k],h,function(r,p){var l=t.oModel.getContext('/'+r);return t.oModel.getProperty(p,l);});return j.length>0;};var o={};this._filterRecursive({id:"null"},o,i);this.oKeys=o;if(!this.oKeys["null"]){q.sap.log.warning("Clientside filter did not match on any node!");}else{this.oLengths["null"]=this.oKeys["null"].length;this.oFinalLengths["null"]=true;}};g.prototype._filterRecursive=function(n,k,h){var j=this.oKeys[n.id];if(j){n.children=n.children||[];for(var i=0;i<j.length;i++){var o=this._filterRecursive({id:j[i]},k,h);if(o.isFiltered){k[n.id]=k[n.id]||[];k[n.id].push(o.id);n.children.push(o);}}if(n.children.length>0){n.isFiltered=true;}else{n.isFiltered=h(n.id);}if(n.isFiltered){this.oLengths[n.id]=n.children.length;this.oFinalLengths[n.id]=true;}return n;}else{n.isFiltered=h(n.id);return n;}};g.prototype.sort=function(s,r){var h=false;if(s instanceof S){s=[s];}this.aSorters=s||[];if(!this.bInitial){q.each(this.mRequestHandles,function(R,o){if(o){o.abort();}});if(this.bClientOperation){this.addSortComparators(s,this.oEntityType);if(this.oAllKeys){this._applySort();this._fireChange({reason:a.Sort});}else{this.sChangeReason=a.Sort;}}else{this.resetData(undefined,{reason:a.Sort});this.sChangeReason=a.Sort;this._fireRefresh({reason:this.sChangeReason});}h=true;}if(r){return h;}else{return this;}};g.prototype.addSortComparators=function(s,E){var p,t;if(!E){q.sap.log.warning("Cannot determine sort comparators, as entitytype of the collection is unkown!");return;}q.each(s,function(i,o){if(!o.fnCompare){p=this.oModel.oMetadata._getPropertyMetadata(E,o.sPath);t=p&&p.type;o.fnCompare=O.getComparator(t);}}.bind(this));};g.prototype._applySort=function(){var t=this,o;var G=function(k,p){o=t.oModel.getContext('/'+k);return t.oModel.getProperty(p,o);};for(var n in this.oKeys){d.apply(this.oKeys[n],this.aSorters,G);}};g.prototype.checkUpdate=function(h,m){var s=this.sChangeReason?this.sChangeReason:a.Change;var j=false;if(!h){if(this.bNeedsUpdate||!m){j=true;}else{q.each(this.oKeys,function(i,n){q.each(n,function(i,k){if(k in m){j=true;return false;}});if(j){return false;}});}}if(h||j){this.bNeedsUpdate=false;this._fireChange({reason:s});}this.sChangeReason=undefined;};g.prototype._getNavPath=function(p){var A=this.oModel.resolve(p,this.getContext());if(!A){return;}var P=A.split("/"),E=P[P.length-1],n;var s=E.split("(")[0];if(s&&this.oNavigationPaths[s]){n=this.oNavigationPaths[s];}return n;};g.prototype._processODataObject=function(o,p,n){var N=[],t=this;if(n&&n.indexOf("/")>-1){N=n.split("/");n=N[0];N.splice(0,1);}var r=this.oModel._getObject(p);if(q.isArray(r)){this.oKeys[p]=r;this.oLengths[p]=r.length;this.oFinalLengths[p]=true;}else if(r){this.oLengths[p]=1;this.oFinalLengths[p]=true;}if(n&&o[n]){if(q.isArray(r)){q.each(r,function(i,R){var o=t.getModel().getData("/"+R);t._processODataObject(o,"/"+R+"/"+n,N.join("/"));});}else if(typeof r==="object"){t._processODataObject(o,p+"/"+n,N.join("/"));}}};g.prototype._hasTreeAnnotations=function(){var m=this.oModel,M=m.oMetadata,A=m.resolve(this.getPath(),this.getContext()),E,t=M.mNamespaces["sap"],h=this;this.oTreeProperties={"hierarchy-level-for":false,"hierarchy-parent-node-for":false,"hierarchy-node-for":false,"hierarchy-drill-state-for":false};var s=function(){var i=0;var j=0;q.each(h.oTreeProperties,function(p,P){j++;if(P){i+=1;}});if(i===j){return true;}else if(i>0&&i<j){q.sap.log.warning("Incomplete hierarchy tree annotations. Please check your service metadata definition!");}return false;};if(this.mParameters&&this.mParameters.treeAnnotationProperties){this.oTreeProperties["hierarchy-level-for"]=this.mParameters.treeAnnotationProperties.hierarchyLevelFor;this.oTreeProperties["hierarchy-parent-node-for"]=this.mParameters.treeAnnotationProperties.hierarchyParentNodeFor;this.oTreeProperties["hierarchy-node-for"]=this.mParameters.treeAnnotationProperties.hierarchyNodeFor;this.oTreeProperties["hierarchy-drill-state-for"]=this.mParameters.treeAnnotationProperties.hierarchyDrillStateFor;return s();}if(A.indexOf("?")!==-1){A=A.split("?")[0];}E=M._getEntityTypeByPath(A);if(!E){q.sap.log.fatal("EntityType for path "+A+" could not be found.");return false;}q.each(E.property,function(i,p){if(!p.extensions){return true;}q.each(p.extensions,function(i,o){var n=o.name;if(o.namespace===t&&n in h.oTreeProperties&&!h.oTreeProperties[n]){h.oTreeProperties[n]=p.name;}});});return s();};g.prototype.initialize=function(){if(this.oModel.oMetadata&&this.oModel.oMetadata.isLoaded()&&this.bInitial){var i=this.isRelative();if(!i||(i&&this.oContext)){this._initialize();}this._fireRefresh({reason:a.Refresh});}return this;};g.prototype._initialize=function(){this.bInitial=false;this.bHasTreeAnnotations=this._hasTreeAnnotations();this.oEntityType=this._getEntityType();this._processSelectParameters();this._applyAdapter();return this;};g.prototype.setContext=function(o){if(this.oContext!==o){this.oContext=o;if(!this.isRelative()){return;}var r=this.oModel.resolve(this.sPath,this.oContext);if(r){this.resetData();this._initialize();this._fireChange({reason:a.Context});}else{if(!q.isEmptyObject(this.oAllKeys)||!q.isEmptyObject(this.oKeys)||!q.isEmptyObject(this._aNodes)){this.resetData();this._fireChange({reason:a.Context});}}}};g.prototype.applyAdapterInterface=function(){this.getContexts=this.getContexts||function(){return[];};this.getNodes=this.getNodes||function(){return[];};this.getLength=this.getLength||function(){return 0;};this.isLengthFinal=this.isLengthFinal||function(){return false;};this.getContextByIndex=this.getContextByIndex||function(){return;};this.attachSelectionChanged=this.attachSelectionChanged||function(D,h,l){this.attachEvent("selectionChanged",D,h,l);return this;};this.detachSelectionChanged=this.detachSelectionChanged||function(h,l){this.detachEvent("selectionChanged",h,l);return this;};this.fireSelectionChanged=this.fireSelectionChanged||function(A){this.fireEvent("selectionChanged",A);return this;};return this;};g.prototype._applyAdapter=function(){var m="hierarchy-node-descendant-count-for";if(this.bHasTreeAnnotations){var A=this.oModel.resolve(this.getPath(),this.getContext());if(A.indexOf("?")!==-1){A=A.split("?")[0];}var E=this.oModel.oMetadata._getEntityTypeByPath(A);var t=this;q.each(E.property,function(I,p){if(!p.extensions){return true;}q.each(p.extensions,function(I,o){var n=o.name;if(o.namespace===t.oModel.oMetadata.mNamespaces["sap"]&&n==m){t.oTreeProperties[n]=p.name;}});});this.oTreeProperties[m]=this.oTreeProperties[m]||(this.mParameters.treeAnnotationProperties&&this.mParameters.treeAnnotationProperties.hierarchyNodeDescendantCountFor);if(this.oTreeProperties[m]&&this.sOperationMode==c.Server){if(this.mParameters&&this.mParameters.select&&this.mParameters.select.indexOf(this.oTreeProperties[m])==-1){this.mParameters.select+=(","+this.oTreeProperties[m]);this.sCustomParams=this.oModel.createCustomParams(this.mParameters);}var h=sap.ui.requireSync("sap/ui/model/odata/ODataTreeBindingFlat");h.apply(this);}else{var i=sap.ui.requireSync("sap/ui/model/odata/ODataTreeBindingAdapter");i.apply(this);}}else if(this.oNavigationPaths){var i=sap.ui.requireSync("sap/ui/model/odata/ODataTreeBindingAdapter");i.apply(this);}else{q.sap.log.error("Neither hierarchy annotations, nor navigation properties are specified to build the tree.",this);}};g.prototype._processSelectParameters=function(){if(this.mParameters){this.oNavigationPaths=this.mParameters.navigation;if(this.mParameters.select){var s=this.mParameters.select.split(",");var n=[];if(this.oNavigationPaths){q.each(this.oNavigationPaths,function(p,P){if(q.inArray(P,n)==-1){n.push(P);}});}q.each(n,function(p,P){if(q.inArray(P,s)==-1){s.push(P);}});if(this.bHasTreeAnnotations){q.each(this.oTreeProperties,function(A,t){if(t){if(q.inArray(t,s)==-1){s.push(t);}}});}this.mParameters.select=s.join(",");}this.sCustomParams=this.oModel.createCustomParams(this.mParameters);}if(!this.bHasTreeAnnotations&&!this.oNavigationPaths){q.sap.log.error("Neither navigation paths parameters, nor (complete/valid) tree hierarchy annotations where provided to the TreeBinding.");this.oNavigationPaths={};}};g.prototype.getDownloadUrl=function(s){var p=[],P;if(s){p.push("$format="+encodeURIComponent(s));}if(this.aSorters&&this.aSorters.length>0){p.push(O.createSortParams(this.aSorters));}if(this.getFilterParams()){p.push("$filter="+this.getFilterParams());}if(this.sCustomParams){p.push(this.sCustomParams);}P=this.oModel.resolve(this.sPath,this.oContext);if(P){return this.oModel._createRequestUrl(P,null,p);}};g.prototype.setNumberOfExpandedLevels=function(l){l=l||0;if(l<0){q.sap.log.warning("ODataTreeBinding: numberOfExpandedLevels was set to 0. Negative values are prohibited.");l=0;}this.iNumberOfExpandedLevels=l;this._fireChange();};g.prototype.getNumberOfExpandedLevels=function(){return this.iNumberOfExpandedLevels;};g.prototype.setRootLevel=function(r){r=parseInt(r||0,10);if(r<0){q.sap.log.warning("ODataTreeBinding: rootLevels was set to 0. Negative values are prohibited.");r=0;}this.iRootLevel=r;this.refresh();};g.prototype.getRootLevel=function(){return parseInt(this.iRootLevel,10);};g.prototype._getEntityType=function(){var r=this.oModel.resolve(this.sPath,this.oContext);if(r){var E=this.oModel.oMetadata._getEntityTypeByPath(r);return E;}return undefined;};g.prototype.getFilterParams=function(){if(this.aApplicationFilters){this.aApplicationFilters=q.isArray(this.aApplicationFilters)?this.aApplicationFilters:[this.aApplicationFilters];if(this.aApplicationFilters.length>0&&!this.sFilterParams){this.sFilterParams=O._createFilterParams(this.aApplicationFilters,this.oModel.oMetadata,this.oEntityType);this.sFilterParams=this.sFilterParams?this.sFilterParams:"";}}else{this.sFilterParams="";}return this.sFilterParams;};return g;});
