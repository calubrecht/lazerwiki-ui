import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {instance as DS_instance} from './svc/DataService';
import {instance as US_instance} from './svc/UserService';
import NsTree from './NsTree';

import './MovePageFrame.css';

export default class MovePageFrame extends Component
{
    static propTypes = {
      initData: PropTypes.string, doClose: PropTypes.func
    };
    constructor(props) {
        super(props);
        this.dataService = DS_instance();
        this.userService = US_instance();
        let namespace = ''
        let pageName = props.initData;
        if (pageName && pageName.indexOf(':') !== -1 ) {
            namespace = pageName.slice(0, pageName.lastIndexOf(':'));
            pageName = pageName.slice(pageName.lastIndexOf(':')+1);
        }
        this.state = {namespace: namespace, pageName: pageName, initialNS: namespace, initialPage: pageName, user:this.userService.getUser(), serverImages:[], enabled:false, message:"", errorMessage:false, nsTree:{children:[]}};
        this.redirectDlgRef = React.createRef();
    }

    componentDidMount()
    {
        this.userService.addListener(this);
        this.fetchPageList();
    }

    componentWillUnmount() {
        this.userService.removeListener(this);
    }

    fetchPageList() {
        this.dataService.fetchPageList().then( (pageData) => this.setState({nsTree: pageData.namespaces, enabled:true}));
    }


    render()
    {
        let messageClass = this.state.errorMessage ? "error" : "message";
        let enabled = this.state.enabled;
        let moveEnabled = !(this.state.pageName === this.state.initialPage && this.state.namespace === this.state.initialNS);
        let redirectD = this.renderRedirectDlg();
        return <div className="movePageFrame">
            <button onClick={() => this.props.doClose()} className="close button-unstyled">X</button>
            <h2 className="title">Move Page</h2>
            <div className="movePageFrameContent">
                <div className="nsTreeSelector">
                    <h3>Namespace</h3>
                    <NsTree nsTree={this.state.nsTree} selectNS={(ns) => this.selectNS(ns)} />
                </div>
                <div className="movePageSelector">
                    <h3>New Destination</h3>
                    {this.state.user && <form className="moveLocationBox">
                        <div><label htmlFor="moveFileNS" className="label">NS</label><input id="moveFileNS" disabled={!enabled} onChange={evt => this.setState({namespace: evt.target.value})} value={this.state.namespace}></input></div>
                        <div><label htmlFor="moveFilePagename" className="label">Page Name</label><input id="moveFilePagename" disabled={!enabled} onChange={evt => this.setState({pageName: evt.target.value})} value={this.state.pageName}></input></div>
                        <div><button onClick={(ev) => this.movePage(ev)} disabled={!moveEnabled}>Move</button> to {this.renderPage()}</div>
                    </form>}
                    <div id="message" className={messageClass}>{this.state.message}</div>
                </div>
            </div>
            {redirectD}
        </div>;
    }

    handleError(e) {
        this.setState({"message": e.message, "errorMessage": true, enabled:true})
    }

    movePage(ev) {
        ev.preventDefault();
        this.setState({enabled: false});
        DS_instance().movePage(this.state.initialNS, this.state.initialPage, this.state.namespace, this.state.pageName).then( data => {
            if (data.success) {
                this.redirectDlgRef?.current?.showModal?.();
            }
            else {
                this.handleError(data);
            }
        }).catch(e => this.handleError({message: e}));
    }


    setUser(user) {
        this.setState({user: user});
        this.fetchPageList();
    }

    selectNS(ns) {
        this.setState({namespace: ns});
    }

    renderPage() {
        return this.state.namespace ? this.state.namespace + ":" + this.state.pageName : this.state.pageName;
    }

    renderRedirectDlg() {
        let pageName = this.renderPage();
        return (<dialog className="moveRedirectDialog" ref={this.redirectDlgRef} >
            <div>Page Moved to <a href={"/page/"+pageName}>{pageName}</a></div>
        </dialog>);
    }
}
