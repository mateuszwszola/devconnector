import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

const Comments = ({ comments, auth, deleteComment, postId }) => {
  return (
    <div className="comments">
      {comments.map(comment => (
        <div key={comment._id} className="post bg-white p-1 my-1">
          <div>
            <Link to={`/profile/${comment.user}`}>
              <img
                src={comment.avatar}
                alt={`${comment.name}s avatar`}
                className="round-img"
              />
              <h4>{comment.name}</h4>
            </Link>
          </div>
          <div>
            <p className="my-1">{comment.text}</p>
            <p className="post-date">
              Posted on <Moment format="DD/MM/YYYY">{comment.date}</Moment>
            </p>
            {auth.isAuthenticated && auth.user._id === comment.user ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => deleteComment(postId, comment._id)}
              >
                <i className="fas fa-times" />
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

Comments.propTypes = {
  comments: PropTypes.array.isRequired,
  auth: PropTypes.object.isRequired,
  deleteComment: PropTypes.func.isRequired,
  postId: PropTypes.string.isRequired
};

export default Comments;
