import React, { Component } from "react";
import { Button, Header, Icon, Modal, Segment, Input, Select } from 'semantic-ui-react'
import { QRCode } from 'react-qr-svg';


class InvoiceForm extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
            <Receiver />
            </div>
        );
    }
}

const inlineStyle = {
    modal : {
      marginTop: '40px !important',
      marginLeft: 'auto',
      marginRight: 'auto',
    }
};

const ShowQRCodeModal = ({data, ready}) => (
    <Modal size='tiny' trigger={<Button fluid>Generate QR Code</Button>} closeIcon style={inlineStyle.modal}>
      <Header icon='paste' content='QR Code' />
      <Modal.Content style={{textAlign: 'center'}}>
        <QRCode style={{width: '100%', maxWidth: 300}} value={data} />
      </Modal.Content>
      <Modal.Actions>

      </Modal.Actions>
    </Modal>
  )

class Receiver extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transfer: {},
            qrData: '',
            price: null,
            lastUpdate: null,
            inputValue: {}
        };
        this.showQR = this.showQR.bind(this);
        this.upbeatPriceFeed = this.upbeatPriceFeed.bind(this);
        this.valueChange = this.valueChange.bind(this);
    }

    componentDidMount() {
        var _this = this;
        this.upbeatPriceFeed();
    }

    upbeatPriceFeed() {
        fetch("https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/60?code=CRIX.UPBIT.KRW-SBD&count=24&to")
        .then(res => res.json())
        .then(
            (result) => {
                var average = result.map((hr) => hr.highPrice).reduce((avg,e,i,arr)=>avg+e/arr.length,0);
                var date = new Date();
                this.setState({price: Math.round(average), lastFeedUpdate: date.toLocaleDateString() + " " + date.toLocaleTimeString()});
            },
            (error) => {
                alert("Critical Error! Please retry later." + error)
            })
        .catch((error) => {
            alert("Critical Error! Please retry later." + error)
        });
    }

    showQR() {
        if (!this.receiver.value) {
            alert("계정명을 입력하세요.");
            return;
        }
        if (!this.amount.value) {
            alert("금액을 입력하세요.");
            return;
        }
        
        if (this.message.value && this.message.value.length > 20) {
            alert("메시지는 20 글자 이내로 입력하세요.");
            return;
        }
        var msg = {
            user: this.receiver.value,
            amount: this.amount.value,
            currency: this.currency.value,
            message: this.message.value,
            rate: this.state.price
        };
    }

    valueChange(event, data) {
        this.state.inputValue[data.id] = data.value;
        this.setState(this.state.inputValue);
        console.log(this.state.inputValue);
    }
    
    render() {
        return (
            <div className="receiver-panel">
                <Segment>
                    Create a QR code with the values, and show it to your customer!
                </Segment>
                <h4>Account</h4>
                <Input fluid id='account' label='Account' placeholder='Receive account' onChange={this.valueChange} />
                <Input fluid id='amount' label='Amount' placeholder='Receive amount' onChange={this.valueChange} />

                {this.state.price && (
                <div className="price-feed">Upbit 24 시간 평균시세: 1 SBD = {this.state.price} KRW ({this.state.lastFeedUpdate})</div>
                )}

                <div className="input-group input-group-lg mb-2">
                    <div className="input-group-prepend">
                        <label className="input-group-text">청구금액</label>
                    </div>
                    <input type="text"  style={{width:200}}
                        className="form-control"
                        ref={(input) => { this.amount = input; }}
                        placeholder="청구 금액"/>
                    <select className="custom-select form-control"
                        ref={(input) => { this.currency = input; }}>
                        <option value='KRW'>원</option>
                        <option value='SBD'>SBD</option>
                    </select>
                </div>
                <div className="input-group input-group-lg mb-2">
                    <div className="input-group-prepend">
                        <label className="input-group-text">메시지</label>
                    </div>
                    <input type="text"
                        className="form-control"
                        ref={(input) => { this.message = input; }}
                        placeholder="이 메시지는 송금자에게 보여집니다."/>
                </div>
                <button
                    type="button"
                    className="btn btn-secondary btn-lg btn-block mb-2"
                    onClick={() => this.showQR()}>완료
                </button>
                {this.state.qrData && (
                    <img src={this.state.qrData}/>
                )}
                <ShowQRCodeModal data={"aa"}/>

            </div>
        )
    }
}

export default InvoiceForm;