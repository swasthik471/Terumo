/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./CustomStyleClassSupport','./Element','./UIArea','./RenderManager','./ResizeHandler','./BusyIndicatorUtils'],function(q,C,E,U,R,a,B){"use strict";var b=E.extend("sap.ui.core.Control",{metadata:{stereotype:"control","abstract":true,publicMethods:["placeAt","attachBrowserEvent","detachBrowserEvent","getControlsByFieldGroup","triggerValidateFieldGroup","checkFieldGroupIds"],library:"sap.ui.core",properties:{"busy":{type:"boolean",defaultValue:false},"busyIndicatorDelay":{type:"int",defaultValue:1000},"busyIndicatorSize":{type:"sap.ui.core.BusyIndicatorSize",defaultValue:'Medium'},"visible":{type:"boolean",group:"Appearance",defaultValue:true},"fieldGroupIds":{type:"string[]",defaultValue:[]}},events:{validateFieldGroup:{enableEventBubbling:true,parameters:{fieldGroupIds:{type:"string[]"}}}}},constructor:function(i,S){this.bAllowTextSelection=true;E.apply(this,arguments);this.bOutput=this.getDomRef()!=null;if(this._sapUiCoreLocalBusy_initBusyIndicator){this._sapUiCoreLocalBusy_initBusyIndicator();}},renderer:null});b.prototype.clone=function(){var j=E.prototype.clone.apply(this,arguments);if(this.aBindParameters){for(var i=0,l=this.aBindParameters.length;i<l;i++){var P=this.aBindParameters[i];j.attachBrowserEvent(P.sEventType,P.fnHandler,P.oListener!==this?P.oListener:undefined);}}j.bAllowTextSelection=this.bAllowTextSelection;return j;};C.apply(b.prototype);b.prototype.isActive=function(){return q.sap.domById(this.sId)!=null;};b.prototype.invalidate=function(O){var u;if(this.bOutput&&(u=this.getUIArea())){if(!this._bIsBeingDestroyed){u.addInvalidatedControl(this);}}else{var P=this.getParent();if(P&&(this.bOutput||!(this.getVisible&&this.getVisible()===false))){P.invalidate(this);}}};b.prototype.rerender=function(){U.rerenderControl(this);};b.prototype.getDomRef=function(S){if(this.bOutput===false&&!this.oParent){return null;}return E.prototype.getDomRef.call(this,S);};b.prototype.allowTextSelection=function(i){this.bAllowTextSelection=i;return this;};b.prototype.attachBrowserEvent=function(i,j,l){if(i&&(typeof(i)==="string")){if(j&&typeof(j)==="function"){if(!this.aBindParameters){this.aBindParameters=[];}l=l||this;var P=function(){j.apply(l,arguments);};this.aBindParameters.push({sEventType:i,fnHandler:j,oListener:l,fnProxy:P});if(!this._sapui_bInAfterRenderingPhase){this.$().bind(i,P);}}}return this;};b.prototype.detachBrowserEvent=function(j,k,l){if(j&&(typeof(j)==="string")){if(k&&typeof(k)==="function"){var $=this.$(),i,P;l=l||this;if(this.aBindParameters){for(i=this.aBindParameters.length-1;i>=0;i--){P=this.aBindParameters[i];if(P.sEventType===j&&P.fnHandler===k&&P.oListener===l){this.aBindParameters.splice(i,1);$.unbind(j,P.fnProxy);}}}}}return this;};b.prototype.getRenderer=function(){return R.getRenderer(this);};b.prototype.placeAt=function(i,P){var j=sap.ui.getCore();if(j.isInitialized()){var k=i;if(typeof k==="string"){k=j.byId(i);}var I=false;if(!(k instanceof E)){k=j.createUIArea(i);I=true;}if(!k){return this;}if(!I){var l=k.getMetadata().getAggregation("content");var m=true;if(l){if(!l.multiple||l.type!="sap.ui.core.Control"){m=false;}}else if(!k.addContent||!k.insertContent||!k.removeAllContent){m=false;}if(!m){q.sap.log.warning("placeAt cannot be processed because container "+k+" does not have an aggregation 'content'.");return this;}}if(typeof P==="number"){k.insertContent(this,P);}else{P=P||"last";switch(P){case"last":k.addContent(this);break;case"first":k.insertContent(this,0);break;case"only":k.removeAllContent();k.addContent(this);break;default:q.sap.log.warning("Position "+P+" is not supported for function placeAt.");}}}else{var t=this;j.attachInitEvent(function(){t.placeAt(i,P);});}return this;};b.prototype.onselectstart=function(i){if(!this.bAllowTextSelection){i.preventDefault();i.stopPropagation();}};b.prototype.getIdForLabel=function(){return this.getId();};b.prototype.destroy=function(S){this._bIsBeingDestroyed=true;this._cleanupBusyIndicator();a.deregisterAllForControl(this.getId());if(!this.getVisible()){var P=document.getElementById(R.createInvisiblePlaceholderId(this));if(P&&P.parentNode){P.parentNode.removeChild(P);}}E.prototype.destroy.call(this,S);};var p=["focusin","focusout","keydown","keypress","keyup","mousedown","touchstart","touchmove","mouseup","touchend","click"],r=/^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|tr)$/i,o={onBeforeRendering:function(){if(this.getBusy()&&this.getDomRef()&&!this._busyIndicatorDelayedCallId&&this.getDomRef("busyIndicator")){H.call(this,false);}},onAfterRendering:function(){if(this.getBusy()&&this.getDomRef()&&!this._busyIndicatorDelayedCallId&&!this.getDomRef("busyIndicator")){var D=this.getBusyIndicatorDelay();if(D){this._busyIndicatorDelayedCallId=q.sap.delayedCall(D,this,A);}else{A.call(this);}}}};function A(){if(!this.getBusy()){return;}var $=this.$(this._sBusySection);if(this._busyIndicatorDelayedCallId){q.sap.clearDelayedCall(this._busyIndicatorDelayedCallId);delete this._busyIndicatorDelayedCallId;}if(!$||$.length===0){q.sap.log.warning("BusyIndicator could not be rendered. The outer control instance is not valid anymore.");return;}var t=$.get(0)&&$.get(0).tagName;if(r.test(t)){q.sap.log.warning("BusyIndicator cannot be placed in elements with tag '"+t+"'.");return;}if($.css('position')=='static'){this._busyStoredPosition='static';$.css('position','relative');}this._$BusyIndicator=B.addHTML($,this.getId()+"-busyIndicator",this.getBusyIndicatorSize());H.call(this,true);}function f(){var $=this.$(this._sBusySection);$.removeClass('sapUiLocalBusy');$.removeAttr('aria-busy');if(this._busyStoredPosition){$.css('position',this._busyStoredPosition);delete this._busyStoredPosition;}if(this._$BusyIndicator){H.call(this,false);this._$BusyIndicator.remove();delete this._$BusyIndicator;}}function s(i){var t=i.target===this._$BusyIndicator.get(0);if(t&&i.type==='keydown'&&i.keyCode===9){q.sap.log.debug("Local Busy Indicator Event keydown handled: "+i.type);var j=i.shiftKey?this.oBusyTabbableBefore:this.oBusyTabbableAfter;j.setAttribute("tabindex",-1);this.bIgnoreBusyFocus=true;j.focus();this.bIgnoreBusyFocus=false;j.setAttribute("tabindex",0);}else if(t&&(i.type==='mousedown'||i.type==='touchdown')){q.sap.log.debug("Local Busy Indicator click handled on busy area: "+i.target.id);}else{q.sap.log.debug("Local Busy Indicator Event Suppressed: "+i.type);i.preventDefault();i.stopImmediatePropagation();}}function c(){if(!this.bIgnoreBusyFocus){this._$BusyIndicator.get(0).focus();}}function d(i){var j=document.createElement("span");j.setAttribute("tabindex",0);j.addEventListener('focusin',i);return j;}function e(i,j){if(i.parentNode){i.parentNode.removeChild(i);}i.removeEventListener('focusin',j);}function g(j,$,k){var S=[];for(var i=0;i<p.length;i++){j.addEventListener(p[i],k,{capture:true,passive:false});S.push(q.sap._suppressTriggerEvent(p[i],j,$.get(0)));}$.bind('keydown',k);return S;}function h(j,$,k,S){var i;if(j){for(i=0;i<p.length;i++){j.removeEventListener(p[i],k,{capture:true,passive:false});}}if(S){for(i=0;i<S.length;i++){q.sap._releaseTriggerEvent(S[i]);}}if($){$.unbind('keydown',k);}}function H(i){var j=this.getDomRef(this._sBusySection);if(i){if(j){this.fnRedirectBusyFocus=c.bind(this);this.oBusyTabbableBefore=d(this.fnRedirectBusyFocus);this.oBusyTabbableAfter=d(this.fnRedirectBusyFocus);j.parentNode.insertBefore(this.oBusyTabbableBefore,j);j.parentNode.insertBefore(this.oBusyTabbableAfter,j.nextSibling);this._fnSuppressDefaultAndStopPropagationHandler=s.bind(this);this._aSuppressHandler=g(j,this._$BusyIndicator,this._fnSuppressDefaultAndStopPropagationHandler);}else{q.sap.log.warning("fnHandleInteraction called with bBusy true, but no DOMRef exists!");}}else{if(this.oBusyTabbableBefore){e(this.oBusyTabbableBefore,this.fnRedirectBusyFocus);delete this.oBusyTabbableBefore;}if(this.oBusyTabbableAfter){e(this.oBusyTabbableAfter,this.fnRedirectBusyFocus);delete this.oBusyTabbableAfter;}delete this.fnRedirectBusyFocus;h(j,this._$BusyIndicator,this._fnSuppressDefaultAndStopPropagationHandler,this._aSuppressHandler);}}b.prototype.setBusy=function(i,j){if(!!i==this.getProperty("busy")){return this;}this._sBusySection=j;this.setProperty("busy",i,true);if(i){this.addDelegate(o,false,this);}else{this.removeDelegate(o);if(this._busyIndicatorDelayedCallId){q.sap.clearDelayedCall(this._busyIndicatorDelayedCallId);delete this._busyIndicatorDelayedCallId;}}if(!this.getDomRef()){return this;}if(i){if(this.getBusyIndicatorDelay()<=0){A.call(this);}else{this._busyIndicatorDelayedCallId=q.sap.delayedCall(this.getBusyIndicatorDelay(),this,A);}}else{f.call(this);}return this;};b.prototype.isBusy=function(){return this.getProperty("busy");};b.prototype.setBusyIndicatorDelay=function(D){this.setProperty("busyIndicatorDelay",D,true);return this;};b.prototype._cleanupBusyIndicator=function(){if(this._busyIndicatorDelayedCallId){q.sap.clearDelayedCall(this._busyIndicatorDelayedCallId);delete this._busyIndicatorDelayedCallId;}H.call(this,false);};b.prototype.getControlsByFieldGroupId=function(F){return this.findAggregatedObjects(true,function(i){if(i instanceof b){return i.checkFieldGroupIds(F);}return false;});};b.prototype.checkFieldGroupIds=function(F){if(typeof F==="string"){if(F===""){return this.checkFieldGroupIds([]);}return this.checkFieldGroupIds(F.split(","));}var j=this._getFieldGroupIds();if(q.isArray(F)){var k=0;for(var i=0;i<F.length;i++){if(j.indexOf(F[i])>-1){k++;}}return k===F.length;}else if(!F&&j.length>0){return true;}return false;};b.prototype.triggerValidateFieldGroup=function(F){this.fireValidateFieldGroup({fieldGroupIds:F});};return b;});
