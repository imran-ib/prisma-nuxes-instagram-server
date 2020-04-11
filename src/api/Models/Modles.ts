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
    t.model.followedBy();
    t.model.following();
    t.model.likes(), t.model.rooms();
    t.model.posts({
      pagination: false
    });
  }
});

export const Post = objectType({
  name: "Post",
  definition(t) {
    t.model.id();
    t.model.caption();
    t.model.location();
    t.model.author();
    t.model.authorId();
    t.model.files;
  }
});

export const Like = objectType({
  name: "Like",
  definition(t) {
    t.model.id();
    t.model.post();
    t.model.postId();
    t.model.user();
    t.model.userId();
  }
});
export const Comment = objectType({
  name: "Comment",
  definition(t) {
    t.model.id();
    t.model.text();
    t.model.author();
    t.model.authorId();
    t.model.post();
    t.model.postId();
  }
});
export const File = objectType({
  name: "File",
  definition(t) {
    t.model.id();
    t.model.file();
    t.model.post();
    t.model.postId();
  }
});
export const Room = objectType({
  name: "Room",
  definition(t) {
    t.model.id();
    t.model.messeges();
    t.model.participants();
  }
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
  }
});
