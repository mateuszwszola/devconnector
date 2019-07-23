import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AddCommentForm = ({ addComment, postId }) => {
  const [text, setText] = useState('');

  const handleChange = e => {
    const { value } = e.target;
    setText(value);
  };

  const handleSubmit = e => {
    e.preventDefault();

    addComment(postId, { text }, () => {
      setText('');
    });
  };

  return (
    <div className="post-form">
      <div className="bg-primary p">
        <h3>Leave A Comment</h3>
      </div>
      <form onSubmit={handleSubmit} className="form my-1">
        <textarea
          value={text}
          onChange={handleChange}
          name="text"
          cols="30"
          rows="5"
          placeholder="Comment on this post"
          required
        />
        <input type="submit" className="btn btn-dark my-1" value="Submit" />
      </form>
    </div>
  );
};

AddCommentForm.propTypes = {
  addComment: PropTypes.func.isRequired,
  postId: PropTypes.string.isRequired
};

export default AddCommentForm;
