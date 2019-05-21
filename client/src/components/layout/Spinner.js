import React, { Fragment } from 'react';
import spinner from './spinner.gif';

export default () => (
  <Fragment>
    <img
      style={{ width: '200px', margin: 'auto', display: 'block' }}
      src={spinner}
      alt="Loading..."
    />
  </Fragment>
);
