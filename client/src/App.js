import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { Navbar, Landing } from './components/layout';
import Register from './components/auth/Register';
import Login from './components/auth/Login';

import './App.css';

const App = () =>
  <Router>
    <Fragment>
      <Navbar />
      <Route exact path="/" component={Landing} />
      <section className="container">
        <Switch>
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route render={() => <div>Four oh four</div>} />
        </Switch>
      </section>
    </Fragment>
  </Router>





export default App;
