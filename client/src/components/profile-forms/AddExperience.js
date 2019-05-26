import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addExperience } from '../../actions/profile';

const AddExperience = ({ addExperience, history }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    from: '',
    to: '',
    current: false,
    description: ''
  });

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'current') {
      setFormData({ ...formData, current: !current });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    addExperience(formData, history);
  };

  const { title, company, location, from, to, current, description } = formData;

  return (
    <Fragment>
      <h1 className="large text-primary">Add An Experience</h1>
      <p className="lead">
        <i className="fas fa-code-branch" /> Add any developer/programming
        positions that you have had in the past
      </p>
      <small>* = required field</small>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            value={title}
            onChange={handleChange}
            type="text"
            placeholder="* Job Title"
            name="title"
            required
          />
        </div>
        <div className="form-group">
          <input
            value={company}
            onChange={handleChange}
            type="text"
            placeholder="* Company"
            name="company"
            required
          />
        </div>
        <div className="form-group">
          <input
            value={location}
            onChange={handleChange}
            type="text"
            placeholder="Location"
            name="location"
          />
        </div>
        <div className="form-group">
          <h4>From Date</h4>
          <input value={from} onChange={handleChange} type="date" name="from" />
        </div>
        <div className="form-group">
          <p>
            <input
              value={current}
              checked={current}
              onChange={handleChange}
              type="checkbox"
              name="current"
            />{' '}
            Current Job
          </p>
        </div>
        <div className="form-group">
          <h4>To Date</h4>
          <input
            value={to}
            onChange={handleChange}
            disabled={current}
            type="date"
            name="to"
          />
        </div>
        <div className="form-group">
          <textarea
            value={description}
            onChange={handleChange}
            name="description"
            cols="30"
            rows="5"
            placeholder="Job Description"
          />
        </div>
        <input type="submit" className="btn btn-primary my-1" />
        <Link className="btn btn-light my-1" to="/dashboard">
          Go Back
        </Link>
      </form>
    </Fragment>
  );
};

AddExperience.propTypes = {
  addExperience: PropTypes.func.isRequired
};

export default connect(
  null,
  { addExperience }
)(AddExperience);
