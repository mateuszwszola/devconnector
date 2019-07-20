import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PostForm = () => {
  const [text, setText] = useState('');

  const handleSubmit = e => {
    e.preventDefault();

    // TODO: Create a post
  };

  const handleChange = e => {
    const { value } = e.target;
    setText(value);
  };

  return (
    <div className="post-form">
      <div className="bg-primary p">
        <h3>Say something...</h3>
      </div>
      <form className="form my-1" onSubmit={handleSubmit}>
        <textarea
          name="text"
          cols="30"
          rows="5"
          placeholder="Create a post"
          required
          value={text}
          onChange={handleChange}
        />
        <input type="submit" className="btn btn-dark my-1" value="Submit" />
      </form>
    </div>
  );
};

PostForm.propTypes = {};

export default PostForm;
