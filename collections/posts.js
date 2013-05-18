Posts = new Meteor.Collection('posts');

//make sure they are owner of post
Posts.allow({
  update:ownsDocument,
  remove:ownsDocument
});
//specify so they can only edit certain fields. 
Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following three fields:
    //use length to test to see if it found any fields not matching these. 
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});
Meteor.methods({
  //server side method that new post submit calls. 
  post: function(postAttributes) {
    var user = Meteor.user(),
      //checking to see if the same url has been submitted previously. 
      postWithSameLink = Posts.findOne({url: postAttributes.url});

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to post new stories");

    // ensure the post has a title
    if (!postAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a headline');

    // check that there are no previous posts with the same link
    if (postAttributes.url && postWithSameLink) {
      throw new Meteor.Error(302,
        'This link has already been posted',
        postWithSameLink._id);
    }

    // pick out the whitelisted keys
    var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime()
    });

    var postId = Posts.insert(post);

    return postId;
  }
});

// Posts.allow({
//   insert: function(userId, doc) {
//     //only allow posting if you are logged in
//     return !! userId;
//   }
// });