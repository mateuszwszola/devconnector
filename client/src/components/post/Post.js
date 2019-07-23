import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getPost, addComment, deleteComment } from '../../actions/post';
import Spinner from '../layout/Spinner';
import AddCommentForm from './AddCommentForm';
import Comments from './Comments';

const Post = ({
  match,
  post: { post, loading },
  auth,
  getPost,
  addComment,
  deleteComment
}) => {
  const { post_id } = match.params;

  useEffect(() => {
    getPost(post_id);
  }, [getPost, post_id]);

  return (
    <>
      <Link to="/posts" className="btn">
        Back To Posts
      </Link>
      {loading || post === null ? (
        <Spinner />
      ) : (
        <>
          <div className="post bg-white p-1 m-1">
            <div>
              <Link to={`/profile/${post.user}`}>
                <img
                  src={post.avatar}
                  alt={`${post.name}s avatar`}
                  className="round-img"
                />
                <h4>{post.name}</h4>
              </Link>
            </div>
            <div>
              <p className="my-1">{post.text}</p>
            </div>
          </div>
          <AddCommentForm addComment={addComment} postId={post_id} />
          <Comments
            postId={post_id}
            comments={post.comments}
            deleteComment={deleteComment}
            auth={auth}
          />
        </>
      )}
    </>
  );
};

Post.propTypes = {
  getPost: PropTypes.func.isRequired,
  addComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  post: state.post,
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { getPost, addComment, deleteComment }
)(Post);
