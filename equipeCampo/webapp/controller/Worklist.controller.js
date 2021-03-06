sap.ui.define([ "com/cpfl/equipecampo/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/ui/core/routing/History", "com/cpfl/equipecampo/model/formatter", "sap/ui/model/Filter", "sap/ui/model/FilterOperator" ], function(BaseController, JSONModel, History, formatter, Filter,
		FilterOperator) {
	"use strict";

	return BaseController.extend("com.cpfl.equipecampo.controller.Worklist", {

		formatter : formatter,

		/* =========================================================== */
		/* lifecycle methods */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * 
		 * @public
		 */
		onInit : function() {
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			this._oTable = oTable;
			// keeps the search state
			this._oTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle : this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle : this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject : this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage : this.getResourceBundle().getText("shareSendEmailWorklistMessage", [ location.href ]),
				tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay : 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table data is
		 * available, this handler method updates the table counter. This should
		 * only happen if the update was successful, which is why this handler is
		 * attached to 'updateFinished' and not to the table's list binding's
		 * 'dataReceived' method.
		 * 
		 * @param {sap.ui.base.Event}
		 *          oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle, oTable = oEvent.getSource(), iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [ iTotalItems ]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * 
		 * @param {sap.ui.base.Event}
		 *          oEvent the table selectionChange event
		 * @public
		 */
		onPress : function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		onSwitch : function() {
			// This code was generated by the layout editor.
			var status = this.getView().byId("pnlFiltro").getVisible();
			if (status === true) {
				this.getView().byId("pnlFiltro").setVisible(false);
			} else {
				this.getView().byId("pnlFiltro").setVisible(true);
			}
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * 
		 * @public
		 */
		onShareInJamPress : function() {
			var oViewModel = this.getModel("worklistView"), oShareDialog = sap.ui.getCore().createComponent({
				name : "sap.collaboration.components.fiori.sharing.dialog",
				settings : {
					object : {
						id : location.href,
						share : oViewModel.getProperty("/shareOnJamTitle")
					}
				}
			});
			oShareDialog.open();
		},

		onSearch : function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var oTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					oTableSearchState = [ new Filter("NAME", FilterOperator.Contains, sQuery) ];
				}
				this._applySearch(oTableSearchState);
			}

		},

		onPressNew : function() {
			// This code was generated by the layout editor.
			this._createObject();
		},

		_createObject : function() {
			this.getRouter().navTo("object", {
				objectId : "Novo"
			});
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort and group settings
		 * and refreshes the list binding.
		 * 
		 * @public
		 */
		onRefresh : function() {
			this._oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page On phones a additional history
		 * entry is created
		 * 
		 * @param {sap.m.ObjectListItem}
		 *          oItem selected Item
		 * @private
		 */
		_showObject : function(oItem) {
			this.getRouter().navTo("object", {
				objectId : oItem.getBindingContext().getProperty("SERVICE_TEAM_ID")
			});
		},

		onCentroHelp : function() {
			// This code was generated by the layout editor.
			var that = this;
			var oModel = this.getModel();
			var oInput = this.getView().byId("inCentroTrabalho");
			var oViewModel = this.getModel("objectView");
			var oValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idCentroHelp", {
				supportMultiselect : false,
				filterMode : true,
				title : "Centro de trabalho ativo",
				descriptionKey : "NAME",
				ok : function(oEventCanal) {
					var aTokens = oEventCanal.getParameter("tokens");
					for (var i = 0; i < aTokens.length; i++) {
						var token = aTokens[i];
						oInput.setValue(token.getText());
						var key = token.getKey();
					}
					oValueHelp.close();
				},
				cancel : function() {
					oValueHelp.close();
				},
				afterClose : function() {
					oValueHelp.destroy();
				}
			});
			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols : [ {
					label : "Centro de trabalho",
					template : "NAME"
				} ]
			});
			var oTable = oValueHelp.getTable();
			oTable.setModel(oColModel, "columns");
			oTable.setModel(this.getModel());

			var CentroList = [];
			var Centro;
			// teste
			oModel.read("/servicoCampoOData", {
				// filters : filters,
				success : function(oResponseSucess) {
					// that.aItemsCidade = [];
					var sortedTable = [];
					for (var i = 0; i < oResponseSucess.results.length; i++) {
						sortedTable.push(oResponseSucess.results[i].NAME);
					}

					sortedTable.sort();
					for (var i = 0; i < sortedTable.length; i++) {
						if (i === 0) {
							Centro = sortedTable[i];
							CentroList.push(sortedTable[i]);
						} else {
							if (Centro !== sortedTable[i]) {
								Centro = sortedTable[i];
								CentroList.push(sortedTable[i]);
							}
						}
					}

					var CentroSorted = [];
					for (var i = 0; i < CentroList.length; i++) {
						var itemsSorted = [];
						itemsSorted.NAME = CentroList[i];
						CentroSorted.push(itemsSorted);
					}

					var oTable = oValueHelp.getTable();
					oTable.setModel(oColModel, "columns");

					var oRowsModel = new sap.ui.model.json.JSONModel();
					oRowsModel.setData(CentroSorted);
					oTable.setModel(oRowsModel);
					if (oTable.bindRows) {
						oTable.bindRows("/");
					}

					oValueHelp.addStyleClass("sapUiSizeCozy");
					oValueHelp.open();
					oValueHelp.update();

				},
				error : function(oResponseSucess) {

				}

			});
		},

		onTipoCentroHelp : function() {
			// This code was generated by the layout editor.
			var that = this;
			var oModel = this.getModel();
			var oInput = this.getView().byId("inTipoCentroTrabalho");
			var oViewModel = this.getModel("objectView");
			var oValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idTipoCentroHelp", {
				supportMultiselect : false,
				filterMode : true,
				title : "Tipo de centro de trabalho",
				descriptionKey : "DESCRIPTION",
				ok : function(oEventCanal) {
					var aTokens = oEventCanal.getParameter("tokens");
					for (var i = 0; i < aTokens.length; i++) {
						var token = aTokens[i];
						oInput.setValue(token.getText());
						var key = token.getKey();
					}
					oValueHelp.close();
				},
				cancel : function() {
					oValueHelp.close();
				},
				afterClose : function() {
					oValueHelp.destroy();
				}
			});
			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols : [ {
					label : "Tipo de centro de trabalho",
					template : "DESCRIPTION"
				} ]
			});
			var oTable = oValueHelp.getTable();
			oTable.setModel(oColModel, "columns");
			oTable.setModel(this.getModel());

			var TipoCentroList = [];
			var TipoCentro;
			// teste
			oModel.read("/servicoCampoOData", {
				// filters : filters,
				success : function(oResponseSucess) {
					// that.aItemsCidade = [];
					var sortedTable = [];
					for (var i = 0; i < oResponseSucess.results.length; i++) {
						sortedTable.push(oResponseSucess.results[i].DESCRIPTION);
					}

					sortedTable.sort();
					for (var i = 0; i < sortedTable.length; i++) {
						if (i === 0) {
							TipoCentro = sortedTable[i];
							TipoCentroList.push(sortedTable[i]);
						} else {
							if (TipoCentro !== sortedTable[i]) {
								TipoCentro = sortedTable[i];
								TipoCentroList.push(sortedTable[i]);
							}
						}
					}

					var TipoCentroSorted = [];
					for (var i = 0; i < TipoCentroList.length; i++) {
						var itemsSorted = [];
						itemsSorted.DESCRIPTION = TipoCentroList[i];
						TipoCentroSorted.push(itemsSorted);
					}

					var oTable = oValueHelp.getTable();
					oTable.setModel(oColModel, "columns");

					var oRowsModel = new sap.ui.model.json.JSONModel();
					oRowsModel.setData(TipoCentroSorted);
					oTable.setModel(oRowsModel);
					if (oTable.bindRows) {
						oTable.bindRows("/");
					}

					oValueHelp.addStyleClass("sapUiSizeCozy");
					oValueHelp.open();
					oValueHelp.update();

				},
				error : function(oResponseSucess) {

				}

			});
		},

		onEquipeHelp : function() {
			// This code was generated by the layout editor.
			var that = this;
			var oModel = this.getModel();
			var oInput = this.getView().byId("inEquipe");
			var oViewModel = this.getModel("objectView");
			var oValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idEquipeHelp", {
				supportMultiselect : false,
				filterMode : true,
				title : "Equipe própria",
				descriptionKey : "IF_OWN_DESCRIPTION",
				ok : function(oEventCanal) {
					var aTokens = oEventCanal.getParameter("tokens");
					for (var i = 0; i < aTokens.length; i++) {
						var token = aTokens[i];
						oInput.setValue(token.getText());
						var key = token.getKey();
					}
					oValueHelp.close();
				},
				cancel : function() {
					oValueHelp.close();
				},
				afterClose : function() {
					oValueHelp.destroy();
				}
			});
			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols : [ {
					label : "Equipe própria",
					template : "IF_OWN_DESCRIPTION"
				} ]
			});
			var oTable = oValueHelp.getTable();
			oTable.setModel(oColModel, "columns");
			oTable.setModel(this.getModel());

			var EquipePropria = [];
			var Equipe;
			// teste
			oModel.read("/servicoCampoOData", {
				// filters : filters,
				success : function(oResponseSucess) {

					var sortedTable = [];
					for (var i = 0; i < oResponseSucess.results.length; i++) {
						sortedTable.push(oResponseSucess.results[i].IF_OWN_DESCRIPTION);
					}

					sortedTable.sort();
					for (var i = 0; i < sortedTable.length; i++) {
						if (i === 0) {
							Equipe = sortedTable[i];
							EquipePropria.push(sortedTable[i]);
						} else {
							if (Equipe !== sortedTable[i]) {
								Equipe = sortedTable[i];
								EquipePropria.push(sortedTable[i]);
							}
						}
					}

					var EquipePropriaSorted = [];
					for (var i = 0; i < EquipePropria.length; i++) {
						var itemsSorted = [];
						itemsSorted.IF_OWN_DESCRIPTION = EquipePropria[i];
						EquipePropriaSorted.push(itemsSorted);
					}

					var oTable = oValueHelp.getTable();
					oTable.setModel(oColModel, "columns");

					var oRowsModel = new sap.ui.model.json.JSONModel();
					oRowsModel.setData(EquipePropriaSorted);
					oTable.setModel(oRowsModel);
					if (oTable.bindRows) {
						oTable.bindRows("/");
					}

					oValueHelp.addStyleClass("sapUiSizeCozy");
					oValueHelp.open();
					oValueHelp.update();

				},
				error : function(oResponseSucess) {

				}

			});
		},

		onMunicipioHelp : function() {
			// This code was generated by the layout editor.
			var that = this;
			var oModel = this.getModel();
			var oInput = this.getView().byId("inMunicipio");
			var oViewModel = this.getModel("objectView");
			var oValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idMunicipioHelp", {
				supportMultiselect : false,
				filterMode : true,
				title : "Município",
				descriptionKey : "CITY_NAME",
				ok : function(oEventCanal) {
					var aTokens = oEventCanal.getParameter("tokens");
					for (var i = 0; i < aTokens.length; i++) {
						var token = aTokens[i];
						oInput.setValue(token.getText());
						var key = token.getKey();
					}
					oValueHelp.close();
				},
				cancel : function() {
					oValueHelp.close();
				},
				afterClose : function() {
					oValueHelp.destroy();
				}
			});
			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols : [ {
					label : "Município",
					template : "CITY_NAME"
				} ]
			});
			var oTable = oValueHelp.getTable();
			oTable.setModel(oColModel, "columns");
			oTable.setModel(this.getModel());

			var MunicipioList = [];
			var Municipio;
			// teste
			oModel.read("/servicoCampoOData", {
				// filters : filters,
				success : function(oResponseSucess) {
					// that.aItemsCidade = [];
					var sortedTable = [];
					for (var i = 0; i < oResponseSucess.results.length; i++) {
						sortedTable.push(oResponseSucess.results[i].CITY_NAME);
					}
					sortedTable.sort();
					for (var i = 0; i < sortedTable.length; i++) {
						if (i === 0) {
							Municipio = sortedTable[i];
							MunicipioList.push(sortedTable[i]);
						} else {
							if (Municipio !== sortedTable[i]) {
								Municipio = sortedTable[i];
								MunicipioList.push(sortedTable[i]);
							}
						}
					}

					var MunicipioSorted = [];
					for (var i = 0; i < MunicipioList.length; i++) {
						var itemsSorted = [];
						itemsSorted.CITY_NAME = MunicipioList[i];
						MunicipioSorted.push(itemsSorted);
					}

					var oTable = oValueHelp.getTable();
					oTable.setModel(oColModel, "columns");

					var oRowsModel = new sap.ui.model.json.JSONModel();
					oRowsModel.setData(MunicipioSorted);
					oTable.setModel(oRowsModel);
					if (oTable.bindRows) {
						oTable.bindRows("/");
					}

					oValueHelp.addStyleClass("sapUiSizeCozy");
					oValueHelp.open();
					oValueHelp.update();

				},
				error : function(oResponseSucess) {

				}

			});
			// oTable.setModel(oColModel, "columns");
			// oTable.setModel(this.getModel());
			// oTable.bindRows("/servicoCampoOData");
			// oValueHelp.open();
			// oValueHelp.update();
		},

		onClear : function() {
			var oTableSearchState = [];
			this.getView().byId("inCentroTrabalho").setValue("");
//			this.getView().byId("inTipoCentroTrabalho").setValue("");
			this.getView().byId("inEquipe").setValue("");
			this.getView().byId("inMunicipio").setValue("");
			// this.onRefresh();
			this._applySearch(oTableSearchState);
		},

		onFilter : function() {
			// This code was generated by the layout editor.
			this.onRefresh();
			var oTableSearchState = [];
			debugger;
			var idFiltroCentro = $.trim(this.byId("inCentroTrabalho").getValue());
//			var idFiltroTipoCentro = $.trim(this.byId("inTipoCentroTrabalho").getValue());
			var idFiltroEquipe = $.trim(this.byId("inEquipe").getValue());
			var idFiltroMunicipio = $.trim(this.byId("inMunicipio").getValue());

			if (idFiltroCentro) {
				oTableSearchState.push(new Filter("NAME", FilterOperator.Contains, idFiltroCentro));
			}
//			if (idFiltroTipoCentro) {
//				oTableSearchState.push(new Filter("DESCRIPTION", FilterOperator.Contains, idFiltroTipoCentro));
//			}

			if (idFiltroEquipe) {
				oTableSearchState.push(new Filter("IF_OWN_DESCRIPTION", FilterOperator.Contains, idFiltroEquipe));
			}

			if (idFiltroMunicipio) {
				oTableSearchState.push(new Filter("CITY_NAME", FilterOperator.Contains, idFiltroMunicipio));
			}

			this._applySearch(oTableSearchState);
		},
		/**
		 * Internal helper method to apply both filter and search state together on
		 * the list binding
		 * 
		 * @param {object}
		 *          oTableSearchState an array of filters for the search
		 * @private
		 */
		_applySearch : function(oTableSearchState) {
			var oViewModel = this.getModel("worklistView");
			this._oTable.getBinding("items").filter(oTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (oTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});