import { LightningElement, wire, track, api} from 'lwc';
import getAssets from '@salesforce/apex/AssetManagementController.getAssetsByAccount'
import renewCancel from '@salesforce/apex/AssetManagementController.renewCancelAsset'
const columns = [
    { label: 'Asset Name', fieldName: 'Name', type: 'text' },
    { label: 'Lifecycle Start Date', fieldName: 'LifecycleStartDate',type: 'date', typeAttributes: {
        day: "2-digit",
        month: "2-digit",
        year:"numeric",
        timeZone:"UTC"
    }},
    { label: 'Lifecycle End Date', fieldName: 'LifecycleEndDate', type: 'date', typeAttributes: {
        day: "2-digit",
        month: "2-digit",
        year:"numeric",
        timeZone:"UTC"
    }},
    { label: 'Renewal Term Unit', fieldName: 'RenewalTermUnit', type: 'text'},
    { label: 'Renewal Term', fieldName: 'RenewalTerm', type: 'Number'},
];



export default class AssetManagement extends LightningElement {
    isButtonsActivated = true;
    isCancelDatePopup = false;
    isAmendPopup = false;
    @track assetList;
    @track error;
    @api recordId
    @track columns = columns;
    selectedRows = [];
    @track cancelledDate
    @track amendedDate
    @track quantity
    @track isLoaded = false;

    @wire(getAssets , {accountId : '$recordId'})
    assets({error, data}){
        if(data){
            this.assetList = data;
        }
        else if(error){
            this.error = error;
            this.assetList = undefined;
        }
    }

    handleRowSelection = event => {
        this.selectedRows =event.detail.selectedRows;
        console.log(this.selectedRows);
        this.isButtonsActivated =  this.selectedRows.length > 0 ?  false : true;
    }

    toggleCancelDatePopup = () => {
        this.isCancelDatePopup = this.isCancelDatePopup === false ? true : false
    }

    toggleAmendPopup = () => {
        this.isAmendPopup = this.isAmendPopup === false ? true : false;
    }

    renewCancelAction = event => {
        let actionType = event.currentTarget.name;

        this.isLoaded = true;
        console.log(actionType);
        let date = this.cancelledDate === undefined ? new Date() : this.cancelledDate;
        renewCancel({assetList : this.selectedRows, type: actionType, cancelDate: date})
        .then(() => {
            this.isLoaded = false
        })
        .catch((error) => {
            this.isLoaded = false;
            this.error = error;
        });
        this.isCancelDatePopup = false;
    }

    amendAction = event => {
        let actionType = event.currentTarget.name;

        this.isLoaded = true;
        console.log(actionType);
        let date = this.amendedDate === undefined ? new Date() : this.amendedDate;
        amend({assetList : this.selectedRows, amendedDate: date, quantity: quantity})
            .then(() => {
                this.isLoaded = false
            })
            .catch((error) => {
                this.isLoaded = false;
                this.error = error;
            });
        this.isAmendPopup = false;
    }

    handleDate(event){
        this.cancelledDate = event.currentTarget.value;
    }

    handleAmendDate(event) {
        this.amendedDate = event.currentTarget.value;
    }

    handleQuantity(event) {
        this.quantity = event.currentTarget.value;
    }

    get toggleCancelAssetButton(){
        return this.selectedRows.length > 0 && this.cancelledDate !== undefined ?  false : true;
    }

    get toggleAmendAssetButton() {
        return this.selectedRows.length > 0 && this.amendedDate !== undefined && this.quantity !== undefined ? false : true;
    }
}