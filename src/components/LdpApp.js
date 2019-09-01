import React, { Component } from 'react'
import {createBrowserHistory} from 'history'
import '../assets/LdpApp.css'
import Config from '../Config'
import Client from '../utils/Client'
import {Button, Grid} from '@material-ui/core';
import {Header, LdpType, Resource, Versions, Audit, Containment, Membership, NonRDFSource, Alerts, Modal, Editor}   from '.'
import ReactJson from 'react-json-view'
import { LDP } from '../utils/Vocab'

class App extends Component {

  constructor(props, context) {
    super(props, context);

    // Define state
    this.state = {
      identifier: '',
      err: '',
      types: [],
      mementos: [],
      contentType: '',
      children: [],
      members: [],
      audit: [],
      resource: '',
      content: ''
    }

    // Function bindings
    this.resourceClick = this.resourceClick.bind(this);
    this.modifyClick = this.modifyClick.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEdit = this.handleEdit.bind(this);

    // Set up history
    this.history = createBrowserHistory();
    this.history.push('/', { id: '' });
    this.history.listen(this.handleNavigation);
  }

  /**
   * Load the data for the selected resource.
   */
  loadResource = (values = {}) => {
    const url = Config.BASE_URL + (values.identifier || '');
    const client = new Client(url);
    client.fetchHead().then(headers => {
      const state = {
        identifier: values.identifier,
        err: headers.err,
        types: headers.types,
        mementos: headers.mementos,
        contentType: headers.contentType,
        children: [],
        members: [],
        audit: [],
        resource: '',
        content: ''
      };
      if (headers.err) {
        this.setState(() => state);
      } else {
        Promise.all([
          client.fetchResource(headers.description, Config.SERIALIZED_CONTENT_TYPE),
          client.fetchAudit(headers.description),
          client.fetchMembership(headers.description),
          client.fetchContainment(headers.description),
          this.shouldGetRemote(headers) ? client.fetchContent() : ''])
          .then(([resource, audit, membership, containment, content]) => {
             state.resource = resource;
             state.audit = audit;
             state.children = containment;
             state.members = membership;
             state.content = content;
             this.setState(() => state)
           });
      }
    });
  }

  /**
   * Determine if the remote content should be fetched directly.
   */
  shouldGetRemote({types = [], contentType = ''}) {
    return types.includes(LDP.NonRDFSource)
      && Client.parseContentType(contentType).type === "text"
  }

  /**
   * Handle any browser navigation actions.
   */
  handleNavigation(loc = {}, action) {
    this.loadResource({identifier: (loc.state || {}).id});
  }

  /**
   * Handle click events on resource IRIs.
   */
  resourceClick(e, override) {
    let id = override
    if (!id && e && e.target) {
      id = e.target.textContent
    }
    this.history.push('/', { id: id || '' });
  }

  modifyClick(method) {
    const modal = document.getElementById('modal-root');
    modal.style.display = 'block';
    this.setState(() => ({
      action: method
    }));
    window.onclick = (evt) => {
      if (evt.target.classList.contains('modal')) {
        modal.style.display = "none";
      }
    }
  }

  handleSubmit(identifier = '') {
    this.history.push('/', {id: identifier });
  }

  /**
   * Handle an edit event.
   */
  handleEdit(id = '') {
    this.loadResource({identifier: id});
  }

  /**
   * React initialization: load the root resource.
   */
  componentDidMount() {
    this.loadResource();
  }

  /**
   * React render.
   */
  render() {
    const url = this.state.identifier ? Config.BASE_URL + this.state.identifier : Config.BASE_URL;
    return (
      <Grid container>
        <Header identifier={this.state.identifier} onSubmit={this.handleSubmit}/>
        <Alerts alert={this.state.err}/>
        <Grid
          container
          spacing={3}
        >
          <Grid item style={{margin: 10}} xs>
            <Button variant="contained" color="primary" href={url}>{url}</Button>
            <LdpType types={this.state.types}/>
            <Versions versions={this.state.mementos} identifier={this.state.identifier} onClick={this.resourceClick}/>
            <Audit data={this.state.audit}/>
            <Containment children={this.state.children} onClick={this.resourceClick}/>
          </Grid>
          <Grid item style={{margin: 10}} xs={8}>
            <menu>
              { this.state.types.includes(LDP.Container) && <i title="New Resource" onClick={() => this.modifyClick("CREATE")} className="fa fa-plus"/> }
              <i title="Update Resource" onClick={() => this.modifyClick("UPDATE")} className="fa fa-cog"/>
              <i title="Delete Resource" onClick={() => this.modifyClick("DELETE")} className="fa fa-times"/>
            </menu>
            <h2>Resource</h2>
              {this.state.resource && Config.SERIALIZED_CONTENT_TYPE === "application/ld+json" ?
                <ReactJson src={JSON.parse(this.state.resource)}/> :
              <Resource data={this.state.resource}/>
              }
              <NonRDFSource identifier={this.state.identifier} content={this.state.content} contentType={this.state.contentType}/>
              <Membership members={this.state.members} onClick={this.resourceClick}/>
            <Modal>
              <Editor identifier={this.state.identifier} action={this.state.action} types={this.state.types} onSubmit={this.handleEdit}/>
            </Modal>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default App
