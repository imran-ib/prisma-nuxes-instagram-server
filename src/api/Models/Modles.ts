import { objectType } from "@nexus/schema";

export const User = objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.model.avatar();
    t.model.bio();
    t.model.email();
    t.model.firstName();
    t.model.lastName();
    t.model.fullName();
    t.model.username();
    t.model.followedBy();
    t.model.following();
    t.model.likes({
      type: "Like",
    });
    t.model.rooms({
      type: "Room",
    });
    t.model.posts({
      type: "Post",
      filtering: true,
      ordering: true,
      pagination: false,
    });
    t.model.postCount();
    t.model.likeCount();
    t.model.CommentCount();

    t.model.createdAt();
    t.model.updatedAt();
  },
});

export const Post = objectType({
  name: "Post",
  definition(t) {
    t.model.id();
    t.model.caption();
    t.model.location();
    t.model.author({
      type: "User",
    });
    t.model.authorId();
    t.model.comments({
      type: "Comment",
    });
    t.model.likes({
      type: "Like",
    });

    t.model.files({
      type: "File",
    });
    t.model.createdAt();
    t.model.updatedAt();
  },
});
export const Feeds = objectType({
  name: "Feeds",
  definition(t) {
    t.model("Post").id();
    t.model("Post").caption();
    t.model("Post").location();
    t.model("Post").author({
      type: "User",
    });
    t.model("Post").authorId();
    t.model("Post").comments({
      type: "Comment",
      ordering: { createdAt: true },
    });
    t.model("Post").likes({
      type: "Like",
    });

    t.model("Post").files({
      type: "File",
    });

    t.model("Post").createdAt();
    t.model("Post").updatedAt();
  },
});

export const Like = objectType({
  name: "Like",
  definition(t) {
    t.model.id();
    t.model.post({
      type: "Post",
    });
    t.model.postId();
    t.model.user({
      type: "User",
    });

    t.model.userId();
    t.model.createdAt();
    t.model.updatedAt();
  },
});
export const Comment = objectType({
  name: "Comment",
  definition(t) {
    t.model.id();
    t.model.text();
    t.model.author({
      type: "User",
    });
    t.model.authorId();
    t.model.post({
      type: "Post",
    });
    t.model.postId();
    t.model.createdAt();
    t.model.updatedAt();
  },
});
export const File = objectType({
  name: "File",
  definition(t) {
    t.model.id();
    t.model.file();
    t.model.post({
      type: "Post",
    });
    t.model.postId();
    t.model.createdAt();
    t.model.updatedAt();
  },
});
export const Room = objectType({
  name: "Room",
  definition(t) {
    t.model.id();
    t.model.messeges();
    t.model.participants();
    t.model.createdAt();
    t.model.updatedAt();
  },
});
export const Message = objectType({
  name: "Message",
  definition(t) {
    t.model.id();
    t.model.text();
    t.model.receiver();
    t.model.sender();
    t.model.senderId();
    t.model.receiverId();
    t.model.room();
    t.model.RoomId();
    t.model.createdAt();
    t.model.updatedAt();
  },
});
