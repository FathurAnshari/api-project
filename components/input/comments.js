import { useContext, useEffect, useState } from "react";

import CommentList from "./comment-list";
import NewComment from "./new-comment";
import classes from "./comments.module.css";
import NotificationContext from "../../store/notification-context";

function Comments(props) {
  const { eventId } = props;
  const notificationCtx = useContext(NotificationContext);

  const [showComments, setShowComments] = useState(false);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    if (showComments) {
      setIsFetchingComments(true);
      const fetcher = async () => {
        try {
          const response = await fetch("/api/comments/" + eventId);

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to fetch comments");
          }

          const data = await response.json();
          setComments(data.comments);
        } catch (error) {
          console.error(error);
          setError(error.message);
          // Tambahkan notifikasi atau penanganan kesalahan lainnya di sini
        } finally {
          setIsFetchingComments(false);
        }
      };
      fetcher();
    }
  }, [showComments]);

  function toggleCommentsHandler() {
    setShowComments((prevStatus) => !prevStatus);
    setError(null);
  }

  function addCommentHandler(commentData) {
    notificationCtx.showNotification({
      title: "Sending comment",
      message: "Your comment is currently  being stored into database",
      status: "pending",
    });

    // send data to API
    fetch("/api/comments/" + eventId, {
      method: "POST",
      body: JSON.stringify(commentData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return res.json().then((data) => {
          throw new Error(data.message || "Something went wrong");
        });
      })
      .then((data) => {
        notificationCtx.showNotification({
          title: "Success!",
          message: "Your comment was saved",
          status: "success",
        });
      })
      .catch((error) => {
        notificationCtx.showNotification({
          title: "Error",
          message: error.message || "Something went wrong",
          status: "error",
        });
      });
  }

  return (
    <section className={classes.comments}>
      <button onClick={toggleCommentsHandler}>
        {showComments ? "Hide" : "Show"} Comments
      </button>
      {showComments && <NewComment onAddComment={addCommentHandler} />}
      {isFetchingComments && <p>Loading comments....</p>}
      {error && <p>{error}</p>}
      {!isFetchingComments && showComments && <CommentList items={comments} />}
    </section>
  );
}

export default Comments;
